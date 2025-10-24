// ==UserScript==
// @name         Brainly Moderation Panel PLUS5 (Elegant Compact Modern UI)
// @namespace    http://tampermonkey.net/
// @version      3.5
// @description  Roma formu moderasyon paneli 
// @match        *://*/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function(){
  'use strict';

  const PREF_KEY = "bm_panel_prefs_v10";
  const saved = JSON.parse(localStorage.getItem(PREF_KEY) || "{}");
  let isDarkMode = saved.isDarkMode ?? window.matchMedia('(prefers-color-scheme: dark)').matches;
  let autoSync = saved.autoSync ?? true;

  const getTheme = () => isDarkMode ? {
    bg:'#1c1c1e', fg:'#f1f1f1', border:'#3f51b5', accent:'#2979ff', header:'#2c387e',
    inputBg:'#2a2a2d', inputBorder:'#444', btnBg:'#333', btnBorder:'#555'
  } : {
    bg:'#ffffff', fg:'#1a1a1a', border:'#1976d2', accent:'#1976d2', header:'#1976d2',
    inputBg:'#fafafa', inputBorder:'#ccc', btnBg:'#f3f4f6', btnBorder:'#ddd'
  };
  let c = getTheme();

  const toggleBtn=document.createElement('button');
  Object.assign(toggleBtn.style,{
    position:'fixed',top:'10px',right:'10px',padding:'5px 10px',
    backgroundColor:c.accent,color:'#fff',border:'none',borderRadius:'6px',
    cursor:'pointer',zIndex:9999999,fontWeight:'600',fontSize:'12px',
    boxShadow:'0 2px 8px rgba(0,0,0,0.25)',transition:'all 0.2s ease'
  });
  toggleBtn.textContent="🧩 Panel";
  document.body.appendChild(toggleBtn);

  const panel=document.createElement('div');
  Object.assign(panel.style,{
    position:'fixed',top:'60px',right:'10px',width:'230px',
    height:'min(80vh, 400px)',background:c.bg,color:c.fg,
    border:`1px solid ${c.border}`,borderRadius:'10px',
    zIndex:9999998,overflowY:'auto',boxSizing:'border-box',
    boxShadow:'0 4px 16px rgba(0,0,0,0.25)',display:'block',
    fontFamily:'Inter, Segoe UI, sans-serif',transition:'all 0.2s ease-in-out'
  });

  const header=document.createElement('div');
  header.textContent="Brainly Moderation Panel";
  Object.assign(header.style,{
    background:c.header,color:'#fff',padding:'8px',cursor:'move',
    fontWeight:'600',borderTopLeftRadius:'10px',borderTopRightRadius:'10px',
    textAlign:'center',fontSize:'12px',userSelect:'none',letterSpacing:'0.4px'
  });
  panel.appendChild(header);

  const content=document.createElement('div');
  content.style.padding="8px 10px";
  content.innerHTML=`
    <label>Kullanıcı Profili</label>
    <input id="bm_user_link" type="text" placeholder="https://eodev.com/profil/..." />

    <label>Aksiyon</label>
    <select id="bm_action">
      <option value="action_taken_moderators_24_hour_suspension">24 Saat</option>
      <option value="action_taken_moderators_72_hour_suspension">72 Saat</option>
      <option value="action_taken_moderators_banned_the_user" selected>Kalıcı Yasak</option>
    </select>

    <label>İhlal Türü</label>
    <select id="bm_policy">
      <option selected>Benzerlik Spamı</option>
      <option>Spam</option>
      <option>Ticari Spam</option>
      <option>Küfür</option>
      <option>Zorbalık</option>
      <option>Pornografi</option>
      <option>Diğer</option>
    </select>

    <label>Market</label>
    <select id="bm_market">
      <option selected>Türkiye</option>
    </select>

    <button id="bm_send">🚀 Gönder</button>
    <div id="bm_status"></div>
    <hr>
    <div class="bm-row">
      <button id="bm_toggleTheme">🌓</button>
      <button id="bm_syncToggle">${autoSync ? "🔁" : "⛔"}</button>
    </div>
  `;
  panel.appendChild(content);
  document.body.appendChild(panel);

  const style=document.createElement('style');
  style.textContent=`
    #bm_panel_root * { all: unset; display: revert; box-sizing: border-box !important; }

    label {
      font-size: 12px !important;
      font-weight: 500 !important;
      margin-top: 4px !important;
      display: block !important;
      color: ${c.fg} !important;
    }

    input, select {
      width: 100% !important;
      padding: 6px 8px !important;
      font-size: 12px !important;
      margin: 4px 0 8px 0 !important;
      border-radius: 6px !important;
      border: 1px solid ${c.inputBorder} !important;
      background: ${c.inputBg} !important;
      color: ${c.fg} !important;
    }

    input:focus, select:focus {
      border-color: ${c.border} !important;
      box-shadow: 0 0 0 2px rgba(33,150,243,0.25) !important;
    }

    #bm_send {
      width: 100% !important;
      padding: 8px 0 !important;
      border-radius: 6px !important;
      border: none !important;
      background: ${c.accent} !important;
      color: #fff !important;
      font-size: 12px !important;
      font-weight: 600 !important;
      cursor: pointer !important;
      transition: 0.2s !important;
      margin-top: 6px !important;
    }

    #bm_send:hover { opacity: 0.85 !important; }

    .bm-row {
      display: flex !important;
      gap: 6px !important;
    }

    .bm-row button {
      flex: 1 !important;
      padding: 6px 0 !important;
      border-radius: 6px !important;
      background: ${c.btnBg} !important;
      color: ${c.fg} !important;
      border: 1px solid ${c.btnBorder} !important;
      font-size: 12px !important;
      cursor: pointer !important;
      transition: 0.2s !important;
    }

    .bm-row button:hover {
      background: ${isDarkMode ? "#333" : "#e4eaf2"} !important;
    }

    #bm_status {
      margin-top: 4px !important;
      font-size: 11px !important;
      color: ${c.fg} !important;
      text-align: center !important;
    }

    hr {
      border: none !important;
      border-top: 1px solid ${c.inputBorder} !important;
      margin: 8px 0 !important;
    }
  `;
  document.head.appendChild(style);

  const applyTheme=()=>{
    c=getTheme();
    panel.style.background=c.bg;
    panel.style.color=c.fg;
    header.style.background=c.header;
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
    const status=document.getElementById('bm_status');
    if(!w){status.textContent='❌ Pop-up engellendi — tarayıcı izin verin.';return;}
    document.getElementById('bm_user_link').value='';
    status.textContent=`✅ Gönderildi: ${user}`;
  });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change',e=>{
    if(autoSync){isDarkMode=e.matches;applyTheme();savePrefs();}
  });

  applyTheme();
})();
