/* FÚTBOL DEL JUEVES · arranque seguro */
(function(){
  const withTimeout=(promise,ms)=>Promise.race([
    promise,
    new Promise((_,reject)=>setTimeout(()=>reject(new Error('timeout')),ms))
  ]);

  function unlock(){
    const overlay=document.querySelector('#loading');
    if(overlay)overlay.classList.add('hidden');
  }

  async function emergencyBoot(){
    const overlay=document.querySelector('#loading');
    if(!overlay || overlay.classList.contains('hidden')) return;

    try{
      if(!window.supabase || !sb) throw new Error('Supabase no está disponible');
      const r=await withTimeout(sb.from('players').select('*').eq('active',true).order('name'),5000);
      if(r.error)throw r.error;
      state.players=r.data||[];
      state.attendance=new Map();
      state.teams={A:[],B:[]};
      state.generated=false;
      state.stats=state.players.map(p=>({player_id:p.id,pj:0,pg:0,pe:0,pp:0,winrate:0,mental:0}));
      state.currentMatch={id:null,match_date:nextThursday(),status:'OPEN',team_a_score:null,team_b_score:null};
      renderAll();
      unlock();
      notify('Jugadores cargados. La conexión con la convocatoria se está recuperando.');
    }catch(e){
      console.error('Arranque de emergencia fallido:',e);
      unlock();
      notify('La base de datos está tardando en responder. La página quedó liberada; probá Actualizar en unos segundos.',true);
    }
  }

  // Primero liberamos la pantalla. Después intentamos recuperar los datos.
  setTimeout(unlock,1500);
  setTimeout(emergencyBoot,2200);
})();
