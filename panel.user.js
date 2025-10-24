// ==UserScript==
// @name         Brainly Moderation Panel PLUS5 (Stable + Mobile Right Fixed)
// @namespace    http://tampermonkey.net/
// @version      2.7
// @description  Roma formu moderasyon paneli 
// @match        *://*/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function(){
  'use strict';

  const PREF_KEY = "bm_panel_prefs_v9";
  const saved = JSON.parse(localStorage.getItem(PREF_KEY) || "{}");
  let isDarkMode = saved.isDarkMode ?? window.matchMedia('(prefers-color-scheme: dark)').matches;
  let autoSync = saved.autoSync ?? true;

  const getTheme = () => isDarkMode ? {
    bg:'#181818', fg:'#f1f1f1', border:'#3f51b5', accent:'#2196f3', header:'#1976d2',
    inputBg:'#202020', inputBorder:'#333', btnBg:'#2a2a2a', btnBorder:'#555'
  } : {
    bg:'#ffffff', fg:'#111', border:'#1976d2', accent:'#1976d2', header:'#1976d2',
    inputBg:'#fff', inputBorder:'#ccc', btnBg:'#f5f5f5', btnBorder:'#bbb'
  };
  let c = getTheme();

  const toggleBtn=document.createElement('button');
  Object.assign(toggleBtn.style,{
    position:'fixed',top:'12px',right:'12px',padding:'6px 10px',
    backgroundColor:c.accent,color:'#fff',border:'none',borderRadius:'6px',
    cursor:'pointer',zIndex:9999999,fontWeight:'bold',fontSize:'13px'
  });
  toggleBtn.textContent="📝 Brainly";
  document.body.appendChild(toggleBtn);

  const panel=document.createElement('div');
  Object.assign(panel.style,{
    position:'fixed',
    top:'60px',
    right:'5px',            
    width:'280px',
    height:'min(85vh, 460px)',
    background:c.bg,color:c.fg,border:`1.5px solid ${c.border}`,
    zIndex:9999998,fontFamily:'Arial,sans-serif',fontSize:'13px',
    borderRadius:'10px',overflowY:'auto',resize:'both',
    boxSizing:'border-box',paddingBottom:'10px',
    boxShadow:'0 3px 12px rgba(0,0,0,0.25)',display:'block'
  });

  const header=document.createElement('div');
  header.textContent="Brainly Moderation Panel";
  Object.assign(header.style,{
    background:c.header,color:'#fff',padding:'8px',cursor:'move',
    fontWeight:'600',borderTopLeftRadius:'10px',borderTopRightRadius:'10px',
    textAlign:'center',fontSize:'13px',userSelect:'none'
  });
  panel.appendChild(header);

  const content=document.createElement('div');
  content.style.padding="10px";
  content.innerHTML=`
    <input id="bm_user_link" type="text" placeholder="Kullanıcı profil linki (https://...)" />
    <label>Aksiyon</label>
    <select id="bm_action">
     <option value="action_taken_moderators_24_hour_suspension">Kullanıcı 24 saat yasaklandı</option>
     <option value="action_taken_moderators_72_hour_suspension">Kullanıcı 72 saat yasaklandı</option>
      <option value="action_taken_moderators_banned_the_user" selected>Kullanıcı yasaklandı</option>
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
      <option value="turkey_clone" selected>Turkey</option>
    </select>
    <button id="bm_send">Gönder</button>
    <div id="bm_status"></div>
    <hr>
    <button id="bm_toggleTheme">🌓 Tema Değiştir</button>
    <button id="bm_syncToggle">🔁 Otomatik Senkron: ${autoSync?"Açık":"Kapalı"}</button>
  `;
  panel.appendChild(content);
  document.body.appendChild(panel);

  const style=document.createElement('style');
  style.textContent=`
    #bm_ser_link,#bm_action,#bm_policy,#bm_market{
      width:100%;padding:8px;margin:6px 0 10px 0;box-sizing:border-box;
      border-radius:5px;font-size:13px;outline:none;
    }
    #bm_send,#bm_toggleTheme,#bm_syncToggle{
      width:100%;padding:9px;margin-top:6px;
      border:none;border-radius:6px;
      cursor:pointer;font-weight:bold;font-size:13px;
      transition:background 0.2s ease;
    }
    #bm_status{margin-top:5px;font-family:monospace;font-size:12px;white-space:pre-wrap;}
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
    const send=document.getElementById('bm_send');
    const theme=document.getElementById('bm_toggleTheme');
    const sync=document.getElementById('bm_syncToggle');
    send.style.background=c.accent;send.style.color='#fff';
    [theme,sync].forEach(b=>{
      b.style.background=c.btnBg;b.style.border=`1px solid ${c.btnBorder}`;b.style.color=c.fg;
    });
  };

  const savePrefs=()=>{
    localStorage.setItem(PREF_KEY,JSON.stringify({isDarkMode,autoSync}));
  };

  document.getElementById('bm_toggleTheme').addEventListener('click',()=>{
    isDarkMode=!isDarkMode;applyTheme();savePrefs();
  });
  document.getElementById('bm_syncToggle').addEventListener('click',()=>{
    autoSync=!autoSync;
    document.getElementById('bm_syncToggle').textContent=`🔁 Otomatik Senkron: ${autoSync?"Açık":"Kapalı"}`;
    savePrefs();
  });

  const togglePanel=()=>{
    panel.style.display = (panel.style.display==="none") ? "block" : "none";
  };
  toggleBtn.addEventListener('click',togglePanel);
  toggleBtn.addEventListener('touchstart',togglePanel);

  document.getElementById('bm_send').addEventListener('click',()=>{
    const user=document.getElementById('bm_user_link').value.trim();
    if(!user){alert('Kullanıcı linkini gir.');return;}
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
