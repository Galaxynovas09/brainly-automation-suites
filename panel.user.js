// ==UserScript==
// @name         Brainly Moderation Panel PLUS5 (Background Submit v4.1)
// @namespace    http://tampermonkey.net/
// @version      4.1
// @description  Moderasyon paneli
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @run-at       document-idle
// @updateURL    https://github.com/Galaxynovas09/brainly-automation-suites/raw/refs/heads/main/panel.user.js
// @downloadURL  https://github.com/Galaxynovas09/brainly-automation-suites/raw/refs/heads/main/panel.user.js
// ==/UserScript==

(function () {
  'use strict';

  const PREF_KEY = "bm_panel_prefs_v8";
  const saved = JSON.parse(localStorage.getItem(PREF_KEY) || "{}");
  let isDarkMode = saved.isDarkMode ?? window.matchMedia('(prefers-color-scheme: dark)').matches;
  let autoSync = saved.autoSync ?? true;
  let c = null;
  const getTheme = () => isDarkMode ? {
    bg: '#181818', fg: '#f1f1f1', border: '#3f51b5', accent: '#2196f3', header: '#1976d2',
    inputBg: '#202020', inputBorder: '#333', btnBg: '#2a2a2a', btnBorder: '#555'
  } : {
    bg: '#ffffff', fg: '#111', border: '#1976d2', accent: '#1976d2', header: '#1976d2',
    inputBg: '#fff', inputBorder: '#ccc', btnBg: '#f5f5f5', btnBorder: '#bbb'
  };
  c = getTheme();
  const savePrefs = () => localStorage.setItem(PREF_KEY, JSON.stringify({ isDarkMode, autoSync }));

  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  const toggleBtn = document.createElement('button');
  Object.assign(toggleBtn.style, {
    position: 'fixed', top: '10px', right: '10px', padding: '6px 10px',
    backgroundColor: c.accent, color: '#fff', border: 'none', borderRadius: '8px',
    cursor: 'pointer', zIndex: 2147483647, fontWeight: '700', fontSize: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
  });
  toggleBtn.textContent = "📝 Brainly";
  toggleBtn.title = "Moderasyon Paneli";
  document.body.appendChild(toggleBtn);

  const panel = document.createElement('div');
  Object.assign(panel.style, {
    position: 'fixed', top: '60px', right: '12px',
    width: '320px', height: '420px',
    background: c.bg, color: c.fg, border: `1.2px solid ${c.border}`,
    zIndex: 2147483646, fontFamily: 'Inter, Arial, sans-serif', fontSize: '13px',
    borderRadius: '10px', overflowY: 'auto', resize: 'both',
    boxSizing: 'border-box', paddingBottom: '10px',
    boxShadow: '0 6px 24px rgba(0,0,0,0.18)',
    display: 'none'
  });

  const header = document.createElement('div');
  header.textContent = "Brainly Moderation Panel (v4.1)";
  Object.assign(header.style, {
    background: c.header, color: '#fff', padding: '8px', cursor: 'move',
    fontWeight: '700', borderTopLeftRadius: '10px', borderTopRightRadius: '10px',
    textAlign: 'center', fontSize: '13px', userSelect: 'none'
  });
  panel.appendChild(header);

  const content = document.createElement('div');
  content.style.padding = "10px";
  content.innerHTML = `
    <input id="bm_user_link" type="text" placeholder="Kullanıcı linki (https://...)" />
    <label style="font-weight:600;margin-top:6px;display:block">Aksiyon</label>
    <select id="bm_action">
      <option value="action_taken_moderators_24_hour_suspension">Kullanıcı 24 saat yasaklandı</option>
      <option value="action_taken_moderators_72_hour_suspension">Kullanıcı 72 saat yasaklandı</option>
      <option value="action_taken_moderators_banned_the_user" selected>Kalıcı yasaklandı</option>
    </select>

    <label style="font-weight:600;margin-top:6px;display:block">İhlal Türü</label>
    <select id="bm_policy" size="6" style="height:130px;overflow:auto">
      <option value="benzerlik_spami" selected>Benzerlik Spamı</option>
      <option value="spam">Meet Spam</option>
      <option value="ticari_spam">Ticari Spam</option>
      <option value="kufur">Küfür</option>
      <option value="zorbalik">Zorbalık</option>
      <option value="pornografi">Pornografi</option>
      <option value="mustehcenlik">Müstehcenlik</option>
      <option value="nefret_soylemi">Nefret Söylemi</option>
      <option value="kisisel_bilgi">Kişisel Bilgi</option>
      <option value="sahte_kimlik">Sahte Kimlik</option>
      <option value="cocuk_istismari">Çocuk İstismarı</option>
      <option value="kendine_zarar">Kendine Zarar</option>
      <option value="terorist_icerik">Terörist İçerik</option>
      <option value="siddet_tehdidi">Şiddet Tehdidi</option>
      <option value="yanlis_bilgi">Yanlış Bilgi</option>
      <option value="phishing">E-dolandırıcılık</option>
      <option value="intihal">Kopya / Sınav</option>
      <option value="siddet_gorsel">Şiddet Görseli</option>
      <option value="tehlikeli">Tehlikeli İçerik</option>
      <option value="other">Diğer</option>
    </select>

    <label style="font-weight:600;margin-top:6px;display:block">Market</label>
    <select id="bm_market">
      <option value="turkey_clone" selected>Türkiye</option>
    </select>

    <button id="bm_send" style="margin-top:8px">Gönder (Arka Planda)</button>
    <div id="bm_status" style="margin-top:8px;font-family:monospace;font-size:12px;min-height:22px"></div>
    <hr style="margin:8px 0 8px 0;border-color:rgba(0,0,0,0.06)">
    <div style="display:flex;gap:8px">
      <button id="bm_toggleTheme" style="flex:1">🌓 Tema</button>
      <button id="bm_syncToggle" style="flex:1">🔁 Senkron: ${autoSync ? "Açık" : "Kapalı"}</button>
    </div>
    <div style="font-size:11px;color:gray;margin-top:8px">Not: Panel görünümü korunur. Otomatik süre algılama (profil linkinden) bozulmaz.</div>
  `;
  panel.appendChild(content);
  document.body.appendChild(panel);

  const style = document.createElement('style');
  style.textContent = `
    #bm_user_link,#bm_action,#bm_policy,#bm_market{
      width:100%;padding:8px;margin:6px 0;border-radius:8px;box-sizing:border-box;border:1px solid ${c.inputBorder};
      background:${c.inputBg}; color:${c.fg}; font-size:13px;
    }
    #bm_policy{font-size:12px}
    #bm_send,#bm_toggleTheme,#bm_syncToggle{
      width:100%;padding:9px;border-radius:8px;border:1px solid ${c.btnBorder}; background:${c.btnBg}; cursor:pointer; font-weight:700;
    }
    #bm_send{background:${c.accent}; color:#fff; border:none}
    #bm_send:active{transform:translateY(1px)}
    #bm_status{word-break:break-word}
    select,input,button{touch-action:manipulation}
  `;
  document.head.appendChild(style);

  function applyTheme() {
    c = getTheme();
    panel.style.background = c.bg;
    panel.style.color = c.fg;
    panel.style.border = `1.2px solid ${c.border}`;
    header.style.background = c.header;
    $$('#bm_user_link,#bm_action,#bm_policy,#bm_market').forEach(el => {
      el.style.background = c.inputBg;
      el.style.border = `1px solid ${c.inputBorder}`;
      el.style.color = c.fg;
    });
    ['bm_toggleTheme', 'bm_syncToggle'].forEach(id => {
      const b = $(`#${id}`);
      if (b) { b.style.background = c.btnBg; b.style.border = `1px solid ${c.btnBorder}`; b.style.color = c.fg; }
    });
    const send = $('#bm_send');
    if (send) { send.style.background = c.accent; send.style.color = '#fff'; send.style.border = 'none'; }
  }

  document.getElementById('bm_toggleTheme').addEventListener('click', () => {
    isDarkMode = !isDarkMode; applyTheme(); savePrefs();
  });
  document.getElementById('bm_syncToggle').addEventListener('click', () => {
    autoSync = !autoSync;
    document.getElementById('bm_syncToggle').textContent = `🔁 Senkron: ${autoSync ? "Açık" : "Kapalı"}`;
    savePrefs();
  });

  toggleBtn.addEventListener('click', () => {
    panel.style.display = (panel.style.display === 'none') ? 'block' : 'none';
  });

  let dragging = false, offsetX = 0, offsetY = 0;
  header.addEventListener('mousedown', e => { dragging = true; offsetX = e.clientX - panel.offsetLeft; offsetY = e.clientY - panel.offsetTop; });
  document.addEventListener('mousemove', e => { if (dragging) { panel.style.left = (e.clientX - offsetX) + 'px'; panel.style.top = (e.clientY - offsetY) + 'px'; } });
  document.addEventListener('mouseup', () => dragging = false);

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

  function sendBackground(data, callback) {
    try {
      const payload = {
        request: {
          requester: { email: "glaxyserver@gmail.com" },
          subject: data.subject || "Moderator Action",
          comment: { body: data.comment || "Auto-submitted by Moderation Panel" },
          custom_fields: [
            { id: 10024838758290, value: data.market },
            { id: 5746316806162,  value: data.profile },
            { id: 9719571760786,  value: "glaxyserver@gmail.com" },
            { id: 10025038149010, value: policyMap[data.policy] || policyMap['benzerlik_spami'] },
            { id: 9720010919570,  value: data.action },
            { id: 10024876212882, value: "warning_given_yes" }
          ]
        }
      };

      GM_xmlhttpRequest({
        method: "POST",
        url: "https://brainly-trustandsafety.zendesk.com/api/v2/requests.json",
        headers: { "Content-Type": "application/json" },
        data: JSON.stringify(payload),
        onload: res => {
          const ok = res.status >= 200 && res.status < 300;
          callback(ok, res);
        },
        onerror: err => callback(false, err),
        ontimeout: () => callback(false, { message: "timeout" })
      });
    } catch (e) {
      callback(false, e);
    }
  }

  function detectProfileLink() {
    try {
      const url = window.location.href;
      const input = $('#bm_user_link');
      if (!input) return;

      if (url.includes("/profil/")) {
        input.value = url.split("?")[0];
      } else if (url.includes("/bans/ban/")) {
        const id = url.match(/ban\/(\d+)/)?.[1];
        if (id) input.value = `https://eodev.com/profil/USER-${id}`;
      }
      else {
        const m = url.match(/\/user\/(\d+)/) || url.match(/\/u\/(\d+)/);
        if (m?.[1]) input.value = url.split("?")[0];
      }
    } catch (e) { console.error("detectProfileLink err", e); }
  }

  async function detectDurationFromLink(url) {
    if (!url) return;
    try {
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      const res = await fetch(proxyUrl, { cache: "no-store" });
      if (!res.ok) return;
      const html = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      const listItems = doc.querySelectorAll("li");
      const actionSelect = $('#bm_action');
      for (const li of listItems) {
        const text = (li.textContent || '').trim();
        if (!text.startsWith("SORULAR:")) continue;
        const span = li.querySelector("span.orange") || li.querySelector("span");
        if (!span) continue;
        const value = (span.textContent || '').trim();
        if (value.includes("24 saatliğine askıya al") || value.includes("24 saat")) { actionSelect.value = "action_taken_moderators_24_hour_suspension"; return; }
        if (value.includes("72 saatliğine askıya al") || value.includes("72 saat")) { actionSelect.value = "action_taken_moderators_72_hour_suspension"; return; }
        if (value.includes("Yasakla") || value.includes("Ban") || value.includes("yasakla")) { actionSelect.value = "action_taken_moderators_banned_the_user"; return; }
      }

      const bodyText = doc.body.textContent || '';
      if (/24\s*saat/i.test(bodyText)) { $('#bm_action').value = "action_taken_moderators_24_hour_suspension"; return; }
      if (/72\s*saat/i.test(bodyText)) { $('#bm_action').value = "action_taken_moderators_72_hour_suspension"; return; }
      if (/(yasakla|ban|banned)/i.test(bodyText)) { $('#bm_action').value = "action_taken_moderators_banned_the_user"; return; }
    } catch (e) {
      console.warn("Proxy ile süre algılanamadı veya hata:", e);
    }
  }

  $('#bm_user_link').addEventListener('change', e => {
    const url = e.target.value.trim();
    if (!url) return;
    if (url.includes("/profil/") || url.includes("/user/") || url.includes("/u/") || url.includes("eodev.com")) {
      detectDurationFromLink(url);
    }
  });

  window.addEventListener('load', () => { setTimeout(detectProfileLink, 800); });
  let lastUrl = location.href;
  new MutationObserver(() => {
    if (location.href !== lastUrl) { lastUrl = location.href; detectProfileLink(); }
  }).observe(document, { subtree: true, childList: true });

  $('#bm_send').addEventListener('click', () => {
    const user = $('#bm_user_link').value.trim();
    if (!user) { alert('Kullanıcı linkini gir.'); return; }

    const data = {
      profile: user,
      action: $('#bm_action').value,
      policy: $('#bm_policy').value,
      market: $('#bm_market').value,
      subject: `Moderator action — ${new Date().toLocaleString()}`,
      comment: `Moderator action sent by Brainly Moderation Panel (v4.1). Profile: ${user}`
    };

    const status = $('#bm_status');
    status.textContent = "⏳ Arka planda gönderiliyor...";

    sendBackground(data, (ok, resp) => {
      if (ok) {
        status.textContent = `✅ Gönderildi (arka planda): ${user}`;
        $('#bm_user_link').value = "";
      } else {
        console.error("Gönderim hatası:", resp);
        let msg = "❌ Gönderilemedi";
        try {
          if (resp && resp.status) msg += ` (HTTP ${resp.status})`;
          else if (resp && resp.message) msg += ` (${resp.message})`;
        } catch (e) {}
        status.textContent = msg;
      }
    });
  });

  applyTheme();

  try {
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (autoSync) { isDarkMode = e.matches; applyTheme(); savePrefs(); }
    });
  } catch (e) { /* ignore */ }

})();
