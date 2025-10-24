// ==UserScript==
// @name         Brainly Moderation Panel PLUS5 (Global Style Isolation)
// @namespace    http://tampermonkey.net/
// @version      3.6
// @description  Roma formu moderasyon paneli (her sitede düzgün görünüm, global CSS koruması)
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
    bg:'#1e1e1e', fg:'#f0f0f0', border:'#3f51b5', accent:'#2196f3', header:'#2c387e',
    inputBg:'#252525', inputBorder:'#444', btnBg:'#2d2d2d', btnBorder:'#555'
  } : {
    bg:'#f9fafc', fg:'#1e1e1e', border:'#1976d2', accent:'#1976d2', header:'#1976d2',
    inputBg:'#ffffff', inputBorder:'#dcdcdc', btnBg:'#f1f5f9', btnBorder:'#c5c5c5'
  };
  let c = getTheme();

  // 🌙 Ana buton
  const toggleBtn=document.createElement('button');
  Object.assign(toggleBtn.style,{
    position:'fixed',top:'12px',right:'12px',padding:'6px 12px',
    backgroundColor:c.accent,color:'#fff',border:'none',borderRadius:'8px',
    cursor:'pointer',zIndex:9999999,fontWeight:'600',fontSize:'13px',
    boxShadow:'0 2px 8px rgba(0,0,0,0.3)',transition:'background 0.2s ease'
  });
  toggleBtn.textContent="📝 Brainly";
  document.body.appendChild(toggleBtn);

  // 🧩 Panel
  const panel=document.createElement('div');
  panel.id = "bm_panel_root";
  Object.assign(panel.style,{
    position:'fixed',top:'65px',right:'10px',width:'280px',
    height:'min(85vh, 480px)',background:c.bg,color:c.fg,
    border:`1.5px solid ${c.border}`,borderRadius:'12px',
    zIndex:9999998,overflowY:'auto',boxSizing:'border-box',
    boxShadow:'0 6px 20px rgba(0,0,0,0.25)',display:'block',
    fontFamily:'Inter, Arial, sans-serif',transition:'all 0.2s ease-in-out'
  });

  // 📋 İçerik
  panel.innerHTML = `
    <div id="bm_header">Brainly Moderation Panel</div>
    <div id="bm_content">
      <label>Kullanıcı Profili</label>
      <input id="bm_user_link" type="text" placeholder="https://eodev.com/profil/..." />

      <label>Aksiyon</label>
      <select id="bm_action">
        <option value="action_taken_moderators_24_hour_suspension">Kullanıcı 24 saat yasaklandı</option>
        <option value="action_taken_moderators_72_hour_suspension">Kullanıcı 72 saat yasaklandı</option>
        <option value="action_taken_moderators_banned_the_user" selected>Kullanıcı kalıcı yasaklandı</option>
      </select>

      <label>İhlal Türü</label>
      <select id="bm_policy">
        <option value="benzerlik_spami" selected>Benzerlik Spamı</option>
        <option value="spam">Meet Spam</option>
        <option value="ticari_spam">Ticari Spam</option>
        <option value="kufur">Küfür</option>
        <option value="zorbalik">Zorbalık / Taciz</option>
        <option value="pornografi">Pornografi</option>
        <option value="mustehcenlik">Müstehcenlik</option>
        <option value="nefret_soylemi">Nefret Söylemi</option>
        <option value="kisisel_bilgi">Kişisel Bilgi Paylaşımı</option>
        <option value="sahte_kimlik">Kimlik Sahtekarlığı</option>
        <option value="cocuk_istismari">Çocuk İstismarı</option>
        <option value="kendine_zarar">Kendine Zarar / İntihar</option>
        <option value="terorist_icerik">Terörist İçerik</option>
        <option value="siddet_tehdidi">Şiddet Tehdidi</option>
        <option value="yanlis_bilgi">Yanlış Bilgi</option>
        <option value="phishing">Phishing / Zararlı Yazılım</option>
        <option value="intihal">Kopya / Sınav İhlali</option>
        <option value="siddet_gorsel">Şiddet İçeren Görseller</option>
        <option value="tehlikeli">Tehlikeli / Yasaklı İçerik</option>
        <option value="other">Diğer</option>
      </select>

      <label>Market</label>
      <select id="bm_market">
        <option value="turkey_clone" selected>Türkiye</option>
      </select>

      <button id="bm_send">🚀 Gönder</button>
      <div id="bm_status"></div>
      <hr>
      <button id="bm_toggleTheme">🌓 Tema Değiştir</button>
      <button id="bm_syncToggle">🔁 Otomatik Senkron: ${autoSync ? "Açık" : "Kapalı"}</button>
    </div>
  `;
  document.body.appendChild(panel);

  // 🎨 Stil
  const style=document.createElement('style');
  style.textContent=`
    #bm_panel_root * {
      all: unset;
      display: revert;
      font-family: Inter, Arial, sans-serif !important;
      box-sizing: border-box !important;
    }

    #bm_panel_root {
      font-family: Inter, Arial, sans-serif !important;
    }

    #bm_header {
      background: ${c.header} !important;
      color: #fff !important;
      padding: 10px !important;
      text-align: center !important;
      font-weight: 600 !important;
      border-top-left-radius: 12px !important;
      border-top-right-radius: 12px !important;
      font-size: 13px !important;
    }

    #bm_content label {
      display: block !important;
      font-size: 13px !important;
      margin-top: 6px !important;
      margin-bottom: 4px !important;
      color: ${c.fg} !important;
    }

    #bm_content input, #bm_content select {
      width: 100% !important;
      padding: 9px 10px !important;
      border: 1px solid ${c.inputBorder} !important;
      border-radius: 8px !important;
      background: ${c.inputBg} !important;
      color: ${c.fg} !important;
      font-size: 13px !important;
      margin-bottom: 10px !important;
    }

    #bm_content button {
      width: 100% !important;
      padding: 10px !important;
      border-radius: 8px !important;
      border: none !important;
      font-weight: 600 !important;
      font-size: 13px !important;
      cursor: pointer !important;
      margin-top: 6px !important;
      transition: opacity 0.2s ease !important;
    }

    #bm_send { background: ${c.accent} !important; color: #fff !important; }
    #bm_send:hover { opacity: 0.9 !important; }

    #bm_toggleTheme, #bm_syncToggle {
      background: ${c.btnBg} !important;
      color: ${c.fg} !important;
      border: 1px solid ${c.btnBorder} !important;
    }
    #bm_toggleTheme:hover, #bm_syncToggle:hover {
      background: ${isDarkMode ? "#333" : "#e4eaf2"} !important;
    }

    hr {
      border: none !important;
      border-top: 1px solid ${c.inputBorder} !important;
      margin: 10px 0 !important;
    }
  `;
  document.head.appendChild(style);

  // ⚙️ Tema değiştirme
  const applyTheme=()=>{
    c=getTheme();
    style.textContent = style.textContent; // yeniden uygula
  };

  const savePrefs=()=>localStorage.setItem(PREF_KEY,JSON.stringify({isDarkMode,autoSync}));

  document.getElementById('bm_toggleTheme').addEventListener('click',()=>{
    isDarkMode=!isDarkMode;applyTheme();savePrefs();
  });
  document.getElementById('bm_syncToggle').addEventListener('click',()=>{
    autoSync=!autoSync;
    document.getElementById('bm_syncToggle').textContent=`🔁 Otomatik Senkron: ${autoSync?"Açık":"Kapalı"}`;
    savePrefs();
  });

  toggleBtn.addEventListener('click',()=>panel.style.display = (panel.style.display==="none")?"block":"none");

  // 🚀 Gönder
  document.getElementById('bm_send').addEventListener('click',()=>{
    const user=document.getElementById('bm_user_link').value.trim();
    if(!user){alert('⚠️ Kullanıcı linkini giriniz.');return;}
    const base='https://brainly-trustandsafety.zendesk.com/hc/en-us/requests/new?ticket_form_id=9719157534610';
    const params=`&bm_user=${encodeURIComponent(user)}&bm_action=${encodeURIComponent(document.getElementById('bm_action').value)}&bm_policy=${encodeURIComponent(document.getElementById('bm_policy').value)}&bm_market=${encodeURIComponent(document.getElementById('bm_market').value)}`;
    const w=window.open(base+params,'_blank');
    if(!w) alert('❌ Pop-up engellendi. Tarayıcıda izin verin.');
  });

  // 🌗 Otomatik tema senkronu
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change',e=>{
    if(autoSync){isDarkMode=e.matches;applyTheme();savePrefs();}
  });

  applyTheme();
})();
