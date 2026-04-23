// assets/firebase-db.js — CRUD con Firestore

const OPORTUNIDADES_COL = 'oportunidades';

const COLUMNS = [
  'codigo', 'cliente', 'industria', 'practica',
  'nombre', 'descripcion', 'origen', 'fertilizacion',
  'responsable', 'responsableUid', 'estado', 'fechaInicio', 'fechaEntrega',
  'notas', 'sharepoint', 'tcv', 'currency', 'tcvEur', 'tipoCambio',
  'probabilidad', 'pm', 'fechaCreacion', 'fechaModificacion'
];

const ESTADOS  = ['En Desarrollo', 'Entregada', 'Pausa', 'No Go', 'Cancelada', 'Perdida', 'Ganada'];
const ORIGENES = ['Fertilización', 'Otro', 'Proyecto', 'Renovación', 'RFP'];
const ESTADO_COLORS = {
  'En Desarrollo': '#fde68a',
  'Entregada':     '#93c5fd',
  'Pausa':         '#fdba74',
  'No Go':        '#94a3b8',
  'Cancelada':     '#94a3b8',
  'Perdida':       '#fca5a5',
  'Ganada':        '#a7f3d0'
};

// ── CACHE ──
let _cache = null;
let _cacheTs = 0;
const CACHE_TTL = 300000; // 5 minutos
let _listenerActive = false; // true cuando onSnapshot está suscripto

function invalidateCache() {
  // Si el listener está activo, no invalidar: onSnapshot se encarga de mantener _cache fresco
  if (_listenerActive) return;
  _cache = null;
  _cacheTs = 0;
}

// ── MAPEO: Firestore doc → objeto plano ──
function docToObj(doc) {
  const d = doc.data();
  return {
    id:              doc.id,
    codigo:          d.codigo || '',
    cliente:         d.cliente         || '',
    industria:       d.industria       || '',
    practica:        d.practica        || '',
    nombre:          d.nombre          || '',
    descripcion:     d.descripcion     || '',
    origen:          d.origen          || '',
    fertilizacion:   !!d.fertilizacion,
    responsable:     d.responsable     || '',
    responsableUid:  d.responsableUid  || '',
    estado:          d.estado          || '',
    fechaInicio:     d.fechaInicio     || '',
    fechaEntrega:    d.fechaEntrega    || '',
    notas:           d.notas           || '',
    sharepoint:      d.sharepoint      || '',
    tcv:             d.tcv             || 0,
    currency:        d.currency        || '',
    tcvEur:          d.tcvEur          || 0,
    tipoCambio:      d.tipoCambio      || 0,
    probabilidad:    d.probabilidad    || 0,
    pm:              d.pm              || 0,
    fechaCreacion:   d.fechaCreacion   || '',
    fechaModificacion: d.fechaModificacion || ''
  };
}

// ── GET DATA ──
async function getData(forceRefresh = false) {
  // Si el listener onSnapshot está activo, usar siempre la caché (es mantenida en tiempo real)
  if (!forceRefresh && _listenerActive && _cache) {
    return _cache;
  }
  // Cache TTL normal (para antes de que el listener se active o si se cae)
  if (!forceRefresh && _cache && (Date.now() - _cacheTs) < CACHE_TTL) {
    return _cache;
  }
  try {
    const snap = await firebase.firestore().collection(OPORTUNIDADES_COL)
      .orderBy('fechaCreacion', 'desc')
      .get();
    _cache = snap.docs.map(docToObj);
    _cacheTs = Date.now();
    return _cache;
  } catch(e) {
    console.error('Error obteniendo datos:', e);
    return _cache || [];
  }
}

// ── COUNTER (código secuencial OPP-XXXX) ──
async function getNextCodigo() {
  const counterRef = firebase.firestore().collection('counters').doc('oportunidades');
  try {
    const result = await firebase.firestore().runTransaction(async (tx) => {
      const snap = await tx.get(counterRef);
      if (!snap.exists) {
        tx.set(counterRef, { nextId: 2 });
        return 1;
      }
      const nextId = snap.data().nextId || 1;
      tx.update(counterRef, { nextId: nextId + 1 });
      return nextId;
    });
    return 'OPP-' + String(result).padStart(4, '0');
  } catch(e) {
    console.error('Error obteniendo código secuencial:', e);
    throw new Error('No se pudo generar el código de oportunidad. Verificá que el documento counters/oportunidades exista en Firestore.');
  }
}

// ── ADD ──
async function addOportunidad(data) {
  try {
    const session = AUTH.getSession();
    const now = new Date().toISOString();
    const codigo = await getNextCodigo();

    const docData = {
      codigo:            codigo,
      cliente:           data.cliente         || '',
      industria:         data.industria       || '',
      practica:          data.practica        || '',
      nombre:            data.nombre          || '',
      descripcion:       data.descripcion     || '',
      origen:            data.origen          || '',
      fertilizacion:     !!data.fertilizacion,
      responsable:       data.responsable     || '',
      responsableUid:    session ? session.uid : '',
      estado:            data.estado          || 'En Desarrollo',
      fechaInicio:       data.fechaInicio     || '',
      fechaEntrega:      data.fechaEntrega    || '',
      notas:             data.notas           || '',
      sharepoint:        data.sharepoint      || '',
      tcv:               parseFloat(data.tcv) || 0,
      currency:          data.currency        || '',
      tcvEur:            parseFloat(data.tcvEur) || 0,
      tipoCambio:        parseFloat(data.tipoCambio) || 0,
      probabilidad:      parseFloat(data.probabilidad) || 0,
      pm:                parseFloat(data.pm)  || 0,
      fechaCreacion:     now,
      fechaModificacion: now,
      createdBy:         session ? session.uid : ''
    };

    const ref = await firebase.firestore().collection(OPORTUNIDADES_COL).add(docData);
    invalidateCache();
    return ref.id;
  } catch(e) {
    console.error('Error agregando oportunidad:', e);
    throw e;
  }
}

// ── UPDATE ──
async function updateOportunidad(id, data) {
  try {
    const now = new Date().toISOString();
    const updateData = {
      ...data,
      fechaModificacion: now
    };
    // Limpiar campos undefined
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) updateData[key] = '';
    });
    // Convertir numericos
    if ('tcv' in updateData)          updateData.tcv          = parseFloat(updateData.tcv) || 0;
    if ('tcvEur' in updateData)       updateData.tcvEur       = parseFloat(updateData.tcvEur) || 0;
    if ('tipoCambio' in updateData)   updateData.tipoCambio   = parseFloat(updateData.tipoCambio) || 0;
    if ('probabilidad' in updateData) updateData.probabilidad = parseFloat(updateData.probabilidad) || 0;
    if ('pm' in updateData)           updateData.pm           = parseFloat(updateData.pm) || 0;

    await firebase.firestore().collection(OPORTUNIDADES_COL).doc(id).update(updateData);
    invalidateCache();
    return true;
  } catch(e) {
    console.error('Error actualizando oportunidad:', e);
    throw e;
  }
}

// ── DELETE ──
async function deleteOportunidad(id) {
  try {
    await firebase.firestore().collection(OPORTUNIDADES_COL).doc(id).delete();
    invalidateCache();
    return true;
  } catch(e) {
    console.error('Error eliminando oportunidad:', e);
    throw e;
  }
}

// ── GET BY ID ──
async function getOportunidad(id) {
  // Primero buscar en caché (evita lectura individual si onSnapshot ya cargó todo)
  if (_cache) {
    const cached = _cache.find(r => r.id === id);
    if (cached) return cached;
  }
  try {
    const doc = await firebase.firestore().collection(OPORTUNIDADES_COL).doc(id).get();
    if (!doc.exists) return null;
    return docToObj(doc);
  } catch(e) {
    console.error('Error obteniendo oportunidad:', e);
    return null;
  }
}

// ── REAL-TIME LISTENER ──
function onOportunidadesChange(callback) {
  _listenerActive = true;
  return firebase.firestore().collection(OPORTUNIDADES_COL)
    .orderBy('fechaCreacion', 'desc')
    .onSnapshot(snap => {
      _cache = snap.docs.map(docToObj);
      _cacheTs = Date.now();
      callback(_cache);
    }, err => {
      console.error('Error en listener de oportunidades:', err);
      _listenerActive = false; // Desactivar si hay error persistente
    });
}

// ── DOWNLOAD EXCEL ──
function downloadExcel(rows) {
  if (typeof XLSX === 'undefined') return;
  try {
    // Mapear a formato original con nombres legibles para el Excel
    const mapped = rows.map(r => ({
      'Código':                  r.codigo || r.id.substring(0,8),
      'Cliente':                 r.cliente,
      'Industria':               r.industria,
      'Práctica/Área':           r.practica,
      'Nombre de la Oportunidad': r.nombre,
      'Descripción':             r.descripcion,
      'Origen':                  r.origen,
      'Fertilización':           r.fertilizacion ? 'Sí' : 'No',
      'Responsable':             r.responsable,
      'Estado':                  r.estado,
      'Fecha de Inicio':         r.fechaInicio,
      'Fecha de Entrega':        r.fechaEntrega,
      'Notas':                   r.notas,
      'SharePoint':              r.sharepoint,
      'TCV':                     r.tcv,
      'Currency':                r.currency,
      'TCV EUR':                 r.tcvEur,
      'Tipo de Cambio':          r.tipoCambio,
      '% Probabilidad':          r.probabilidad,
      '% PM':                    r.pm,
      'Fecha Creación':          r.fechaCreacion,
      'Fecha Modificación':      r.fechaModificacion
    }));

    const cols = ['Código','Cliente','Industria','Práctica/Área','Nombre de la Oportunidad','Descripción','Origen','Fertilización','Responsable','Estado','Fecha de Inicio','Fecha de Entrega','Notas','SharePoint','TCV','Currency','TCV EUR','Tipo de Cambio','% Probabilidad','% PM','Fecha Creación','Fecha Modificación'];
    const ws = XLSX.utils.json_to_sheet(mapped.length ? mapped : [Object.fromEntries(cols.map(c => [c, '']))]);
    ws['!cols'] = [12,25,18,14,30,20,14,12,18,14,14,14,20,30,12,10,12,14,14,10,14,14].map(w => ({ wch: w }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Oportunidades');

    const estadoCounts = {};
    ESTADOS.forEach(e => estadoCounts[e] = 0);
    rows.forEach(r => { if (estadoCounts[r.estado] !== undefined) estadoCounts[r.estado]++; });

    const ws2 = XLSX.utils.aoa_to_sheet([
      ['RESUMEN PIPELINE', ''],
      ['Generado', new Date().toLocaleString('es-AR')],
      ['', ''],
      ['Total Oportunidades', rows.length],
      ['TCV EUR Total', rows.reduce((s, r) => s + (parseFloat(r.tcvEur) || 0), 0)],
      ['', ''],
      ['ESTADO', 'CANTIDAD'],
      ...ESTADOS.map(e => [e, estadoCounts[e] || 0])
    ]);
    ws2['!cols'] = [{ wch: 30 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, ws2, 'Resumen');

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([wbout], { type: 'application/octet-stream' }));
    a.download = 'oportunidades.xlsx';
    a.click();
  } catch(e) {
    console.error('Error exportando Excel:', e);
  }
}

// ── LOG DE EVENTOS ──
async function logEvento(accion, detalle, oppId, oppCodigo, oppNombre) {
  try {
    const session = AUTH.getSession();
    await firebase.firestore().collection('log_eventos').add({
      fecha:      new Date().toISOString(),
      usuario:    session ? session.nombre : '',
      usuarioUid: session ? session.uid : '',
      accion:     accion,     // 'creacion', 'edicion', 'eliminacion', 'cambio_estado'
      detalle:    detalle,   // descripción legible
      oppId:      oppId || '',
      oppCodigo:  oppCodigo || '',
      oppNombre:  oppNombre || ''
    });
  } catch(e) {
    console.error('Error registrando evento:', e);
  }
}

async function getLogByOppId(oppId, limit = 50) {
  try {
    const snap = await firebase.firestore().collection('log_eventos')
      .where('oppId', '==', oppId)
      .limit(limit)
      .get();
    // Ordenar por fecha descendente en cliente (evita necesidad de índice compuesto en Firestore)
    return snap.docs.map(d => d.data()).sort((a, b) => {
      const fa = a.fecha || '', fb = b.fecha || '';
      return fb.localeCompare(fa);
    });
  } catch(e) {
    console.error('Error obteniendo log de la oportunidad:', e);
    return [];
  }
}

async function getLogEventos(limit = 100) {
  try {
    const snap = await firebase.firestore().collection('log_eventos')
      .orderBy('fecha', 'desc')
      .limit(limit)
      .get();
    return snap.docs.map(d => d.data());
  } catch(e) {
    console.error('Error obteniendo log de eventos:', e);
    return [];
  }
}

// ── NOTIFICACIONES ──
async function createNotificacion(usuarioUid, tipo, titulo, mensaje, oppId, oppNombre) {
  try {
    await firebase.firestore().collection('notificaciones').add({
      usuarioUid, tipo, titulo, mensaje,
      oppId: oppId || '', oppNombre: oppNombre || '',
      leida: false, fecha: new Date().toISOString()
    });
  } catch(e) { console.error('Error creando notificacion:', e); }
}

function onNotificacionesChange(usuarioUid, callback) {
  return firebase.firestore().collection('notificaciones')
    .where('usuarioUid', '==', usuarioUid)
    .where('leida', '==', false)
    .orderBy('fecha', 'desc')
    .limit(30)
    .onSnapshot(snap => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, err => { console.error('Error en listener de notificaciones:', err); });
}

async function markNotificacionLeida(notifId) {
  try { await firebase.firestore().collection('notificaciones').doc(notifId).update({ leida: true }); }
  catch(e) { console.error('Error marcando notificacion:', e); }
}

async function markAllNotificacionesLeidas(notifIds) {
  if (!notifIds.length) return;
  const batch = firebase.firestore().batch();
  notifIds.forEach(id => batch.update(firebase.firestore().collection('notificaciones').doc(id), { leida: true }));
  await batch.commit();
}

// ── NOTIFICATION TRIGGERS ──
const ESTADOS_FINALES = ['Ganada', 'Perdida', 'No Go', 'Cancelada'];

async function notifyAsignacion(opp, creatorUid) {
  if (!opp.responsable || opp.responsableUid === creatorUid) return;
  const allUsers = await AUTH.getAllUsers();
  const targetUser = allUsers.find(u => u.nombre === opp.responsable);
  if (!targetUser) return;
  createNotificacion(targetUser.uid, 'nueva_asignacion',
    'Nueva oportunidad asignada',
    `Te asignaron la oportunidad "${opp.nombre || opp.codigo}"`,
    opp.id, opp.nombre);
}

async function notifyEdicionTercero(opp, editorUid) {
  if (!opp.responsable || opp.responsableUid === editorUid) return;
  createNotificacion(opp.responsableUid, 'edicion_tercero',
    'Oportunidad modificada',
    `${AUTH.getSession()?.nombre || 'Alguien'} editó tu oportunidad "${opp.nombre || opp.codigo}"`,
    opp.id, opp.nombre);
}

async function checkEntregaProxima() {
  try {
    const snap = await firebase.firestore().collection('oportunidades').get();
    const allUsers = await AUTH.getAllUsers();
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    const notifs = [];
    snap.docs.forEach(doc => {
      const opp = doc.data();
      if (!opp.fechaEntrega || ESTADOS_FINALES.includes(opp.estado)) return;
      const fechaEntrega = new Date(opp.fechaEntrega + 'T00:00:00');
      const diffDays = Math.ceil((fechaEntrega - hoy) / (1000 * 60 * 60 * 24));
      if (diffDays < 0 || diffDays > 3) return;
      const targets = [];
      if (opp.responsable) {
        const t = allUsers.find(u => u.nombre === opp.responsable);
        if (t) targets.push(t.uid);
      }
      allUsers.filter(u => u.perfil === 'admin' && u.activo !== false).forEach(u => {
        if (!targets.includes(u.uid)) targets.push(u.uid);
      });
      const diasTexto = diffDays === 0 ? 'hoy' : diffDays === 1 ? 'mañana' : `en ${diffDays} días`;
      targets.forEach(uid => {
        notifs.push({ usuarioUid: uid, tipo: 'entrega_proxima', titulo: 'Entrega próxima',
          mensaje: `"${opp.nombre || opp.codigo}" se entrega ${diasTexto}`,
          oppId: doc.id, oppNombre: opp.nombre || '' });
      });
    });
    if (!notifs.length) return;

    // Verificar notificaciones existentes para evitar duplicados
    const uids = [...new Set(notifs.map(n => n.usuarioUid))];
    const oppIds = [...new Set(notifs.map(n => n.oppId))];
    const ek = (uid, oppId) => `${uid}:${oppId}`;
    const existingSet = new Set();
    for (const uid of uids) {
      const snap = await firebase.firestore().collection('notificaciones')
        .where('usuarioUid', '==', uid)
        .where('tipo', '==', 'entrega_proxima')
        .get();
      snap.docs.forEach(d => {
        const data = d.data();
        if (oppIds.includes(data.oppId)) existingSet.add(ek(uid, data.oppId));
      });
    }

    const newNotifs = notifs.filter(n => !existingSet.has(ek(n.usuarioUid, n.oppId)));
    if (!newNotifs.length) return;

    const batch = firebase.firestore().batch();
    newNotifs.forEach(n => {
      const ref = firebase.firestore().collection('notificaciones').doc();
      batch.set(ref, { ...n, leida: false, fecha: new Date().toISOString() });
    });
    await batch.commit();
  } catch(e) { console.error('Error check entrega proxima:', e); }
}

async function checkSinActualizar() {
  try {
    const snap = await firebase.firestore().collection('oportunidades').get();
    const allUsers = await AUTH.getAllUsers();
    const now = new Date();
    const notifs = [];
    snap.docs.forEach(doc => {
      const opp = doc.data();
      if (!opp.responsable || ESTADOS_FINALES.includes(opp.estado)) return;
      if (!opp.fechaModificacion && !opp.fechaCreacion) return;
      const lastUpdate = new Date(opp.fechaModificacion || opp.fechaCreacion);
      const diffDays = Math.floor((now - lastUpdate) / (1000 * 60 * 60 * 24));
      if (diffDays < 15) return;
      const t = allUsers.find(u => u.nombre === opp.responsable);
      if (!t) return;
      notifs.push({ usuarioUid: t.uid, tipo: 'sin_actualizar', titulo: 'Oportunidad sin actualizar',
        mensaje: `"${opp.nombre || opp.codigo}" lleva ${diffDays} días sin modificaciones`,
        oppId: doc.id, oppNombre: opp.nombre || '' });
    });
    if (!notifs.length) return;

    // Verificar notificaciones existentes para evitar duplicados
    const uids = [...new Set(notifs.map(n => n.usuarioUid))];
    const oppIds = [...new Set(notifs.map(n => n.oppId))];
    const ek = (uid, oppId) => `${uid}:${oppId}`;
    const existingSet = new Set();
    for (const uid of uids) {
      const snap = await firebase.firestore().collection('notificaciones')
        .where('usuarioUid', '==', uid)
        .where('tipo', '==', 'sin_actualizar')
        .get();
      snap.docs.forEach(d => {
        const data = d.data();
        if (oppIds.includes(data.oppId)) existingSet.add(ek(uid, data.oppId));
      });
    }

    const newNotifs = notifs.filter(n => !existingSet.has(ek(n.usuarioUid, n.oppId)));
    if (!newNotifs.length) return;

    const batch = firebase.firestore().batch();
    newNotifs.forEach(n => {
      const ref = firebase.firestore().collection('notificaciones').doc();
      batch.set(ref, { ...n, leida: false, fecha: new Date().toISOString() });
    });
    await batch.commit();
  } catch(e) { console.error('Error check sin actualizar:', e); }
}

// ── CLIENTES ÚNICOS ──
function getClientesUnicos() {
  if (!_cache) return [];
  return [...new Set(_cache.map(r => r.cliente).filter(Boolean))].sort();
}

// ── JSON BACKUP ──
async function exportJSONBackup() {
  try {
    const result = {};
    // Oportunidades
    const oppSnap = await firebase.firestore().collection(OPORTUNIDADES_COL).get();
    result.oportunidades = oppSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    // Usuarios
    const usersSnap = await firebase.firestore().collection('usuarios').get();
    result.usuarios = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    // Log de eventos
    const logSnap = await firebase.firestore().collection('log_eventos').get();
    result.log_eventos = logSnap.docs.map(d => d.data());
    // Counter
    const counterDoc = await firebase.firestore().collection('counters').doc('oportunidades').get();
    result.counter = counterDoc.exists ? counterDoc.data() : null;
    return result;
  } catch(e) {
    console.error('Error exportando backup:', e);
    throw e;
  }
}

async function importJSONBackup(data, onProgress) {
  try {
    // Oportunidades
    const opps = data.oportunidades || [];
    for (let i = 0; i < opps.length; i++) {
      const opp = opps[i];
      const id = opp.id;
      const { id: _id, ...docData } = opp;
      if (id) {
        await firebase.firestore().collection(OPORTUNIDADES_COL).doc(id).set(docData, { merge: true });
      } else {
        await firebase.firestore().collection(OPORTUNIDADES_COL).add(docData);
      }
      if (onProgress) onProgress(i + 1, opps.length, 'oportunidades');
    }
    // Usuarios
    const users = data.usuarios || [];
    for (let i = 0; i < users.length; i++) {
      const u = users[i];
      const id = u.id;
      const { id: _id, ...docData } = u;
      if (id) {
        await firebase.firestore().collection('usuarios').doc(id).set(docData, { merge: true });
      } else {
        await firebase.firestore().collection('usuarios').add(docData);
      }
      if (onProgress) onProgress(i + 1, users.length, 'usuarios');
    }
    // Counter
    if (data.counter) {
      await firebase.firestore().collection('counters').doc('oportunidades').set(data.counter, { merge: true });
    }
    // Log de eventos
    const logs = data.log_eventos || [];
    if (logs.length) {
      const batch = firebase.firestore().batch();
      logs.forEach(log => {
        const ref = firebase.firestore().collection('log_eventos').doc();
        batch.set(ref, log);
      });
      await batch.commit();
    }
    invalidateCache();
    return { oportunidades: opps.length, usuarios: users.length, log_eventos: logs.length };
  } catch(e) {
    console.error('Error importando backup:', e);
    throw e;
  }
}

window.CRM = {
  getData, addOportunidad, updateOportunidad, deleteOportunidad,
  getOportunidad, downloadExcel, onOportunidadesChange, getNextCodigo,
  logEvento, getLogEventos, getLogByOppId, getClientesUnicos,
  createNotificacion, onNotificacionesChange, markNotificacionLeida, markAllNotificacionesLeidas,
  notifyAsignacion, notifyEdicionTercero, checkEntregaProxima, checkSinActualizar,
  exportJSONBackup, importJSONBackup,
  COLUMNS, ESTADOS, ORIGENES, ESTADO_COLORS, invalidateCache
};
