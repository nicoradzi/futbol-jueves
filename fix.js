/* FÚTBOL DEL JUEVES · ajuste del generador */
(function(){
  function fastGenerateTeams(){
    const confirmed=state.players.filter(p=>state.attendance.get(p.id));
    if(confirmed.length!==12){notify('Necesitás exactamente 12 confirmados.',true);return}
    let best=null;
    for(let it=0;it<3000;it++){
      const arr=[...confirmed];
      for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]]}
      const A=arr.slice(0,6),B=arr.slice(6);
      const c=teamCost(A,B);
      if(!best||c<best.c)best={A:[...A],B:[...B],c};
    }
    state.teams={
      A:best.A.map(p=>({player_id:p.id,team:'A',position:bestPosition(p,best.A)})),
      B:best.B.map(p=>({player_id:p.id,team:'B',position:bestPosition(p,best.B)}))
    };
    state.generated=true;
    renderTeams();
    if(state.user)saveTeams().catch(e=>notify(e.message,true));
    notify('Equipos armados.');
  }
  const btn=document.querySelector('#generateBtn');
  const shuffle=document.querySelector('#shuffleBtn');
  if(btn)btn.onclick=fastGenerateTeams;
  if(shuffle)shuffle.onclick=fastGenerateTeams;
})();
