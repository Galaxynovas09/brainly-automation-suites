// ==UserScript==
// @name         Brainly Trust & Safety Auto Filler PLUS5 (Mobile Guaranteed Close)
// @namespace    http://tampermonkey.net/
// @version      3.9
// @description  Form doldurur, gönderir 
// @match        https://brainly-trustandsafety.zendesk.com/hc/*/requests/new*
// @match        https://brainly-trustandsafety.zendesk.com/hc/en-us*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(async () => {
  const confUrl = "https://raw.githubusercontent.com/Galaxynovas09/brainly-automation-suite/main/config.json";
  const conf = await fetch(confUrl, { cache: "no-store", mode: "cors" })
    .then(r => r.json())
    .catch(() => ({ enabled: true }));

  if (!conf.enabled) {
    console.log("⛔ Form filler disabled remotely");
    return;
  }
  
  if (window.location.href.includes("return_to=%2Fhc%2Frequests")) {
    console.log("✅ Form gönderildi, yönlendirme sayfası açıldı. Mobilde kapanma tetikleniyor...");

    setTimeout(() => {
      try {
   
        const btn = document.createElement('button');
        btn.innerText = "close";
        btn.style.cssText = "position:fixed;top:-100px;opacity:0;";
        btn.onclick = () => {
          console.log("🟢 Kapanma eylemi tetiklendi.");
          window.open('', '_self'); 
          window.close();
        };
        document.body.appendChild(btn);
        btn.click();
        btn.remove();

     
        setTimeout(() => {
          try {
            window.open('', '_self');
            window.close();
          } catch (e2) {}
        }, 1000);
      } catch (e) {
        console.error("❌ Mobil kapanma hatası:", e);
      }
    }, 800);
    return;
  }

  if (document.title.includes("Sign in") || document.querySelector("form[action*='sign_in']")) {
    console.log("⏸ Login page detected, script paused.");
    return;
  }

  (function () {
    'use strict';

    const fixedEmail = "glaxyserver@gmail.com";

    function getParam(name) {
      const u = new URL(location.href);
      return u.searchParams.get(name);
    }

    const bm_user = getParam('bm_user');
    const bm_action = getParam('bm_action') || 'action_taken_moderators_banned_the_user';
    const bm_market = getParam('bm_market') || 'turkey_clone';
    const bm_policy = getParam('bm_policy') || 'benzerlik_spami';

    const userProfile = bm_user ? decodeURIComponent(bm_user) : '';
    const actionTaken = decodeURIComponent(bm_action);
    const market = decodeURIComponent(bm_market);
    const policyKey = decodeURIComponent(bm_policy);

    const policyMap = {
      benzerlik_spami: "policy_violation_similarity_spam",
      spam: "policy_violation_spam",
      ticari_spam: "policy_violation_commercial_spam",
      kufur: "policy_violation_profanity",
      zorbalik: "policy_violation_bullying___harassment",
      pornografi: "policy_violation_pornography",
      mustehcenlik: "policy_violation_obscenity",
      nefret_soylemi: "policy_violation_hate_speech",
      kisisel_bilgi: "policy_violation_personal_identifiable_information",
      sahte_kimlik: "policy_violation_impersonation",
      cocuk_istismari: "policy_violation_child_abuse",
      kendine_zarar: "policy_violation_self-harm",
      terorist_icerik: "policy_violation_terrorist_content",
      siddet_tehdidi: "policy_violation_violent_threat",
      yanlis_bilgi: "policy_violation_misinformation___disinformation",
      phishing: "policy_violation_phishing_malware",
      intihal: "policy_violation_exam_cheating",
      siddet_gorsel: "policy_violation_graphic_violence",
      tehlikeli: "policy_violation_illicit_dangerous",
      other: "policy_violation_other"
    };

    const selectedPolicy = policyMap[policyKey] || "policy_violation_similarity_spam";

    const fill = () => {
      try {
        const form = document.querySelector("#new_request");
        if (!form) return false;

        const emailField = document.querySelector("#request_anonymous_requester_email");
        if (emailField) emailField.value = fixedEmail;

        const marketField = document.querySelector("#request_custom_fields_10024838758290");
        if (marketField) marketField.value = market;

        const modEmailField = document.querySelector("#request_custom_fields_9719571760786");
        if (modEmailField) modEmailField.value = fixedEmail;

        const profileField = document.querySelector("#request_custom_fields_5746316806162");
        if (profileField) profileField.value = userProfile;

        const policyField = document.querySelector("#request_custom_fields_10025038149010");
        if (policyField) {
          policyField.value = selectedPolicy;
          policyField.dispatchEvent(new Event('change', { bubbles: true }));
        }

        const actionField = document.querySelector("#request_custom_fields_9720010919570");
        if (actionField) {
          actionField.value = actionTaken;
          actionField.dispatchEvent(new Event('change', { bubbles: true }));
        }

        const warningField = document.querySelector("#request_custom_fields_10024876212882");
        if (warningField) {
          warningField.value = "warning_given_yes";
          warningField.dispatchEvent(new Event('change', { bubbles: true }));
          const aTag = warningField.parentElement.querySelector('a.nesty-input');
          if (aTag) aTag.textContent = "Yes";
        }

        form.submit();
        history.replaceState(null, '', location.origin + location.pathname);
        console.log("✅ Form dolduruldu ve gönderildi. Policy:", selectedPolicy);

        return true;
      } catch (e) {
        console.error("Fill error:", e);
        return false;
      }
    };

    const interval = setInterval(() => {
      if (fill()) clearInterval(interval);
    }, 800);

    setTimeout(() => clearInterval(interval), 10000);
  })();
})();
