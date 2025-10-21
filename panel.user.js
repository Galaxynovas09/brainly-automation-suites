// ==UserScript==
// @name         Brainly Moderation Panel PLUS5 (Compact + High Contrast Dark Mode)
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  Küçük ekran uyumlu, yüksek kontrastlı koyu/açık tema ve senkronizasyon kontrolü desteklekli
// @match        *://*/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function(){
  'use strict';

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  let isDarkMode = prefersDark.matches;
  let autoSync = true;

  const getTheme = () => isDarkMode ? {
    bg: '#121212',
    fg: '#f1f1f1',
    border: '#2e7dff',
    accent: '#2e7dff',
    header: '#1976d2',
    inputBg: '#1e1e1e',
    inputBorder: '#3a3a3a'
  } : {
    bg: '#ffffff',
    fg: '#000000',
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
    padding:'6px 10px',backgroundColor:c.accent,
    color:'#fff',border:'none',borderRadius:'5px',
    cursor:'pointer',zIndex:9999999,fontWeight:'bold',
    fontSize:'14px',boxShadow:'0 2px 6px rgba(0,0,0,0.2)'
  });
  toggleBtn.textContent="📝 Brainly";
  document.body.appendChild(toggleBtn);

  // === Panel ===
  const panel=document.createElement('div');
  Object.assign(panel.style,{
    position:'fixed',top:'70px',right:'10px',
    width:'clamp(260px, 90%, 340px)',
    background:c.bg,color:c.fg,
    border:`1.8px solid ${c.border}`,
    zIndex:9999998,fontFamily:'Arial,sans-serif',fontSize:'13px',
    borderRadius:'8px',maxHeight:'80vh',overflowY:'auto',display:'none',
    boxShadow:'0 4px 12px rgba(0,0,0,0.25)',transition:'all 0.2s ease'
  });

  const header=document.createElement('div');
  header.textContent="Brainly Moderation Panel";
  Object.assign(header.style,{
    background:c.header,color:'#fff',padding:'8px',
    cursor:'move',fontWeight:'600',
    borderTopLeftRadius:'8px',borderTopRightRadius:'8px',
    textAlign:'center',fontSize:'13px'
  });
  panel.appendChild(header);

  const content=document.createElement('div');
  content.style.padding="8px 10px";
  content.innerHTML=`
    <input id="bm_user_link" type="text" placeholder="Kullanıcı profil linki (https://...)" style="width:100%;padding:6px;margin-bottom:8px;box-sizing:border-box;background:${c.inputBg};border:1px solid ${c.inputBorder};color:${c.fg};border-radius:4px;" />

    <label style="font-size:12px;">Action Taken</label>
    <select id="bm_action" style="width:100%;padding:6px;margin:6px 0 8px 0;box-sizing:border-box;background:${c.inputBg};border:1px solid ${c.inputBorder};color:${c.fg};border-radius:4px;">
      <option value="action_taken_moderators_24_hour_suspension">Suspended for 24 hours</option>
      <option value="action_taken_moderators_72_hour_suspension">Suspended for 72 hours</option>
      <option value="action_taken_moderators_banned_the_user" selected>User banned</option>
    </select>

    <label style="font-size:12px;">Policy Violation</label>
    <select id="bm_policy" style="width:100%;padding:6px;margin:6px 0 8px 0;box-sizing:border-box;background:${c.inputBg};border:1px solid ${c.inputBorder};color:${c.fg};border-radius:4px;">
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

    <label style="font-size:12px;">Market (optional)</label>
    <select id="bm_market" style="width:100%;padding:6px;margin:6px 0 10px 0;box-sizing:border-box;background:${c.inputBg};border:1px solid ${c.inputBorder};color:${c.fg};border-radius:4px;">
      <option value="turkey_clone" selected>Turkey</option>
      <option value="usa_clone">USA</option>
      <option value="brazil_clone">Brazil</option>
      <option value="poland_clone">Poland</option>
    </select>

    <button id="bm_send" style="width:100%;padding:8px;background:${c.accent};color:#fff;border:none;border-radius:5px;cursor:pointer;font-weight:bold;">Gönder</button>
    <div id="bm_status" style="margin-top:6px;font-family:monospace;white-space:pre-wrap;font-size:12px;"></div>
    <hr style="margin-top:10px;border:1px solid ${c.inputBorder};">
    <button id="bm_toggleTheme" style="width:100%;padding:6px;margin-bottom:6px;border:1px solid ${c.border};background:none;color:${c.fg};border-radius:5px;cursor:pointer;">🌓 Tema Değiştir</button>
    <button id="bm_syncToggle" style="width:100%;padding:6px;border:1px solid ${c.border};background:none;color:${c.fg};border-radius:5px;cursor:pointer;">🔁 Otomatik Senkron: Açık</button>
  `;
  panel.appendChild(content);
  document.body.appendChild(panel);

  // === Tema Güncelle ===
  const updateTheme=()=>{
    c=getTheme();
    panel.style.background=c.bg;
    panel.style.color=c.fg;
    panel.style.border=`1.8px solid ${c.border}`;
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

  document.getElementById('bm_toggleTheme').addEventListener('click',()=>{
    isDarkMode=!isDarkMode; updateTheme();
  });
  document.getElementById('bm_syncToggle').addEventListener('click',()=>{
    autoSync=!autoSync;
    document.getElementById('bm_syncToggle').textContent=`🔁 Otomatik Senkron: ${autoSync?"Açık":"Kapalı"}`;
  });

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

  // === Sistem Teması Dinle ===
  prefersDark.addEventListener('change',e=>{
    if(autoSync){isDarkMode=e.matches;updateTheme();}
  });

})();
