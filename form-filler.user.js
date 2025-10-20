// ==UserScript==
// @name         Brainly Trust & Safety Auto Filler PLUS4 (Dynamic Policy + Warning=Yes + Other)
// @namespace    http://tampermonkey.net/
// @version      1.8
// @description  Panelden gelen policy ve diğer bilgileri otomatik doldurur, uzaktan kapatma destekli sürüm.
// @match        https://brainly-trustandsafety.zendesk.com/hc/*/requests/new*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(async () => {
  const conf = await fetch("https://raw.githubusercontent.com/Galaxynovas09/brainly-automation-suite/main/config.json").then(r => r.json());
  if (!conf.enabled) {
    console.log("⛔ Form filler disabled remotely");
    return;
  }

  (function(){
      'use strict';

      const fixedEmail = "glaxyserver@gmail.com";

      function getParam(name){
          const u = new URL(location.href);
          return u.searchParams.get(name);
      }

      const bm_user   = getParam('bm_user');
      const bm_action = getParam('bm_action') || 'action_taken_moderators_banned_the_user';
      const bm_market = getParam('bm_market') || 'turkey_clone';
      const bm_policy = getParam('bm_policy') || 'benzerlik_spami';

      const userProfile = bm_user ? decodeURIComponent(bm_user) : '';
      const actionTaken = decodeURIComponent(bm_action);
      const market      = decodeURIComponent(bm_market);
      const policyKey   = decodeURIComponent(bm_policy);

      const policyMap = {
          spam: "policy_violation_spam",
          ticari_spam: "policy_violation_commercial_spam",
          kufur: "policy_violation_profanity",
          benzerlik_spami: "policy_violation_similarity_spam",
          zorbalik: "policy_violation_bullying",
          taciz: "policy_violation_harassment",
          terorist_icerik: "policy_violation_terrorism",
          intihal: "policy_violation_plagiarism",
          nefret_soylemi: "policy_violation_hate_speech",
          mustehcenlik: "policy_violation_obscenity",
          kisisel_bilgi: "policy_violation_pii",
          meet_baglantilari: "policy_violation_meet_links",
          other: "policy_violation_other"
      };

      const selectedPolicy = policyMap[policyKey] || "policy_violation_similarity_spam";

      const fill = () => {
          try {
              const form = document.querySelector("#new_request");
              if(!form) return false;

              const emailField = document.querySelector("#request_anonymous_requester_email");
              if(emailField) emailField.value = fixedEmail;

              const marketField = document.querySelector("#request_custom_fields_10024838758290");
              if(marketField) marketField.value = market;

              const modEmailField = document.querySelector("#request_custom_fields_9719571760786");
              if(modEmailField) modEmailField.value = fixedEmail;

              const profileField = document.querySelector("#request_custom_fields_5746316806162");
              if(profileField) profileField.value = userProfile;

              const policyField = document.querySelector("#request_custom_fields_10025038149010");
              if(policyField) {
                  policyField.value = selectedPolicy;
                  policyField.dispatchEvent(new Event('change', { bubbles: true }));
              }

              const actionField = document.querySelector("#request_custom_fields_9720010919570");
              if(actionField) {
                  actionField.value = actionTaken;
                  actionField.dispatchEvent(new Event('change', { bubbles: true }));
              }

              const warningField = document.querySelector("#request_custom_fields_10024876212882");
              if(warningField){
                  warningField.value = "warning_given_yes";
                  warningField.dispatchEvent(new Event('change', { bubbles: true }));
                  const aTag = warningField.parentElement.querySelector('a.nesty-input');
                  if(aTag) aTag.textContent = "Yes";
              }

              form.submit();
              history.replaceState(null, '', location.origin + location.pathname);
              console.log("✅ Form dolduruldu ve gönderildi. Policy:", selectedPolicy);

              return true;
          } catch(e){
              console.error("Fill error:", e);
              return false;
          }
      };

      const interval = setInterval(() => {
          if(fill()) clearInterval(interval);
      }, 800);

      setTimeout(() => clearInterval(interval), 10000);
  })();
})();
