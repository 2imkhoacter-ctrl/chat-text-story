"""Reuse both V4G detectors on newly generated initial cuts; no old corrections."""
from pathlib import Path
import importlib.util,io,json,subprocess,sys,wave
import numpy as np

ROOT=Path(__file__).resolve().parents[1]
context=json.loads(Path(sys.argv[1]).read_text('utf8'))
spec=importlib.util.spec_from_file_location('edge',ROOT/'scripts/auto-edge-repair-v4g.py')
edge=importlib.util.module_from_spec(spec);spec.loader.exec_module(edge)
assert edge.CFG['edgeWindowMs']==350,'Use the original V4G detector configuration'
R=edge.RATE
source_dir=Path(context['work'])/'public/fresh-cut'
aligned=json.loads((source_dir/'alignment-manifest.json').read_text('utf8'))
assert aligned['status']=='VALIDATED' and aligned['flagged']==0
# Alignment metadata only: no legacy per-clip extraction or WAVs are needed.
base={'timelineModel':'voice-hold-gap-v1','validationStatus':'VALIDATED',
      'expectedPhraseCount':context['phraseCount'],'sourceAudio':context['settings']['audio'],
      'sourceDurationSeconds':aligned['inputDurationSeconds'],'initialMarginSeconds':.05,
      'runtime':aligned['runtime'],'phrases':[{**p,'label':p['text'],'audioFile':p['audio'],'pauseAfter':0} for p in aligned['phrases']]}
phrases=base['phrases'];n=len(phrases)
assert n==context['phraseCount']
assert not base.get('manualBoundaryOverrides')
dest_a=ROOT/'public/freshcut-original'/context['runId']
dest_b=ROOT/'public/freshcut-autorepaired'/context['runId']
dest_a.mkdir(parents=True,exist_ok=True);dest_b.mkdir(parents=True,exist_ok=True)
tool=subprocess.check_output(['node','-e',"process.stdout.write(require('@remotion/compositor-win32-x64-msvc').dir)"],cwd=ROOT,text=True).strip()
master_blob=subprocess.run([str(Path(tool)/'ffmpeg.exe'),'-hide_banner','-loglevel','error','-i',str(ROOT/context['settings']['audio']),'-ar',str(R),'-ac','2','-c:a','pcm_s16le','-f','wav','pipe:1'],capture_output=True,check=True).stdout
master=edge.read_wav(master_blob)
# Reproduce the existing extended-range stage, then V4C's zero-nudge midpoint
# construction. Inputs are the fresh resolved records, never production cuts.
assert aligned['status']=='VALIDATED' and len(aligned['phrases'])==n
duration=base['sourceDurationSeconds']
extended=[]
for i,p in enumerate(aligned['phrases']):
    assert p['id']==phrases[i]['id'] and p['text']==phrases[i]['text']
    left=(aligned['phrases'][i-1]['end']+p['start'])/2 if i else 0
    right=(p['end']+aligned['phrases'][i+1]['start'])/2 if i+1<n else duration
    extended.append({'start':round(max(0,left,p['start']-.07),6),'end':round(min(duration,right,p['end']+.07),6)})
boundaries=[extended[0]['start']]+[(extended[i]['end']+extended[i+1]['start'])/2 for i in range(n-1)]+[extended[-1]['end']]
# Match JavaScript Math.round used by V4C, including positive half-samples.
cuts=[int(np.floor(t*R+.5)) for t in boundaries]
starts=cuts[:-1];ends=cuts[1:]
assert all(a<b for a,b in zip(starts,ends)) and ends[-1]<=len(master)
pcm_a=[master[a:b] for a,b in zip(starts,ends)]
blobs=[edge.encode_wav(p) for p in pcm_a]
phrases=[{**p,'sourceStart':starts[i]/R,'sourceEnd':ends[i]/R,'sourceStartSample':starts[i],
          'sourceEndSample':ends[i],'clipDuration':len(pcm_a[i])/R} for i,p in enumerate(phrases)]
base={**base,'phrases':phrases,'sourcePartition':'v4c-style-zero-nudge-shared-sample-boundaries',
      'freshExtraction':{'extendedRangeHandlesSeconds':.07,'midpointSharedCuts':True,'masterDecodeCount':1,'manualNudgesApplied':False}}
decode_differences=[]
scans=[edge.inspect_phrase(pcm_a[i],starts[i]) for i in range(n)]

def inspect_boundary(i,scans,ss,ee):
    assert all(ee[k-1]==ss[k] for k in range(1,len(ss)))
    return edge.boundary_candidates(i,scans,[ss[0]]+ee)

rows=[];approved={}
for i in range(1,n):
    cs=inspect_boundary(i,scans,starts,ends)
    row={'boundaryId':f'boundary_{i:03d}','index':i,'initialPreviousEnd':ends[i-1]/R,'initialNextStart':starts[i]/R,
         'candidates':cs,'status':'UNCHANGED_NO_FRAGMENT'}
    if len(cs)>1:row['status']='UNCERTAIN_CONFLICT'
    elif cs and not cs[0]['reasons']:approved[i]=cs[0]['proposedCutSample'];row['status']='PROVISIONAL'
    elif cs:row['status']='UNCERTAIN'
    rows.append(row)
while True:
    ss=[approved.get(i,s) for i,s in enumerate(starts)]
    ee=[approved.get(i+1,e) for i,e in enumerate(ends)]
    reject={}
    for k in range(n):
        if ss[k]>=ee[k]:
            for j in (k,k+1):
                if j in approved:reject[j]='GLOBAL_ORDER_CONFLICT'
    if reject:
        for i,reason in reject.items():approved.pop(i);rows[i-1].update(status='UNCERTAIN',rejectionReason=reason)
        continue
    pcms=[master[ss[i]:ee[i]] if i in approved or i+1 in approved else pcm_a[i] for i in range(n)]
    post=[edge.inspect_phrase(pcms[i],ss[i]) for i in range(n)]
    for i,cut in approved.items():
        c=rows[i-1]['candidates'][0]
        remain=inspect_boundary(i,post,ss,ee)
        if remain:reject[i]='POST_REPAIR_FRAGMENT_REMAINS'
        fa=round(c['fragmentSourceStart']*R);fb=round(c['fragmentSourceEnd']*R)
        if c['type']=='HEAD' and not ss[i-1]<=fa<fb<=cut:reject[i]='INCOMPLETE_HEAD_TRANSFER'
        if c['type']=='TAIL' and not cut<=fa<fb<=ee[i]:reject[i]='INCOMPLETE_TAIL_TRANSFER'
        margin=round(edge.CFG['minimumQuietCutMarginMs']*R/1000)
        rms=float(np.sqrt(np.mean((master[cut-margin:cut+margin].astype(np.float64)/32768)**2)))
        threshold=(scans[i]['HEAD'] if c['type']=='HEAD' else scans[i-1]['TAIL'])['offThresholdRms']
        if rms>threshold:reject[i]='PROPOSED_CUT_NOT_QUIET'
        rows[i-1]['postVerification']={'remainingCandidates':len(remain),'cutRms':rms,'quietThreshold':threshold}
    if not reject:break
    for i,reason in reject.items():approved.pop(i,None);rows[i-1].update(status='UNCERTAIN',rejectionReason=reason)

for i in range(1,n):assert ee[i-1]<=ss[i]
coverage_a=np.zeros(len(master),dtype=np.uint8);coverage_b=np.zeros(len(master),dtype=np.uint8)
pa=[];pb=[]
for i,p in enumerate(phrases):
    coverage_a[starts[i]:ends[i]]+=1;coverage_b[ss[i]:ee[i]]+=1
    (dest_a/p['audioFile']).write_bytes(blobs[i])
    changed=i in approved or i+1 in approved
    repaired=edge.encode_wav(master[ss[i]:ee[i]]) if changed else blobs[i]
    (dest_b/p['audioFile']).write_bytes(repaired)
    assert np.array_equal(edge.read_wav(repaired),master[ss[i]:ee[i]] if changed else pcm_a[i])
    common={**p,'audioRevision':edge.sha(blobs[i])[:16]}
    pa.append({**common,'relativeAudioFile':f"freshcut-original/{context['runId']}/{p['audioFile']}"})
    pb.append({**p,'initialSourceStart':p['sourceStart'],'initialSourceEnd':p['sourceEnd'],
        'sourceStart':ss[i]/R,'sourceEnd':ee[i]/R,'clipDuration':len(edge.read_wav(repaired))/R,
        'relativeAudioFile':f"freshcut-autorepaired/{context['runId']}/{p['audioFile']}",
        'audioRevision':edge.sha(repaired)[:16],'autoEdgeRepairChanged':changed})
assert coverage_a.max()<=1 and coverage_b.max()<=1
lost=int(np.count_nonzero((coverage_a>0)&(coverage_b==0)))
duplicated=int(np.count_nonzero(coverage_b>1))
assert lost==duplicated==0
assert np.array_equal(np.concatenate(pcm_a),master[starts[0]:ends[-1]])
assert np.array_equal(np.concatenate([edge.read_wav((dest_b/p['audioFile']).read_bytes()) for p in phrases]),master[ss[0]:ee[-1]])
for row in rows:
    i=row['index']
    if i in approved:
        row.update(status='REPAIRED',type=row['candidates'][0]['type'],finalBoundary=approved[i]/R,
            deltaMs=(approved[i]-(ends[i-1]+starts[i])/2)*1000/R,
            previousEndDeltaMs=(approved[i]-ends[i-1])*1000/R,nextStartDeltaMs=(approved[i]-starts[i])*1000/R)
        row['postVerification']['passed']=True
for dest,ps,version in [(dest_a,pa,'FreshCut-Original'),(dest_b,pb,'FreshCut-AutoRepaired')]:
    (dest/'timing-manifest.json').write_text(json.dumps({**base,'phrases':ps,'freshRunId':context['runId'],'version':version,
        'sourceAudio':context['settings']['audio'],'manualCorrectionsUsed':False},ensure_ascii=False,indent=2)+'\n','utf8')
summary={'initialPhrases':n,'boundariesExamined':n-1,'headAnomalies':sum(any(c['type']=='HEAD' for c in r['candidates']) for r in rows),
    'tailAnomalies':sum(any(c['type']=='TAIL' for c in r['candidates']) for r in rows),'repaired':len(approved),'unchanged':n-1-len(approved),
    'manualReview':sum(r['status'].startswith('UNCERTAIN') for r in rows),'samplesLostByRepair':lost,'samplesDuplicatedByRepair':duplicated,
    'initialOmittedMasterSamples':int(np.count_nonzero(coverage_a==0)),'addedPreviouslyUncutSourceSamples':int(np.count_nonzero((coverage_a==0)&(coverage_b>0))),
    'initialInterPhraseSourceGaps':sum(ends[i]<starts[i+1] for i in range(n-1)),'sampleRate':R,
    'allInitialHeadsAndTailsScanned':True,'edgeWindowMs':edge.CFG['edgeWindowMs'],
    'independentMp3DecodeDiffersFromContinuousDecode':0,'masterDecodeCount':1,'manualNudgesApplied':0,
    'concatenatedPcmMatchesMasterExactly':True,'sharedBoundaryConstruction':'extended ranges -> midpoints -> Math.round sample offsets'}
result={'summary':summary,'boundaries':rows,'parameters':edge.CFG,'outputA':str(dest_a),'outputB':str(dest_b),'extendedRanges':extended,'zeroNudgeCutsSamples':cuts}
(Path(context['runDir'])/'edge-repair-diagnostics.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n','utf8')
print(json.dumps(summary,indent=2))
