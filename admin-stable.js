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
  }

  // Delegación de eventos: funciona aunque renderPlayers reconstruya las tarjetas.
  document.addEventListener('click', function(e){
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

  document.addEventListener('submit',()=>setTimeout(sync,150),true);
})();
