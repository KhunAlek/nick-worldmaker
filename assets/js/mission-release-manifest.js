window.WORLDMAKER_RELEASE_MANIFEST={
  version:"2026-07-14",
  missions:Object.fromEntries(Array.from({length:13},(_,index)=>{
    const number=index+3;
    const id=`V1-M${String(number).padStart(2,"0")}`;
    return [id,{
      lesson_configured:true,
      evaluator_configured:true,
      submission_runtime:"registry-v1",
      release_tests:{
        incomplete_submission:false,
        technically_wrong:false,
        contradictory_evidence:false,
        suspicious_input:false,
        valid_submission:false,
        nonapproval_does_not_unlock:false,
        approval_unlocks_exact_next:false,
        cross_browser_progress:false,
        parent_view:false,
        beginner_readiness:false
      },
      release_state:number===3?"released":"unreleased"
    }];
  }))
};