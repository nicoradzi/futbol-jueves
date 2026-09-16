/* FÚTBOL DEL JUEVES · estado admin robusto */
(function(){
  const wait=(ms)=>new Promise(r=>setTimeout(r,ms));
  function apply(){
    const isAdmin=!!(window.state && state.user);
    document.querySelectorAll('.admin-only').forEach(el=>el.classList.toggle('hidden',!isAdmin));
    const label=document.querySelector('#adminUserLabel');
    if(label)label.textContent=isAdmin?(state.user.email||'Administrador'):'—';
  }
  function bindTabs(){
    document.querySelectorAll('.tab').forEach(btn=>{
      if(btn.dataset.adminFixBound==='1')return;
      btn.dataset.adminFixBound='1';
      btn.addEventListener('click',function(){
        document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(x=>x.classList.remove('active'));
        this.classList.add('active');
        const panel=document.querySelector('#tab-'+this.dataset.tab);
        if(panel)panel.classList.add('active');
      });
    });
  }
  function bindAdmin(){
    const b=document.querySelector('#adminBtn');
    if(b&&b.dataset.adminFixBound!=='1'){
      b.dataset.adminFixBound='1';
      b.addEventListener('click',()=>{
        if(window.state&&state.user){document.querySelector('#adminDrawer')?.classList.remove('hidden');}
        else document.querySelector('#loginModal')?.classList.remove('hidden');
      });
    }
  }
  async function monitor(){
    for(let i=0;i<20;i++){
      bindTabs();bindAdmin();apply();
      await wait(500);
    }
    setInterval(()=>{bindTabs();bindAdmin();apply()},1000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',monitor);else monitor();
})();
