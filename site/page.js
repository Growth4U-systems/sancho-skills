(function () {
  var root = document.querySelector('.sk');
  if (!root) return;
  var REPO = root.dataset.repo;
  var BASE = root.dataset.base;
  var GH = 'https://github.com/' + REPO;
  var AGENTS = [['claude-code', 'Claude Code'], ['codex', 'Codex'], ['cursor', 'Cursor'], ['gemini-cli', 'Gemini CLI'], ['opencode', 'OpenCode'], ['github-copilot', 'GitHub Copilot']];
  var list = document.getElementById('sk-list');
  var detail = document.getElementById('sk-detail');
  var state = { skills: [], area: '', agent: '', q: '' };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function getText(path) {
    return fetch(BASE + '/' + path, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error(path + ' devolvió ' + r.status);
      return r.text();
    });
  }
  function short(s, n) { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1).trim() + '…' : s; }
  function title(s) { return s.title || s.name; }
  function inline(s) { return esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '$1'); }
  function split(d) {
    var parts = String(d || '').split(/(?<=[.!?])\s+/);
    var lead = '';
    while (parts.length && lead.length < 140) lead += (lead ? ' ' : '') + parts.shift();
    return [lead, parts.join(' ')];
  }
  function agentLabel(s) { return s.agent ? 'Agente: ' + s.agent : 'Sin agente fijo'; }

  function renderFilters() {
    var areas = {};
    var agents = {};
    state.skills.forEach(function (s) { areas[s.area] = (areas[s.area] || 0) + 1; if (s.agent) agents[s.agent] = 1; });
    var chips = [['', 'Todas', state.skills.length]].concat(Object.keys(areas).sort().map(function (a) { return [a, a, areas[a]]; }));
    document.getElementById('sk-areas').innerHTML = chips.map(function (c) {
      return '<button type="button" class="sk-chip" data-area="' + esc(c[0]) + '" aria-pressed="' + (state.area === c[0]) + '">' + esc(c[1]) + '<small>' + c[2] + '</small></button>';
    }).join('');
    var sel = document.getElementById('sk-agent');
    sel.innerHTML = '<option value="">Todos</option>' + Object.keys(agents).sort().map(function (a) { return '<option>' + esc(a) + '</option>'; }).join('');
    sel.value = state.agent;
  }

  function card(s) {
    return '<a class="sk-card" href="#skill/' + esc(s.slug) + '">' +
      '<div class="sk-md" aria-hidden="true"><span>SKILL.md</span><span><b>name:</b> ' + esc(s.name) + '</span><span><b>version:</b> ' + esc(s.version || 'sin versión') + '</span></div>' +
      '<div class="sk-card-body"><h2>' + esc(title(s)) + '</h2><p>' + esc(short(s.description, 220)) + '</p>' +
      '<div class="sk-meta"><span class="sk-tag is-area">' + esc(s.area) + '</span><span class="sk-tag">' + esc(agentLabel(s)) + '</span>' +
      (s.evidence ? '<span class="sk-tag is-test">Prueba real</span>' : '') + '</div></div></a>';
  }

  function renderGrid() {
    var q = state.q.toLowerCase();
    var rows = state.skills.filter(function (s) {
      return (!state.area || s.area === state.area) && (!state.agent || s.agent === state.agent) &&
        (!q || (s.name + ' ' + s.description + ' ' + s.area + ' ' + (s.agent || '')).toLowerCase().indexOf(q) > -1);
    });
    document.getElementById('sk-count').textContent = rows.length === 1 ? '1 skill' : rows.length + ' skills';
    document.getElementById('sk-grid').innerHTML = rows.length ? rows.map(card).join('') : '<p class="sk-empty">Ninguna skill coincide con ese filtro.</p>';
  }

  function cmd(slug, agent) { return 'npx skills add ' + REPO + ' --skill ' + slug + ' -a ' + agent; }

  function fact(k, v) { return v ? '<div><dt>' + esc(k) + '</dt><dd>' + v + '</dd></div>' : ''; }

  function testBlock(s, ev) {
    var b = ev.before || {};
    var a = ev.after || {};
    var rows = (ev.checks || []).map(function (c) {
      return '<tr><td>' + esc(c.label) + '</td><td>' + esc(c.before) + '</td><td>' + esc(c.after) + '</td></tr>';
    }).join('');
    var files = (ev.files || []).map(function (f) {
      return '<li><a href="' + GH + '/blob/main/' + esc(s.evidence + '/' + f.path) + '" target="_blank" rel="noopener noreferrer">' + esc(f.label) + '</a></li>';
    }).join('');
    return '<section class="sk-block" aria-labelledby="sk-test-h"><h2 id="sk-test-h">Prueba real</h2><p>' + esc(ev.summary) + '</p>' +
      '<div class="sk-test"><dl class="sk-facts" style="border:0;padding:0">' +
      fact('Ejecutada', esc(ev.ranAt)) + fact('Entorno', esc(ev.runner)) + fact('Versión probada', '<code>' + esc(ev.skillCommit) + '</code>') +
      fact('Entrada', esc(ev.inputDescription)) +
      fact('Resultado', '<span class="' + (a.pass ? 'sk-ok' : 'sk-ko') + '">' + esc(ev.verdict) + '</span>') + '</dl>' +
      (rows ? '<table><thead><tr><th>' + esc(ev.checkLabel || 'Prueba') + '</th><th>' + esc((ev.columns || ['Antes'])[0]) + '</th><th>' + esc((ev.columns || [0, 'Después'])[1]) + '</th></tr></thead><tbody>' + rows + '</tbody></table>' : '') +
      (ev.limits && ev.limits.length ? '<p><strong>Límites de esta prueba</strong></p><ul>' + ev.limits.map(function (l) { return '<li>' + esc(l) + '</li>'; }).join('') + '</ul>' : '') +
      '<p style="margin:18px 0 8px"><strong>Evidencia</strong></p><ul class="sk-files">' + files + '</ul></div></section>';
  }

  function renderDetail(slug) {
    var s = state.skills.filter(function (x) { return x.slug === slug; })[0];
    if (!s) { detail.innerHTML = '<p class="sk-crumbs"><a href="#">← Todas las skills</a></p><p class="sk-error">No existe ninguna skill con ese nombre en el catálogo.</p>'; return; }
    var tools = s.sanchoTools.length ? s.sanchoTools.map(function (t) { return '<code>' + esc(t) + '</code>'; }).join(', ') : 'Ninguna';
    var ctx = s.contextRequired.length ? s.contextRequired.map(function (t) { return '<code>' + esc(t) + '</code>'; }).join('<br>') : 'Ninguno obligatorio';
    detail.innerHTML =
      '<p class="sk-crumbs"><a href="#">Skills</a> / ' + esc(s.area) + ' / ' + esc(title(s)) + '</p>' +
      '<div class="sk-head"><div>' +
      '<span class="sk-tag is-area">' + esc(s.area) + '</span>' +
      '<h1>' + esc(title(s)) + '</h1><p class="sk-desc">' + inline(split(s.description)[0]) + '</p>' +
      (split(s.description)[1] ? '<p class="sk-more">' + inline(split(s.description)[1]) + '</p>' : '') +
      '<div class="sk-actions"><button type="button" class="sk-btn" data-copy="prompt">Copiar orden de instalación</button>' +
      '<a class="sk-btn is-ghost" href="' + GH + '/releases/latest/download/' + esc(s.slug) + '.zip">Descargar ZIP</a>' +
      '<a class="sk-btn is-ghost" href="' + GH + '/tree/main/' + esc(s.source.path) + '" target="_blank" rel="noopener noreferrer">Ver en GitHub</a></div>' +
      '<div class="sk-install"><div class="sk-tabs" role="tablist" aria-label="Agente de destino">' +
      AGENTS.map(function (a, i) { return '<button type="button" role="tab" class="sk-tab" data-agent="' + a[0] + '" aria-selected="' + (i === 0) + '">' + a[1] + '</button>'; }).join('') +
      '</div><div class="sk-cmd"><code id="sk-cmd">' + esc(cmd(s.slug, 'claude-code')) + '</code><button type="button" data-copy="cmd">Copiar</button></div>' +
      '<p class="sk-note">Instala la skill en el proyecto actual. Añade <code>-g</code> para tenerla en todos.</p></div>' +
      '</div><dl class="sk-facts">' +
      fact('Agente en Sancho', esc(s.agent || 'Sin agente fijo')) +
      fact('Salida', esc(s.output)) +
      fact('Versión', esc(s.version || 'sin versión declarada')) +
      fact('Actualizada', esc(s.updated)) +
      fact('Commit de origen', '<code>' + esc(s.source.commit) + '</code>') +
      fact('Licencia', 'MIT') +
      fact('Archivos', s.files.length + ' (' + Math.round(s.bytes / 1024) + ' KB)') +
      fact('Contexto que necesita', ctx) +
      fact('Herramientas de Sancho', tools) +
      fact('Invocación', s.userInvocable ? 'La puede pedir una persona' : 'Solo la despacha otro agente') +
      '</dl></div>' +
      '<div id="sk-test-slot"></div>' +
      '<section class="sk-block" aria-labelledby="sk-files-h"><h2 id="sk-files-h">Archivos</h2><ul class="sk-files">' +
      s.files.map(function (f) { return '<li><a href="' + GH + '/blob/main/' + esc(s.source.path + '/' + f) + '" target="_blank" rel="noopener noreferrer">' + esc(f) + '</a></li>'; }).join('') + '</ul></section>' +
      '<section class="sk-block" aria-labelledby="sk-doc-h"><h2 id="sk-doc-h">SKILL.md</h2><div class="sk-doc" id="sk-doc"><p>Cargando…</p></div></section>';

    var tabs = detail.querySelectorAll('.sk-tab');
    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        tabs.forEach(function (x) { x.setAttribute('aria-selected', String(x === t)); });
        document.getElementById('sk-cmd').textContent = cmd(s.slug, t.dataset.agent);
      });
    });
    detail.querySelectorAll('[data-copy]').forEach(function (b) {
      b.addEventListener('click', function () {
        var text = b.dataset.copy === 'cmd' ? document.getElementById('sk-cmd').textContent
          : 'Instala la skill «' + s.name + '» de ' + GH + ' ejecutando: ' + document.getElementById('sk-cmd').textContent;
        var old = b.textContent;
        (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(function () { b.textContent = 'Copiado'; }, function () { b.textContent = 'No se pudo copiar'; });
        setTimeout(function () { b.textContent = old; }, 1800);
      });
    });

    if (s.evidence) {
      getText(s.evidence + '/summary.json').then(function (t) {
        document.getElementById('sk-test-slot').innerHTML = testBlock(s, JSON.parse(t));
      }).catch(function () {});
    }
    getText(s.source.path + '/SKILL.md').then(function (md) {
      var body = md.replace(/^---\n[\s\S]*?\n---\n?/, '');
      var html = window.marked && window.DOMPurify ? window.DOMPurify.sanitize(window.marked.parse(body)) : '<pre>' + esc(body) + '</pre>';
      document.getElementById('sk-doc').innerHTML = html;
    }).catch(function (e) {
      document.getElementById('sk-doc').innerHTML = '<p class="sk-error">No se pudo leer el SKILL.md: ' + esc(e.message) + '</p>';
    });
  }

  function route() {
    var m = location.hash.match(/^#skill\/([a-z0-9-]+)$/);
    list.hidden = !!m;
    detail.hidden = !m;
    if (m) { renderDetail(m[1]); window.scrollTo(0, 0); }
  }

  document.getElementById('sk-q').addEventListener('input', function (e) { state.q = e.target.value; renderGrid(); });
  document.getElementById('sk-agent').addEventListener('change', function (e) { state.agent = e.target.value; renderGrid(); });
  document.getElementById('sk-areas').addEventListener('click', function (e) {
    var b = e.target.closest('.sk-chip');
    if (!b) return;
    state.area = b.dataset.area;
    renderFilters();
    renderGrid();
  });
  window.addEventListener('hashchange', route);

  getText('catalog.json').then(function (t) {
    state.skills = JSON.parse(t).skills;
    renderFilters();
    renderGrid();
    route();
  }).catch(function (e) {
    document.getElementById('sk-count').innerHTML = '<span class="sk-error">No se pudo cargar el catálogo: ' + esc(e.message) + '</span>';
  });
})();
