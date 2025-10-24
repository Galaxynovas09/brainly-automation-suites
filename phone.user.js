// ==UserScript==
// @name         Brainly Moderation Panel PLUS5 (Mobile Optimized for Kiwi Browser)
// @namespace    http://tampermonkey.net/
// @version      8.9
// @description  Roma Formu Moderasyon Paneli 
// @match        *://*/*
// @updateURL    https://github.com/Galaxynovas09/brainly-automation-suites/raw/refs/heads/main/panel.user.js
// @downloadURL  https://github.com/Galaxynovas09/brainly-automation-suites/raw/refs/heads/main/panel.user.js
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  const PREF_KEY = "bm_panel_prefs_v8";
  const saved = JSON.parse(localStorage.getItem(PREF_KEY) || "{}");
  let isDarkMode = saved.isDarkMode ?? window.matchMedia('(prefers-color-scheme: dark)').matches;
  let autoSync = saved.autoSync ?? true;

  const getTheme = () => isDarkMode ? {
    bg: '#181818', fg: '#f1f1f1', border: '#3f51b5', accent: '#2196f3', header: '#1976d2',
    inputBg: '#202020', inputBorder: '#333', btnBg: '#2a2a2a', btnBorder: '#555'
  } : {
    bg: '#ffffff', fg: '#111', border: '#1976d2', accent: '#1976d2', header: '#1976d2',
    inputBg: '#fff', inputBorder: '#ccc', btnBg: '#f5f5f5', btnBorder: '#bbb'
  };
  let c = getTheme();

  const savePrefs = () => localStorage.setItem(PREF_KEY, JSON.stringify({ isDarkMode, autoSync }));

  const toggleBtn = document.createElement('button');
  Object.assign(toggleBtn.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    padding: '10px 14px',
    fontSize: '14px',
    backgroundColor: c.accent,
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    boxShadow: '0 3px 8px rgba(0,0,0,0.3)',
    cursor: 'pointer',
    zIndex: 9999999,
    fontWeight: '600',
    width: '56px',
    height: '56px'
  });
  toggleBtn.textContent = "📝";
  document.body.appendChild(toggleBtn);

  const panel = document.createElement('div');
  Object.assign(panel.style, {
    position: 'fixed',
    bottom: '90px',
    right: '10px',
    width: '90vw',
    maxWidth: '360px',
    height: '65vh',
    background: c.bg,
    color: c.fg,
    border: `1.5px solid ${c.border}`,
    borderRadius: '14px',
    overflowY: 'auto',
    zIndex: 9999998,
    fontFamily: 'Inter, Arial, sans-serif',
    fontSize: '13px',
    boxShadow: '0 3px 15px rgba(0,0,0,0.4)',
    display: 'none',
    boxSizing: 'border-box'
  });

  const header = document.createElement('div');
  header.textContent = "Brainly Moderation Panel";
  Object.assign(header.style, {
    background: c.header,
    color: '#fff',
    padding: '10px',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: '13.5px',
    borderTopLeftRadius: '14px',
    borderTopRightRadius: '14px',
    userSelect: 'none'
  });
  panel.appendChild(header);

  const content = document.createElement('div');
  content.style.padding = "10px";
  content.innerHTML = `
    <input id="bm_user_link" type="text" placeholder="Kullanıcı linki (https://...)" />
    <label>Aksiyon</label>
    <select id="bm_action">
      <option value="action_taken_moderators_24_hour_suspension">24 saat</option>
      <option value="action_taken_moderators_72_hour_suspension">72 saat</option>
      <option value="action_taken_moderators_banned_the_user" selected>Kalıcı</option>
    </select>
    <label>İhlal Türü</label>
    <select id="bm_policy" size="1">
      <option value="benzerlik_spami" selected>Benzerlik Spamı</option>
      <option value="spam">Meet Spam</option>
      <option value="ticari_spam">Ticari Spam</option>
      <option value="kufur">Küfür</option>
      <option value="zorbalik">Zorbalık</option>
      <option value="pornografi">Pornografi</option>
      <option value="nefret_soylemi">Nefret Söylemi</option>
      <option value="phishing">E-dolandırıcılık</option>
      <option value="intihal">Kopya / Sınav</option>
      <option value="other">Diğer</option>
    </select>
    <label>Market</label>
    <select id="bm_market"><option value="turkey_clone" selected>Türkiye</option></select>
    <button id="bm_send">Gönder</button>
    <div id="bm_status"></div>
    <hr>
    <button id="bm_toggleTheme">🌓 Tema</button>
    <button id="bm_syncToggle">🔁 Senkron: ${autoSync ? "Açık" : "Kapalı"}</button>
  `;
  panel.appendChild(content);
  document.body.appendChild(panel);

  const style = document.createElement('style');
  style.textContent = `
    #bm_user_link,#bm_action,#bm_policy,#bm_market {
      width: 100%; padding: 10px; margin: 5px 0 8px 0;
      border-radius: 8px; font-size: 13px;
      border: 1px solid ${c.inputBorder};
      background: ${c.inputBg}; color: ${c.fg};
    }
    #bm_send,#bm_toggleTheme,#bm_syncToggle {
      width: 100%; padding: 10px; margin-top: 6px;
      border: none; border-radius: 8px;
      font-weight: 600; font-size: 13px;
      cursor: pointer; touch-action: manipulation;
    }
    #bm_send {background:${c.accent}; color:#fff;}
    #bm_status {margin-top:6px;font-size:11px;white-space:pre-wrap;}
    @media (max-width:600px){
      #bm_panel{width:92vw;right:4vw;bottom:90px;}
      #bm_user_link,#bm_action,#bm_policy,#bm_market,#bm_send,#bm_toggleTheme,#bm_syncToggle{font-size:14px;}
    }
  `;
  document.head.appendChild(style);

  const applyTheme = () => {
    c = getTheme();
    panel.style.background = c.bg;
    panel.style.color = c.fg;
    panel.style.border = `1.5px solid ${c.border}`;
    header.style.background = c.header;
    document.querySelectorAll('#bm_user_link,#bm_action,#bm_policy,#bm_market').forEach(el => {
      el.style.background = c.inputBg;
      el.style.border = `1px solid ${c.inputBorder}`;
      el.style.color = c.fg;
    });
    const send = document.getElementById('bm_send');
    const theme = document.getElementById('bm_toggleTheme');
    const sync = document.getElementById('bm_syncToggle');
    send.style.background = c.accent;
    send.style.color = '#fff';
    [theme, sync].forEach(b => {
      b.style.background = c.btnBg;
      b.style.border = `1px solid ${c.btnBorder}`;
      b.style.color = c.fg;
    });
  };

  document.getElementById('bm_toggleTheme').onclick = () => { isDarkMode = !isDarkMode; applyTheme(); savePrefs(); };
  document.getElementById('bm_syncToggle').onclick = () => {
    autoSync = !autoSync;
    document.getElementById('bm_syncToggle').textContent = `🔁 Senkron: ${autoSync ? "Açık" : "Kapalı"}`;
    savePrefs();
  };
  toggleBtn.onclick = () => {
    panel.style.display = (panel.style.display === 'none') ? 'block' : 'none';
  };

  document.getElementById('bm_send').onclick = () => {
    const user = document.getElementById('bm_user_link').value.trim();
    if (!user) return alert('Kullanıcı linkini gir.');
    const base = 'https://brainly-trustandsafety.zendesk.com/hc/en-us/requests/new?ticket_form_id=9719157534610';
    const params = `&bm_user=${encodeURIComponent(user)}&bm_action=${encodeURIComponent(document.getElementById('bm_action').value)}&bm_policy=${encodeURIComponent(document.getElementById('bm_policy').value)}&bm_market=${encodeURIComponent(document.getElementById('bm_market').value)}`;
    const w = window.open(base + params, '_blank');
    const status = document.getElementById('bm_status');
    if (!w) { status.textContent = '❌ Pop-up engellendi — izin verin.'; return; }
    document.getElementById('bm_user_link').value = '';
    status.textContent = `✅ Gönderildi: ${user}`;
  };

  function detectProfileLink() {
    const url = window.location.href;
    const input = document.getElementById('bm_user_link');
    const actionSelect = document.getElementById('bm_action');
    if (!input || !actionSelect) return;

    if (url.includes("/profil/")) {
      input.value = url.split("?")[0];
    } else if (url.includes("/bans/ban/")) {
      const id = url.match(/ban\/(\d+)/)?.[1];
      if (id) input.value = `https://eodev.com/profil/USER-${id}`;
    }

    const listItems = document.querySelectorAll("li");
    for (const li of listItems) {
      const text = li.textContent.trim();
      if (!text.startsWith("SORULAR:")) continue;
      const span = li.querySelector("span.orange");
      if (!span) continue;
      const value = span.textContent.trim();
      if (value.includes("24 saatliğine askıya al")) actionSelect.value = "action_taken_moderators_24_hour_suspension";
      if (value.includes("72 saatliğine askıya al")) actionSelect.value = "action_taken_moderators_72_hour_suspension";
      if (value.includes("Yasakla")) actionSelect.value = "action_taken_moderators_banned_the_user";
    }
  }

  window.addEventListener('load', () => setTimeout(detectProfileLink, 1000));
  let lastUrl = location.href;
  new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      detectProfileLink();
    }
  }).observe(document, { subtree: true, childList: true });

  applyTheme();
})();
