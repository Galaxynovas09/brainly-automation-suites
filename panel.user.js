// ==UserScript==
// @name         Brainly Moderation Panel PLUS4 (Global, Auto-Clear + Policy Type)
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Her sayfada taşınabilir panel
// @match        *://*/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function(){
    'use strict';

    const toggleBtn = document.createElement('button');
    Object.assign(toggleBtn.style, {
        position:'fixed', top:'20px', right:'20px',
        padding:'8px 12px', backgroundColor:'#1976d2',
        color:'#fff', border:'none', borderRadius:'6px',
        cursor:'pointer', zIndex:9999999, fontWeight:'bold'
    });
    toggleBtn.textContent = "📝 Brainly";
    document.body.appendChild(toggleBtn);

    const panel = document.createElement('div');
    Object.assign(panel.style, {
        position:'fixed', top:'70px', right:'20px', width:'380px',
        background:'#fff', border:'2px solid #1976d2', padding:'0',
        zIndex:9999998, fontFamily:'Arial,sans-serif', fontSize:'13px',
        borderRadius:'8px', maxHeight:'400px', overflowY:'auto', display:'none',
        boxShadow:'0 4px 12px rgba(0,0,0,0.15)'
    });

    const header = document.createElement('div');
    header.textContent = "Brainly Moderation Panel";
    Object.assign(header.style, {
        background:'#1976d2', color:'#fff', padding:'8px 10px',
        cursor:'move', fontWeight:'600',
        borderTopLeftRadius:'6px', borderTopRightRadius:'6px'
    });
    panel.appendChild(header);

    const content = document.createElement('div');
    content.style.padding = "10px";
    content.innerHTML = `
      <input id="bm_user_link" type="text" placeholder="Kullanıcı profil linki (https://...)"
        style="width:100%; padding:6px; margin-bottom:8px; box-sizing:border-box;" />

      <label style="font-size:12px">Action Taken</label>
      <select id="bm_action" style="width:100%; padding:6px; margin:6px 0 8px 0; box-sizing:border-box;">
        <option value="action_taken_moderators_24_hour_suspension">Suspended for 24 hours</option>
        <option value="action_taken_moderators_72_hour_suspension">Suspended for 72 hours</option>
        <option value="action_taken_moderators_banned_the_user" selected>User banned</option>
      </select>

      <label style="font-size:12px">Policy Violation</label>
      <select id="bm_policy" style="width:100%; padding:6px; margin:6px 0 8px 0; box-sizing:border-box;">
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

      <label style="font-size:12px">Market (optional)</label>
      <select id="bm_market" style="width:100%; padding:6px; margin:6px 0 10px 0; box-sizing:border-box;">
        <option value="turkey_clone" selected>Turkey</option>
        <option value="usa_clone">USA</option>
        <option value="brazil_clone">Brazil</option>
        <option value="poland_clone">Poland</option>
      </select>

      <button id="bm_send" style="width:100%; padding:10px; background:#1976d2; color:#fff; border:none; border-radius:5px; cursor:pointer; font-weight:bold;">Gönder</button>
      <div id="bm_status" style="margin-top:8px; font-family:monospace; white-space:pre-wrap; font-size:12px;"></div>
    `;
    panel.appendChild(content);
    document.body.appendChild(panel);

    toggleBtn.addEventListener('click', ()=> {
        panel.style.display = (panel.style.display === "none" ? "block" : "none");
    });

    let drag=false, dx=0, dy=0;
    header.addEventListener('mousedown', e=>{ drag=true; dx=e.clientX-panel.offsetLeft; dy=e.clientY-panel.offsetTop; document.body.style.userSelect='none'; });
    document.addEventListener('mousemove', e=>{ if(drag){ panel.style.left=(e.clientX-dx)+'px'; panel.style.top=(e.clientY-dy)+'px'; panel.style.right='auto'; }});
    document.addEventListener('mouseup', ()=>{ drag=false; document.body.style.userSelect='auto'; });

    document.querySelector('#bm_send').addEventListener('click', ()=>{
        const user = document.getElementById('bm_user_link').value.trim();
        const action = document.getElementById('bm_action').value;
        const market = document.getElementById('bm_market').value;
        const policy = document.getElementById('bm_policy').value;
        const status = document.getElementById('bm_status');

        if(!user){ alert('Kullanıcı linkini gir.'); return; }

        const base = 'https://brainly-trustandsafety.zendesk.com/hc/en-us/requests/new?ticket_form_id=9719157534610';
        const params = `&bm_user=${encodeURIComponent(user)}&bm_action=${encodeURIComponent(action)}&bm_policy=${encodeURIComponent(policy)}&bm_market=${encodeURIComponent(market)}`;
        const url = base + params;

        const w = window.open(url, '_blank');
        if(!w){
            status.textContent = '❌ Pop-up engellendi — tarayıcı izin verin.';
            return;
        }

        document.getElementById('bm_user_link').value = '';
        status.textContent = `✅ Gönderildi: ${user}\nYeni link girebilirsiniz.`;

        setTimeout(() => document.getElementById('bm_user_link').focus(), 300);
    });

})();
