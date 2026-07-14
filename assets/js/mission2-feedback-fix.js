(function(){
  "use strict";
  document.addEventListener("DOMContentLoaded", function(){
    setTimeout(function(){
      const id = new URLSearchParams(location.search).get("id");
      if (document.body.dataset.page !== "mission" || id !== "V1-M02") return;
      const panel = document.getElementById("later-mission-panel");
      const feedback = document.getElementById("feedback-card");
      if (!panel || !feedback) return;
      panel.appendChild(feedback);
    }, 0);
  });
})();
