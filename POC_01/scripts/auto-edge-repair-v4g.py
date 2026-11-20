"""Both HEAD and TAIL morphology detectors; V4C-only baseline; isolated V4G output."""
from pathlib import Path
import hashlib
import io
import json
import shutil
import subprocess
import wave
import numpy as np

ROOT=Path(__file__).resolve().parents[1]
CFG=json.loads((ROOT/'data/v4g-edge-repair.config.json').read_text('utf8'))
RATE=44100
OUTPUT=ROOT/'public/generated-audio-v4g'


def sha(data):
    return hashlib.sha256(data).hexdigest()


def read_wav(payload):
    with wave.open(io.BytesIO(payload),'rb') as f:
        assert f.getframerate()==RATE and f.getsampwidth()==2
        channels=f.getnchannels()
        pcm=f.readframes(f.getnframes())
    return np.frombuffer(pcm,dtype='<i2').reshape(-1,channels).copy()


def encode_wav(pcm):
    out=io.BytesIO()
    with wave.open(out,'wb') as f:
        f.setnchannels(pcm.shape[1]);f.setsampwidth(2);f.setframerate(RATE);f.writeframes(pcm.astype('<i2').tobytes())
    return out.getvalue()


def master_pcm():
    tool=subprocess.check_output(['node','-e',"process.stdout.write(require('@remotion/compositor-win32-x64-msvc').dir)"],cwd=ROOT,text=True).strip()
    r=subprocess.run([str(Path(tool)/'ffmpeg.exe'),'-hide_banner','-loglevel','error','-i',str(ROOT/'public/full_tts.mp3.MP3'),'-map','0:a:0','-ar',str(RATE),'-ac','2','-c:a','pcm_s16le','-f','wav','pipe:1'],capture_output=True,check=True)
    return read_wav(r.stdout)


def edge_envelope(pcm,head):
    limit=min(len(pcm),round(CFG['edgeWindowMs']*RATE/1000))
    offset=0 if head else len(pcm)-limit
    samples=pcm[offset:offset+limit].astype(np.float64)/32768
    hop=round(CFG['hopMs']*RATE/1000)
    half=round(CFG['rmsWindowMs']*RATE/2000)
    centers=list(range(0,len(samples),hop))
    rms=np.array([np.sqrt(np.mean(samples[max(0,c-half):min(len(samples),c+half)]**2)) for c in centers])
    peak=float(rms.max()) if len(rms) else 0
    measured_floor=float(np.percentile(rms,CFG['noisePercentile'])) if len(rms) else 0
    # A speech-only edge has no observable quiet floor. Prevent its percentile
    # from setting the onset threshold above every observed speech sample.
    floor=min(measured_floor,peak*10**(-CFG['minimumPeakToNoiseFloorDb']/20))
    on=max(10**(CFG['absoluteOnFloorDbfs']/20),floor*10**(CFG['noiseMarginDb']/20),peak*10**(CFG['peakRelativeThresholdDb']/20))
    off=on*CFG['hysteresisOffRatio']
    clusters=[];start=None
    for i,value in enumerate(rms):
        if start is None and value>=on:start=i
        if start is not None and (value<off or i==len(rms)-1):
            end=i if value<off else i+1
            a=offset+centers[start]
            b=min(len(pcm),offset+(centers[end] if end<len(centers) else limit))
            if b>a:clusters.append({'startSample':a,'endSample':b,'peakRms':float(rms[start:max(start+1,end)].max())})
            start=None
    merged=[]
    for cluster in clusters:
        if merged and (cluster['startSample']-merged[-1]['endSample'])*1000/RATE<CFG['mergeGapMs']:
            merged[-1]['endSample']=cluster['endSample'];merged[-1]['peakRms']=max(merged[-1]['peakRms'],cluster['peakRms'])
        else:merged.append(dict(cluster))
    for cluster in merged:cluster['durationMs']=(cluster['endSample']-cluster['startSample'])*1000/RATE
    return {'edge':'HEAD' if head else 'TAIL','offsetSample':offset,'analyzedSamples':limit,'onThresholdRms':on,'offThresholdRms':off,'noiseFloorRms':floor,'measuredFloorRms':measured_floor,'edgePeakRms':peak,'clusters':merged}


def candidate(pcm,edge,base_start):
    clusters=edge['clusters'];head=edge['edge']=='HEAD'
    if len(clusters)<2:return None
    fragment=clusters[0] if head else clusters[-1]
    main=clusters[1:] if head else clusters[:-1]
    duration=fragment['durationMs']
    if not CFG['minimumFragmentMs']<=duration<=CFG['maximumFragmentMs']:return None
    a,b=(fragment['endSample'],main[0]['startSample']) if head else (main[-1]['endSample'],fragment['startSample'])
    silence=(b-a)*1000/RATE
    distance=(fragment['startSample'] if head else len(pcm)-fragment['endSample'])*1000/RATE
    if silence<CFG['minimumIsolationSilenceMs'] or distance>CFG['maximumFragmentDistanceFromEdgeMs']:return None
    main_active=sum(c['durationMs'] for c in main)
    main_span=(main[-1]['endSample']-main[0]['startSample'])*1000/RATE
    reasons=[]
    if main_active<CFG['minimumMainActiveMs'] or main_span<CFG['minimumMainSpanMs']:reasons.append('INSUFFICIENT_MAIN_SPEECH_EVIDENCE')
    if silence<2*CFG['minimumQuietCutMarginMs']:reasons.append('QUIET_INTERVAL_TOO_NARROW')
    cut=base_start+round((a+b)/2)
    main_peak=max(c['peakRms'] for c in main)
    return {'type':'HEAD' if head else 'TAIL','fragment':dict(fragment),
        'fragmentSourceStart':(base_start+fragment['startSample'])/RATE,'fragmentSourceEnd':(base_start+fragment['endSample'])/RATE,
        'fragmentDurationMs':duration,'fragmentRelativePeak':fragment['peakRms']/max(main_peak,1e-12),
        'isolationSilenceMs':silence,'gapSourceStart':(base_start+a)/RATE,'gapSourceEnd':(base_start+b)/RATE,
        'mainActiveMs':main_active,'mainSpanMs':main_span,'distanceFromEdgeMs':distance,
        'silenceBeforeFragmentMs':silence if not head else distance,
        'silenceAfterFragmentMs':silence if head else distance,
        'proposedCutSample':cut,'reasons':reasons}


def inspect_phrase(pcm,base_start):
    head=edge_envelope(pcm,True);tail=edge_envelope(pcm,False)
    return {'HEAD':head,'TAIL':tail,'headCandidate':candidate(pcm,head,base_start),'tailCandidate':candidate(pcm,tail,base_start)}


def boundary_candidates(index,scans,cuts):
    previous,next_=scans[index-1],scans[index]
    cut=cuts[index];candidates=[]
    for kind,c in [('TAIL',previous['tailCandidate']),('HEAD',next_['headCandidate'])]:
        if c is None:continue
        c=dict(c);c['reasons']=list(c['reasons'])
        neighbor=next_['HEAD'] if kind=='TAIL' else previous['TAIL']
        clusters=neighbor['clusters']
        near=clusters[0] if kind=='TAIL' and clusters else clusters[-1] if clusters else None
        neighbor_length=cuts[index+1]-cuts[index] if kind=='TAIL' else cuts[index]-cuts[index-1]
        distance=(near['startSample'] if kind=='TAIL' else neighbor_length-near['endSample'])*1000/RATE if near else None
        if near is None or distance>CFG['neighborJoinToleranceMs'] or near['durationMs']<CFG['minimumNeighborMainClusterMs']:
            c['reasons'].append('NEIGHBOR_DOES_NOT_CORROBORATE_FRAGMENT_OWNERSHIP')
        delta=(c['proposedCutSample']-cut)*1000/RATE
        if (kind=='HEAD' and delta<=0) or (kind=='TAIL' and delta>=0):c['reasons'].append('WRONG_DIRECTION')
        if abs(delta)>CFG['maximumRepairShiftMs']:c['reasons'].append('SHIFT_EXCEEDS_CONFIGURED_LIMIT')
        if not cuts[index-1]<c['proposedCutSample']<cuts[index+1]:c['reasons'].append('NEIGHBOR_CROSSING')
        c.update({'deltaMs':delta,'neighborEdgeDistanceMs':distance,'neighborCluster':near,'confidence':'STRUCTURAL_HIGH' if not c['reasons'] else 'UNCERTAIN'})
        candidates.append(c)
    return candidates


def run():
    base_bytes=(ROOT/'public/generated-audio-v4c/timing-manifest.json').read_bytes()
    base=json.loads(base_bytes);phrases=base['phrases']
    assert len(phrases)==97
    assert base['manualBoundaryOverrides']==json.loads((ROOT/'data/audio-boundary-overrides.json').read_text('utf8'))
    for i in range(96):assert abs(phrases[i]['sourceEnd']-phrases[i+1]['sourceStart'])<1/RATE
    baseline_cuts=[round(phrases[0]['sourceStart']*RATE)]+[round(p['sourceEnd']*RATE) for p in phrases]
    payloads=[(ROOT/'public/generated-audio-v4c'/p['audioFile']).read_bytes() for p in phrases]
    input_pcm=[read_wav(p) for p in payloads]
    scans=[inspect_phrase(pcm,baseline_cuts[i]) for i,pcm in enumerate(input_pcm)]
    rows=[];approved={}
    for i in range(1,97):
        cs=boundary_candidates(i,scans,baseline_cuts)
        row={'boundaryId':f'boundary_{i:03d}','index':i,'v4cBoundary':baseline_cuts[i]/RATE,
             'savedV4cManualMs':base['manualBoundaryOverrides'].get(f'boundary_{i:03d}',0),
             'candidates':cs,'status':'UNCHANGED_NO_FRAGMENT','finalBoundary':baseline_cuts[i]/RATE,'appliedDeltaMs':0}
        if len(cs)>1:
            row['status']='UNCERTAIN_CONFLICTING_HEAD_TAIL'
        elif cs and not cs[0]['reasons']:
            approved[i]=cs[0]['proposedCutSample'];row['status']='PROVISIONAL_REPAIR';row['repairType']=cs[0]['type']
        elif cs:row['status']='UNCERTAIN'
        rows.append(row)
    master=master_pcm()
    assert baseline_cuts[-1]<=len(master)
    # Build all cuts together, then validate regenerated morphology. Rejected
    # proposals are removed; neighboring accepted corrections are never moved.
    while True:
        cuts=[approved.get(i,c) for i,c in enumerate(baseline_cuts)]
        reject={}
        for i in range(1,len(cuts)):
            if cuts[i]<=cuts[i-1]:
                for j in (i-1,i):
                    if j in approved:reject[j]='GLOBAL_ORDER_CONFLICT'
        pcms=[master[cuts[i]:cuts[i+1]] if i in approved or i+1 in approved else input_pcm[i] for i in range(97)]
        post=[inspect_phrase(pcm,cuts[i]) for i,pcm in enumerate(pcms)]
        for i,new_cut in approved.items():
            c=rows[i-1]['candidates'][0]
            remaining=boundary_candidates(i,post,cuts)
            if remaining:reject[i]='POST_REGENERATION_FRAGMENT_OR_CONFLICT_REMAINS'
            fa=round(c['fragmentSourceStart']*RATE);fb=round(c['fragmentSourceEnd']*RATE)
            if c['type']=='HEAD' and not cuts[i-1]<=fa<fb<=new_cut:reject[i]='FRAGMENT_NOT_FULLY_TRANSFERRED_TO_PREVIOUS'
            if c['type']=='TAIL' and not new_cut<=fa<fb<=cuts[i+1]:reject[i]='FRAGMENT_NOT_FULLY_TRANSFERRED_TO_NEXT'
            margin=round(CFG['minimumQuietCutMarginMs']*RATE/1000)
            window=master[max(0,new_cut-margin):new_cut+margin].astype(np.float64)/32768
            rms=float(np.sqrt(np.mean(window**2)))
            edge=scans[i]['HEAD'] if c['type']=='HEAD' else scans[i-1]['TAIL']
            if rms>edge['offThresholdRms']:reject[i]='PROPOSED_CUT_NOT_QUIET_ON_MASTER'
            rows[i-1]['postVerification']={'remainingCandidateCount':len(remaining),'masterCutRms':rms,'quietThresholdRms':edge['offThresholdRms']}
        if not reject:break
        for i,reason in reject.items():
            approved.pop(i,None);rows[i-1]['status']='UNCERTAIN_POST_CHECK';rows[i-1]['rejectionReason']=reason
    OUTPUT.mkdir(exist_ok=True,parents=True)
    new_phrases=[]
    for i,p in enumerate(phrases):
        changed=i in approved or i+1 in approved
        blob=encode_wav(master[cuts[i]:cuts[i+1]]) if changed else payloads[i]
        (OUTPUT/p['audioFile']).write_bytes(blob)
        output_pcm=read_wav(blob)
        assert np.array_equal(output_pcm,master[cuts[i]:cuts[i+1]])
        new_phrases.append({**p,'v4cBaseSourceStart':p['sourceStart'],'v4cBaseSourceEnd':p['sourceEnd'],
            'sourceStart':cuts[i]/RATE,'sourceEnd':cuts[i+1]/RATE,'sourceStartSample':cuts[i],'sourceEndSample':cuts[i+1],
            'clipDuration':len(output_pcm)/RATE,'relativeAudioFile':f"generated-audio-v4g/{p['audioFile']}",
            'audioRevision':sha(blob)[:16],'autoEdgeRepairChanged':changed})
    assert np.array_equal(np.concatenate([read_wav((OUTPUT/p['audioFile']).read_bytes()) for p in phrases]),master[cuts[0]:cuts[-1]])
    for row in rows:
        i=row['index']
        if i in approved:
            row.update({'status':'REPAIRED','finalBoundary':cuts[i]/RATE,'appliedDeltaMs':(cuts[i]-baseline_cuts[i])*1000/RATE,
                        'postVerification':{**row['postVerification'],'fragmentTransferred':True,'noSourceDeletionOrDuplication':True,'passed':True}})
        else:assert cuts[i]==baseline_cuts[i]
    manifest={**base,'alignmentVersion':'v4g-auto-head-tail-edge-repair','phrases':new_phrases,
              'v4cBaseManifestSha256':sha(base_bytes),'autoEdgeRepair':{'parameters':CFG,'boundaryRepairs':{r['boundaryId']:r['appliedDeltaMs'] for r in rows if r['status']=='REPAIRED'},'globalPadding':False}}
    (OUTPUT/'timing-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n','utf8')
    summary={'phrasesScanned':97,'headWindowsScanned':97,'tailWindowsScanned':97,'sharedBoundariesChecked':96,
        'headCandidates':sum(any(c['type']=='HEAD' for c in r['candidates']) for r in rows),
        'tailCandidates':sum(any(c['type']=='TAIL' for c in r['candidates']) for r in rows),
        'repaired':len(approved),'unchanged':96-len(approved),'uncertain':sum(r['status'].startswith('UNCERTAIN') for r in rows),
        'outputWavs':len(list(OUTPUT.glob('voice_*.wav'))),'v4cPreserved':True,'concatenatedPcmMatchesMasterExactly':True}
    protected=json.loads((ROOT/'out/v4g-protected-hashes.json').read_text('utf8'))
    for f,digest in protected.items():assert sha((ROOT/f).read_bytes())==digest,f'Protected file modified: {f}'
    diagnostic={'summary':summary,'parameters':CFG,'baseline':'public/generated-audio-v4c/timing-manifest.json',
        'boundaries':rows,'phraseEdgeScans':[{'phrase':i+1,**scan} for i,scan in enumerate(scans)],
        'limitations':['Energy morphology cannot establish semantic phoneme ownership. High confidence here means the configured structural pattern plus neighboring-main-speech corroboration, not calibrated acoustic certainty.',
                      'Uncertain, conflicting and post-check-failing proposals retain the exact V4C boundary.']}
    (ROOT/'data/v4g-auto-edge-repair-diagnostics.json').write_text(json.dumps(diagnostic,ensure_ascii=False,indent=2)+'\n','utf8')
    (ROOT/'out/v4g-auto-edge-repair-summary.json').write_text(json.dumps(summary,indent=2)+'\n','utf8')
    print(json.dumps(summary,indent=2))


if __name__=='__main__':run()
