(function(){
  "use strict";
  const isM8=()=>new URLSearchParams(location.search).get("id")==="V1-M08";
  if(!isM8())return;
  function installStyles(){
    if(document.getElementById("m8-beginner-styles"))return;
    const style=document.createElement("style");
    style.id="m8-beginner-styles";
    style.textContent=`
      .m8-code-group{display:grid;gap:12px;margin:18px 0}
      .m8-code-card{border:1px solid rgba(86,246,255,.22);border-radius:14px;background:rgba(9,11,29,.88);overflow:hidden}
      .m8-code-title{padding:10px 14px;font-weight:900;color:#9ff9ff;background:rgba(86,246,255,.07);border-bottom:1px solid rgba(255,255,255,.08)}
      .m8-code-card pre{margin:0;padding:14px 16px;white-space:pre-wrap;overflow-wrap:anywhere;color:#eef2ff;background:#080a18;font:500 .93rem/1.55 ui-monospace,SFMono-Regular,Menlo,monospace}
      .m8-code-explanation{margin:0;padding:12px 14px;color:#cfd5f5;line-height:1.55;border-top:1px solid rgba(255,255,255,.08)}
      .m8-stop{border-color:rgba(255,108,124,.38)!important;background:rgba(255,108,124,.09)!important}
      .m8-success{border:1px solid rgba(151,255,130,.32);background:rgba(151,255,130,.07);padding:16px;border-radius:14px;margin:14px 0}
      .m8-failure{border:1px solid rgba(255,214,107,.32);background:rgba(255,214,107,.07);padding:16px;border-radius:14px;margin:14px 0}
      .m8-submit-intro{padding:16px;border-radius:14px;border:1px solid rgba(86,246,255,.22);background:rgba(86,246,255,.06);line-height:1.6}
    `;
    document.head.appendChild(style);
  }
  function enhance(){
    const lesson=window.WORLDMAKER_LESSONS&&window.WORLDMAKER_LESSONS["V1-M08"];
    const panel=document.getElementById("later-mission-panel");
    if(!lesson||!panel||panel.dataset.m8Enhanced==="true"||!panel.querySelector("h1"))return false;
    if(panel.querySelector("h1").textContent.trim()!==lesson.title)return false;
    installStyles();
    const details=[...panel.querySelectorAll(".lesson-path .step-card")];
    details.forEach((card,index)=>{
      const source=lesson.steps[index];
      if(!source)return;
      const checkpoint=card.querySelector(".checkpoint");
      if(checkpoint&&/missing|buried|blocked|red WorldServer|must not|stop here|If either total changes/i.test(source.recovery+" "+source.checkpoint))checkpoint.classList.add("m8-stop");
      if(source.codeBlocks&&source.codeBlocks.length){
        const group=document.createElement("div");
        group.className="m8-code-group";
        source.codeBlocks.forEach(block=>{
          const wrap=document.createElement("div");
          wrap.className="m8-code-card";
          const title=document.createElement("div");
          title.className="m8-code-title";
          title.textContent=block.label;
          const pre=document.createElement("pre");
          const code=document.createElement("code");
          code.textContent=block.code;
          pre.appendChild(code);
          const explanation=document.createElement("p");
          explanation.className="m8-code-explanation";
          explanation.textContent=block.explanation;
          wrap.append(title,pre,explanation);
          group.appendChild(wrap);
        });
        const body=card.querySelector(".step-body");
        const firstCheckpoint=body&&body.querySelector(".checkpoint");
        if(body)body.insertBefore(group,firstCheckpoint||null);
      }
    });
    [...panel.querySelectorAll("section > h2")].forEach(heading=>{
      if(heading.textContent.trim()==="Proof tests")heading.textContent=lesson.proofHeading||"Show that your walking system works";
      if(heading.textContent.trim()==="Explorer target")heading.textContent="Check these exact Explorer locations";
    });
    const form=panel.querySelector("#registry-mission-form");
    if(form){
      const heading=form.querySelector("h2");
      if(heading)heading.textContent=lesson.submissionHeading||"Show what you built";
      if(lesson.submissionIntro&&heading){
        const intro=document.createElement("p");
        intro.className="m8-submit-intro";
        intro.textContent=lesson.submissionIntro;
        heading.insertAdjacentElement("afterend",intro);
      }
      const legend=form.querySelector("fieldset legend");
      if(legend)legend.textContent="Tick only the walking checks you completed with the final code";
      const button=form.querySelector("button[type=submit]");
      if(button)button.textContent="Send my M8 walking proof";
    }
    panel.querySelectorAll(".checkpoint").forEach(box=>{
      const text=box.textContent;
      if(/PATH SUCCESS|reaches WoodNode|reaches StoneNode/i.test(text))box.classList.add("m8-success");
      if(/PATH FAILED|MOVE FAILED|blocked-route/i.test(text))box.classList.add("m8-failure");
    });
    panel.dataset.m8Enhanced="true";
    return true;
  }
  const observer=new MutationObserver(()=>{if(enhance())observer.disconnect();});
  document.addEventListener("DOMContentLoaded",()=>{
    if(enhance())return;
    const target=document.getElementById("later-mission-panel")||document.body;
    observer.observe(target,{childList:true,subtree:true});
    setTimeout(()=>observer.disconnect(),15000);
  });
})();
