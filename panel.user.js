// ==UserScript==
// @name         Brainly Moderation Panel PLUS5 (Mini + Panel-only Dark Mode + Memory)
// @namespace    http://tampermonkey.net/
// @version      1.6
// @description  Sadece modeasyon için form paneli
// @match        *://*/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function(){
  'use strict';

  const PREF_KEY = "bm_panel_prefs_v2";

  // === Ayarları yükle / varsayılan oluştur ===
  const savedPrefs = JSON.parse(localStorage.getItem(PREF_KEY) || "{}");
  let isDarkMode = savedPrefs.isDarkMode ?? window.matchMedia('(prefers-color-scheme: dark)').matches;
  let autoSync = savedPrefs.autoSync ?? true;

  // === Tema renkleri (panel-only) ===
  const getTheme = () => isDarkMode ? {
    bg: '#181818',
    fg: '#f1f1f1',
    border: '#3f51b5',
    accent: '#2196f3',
    header: '#1976d2',
    inputBg: '#202020',
    inputBorder: '#333'
  } : {
    bg: '#ffffff',
    fg: '#111111',
    border: '#1976d2',
    accent: '#1976d2',
    header: '#1976d2',
    inputBg: '#fff',
    inputBorder: '#ccc'
  };
  let c = getTheme();

  // === Toggle Button ===
  const toggleBtn = document.createElement('button');
  Object.assign(toggleBtn.style,{
    position:'fixed',top:'14px',right:'14px',
    padding:'5px 9px',backgroundColor:c.accent,
    color:'#fff',border:'none',borderRadius:'5px',
    cursor:'pointer',zIndex:9999999,fontWeight:'bold',
    fontSize:'13px',boxShadow:'0 2px 6px rgba(0,0,0,0.2)'
  });
  toggleBtn.textContent="📝 Brainly";
  document.body.appendChild(toggleBtn);

  // === Panel ===
  const panel=document.createElement('div');
  Object.assign(panel.style,{
    position:'fixed',top:'70px',right:'10px',
    width:'clamp(240px, 90%, 300px)',
    background:c.bg,color:c.fg,
    border:`1.5px solid ${c.border}`,
    zIndex:9999998,fontFamily:'Arial,sans-serif',fontSize:'12.5px',
    borderRadius:'8px',maxHeight:'80vh',overflowY:'auto',display:'none',
    boxShadow:'0 3px 10px rgba(0,0,0,0.25)',transition:'all 0.2s ease'
  });

  const header=document.createElement('div');
  header.textContent="Brainly Moderation Panel";
  Object.assign(header.style,{
    background:c.header,color:'#fff',padding:'7px',
    cursor:'move',fontWeight:'600',
    borderTopLeftRadius:'8px',borderTopRightRadius:'8px',
    textAlign:'center',fontSize:'12.5px'
  });
  panel.appendChild(header);

  const content=document.createElement('div');
  content.style.padding="8px";
  content.innerHTML=`
    <input id="bm_user_link" type="text" placeholder="Kullanıcı profil linki (https://...)" style="width:100%;padding:5px;margin-bottom:7px;box-sizing:border-box;background:${c.inputBg};border:1px solid ${c.inputBorder};color:${c.fg};border-radius:4px;" />

    <label style="font-size:11px;">Action Taken</label>
    <select id="bm_action" style="width:100%;padding:5px;margin:5px 0 7px 0;box-sizing:border-box;background:${c.inputBg};border:1px solid ${c.inputBorder};color:${c.fg};border-radius:4px;">
      <option value="action_taken_moderators_24_hour_suspension">Suspended for 24 hours</option>
      <option value="action_taken_moderators_72_hour_suspension">Suspended for 72 hours</option>
      <option value="action_taken_moderators_banned_the_user" selected>User banned</option>
    </select>

    <label style="font-size:11px;">Policy Violation</label>
    <select id="bm_policy" style="width:100%;padding:5px;margin:5px 0 7px 0;box-sizing:border-box;background:${c.inputBg};border:1px solid ${c.inputBorder};color:${c.fg};border-radius:4px;">
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

    <label style="font-size:11px;">Market (optional)</label>
    <select id="bm_market" style="width:100%;padding:5px;margin:5px 0 8px 0;box-sizing:border-box;background:${c.inputBg};border:1px solid ${c.inputBorder};color:${c.fg};border-radius:4px;">
      <option value="turkey_clone" selected>Turkey</option>
      <option value="usa_clone">USA</option>
      <option value="brazil_clone">Brazil</option>
      <option value="poland_clone">Poland</option>
    </select>

    <button id="bm_send" style="width:100%;padding:7px;background:${c.accent};color:#fff;border:none;border-radius:5px;cursor:pointer;font-weight:bold;">Gönder</button>
    <div id="bm_status" style="margin-top:5px;font-family:monospace;white-space:pre-wrap;font-size:11.5px;"></div>
    <hr style="margin-top:8px;border:0;border-top:1px solid ${c.inputBorder};">
    <button id="bm_toggleTheme" style="width:100%;padding:5px;margin-bottom:5px;border:1px solid ${c.border};background:none;color:${c.fg};border-radius:5px;cursor:pointer;">🌓 Tema Değiştir</button>
    <button id="bm_syncToggle" style="width:100%;padding:5px;border:1px solid ${c.border};background:none;color:${c.fg};border-radius:5px;cursor:pointer;">🔁 Otomatik Senkron: ${autoSync ? "Açık" : "Kapalı"}</button>
  `;
  panel.appendChild(content);
  document.body.appendChild(panel);

  // === Tema Uygula ===
  const applyTheme = ()=>{
    c=getTheme();
    panel.style.background=c.bg;
    panel.style.color=c.fg;
    panel.style.border=`1.5px solid ${c.border}`;
    header.style.background=c.header;
    document.querySelectorAll('input,select').forEach(el=>{
      el.style.background=c.inputBg;
      el.style.border=`1px solid ${c.inputBorder}`;
      el.style.color=c.fg;
    });
    document.getElementById('bm_send').style.background=c.accent;
    document.getElementById('bm_toggleTheme').style.color=c.fg;
    document.getElementById('bm_syncToggle').style.color=c.fg;
  };

  const savePrefs = ()=> localStorage.setItem(PREF_KEY, JSON.stringify({isDarkMode, autoSync}));

  // === Tema Değiştir ===
  document.getElementById('bm_toggleTheme').addEventListener('click',()=>{
    isDarkMode=!isDarkMode;
    savePrefs(); applyTheme();
  });

  // === Senkron Kontrol ===
  document.getElementById('bm_syncToggle').addEventListener('click',()=>{
    autoSync=!autoSync;
    document.getElementById('bm_syncToggle').textContent=`🔁 Otomatik Senkron: ${autoSync?"Açık":"Kapalı"}`;
    savePrefs();
  });

  // === Aç/Kapat ===
  toggleBtn.addEventListener('click',()=>{panel.style.display=(panel.style.display==="none"?"block":"none");});

  // === Sürükleme ===
  let drag=false,dx=0,dy=0;
  header.addEventListener('mousedown',e=>{drag=true;dx=e.clientX-panel.offsetLeft;dy=e.clientY-panel.offsetTop;});
  document.addEventListener('mousemove',e=>{if(!drag)return;panel.style.left=(e.clientX-dx)+'px';panel.style.top=(e.clientY-dy)+'px';panel.style.right='auto';});
  document.addEventListener('mouseup',()=>{drag=false;});

  // === Gönder ===
  document.querySelector('#bm_send').addEventListener('click',()=>{
    const user=document.getElementById('bm_user_link').value.trim();
    if(!user){alert('Kullanıcı linkini gir.');return;}
    const base='https://brainly-trustandsafety.zendesk.com/hc/en-us/requests/new?ticket_form_id=9719157534610';
    const action=document.getElementById('bm_action').value;
    const market=document.getElementById('bm_market').value;
    const policy=document.getElementById('bm_policy').value;
    const params=`&bm_user=${encodeURIComponent(user)}&bm_action=${encodeURIComponent(action)}&bm_policy=${encodeURIComponent(policy)}&bm_market=${encodeURIComponent(market)}`;
    const w=window.open(base+params,'_blank');
    const status=document.getElementById('bm_status');
    if(!w){status.textContent='❌ Pop-up engellendi — tarayıcı izin verin.';return;}
    document.getElementById('bm_user_link').value='';
    status.textContent=`✅ Gönderildi: ${user}`;
  });

  // === Sistem temasına otomatik geçiş (panel-only) ===
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e=>{
    if(autoSync){isDarkMode=e.matches; savePrefs(); applyTheme();}
  });

  applyTheme();

})();
