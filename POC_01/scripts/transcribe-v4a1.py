"""Cached local Whisper word timestamps. Never downloads a model."""
import hashlib
import json
import os
from pathlib import Path
import time
import io
import subprocess
import wave

ROOT = Path(__file__).resolve().parent.parent

def main():
    config = json.loads((ROOT / 'video.v4a1.config.json').read_text(encoding='utf-8'))
    phrases = [s for s in (ROOT / config['script']).read_text(encoding='utf-8').splitlines() if s.strip()]
    if len(phrases) != config['expectedPhraseCount']:
        raise RuntimeError(f"STOP: expected {config['expectedPhraseCount']} script phrases, found {len(phrases)}")
    source = ROOT / config['audio']
    model_path = Path(config['model'])
    if not model_path.is_file():
        raise RuntimeError(f'Local model is missing; no download permitted: {model_path}')
    output = ROOT / config['generatedAudioDir']
    output.mkdir(parents=True, exist_ok=True)
    identity = {'sourceSha256': hashlib.sha256(source.read_bytes()).hexdigest(),
                'modelPath': str(model_path), 'modelSize': model_path.stat().st_size,
                'modelMtimeNs': model_path.stat().st_mtime_ns,
                'language': config['language'], 'wordTimestamps': True, 'temperature': 0, 'beamSize': 5,
                'modelPrecision': 'float16 with float32 layer norms', 'timingKernelFallback': 'cpu'}
    raw_file = output / 'whisper-raw.json'
    if raw_file.exists():
        saved = json.loads(raw_file.read_text(encoding='utf-8'))
        if saved['identity'] != identity:
            raise RuntimeError('Cached transcription belongs to different input/settings. Preserve it before starting a new run.')
        print('Using cached Whisper result; GPU transcription not repeated.', flush=True)
    else:
        # Whisper's audio loader invokes ffmpeg; use the existing bundled binary.
        os.environ['PATH'] = str(ROOT / 'node_modules/@remotion/compositor-win32-x64-msvc') + os.pathsep + os.environ['PATH']
        import torch
        import whisper
        import numpy as np
        if config['device'] != 'cuda' or not torch.cuda.is_available():
            raise RuntimeError('CUDA is required and is not available; refusing CPU fallback.')
        print(f'Script phrases: {len(phrases)}; loading local Large-v2 on {torch.cuda.get_device_name(0)}', flush=True)
        model = whisper.load_model(str(model_path), device='cuda').half()
        # Whisper's custom LayerNorm explicitly computes in float32.
        for module in model.modules():
            if isinstance(module, torch.nn.LayerNorm):
                module.float()
        torch.cuda.empty_cache()
        # The local Windows installation lacks Triton. Avoid its GPU sorting
        # fallback's memory spike; only median filtering / DTW run on CPU.
        import whisper.timing as timing
        median_filter = timing.median_filter
        timing.median_filter = lambda x, width: median_filter(x.cpu(), width).to(x.device)
        timing.dtw = lambda x: timing.dtw_cpu(x.double().cpu().numpy())
        actual_device = str(next(model.parameters()).device)
        if not actual_device.startswith('cuda'):
            raise RuntimeError(f'Model is on {actual_device}, not CUDA')
        started = time.perf_counter()
        decoded = subprocess.run([str(ROOT / 'node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe'),
            '-v', 'error', '-i', str(source), '-ar', '16000', '-ac', '1', '-c:a', 'pcm_s16le', '-f', 'wav', '-'],
            check=True, capture_output=True).stdout
        with wave.open(io.BytesIO(decoded), 'rb') as wav:
            samples = np.frombuffer(wav.readframes(wav.getnframes()), dtype=np.int16).astype(np.float32) / 32768.0
        result = model.transcribe(samples, language=config['language'], word_timestamps=True,
                                  fp16=True, temperature=0, beam_size=5, verbose=False)
        torch.cuda.synchronize()
        saved = {'identity': identity, 'runtime': {
            'model': 'large-v2', 'device': actual_device, 'gpu': torch.cuda.get_device_name(0),
            'torch': torch.__version__, 'cudaAvailable': torch.cuda.is_available(),
            'cudaVersion': torch.version.cuda, 'modelDtype': str(next(model.parameters()).dtype),
            'peakAllocatedBytes': torch.cuda.max_memory_allocated(),
            'timingKernelFallback': 'CPU median filtering / DTW; model inference CUDA',
            'transcriptionSeconds': time.perf_counter() - started,
        }, 'result': result}
        raw_file.write_text(json.dumps(saved, ensure_ascii=False, indent=2), encoding='utf-8')
    words = []
    for segment in saved['result']['segments']:
        for word in segment.get('words', []):
            if word['word'].strip():
                words.append({**word, 'index': len(words), 'segmentId': segment['id']})
    (output / 'whisper-words.json').write_text(json.dumps({'identity': identity, 'runtime': saved['runtime'], 'words': words}, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({'words': len(words), 'runtime': saved['runtime']}, ensure_ascii=False), flush=True)

if __name__ == '__main__':
    main()
