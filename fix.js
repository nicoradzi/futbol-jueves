/* FÚTBOL DEL JUEVES · correcciones de rendimiento y carga */
(function(){
  function fastGenerateTeams(){
    const confirmed=state.players.filter(p=>state.attendance.get(p.id));
    if(confirmed.length!==12){notify('Necesitás exactamente 12 confirmados.',true);return}
    let best=null;
    const first=confirmed[0],rest=confirmed.slice(1);
    for(let mask=0;mask<(1<<rest.length);mask++){
      if(bitCount(mask)!==5)continue;
      const A=[first],B=[];
      for(let i=0;i<rest.length;i++)(mask&(1<<i)?A:B).push(rest[i]);
      const c=teamCost(A,B);
      if(!best||c<best.c)best={A:[...A],B:[...B],c};
    }
    state.teams={A:best.A.map(p=>({player_id:p.id,team:'A',position:bestPosition(p,best.A)})),B:best.B.map(p=>({player_id:p.id,team:'B',position:bestPosition(p,best.B)}))};
    state.generated=true;renderTeams();
    if(state.user)saveTeams().catch(e=>notify(e.message,true));
    notify('Equipos armados.');
  }
  function bitCount(n){let c=0;while(n){n&=n-1;c++}return c}
  function bindGenerator(){
    const btn=document.querySelector('#generateBtn'),shuffle=document.querySelector('#shuffleBtn');
    if(btn)btn.onclick=fastGenerateTeams;
    if(shuffle)shuffle.onclick=fastGenerateTeams;
  }
  bindGenerator();
  // Si Supabase tarda demasiado, evitamos que el overlay quede pegado indefinidamente.
  setTimeout(()=>{
    const overlay=document.querySelector('#loading');
    if(overlay&&!overlay.classList.contains('hidden')){
      overlay.classList.add('hidden');
      notify('La conexión está tardando. Presioná ↻ Actualizar para reintentar.',true);
    }
  },12000);
})();
