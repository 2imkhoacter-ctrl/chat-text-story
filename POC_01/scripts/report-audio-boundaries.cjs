const summarize=manifest=>{
  const boundaries=manifest.boundaryCorrections;
  const deltas=boundaries.map(b=>b.automaticDeltaMs);
  const summary={boundaryCount:boundaries.length,movedEarlier:deltas.filter(d=>d<-.5).length,movedLater:deltas.filter(d=>d>.5).length,
    effectivelyUnchanged:deltas.filter(d=>Math.abs(d)<=.5).length,maximumNegativeCorrectionMs:Math.min(0,...deltas),maximumPositiveCorrectionMs:Math.max(0,...deltas),
    averageAbsoluteCorrectionMs:deltas.reduce((a,b)=>a+Math.abs(b),0)/deltas.length,flagged:boundaries.filter(b=>b.status==='NEEDS_MANUAL_REVIEW').length};
  const csv='Boundary ID,Original alignment boundary s,Auto-corrected base boundary s,Automatic delta ms,Final boundary s,Manual override ms,Status,Reasons\n'+boundaries.map(b=>[b.boundaryId,b.originalAlignmentBoundary.toFixed(9),b.autoCorrectedBaseBoundary.toFixed(9),b.automaticDeltaMs,b.finalBoundary.toFixed(9),b.manualOverrideMs,b.status,b.reasons.join(';')].join(',')).join('\n')+'\n';
  return {summary,boundaries,csv};
};
module.exports={summarize};
