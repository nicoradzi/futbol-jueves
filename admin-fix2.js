(function(){
  function sync(){
    const admin=!!window.__FDJ_ADMIN_USER;
    document.querySelectorAll('.admin-only').forEach(e=>e.classList.toggle('hidden',!admin));
    const label=document.querySelector('#adminUserLabel'); if(label)label.textContent=admin?(window.__FDJ_ADMIN_USER.email||'Administrador'):'—';
  }
  document.addEventListener('click',e=>{
    const tab=e.target.closest('.tab'); if(tab){document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));document.querySelectorAll('.tab-panel').forEach(x=>x.classList.remove('active'));tab.classList.add('active');document.querySelector('#tab-'+tab.dataset.tab)?.classList.add('active');}
  });
  setInterval(sync,300); sync();
})();
