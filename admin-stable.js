/* FÚTBOL DEL JUEVES · administración estable */
(function(){
  window.__FDJ_STATE = state;
  window.__FDJ_SB = sb;

  function sync(){
    const user = window.__FDJ_ADMIN_USER || state.user || null;
    if(user && (!state.user || state.user.id !== user.id)){
      state.user = user;
      adminUI();
      renderAll();
    }else if(!user && state.user){
      state.user = null;
      adminUI();
      renderAll();
    }else{
      adminUI();
    }
    decoratePlayers();
  }

  function decoratePlayers(){
    if(!state.user)return;
    document.querySelectorAll('.player-card').forEach(card=>{
      if(card.querySelector('.delete-player'))return;
      const edit=card.querySelector('.edit-player');
      if(!edit)return;
      const id=edit.dataset.id;
      const actions=document.createElement('div');
      actions.style.cssText='margin-left:auto;display:flex;gap:6px;align-items:center';
      edit.parentNode.insertBefore(actions,edit);
      actions.appendChild(edit);
      const del=document.createElement('button');
      del.type='button';
      del.className='delete-player';
      del.dataset.id=id;
      del.textContent='Eliminar';
      del.style.cssText='border:0;background:#fee2e2;color:#991b1b;border-radius:8px;padding:7px 9px;font-size:12px;font-weight:700;cursor:pointer';
      actions.appendChild(del);
    });
  }

  async function removePlayer(id){
    if(!state.user||!sb){notify('Iniciá sesión como administrador primero.',true);return}
    const p=state.players.find(x=>String(x.id)===String(id));
    if(!p)return;
    if(!confirm('¿Eliminar a '+p.name+' de la lista? Sus partidos históricos se conservan.'))return;
    try{
      const r=await sb.from('players').update({active:false}).eq('id',id);
      if(r.error)throw r.error;
      notify(p.name+' fue eliminado de la lista.');
      await loadAll();
    }catch(e){notify('No se pudo eliminar: '+(e.message||e),true)}
  }

  // Delegación de eventos: funciona aunque renderPlayers reconstruya las tarjetas.
  document.addEventListener('click', function(e){
    const del=e.target.closest('.delete-player');
    if(del){
      e.preventDefault();
      e.stopPropagation();
      removePlayer(del.dataset.id);
      return;
    }
    const edit = e.target.closest('.edit-player');
    if(edit){
      e.preventDefault();
      e.stopPropagation();
      if(state.user && typeof openPlayer === 'function') openPlayer(edit.dataset.id);
    }
  }, true);

  sync();
  let tries=0;
  const timer=setInterval(()=>{
    sync();
    if(++tries>=30)clearInterval(timer);
  },250);

  const grid=document.querySelector('#playersGrid');
  if(grid){
    new MutationObserver(()=>decoratePlayers()).observe(grid,{childList:true,subtree:true});
  }

  document.addEventListener('submit',()=>setTimeout(sync,150),true);
})();
