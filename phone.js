// ==UserScript==
// @name         Brainly Moderation Panel PLUS5 (Stable Theme + Drag + Resize)
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Roma formu moderasyon paneli
// @match        *://*/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function(){
  'use strict';

  const PREF_KEY = "bm_panel_prefs_v6";
  const saved = JSON.parse(localStorage.getItem(PREF_KEY) || "{}");
  let isDarkMode = saved.isDarkMode ?? window.matchMedia('(prefers-color-scheme: dark)').matches;
  let autoSync = saved.autoSync ?? true;
  let panelWidth = saved.panelWidth ?? 270;
  let panelHeight = saved.panelHeight ?? 420;
  let panelX = saved.panelX ?? null;
  let panelY = saved.panelY ?? null;

  const getTheme = () => isDarkMode ? {
    bg:'#181818', fg:'#f1f1f1', border:'#3f51b5', accent:'#2196f3', header:'#1976d2',
    inputBg:'#202020', inputBorder:'#333', btnBg:'#2a2a2a', btnBorder:'#555'
  } : {
    bg:'#ffffff', fg:'#111', border:'#1976d2', accent:'#1976d2', header:'#1976d2',
    inputBg:'#fff', inputBorder:'#ccc', btnBg:'#f5f5f5', btnBorder:'#bbb'
  };
  let c = getTheme();

  // === Toggle Button ===
  const toggleBtn=document.createElement('button');
  Object.assign(toggleBtn.style,{
    position:'fixed',top:'14px',right:'14px',padding:'5px 9px',
    backgroundColor:c.accent,color:'#fff',border:'none',borderRadius:'5px',
    cursor:'pointer',zIndex:9999999,fontWeight:'bold',fontSize:'13px'
  });
  toggleBtn.textContent="📝 Brainly";
  document.body.appendChild(toggleBtn);

  // === Panel ===
  const panel=document.createElement('div');
  Object.assign(panel.style,{
    position:'fixed',top:panelY?panelY+'px':'70px',right:panelX?null:'10px',left:panelX?panelX+'px':null,
    width:panelWidth+'px',height:panelHeight+'px',
    background:c.bg,color:c.fg,border:`1.5px solid ${c.border}`,
    zIndex:9999998,fontFamily:'Arial,sans-serif',fontSize:'12.5px',
    borderRadius:'8px',overflowY:'auto',resize:'both',
    boxSizing:'border-box',paddingBottom:'10px',
    boxShadow:'0 3px 10px rgba(0,0,0,0.25)',display:'none'
  });

  const header=document.createElement('div');
  header.textContent="Brainly Moderation Panel";
  Object.assign(header.style,{
    background:c.header,color:'#fff',padding:'7px',cursor:'move',
    fontWeight:'600',borderTopLeftRadius:'8px',borderTopRightRadius:'8px',
    textAlign:'center',fontSize:'12.5px',userSelect:'none'
  });
  panel.appendChild(header);

  const content=document.createElement('div');
  content.style.padding="8px";
  content.innerHTML=`
    <input id="bm_user_link" type="text" placeholder="Kullanıcı profil linki (https://...)" />
    <label>Action Taken</label>
    <select id="bm_action">
     <option value="action_taken_moderators_24_hour_suspension">Kullanıcı 24 saat yasaklandı</option>
     <option value="action_taken_moderators_72_hour_suspension">Kullanıcı 72 saat yasaklandı</option>
      <option value="action_taken_moderators_banned_the_user" selected>Kullanıcı yasaklandı</option>
    </select>
    <label>Policy Violation</label>
    <select id="bm_policy">
       <option value="spam" selected>Meet Bağlantıları</option>
      <option value="ticari_spam">Ticari Spam</option>
      <option value="kufur">Küfür</option>
      <option value="benzerlik_spami">Benzerlik Spamı</option>
      <option value="zorbalik">Zorbalık</option>
      <option value="taciz">Taciz</option>
      <option value="terorist_icerik">Terörist İçerik</option>
      <option value="intihal">İntihal</option>
      <option value="nefret_soylemi">Nefret Söylemi</option>
      <option value="mustehcenlik">Müstehcenlik</option>
      <option value="other">Diğer</option>
    </select>
    <label>Market (optional)</label>
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

  // === CSS ===
  const style=document.createElement('style');
  style.textContent=`
    #bm_user_link,#bm_action,#bm_policy,#bm_market{
      width:100%;padding:6px;margin:5px 0 8px 0;box-sizing:border-box;
      border-radius:4px;font-size:12px;outline:none;
    }
    #bm_send,#bm_toggleTheme,#bm_syncToggle{
      width:100%;padding:7px;margin-top:5px;
      border:none;border-radius:5px;
      cursor:pointer;font-weight:bold;font-size:12.5px;
      transition:background 0.2s ease;
    }
    #bm_send:hover{opacity:0.9;}
    #bm_toggleTheme:hover,#bm_syncToggle:hover{filter:brightness(1.1);}
    #bm_status{margin-top:5px;font-family:monospace;font-size:11.5px;white-space:pre-wrap;}
  `;
  document.head.appendChild(style);

  // === Tema Uygula ===
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
      b.style.background=c.btnBg;
      b.style.border=`1px solid ${c.btnBorder}`;
      b.style.color=c.fg;
      b.disabled=false;
      b.style.pointerEvents='auto';
    });
  };

  const savePrefs=()=>{
    localStorage.setItem(PREF_KEY,JSON.stringify({
      isDarkMode,autoSync,panelWidth:panel.offsetWidth,panelHeight:panel.offsetHeight,
      panelX:panel.offsetLeft,panelY:panel.offsetTop
    }));
  };

  // === Tema Değiştir ===
  document.getElementById('bm_toggleTheme').addEventListener('click',()=>{
    isDarkMode=!isDarkMode;applyTheme();savePrefs();
  });
  document.getElementById('bm_syncToggle').addEventListener('click',()=>{
    autoSync=!autoSync;
    document.getElementById('bm_syncToggle').textContent=`🔁 Otomatik Senkron: ${autoSync?"Açık":"Kapalı"}`;
    savePrefs();
  });
  toggleBtn.addEventListener('click',()=>{
    panel.style.display=panel.style.display==="none"?"block":"none";
  });

  // === Sürükleme ===
  let dragging=false,offsetX=0,offsetY=0;
  header.addEventListener('mousedown',e=>{
    dragging=true;offsetX=e.clientX-panel.offsetLeft;offsetY=e.clientY-panel.offsetTop;
    header.style.cursor='grabbing';
  });
  document.addEventListener('mousemove',e=>{
    if(!dragging)return;
    panel.style.left=(e.clientX-offsetX)+'px';
    panel.style.top=(e.clientY-offsetY)+'px';
    panel.style.right='auto';
  });
  document.addEventListener('mouseup',()=>{
    if(dragging){dragging=false;header.style.cursor='move';savePrefs();}
  });

  // === Resize Kaydet ===
  new ResizeObserver(()=>savePrefs()).observe(panel);

  // === Gönder ===
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

  // === Sistem Temasıyla Senkronizasyon ===
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change',e=>{
    if(autoSync){isDarkMode=e.matches;applyTheme();savePrefs();}
  });

  applyTheme();
})();
