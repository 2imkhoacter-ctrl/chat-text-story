import copy
import importlib.util
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location('resolver', Path(__file__).with_name('resolve-v4a2.py'))
resolver = importlib.util.module_from_spec(spec)
spec.loader.exec_module(resolver)

class ResolutionTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.config = json.loads((ROOT / 'video.v4a2.config.json').read_text(encoding='utf-8'))
        cls.baseline = json.loads((ROOT / cls.config['baselineAlignment']).read_text(encoding='utf-8'))
        payload = json.loads((ROOT / cls.config['cachedWords']).read_text(encoding='utf-8'))
        cls.script = [s for s in (ROOT / cls.config['script']).read_text(encoding='utf-8').splitlines() if s.strip()]
        cls.resolved, cls.blocks = resolver.resolve(cls.config, cls.baseline, payload, cls.script)

    def test_real_result_and_frozen_anchors(self):
        self.assertEqual(len(self.resolved), 97)
        self.assertEqual(sum(p['status'] == 'SAFE' for p in self.resolved), 61)
        self.assertEqual(sum(p['status'] == 'AUTO-RESOLVED' for p in self.resolved), 36)
        self.assertEqual(resolver.validate(self.resolved, self.baseline, self.script), [])

    def test_ambiguous_repeated_words_have_no_unique_partition(self):
        words = [{'word': ' anh', 'start': i, 'end': i + 0.5} for i in range(3)]
        answer = resolver.partition(['anh', 'anh'], words, [])
        self.assertEqual(answer[1], 0)

    def test_overlap_and_changed_anchor_are_rejected(self):
        result = copy.deepcopy(self.resolved)
        result[1]['start'] = result[0]['end'] - 0.01
        self.assertTrue(any('overlap' in e for e in resolver.validate(result, self.baseline, self.script)))
        result = copy.deepcopy(self.resolved)
        result[0]['end'] += 0.001
        self.assertTrue(any('anchor changed' in e for e in resolver.validate(result, self.baseline, self.script)))

    def test_out_of_sequence_words_are_rejected(self):
        result = copy.deepcopy(self.resolved)
        result[1]['whisperWordIndices'][0] = result[0]['whisperWordIndices'][-1]
        self.assertTrue(any('out of order' in e for e in resolver.validate(result, self.baseline, self.script)))

    def test_zero_heads_capture_exclusive_interval_without_crossing_anchors(self):
        for p in self.resolved:
            if p.get('zeroHeadRecovered'):
                self.assertGreaterEqual(p['start'], p['anchorWindow'][0])
                self.assertGreater(p['end'], p['start'])
                self.assertLessEqual(p['zeroHeadRecoveryInterval'][1] - p['zeroHeadRecoveryInterval'][0], self.config['maximumZeroHeadRecoverySeconds'])

if __name__ == '__main__':
    unittest.main()
