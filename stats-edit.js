/* Editor visible para stats de jugadores */
(function(){
  function addEditButtons(){
    const grid=document.querySelector('#playersGrid');
    if(!grid) return;
    grid.querySelectorAll('.player-card').forEach(card=>{
      if(card.querySelector('.stats-edit-btn')) return;
      const pencil=card.querySelector('.edit-player');
      if(!pencil) return;
      const id=pencil.dataset.id;
      pencil.textContent='✎';
      pencil.title='Editar stats';
      pencil.setAttribute('aria-label','Editar stats del jugador');
      pencil.classList.add('stats-edit-btn');
      pencil.style.minWidth='42px';
      pencil.style.padding='8px 10px';
    });
  }
  const observer=new MutationObserver(addEditButtons);
  observer.observe(document.body,{childList:true,subtree:true});
  document.addEventListener('click',function(e){
    const btn=e.target.closest('.stats-edit-btn');
    if(!btn) return;
    e.preventDefault();
    if(typeof window.openPlayer==='function'){
      window.openPlayer(btn.dataset.id);
      const title=document.querySelector('#playerModalTitle');
      if(title) title.textContent='Editar stats del jugador';
    }
  });
  setTimeout(addEditButtons,300);
})();
