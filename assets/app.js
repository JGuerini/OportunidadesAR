// assets/app.js — Logica principal de la aplicacion

// ══════════════════════════════════════════════
// SIDEBAR TOOLTIPS
// ══════════════════════════════════════════════
(function() {
  const tip = document.createElement('div');
  tip.className = 'sidebar-tooltip';
  document.body.appendChild(tip);

  function show(btn) {
    const text = btn.dataset.tooltip;
    if (!text) return;
    if (!btn.closest('.sidebar.collapsed')) { hide(); return; }
    tip.textContent = text;
    tip.classList.add('visible');
    const rect = btn.getBoundingClientRect();
    tip.style.left = (rect.right + 12) + 'px';
    tip.style.top = (rect.top + rect.height / 2) + 'px';
    tip.style.transform = 'translateY(-50%)';
  }

  function hide() {
    tip.classList.remove('visible');
  }

  document.addEventListener('mouseover', (e) => {
    const btn = e.target.closest('.nav-item[data-tooltip]');
    if (btn) show(btn);
  });
  document.addEventListener('mouseout', (e) => {
    const btn = e.target.closest('.nav-item[data-tooltip]');
    if (btn) hide();
  });
})();

// ══════════════════════════════════════════════
// CONSTANTES
// ══════════════════════════════════════════════
const PALETTE = [
  '#8a38fe','#93c5fd','#fde68a','#86efac','#fca5a5',
  '#fdba74','#e9d5ff','#a7f3d0','#cbd5e1','#f9a8d4',
  '#6ee7b7','#fcd34d','#a5b4fc','#67e8f9','#d9f99d',
  '#c4b5fd','#fb923c','#34d399','#f472b6','#60a5fa'
];

function colorForValue(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0;
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

// ══════════════════════════════════════════════
// TABLE ROW TOOLTIPS
// ══════════════════════════════════════════════
(function() {
  const tip = document.createElement('div');
  tip.className = 'row-tooltip';
  document.body.appendChild(tip);

  document.addEventListener('mouseover', (e) => {
    const cell = e.target.closest('[data-tip]');
    if (!cell) return;
    tip.textContent = cell.dataset.tip;
    tip.classList.add('visible');
    const rect = cell.getBoundingClientRect();
    const tipW = tip.offsetWidth;
    let left = rect.left + rect.width / 2 - tipW / 2;
    if (left < 8) left = 8;
    if (left + tipW > window.innerWidth - 8) left = window.innerWidth - tipW - 8;
    tip.style.left = left + 'px';
    tip.style.top = (rect.top - 8) + 'px';
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest('[data-tip]')) tip.classList.remove('visible');
  });
})();

// ══════════════════════════════════════════════
// PAGINATION
// ══════════════════════════════════════════════
const PER_PAGE = 20;

function paginate(rows, page) {
  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * PER_PAGE;
  const pageRows = rows.slice(start, start + PER_PAGE);
  return { rows: pageRows, current, totalPages, total, start: start + 1, end: Math.min(start + PER_PAGE, total) };
}

function renderPagination(containerId, state, onPageChange) {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (state.totalPages <= 1) { el.style.display = 'none'; return; }
  el.style.display = 'flex';

  const { current, totalPages, total, start, end } = state;
  let pages = [];

  // Always show first page
  pages.push(1);
  if (current > 3) pages.push('...');
  for (let i = Math.max(2, current - 1); i <= Math.min(totalPages - 1, current + 1); i++) pages.push(i);
  if (current < totalPages - 2) pages.push('...');
  if (totalPages > 1) pages.push(totalPages);

  const btns = pages.map(p => {
    if (p === '...') return '<span class="page-ellipsis">...</span>';
    return `<button class="page-btn${p === current ? ' active' : ''}" data-page="${p}">${p}</button>`;
  }).join('');

  el.innerHTML =
    `<div class="pagination-info">${start}–${end} de ${total}</div>` +
    `<div class="pagination-btns">` +
      `<button class="page-btn" data-page="prev" ${current === 1 ? 'disabled' : ''}>←</button>` +
      btns +
      `<button class="page-btn" data-page="next" ${current === totalPages ? 'disabled' : ''}>→</button>` +
    `</div>`;

  el.querySelectorAll('.page-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.dataset.page;
      if (btn.disabled || btn.classList.contains('active')) return;
      if (val === 'prev') onPageChange(current - 1);
      else if (val === 'next') onPageChange(current + 1);
      else onPageChange(parseInt(val));
    });
  });
}

// ══════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════
function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getGreeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'Buenos días';
  if (h >= 12 && h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

function updateGreeting() {
  const el = document.getElementById('heroGreeting');
  if (el) {
    const session = AUTH.getSession();
    const nombre = session ? session.nombre.split(' ')[0] : '';
    el.textContent = getGreeting() + (nombre ? ', ' + nombre : '');
  }
}

function toInputDate(val) {
  if (!val || val === '') return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(val)) {
    const [d, m, y] = val.split('/');
    return `${y}-${m}-${d}`;
  }
  try {
    const date = new Date(val);
    if (!isNaN(date.getTime())) return date.toISOString().slice(0, 10);
  } catch(e) {}
  return '';
}

function fmtFecha(val) {
  if (!val || val === '') return '—';
  const d = new Date(toInputDate(val) + 'T12:00:00');
  if (isNaN(d.getTime())) return val;
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function fmtEUR(n) {
  return '€' + Number(n || 0).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

// Unifica las 3 versiones anteriores (fmtFechaRelativa, NOTIF._timeAgo, timeAgo)
function timeAgo(dateStr) {
  if (!dateStr) return '';
  const now  = new Date();
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const diffMin  = Math.floor((now - date) / 60000);
  const diffHrs  = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHrs / 24);
  if (diffMin < 1) return 'hace un momento';
  if (diffMin < 60) return `hace ${diffMin} min`;
  if (diffHrs < 24) return `hace ${diffHrs}h`;
  if (diffDays === 1) return 'ayer';
  if (diffDays < 7) return `hace ${diffDays} días`;
  if (diffDays < 30) return `hace ${Math.floor(diffDays / 7)} sem`;
  return fmtFecha(dateStr);
}

function friendlyId(r) {
  return r.codigo || r.id.substring(0, 8);
}

function badgeEstado(e) {
  const exceptions = { 'Perdida': 'perdido', 'Ganada': 'ganado', 'No Go': 'nogo' };
  return e ? 'badge-' + (exceptions[e] || e.split(' ').pop().toLowerCase()) : '';
}

function getInitials(nombre) {
  return (nombre || '').split(' ').map(n => n[0]).slice(0, 2).join('');
}

function showLoading(loadingId, contentId) {
  const el = document.getElementById(loadingId);
  const ct = document.getElementById(contentId);
  if (el) el.style.display = 'flex';
  if (ct) ct.style.display = 'none';
}

function hideLoading(loadingId, contentId, display = 'block') {
  const el = document.getElementById(loadingId);
  const ct = document.getElementById(contentId);
  if (el) el.style.display = 'none';
  if (ct) ct.style.display = display;
}

function downloadBlob(data, filename, mimeType) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([data], { type: mimeType || 'application/octet-stream' }));
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

// ══════════════════════════════════════════════
// TOAST NOTIFICATIONS
// ══════════════════════════════════════════════
const TOAST = (() => {
  const ICONS = {
    success: '\u2713',
    error:   '\u2715',
    warning: '\u26A0',
    info:    '\u2139'
  };
  const DURATIONS = { success: 4000, error: 6000, warning: 5000, info: 4000 };
  const MAX_VISIBLE = 5;
  let _container = null;

  function _getContainer() {
    if (_container && document.body.contains(_container)) return _container;
    _container = document.createElement('div');
    _container.id = 'toastContainer';
    _container.className = 'toast-container';
    document.body.appendChild(_container);
    return _container;
  }

  function show(message, type = 'info', duration) {
    const dur = duration !== undefined ? duration : (DURATIONS[type] || 4000);
    const container = _getContainer();

    // Limitar cantidad visible
    const existing = container.querySelectorAll('.toast');
    if (existing.length >= MAX_VISIBLE) {
      dismiss(existing[0]);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML =
      '<span class="toast-icon">' + (ICONS[type] || ICONS.info) + '</span>' +
      '<span class="toast-msg">' + escapeHtml(message) + '</span>' +
      '<button class="toast-close">\u2715</button>';

    // Cerrar con boton
    toast.querySelector('.toast-close').addEventListener('click', () => dismiss(toast));

    container.appendChild(toast);

    // Trigger slide-in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => toast.classList.add('toast-visible'));
    });

    // Progress bar
    if (dur > 0) {
      const bar = document.createElement('div');
      bar.className = 'toast-progress';
      bar.style.animationDuration = dur + 'ms';
      toast.appendChild(bar);
      setTimeout(() => dismiss(toast), dur);
    }

    return toast;
  }

  function dismiss(toast) {
    if (!toast || !toast.parentElement || toast.classList.contains('toast-removing')) return;
    toast.classList.add('toast-removing');
    setTimeout(() => {
      if (toast.parentElement) toast.parentElement.removeChild(toast);
    }, 350);
  }

  function dismissAll() {
    const container = _getContainer();
    container.querySelectorAll('.toast').forEach(t => dismiss(t));
  }

  return {
    show,
    dismiss,
    dismissAll,
    success: (msg, dur) => show(msg, 'success', dur),
    error:   (msg, dur) => show(msg, 'error', dur),
    warning: (msg, dur) => show(msg, 'warning', dur),
    info:    (msg, dur) => show(msg, 'info', dur)
  };
})();

// ══════════════════════════════════════════════
// NAVIGATION
// ══════════════════════════════════════════════
const PAGE_TITLES = {
  home: 'Inicio', nueva: 'Nueva Oportunidad',
  mis: 'Mis Oportunidades', todas: 'Ver Todas', kanban: 'Kanban',
  calendario: 'Calendario', estadisticas: 'Estadísticas', perfil: 'Mi Perfil', log: 'Log de Eventos', usuarios: 'Administración'
};

function navigate(btn) {
  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
  btn.classList.add('active');
  const page = btn.dataset.page;
  document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  document.getElementById('pageTitle').textContent = PAGE_TITLES[page] || page;
  onPageEnter(page);
}

function onPageEnter(page, silent = false) {
  if      (page === 'home')         renderHome();
  else if (page === 'mis')          initMis(silent);
  else if (page === 'todas')        initTabla(silent);
  else if (page === 'kanban')       initKanban(silent);
  else if (page === 'calendario')   initCalendario(silent);
  else if (page === 'estadisticas') renderStats(silent);
  else if (page === 'perfil')       renderPerfil();
  else if (page === 'log')          initLog();
  else if (page === 'usuarios')     loadUsuarios();
}

// ══════════════════════════════════════════════
// NOTIFICATIONS
// ══════════════════════════════════════════════
const NOTIF = {
  _notifs: [],
  _open: false,

  init() {
    const session = AUTH.getSession();
    if (!session) return;
    CRM.onNotificacionesChange(session.uid, (notifs) => {
      this._notifs = notifs;
      this._render();
    });
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (this._open && !e.target.closest('#notifBellBtn') && !e.target.closest('#notifPanel')) {
        this.close();
      }
    });
  },

  toggle() {
    this._open ? this.close() : this.open();
  },

  open() {
    this._open = true;
    document.getElementById('notifPanel').style.display = 'block';
  },

  close() {
    this._open = false;
    document.getElementById('notifPanel').style.display = 'none';
  },

  _render() {
    const badge = document.getElementById('notifBadge');
    const count = this._notifs.length;
    if (count > 0) {
      badge.style.display = 'flex';
      badge.textContent = count > 9 ? '9+' : count;
    } else {
      badge.style.display = 'none';
    }
    const list = document.getElementById('notifList');
    const empty = document.getElementById('notifEmpty');
    if (count === 0) {
      list.innerHTML = '';
      empty.style.display = 'flex';
      return;
    }
    empty.style.display = 'none';
    const ICONS = { entrega_proxima: '\u23F0', sin_actualizar: '\u26A0', edicion_tercero: '\u270F', nueva_asignacion: '\u2795' };
    list.innerHTML = this._notifs.map(n => {
      const icon = ICONS[n.tipo] || '\uD83D\uDD14';
      const time = timeAgo(n.fecha);
      return `<div class="notif-item" onclick="NOTIF.clickNotif('${n.id}','${n.oppId}')">
        <div class="notif-icon ${escapeHtml(n.tipo)}">${icon}</div>
        <div class="notif-body">
          <div class="notif-title">${escapeHtml(n.titulo)}</div>
          <div class="notif-msg">${escapeHtml(n.mensaje)}</div>
          <div class="notif-time">${time}</div>
        </div>
      </div>`;
    }).join('');
  },

  async clickNotif(notifId, oppId) {
    await CRM.markNotificacionLeida(notifId);
    if (oppId) verOportunidad(oppId);
    this.close();
  },

  async markAllRead() {
    const ids = this._notifs.map(n => n.id);
    await CRM.markAllNotificacionesLeidas(ids);
    TOAST.success('Notificaciones marcadas como leídas.');
  }
};

// ══════════════════════════════════════════════
// STATUS CHECK
// ══════════════════════════════════════════════
async function checkConexion() {
  // Primero verificar conexion de red (no consume Firebase)
  if (!navigator.onLine) { setStatus('error'); return; }
  setStatus('sincronizando');
  try {
    await firebase.firestore().collection('oportunidades').limit(1).get();
    setStatus('conectado');
  } catch(e) { setStatus('error'); }
}

function setStatus(state) {
  const dot  = document.getElementById('statusDot');
  const text = document.getElementById('statusText');
  if (dot)  dot.className  = 'status-dot ' + state;
  if (text) text.textContent = { sincronizando: 'Sincronizando...', conectado: 'Conectado', error: 'Sin conexión' }[state] || '';
}

// ══════════════════════════════════════════════
// HOME
// ══════════════════════════════════════════════
async function renderHome() {
  updateGreeting();
  const rows = await CRM.getData();
  const activas = rows.filter(r => ['En Desarrollo', 'Pausa', 'Entregada'].includes(r.estado)).length;
  const enDes = rows.filter(r => r.estado === 'En Desarrollo').length;
  const entregadas = rows.filter(r => r.estado === 'Entregada').length;

  // Nuevas este mes: fechaInicio cae en el mes actual
  const ahora = new Date();
  const mesActual = ahora.getMonth();
  const anioActual = ahora.getFullYear();
  const nuevasMes = rows.filter(r => {
    if (!r.fechaInicio) return false;
    const f = new Date(r.fechaInicio + 'T12:00:00');
    return f.getMonth() === mesActual && f.getFullYear() === anioActual;
  }).length;

  const homeStats = document.getElementById('homeStats');
  if (homeStats) {
    homeStats.innerHTML = [
      { v: activas, l: 'Oportunidades activas' },
      { v: enDes, l: 'En Desarrollo' },
      { v: nuevasMes, l: 'Nuevas este mes' },
      { v: entregadas, l: 'Oportunidades entregadas' }
    ].map(s => `<div class="qs-card"><div class="qs-value">${s.v}</div><div class="qs-label">${s.l}</div></div>`).join('');
  }

  const counts = {};
  CRM.ESTADOS.forEach(e => counts[e] = 0);
  rows.forEach(r => { if (counts[r.estado] !== undefined) counts[r.estado]++; });

  const pipelineBar = document.getElementById('pipelineBar');
  if (pipelineBar) {
    pipelineBar.innerHTML = CRM.ESTADOS.map(e =>
      `<div class="pipeline-segment" style="flex:${counts[e] || 0.1};background:${CRM.ESTADO_COLORS[e]}"></div>`
    ).join('');
  }

  const etapaLegend = document.getElementById('etapaLegend');
  if (etapaLegend) {
    etapaLegend.innerHTML = CRM.ESTADOS.map(e =>
      `<div class="etapa-item"><div class="etapa-dot" style="background:${CRM.ESTADO_COLORS[e]}"></div>${escapeHtml(e)} (${counts[e]})</div>`
    ).join('');
  }

  // Oportunidades próximas a entregar: con fechaEntrega futura, excluyendo estados finales, ordenadas de más próxima a más lejana
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const ESTADOS_FINALES_HOME = ['Ganada', 'Perdida', 'No Go', 'Cancelada', 'Entregada'];
  const proximas = rows
    .filter(r => r.fechaEntrega && !ESTADOS_FINALES_HOME.includes(r.estado) && new Date(r.fechaEntrega + 'T23:59:59') >= hoy)
    .sort((a, b) => new Date(a.fechaEntrega) - new Date(b.fechaEntrega))
    .slice(0, 5);
  const recientesContent = document.getElementById('recientesContent');
  if (recientesContent) {
    recientesContent.innerHTML = proximas.length === 0
      ? '<div class="empty"><div class="empty-text">No hay entregas próximas</div></div>'
      : `<table><thead><tr><th>Cliente</th><th>Nombre</th><th>Entrega</th></tr></thead><tbody>${proximas.map(r => {
          const dias = Math.ceil((new Date(r.fechaEntrega) - hoy) / 86400000);
          const urgencia = dias <= 3 ? 'color:#ef4444;font-weight:700' : dias <= 7 ? 'color:#f59e0b;font-weight:600' : 'color:var(--text-muted)';
          return `<tr><td style="font-weight:600">${escapeHtml(r.cliente) || '—'}</td><td>${escapeHtml(r.nombre) || '—'}</td><td style="${urgencia}">${fmtFecha(r.fechaEntrega)}</td></tr>`;
        }).join('')}</tbody></table>
        <div style="display:flex;gap:12px;margin-top:10px;font-size:10px;color:var(--text-muted);font-weight:500;letter-spacing:0.02em">
          <span style="display:flex;align-items:center;gap:4px"><span style="width:6px;height:6px;border-radius:50%;background:#ef4444;flex-shrink:0"></span> 3 días o menos</span>
          <span style="display:flex;align-items:center;gap:4px"><span style="width:6px;height:6px;border-radius:50%;background:#f59e0b;flex-shrink:0"></span> 7 días o menos</span>
          <span style="display:flex;align-items:center;gap:4px"><span style="width:6px;height:6px;border-radius:50%;background:var(--text-muted);opacity:0.5;flex-shrink:0"></span> Más de 7 días</span>
        </div>`;
  }
}

// ══════════════════════════════════════════════
// FX (Conversión de divisas)
// ══════════════════════════════════════════════
const _fxRates = {};
const _fxCache = {};       // Cache por moneda: { ARS: { rate, ts }, USD: { rate, ts } }
const _FX_CACHE_TTL = 30 * 60 * 1000; // 30 minutos

// Obtiene tipo de cambio (reutilizable, sin depender del DOM)
async function getFXRate(currency) {
  if (!currency || currency === 'EUR') return 1;
  const cached = _fxCache[currency];
  if (cached && (Date.now() - cached.ts < _FX_CACHE_TTL)) return cached.rate;
  try {
    const res  = await fetch(`https://api.exchangerate-api.com/v4/latest/${currency}`);
    const data = await res.json();
    const rate = data.rates['EUR'];
    _fxCache[currency] = { rate, ts: Date.now() };
    return rate;
  } catch(e) {
    console.warn(`Error obteniendo FX para ${currency}:`, e);
    return null;
  }
}

// Parsea un número en formato argentino (1.234.567,89) o estándar (1234567.89)
// Soporta símbolo % al final (se ignora)
function parseLocalizedNumber(val) {
  if (val === undefined || val === null || val === '') return NaN;
  let s = String(val).trim();
  // Quitar símbolo % si el usuario lo escribió
  if (s.endsWith('%')) s = s.slice(0, -1).trim();
  if (s === '') return NaN;

  const dotCount   = (s.match(/\./g) || []).length;
  const commaCount = (s.match(/,/g) || []).length;

  // Sin separadores: número plano "1500000"
  if (dotCount === 0 && commaCount === 0) return Number(s);

  // Un solo punto sin comas: decimal estándar "1.5"
  if (dotCount === 1 && commaCount === 0) return Number(s);

  // Formato argentino (puntos=miles, coma=decimal):
  //   "1.500.000"      → 1500000
  //   "1.500.000,89"   → 1500000.89
  //   "1500,50"        → 1500.50
  if (dotCount > 1 || commaCount > 0) {
    return Number(s.replace(/\./g, '').replace(',', '.'));
  }

  // Fallback: formato US (comas=miles, punto=decimal)
  return Number(s.replace(/,/g, ''));
}

async function fetchFX(prefix) {
  const currency = document.getElementById(`${prefix}_currency`).value;
  if (!currency || currency === 'EUR') {
    _fxRates[prefix] = currency === 'EUR' ? 1 : null;
    document.getElementById(`${prefix}_tipoCambio`).value = currency === 'EUR' ? 1 : '';
    document.getElementById(`${prefix}_fxBadge`).style.display = 'none';
    calcFX(prefix);
    return;
  }

  const eurDisplay = document.getElementById(`${prefix}_tcvEurValue`);
  const eurContainer = eurDisplay ? eurDisplay.parentElement : null;
  eurDisplay.className = 'fx-loading';
  eurDisplay.textContent = 'Obteniendo tipo de cambio...';
  if (eurContainer) eurContainer.style.borderColor = 'var(--border)';
  document.getElementById(`${prefix}_fxBadge`).style.display = 'none';
  try {
    const rate = await getFXRate(currency);
    if (rate) {
      _fxRates[prefix] = rate;
      document.getElementById(`${prefix}_tipoCambio`).value = rate.toFixed(6);
      const badge = document.getElementById(`${prefix}_fxBadge`);
      badge.style.display = 'inline-flex';
      badge.textContent = `1 ${currency} = ${rate.toFixed(4)} EUR`;
      calcFX(prefix);
    } else {
      eurDisplay.textContent = 'Error al obtener tipo de cambio';
    }
  } catch(e) {
    eurDisplay.textContent = 'Error al obtener tipo de cambio';
  }
}

function calcFX(prefix) {
  const tcv      = parseLocalizedNumber(document.getElementById(`${prefix}_tcv`).value) || 0;
  const fx       = parseFloat(document.getElementById(`${prefix}_tipoCambio`).value) || _fxRates[prefix];
  const currency = document.getElementById(`${prefix}_currency`).value;
  const display  = document.getElementById(`${prefix}_tcvEurValue`);
  const eurContainer = display ? display.parentElement : null;
  if (!currency) { display.className = 'fx-loading'; display.textContent = 'Seleccioná moneda y TCV'; if (eurContainer) eurContainer.style.borderColor = 'var(--border)'; document.getElementById(`${prefix}_tcvEur`).value = ''; return; }
  if (!fx)       { display.className = 'fx-loading'; display.textContent = 'Obteniendo tipo de cambio...'; if (eurContainer) eurContainer.style.borderColor = 'var(--border)'; return; }
  if (!tcv)      { display.className = 'fx-loading'; display.textContent = 'Ingresá el TCV'; if (eurContainer) eurContainer.style.borderColor = 'var(--border)'; document.getElementById(`${prefix}_tcvEur`).value = ''; return; }
  const eur = tcv * fx;
  display.className = '';
  display.style.color = 'var(--text)';
  display.textContent = '€ ' + eur.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  document.getElementById(`${prefix}_tcvEur`).value = eur.toFixed(2);
  if (eurContainer) eurContainer.style.borderColor = 'var(--accent)';
}

// ══════════════════════════════════════════════
// NUEVA OPORTUNIDAD
// ══════════════════════════════════════════════
function collectFormData(prefix) {
  const v = id => document.getElementById(prefix + '_' + id).value;
  return {
    cliente:      v('cliente'),
    industria:    v('industria'),
    practica:     v('practica'),
    nombre:       v('nombre'),
    descripcion:  v('descripcion'),
    origen:       v('origen'),
    fertilizacion: document.getElementById(prefix + '_fertilizacion').checked,
    responsable:  v('responsable'),
    estado:       v('estado'),
    fechaInicio:  v('fechaInicio'),
    fechaEntrega: v('fechaEntrega'),
    notas:        v('notas'),
    sharepoint:   v('sharepoint'),
    tcv:          parseLocalizedNumber(v('tcv')) || 0,
    currency:     v('currency'),
    tcvEur:       v('tcvEur') || '0',
    tipoCambio:   v('tipoCambio') || '',
    probabilidad: parseLocalizedNumber(v('probabilidad')) || 0,
    pm:           parseLocalizedNumber(v('pm')) || 0
  };
}

async function handleNueva(e) {
  e.preventDefault();
  const btn = document.getElementById('n_submitBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-inline"></span>Guardando...';
  try {
    const data = collectFormData('n');
    const id = await CRM.addOportunidad(data);
    CRM.logEvento('creacion', 'Creó la oportunidad', id, '', document.getElementById('n_nombre').value);
    // Notify assignment
    CRM.getOportunidad(id).then(opp => {
      const session = AUTH.getSession();
      if (opp && session) CRM.notifyAsignacion(opp, session.uid);
    });
    TOAST.success('Oportunidad guardada exitosamente.');
    resetNueva();
  } catch(err) {
    TOAST.error('Error al guardar. Intentá de nuevo.');
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Guardar Oportunidad →';
  }
}

function resetNueva() {
  document.getElementById('nuevaForm').reset();
  const s = AUTH.getSession();
  if (s) document.getElementById('n_responsable').value = s.nombre;
  _fxRates['n'] = null;
  document.getElementById('n_tcvEurValue').className = 'fx-loading';
  document.getElementById('n_tcvEurValue').textContent = 'Seleccioná moneda y TCV';
  document.getElementById('n_fxBadge').style.display = 'none';
  document.getElementById('n_tcvEur').value = '';
}

// ══════════════════════════════════════════════
// EDITAR OPORTUNIDAD (MODAL)
// ══════════════════════════════════════════════

function findRowById(id) {
  return _tablaRows.find(x => x.id === id) || _kanbanRows.find(x => x.id === id) || _calRows.find(x => x.id === id) || _misRows.find(x => x.id === id) || null;
}

async function openEditModal(id) {
  let r = findRowById(id);
  if (!r) r = await CRM.getOportunidad(id);
  if (!r) return;
  const session = AUTH.getSession();
  if (session && session.perfil !== 'admin' && r.responsable !== session.nombre) {
    alert('Solo podés editar oportunidades que te pertenecen.');
    return;
  }
  document.getElementById('e_id').value = id;
  document.getElementById('editModalTitle').textContent = r.nombre;
  document.getElementById('e_cliente').value      = r.cliente || '';
  document.getElementById('e_industria').value    = r.industria || '';
  document.getElementById('e_practica').value     = r.practica || '';
  document.getElementById('e_nombre').value       = r.nombre || '';
  document.getElementById('e_descripcion').value  = r.descripcion || '';
  document.getElementById('e_origen').value       = r.origen || '';
  document.getElementById('e_fertilizacion').checked = !!r.fertilizacion;
  document.getElementById('e_responsable').value  = r.responsable || '';
  document.getElementById('e_estado').value       = r.estado || '';
  document.getElementById('e_fechaInicio').value  = toInputDate(r.fechaInicio);
  document.getElementById('e_fechaEntrega').value = toInputDate(r.fechaEntrega);
  document.getElementById('e_notas').value        = r.notas || '';
  document.getElementById('e_sharepoint').value   = r.sharepoint || '';
  document.getElementById('e_tcv').value          = r.tcv || '';
  document.getElementById('e_currency').value     = r.currency || '';
  document.getElementById('e_pm').value           = r.pm || '';
  document.getElementById('e_probabilidad').value = r.probabilidad || '';

  // Manejar tipoCambio y tcvEur: 0 significa "nunca calculado", no "cero"
  const savedRate = (r.tipoCambio && r.tipoCambio !== 0) ? parseFloat(r.tipoCambio) : null;
  const savedEur  = (r.tcvEur && r.tcvEur !== 0) ? parseFloat(r.tcvEur) : 0;
  document.getElementById('e_tipoCambio').value = savedRate ? savedRate.toFixed(6) : '';
  document.getElementById('e_tcvEur').value     = savedEur ? savedEur.toFixed(2) : '';
  _fxRates['e'] = savedRate;

  const tv = document.getElementById('e_tcvEurValue');
  const eurContainer = tv ? tv.parentElement : null;
  if (savedEur) {
    tv.className = '';
    tv.textContent = '€ ' + savedEur.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (eurContainer) eurContainer.style.borderColor = 'var(--accent)';
  } else {
    tv.className = 'fx-loading';
    tv.textContent = '—';
    if (eurContainer) eurContainer.style.borderColor = 'var(--border)';
  }

  const badge = document.getElementById('e_fxBadge');
  if (savedRate && r.currency) {
    badge.style.display = 'inline-flex';
    badge.textContent = `1 ${r.currency} = ${savedRate.toFixed(4)} EUR`;
  } else {
    badge.style.display = 'none';
  }

  document.getElementById('e_btnDelete').style.display = session && session.perfil === 'admin' ? '' : 'none';
  if (session && session.perfil !== 'admin') document.getElementById('e_responsable').readOnly = true;
  else document.getElementById('e_responsable').readOnly = false;

  document.getElementById('editModalOverlay').classList.add('open');

  // Si tiene currency pero no tiene tipo de cambio, buscarlo automáticamente
  if (r.currency && r.currency !== 'EUR' && !savedRate) {
    fetchFX('e');
  }
}

function closeEditModal(event) {
  if (event && event.target !== document.getElementById('editModalOverlay')) return;
  document.getElementById('editModalOverlay').classList.remove('open');
  _fxRates['e'] = null;
}

async function handleUpdate(e) {
  e.preventDefault();
  const id  = document.getElementById('e_id').value;
  const btn = document.getElementById('e_submitBtn');

  // Capturar estado viejo antes de actualizar
  const opp = findRowById(id) || {};
  const oldEstado = opp.estado || '';
  const newEstado = document.getElementById('e_estado').value;

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-inline"></span>Guardando...';
  try {
    await CRM.updateOportunidad(id, collectFormData('e'));

    // Log del evento
    if (oldEstado && newEstado && oldEstado !== newEstado) {
      CRM.logEvento('cambio_estado', `Cambio estado: ${oldEstado} → ${newEstado}`, id, opp.codigo, opp.nombre);
    } else {
      CRM.logEvento('edicion', 'Editó la oportunidad', id, opp.codigo, opp.nombre);
    }
    TOAST.success('Oportunidad actualizada correctamente.');
    closeEditModal();
    // Notify edit by third party
    const session = AUTH.getSession();
    if (opp && session && opp.responsableUid !== session.uid) {
      CRM.getOportunidad(id).then(updatedOpp => {
        if (updatedOpp) CRM.notifyEdicionTercero(updatedOpp, session.uid);
      });
    }
    CRM.invalidateCache();
    await refreshCurrentPage();
  } catch(err) {
    TOAST.error('Error al actualizar. Intentá de nuevo.');
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Guardar Cambios →';
  }
}

async function handleDelete() {
  const id   = document.getElementById('e_id').value;
  const name = document.getElementById('editModalTitle').textContent;
  const oppDel = findRowById(id) || {};
  if (!confirm(`¿Seguro que querés eliminar "${name}"?`)) return;
  try {
    await CRM.deleteOportunidad(id);
    CRM.logEvento('eliminacion', 'Eliminó la oportunidad', id, oppDel.codigo, oppDel.nombre);
    TOAST.success('Oportunidad eliminada.');
    closeEditModal();
    CRM.invalidateCache();
    await refreshCurrentPage();
  } catch(err) {
    TOAST.error('Error al eliminar.');
  }
}

async function refreshCurrentPage() {
  const activePage = document.querySelector('.nav-item.active');
  if (!activePage) return;
  const page = activePage.dataset.page;
  if (page === 'todas') await initTabla();
  else if (page === 'mis') await initMis();
  else if (page === 'kanban') await initKanban();
  else if (page === 'calendario') await initCalendario();
  else if (page === 'estadisticas') await renderStats();
  else if (page === 'home') await renderHome();
}

// ══════════════════════════════════════════════
// TODAS LAS OPORTUNIDADES
// ══════════════════════════════════════════════
let _tablaRows = [];
const _tablaSt = { page: 1, sortKey: 'fechaCreacion', sortDir: -1 };
let _bulkTodas = new Set();
let _misRows = [];
const _misSt = { page: 1, sortKey: 'fechaCreacion', sortDir: -1 };
let _bulkMis = new Set();

function isAdmin() { const s = AUTH.getSession(); return s && s.perfil === 'admin'; }

// ══════════════════════════════════════════════
// BULK OPERATIONS (generic factory)
// ══════════════════════════════════════════════
function createBulkManager({ set, getRows, barId, countId, checkHeadId, bodyId }) {
  function toggleAll() {
    const allIds = getRows().map(r => r.id);
    const allSelected = allIds.every(id => set.has(id));
    set.clear();
    if (!allSelected) allIds.forEach(id => set.add(id));
    updateUI();
  }
  function toggleRow(id) {
    if (set.has(id)) set.delete(id);
    else set.add(id);
    updateUI();
  }
  function updateUI() {
    const bar = document.getElementById(barId);
    const count = set.size;
    document.getElementById(countId).textContent = count;
    bar.style.display = count > 0 ? 'flex' : 'none';
    const headCb = document.querySelector(`#${checkHeadId} .bulk-cb`);
    if (headCb) {
      const allIds = getRows().map(r => r.id);
      headCb.classList.toggle('checked', allIds.length > 0 && allIds.every(id => set.has(id)));
    }
    document.querySelectorAll(`#${bodyId} tr`).forEach(tr => {
      const id = tr.dataset.id;
      const cb = tr.querySelector('.row-cb .bulk-cb');
      if (cb) cb.classList.toggle('checked', set.has(id));
      tr.classList.toggle('row-selected', set.has(id));
    });
  }
  function clear() { set.clear(); updateUI(); }
  async function deleteSelected() {
    if (set.size === 0) return;
    if (!confirm(`¿Seguro que querés eliminar ${set.size} oportunidad(es)?`)) return;
    let ok = 0, fail = 0;
    for (const id of set) {
      try {
        const r = findRowById(id) || {};
        await CRM.deleteOportunidad(id);
        CRM.logEvento('eliminacion', 'Eliminó la oportunidad (bulk)', id, r.codigo, r.nombre);
        ok++;
      } catch(e) { fail++; }
    }
    set.clear();
    CRM.invalidateCache();
    TOAST.success(`${ok} eliminada(s).${fail ? ` ${fail} error(es).` : ''}`);
    await refreshCurrentPage();
  }
  return { toggleAll, toggleRow, updateUI, clear, deleteSelected };
}

const bulkTodas = createBulkManager({
  set: _bulkTodas, getRows: () => _tablaRows,
  barId: 'todasBulkBar', countId: 'todasBulkCount',
  checkHeadId: 'todasCheckHead', bodyId: 'todasBody'
});

const bulkMis = createBulkManager({
  set: _bulkMis, getRows: () => _misRows,
  barId: 'misBulkBar', countId: 'misBulkCount',
  checkHeadId: 'misCheckHead', bodyId: 'misBody'
});

// Thin wrappers for HTML onclick handlers
function toggleBulkTodas()  { bulkTodas.toggleAll(); }
function toggleBulkRowTodas(id) { bulkTodas.toggleRow(id); }
function updateBulkTodasUI() { bulkTodas.updateUI(); }
function clearBulkTodas()   { bulkTodas.clear(); }
function bulkDeleteTodas()  { bulkTodas.deleteSelected(); }
function toggleBulkMis()    { bulkMis.toggleAll(); }
function toggleBulkRowMis(id) { bulkMis.toggleRow(id); }
function updateBulkMisUI()  { bulkMis.updateUI(); }
function clearBulkMis()     { bulkMis.clear(); }
function bulkDeleteMis()    { bulkMis.deleteSelected(); }

async function initTabla(silent = false) {
  if (!silent) showLoading('todasLoading', 'todasTable');
  _tablaRows = await CRM.getData();
  if (!silent) hideLoading('todasLoading', 'todasTable');

  // Show/hide bulk checkbox column for admin
  document.getElementById('todasCheckHead').style.display = isAdmin() ? '' : 'none';

  _bulkTodas.clear();

  // Populate responsables
  const resps = [...new Set(_tablaRows.map(r => r.responsable).filter(Boolean))].sort();
  const selR = document.getElementById('t_responsable');
  selR.innerHTML = '<option value="">Todos los responsables</option>';
  resps.forEach(r => selR.innerHTML += `<option>${escapeHtml(r)}</option>`);

  // Populate clientes
  const clientes = [...new Set(_tablaRows.map(r => r.cliente).filter(Boolean))].sort();
  const selC = document.getElementById('t_cliente');
  selC.innerHTML = '<option value="">Todos los clientes</option>';
  clientes.forEach(cl => selC.innerHTML += `<option>${escapeHtml(cl)}</option>`);

  // Populate industrias
  const industrias = [...new Set(_tablaRows.map(r => r.industria).filter(Boolean))].sort();
  const selI = document.getElementById('t_industria');
  selI.innerHTML = '<option value="">Todas las industrias</option>';
  industrias.forEach(i => selI.innerHTML += `<option>${escapeHtml(i)}</option>`);

  _tablaSt.page = 1;
  renderTabla();
}

// ── Fecha Dropdown (Ver Todas) ──
function toggleFechaDropdown() {
  const dd = document.getElementById('t_fechaDropdown');
  const btn = document.getElementById('t_fechaBtn');
  const isOpen = dd.classList.contains('open');
  // Close all other dropdowns first
  document.querySelectorAll('.fecha-dropdown.open').forEach(d => d.classList.remove('open'));
  document.querySelectorAll('.fecha-dropdown-btn.active').forEach(b => b.classList.remove('active'));
  if (!isOpen) {
    dd.classList.add('open');
    btn.classList.add('active');
  }
}

function onTablaFechaChange() {
  const fDesde = document.getElementById('t_fechaDesde').value;
  const fHasta = document.getElementById('t_fechaHasta').value;
  updateFechaLabel(fDesde, fHasta);
  renderTabla(1);
}

function updateFechaLabel(from, to) {
  const label = document.getElementById('t_fechaLabel');
  const btn = document.getElementById('t_fechaBtn');
  if (from && to) {
    label.textContent = from + '  →  ' + to;
    btn.classList.add('has-value');
  } else if (from) {
    label.textContent = 'Desde: ' + from;
    btn.classList.add('has-value');
  } else if (to) {
    label.textContent = 'Hasta: ' + to;
    btn.classList.add('has-value');
  } else {
    label.textContent = 'Fecha';
    btn.classList.remove('has-value');
  }
}

function clearTablaFecha() {
  document.getElementById('t_fechaDesde').value = '';
  document.getElementById('t_fechaHasta').value = '';
  updateFechaLabel('', '');
  renderTabla(1);
}

// Close dropdown on click outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.fecha-dropdown-wrap')) {
    document.querySelectorAll('.fecha-dropdown.open').forEach(d => d.classList.remove('open'));
    document.querySelectorAll('.fecha-dropdown-btn.active').forEach(b => b.classList.remove('active'));
  }
});

// ══════════════════════════════════════════════
// TABLE VIEW FACTORY (Ver Todas + Mis Oportunidades)
// ══════════════════════════════════════════════
function createTableView({ state, rows, filters, searchFields, ids, bulk, extraCol }) {
  function sort(key) {
    if (state.sortKey === key) state.sortDir *= -1;
    else { state.sortKey = key; state.sortDir = 1; }
    state.page = 1;
    render();
  }

  function render(page) {
    if (page !== undefined) state.page = page;
    const f = filters();
    const data = rows().filter(r => {
      if (f.estado && r.estado !== f.estado) return false;
      if (f.cliente && r.cliente !== f.cliente) return false;
      if (f.practica && r.practica !== f.practica) return false;
      if (f.responsable && r.responsable !== f.responsable) return false;
      if (f.industria && r.industria !== f.industria) return false;
      if (f.fechaDesde) {
        const from = new Date(f.fechaDesde + 'T00:00:00');
        if (!isNaN(from.getTime()) && new Date(r.fechaInicio) < from) return false;
      }
      if (f.fechaHasta) {
        const to = new Date(f.fechaHasta + 'T23:59:59');
        if (!isNaN(to.getTime()) && new Date(r.fechaInicio) > to) return false;
      }
      if (f.q) {
        const h = searchFields.map(k => r[k]).join(' ').toLowerCase();
        if (!h.includes(f.q)) return false;
      }
      return true;
    }).sort((a, b) => {
      let av = a[state.sortKey] || '', bv = b[state.sortKey] || '';
      if (!isNaN(parseFloat(av)) && !isNaN(parseFloat(bv)))
        return (parseFloat(av) - parseFloat(bv)) * state.sortDir;
      return String(av).localeCompare(String(bv)) * state.sortDir;
    });

    document.getElementById(ids.count).textContent =
      `${data.length} oportunidad${data.length !== 1 ? 'es' : ''}`;
    const body = document.getElementById(ids.body);
    const empty = document.getElementById(ids.empty);
    if (data.length === 0) {
      body.innerHTML = '';
      empty.style.display = 'block';
      document.getElementById(ids.pagination).style.display = 'none';
      return;
    }
    empty.style.display = 'none';

    const pg = paginate(data, state.page);
    const admin = isAdmin();
    body.innerHTML = pg.rows.map(r => {
      const checked = bulk.set.has(r.id);
      const notasTip = r.notas ? escapeHtml(r.notas) : '';
      const fechaEntregaTip = r.fechaEntrega ? fmtFecha(r.fechaEntrega) : '';
      const ec = extraCol ? extraCol(r) : '';
      return `
      <tr class="row-clickable ${checked ? 'row-selected' : ''}" data-id="${r.id}" onclick="verOportunidad('${r.id}')">
        ${admin ? `<td class="row-cb" onclick="event.stopPropagation()"><span class="bulk-cb ${checked ? 'checked' : ''}" onclick="event.stopPropagation();${bulk.toggleName}('${r.id}')"></span></td>` : ''}
        <td class="col-id">${escapeHtml(friendlyId(r))}</td>
        <td style="font-weight:600">${escapeHtml(r.cliente) || '—'}</td>
        <td style="max-width:260px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" ${notasTip ? 'data-tip="' + notasTip + '"' : ''}>${escapeHtml(r.nombre) || '—'}</td>
        ${ec}
        <td ${fechaEntregaTip ? 'data-tip="Entrega: ' + escapeHtml(fechaEntregaTip) + '"' : ''}><span class="badge ${badgeEstado(r.estado)}">${escapeHtml(r.estado) || '—'}</span></td>
      </tr>`;
    }).join('');
    bulk.updateUI();
    renderPagination(ids.pagination, pg, render);
  }

  return { sort, render };
}

// ── Instancia: Ver Todas ──
const tablaView = createTableView({
  state: _tablaSt,
  rows: () => _tablaRows,
  filters: () => ({
    q: document.getElementById('t_search').value.trim().toLowerCase(),
    estado: document.getElementById('t_estado').value,
    practica: document.getElementById('t_practica').value,
    responsable: document.getElementById('t_responsable').value,
    cliente: document.getElementById('t_cliente').value,
    industria: document.getElementById('t_industria').value,
    fechaDesde: document.getElementById('t_fechaDesde').value,
    fechaHasta: document.getElementById('t_fechaHasta').value,
  }),
  searchFields: ['codigo', 'cliente', 'nombre', 'responsable'],
  ids: { count: 'todasCount', body: 'todasBody', empty: 'todasEmpty', pagination: 'todasPagination' },
  bulk: { set: _bulkTodas, toggleName: 'toggleBulkRowTodas', updateUI: updateBulkTodasUI },
  extraCol: r => `<td style="color:var(--text-muted)">${escapeHtml(r.responsable) || '—'}</td>`
});

// ── Instancia: Mis Oportunidades ──
const misView = createTableView({
  state: _misSt,
  rows: () => _misRows,
  filters: () => ({
    q: document.getElementById('mis_search').value.trim().toLowerCase(),
    estado: document.getElementById('mis_estado').value,
  }),
  searchFields: ['codigo', 'cliente', 'nombre'],
  ids: { count: 'misCount', body: 'misBody', empty: 'misEmpty', pagination: 'misPagination' },
  bulk: { set: _bulkMis, toggleName: 'toggleBulkRowMis', updateUI: updateBulkMisUI }
});

// ── Wrappers para HTML onclick ──
function sortTabla(key)  { tablaView.sort(key); }
function renderTabla(p)  { tablaView.render(p); }
function sortMis(key)    { misView.sort(key); }
function renderMis(p)    { misView.render(p); }

async function verOportunidad(id) {
  let r = findRowById(id);
  if (!r) r = await CRM.getOportunidad(id);
  if (!r) return;

  document.getElementById('verModalId').textContent = friendlyId(r);
  document.getElementById('verModalTitle').textContent = r.nombre || '—';
  document.getElementById('verModalEditBtn').setAttribute('onclick', `closeVerModal(); openEditModal('${id}')`);

  const fmtVal = v => v || '—';
  const fmtEURv = v => v ? '€ ' + parseFloat(v).toLocaleString('es-AR', { minimumFractionDigits: 2 }) : '—';
  const fmtNum = v => v ? parseFloat(v).toLocaleString('es-AR') : '—';

  const sections = [
    {
      title: 'Información General',
      rows: [
        ['Cliente',       escapeHtml(r.cliente)],
        ['Industria',     escapeHtml(r.industria)],
        ['Práctica/Área', escapeHtml(r.practica)],
        ['Descripción',   escapeHtml(r.descripcion)],
        ['Origen',         escapeHtml(r.origen)],
        ['Fertilización',  r.fertilizacion ? 'Sí' : 'No'],
      ]
    },
    {
      title: 'BID',
      rows: [
        ['Responsable',      escapeHtml(r.responsable)],
        ['Estado',           `<span class="badge ${badgeEstado(r.estado)}">${escapeHtml(r.estado) || '—'}</span>`],
        ['Fecha de Inicio',  fmtFecha(r.fechaInicio)],
        ['Fecha de Entrega', fmtFecha(r.fechaEntrega)],
        ['Notas',            escapeHtml(r.notas)],
      ]
    },
    {
      title: 'Datos Comerciales',
      rows: [
        ['SharePoint',       r.sharepoint && !/^\s*javascript:/i.test(r.sharepoint) ? `<a href="${escapeHtml(r.sharepoint)}" target="_blank" rel="noopener" style="color:var(--accent);word-break:break-all">${escapeHtml(r.sharepoint)}</a>` : (r.sharepoint ? '<span style="color:var(--text-muted)">—</span>' : '—')],
        ['TCV',            fmtNum(r.tcv) + (r.currency ? ' ' + escapeHtml(r.currency) : '')],
        ['TCV EUR',        fmtEURv(r.tcvEur)],
        ['Tipo de Cambio', fmtVal(r.tipoCambio)],
        ['% Probabilidad', r.probabilidad ? r.probabilidad + '%' : '—'],
        ['% PM',           r.pm ? r.pm + '%' : '—'],
      ]
    },
  ];

  let html = sections.map(s => `
    <div style="margin-bottom:20px">
      <div style="font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--text-muted);margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid var(--border)">${s.title}</div>
      ${s.rows.filter(([, v]) => v && v !== '—').map(([label, val]) => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);font-size:13px">
          <span style="color:var(--text-muted);font-weight:500;flex-shrink:0;margin-right:16px">${label}</span>
          <span style="font-weight:600;text-align:right">${val}</span>
        </div>`).join('')}
    </div>`).join('');

  // Placeholder para el historial (se llena async)
  html += '<div id="verHistorialContainer" style="margin-bottom:20px"><div style="display:flex;align-items:center;gap:8px;padding:12px 0;color:var(--text-muted);font-size:12px"><span class="spinner" style="width:14px;height:14px;border-width:2px"></span>Cargando historial...</div></div>';

  document.getElementById('verModalContent').innerHTML = html;
  document.getElementById('verModalOverlay').classList.add('open');

  // Cargar historial de forma async
  try {
    const logs = await CRM.getLogByOppId(id);
    const container = document.getElementById('verHistorialContainer');
    if (!container) return;

    if (logs.length === 0) {
      container.innerHTML = `
        <div style="font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--text-muted);margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid var(--border)">Historial de Actividad</div>
        <div style="text-align:center;padding:16px 0;color:var(--text-muted);font-size:12px;font-style:italic">Sin registros de actividad</div>`;
      return;
    }

    const timelineHTML = logs.map((log, i) => {
      const cfg = ACCION_STYLES[log.accion] || ACCION_STYLES.edicion;
    const isLast = i === logs.length - 1;
    return `
        <div class="timeline-item">
          <div class="timeline-line${isLast ? ' timeline-line-last' : ''}"></div>
          <div class="timeline-dot" style="background:${cfg.color};box-shadow:0 0 0 3px color-mix(in srgb, ${cfg.color} 20%, transparent)"></div>
          <div class="timeline-content">
            <div class="timeline-header">
              <span class="timeline-badge" style="background:${cfg.color}">${cfg.icon} ${escapeHtml(cfg.label)}</span>
              <span class="timeline-date">${timeAgo(log.fecha)}</span>
            </div>
            <div class="timeline-detail">${escapeHtml(log.detalle)}</div>
            ${log.usuario ? `<div class="timeline-user">${escapeHtml(log.usuario)}</div>` : ''}
          </div>
        </div>`;
    }).join('');

    container.innerHTML = `
      <div style="font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--text-muted);margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid var(--border)">Historial de Actividad</div>
      <div class="timeline">${timelineHTML}</div>`;
  } catch(e) {
    const container = document.getElementById('verHistorialContainer');
    if (container) container.innerHTML = `
      <div style="font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--text-muted);margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid var(--border)">Historial de Actividad</div>
      <div style="text-align:center;padding:16px 0;color:#ef4444;font-size:12px;font-style:italic">Error al cargar el historial.</div>`;
    console.error('Error cargando historial:', e);
  }
}

function closeVerModal(event) {
  if (event && event.target !== document.getElementById('verModalOverlay')) return;
  document.getElementById('verModalOverlay').classList.remove('open');
}

async function downloadExcelAction() {
  const rows = await CRM.getData();
  CRM.downloadExcel(rows);
}

// ── BACKUP / RESTORE JSON ──
async function exportJSONBackupAction() {
  try {
    const result = await CRM.exportJSONBackup();
    const json = JSON.stringify(result, null, 2);
    downloadBlob(json, `backup_oportunidades_${new Date().toISOString().slice(0,10)}.json`, 'application/json');
    TOAST.success('Backup descargado correctamente.');
  } catch(e) {
    TOAST.error('Error al generar el backup.');
  }
}

async function importJSONBackupAction() {
  const file = document.getElementById('importJSONFile').files[0];
  if (!file) { TOAST.warning('Seleccioná un archivo JSON primero.'); return; }

  if (!confirm('Esto va a sobreescribir TODOS los datos actuales (oportunidades, log, usuarios, counter). Confirmar importacion?')) return;

  const btn = document.getElementById('importJSONBtn');
  const progressWrap = document.getElementById('importJSONProgress');
  const progressText = document.getElementById('importJSONProgressText');
  const progressCount = document.getElementById('importJSONProgressCount');
  const progressBar = document.getElementById('importJSONProgressBar');
  const result = document.getElementById('importJSONResult');

  btn.disabled = true;
  btn.textContent = 'Importando...';
  progressWrap.style.display = 'block';
  result.style.display = 'none';
  progressBar.style.width = '0%';

  try {
    const text = await file.text();
    const data = JSON.parse(text);
    const totals = await CRM.importJSONBackup(data, (step, current, total) => {
      progressText.textContent = `Importando ${step}...`;
      progressCount.textContent = `${current}/${total}`;
      const overallPct = Math.round(((step === 'Counter actualizado' ? 1 : 0) + current) / Math.max(1, total) * 100);
      progressBar.style.width = overallPct + '%';
    });

    progressBar.style.width = '100%';
    result.style.display = 'block';
    result.style.background = 'color-mix(in srgb, #22c55e 10%, transparent)';
    result.style.color = '#16a34a';
    result.innerHTML = `<strong>${totals.oportunidades}</strong> oportunidades, <strong>${totals.usuarios}</strong> usuarios y <strong>${totals.log_eventos}</strong> eventos importados correctamente.`;
    TOAST.success('Backup importado correctamente.');
    CRM.invalidateCache();
  } catch(e) {
    result.style.display = 'block';
    result.style.background = 'color-mix(in srgb, #ef4444 10%, transparent)';
    result.style.color = '#dc2626';
    result.textContent = e.message || 'Error al importar el backup.';
    TOAST.error(e.message || 'Error al importar.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Restaurar Backup';
  }
}

// ══════════════════════════════════════════════
// CALENDARIO
// ══════════════════════════════════════════════
let _calYear, _calMonth, _calRows = [];
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DIAS_SEMANA = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];

async function initCalendario(silent = false) {
  if (!silent) showLoading('calLoading', 'calContent');
  _calRows = await CRM.getData();
  if (!silent) hideLoading('calLoading', 'calContent');
  if (_calYear === undefined) {
    const now = new Date();
    _calYear = now.getFullYear();
    _calMonth = now.getMonth();
  }
  renderCalendario();
}

function calNavMonth(delta) {
  _calMonth += delta;
  if (_calMonth > 11) { _calMonth = 0; _calYear++; }
  if (_calMonth < 0)  { _calMonth = 11; _calYear--; }
  renderCalendario();
}

function calGoToday() {
  const now = new Date();
  _calYear = now.getFullYear();
  _calMonth = now.getMonth();
  renderCalendario();
}

function renderCalendario() {
  document.getElementById('calMonthLabel').textContent = `${MESES[_calMonth]} ${_calYear}`;

  const grid = document.getElementById('calGrid');
  const firstDay = new Date(_calYear, _calMonth, 1);
  const lastDay  = new Date(_calYear, _calMonth + 1, 0);
  const startDow = (firstDay.getDay() + 6) % 7; // Mon=0
  const daysInMonth = lastDay.getDate();

  // Build events map: key = "YYYY-MM-DD", value = [{row, type}]
  const events = {};
  _calRows.forEach(r => {
    if (r.fechaEntrega) {
      const d = toInputDate(r.fechaEntrega);
      if (d) {
        const key = d.substring(0, 10);
        if (!events[key]) events[key] = [];
        events[key].push({ row: r, type: 'entrega' });
      }
    }
    if (r.fechaInicio && r.fechaEntrega) {
      const d = toInputDate(r.fechaInicio);
      if (d) {
        const key = d.substring(0, 10);
        if (!events[key]) events[key] = [];
        events[key].push({ row: r, type: 'inicio' });
      }
    }
  });

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

  // Previous month trailing days
  const prevLast = new Date(_calYear, _calMonth, 0).getDate();
  let html = '<div class="cal-grid-header">' + DIAS_SEMANA.map(d => `<div class="cal-dow">${d}</div>`).join('') + '</div>';
  html += '<div class="cal-grid-body">';

  // Previous month padding
  for (let i = startDow - 1; i >= 0; i--) {
    html += `<div class="cal-day cal-day-other">${prevLast - i}</div>`;
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${_calYear}-${String(_calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const isToday = dateStr === todayStr;
    const dayEvents = events[dateStr] || [];

    html += `<div class="cal-day${isToday ? ' cal-day-today' : ''}">`;
    html += `<div class="cal-day-num">${d}</div>`;

    if (dayEvents.length > 0) {
      html += '<div class="cal-events">';
      dayEvents.slice(0, 3).forEach(ev => {
        const color = CRM.ESTADO_COLORS[ev.row.estado] || 'var(--text-muted)';
        if (ev.type === 'entrega') {
          html += `<div class="cal-event cal-event-entrega" style="border-left-color:${color}" onclick="verOportunidad('${ev.row.id}')" title="${escapeHtml(ev.row.nombre || '')} — ${escapeHtml(ev.row.cliente || '')}">
            <span class="cal-event-dot" style="background:${color}"></span>
            <span class="cal-event-text">${escapeHtml(ev.row.nombre) || '—'}</span>
          </div>`;
        } else {
          html += `<div class="cal-event cal-event-inicio" onclick="verOportunidad('${ev.row.id}')" title="Inicio: ${escapeHtml(ev.row.nombre || '')}">
            <span class="cal-event-text">${escapeHtml(ev.row.nombre) || '—'}</span>
          </div>`;
        }
      });
      if (dayEvents.length > 3) {
        html += `<div class="cal-event-more">+${dayEvents.length - 3} más</div>`;
      }
      html += '</div>';
    }
    html += '</div>';
  }

  // Next month padding
  const totalCells = startDow + daysInMonth;
  const remaining = (7 - (totalCells % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    html += `<div class="cal-day cal-day-other">${i}</div>`;
  }

  html += '</div>';
  grid.innerHTML = html;
}

// ══════════════════════════════════════════════
// MULTI-SELECT FILTERS (Estadísticas)
// ══════════════════════════════════════════════
const STATS_FILTER_LABELS = {
  estado: 'Estados',
  practica: 'Prácticas',
  responsable: 'Responsables',
  cliente: 'Clientes',
  industria: 'Industrias'
};
let _statsFilterState = {}; // { estado: Set, practica: Set, ... }
let _statsFilterKeys = {};

function initStatsFilters(rows) {
  const fields = ['estado', 'practica', 'responsable', 'cliente', 'industria'];
  const allValues = {};
  fields.forEach(f => { allValues[f] = [...new Set(rows.map(r => r[f]).filter(Boolean))].sort(); });

  if (CRM.ESTADOS) {
    allValues.estado = CRM.ESTADOS.filter(e => rows.some(r => r.estado === e));
  }

  const currentKeys = {};
  fields.forEach(f => { currentKeys[f] = allValues[f].join('|'); });
  const prevKeys = _statsFilterKeys || {};
  const changed = fields.some(f => currentKeys[f] !== prevKeys[f]);

  if (!changed && document.querySelector('.ms-option')) return;

  _statsFilterKeys = currentKeys;

  const prevState = {};
  fields.forEach(f => { if (_statsFilterState[f]) prevState[f] = new Set(_statsFilterState[f]); });

  fields.forEach(field => {
    const container = document.getElementById('sf_' + field);
    if (!container) return;
    const options = allValues[field];
    if (!options || options.length === 0) { container.style.display = 'none'; return; }
    container.style.display = '';

    _statsFilterState[field] = new Set(options);

    if (prevState[field]) {
      _statsFilterState[field] = new Set(options.filter(v => prevState[field].has(v)));
    }

    const label = STATS_FILTER_LABELS[field] || field;
    container.innerHTML = `
      <div class="ms-trigger" onclick="toggleMsPanel('${field}')">
        <span class="ms-trigger-label" id="ms_label_${field}">${label}</span>
        <span class="ms-arrow">&#9660;</span>
      </div>
      <div class="ms-panel" id="ms_panel_${field}">
        <div class="ms-all-row" onclick="toggleMsAll('${field}', event)">
          <input type="checkbox" id="ms_all_${field}" checked>
          <span>Todos</span>
        </div>
        ${options.map((v, i) => `
          <div class="ms-option" data-field="${field}" data-idx="${i}">
            <input type="checkbox" checked>
            <span class="ms-option-label">${escapeHtml(v)}</span>
          </div>
        `).join('')}
      </div>`;

    container.querySelectorAll('.ms-option').forEach(opt => {
      opt.addEventListener('click', function(e) {
        e.stopPropagation();
        const f = this.dataset.field;
        const cb = this.querySelector('input[type="checkbox"]');
        const val = this.querySelector('.ms-option-label').textContent;
        // If click was on the label (not checkbox), toggle manually
        if (e.target !== cb) cb.checked = !cb.checked;
        // Now cb.checked reflects the intended state in all cases
        if (cb.checked) {
          _statsFilterState[f].add(val);
        } else {
          _statsFilterState[f].delete(val);
        }
        const allBox = document.getElementById('ms_all_' + f);
        const allOpts = container.querySelectorAll('.ms-option input[type="checkbox"]');
        const checkedCount = container.querySelectorAll('.ms-option input[type="checkbox"]:checked').length;
        if (allBox) allBox.checked = checkedCount === allOpts.length;
        updateMsTrigger(f);
        renderStats(true);
      });
    });

    updateMsTrigger(field);
  });
}

function toggleMsPanel(field) {
  const panel = document.getElementById('ms_panel_' + field);
  const trigger = panel?.previousElementSibling;
  const isOpen = panel && panel.style.display === 'block';

  document.querySelectorAll('.ms-panel').forEach(p => { p.style.display = 'none'; });
  document.querySelectorAll('.ms-trigger').forEach(t => { t.classList.remove('open'); });

  if (!isOpen && panel) {
    panel.style.display = 'block';
    if (trigger) trigger.classList.add('open');
  }
}

function toggleMsAll(field, event) {
  event.stopPropagation();
  const container = document.getElementById('sf_' + field);
  if (!container) return;
  const checkboxes = container.querySelectorAll('.ms-option input[type="checkbox"]');
  const allBox = document.getElementById('ms_all_' + field);
  // If click was on the label "Todos" (not the checkbox), toggle manually
  if (event.target !== allBox) allBox.checked = !allBox.checked;
  // Now allBox.checked reflects the intended state
  const allChecked = allBox.checked;

  if (allChecked) {
    _statsFilterState[field] = new Set();
    container.querySelectorAll('.ms-option').forEach(opt => {
      const val = opt.querySelector('.ms-option-label').textContent;
      _statsFilterState[field].add(val);
      opt.querySelector('input[type="checkbox"]').checked = true;
    });
  } else {
    _statsFilterState[field] = new Set();
    checkboxes.forEach(cb => { cb.checked = false; });
  }

  updateMsTrigger(field);
  renderStats(true);
}

function updateMsTrigger(field) {
  const label = STATS_FILTER_LABELS[field] || field;
  const labelEl = document.getElementById('ms_label_' + field);
  const count = _statsFilterState[field]?.size || 0;
  const container = document.getElementById('sf_' + field);
  if (!labelEl || !container) return;

  const allOptions = container.querySelectorAll('.ms-option');
  const total = allOptions.length;

  if (count === 0) {
    labelEl.innerHTML = `<span style="color:var(--text-muted)">${label}</span>`;
  } else if (count === total) {
    labelEl.innerHTML = label;
  } else {
    labelEl.innerHTML = `${label} <span class="ms-trigger-count">${count}</span>`;
  }
}

function applyStatsFilters(rows) {
  return rows.filter(r => {
    const fields = ['estado', 'practica', 'responsable', 'cliente', 'industria'];
    for (const f of fields) {
      const allowed = _statsFilterState[f];
      if (!allowed) continue;
      if (allowed.size === 0) continue;
      if (r[f] && !allowed.has(r[f])) return false;
    }
    return true;
  });
}

function statsFiltersReset() {
  const fields = ['estado', 'practica', 'responsable', 'cliente', 'industria'];
  fields.forEach(field => {
    const container = document.getElementById('sf_' + field);
    if (!container) return;
    const newState = new Set();
    container.querySelectorAll('.ms-option').forEach(opt => {
      const val = opt.querySelector('.ms-option-label')?.textContent;
      if (val) newState.add(val);
      opt.querySelector('input[type="checkbox"]').checked = true;
    });
    _statsFilterState[field] = newState;
    const allBox = document.getElementById('ms_all_' + field);
    if (allBox) allBox.checked = true;
    updateMsTrigger(field);
  });
  renderStats(true);
}

document.addEventListener('click', function(e) {
  if (!e.target.closest('.ms-dropdown')) {
    document.querySelectorAll('.ms-panel').forEach(p => { p.style.display = 'none'; });
    document.querySelectorAll('.ms-trigger').forEach(t => { t.classList.remove('open'); });
  }
});

// ══════════════════════════════════════════════
// PERIOD FILTER (Estadísticas)
// ══════════════════════════════════════════════
let _statsPeriod = 'all';
let _statsRefDate = new Date();
let _statsCustomFrom = '';
let _statsCustomTo = '';

function setStatsPeriod(period) {
  _statsPeriod = period;
  if (period !== 'custom') _statsRefDate = new Date();
  updateStatsPeriodUI();
  renderStats(true);
}

function statsNavPrev() {
  const d = _statsRefDate;
  if (_statsPeriod === 'month')        _statsRefDate = new Date(d.getFullYear(), d.getMonth() - 1, 1);
  else if (_statsPeriod === 'quarter') _statsRefDate = new Date(d.getFullYear(), d.getMonth() - 3, 1);
  else if (_statsPeriod === 'year')    _statsRefDate = new Date(d.getFullYear() - 1, 0, 1);
  updateStatsPeriodUI();
  renderStats(true);
}

function statsNavNext() {
  const d = _statsRefDate;
  if (_statsPeriod === 'month')        _statsRefDate = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  else if (_statsPeriod === 'quarter') _statsRefDate = new Date(d.getFullYear(), d.getMonth() + 3, 1);
  else if (_statsPeriod === 'year')    _statsRefDate = new Date(d.getFullYear() + 1, 0, 1);
  updateStatsPeriodUI();
  renderStats(true);
}

function getStatsDateRange() {
  const d = _statsRefDate;
  if (_statsPeriod === 'month') {
    return { from: new Date(d.getFullYear(), d.getMonth(), 1), to: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59) };
  } else if (_statsPeriod === 'quarter') {
    const qm = Math.floor(d.getMonth() / 3) * 3;
    return { from: new Date(d.getFullYear(), qm, 1), to: new Date(d.getFullYear(), qm + 3, 0, 23, 59, 59) };
  } else if (_statsPeriod === 'year') {
    return { from: new Date(d.getFullYear(), 0, 1), to: new Date(d.getFullYear(), 11, 31, 23, 59, 59) };
  } else if (_statsPeriod === 'custom') {
    return {
      from: _statsCustomFrom ? new Date(_statsCustomFrom + 'T00:00:00') : null,
      to:   _statsCustomTo   ? new Date(_statsCustomTo + 'T23:59:59')   : null
    };
  }
  return { from: null, to: null };
}

function getStatsPeriodLabel() {
  const d = _statsRefDate;
  if (_statsPeriod === 'month')    return MESES[d.getMonth()] + ' ' + d.getFullYear();
  if (_statsPeriod === 'quarter')  return 'Q' + (Math.floor(d.getMonth() / 3) + 1) + ' ' + d.getFullYear();
  if (_statsPeriod === 'year')     return String(d.getFullYear());
  if (_statsPeriod === 'custom')   return (_statsCustomFrom || '...') + '  \u2192  ' + (_statsCustomTo || '...');
  return 'Todo el período';
}

function updateStatsPeriodUI() {
  const label = document.getElementById('statsPeriodLabel');
  if (label) label.textContent = getStatsPeriodLabel();
  document.querySelectorAll('#statsPeriodNav .period-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.period === _statsPeriod);
  });
  const customRow = document.getElementById('statsCustomRow');
  if (customRow) customRow.style.display = _statsPeriod === 'custom' ? 'flex' : 'none';
  const navBtns = document.querySelectorAll('#statsPeriodNav .btn-ghost');
  navBtns.forEach(b => b.style.visibility = _statsPeriod === 'all' ? 'hidden' : 'visible');
}

function onStatsCustomChange() {
  _statsCustomFrom = document.getElementById('statsCustomFrom').value;
  _statsCustomTo = document.getElementById('statsCustomTo').value;
  const label = document.getElementById('statsPeriodLabel');
  if (label) label.textContent = getStatsPeriodLabel();
  renderStats(true);
}

function filterByDateRange(rows, from, to) {
  // Si from y to son null (período "Todo"), mostrar todas sin filtrar
  if (!from && !to) return rows;
  return rows.filter(r => {
    if (!r.fechaInicio) return false;
    const d = new Date(r.fechaInicio);
    if (isNaN(d.getTime())) return false;
    if (from && d < from) return false;
    if (to && d > to) return false;
    return true;
  });
}

// ══════════════════════════════════════════════
// ESTADÍSTICAS
// ══════════════════════════════════════════════
let _statsCharts = {};

async function renderStats(silent = false) {
  // Actualizar UI del selector de período
  updateStatsPeriodUI();

  if (!silent) showLoading('statsLoading', 'statsContent');
  Object.values(_statsCharts).forEach(c => { try { c.destroy(); } catch(e) {} });
  _statsCharts = {};
  const allRows = await CRM.getData();
  if (!silent) hideLoading('statsLoading', 'statsContent');

  // Filtrar por período seleccionado
  const range = getStatsDateRange();
  const rows = filterByDateRange(allRows, range.from, range.to);

  // Inicializar filtros multi-select solo en render inicial (no en silent/onSnapshot)
  if (!silent) {
    initStatsFilters(allRows);
  }

  // Aplicar filtros multi-select
  const filteredRows = applyStatsFilters(rows);

  const totalTCV = filteredRows.reduce((s, r) => s + (parseFloat(r.tcvEur) || 0), 0);
  const probProm = filteredRows.length > 0 ? Math.round(filteredRows.reduce((s, r) => s + (parseFloat(r.probabilidad) || 0), 0) / filteredRows.length) : 0;
  const enDes = filteredRows.filter(r => r.estado === 'En Desarrollo').length;

  document.getElementById('statsKpis').innerHTML = [
    { v: filteredRows.length, l: 'Total Oportunidades' },
    { v: fmtEUR(totalTCV), l: 'TCV EUR Total' },
    { v: enDes, l: 'En Desarrollo' },
    { v: probProm + '%', l: 'Prob. Promedio' }
  ].map(k => `<div class="kpi"><div class="kpi-val">${k.v}</div><div class="kpi-lbl">${k.l}</div></div>`).join('');

  const estadoCounts = {}, estadoTCV = {};
  CRM.ESTADOS.forEach(e => { estadoCounts[e] = 0; estadoTCV[e] = 0; });
  filteredRows.forEach(r => {
    if (estadoCounts[r.estado] !== undefined) {
      estadoCounts[r.estado]++;
      estadoTCV[r.estado] += parseFloat(r.tcvEur) || 0;
    }
  });

  Chart.defaults.font.family = "'Montserrat', sans-serif";
  Chart.defaults.font.size = 11;
  Chart.defaults.color = '#888';

  _statsCharts.estado = new Chart(document.getElementById('chartEstado'), {
    type: 'doughnut',
    data: { labels: CRM.ESTADOS, datasets: [{ data: CRM.ESTADOS.map(e => estadoCounts[e]), backgroundColor: CRM.ESTADOS.map(e => CRM.ESTADO_COLORS[e]), borderWidth: 0 }] },
    options: { plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 14 } } }, cutout: '65%', maintainAspectRatio: false }
  });

  _statsCharts.tcv = new Chart(document.getElementById('chartTCV'), {
    type: 'bar',
    data: { labels: CRM.ESTADOS, datasets: [{ data: CRM.ESTADOS.map(e => estadoTCV[e]), backgroundColor: CRM.ESTADOS.map(e => CRM.ESTADO_COLORS[e]), borderRadius: 6, borderSkipped: false }] },
    options: { plugins: { legend: { display: false } }, scales: { y: { grid: { color: '#f0ede6' }, ticks: { callback: v => '€' + (v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v) } }, x: { grid: { display: false } } }, maintainAspectRatio: false }
  });

  const maxCount = Math.max(...CRM.ESTADOS.map(e => estadoCounts[e] || 0), 1);
  document.getElementById('funnelChart').innerHTML = CRM.ESTADOS.map(e =>
    `<div class="funnel-row"><div class="funnel-label">${e}</div><div class="funnel-track"><div class="funnel-fill" style="width:${Math.round((estadoCounts[e] || 0) / maxCount * 100)}%;background:${CRM.ESTADO_COLORS[e]}"></div></div><div class="funnel-count">${estadoCounts[e] || 0}</div></div>`
  ).join('');

  const origenC = {};
  filteredRows.forEach(r => { if (r.origen) origenC[r.origen] = (origenC[r.origen] || 0) + 1; });
  const origenK = Object.keys(origenC);
  _statsCharts.origen = new Chart(document.getElementById('chartOrigen'), {
    type: 'pie',
    data: { labels: origenK.length ? origenK : ['Sin datos'], datasets: [{ data: origenK.length ? origenK.map(k => origenC[k]) : [1], backgroundColor: PALETTE, borderWidth: 0 }] },
    options: { plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 12 } } }, maintainAspectRatio: false }
  });

  const respC = {};
  filteredRows.forEach(r => { if (r.responsable) respC[r.responsable] = (respC[r.responsable] || 0) + 1; });
  const respK = Object.keys(respC).sort((a, b) => respC[b] - respC[a]).slice(0, 8);
  _statsCharts.resp = new Chart(document.getElementById('chartResp'), {
    type: 'bar',
    data: { labels: respK.length ? respK : ['Sin datos'], datasets: [{ data: respK.length ? respK.map(k => respC[k]) : [0], backgroundColor: respK.length ? respK.map(k => colorForValue(k)) : ['#8a38fe'], borderRadius: 6, borderSkipped: false }] },
    options: { indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { grid: { color: '#f0ede6' }, ticks: { stepSize: 1 } }, y: { grid: { display: false } } }, maintainAspectRatio: false }
  });

  const pracC = {};
  filteredRows.forEach(r => { if (r.practica) pracC[r.practica] = (pracC[r.practica] || 0) + 1; });
  const pracK = Object.keys(pracC).sort((a, b) => pracC[b] - pracC[a]);
  _statsCharts.prac = new Chart(document.getElementById('chartPractica'), {
    type: 'bar',
    data: { labels: pracK.length ? pracK : ['Sin datos'], datasets: [{ data: pracK.length ? pracK.map(k => pracC[k]) : [0], backgroundColor: PALETTE, borderRadius: 6, borderSkipped: false }] },
    options: { indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { grid: { color: '#f0ede6' }, ticks: { stepSize: 1 } }, y: { grid: { display: false } } }, maintainAspectRatio: false }
  });

  const indC = {};
  filteredRows.forEach(r => { if (r.industria) indC[r.industria] = (indC[r.industria] || 0) + 1; });
  const indK = Object.keys(indC).sort((a, b) => indC[b] - indC[a]);
  _statsCharts.ind = new Chart(document.getElementById('chartIndustria'), {
    type: 'pie',
    data: { labels: indK.length ? indK : ['Sin datos'], datasets: [{ data: indK.length ? indK.map(k => indC[k]) : [1], backgroundColor: PALETTE, borderWidth: 0 }] },
    options: { plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 12 } } }, maintainAspectRatio: false }
  });
}

// ══════════════════════════════════════════════
// EXPORTAR ESTADÍSTICAS A PDF
// ══════════════════════════════════════════════
async function exportStatsPDF() {
  if (Object.keys(_statsCharts).length === 0) { TOAST.warning('No hay datos para exportar.'); return; }

  TOAST.info('Generando reporte...');

  try {
    // ── Extraer datos del DOM ──
    const period = getStatsPeriodLabel() || '—';
    const ds = new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });

    const kpis = [...document.querySelectorAll('#statsKpis .kpi')].map(el => ({
      value: el.querySelector('.kpi-val')?.textContent?.trim() || '',
      label: el.querySelector('.kpi-lbl')?.textContent?.trim() || ''
    }));

    const filters = [];
    ['estado','practica','responsable','cliente','industria'].forEach(f => {
      const allowed = _statsFilterState[f];
      const container = document.getElementById('sf_' + f);
      if (!container || !allowed) return;
      const total = container.querySelectorAll('.ms-option').length;
      if (allowed.size > 0 && allowed.size < total)
        filters.push({ label: STATS_FILTER_LABELS[f] || f, values: [...allowed] });
    });

    const funnel = [...document.querySelectorAll('#funnelChart .funnel-row')].map(r => ({
      label: r.querySelector('.funnel-label')?.textContent?.trim() || '',
      pct: parseFloat(r.querySelector('.funnel-fill')?.style.width || '0'),
      count: r.querySelector('.funnel-count')?.textContent?.trim() || '0',
      color: r.querySelector('.funnel-fill')?.style.backgroundColor || '#94a3b8'
    }));

    const ci = key => _statsCharts[key]?.toBase64Image('image/png', 1) || '';

    // ── Construir HTML del reporte ──
    const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>PRESALES AR - Reporte de Estadisticas</title>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
@page{size:A4;margin:0}
*{margin:0;padding:0;box-sizing:border-box;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;color-adjust:exact!important}
body{font-family:'Montserrat',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a2e;font-size:11px;line-height:1.5}
.page{width:210mm;height:297mm;padding:18mm;page-break-after:always;position:relative}
.page:last-child{page-break-after:avoid}
.hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:5mm;padding-bottom:3mm;border-bottom:2.5px solid #8a38fe}
.logo{font-size:20px;font-weight:800;color:#8a38fe}
.sub{font-size:12px;font-weight:500;color:#6b6b80;margin-left:12px}
.badge{background:#8a38fe;color:#fff;padding:4px 14px;border-radius:20px;font-size:10px;font-weight:600;letter-spacing:.5px}
.frow{display:flex;align-items:center;gap:6px;margin-bottom:5mm;flex-wrap:wrap}
.flbl{font-size:8.5px;font-weight:600;color:#6b6b80;text-transform:uppercase;letter-spacing:.8px}
.ftag{display:inline-flex;align-items:center;gap:3px;background:#f8f7fc;border:1px solid #e8e6f0;padding:2px 10px;border-radius:12px;font-size:9px}
.ftag b{color:#8a38fe;font-weight:600}
.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:5mm;margin-bottom:5mm}
.kpi{background:#fff;border:1.5px solid #e8e6f0;border-radius:10px;padding:6mm 4mm 5mm;text-align:center;position:relative;overflow:hidden;border-top:3px solid #8a38fe}
.kv{font-weight:800;color:#1a1a2e;line-height:1.1;margin-bottom:1.5mm;word-break:break-word}
.kl{font-size:9px;font-weight:500;color:#6b6b80;text-transform:uppercase;letter-spacing:.5px}
.fbox{background:#fff;border:1.5px solid #e8e6f0;border-radius:10px;padding:5mm}
.fbox h3{font-size:11px;font-weight:600;text-align:center;margin-bottom:3mm}
.fbars{display:flex;flex-direction:column;gap:2mm}
.fr{display:flex;align-items:center;gap:2.5mm}
.fl{width:30mm;font-size:8.5px;font-weight:500;text-align:right;flex-shrink:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ft{flex:1;height:11px;background:#f8f7fc;border-radius:6px;overflow:hidden}
.ff{height:100%;border-radius:6px}
.fc{width:8mm;font-size:9px;font-weight:600;color:#6b6b80}
.crow{display:grid;grid-template-columns:1fr 1fr;gap:5mm;margin-bottom:5mm}
.cb{background:#fff;border:1.5px solid #e8e6f0;border-radius:10px;padding:4mm}
.cb h3{font-size:10px;font-weight:600;text-align:center;margin-bottom:2mm}
.cb img,.cc img{width:100%;height:auto;display:block}
.cc{background:#fff;border:1.5px solid #e8e6f0;border-radius:10px;padding:4mm;display:flex;flex-direction:column;align-items:center}
.cc h3{font-size:10px;font-weight:600;text-align:center;margin-bottom:2mm}
.cc img{max-width:65%;height:auto}
.st{font-size:12px;font-weight:700;margin-bottom:4mm;padding-bottom:1.5mm;border-bottom:1px solid #e8e6f0}
.st span{color:#8a38fe}
.note{font-size:8px;color:#6b6b80;font-style:italic;margin-top:3mm}
.pf{position:absolute;bottom:12mm;left:18mm;right:18mm;display:flex;justify-content:space-between;border-top:1px solid #e8e6f0;padding-top:2mm}
.pf div{font-size:7.5px;color:#6b6b80}
@media screen{body{background:#e8e6f0}.page{margin:10mm auto;box-shadow:0 2px 20px rgba(0,0,0,.12);border-radius:4px}.btn-bar{position:fixed;top:10px;right:15px;z-index:999;display:flex;gap:8px}.btn-bar button{padding:8px 18px;font-family:'Montserrat',sans-serif;font-size:11px;font-weight:600;border-radius:8px;cursor:pointer;border:1.5px solid #ccc;background:#fff}.btn-bar .pri{background:#8a38fe;color:#fff;border-color:#8a38fe}.btn-bar .pri:hover{background:#7c22ce}.btn-bar .sec:hover{border-color:#555}}
@media print{.btn-bar{display:none!important}.page{box-shadow:none;margin:0;border-radius:0}*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;color-adjust:exact!important}}
</style>
</head>
<body>
<div class="btn-bar"><button class="sec" onclick="window.close()">\u2715 Cerrar</button><button class="pri" onclick="window.print()">\u2B07 Guardar PDF</button></div>

<div class="page">
  <div class="hdr"><div style="display:flex;align-items:baseline"><span class="logo">PRESALES AR</span><span class="sub">Reporte de Estadisticas</span></div><span class="badge">${escapeHtml(period)}</span></div>
  ${filters.length ? `<div class="frow"><span class="flbl">Filtros activos:</span>${filters.map(f => `<span class="ftag"><b>${escapeHtml(f.label)}:</b> ${escapeHtml(f.values.join(', '))}</span>`).join('')}</div>` : ''}
  <div class="kpis">${kpis.map(k => {const len=k.value.length;const fs=len>10?len>14?'16px':'19px':'26px';return `<div class="kpi"><div class="kv" style="font-size:${fs}">${escapeHtml(k.value)}</div><div class="kl">${escapeHtml(k.label)}</div></div>`;}).join('')}</div>
  <div class="fbox"><h3>Pipeline por Estado</h3><div class="fbars">${funnel.map(f => `<div class="fr"><div class="fl">${escapeHtml(f.label)}</div><div class="ft"><div class="ff" style="width:${f.pct}%;background:${f.color}"></div></div><div class="fc">${f.count}</div></div>`).join('')}</div></div>
  <div class="note">* Datos exportados el ${ds} con los filtros aplicados en ese momento.</div>
  <div class="pf"><div>PRESALES AR \u2014 Reporte de Estadisticas</div><div>1 / 3</div></div>
</div>

<div class="page">
  <div class="hdr"><div style="display:flex;align-items:baseline"><span class="logo">PRESALES AR</span><span class="sub">Reporte de Estadisticas</span></div><span class="badge">${escapeHtml(period)}</span></div>
  <div class="st"><span>01</span> \u2014 Distribucion y Valor por Estado</div>
  <div class="crow"><div class="cb"><h3>Distribucion por Estado</h3><img src="${ci('estado')}"/></div><div class="cb"><h3>TCV EUR por Estado</h3><img src="${ci('tcv')}"/></div></div>
  <div class="st"><span>02</span> \u2014 Origen de Oportunidades</div>
  <div class="cc"><img src="${ci('origen')}"/></div>
  <div class="pf"><div>PRESALES AR \u2014 Reporte de Estadisticas</div><div>2 / 3</div></div>
</div>

<div class="page">
  <div class="hdr"><div style="display:flex;align-items:baseline"><span class="logo">PRESALES AR</span><span class="sub">Reporte de Estadisticas</span></div><span class="badge">${escapeHtml(period)}</span></div>
  <div class="st"><span>03</span> \u2014 Por Responsable y Practica</div>
  <div class="crow"><div class="cb"><h3>Por Responsable</h3><img src="${ci('resp')}"/></div><div class="cb"><h3>Por Practica / Area</h3><img src="${ci('prac')}"/></div></div>
  <div class="st"><span>04</span> \u2014 Distribucion por Industria</div>
  <div class="cc"><img src="${ci('ind')}"/></div>
  <div class="pf"><div>PRESALES AR \u2014 Reporte de Estadisticas</div><div>3 / 3</div></div>
</div>

</body></html>`;

    // ── Abrir en nueva ventana ──
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const w = window.open(url, '_blank');
    if (!w) { TOAST.error('Permite las ventanas emergentes para exportar.'); URL.revokeObjectURL(url); return; }
    w.onload = () => setTimeout(() => w.print(), 800);
    TOAST.success('Reporte generado. Elegi "Guardar como PDF" en la ventana de impresion.');

  } catch (e) {
    console.error('PDF export error:', e);
    TOAST.error('Error al generar reporte: ' + e.message);
  }
}

// ══════════════════════════════════════════════
// PERFIL
// ══════════════════════════════════════════════
function renderPerfil() {
  const s = AUTH.getSession();
  if (!s) return;
  const perfBadge = s.perfil === 'admin' ? 'badge-admin' : 'badge-usuario';
  document.getElementById('perfilInfo').innerHTML =
    `<div style="display:flex;align-items:center;gap:16px;margin-bottom:24px">
      <div style="width:56px;height:56px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;color:#fff;flex-shrink:0">${escapeHtml(getInitials(s.nombre))}</div>
      <div><div style="font-size:16px;font-weight:700">${escapeHtml(s.nombre)}</div><div style="font-size:12px;color:var(--text-muted);margin-top:2px">${escapeHtml(s.email)}</div></div>
    </div>
    ${infoRow('Perfil', `<span class="badge ${perfBadge}">${escapeHtml(s.perfil)}</span>`)}
    ${infoRow('Estado', '<span class="badge badge-activa">Activo</span>')}`;
  updateThemeUI();
}

function infoRow(label, value) {
  return `<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border);font-size:13px"><span style="color:var(--text-muted);font-weight:500">${label}</span><span style="font-weight:600">${value}</span></div>`;
}

function updateThemeUI() {
  const isDark = THEME.getSavedTheme() === 'dark';
  const icon = document.getElementById('themeIcon');
  if (icon) {
    if (isDark) {
      icon.innerHTML = '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 18 18"><path d="M15.4 11.3A7 7 0 0 1 6.7 2.6a7 7 0 1 0 8.7 8.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    } else {
      icon.innerHTML = '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 18 18"><circle cx="9" cy="9" r="3.5"/><path d="M9 1v2M9 15v2M1 9h2M15 9h2M3.3 3.3l1.4 1.4M13.3 13.3l1.4 1.4M3.3 14.7l1.4-1.4M13.3 4.7l1.4-1.4" stroke-linecap="round"/></svg>';
    }
  }
}

function handleThemeToggle() {
  THEME.saveTheme(THEME.getSavedTheme() === 'dark' ? 'light' : 'dark');
  updateThemeUI();
}

async function handleChangePass(e) {
  e.preventDefault();
  const oldPass     = document.getElementById('p_oldPass').value;
  const newPass     = document.getElementById('p_newPass').value;
  const confirmPass = document.getElementById('p_confirmPass').value;
  const btn         = document.getElementById('p_btnChange');
  if (newPass !== confirmPass) { TOAST.error('Las contraseñas nuevas no coinciden.'); return; }
  if (newPass.length < 6)     { TOAST.error('La contraseña debe tener al menos 6 caracteres.'); return; }
  btn.disabled = true;
  btn.textContent = 'Guardando...';
  try {
    const result = await AUTH.changePassword(oldPass, newPass);
    if (result.ok) { TOAST.success('Contraseña actualizada correctamente.'); e.target.reset(); }
    else TOAST.error(result.error);
  } catch(err) {
    TOAST.error('Error de conexión.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Cambiar Contraseña';
  }
}

// ══════════════════════════════════════════════
// USUARIOS
// ══════════════════════════════════════════════
let _allUsers = [];

async function loadUsuarios() {
  document.getElementById('usuariosLoading').style.display = 'flex';
  document.getElementById('usuariosTable').style.display = 'none';
  _allUsers = await AUTH.getAllUsers();
  document.getElementById('usuariosLoading').style.display = 'none';
  document.getElementById('usuariosTable').style.display = 'block';
  document.getElementById('usuariosBody').innerHTML = _allUsers.map(u => `
    <tr>
      <td style="font-weight:600">${escapeHtml(u.nombre)}</td>
      <td style="color:var(--text-muted);font-size:12px">${escapeHtml(u.email)}</td>
      <td><span class="badge ${u.perfil === 'admin' ? 'badge-admin' : 'badge-usuario'}">${escapeHtml(u.perfil)}</span></td>
      <td><span class="badge ${u.activo ? 'badge-activa' : 'badge-cerrada'}">${u.activo ? 'Activo' : 'Inactivo'}</span></td>
      <td style="text-align:center"><button class="btn-sm" onclick="openUserModal('edit','${u.uid}')">Editar</button></td>
    </tr>`).join('');
}

function openUserModal(mode, uid) {
  document.getElementById('um_mode').value = mode;
  document.getElementById('userModalAlert').className = 'alert';
  document.getElementById('userModalForm').reset();
  if (mode === 'new') {
    document.getElementById('userModalTitle').textContent = 'Nuevo Usuario';
    document.getElementById('userModalSub').textContent = 'Completá los datos del nuevo usuario.';
    document.getElementById('um_btn').textContent = 'Crear Usuario';
    document.getElementById('um_passGroup').style.display = 'block';
    document.getElementById('um_passResetGroup').style.display = 'none';
    document.getElementById('um_pass').required = true;
  } else {
    const u = _allUsers.find(x => x.uid === uid);
    if (!u) return;
    document.getElementById('userModalTitle').textContent = 'Editar Usuario';
    document.getElementById('userModalSub').textContent = `Modificando: ${u.nombre}`;
    document.getElementById('um_usuarioOriginal').value = uid;
    document.getElementById('um_nombre').value = u.nombre;
    document.getElementById('um_email').value = u.email;
    document.getElementById('um_perfil').value = u.perfil;
    document.getElementById('um_activo').value = u.activo ? 'SI' : 'NO';
    document.getElementById('um_passGroup').style.display = 'none';
    document.getElementById('um_passResetGroup').style.display = 'block';
    document.getElementById('um_pass').required = false;
  }
  document.getElementById('userModalOverlay').classList.add('open');
}

function closeUserModal() {
  document.getElementById('userModalOverlay').classList.remove('open');
}

async function handleUserModalSubmit(e) {
  e.preventDefault();
  const mode = document.getElementById('um_mode').value;
  const btn  = document.getElementById('um_btn');
  btn.disabled = true;
  btn.textContent = 'Guardando...';
  try {
    if (mode === 'new') {
      const pass = document.getElementById('um_pass').value;
      if (pass.length < 6) { showModalAlert('La contraseña debe tener al menos 6 caracteres.'); btn.disabled = false; btn.textContent = 'Crear Usuario'; return; }
      const result = await AUTH.addUser({
        nombre:     document.getElementById('um_nombre').value,
        usuario:    document.getElementById('um_email').value.split('@')[0],
        email:      document.getElementById('um_email').value,
        contrasena: pass,
        perfil:     document.getElementById('um_perfil').value,
        activo:     document.getElementById('um_activo').value === 'SI'
      });
      if (result.ok) {
        CRM.logEvento('creacion_usuario', `Creó el usuario: ${document.getElementById('um_nombre').value} (${document.getElementById('um_email').value})`);
        TOAST.success('Usuario creado correctamente.'); closeUserModal(); loadUsuarios();
      } else showModalAlert(result.error || 'Error al crear el usuario.');
    } else {
      const uid = document.getElementById('um_usuarioOriginal').value;
      const data = {
        nombre:  document.getElementById('um_nombre').value,
        email:    document.getElementById('um_email').value,
        perfil:  document.getElementById('um_perfil').value,
        activo:  document.getElementById('um_activo').value === 'SI'
      };
      const newPass = document.getElementById('um_passReset').value;
      if (newPass) {
        if (newPass.length < 6) { showModalAlert('La contraseña debe tener al menos 6 caracteres.'); btn.disabled = false; btn.textContent = 'Guardar Cambios'; return; }
        data.contrasena = newPass;
      }
      const ok = await AUTH.updateUser(uid, data);
      if (ok) {
        CRM.logEvento('edicion_usuario', `Editó el usuario: ${data.nombre} (${data.email})`);
        TOAST.success('Usuario actualizado correctamente.'); closeUserModal(); loadUsuarios();
      } else showModalAlert('Error al guardar.');
    }
  } catch(err) {
    showModalAlert('Error de conexión.');
  } finally {
    btn.disabled = false;
    btn.textContent = mode === 'new' ? 'Crear Usuario' : 'Guardar Cambios';
  }
}

function showModalAlert(msg) {
  const box = document.getElementById('userModalAlert');
  box.textContent = msg;
  box.className = 'alert alert-error show';
  document.getElementById('um_btn').disabled = false;
}

// ══════════════════════════════════════════════
// IMPORT EXCEL
// ══════════════════════════════════════════════
const IMPORT_FIELDS = [
  'Cliente', 'Industria', 'Práctica/Área', 'Nombre de la Oportunidad',
  'Descripción', 'Origen', 'Responsable', 'Estado',
  'Fecha de Inicio', 'Fecha de Entrega', 'Notas',
  'TCV', 'Currency', 'TCV EUR', 'Tipo de Cambio',
  '% Probabilidad', '% PM'
];

const IMPORT_MAP = {
  'Cliente': 'cliente', 'Industria': 'industria', 'Práctica/Área': 'practica',
  'Nombre de la Oportunidad': 'nombre', 'Descripción': 'descripcion',
  'Origen': 'origen', 'Responsable': 'responsable', 'Estado': 'estado',
  'Fecha de Inicio': 'fechaInicio', 'Fecha de Entrega': 'fechaEntrega',
  'Notas': 'notas', 'TCV': 'tcv', 'Currency': 'currency',
  'TCV EUR': 'tcvEur', 'Tipo de Cambio': 'tipoCambio',
  '% Probabilidad': 'probabilidad', '% PM': 'pm'
};

let _importData = [];

function openImportModal() {
  resetImportModal();
  document.getElementById('importModalOverlay').classList.add('open');
  // Setup drag & drop
  const drop = document.getElementById('importDrop');
  drop.ondragover = (e) => { e.preventDefault(); drop.classList.add('dragover'); };
  drop.ondragleave = () => drop.classList.remove('dragover');
  drop.ondrop = (e) => {
    e.preventDefault();
    drop.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) processImportFile(file);
  };
}

function closeImportModal(event) {
  if (event && event.target !== document.getElementById('importModalOverlay')) return;
  document.getElementById('importModalOverlay').classList.remove('open');
}

function resetImportModal() {
  _importData = [];
  document.getElementById('importStep1').style.display = 'block';
  document.getElementById('importStep2').style.display = 'none';
  document.getElementById('importProgress').style.display = 'none';
  document.getElementById('importResult').style.display = 'none';
  document.getElementById('importFile').value = '';
  document.getElementById('importBtn').disabled = false;
  document.getElementById('importBtnText').textContent = 'Importar Oportunidades →';
  document.getElementById('importBtnSpinner').style.display = 'none';
}

function downloadTemplate() {
  if (typeof XLSX === 'undefined') { TOAST.error('Librería XLSX no disponible.'); return; }
  const cols = IMPORT_FIELDS;
  const ws = XLSX.utils.aoa_to_sheet([cols]);
  // Set column widths
  ws['!cols'] = [25, 18, 14, 30, 20, 14, 18, 14, 14, 14, 20, 12, 10, 12, 14, 14, 10].map(w => ({ wch: w }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Oportunidades');
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  downloadBlob(wbout, 'plantilla_oportunidades.xlsx');
  TOAST.success('Plantilla descargada.');
}

function handleImportFile(input) {
  const file = input.files[0];
  if (file) processImportFile(file);
}

function processImportFile(file) {
  const validExts = ['.xlsx', '.xls', '.csv'];
  const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  if (!validExts.includes(ext)) {
    TOAST.error('Formato no válido. Usá .xlsx o .csv');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const wb = XLSX.read(e.target.result, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });

      if (rows.length === 0) {
        TOAST.warning('El archivo está vacío.');
        return;
      }

      // Check that at least some expected columns exist
      const headers = Object.keys(rows[0]);
      const matched = headers.filter(h => IMPORT_MAP[h]);
      if (matched.length < 3) {
        TOAST.error('No se encontraron columnas reconocibles. Descargá la plantilla para ver el formato esperado.');
        return;
      }

      _importData = rows;
      renderImportPreview(file.name, headers, rows);
    } catch(err) {
      console.error('Error leyendo Excel:', err);
      TOAST.error('Error al leer el archivo.');
    }
  };
  reader.readAsArrayBuffer(file);
}

function renderImportPreview(fileName, headers, rows) {
  document.getElementById('importStep1').style.display = 'none';
  document.getElementById('importStep2').style.display = 'block';
  document.getElementById('importFileName').textContent = `📄 ${fileName} — ${rows.length} filas`;
  document.getElementById('importRowCount').textContent = rows.length;

  // Show header mapping info
  const headRow = document.getElementById('importPreviewHead');
  const matchedCols = headers.filter(h => IMPORT_MAP[h]);
  headRow.innerHTML = '<tr>' + matchedCols.map(h =>
    `<th>${escapeHtml(h)}</th>`
  ).join('') + '</tr>';

  // Show first 10 rows
  const previewRows = rows.slice(0, 10);
  const body = document.getElementById('importPreviewBody');
  body.innerHTML = previewRows.map((row, i) =>
    '<tr>' + matchedCols.map(h => {
      const val = row[h] !== undefined ? row[h] : '';
      const isMissing = !val && h === 'Nombre de la Oportunidad';
      return `<td style="${isMissing ? 'color:#f87171;font-weight:600' : ''}">${escapeHtml(val) || '—'}</td>`;
    }).join('') + '</tr>'
  ).join('');

  if (rows.length > 10) {
    body.innerHTML += `<tr><td colspan="${matchedCols.length}" style="text-align:center;color:var(--text-muted);font-style:italic;padding:10px">... y ${rows.length - 10} filas más</td></tr>`;
  }
}

async function executeImport() {
  if (_importData.length === 0) return;

  const btn = document.getElementById('importBtn');
  const progress = document.getElementById('importProgress');
  const result = document.getElementById('importResult');

  btn.disabled = true;
  btn.querySelector('#importBtnText').style.display = 'none';
  btn.querySelector('#importBtnSpinner').style.display = 'inline-block';
  progress.style.display = 'block';
  result.style.display = 'none';

  const total = _importData.length;
  let ok = 0, fail = 0, errors = [];
  const session = AUTH.getSession();

  for (let i = 0; i < total; i++) {
    const row = _importData[i];
    // Map row to data using column mapping
    const data = {};
    Object.keys(IMPORT_MAP).forEach(col => {
      const field = IMPORT_MAP[col];
      let val = row[col];
      if (val !== undefined && val !== '') data[field] = val;
    });

    // Skip rows without a name
    if (!data.nombre) {
      fail++;
      errors.push(`Fila ${i + 2}: falta "Nombre de la Oportunidad"`);
      updateImportProgress(i + 1, total);
      continue;
    }

    // Set responsible to current user if not specified
    if (!data.responsable && session) data.responsable = session.nombre;

    // Default state
    if (!data.estado) data.estado = 'En Desarrollo';

    // Validate estado
    if (!CRM.ESTADOS.includes(data.estado)) {
      fail++;
      errors.push(`Fila ${i + 2}: estado "${data.estado}" no válido`);
      updateImportProgress(i + 1, total);
      continue;
    }

    // Parsear campos numéricos con soporte de formato argentino
    const tcvVal = parseLocalizedNumber(data.tcv);
    if (!isNaN(tcvVal)) data.tcv = tcvVal;
    else data.tcv = 0;

    const probVal = parseLocalizedNumber(data.probabilidad);
    if (!isNaN(probVal)) data.probabilidad = probVal;
    else data.probabilidad = 0;

    const pmVal = parseLocalizedNumber(data.pm);
    if (!isNaN(pmVal)) data.pm = pmVal;
    else data.pm = 0;

    // Calcular TCV EUR si no viene en el Excel pero hay TCV y currency
    if ((!data.tcvEur || parseFloat(data.tcvEur) === 0) && data.tcv > 0 && data.currency) {
      const rate = await getFXRate(data.currency);
      if (rate) {
        data.tcvEur = parseFloat((data.tcv * rate).toFixed(2));
        data.tipoCambio = parseFloat(rate.toFixed(6));
      }
    }

    try {
      await CRM.addOportunidad(data);
      CRM.logEvento('creacion', 'Importó oportunidad masivamente', '', '', data.nombre);
      ok++;
    } catch(err) {
      fail++;
      errors.push(`Fila ${i + 2}: ${err.message}`);
    }

    updateImportProgress(i + 1, total);
  }

  // Done
  btn.disabled = false;
  btn.querySelector('#importBtnText').style.display = 'inline';
  btn.querySelector('#importBtnSpinner').style.display = 'none';
  document.getElementById('importProgressText').textContent = 'Importación finalizada';

  // Show result
  result.style.display = 'block';
  if (fail === 0) {
    result.style.background = 'color-mix(in srgb, #22c55e 10%, transparent)';
    result.style.color = '#16a34a';
    result.innerHTML = `<strong>${ok}</strong> oportunidades importadas correctamente.`;
    TOAST.success(`${ok} oportunidades importadas.`);
  } else {
    result.style.background = 'color-mix(in srgb, #f59e0b 10%, transparent)';
    result.style.color = '#d97706';
    result.innerHTML = `<strong>${ok}</strong> importadas, <strong>${fail}</strong> con errores.<br><details style="margin-top:8px;font-size:11px;cursor:pointer"><summary>Ver errores</summary><div style="margin-top:6px;max-height:120px;overflow:auto">${errors.map(e => `<div>${escapeHtml(e)}</div>`).join('')}</div></details>`;
    TOAST.warning(`${ok} importadas, ${fail} con errores.`);
  }

  CRM.invalidateCache();
}

function updateImportProgress(current, total) {
  const pct = Math.round(current / total * 100);
  document.getElementById('importProgressBar').style.width = pct + '%';
  document.getElementById('importProgressCount').textContent = `${current}/${total}`;
  document.getElementById('importProgressText').textContent = `Procesando fila ${current}...`;
}

// ══════════════════════════════════════════════
// KANBAN BOARD
// ══════════════════════════════════════════════
let _kanbanRows = [];
let _kanbanDragId = null;
let _kanbanDragEstado = null;
let _hiddenKanbanCols = [];

function loadKanbanColFilter() {
  try {
    const saved = localStorage.getItem('kanban_hidden_cols');
    _hiddenKanbanCols = saved ? JSON.parse(saved) : [];
  } catch(e) { _hiddenKanbanCols = []; }
}

function saveKanbanColFilter() {
  localStorage.setItem('kanban_hidden_cols', JSON.stringify(_hiddenKanbanCols));
}

function toggleColFilter() {
  const dd = document.getElementById('kanbanColFilterDd');
  const isOpen = dd.classList.contains('open');
  closeAllDropdowns();
  if (!isOpen) dd.classList.add('open');
}

function closeAllDropdowns() {
  document.querySelectorAll('.kanban-col-filter-dd.open').forEach(d => d.classList.remove('open'));
}

function buildColFilterDropdown() {
  const dd = document.getElementById('kanbanColFilterDd');
  const total = CRM.ESTADOS.length;
  const visible = total - _hiddenKanbanCols.length;
  document.getElementById('kColCount').textContent = visible + '/' + total;

  let html = CRM.ESTADOS.map(estado => {
    const color = CRM.ESTADO_COLORS[estado];
    const checked = !_hiddenKanbanCols.includes(estado);
    return `<label onclick="event.stopPropagation();toggleKanbanCol('${escapeHtml(estado)}')">
      <span class="cb-box ${checked ? 'checked' : ''}"></span>
      <span class="dot" style="background:${color};width:8px;height:8px;border-radius:50%;flex-shrink:0"></span>
      <span class="estado-name">${escapeHtml(estado)}</span>
    </label>`;
  }).join('');
  html += '<div class="sep"></div>';
  html += `<label onclick="event.stopPropagation()" style="font-size:11px;color:var(--text-muted);justify-content:center">
    <a href="#" onclick="resetKanbanCols();return false" style="color:var(--accent);text-decoration:none;font-weight:600">Mostrar todas</a>
  </label>`;
  dd.innerHTML = html;
}

function toggleKanbanCol(estado) {
  const idx = _hiddenKanbanCols.indexOf(estado);
  if (idx >= 0) _hiddenKanbanCols.splice(idx, 1);
  else _hiddenKanbanCols.push(estado);
  saveKanbanColFilter();
  buildColFilterDropdown();
  renderKanban();
}

function resetKanbanCols() {
  _hiddenKanbanCols = [];
  saveKanbanColFilter();
  buildColFilterDropdown();
  renderKanban();
}

// Close dropdown on outside click
document.addEventListener('click', (e) => {
  if (!e.target.closest('.kanban-col-filter')) closeAllDropdowns();
});

async function initKanban(silent = false) {
  if (!silent) showLoading('kanbanLoading', 'kanbanBoard');

  loadKanbanColFilter();
  buildColFilterDropdown();

  const session = AUTH.getSession();
  const raw = await CRM.getData();
  _kanbanRows = raw; // Todos los roles ven todas las cards

  // Populate responsables filter (admin only)
  const selR = document.getElementById('k_responsable');
  const filters = document.getElementById('kanbanFilters');
  if (session.perfil === 'admin') {
    filters.style.display = 'flex';
    const resps = [...new Set(_kanbanRows.map(r => r.responsable).filter(Boolean))].sort();
    selR.innerHTML = '<option value="">Todos los responsables</option>';
    resps.forEach(r => selR.innerHTML += `<option>${escapeHtml(r)}</option>`);
  } else {
    filters.style.display = 'flex';
    selR.style.display = 'none';
  }

  if (!silent) hideLoading('kanbanLoading', 'kanbanBoard', 'flex');
  renderKanban();
}

function renderKanban() {
  const q = document.getElementById('k_search').value.trim().toLowerCase();
  const resp = document.getElementById('k_responsable').value;

  let rows = _kanbanRows;
  if (resp) rows = rows.filter(r => r.responsable === resp);
  if (q) rows = rows.filter(r => {
    const h = [r.codigo, r.nombre, r.cliente, r.responsable].join(' ').toLowerCase();
    return h.includes(q);
  });

  const visibleEstados = CRM.ESTADOS.filter(e => !_hiddenKanbanCols.includes(e));

  const board = document.getElementById('kanbanBoard');
  board.innerHTML = visibleEstados.map(estado => {
    const color = CRM.ESTADO_COLORS[estado];
    const cards = rows.filter(r => r.estado === estado);
    return `
      <div class="kanban-col" data-estado="${escapeHtml(estado)}">
        <div class="kanban-col-header">
          <div class="kanban-col-title">
            <div class="kanban-col-dot" style="background:${color}"></div>
            ${escapeHtml(estado)}
            <span class="kanban-col-count">${cards.length}</span>
          </div>
        </div>
        <div class="kanban-col-body">
          ${cards.length === 0 ? '<div class="kanban-col-empty">Sin oportunidades</div>' :
            cards.map(r => renderKanbanCard(r)).join('')}
        </div>
      </div>`;
  }).join('');

  // Setup drag & drop on entire columns (not just body)
  board.querySelectorAll('.kanban-col').forEach(col => {
    col.addEventListener('dragover', (e) => {
      e.preventDefault();
      col.classList.add('dragover');
    });
    col.addEventListener('dragleave', (e) => {
      if (!col.contains(e.relatedTarget)) {
        col.classList.remove('dragover');
      }
    });
    col.addEventListener('drop', async (e) => {
      e.preventDefault();
      col.classList.remove('dragover');
      const newEstado = col.dataset.estado;
      if (!_kanbanDragId || !_kanbanDragEstado) return;
      if (_kanbanDragEstado === newEstado) return;
      await handleKanbanDrop(_kanbanDragId, newEstado);
      _kanbanDragId = null;
      _kanbanDragEstado = null;
    });
  });
}

function renderKanbanCard(r) {
  const color = CRM.ESTADO_COLORS[r.estado] || 'var(--border)';
  const tcvDisplay = r.tcv ? Number(r.tcv).toLocaleString('es-AR') + (r.currency ? ' ' + escapeHtml(r.currency) : '') : '—';
  return `
    <div class="kanban-card" draggable="true" data-id="${r.id}" data-estado="${escapeHtml(r.estado)}" style="border-left-color:${color}">
      <div class="kanban-card-id">${escapeHtml(friendlyId(r))}</div>
      <div class="kanban-card-client">${escapeHtml(r.cliente) || '—'}</div>
      <div class="kanban-card-name">${escapeHtml(r.nombre) || '—'}</div>
      <div class="kanban-card-meta">
        <span>${escapeHtml(r.responsable) || '—'}</span>
        <span class="kanban-card-tcv">${tcvDisplay}</span>
      </div>
    </div>`;
}

// Setup card drag events via event delegation
document.addEventListener('dragstart', (e) => {
  const card = e.target.closest('.kanban-card');
  if (!card) return;
  _kanbanDragId = card.dataset.id;
  _kanbanDragEstado = card.dataset.estado;
  card.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', card.dataset.id);
});

document.addEventListener('dragend', (e) => {
  const card = e.target.closest('.kanban-card');
  if (card) card.classList.remove('dragging');
  document.querySelectorAll('.kanban-col.dragover').forEach(el => {
    el.classList.remove('dragover');
  });
});

// Click on card to view details
document.addEventListener('click', (e) => {
  const card = e.target.closest('.kanban-card');
  if (!card || e.target.closest('.kanban-card.dragging')) return;
  const id = card.dataset.id;
  // Make sure _tablaRows is loaded for verOportunidad
  if (_kanbanRows.length > 0 && _kanbanDragId !== id) {
    verOportunidad(id);
  }
});

async function handleKanbanDrop(id, newEstado) {
  const r = _kanbanRows.find(x => x.id === id);
  if (!r) return;

  const oldEstado = r.estado;
  if (oldEstado === newEstado) return;

  // Check edit permissions
  const session = AUTH.getSession();
  if (session.perfil === 'solo lectura') {
    TOAST.error('No tenés permisos para mover oportunidades.');
    return;
  }
  if (session.perfil !== 'admin' && r.responsable !== session.nombre) {
    TOAST.error('No tenés permisos para mover esta oportunidad.');
    return;
  }

  // Optimistic update
  r.estado = newEstado;
  renderKanban();

  try {
    await CRM.updateOportunidad(id, { estado: newEstado });
    CRM.logEvento('cambio_estado', `Cambio estado: ${oldEstado} → ${newEstado}`, id, r.codigo, r.nombre);
    TOAST.success(`"${r.nombre}" → ${newEstado}`);
    // Refresh data in background
    const fresh = await CRM.getData();
    _kanbanRows = fresh; // Todos los roles ven todas las cards
    renderKanban();
  } catch(err) {
    // Rollback on error
    r.estado = oldEstado;
    renderKanban();
    TOAST.error('Error al actualizar el estado.');
  }
}

// ══════════════════════════════════════════════
// MIS OPORTUNIDADES
// ══════════════════════════════════════════════

async function initMis(silent = false) {
  if (!silent) showLoading('misLoading', 'misTable');
  const session = AUTH.getSession();
  const raw = await CRM.getData();
  _misRows = raw.filter(r => r.responsable === session.nombre);
  if (!silent) hideLoading('misLoading', 'misTable');

  // Show/hide bulk checkbox column for admin
  document.getElementById('misCheckHead').style.display = isAdmin() ? '' : 'none';
  _bulkMis.clear();

  _misSt.page = 1;
  renderMis();
}

async function misRefresh() {
  CRM.invalidateCache();
  await initMis();
}

// ══════════════════════════════════════════════
// LOG DE EVENTOS
// ══════════════════════════════════════════════

const ACCION_STYLES = {
  creacion:      { icon: '➕', color: '#22c55e', label: 'Creación' },
  edicion:       { icon: '✏️', color: '#3b82f6', label: 'Edición' },
  eliminacion:   { icon: '🗑️', color: '#ef4444', label: 'Eliminación' },
  cambio_estado: { icon: '🔄', color: '#f59e0b', label: 'Cambio de estado' }
};

let _logEvents = [], _logLastDoc = null, _logHasMore = false;

async function initLog() {
  _logEvents = [];
  _logLastDoc = null;
  _logHasMore = true;
  showLoading('logLoading', 'logFeed');

  const { events, lastDoc } = await CRM.getLogEventos(50);
  _logEvents = events;
  _logLastDoc = lastDoc;
  _logHasMore = lastDoc !== null;
  hideLoading('logLoading', 'logFeed');

  if (events.length === 0) { document.getElementById('logEmpty').style.display = 'block'; return; }
  document.getElementById('logEmpty').style.display = 'none';
  renderLogFeed();
}

function renderLogFeed() {
  const feed = document.getElementById('logFeed');

  // Agrupar por fecha
  const groups = {};
  _logEvents.forEach(ev => {
    const d = new Date(ev.fecha);
    const dayKey = d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
    if (!groups[dayKey]) groups[dayKey] = [];
    groups[dayKey].push(ev);
  });

  let html = '';
  Object.entries(groups).forEach(([dayLabel, dayEvents]) => {
    html += `<div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.08em;margin:24px 0 12px;padding-bottom:8px;border-bottom:1px solid var(--border)">${dayLabel}</div>`;
    dayEvents.forEach(ev => {
      const style = ACCION_STYLES[ev.accion] || ACCION_STYLES.edicion;
      const oppLink = ev.oppId ? `<span style="color:var(--accent);font-weight:600;cursor:pointer" onclick="verOportunidadLog('${ev.oppId}')">${escapeHtml(ev.oppCodigo || ev.oppNombre || ev.oppId.substring(0,8))}</span>` : '';
      html += `
        <div style="display:flex;align-items:flex-start;gap:12px;padding:10px 0;border-bottom:1px solid color-mix(in srgb, var(--border) 50%, transparent)">
          <div style="width:32px;height:32px;border-radius:8px;background:color-mix(in srgb, ${style.color} 12%, transparent);display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0">${style.icon}</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;font-weight:500;color:var(--text);line-height:1.4">
              <span style="font-weight:600">${escapeHtml(ev.usuario) || 'Usuario'}</span>
              ${escapeHtml(ev.detalle)}
              ${oppLink}
            </div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:2px;display:flex;align-items:center;gap:8px">
              <span style="background:color-mix(in srgb, ${style.color} 15%, transparent);color:${style.color};padding:1px 8px;border-radius:10px;font-weight:600;font-size:10px">${style.label}</span>
              <span>${timeAgo(ev.fecha)}</span>
            </div>
          </div>
        </div>`;
    });
  });

  if (_logHasMore) {
    html += `<div style="text-align:center;padding:20px 0">
      <div style="font-size:11px;color:var(--text-muted);margin-bottom:10px">Mostrando ${_logEvents.length} eventos</div>
      <button class="btn btn-ghost" onclick="loadMoreLog()">Cargar más eventos</button>
    </div>`;
  } else {
    html += `<div style="text-align:center;padding:16px 0;font-size:11px;color:var(--text-muted);font-style:italic">Mostrando todos los ${_logEvents.length} eventos</div>`;
  }

  feed.innerHTML = html;
}

async function loadMoreLog() {
  if (!_logLastDoc) return;
  const { events, lastDoc } = await CRM.getLogEventos(50, _logLastDoc);
  _logEvents = [..._logEvents, ...events];
  _logLastDoc = lastDoc;
  _logHasMore = lastDoc !== null;
  renderLogFeed();
}

function verOportunidadLog(id) {
  verOportunidad(id);
}

// ══════════════════════════════════════════════
// KEYBOARD SHORTCUTS
// ══════════════════════════════════════════════
document.addEventListener('keydown', function(e) {
  const tag = (e.target.tagName || '').toLowerCase();
  const isInput = ['input', 'textarea', 'select'].includes(tag);

  // ── Escape: cerrar modales ──
  if (e.key === 'Escape') {
    const verOpen   = document.getElementById('verModalOverlay').classList.contains('open');
    const editOpen  = document.getElementById('editModalOverlay').classList.contains('open');
    const userOpen  = document.getElementById('userModalOverlay').classList.contains('open');
    const importOpen = document.getElementById('importModalOverlay').classList.contains('open');
    if (verOpen)   { closeVerModal();   e.preventDefault(); }
    else if (editOpen)  { closeEditModal();  e.preventDefault(); }
    else if (userOpen)  { closeUserModal();  e.preventDefault(); }
    else if (importOpen) { closeImportModal(); e.preventDefault(); }
    return;
  }

  // Los siguientes atajos no se activan si el foco está en un input/textarea
  if (isInput) return;

  // ── Alt+N: nueva oportunidad ──
  if (e.altKey && e.key === 'n') {
    e.preventDefault();
    const btnNueva = document.getElementById('btnNueva');
    if (btnNueva && btnNueva.style.display !== 'none') {
      navigate(btnNueva);
      resetNueva();
    }
    return;
  }

  // ── Ctrl+F: foco en buscador de la página activa ──
  if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
    e.preventDefault();
    const activePage = document.querySelector('.page-section.active');
    if (!activePage) return;
    const searchId = activePage.id === 'page-mis' ? 'mis_search'
                   : activePage.id === 'page-todas' ? 't_search'
                   : activePage.id === 'page-kanban' ? 'k_search'
                   : null;
    if (searchId) {
      const input = document.getElementById(searchId);
      if (input) { input.focus(); input.select(); }
    }
    return;
  }
});

// ── Enter envía formularios ──
document.addEventListener('keydown', function(e) {
  if (e.key !== 'Enter') return;
  const tag = (e.target.tagName || '').toLowerCase();
  if (tag !== 'input' && tag !== 'select') return;
  const type = (e.target.type || '').toLowerCase();
  // Enter en un input que NO es textarea ni button envía el form padre
  if (type === 'button' || type === 'submit' || type === 'reset' || type === 'checkbox' || type === 'radio') return;
  const form = e.target.closest('form');
  if (form) {
    // No interferir con date inputs o campos que tienen comportamiento nativo
    if (type === 'date' || type === 'month' || type === 'color' || type === 'file') return;
    e.preventDefault();
    form.requestSubmit();
  }
});

// ══════════════════════════════════════════════
// AUTOCOMPLETE DE CLIENTES
// ══════════════════════════════════════════════
const CLIENTE_AUTOCOMPLETE = (() => {
  let _activeEl = null;   // input activo
  let _list = null;        // dropdown UL
  let _selectedIndex = -1; // índice de la opción seleccionada con teclado
  let _visibleItems = [];  // items actualmente visibles

  function createList() {
    if (_list) return;
    _list = document.createElement('ul');
    _list.className = 'ac-dropdown';
    _list.id = 'acDropdown';
    document.body.appendChild(_list);
  }

  function show(inputEl, items) {
    if (!items.length) { hide(); return; }
    _activeEl = inputEl;
    _visibleItems = items;
    _selectedIndex = -1;

    _list.innerHTML = items.map((item, i) =>
      `<li data-index="${i}" data-value="${escapeHtml(item)}">${highlightMatch(item, inputEl.value)}</li>`
    ).join('');

    // Posicionar debajo del input
    const rect = inputEl.getBoundingClientRect();
    _list.style.top = (rect.bottom + 4) + 'px';
    _list.style.left = rect.left + 'px';
    _list.style.width = Math.max(rect.width, 220) + 'px';
    _list.style.display = 'block';

    // Hover events
    _list.querySelectorAll('li').forEach(li => {
      li.addEventListener('mouseenter', () => {
        _selectedIndex = parseInt(li.dataset.index);
        updateHighlight();
      });
      li.addEventListener('mousedown', (e) => {
        e.preventDefault(); // evitar blur del input
        selectItem(li.dataset.value);
      });
    });
  }

  function hide() {
    if (_list) {
      _list.style.display = 'none';
      _list.innerHTML = '';
    }
    _activeEl = null;
    _selectedIndex = -1;
    _visibleItems = [];
  }

  function selectItem(value) {
    if (!_activeEl) return;
    _activeEl.value = value;
    hide();
    _activeEl.focus();
  }

  function highlightMatch(text, query) {
    if (!query) return escapeHtml(text);
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return escapeHtml(text);
    const before = escapeHtml(text.substring(0, idx));
    const match  = escapeHtml(text.substring(idx, idx + query.length));
    const after  = escapeHtml(text.substring(idx + query.length));
    return before + '<strong class="ac-match">' + match + '</strong>' + after;
  }

  function moveSelection(dir) {
    if (!_list || _list.style.display === 'none' || !_visibleItems.length) return;
    _selectedIndex += dir;
    if (_selectedIndex < 0) _selectedIndex = _visibleItems.length - 1;
    if (_selectedIndex >= _visibleItems.length) _selectedIndex = 0;
    updateHighlight();
    // Scroll into view
    const li = _list.querySelector(`li[data-index="${_selectedIndex}"]`);
    if (li) li.scrollIntoView({ block: 'nearest' });
  }

  function updateHighlight() {
    if (!_list) return;
    _list.querySelectorAll('li').forEach((li, i) => {
      li.classList.toggle('ac-active', i === _selectedIndex);
    });
  }

  function onKeyDown(e) {
    if (!_activeEl || !_list || _list.style.display === 'none') return;
    if (e.key === 'ArrowDown') { e.preventDefault(); moveSelection(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); moveSelection(-1); }
    else if (e.key === 'Enter' || e.key === 'Tab') {
      if (_selectedIndex >= 0 && _visibleItems[_selectedIndex]) {
        e.preventDefault();
        selectItem(_visibleItems[_selectedIndex]);
      }
    }
    else if (e.key === 'Escape') { hide(); }
  }

  function onInput(e) {
    const input = e.target;
    if (!input.matches('#n_cliente, #e_cliente')) return;
    const query = input.value.trim();
    if (query.length < 1) { hide(); return; }

    const allClientes = CRM.getClientesUnicos();
    const matches = allClientes.filter(c =>
      c.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 8);

    createList();
    show(input, matches);
  }

  // Public
  function init() {
    createList();
    document.addEventListener('input', onInput);
    document.addEventListener('keydown', onKeyDown);
    // Cerrar al hacer click fuera
    document.addEventListener('mousedown', (e) => {
      if (!_list || _list.style.display === 'none') return;
      if (e.target.closest('.ac-dropdown')) return;
      if (e.target === _activeEl) return;
      hide();
    });
  }

  return { init };
})();

// ══════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════
function initApp() {
  // Auth check
  const session = AUTH.requireAuth();
  if (!session) return;

  // User info
  document.getElementById('userAvatar').textContent = getInitials(session.nombre);
  document.getElementById('userName').textContent   = session.nombre.split(' ').slice(0, 2).join(' ');
  document.getElementById('userPerfil').textContent = session.perfil;
  if (session.perfil === 'admin') document.getElementById('btnUsuarios').style.display = 'flex';
  if (session.perfil === 'admin') document.getElementById('btnLog').style.display = 'flex';

  // Ocultar secciones para "solo lectura"
  if (session.perfil === 'solo lectura') {
    document.getElementById('btnNueva').style.display = 'none';
    document.getElementById('btnMis').style.display = 'none';
    document.querySelectorAll('.btn-nueva-oport').forEach(b => b.style.display = 'none');
  }

  // ── MOBILE SIDEBAR ──
  function toggleMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.toggle('mobile-open');
    overlay.classList.toggle('visible');
    // Close sidebar when navigating on mobile
    if (!sidebar.classList.contains('mobile-open')) return;
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        closeMobileSidebar();
      }, { once: true });
    });
  }

  function closeMobileSidebar() {
    document.getElementById('sidebar').classList.remove('mobile-open');
    document.getElementById('sidebarOverlay').classList.remove('visible');
  }

  // Auto-collapse sidebar on mobile and restore on resize
  function handleResize() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (window.innerWidth <= 480) {
      closeMobileSidebar();
    } else {
      sidebar.classList.remove('mobile-open');
      overlay.classList.remove('visible');
    }
  }
  window.addEventListener('resize', handleResize);

  // Expose to global scope for HTML onclick
  window.toggleMobileSidebar = toggleMobileSidebar;
  window.closeMobileSidebar = closeMobileSidebar;

  // Sidebar toggle
  document.getElementById('toggleBtn').addEventListener('click', () =>
    document.getElementById('sidebar').classList.toggle('collapsed')
  );

  // Pre-fill responsable
  document.getElementById('n_responsable').value = session.nombre;
  if (session.perfil !== 'admin') document.getElementById('n_responsable').readOnly = true;

  // Connection check
  checkConexion();
  setInterval(checkConexion, 600000); // 10 minutos

  // Real-time listener: si cambian datos en Firestore, actualizar
  CRM.onOportunidadesChange((freshData) => {
    const activeSection = document.querySelector('.page-section.active');
    if (activeSection) {
      const page = activeSection.id.replace('page-', '');
      // Re-render la seccion activa con datos actualizados (silent = sin loaders)
      if (['home', 'mis', 'todas', 'kanban', 'calendario', 'estadisticas'].includes(page)) {
        onPageEnter(page, true);
      }
    }
  });

  // Init notifications
  NOTIF.init();

  // Inicializar autocomplete de clientes
  CLIENTE_AUTOCOMPLETE.init();

  // Check scheduled notifications (entrega proxima + sin actualizar)
  CRM.checkEntregaProxima();
  CRM.checkSinActualizar();

  // Load home
  renderHome();
}

// Esperar a que el DOM este listo
document.addEventListener('DOMContentLoaded', initApp);
