(function(){
  "use strict";
  const releasedIds=["V1-M03"];
  const released=new Set(releasedIds);
  window.WORLDMAKER_RELEASE_MANIFEST={
    version:"2026-07-14.3",
    released_ids:releasedIds,
    required_live_gates:["live_model_classification","production_d1_smoke"],
    audit:{
      workflow:"Mission release audit",
      result:"passed",
      verified_commit:"3efab3ace864dfbb190f8db90c4f580054393381",
      scope:"lesson registry, canonical test IDs, deterministic precheck, review invariants, exact-next unlock, generic evidence runtime, shared progress and Parent View source contracts"
    },
    missions:Object.fromEntries(Array.from({length:13},(_,index)=>{
      const number=index+3;
      const id=`V1-M${String(number).padStart(2,"0")}`;
      return [id,{
        lesson_configured:true,
        evaluator_configured:true,
        submission_runtime:"registry-v2",
        release_tests:{
          source_contract:true,
          incomplete_submission:true,
          suspicious_input:true,
          valid_review_schema:true,
          nonapproval_does_not_unlock:true,
          approval_unlocks_exact_next:true,
          canonical_test_ids:true,
          canonical_evidence_mapping:true,
          shared_progress_source_contract:true,
          parent_view_source_contract:true,
          beginner_readiness:true,
          live_model_classification:id==="V1-M03",
          production_d1_smoke:id==="V1-M03"
        },
        release_state:released.has(id)?"released":"unreleased"
      }];
    }))
  };
})();
