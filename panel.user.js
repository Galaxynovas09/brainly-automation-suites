// ==UserScript==
// @name         Brainly Moderation Panel PLUS5 (Compact Modern UI)
// @namespace    http://tampermonkey.net/
// @version      3.7
// @description  Kompakt ve modern moderasyon paneli 
// @match        *://*/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function(){
  'use strict';

  const PREF_KEY = "bm_panel_prefs_v11";
  const saved = JSON.parse(localStorage.getItem(PREF_KEY) || "{}");
  let isDarkMode = saved.isDarkMode ?? window.matchMedia('(prefers-color-scheme: dark)').matches;
  let autoSync = saved.autoSync ?? true;

  const getTheme = () => isDarkMode ? {
    bg:'#1e1e1e', fg:'#f0f0f0', border:'#3f51b5', accent:'#2979ff', header:'#2c387e',
    inputBg:'#2a2a2a', inputBorder:'#444', btnBg:'#303030', btnBorder:'#555'
  } : {
    bg:'#ffffff', fg:'#222', border:'#1976d2', accent:'#1976d2', header:'#1976d2',
    inputBg:'#fafafa', inputBorder:'#ccc', btnBg:'#f4f4f4', btnBorder:'#ddd'
  };
  let c = getTheme();

  const toggleBtn=document.createElement('button');
  Object.assign(toggleBtn.style,{
    position:'fixed',top:'10px',right:'10px',padding:'5px 10px',
    backgroundColor:c.accent,color:'#fff',border:'none',borderRadius:'6px',
    cursor:'pointer',zIndex:9999999,fontWeight:'600',fontSize:'12px',
    boxShadow:'0 2px 8px rgba(0,0,0,0.2)',transition:'background 0.2s ease'
  });
  toggleBtn.textContent="🧩 Panel";
  document.body.appendChild(toggleBtn);

  const panel=document.createElement('div');
  panel.id="bm_panel_root";
  Object.assign(panel.style,{
    position:'fixed',top:'55px',right:'10px',width:'240px',
    height:'min(80vh, 420px)',background:c.bg,color:c.fg,
    border:`1px solid ${c.border}`,borderRadius:'10px',
    zIndex:9999998,overflowY:'auto',boxSizing:'border-box',
    boxShadow:'0 4px 16px rgba(0,0,0,0.25)',display:'block',
    fontFamily:'Inter, Arial, sans-serif',transition:'all 0.2s ease-in-out'
  });

  panel.innerHTML=`
    <div id="bm_header">Brainly Moderation Panel</div>
    <div id="bm_content">
      <label>Kullanıcı</label>
      <input id="bm_user_link" type="text" placeholder="Profil linki..." />

      <label>Aksiyon</label>
      <select id="bm_action">
        <option value="24">24 Saat Yasak</option>
        <option value="72">72 Saat Yasak</option>
        <option value="ban" selected>Kalıcı Yasak</option>
      </select>

      <label>İhlal</label>
      <select id="bm_policy">
        <option selected>Benzerlik Spamı</option>
        <option>Spam</option>
        <option>Ticari Spam</option>
        <option>Küfür</option>
        <option>Zorbalık</option>
        <option>Pornografi</option>
        <option>Tehlikeli İçerik</option>
        <option>Diğer</option>
      </select>

      <label>Market</label>
      <select id="bm_market">
        <option selected>Türkiye</option>
      </select>

      <button id="bm_send">🚀 Gönder</button>
      <div id="bm_status"></div>
      <hr>
      <div class="bm_row">
        <button id="bm_toggleTheme">🌓</button>
        <button id="bm_syncToggle">${autoSync ? "🔁" : "⛔"}</button>
      </div>
    </div>
  `;
  document.body.appendChild(panel);

  const style=document.createElement('style');
  style.textContent=`
    #bm_panel_root * {
      all: unset;
      display: revert;
      font-family: Inter, Arial, sans-serif !important;
      box-sizing: border-box !important;
    }

    #bm_header {
      background: ${c.header} !important;
      color: #fff !important;
      padding: 8px !important;
      text-align: center !important;
      font-size: 12px !important;
      font-weight: 600 !important;
      border-top-left-radius: 10px !important;
      border-top-right-radius: 10px !important;
    }

    #bm_content {
      padding: 8px 10px !important;
    }

    #bm_content label {
      display: block !important;
      font-size: 12px !important;
      margin-bottom: 3px !important;
      color: ${c.fg} !important;
    }

    #bm_content input, #bm_content select {
      width: 100% !important;
      padding: 6px 8px !important;
      font-size: 12px !important;
      border-radius: 6px !important;
      border: 1px solid ${c.inputBorder} !important;
      background: ${c.inputBg} !important;
      color: ${c.fg} !important;
      margin-bottom: 6px !important;
    }

    #bm_content button {
      width: 100% !important;
      padding: 7px !important;
      border-radius: 6px !important;
      border: none !important;
      font-size: 12px !important;
      font-weight: 600 !important;
      cursor: pointer !important;
    }

    #bm_send {
      background: ${c.accent} !important;
      color: #fff !important;
    }
    #bm_send:hover { opacity: 0.85 !important; }

    .bm_row {
      display: flex !important;
      gap: 6px !important;
    }

    .bm_row button {
      flex: 1 !important;
      padding: 6px 0 !important;
      background: ${c.btnBg} !important;
      color: ${c.fg} !important;
      border: 1px solid ${c.btnBorder} !important;
      text-align: center !important;
    }

    .bm_row button:hover {
      background: ${isDarkMode ? "#333" : "#eee"} !important;
    }

    #bm_status {
      font-size: 11px !important;
      color: ${c.fg} !important;
      margin-top: 4px !important;
      text-align: center !important;
    }

    hr {
      border: none !important;
      border-top: 1px solid ${c.inputBorder} !important;
      margin: 6px 0 !important;
    }
  `;
  document.head.appendChild(style);


  const applyTheme=()=>{
    c=getTheme();
    style.textContent=style.textContent;
  };

  const savePrefs=()=>localStorage.setItem(PREF_KEY,JSON.stringify({isDarkMode,autoSync}));

  document.getElementById('bm_toggleTheme').addEventListener('click',()=>{
    isDarkMode=!isDarkMode;applyTheme();savePrefs();
  });

  document.getElementById('bm_syncToggle').addEventListener('click',()=>{
    autoSync=!autoSync;
    document.getElementById('bm_syncToggle').textContent=autoSync?"🔁":"⛔";
    savePrefs();
  });

  toggleBtn.addEventListener('click',()=>panel.style.display = (panel.style.display==="none")?"block":"none");

  document.getElementById('bm_send').addEventListener('click',()=>{
    const user=document.getElementById('bm_user_link').value.trim();
    if(!user){alert('⚠️ Kullanıcı linkini giriniz.');return;}
    const base='https://brainly-trustandsafety.zendesk.com/hc/en-us/requests/new?ticket_form_id=9719157534610';
    const params=`&bm_user=${encodeURIComponent(user)}&bm_action=${encodeURIComponent(document.getElementById('bm_action').value)}&bm_policy=${encodeURIComponent(document.getElementById('bm_policy').value)}&bm_market=${encodeURIComponent(document.getElementById('bm_market').value)}`;
    const w=window.open(base+params,'_blank');
    if(!w) alert('❌ Pop-up engellendi. Tarayıcıda izin verin.');
  });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change',e=>{
    if(autoSync){isDarkMode=e.matches;applyTheme();savePrefs();}
  });

  applyTheme();
})();
