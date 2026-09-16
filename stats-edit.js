/* Editor de stats de jugadores - independiente del modal principal */
(function(){
  let modal = null;
  let currentId = null;
  let saving = false;

  const cfg = window.APP_CONFIG || {};
  const client = (window.supabase && cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY)
    ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY)
    : null;

  function ensureModal(){
    if(modal) return modal;
    modal = document.createElement('div');
    modal.id = 'statsEditorModal';
    modal.className = 'modal hidden';
    modal.innerHTML = `
      <div class="modal-box">
        <button type="button" class="modal-close" id="statsEditorClose">×</button>
        <h2>Editar stats</h2>
        <p id="statsEditorPlayer" style="margin-top:-6px;color:#64748b"></p>
        <form id="statsEditorForm">
          <div class="form-grid">
            <label>Habilidad (1–5)<input id="statsSkill" type="number" min="1" max="5" step="1" required></label>
            <label>Stamina (1–5)<input id="statsStamina" type="number" min="1" max="5" step="1" required></label>
          </div>
          <label>Posición principal<select id="statsPos1" required>
            <option value="ARQ">ARQ</option><option value="DEF">DEF</option><option value="MED">MED</option><option value="DEL">DEL</option>
          </select></label>
          <label>Segunda posición<select id="statsPos2">
            <option value="">— Ninguna —</option><option value="ARQ">ARQ</option><option value="DEF">DEF</option><option value="MED">MED</option><option value="DEL">DEL</option>
          </select></label>
          <div id="statsEditorError" style="min-height:20px;color:#b91c1c;font-size:13px"></div>
          <button id="statsEditorSave" class="btn primary full" type="submit">Guardar cambios</button>
        </form>
      </div>`;
    document.body.appendChild(modal);

    document.getElementById('statsEditorClose').onclick = close;
    modal.addEventListener('click', e => { if(e.target === modal) close(); });
    document.getElementById('statsEditorForm').addEventListener('submit', save);
    return modal;
  }

  function close(){
    if(modal) modal.classList.add('hidden');
    currentId = null;
    saving = false;
  }

  async function open(id){
    if(!id) return;
    if(!client){ alert('No se pudo conectar con la base de datos.'); return; }
    const m = ensureModal();
    const error = document.getElementById('statsEditorError');
    error.textContent = '';
    document.getElementById('statsEditorPlayer').textContent = 'Cargando…';
    m.classList.remove('hidden');
    currentId = id;

    const { data, error: dbError } = await client.from('players').select('id,name,skill,stamina,position_1,position_2').eq('id',id).single();
    if(dbError){
      error.textContent = dbError.message || 'No se pudo cargar el jugador.';
      document.getElementById('statsEditorPlayer').textContent = '';
      return;
    }

    document.getElementById('statsEditorPlayer').textContent = data.name;
    document.getElementById('statsSkill').value = data.skill ?? 3;
    document.getElementById('statsStamina').value = data.stamina ?? 3;
    document.getElementById('statsPos1').value = data.position_1 || 'DEF';
    document.getElementById('statsPos2').value = data.position_2 || '';
  }

  async function save(e){
    e.preventDefault();
    if(saving || !currentId || !client) return;
    saving = true;
    const button = document.getElementById('statsEditorSave');
    const error = document.getElementById('statsEditorError');
    button.disabled = true;
    button.textContent = 'Guardando…';
    error.textContent = '';

    const skill = Number(document.getElementById('statsSkill').value);
    const stamina = Number(document.getElementById('statsStamina').value);
    const position_1 = document.getElementById('statsPos1').value;
    const position_2 = document.getElementById('statsPos2').value || null;

    if(!Number.isInteger(skill) || skill < 1 || skill > 5 || !Number.isInteger(stamina) || stamina < 1 || stamina > 5){
      error.textContent = 'Habilidad y stamina deben estar entre 1 y 5.';
      button.disabled = false;
      button.textContent = 'Guardar cambios';
      saving = false;
      return;
    }

    const { error: dbError } = await client.from('players').update({skill, stamina, position_1, position_2}).eq('id', currentId);
    if(dbError){
      error.textContent = dbError.message || 'No se pudieron guardar los cambios.';
      button.disabled = false;
      button.textContent = 'Guardar cambios';
      saving = false;
      return;
    }

    close();
    location.reload();
  }

  function enhance(){
    const grid = document.querySelector('#playersGrid');
    if(!grid) return;
    grid.querySelectorAll('.player-card').forEach(card => {
      const pencil = card.querySelector('.edit-player');
      if(!pencil) return;
      const id = pencil.dataset.id;
      if(!id) return;

      pencil.classList.add('stats-edit-btn');
      pencil.textContent = '✎';
      pencil.title = 'Editar stats';
      pencil.setAttribute('aria-label','Editar stats del jugador');
      pencil.style.cursor = 'pointer';
      pencil.style.minWidth = '42px';
      pencil.style.padding = '8px 10px';

      if(pencil.dataset.statsEditorBound === '1') return;
      pencil.dataset.statsEditorBound = '1';
      pencil.onclick = function(e){
        e.preventDefault();
        e.stopPropagation();
        open(id);
      };
    });
  }

  function start(){
    ensureModal();
    enhance();
    const grid = document.querySelector('#playersGrid');
    if(grid) new MutationObserver(enhance).observe(grid,{childList:true,subtree:true});
    setInterval(enhance,1000);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',start);
  else start();
})();
