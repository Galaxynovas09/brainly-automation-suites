// ==UserScript==
// @name         Brainly Moderation Panel PLUS5 (Elegant UI + Mobile Right Fixed Scrollable Policy)
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
    bg:'#1e1e1e', fg:'#f0f0f0', border:'#3f51b5', accent:'#2196f3', header:'#2c387e',
    inputBg:'#252525', inputBorder:'#444', btnBg:'#2d2d2d', btnBorder:'#555'
  } : {
    bg:'#f9fafc', fg:'#1e1e1e', border:'#1976d2', accent:'#1976d2', header:'#1976d2',
    inputBg:'#ffffff', inputBorder:'#dcdcdc', btnBg:'#f1f5f9', btnBorder:'#c5c5c5'
  };
  let c = getTheme();

  const toggleBtn=document.createElement('button');
  Object.assign(toggleBtn.style,{
    position:'fixed',top:'12px',right:'12px',padding:'6px 12px',
    backgroundColor:c.accent,color:'#fff',border:'none',borderRadius:'8px',
    cursor:'pointer',zIndex:9999999,fontWeight:'600',fontSize:'13px',
    boxShadow:'0 2px 8px rgba(0,0,0,0.3)',transition:'background 0.2s ease'
  });
  toggleBtn.textContent="📝 Brainly";
  document.body.appendChild(toggleBtn);

  const panel=document.createElement('div');
  Object.assign(panel.style,{
    position:'fixed',top:'65px',right:'10px',width:'280px',
    height:'min(85vh, 480px)',background:c.bg,color:c.fg,
    border:`1.5px solid ${c.border}`,borderRadius:'12px',
    zIndex:9999998,overflowY:'auto',boxSizing:'border-box',
    boxShadow:'0 6px 20px rgba(0,0,0,0.25)',display:'block',
    fontFamily:'Inter, Arial, sans-serif',transition:'all 0.2s ease-in-out'
  });

  const header=document.createElement('div');
  header.textContent="Brainly Moderation Panel";
  Object.assign(header.style,{
    background:c.header,color:'#fff',padding:'10px',cursor:'move',
    fontWeight:'600',borderTopLeftRadius:'12px',borderTopRightRadius:'12px',
    textAlign:'center',fontSize:'13px',userSelect:'none',
    letterSpacing:'0.4px'
  });
  panel.appendChild(header);

  const content=document.createElement('div');
  content.style.padding="12px";
  content.innerHTML=`
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
  `;
  panel.appendChild(content);
  document.body.appendChild(panel);

  const style=document.createElement('style');
  style.textContent=`
    /* 🔹 İhlal Türü menüsüne kaydırma ekle */
    #bm_policy {
      max-height: 140px;
      overflow-y: auto;
      scrollbar-width: thin;
    }
    #bm_policy::-webkit-scrollbar {
      width: 6px;
    }
    #bm_policy::-webkit-scrollbar-thumb {
      background: ${isDarkMode ? "#555" : "#ccc"};
      border-radius: 4px;
    }

    #bm_user_link,#bm_action,#bm_policy,#bm_market{
      width:100%;padding:9px 10px;margin:6px 0 12px 0;box-sizing:border-box;
      border-radius:8px;font-size:13px;outline:none;
      transition:all 0.2s ease-in-out;
      border:1px solid ${c.inputBorder};background:${c.inputBg};color:${c.fg};
    }
    #bm_user_link:focus,#bm_action:focus,#bm_policy:focus,#bm_market:focus{
      border-color:${c.border};box-shadow:0 0 0 2px rgba(33,150,243,0.25);
    }
    #bm_send,#bm_toggleTheme,#bm_syncToggle{
      width:100%;padding:10px;margin-top:8px;
      border:none;border-radius:8px;
      cursor:pointer;font-weight:600;font-size:13px;
      transition:all 0.2s ease-in-out;
    }
    #bm_send{background:${c.accent};color:#fff;}
    #bm_send:hover{opacity:0.9;}
    #bm_toggleTheme,#bm_syncToggle{
      background:${c.btnBg};border:1px solid ${c.btnBorder};color:${c.fg};
    }
    #bm_toggleTheme:hover,#bm_syncToggle:hover{
      background:${isDarkMode ? "#333" : "#e4eaf2"};
    }
    #bm_status{margin-top:5px;font-family:monospace;font-size:12px;white-space:pre-wrap;}
    hr{border:none;border-top:1px solid ${c.inputBorder};margin:10px 0;}
    label{font-weight:500;font-size:13px;display:block;margin-bottom:4px;}
    select, input, button { touch-action: manipulation; }
  `;
  document.head.appendChild(style);

  const applyTheme=()=>{
    c=getTheme();
    panel.style.background=c.bg;panel.style.color=c.fg;panel.style.border=`1.5px solid ${c.border}`;
    header.style.background=c.header;
    document.querySelectorAll('#bm_user_link,#bm_action,#bm_policy,#bm_market').forEach(el=>{
      el.style.background=c.inputBg;el.style.border=`1px solid ${c.inputBorder}`;el.style.color=c.fg;
    });
    document.getElementById('bm_send').style.background=c.accent;
    [document.getElementById('bm_toggleTheme'),document.getElementById('bm_syncToggle')].forEach(b=>{
      b.style.background=c.btnBg;b.style.border=`1px solid ${c.btnBorder}`;b.style.color=c.fg;
    });
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

  const togglePanel=()=>{panel.style.display = (panel.style.display==="none") ? "block" : "none";};
  toggleBtn.addEventListener('click',togglePanel);
  toggleBtn.addEventListener('touchstart',togglePanel);

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
