/* FÚTBOL DEL JUEVES · arranque seguro */
(function(){
  const wait=(ms)=>new Promise(r=>setTimeout(r,ms));
  const withTimeout=(promise,ms)=>Promise.race([
    promise,
    new Promise((_,reject)=>setTimeout(()=>reject(new Error('timeout')),ms))
  ]);

  async function emergencyBoot(){
    const overlay=document.querySelector('#loading');
    if(!overlay || overlay.classList.contains('hidden')) return;

    console.warn('Arranque de emergencia: la carga normal no terminó.');

    try{
      if(!window.supabase || !sb) throw new Error('Supabase no está disponible');

      const r=await withTimeout(
        sb.from('players').select('*').eq('active',true).order('name'),
        6000
      );
      if(r.error) throw r.error;

      state.players=r.data||[];
      state.attendance=new Map();
      state.teams={A:[],B:[]};
      state.generated=false;
      state.stats=state.players.map(p=>({
        player_id:p.id,pj:0,pg:0,pe:0,pp:0,winrate:0,mental:0
      }));
      state.currentMatch={
        id:null,
        match_date:nextThursday(),
        status:'OPEN',
        team_a_score:null,
        team_b_score:null
      };

      renderAll();
      loading(false);
      notify('La aplicación cargó los jugadores. La conexión con el partido se está recuperando.');
    }catch(e){
      console.error('Arranque de emergencia fallido:',e);
      loading(false);
      notify('La conexión con Supabase no está respondiendo. La página quedó liberada; probá Actualizar en unos segundos.',true);
    }
  }

  // La carga normal tiene 4 segundos para arrancar. Nunca dejamos la pantalla bloqueada.
  setTimeout(emergencyBoot,4000);
})();
