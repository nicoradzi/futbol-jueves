/* FÚTBOL DEL JUEVES · eliminación de jugadores */
(function(){
  function addDeleteButtons(){
    if(!window.__FDJ_STATE || !window.__FDJ_STATE.user)return;
    document.querySelectorAll('.player-card').forEach(function(card){
      if(card.querySelector('[data-delete-player]'))return;
      var edit=card.querySelector('.edit-player');
      if(!edit)return;
      var id=edit.getAttribute('data-id');
      var wrap=edit.parentElement;
      if(!wrap)return;
      var btn=document.createElement('button');
      btn.type='button';
      btn.setAttribute('data-delete-player',id);
      btn.textContent='Eliminar';
      btn.style.cssText='border:0;background:#fee2e2;color:#991b1b;border-radius:8px;padding:8px 10px;font-size:12px;font-weight:700;cursor:pointer;margin-left:6px';
      wrap.appendChild(btn);
    });
  }

  document.addEventListener('click',async function(e){
    var btn=e.target.closest('[data-delete-player]');
    if(!btn)return;
    e.preventDefault();
    e.stopPropagation();
    var st=window.__FDJ_STATE;
    var client=window.__FDJ_SB;
    if(!st || !st.user || !client){
      alert('Iniciá sesión como administrador primero.');
      return;
    }
    var id=btn.getAttribute('data-delete-player');
    var p=st.players.find(function(x){return String(x.id)===String(id)});
    if(!p)return;
    if(!window.confirm('¿Eliminar a '+p.name+' de la lista?\n\nSus partidos y estadísticas históricas se conservan.'))return;
    btn.disabled=true;
    btn.textContent='Eliminando…';
    try{
      var r=await client.from('players').update({active:false}).eq('id',id);
      if(r.error)throw r.error;
      if(typeof window.notify==='function')window.notify(p.name+' fue eliminado de la lista.');
      if(typeof window.loadAll==='function')await window.loadAll();
      else window.location.reload();
    }catch(err){
      btn.disabled=false;
      btn.textContent='Eliminar';
      if(typeof window.notify==='function')window.notify('No se pudo eliminar: '+(err.message||err),true);
      else alert('No se pudo eliminar: '+(err.message||err));
    }
  },true);

  var tries=0;
  var timer=setInterval(function(){
    addDeleteButtons();
    if(++tries>80)clearInterval(timer);
  },250);
  addDeleteButtons();
})();
