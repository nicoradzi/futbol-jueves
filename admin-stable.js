/* FÚTBOL DEL JUEVES · administración estable */
(function(){
  // Exponer el estado interno para que la UI de administración quede sincronizada.
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

  // La sesión puede aparecer unos instantes después de que cargue la página.
  sync();
  let tries=0;
  const timer=setInterval(()=>{
    sync();
    if(++tries>=30)clearInterval(timer);
  },250);

  // Después de un login exitoso, forzar inmediatamente la actualización visual.
  document.addEventListener('submit',()=>setTimeout(sync,150),true);
})();
