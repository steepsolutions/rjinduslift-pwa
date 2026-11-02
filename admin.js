function actualizarBadgePendientes_(){google.script.run.withSuccessHandler(function(e){const o=document.getElementById("badgePendientes");o&&(o.textContent=e,o.classList.toggle("visible",e>0))}).withFailureHandler(function(){}).contarPendientesValidacion()}let MIS_REPORTES_DATOS=[];function cargarMisReportes_(){const e=document.getElementById("misReportesLista");e.innerHTML='<div class="loading"><div class="spinner"></div> Cargando...</div>';const o=((obtenerSesion()||{}).usuario||{}).nombre||"";google.script.run.withSuccessHandler(function(e){MIS_REPORTES_DATOS=e||[],renderizarMisReportes_(MIS_REPORTES_DATOS)}).withFailureHandler(function(o){e.innerHTML='<div class="alerta rojo">Error: '+o.message+"</div>"}).listarReportesDeTecnico(o)}function renderizarMisReportes_(e){const o=document.getElementById("misReportesLista");e&&0!==e.length?(o.innerHTML="",e.forEach(function(e){const a=e.estadoReporte||"Borrador";let t="borrador",i="";"Cerrado"===a?(t="cerrado",i="cerrado"):"Pendiente Validación"===a?(t="pendiente",i="pendiente"):"Rechazado"===a&&(t="rechazado",i="rechazado");const n=document.createElement("div");n.className="reporte-card "+i;let r='<div class="fila-1"><span class="codigo">'+e.codigo+'</span><span class="estado-pill pill-'+t+'">'+a+'</span></div><div class="cliente">'+(e.cliente||"—")+'</div><div class="equipo">'+(e.tipoEquipo||"")+" "+(e.numeroEquipo||"")+" · "+(e.tipoMantenimiento||"")+" · "+e.fecha+"</div>";"Rechazado"===a&&e.motivoRechazo&&(r+='<div class="motivo-rechazo"><b>Motivo del rechazo:</b><br>'+escaparHTML_(e.motivoRechazo)+"</div>"),n.innerHTML=r,n.onclick=function(){"Rechazado"===a?continuarReporteRechazado_(e.codigo):verDetalleReporte_(e.codigo)},o.appendChild(n)})):o.innerHTML='<div class="alerta">No tienes reportes enviados aún. Crea uno desde "Nuevo reporte".</div>'}function continuarReporteRechazado_(e){miConfirm("Este reporte fue rechazado. ¿Quieres abrirlo para corregirlo?",{icono:"✏️",titulo:"Corregir reporte",textoSi:"Abrir y corregir"}).then(function(o){o&&(irA("nuevo-reporte"),setTimeout(function(){cargarReporteParaCorregir_(e)},500))})}function cargarReporteParaCorregir_(e){miAlert("Función de corrección estará disponible en la próxima actualización.",{icono:"⏳",titulo:"En desarrollo",textoBoton:"Entendido"})}function verDetalleReporte_(e){google.script.run.withSuccessHandler(function(e){if(!e)return void miAlert("No se encontró el reporte.",{icono:"❌"});let o="Código: "+e.codigo+"\n";o+="Cliente: "+(e.cliente||"—")+"\n",o+="Equipo: "+(e.tipoEquipo||"")+" "+(e.numeroEquipo||"")+"\n",o+="Fecha: "+e.fecha+"\n",o+="Estado: "+(e.estadoReporte||"—")+"\n",o+="Tipo: "+(e.tipoMantenimiento||"—"),miAlert(o,{icono:"📋",titulo:"Detalle del reporte"})}).obtenerReportePorCodigo(e)}let PENDIENTES_DATOS=[];function cargarPendientes_(){const e=document.getElementById("pendientesLista");e.innerHTML='<div class="loading"><div class="spinner"></div> Cargando...</div>',google.script.run.withSuccessHandler(function(e){PENDIENTES_DATOS=e||[],llenarFiltroTecnicos_(PENDIENTES_DATOS),renderizarPendientes_(PENDIENTES_DATOS),actualizarBadgePendientes_()}).withFailureHandler(function(o){e.innerHTML='<div class="alerta rojo">Error: '+o.message+"</div>"}).listarPendientesValidacion()}function llenarFiltroTecnicos_(e){const o=document.getElementById("filtroPendTecnico");if(!o)return;const a=o.value;o.innerHTML='<option value="">Todos los técnicos</option>';const t={};e.forEach(function(e){e.tecnico&&(t[e.tecnico]=!0)}),Object.keys(t).sort().forEach(function(e){const a=document.createElement("option");a.value=e,a.textContent=e,o.appendChild(a)}),o.value=a}function filtrarPendientes(){const e=(document.getElementById("filtroPendTecnico")||{}).value||"",o=(document.getElementById("filtroPendFecha")||{}).value||"",a=((document.getElementById("filtroPendCliente")||{}).value||"").toLowerCase().trim();renderizarPendientes_(PENDIENTES_DATOS.filter(function(t){return!(e&&t.tecnico!==e||o&&t.fecha!==o||a&&-1===String(t.cliente||"").toLowerCase().indexOf(a))}))}function renderizarPendientes_(e){const o=document.getElementById("pendientesLista");e&&0!==e.length?(o.innerHTML="",e.forEach(function(e){const a=document.createElement("div");a.className="reporte-card pendiente";const t=e.fechaEnvio?new Date(e.fechaEnvio).toLocaleString("es-VE",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}):"—";a.innerHTML='<div class="fila-1"><span class="codigo">'+e.codigo+'</span><span class="estado-pill pill-pendiente">Pendiente</span></div><div class="cliente">'+(e.cliente||"—")+'</div><div class="equipo">'+(e.tipoEquipo||"")+" "+(e.numeroEquipo||"")+" · "+(e.tipoMantenimiento||"")+'</div><div class="equipo" style="margin-top:4px;color:var(--naranja);font-weight:700;">👨‍🔧 '+(e.tecnico||"Sin técnico")+" · "+t+"</div>",a.onclick=function(){abrirRevisar_(e.codigo)},o.appendChild(a)})):o.innerHTML='<div class="alerta">No hay reportes pendientes con esos filtros.</div>'}let REPORTE_ACTUAL=null;function abrirRevisar_(e){document.querySelectorAll(".vista").forEach(function(e){e.classList.remove("activa")}),document.getElementById("vista-revisar").classList.add("activa");const o=document.getElementById("revisarContenido");o.innerHTML='<div class="loading"><div class="spinner"></div> Cargando reporte...</div>',google.script.run.withSuccessHandler(function(e){e?(REPORTE_ACTUAL=e,renderizarRevisar_(e)):o.innerHTML='<div class="alerta rojo">No se encontró el reporte.</div>'}).withFailureHandler(function(e){o.innerHTML='<div class="alerta rojo">Error: '+e.message+"</div>"}).obtenerReportePorCodigo(e)}function renderizarRevisar_(e){const o=document.getElementById("revisarContenido"),a=String(e["Checklist R"]||"").split(";").map(function(e){return e.trim()}).filter(Boolean),t=String(e["Checklist E"]||"").split(";").map(function(e){return e.trim()}).filter(Boolean),i=String(e["Checklist P"]||"").split(";").map(function(e){return e.trim()}).filter(Boolean);let n="";n+='<div class="revisar-header"><div class="codigo">'+e["Código"]+'</div><div class="meta">👨‍🔧 '+(e["Mecánico Principal"]||e["Responsable Principal"]||"Sin técnico")+"<br>🏭 "+(e.Cliente||"—")+" · "+(e["Tipo Equipo"]||"")+" "+(e["Número Equipo"]||"")+"<br>📅 "+e.Fecha+" · "+(e["Tipo Mantenimiento"]||"")+"</div></div>",n+='<div class="revisar-seccion"><h3>📋 Datos Generales</h3><div class="contenido">'+campoRevisar_("Área",e["Área"])+campoRevisar_("Solicitante",e.Solicitante)+campoRevisar_("Tiempo de parada",e["Tiempo Parada"])+campoRevisar_("Horómetro",e["Horómetro"])+"</div></div>",n+='<div class="revisar-seccion"><h3>✅ Checklist</h3><div class="contenido">',a.length&&(n+='<div class="campo"><b style="color:#4a7a15">R — '+a.length+" ítems</b><ul>",a.forEach(function(e){n+="<li>"+escaparHTML_(e)+"</li>"}),n+="</ul></div>"),t.length&&(n+='<div class="campo"><b style="color:#1c4a8a">E — '+t.length+" ítems</b><ul>",t.forEach(function(e){n+="<li>"+escaparHTML_(e)+"</li>"}),n+="</ul></div>"),i.length&&(n+='<div class="campo"><b style="color:#8a1f13">P — '+i.length+" ítems</b><ul>",i.forEach(function(e){n+="<li>"+escaparHTML_(e)+"</li>"}),n+="</ul></div>"),n+="</div></div>",(e["Motivo Ingreso"]||e["Diagnóstico"]||e["Actividades Realizadas"]||e["Repuestos Usados"]||e.Recomendaciones||e.Observaciones)&&(n+='<div class="revisar-seccion"><h3>📝 Informe Técnico del Técnico</h3><div class="contenido">'+campoRevisar_("Motivo",e["Motivo Ingreso"])+campoRevisar_("Diagnóstico",e["Diagnóstico"])+campoRevisar_("Actividades adicionales",e["Actividades Realizadas"])+campoRevisar_("Repuestos usados",e["Repuestos Usados"])+campoRevisar_("Recomendaciones",e.Recomendaciones)+campoRevisar_("Observaciones",e.Observaciones)+"</div></div>"),n+='<div class="revisar-seccion"><h3>📌 Estado del Equipo</h3><div class="contenido">'+campoRevisar_("Estado final",e["Estado Equipo"])+campoRevisar_("Firmado por",e["Nombre Firmante"])+"</div></div>",n+='<div class="costos-seccion" id="costosRevisar"><h3>💰 Costos del Servicio <span class="badge-admin">👑 SOLO ADMIN</span></h3><label style="margin-top:0;">Nivel de mano de obra</label><div class="niveles-costo" id="nivelesCosto"><button type="button" class="nivel-costo-btn" data-nivel="A" onclick="seleccionarNivelCosto(\'A\')"><span class="letra">A</span><span class="precio" id="precioNivelA">$—/h</span></button><button type="button" class="nivel-costo-btn activo" data-nivel="B" onclick="seleccionarNivelCosto(\'B\')"><span class="letra">B</span><span class="precio" id="precioNivelB">$—/h</span></button><button type="button" class="nivel-costo-btn" data-nivel="C" onclick="seleccionarNivelCosto(\'C\')"><span class="letra">C</span><span class="precio" id="precioNivelC">$—/h</span></button></div><label>Horas trabajadas</label><input type="number" id="horasTrabajadas" step="0.25" min="0" placeholder="Ej. 3.5" oninput="recalcularCostos()" style="margin-bottom:12px;"><label>📦 Repuestos y materiales</label><div class="buscador-repuestos"><input type="text" class="buscador-input" id="buscadorRepuestos" placeholder="Buscar repuesto..." autocomplete="off" oninput="buscarRepuestosSugerencias()" onfocus="buscarRepuestosSugerencias()"><div class="sugerencias" id="sugerenciasRepuestos"></div></div><div class="repuestos-cargados" id="repuestosCargados"></div><label>📋 Otros (imprevistos)</label><div class="otros-lista" id="otrosLista"></div><button type="button" class="btn-agregar-mini" onclick="agregarOtroItem()">+ Agregar otro</button><div class="toggle-recargo" id="toggleRecargo" onclick="toggleRecargo(event)"><div class="checkbox">✓</div><span class="texto">Aplicar recargo por emergencia</span><input type="number" class="porcentaje" id="recargoPorcentaje" value="30" min="0" max="100" onclick="event.stopPropagation()" oninput="recalcularCostos()"><span style="font-size:12px;font-weight:800;color:#8a6200;">%</span></div><div class="tasa-input-wrap"><label>Tasa BCV (Bs/USD) *</label><input type="number" id="tasaBCV" step="0.0001" min="0" placeholder="36.5432" oninput="recalcularCostos()"></div><div class="totales-resumen" id="totalesResumen"><div class="fila"><span>Subtotal Mano Obra</span><span id="txtSubtotalMO">$0.00</span></div><div class="fila"><span>Subtotal Repuestos</span><span id="txtSubtotalRep">$0.00</span></div><div class="fila"><span>Subtotal Otros</span><span id="txtSubtotalOtros">$0.00</span></div><div class="fila"><span>Subtotal General</span><span id="txtSubtotal">$0.00</span></div><div class="fila" id="filaRecargo" style="display:none"><span>Recargo <span id="txtRecargoPct">0</span>%</span><span id="txtRecargo">$0.00</span></div><div class="fila"><span>IVA 16%</span><span id="txtIVA">$0.00</span></div><div class="fila total"><span>TOTAL USD</span><span id="txtTotalUSD">$0.00</span></div><div class="fila bs"><span>Total Bs</span><span id="txtTotalBs">Bs 0,00</span></div><div class="fila tasa-aplicada" id="filaTasaAplicada" style="display:none"><span id="txtTasaInfo">📅 Tasa aplicada</span></div></div></div>',n+='<div class="rechazo-form" id="rechazoForm"><label>Motivo del rechazo (obligatorio)</label><textarea id="motivoRechazo" placeholder="Explica al técnico qué debe corregir..."></textarea><div class="botones"><button type="button" class="btn-cancelar" onclick="cancelarRechazo()">Cancelar</button><button type="button" class="btn-confirmar" onclick="confirmarRechazo()">Confirmar rechazo</button></div></div>',n+='<div class="revisar-acciones"><button class="btn-rechazar" onclick="abrirRechazo()" id="btnRechazar">↩️ Rechazar</button><button class="btn-aprobar" onclick="aprobarReporte()" id="btnAprobar">✅ Aprobar y Enviar</button></div>',o.innerHTML=n,setTimeout(function(){inicializarCostosParaRevisar_()},200)}function campoRevisar_(e,o){return o?'<div class="campo"><b>'+e+":</b> "+escaparHTML_(o).replace(/\n/g,"<br>")+"</div>":""}function inicializarCostosParaRevisar_(){COSTOS_ESTADO.repuestos=[],COSTOS_ESTADO.otros=[],COSTOS_ESTADO.aplicarRecargo=!1,COSTOS_ESTADO.nivel="B",0===Object.keys(COSTOS_ESTADO.tarifas).length?cargarTarifasCostos_():actualizarPreciosNiveles_();const e=document.getElementById("toggleRecargo");e&&e.classList.remove("activo"),document.getElementById("recargoPorcentaje").value=30,document.getElementById("horasTrabajadas").value="",document.getElementById("tasaBCV").value="",document.getElementById("buscadorRepuestos").value="",renderizarRepuestosCargados_(),renderizarOtros_(),recalcularCostos()}function abrirRechazo(){document.getElementById("rechazoForm").classList.add("activo"),document.getElementById("motivoRechazo").focus()}function cancelarRechazo(){document.getElementById("rechazoForm").classList.remove("activo"),document.getElementById("motivoRechazo").value=""}function confirmarRechazo(){const e=(document.getElementById("motivoRechazo").value||"").trim();if(!e)return miAlert("Debes explicar el motivo del rechazo.",{icono:"⚠️",titulo:"Motivo requerido"}),void document.getElementById("motivoRechazo").focus();miConfirm("¿Confirmas el rechazo? El técnico recibirá el motivo por WhatsApp.",{icono:"⚠️",titulo:"Confirmar rechazo",textoSi:"Sí, rechazar"}).then(function(o){if(!o)return;const a=document.getElementById("btnAprobar"),t=document.getElementById("btnRechazar");a.disabled=!0,t.disabled=!0,google.script.run.withSuccessHandler(function(e){a.disabled=!1,t.disabled=!1,e&&e.exito?(actualizarBadgePendientes_(),miExito("Reporte rechazado","El técnico recibirá el motivo por WhatsApp.").then(function(){e.linkWA&&window.open(e.linkWA,"_blank"),volverAPendientes()})):miError("Error al rechazar",e&&e.error||"Error desconocido")}).withFailureHandler(function(e){a.disabled=!1,t.disabled=!1,miError("Error de conexión",e.message)}).rechazarReporte(REPORTE_ACTUAL["Código"],e)})}function aprobarReporte(){if(!REPORTE_ACTUAL)return;const e=parseFloat((document.getElementById("tasaBCV")||{}).value)||0;if(e<=0)return miAlert("Debes ingresar la Tasa BCV antes de aprobar.",{icono:"⚠️",titulo:"Tasa BCV requerida"}),document.getElementById("tasaBCV").scrollIntoView({behavior:"smooth",block:"center"}),void document.getElementById("tasaBCV").focus();const o=parseFloat((document.getElementById("horasTrabajadas")||{}).value)||0;if(o<=0)return miAlert("Debes ingresar las horas trabajadas.",{icono:"⚠️",titulo:"Horas requeridas"}),document.getElementById("horasTrabajadas").scrollIntoView({behavior:"smooth",block:"center"}),void document.getElementById("horasTrabajadas").focus();miConfirm("¿Aprobar y enviar el informe al cliente? Se generarán los PDFs y se enviarán los correos.",{icono:"✅",titulo:"Confirmar aprobación",textoSi:"Aprobar y enviar"}).then(function(a){if(!a)return;const t={nivel:COSTOS_ESTADO.nivel,horas:o,repuestos:COSTOS_ESTADO.repuestos,otros:COSTOS_ESTADO.otros,aplicarRecargo:COSTOS_ESTADO.aplicarRecargo,recargoPorcentaje:COSTOS_ESTADO.recargoPorcentaje,tasaBCV:e},i=document.getElementById("btnAprobar"),n=document.getElementById("btnRechazar");i.disabled=!0,n.disabled=!0,i.textContent="Procesando...";const r=document.getElementById("enviandoOverlay");r.classList.add("activo"),document.getElementById("enviandoTitulo").textContent="Aprobando reporte...",document.getElementById("enviandoMensaje").textContent="Generando PDFs y enviando correos. Puede tardar 30-60 segundos...",google.script.run.withSuccessHandler(function(e){r.classList.remove("activo"),i.disabled=!1,n.disabled=!1,i.textContent="✅ Aprobar y Enviar",e&&e.exito?(actualizarBadgePendientes_(),mostrarPantallaExito_(e)):miError("Error al aprobar",e&&e.error||"Error desconocido")}).withFailureHandler(function(e){r.classList.remove("activo"),i.disabled=!1,n.disabled=!1,i.textContent="✅ Aprobar y Enviar",miError("Error de conexión",e.message)}).aprobarYEnviar(REPORTE_ACTUAL["Código"],t)})}function volverAPendientes(){REPORTE_ACTUAL=null,irA("pendientes")}

/* ================================================================
 * FASE 6.4e — DASHBOARD OPERATIVO
 * ================================================================ */

// Engancha la carga del dashboard al sistema de vistas existente
(function () {
  const cargarVistaAnterior = cargarVista;
  cargarVista = function (vista) {
    cargarVistaAnterior(vista);
    if (vista === 'dashboard-admin') cargarDashboardOperativo_();
  };
})();

async function cargarDashboardOperativo_() {
  const v = document.getElementById('vista-dashboard-admin');
  if (!v) return;
  v.innerHTML = '<h2>📊 Dashboard operativo</h2><div class="loading"><div class="spinner"></div> Cargando...</div>';
  try {
    const d = await apiFetch(API_URL + '?accion=obtenerDashboardOperativo');
    v.innerHTML = htmlDashboardOperativo_(d);
  } catch (err) {
    v.innerHTML = '<h2>📊 Dashboard operativo</h2>' +
      '<div class="alerta rojo">Error: ' + escaparHTML_(err.message) + '</div>' +
      '<button class="dash-btn-refrescar" onclick="cargarDashboardOperativo_()">🔄 Reintentar</button>';
  }
}

function htmlDashboardOperativo_(d) {
  const kpi = function (numero, etiqueta, rojo) {
    return '<div class="dash-kpi' + (rojo && numero > 0 ? ' rojo' : '') + '">' +
      '<div class="num">' + numero + '</div><div class="lbl">' + etiqueta + '</div></div>';
  };
  const vacioMes = 'Aún no hay reportes aprobados este mes.';

  return '' +
    '<div class="dash-cabecera"><h2>📊 Dashboard operativo</h2>' +
    '<button class="dash-btn-refrescar" onclick="cargarDashboardOperativo_()">🔄 Actualizar</button></div>' +
    dashTabs_('operativo') +

    '<div class="dash-kpis">' +
      kpi(d.totalMes, 'Reportes del mes') +
      kpi(d.pendientes.total, 'Por aprobar', true) +
      kpi(d.equipos.vencidos, 'Equipos vencidos', true) +
      kpi(d.equipos.porVencer, 'Por vencer') +
    '</div>' +

    dashSeccion_('📅 Reportes del mes por situación (' + escaparHTML_(d.mes) + ')',
      dashBarras_(d.porSituacion, 'Aún no hay reportes este mes.')) +

    dashSeccion_('🚜 Equipos atendidos por estado (aprobados: ' + d.totalCerrados + ')',
      dashBarras_(d.porEstado, vacioMes)) +

    dashSeccion_('🔧 Servicios por técnico (aprobados)',
      dashBarras_(d.porTecnico, vacioMes)) +

    dashSeccion_('⚠️ Equipos vencidos o por vencer',
      dashListaEquipos_(d.equipos.lista, d.equipos.sinFecha)) +

    dashSeccion_('⏳ Reportes pendientes de aprobar',
      dashListaPendientes_(d.pendientes.lista));
}

function dashSeccion_(titulo, cuerpo) {
  return '<div class="dash-seccion"><h3>' + titulo + '</h3>' + cuerpo + '</div>';
}

function dashBarras_(items, textoVacio) {
  if (!items || !items.length) return '<div class="alerta">' + textoVacio + '</div>';
  const max = Math.max.apply(null, items.map(function (i) { return i.cantidad; }));
  return items.map(function (i) {
    const pct = max > 0 ? Math.round(i.cantidad * 100 / max) : 0;
    return '<div class="dash-barra">' +
      '<div class="dash-barra-top"><span>' + escaparHTML_(i.nombre) + '</span><b>' + i.cantidad + '</b></div>' +
      '<div class="dash-barra-fondo"><div class="dash-barra-relleno" style="width:' + pct + '%"></div></div>' +
      '</div>';
  }).join('');
}

function dashListaEquipos_(lista, sinFecha) {
  const aviso = sinFecha > 0
    ? '<div class="alerta" style="margin-top:10px;">ℹ️ ' + sinFecha + ' equipo(s) no tienen fecha de último servicio registrada y no se pueden evaluar.</div>'
    : '';
  if (!lista || !lista.length) {
    return sinFecha > 0
      ? aviso
      : '<div class="alerta">Todos los equipos están al día. 🎉</div>';
  }
  return lista.map(function (s) {
    const estado = ESTADO_LABEL[s.estado] || ESTADO_LABEL.pendiente;
    const desc = [s.tipo, s.marca].filter(Boolean).join(' ');
    return '<div class="tarea' + (s.estado === 'vencido' ? ' urgente' : '') + '">' +
      '<span class="badge ' + estado.clase + '">' + estado.icono + ' ' + estado.texto + '</span>' +
      '<div class="eq">' + escaparHTML_(s.codigo) + ' — ' + escaparHTML_(desc) + '</div>' +
      '<div class="cliente">' + escaparHTML_(s.cliente || '—') +
      (s.proximaFecha ? ' · Próximo: ' + escaparHTML_(s.proximaFecha) : '') + '</div></div>';
  }).join('') + aviso;
}

function dashListaPendientes_(lista) {
  if (!lista || !lista.length) return '<div class="alerta">No hay reportes esperando aprobación. ✅</div>';
  return lista.map(function (r) {
    const equipo = [r.numeroEquipo, r.tipoEquipo].filter(Boolean).join(' — ');
    return '<div class="tarea" onclick="abrirRevisar_(\'' + escaparAttr_(r.codigo) + '\')">' +
      '<span class="badge">⏳ Pendiente</span>' +
      '<div class="eq">' + escaparHTML_(r.codigo) + (equipo ? ' — ' + escaparHTML_(equipo) : '') + '</div>' +
      '<div class="cliente">' + escaparHTML_(r.cliente || '—') + ' · ' + escaparHTML_(r.fecha || '') +
      (r.tecnico ? ' · ' + escaparHTML_(r.tecnico) : '') + '</div></div>';
  }).join('');
}

/* ================================================================
 * FASE 6.4f — DASHBOARD FINANCIERO
 * ================================================================ */

function dashUSD_(n) {
  return '$' + (Number(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function dashTabs_(activa) {
  const tab = function (id, texto, funcion) {
    return '<button class="dash-tab' + (activa === id ? ' activo' : '') + '" onclick="' + funcion + '()">' + texto + '</button>';
  };
  return '<div class="dash-tabs">' +
    tab('operativo', '📊 Operativo', 'cargarDashboardOperativo_') +
    tab('financiero', '💰 Financiero', 'cargarDashboardFinanciero_') +
    tab('historial', '📚 Historial', 'cargarHistorial_') +
    '</div>';
}

async function cargarDashboardFinanciero_() {
  const v = document.getElementById('vista-dashboard-admin');
  if (!v) return;
  v.innerHTML = '<h2>💰 Dashboard financiero</h2>' + dashTabs_('financiero') +
    '<div class="loading"><div class="spinner"></div> Cargando...</div>';
  try {
    const d = await apiFetch(API_URL + '?accion=obtenerDashboardFinanciero');
    v.innerHTML = htmlDashboardFinanciero_(d);
  } catch (err) {
    v.innerHTML = '<h2>💰 Dashboard financiero</h2>' + dashTabs_('financiero') +
      '<div class="alerta rojo">Error: ' + escaparHTML_(err.message) + '</div>' +
      '<button class="dash-btn-refrescar" onclick="cargarDashboardFinanciero_()">🔄 Reintentar</button>';
  }
}

function dashVariacion_(actual, anterior) {
  if (!(anterior > 0)) return 'Sin datos del mes anterior';
  const pct = (actual - anterior) / anterior * 100;
  return (pct >= 0 ? '▲ ' : '▼ ') + Math.abs(pct).toFixed(1) + '% vs mes anterior';
}

function htmlDashboardFinanciero_(d) {
  const a = d.actual;
  const p = d.anterior;
  const ticket = a.conCosto > 0 ? a.totalUSD / a.conCosto : 0;

  const kpi = function (valor, etiqueta, sub) {
    return '<div class="dash-kpi"><div class="num" style="font-size:22px;">' + valor + '</div>' +
      '<div class="lbl">' + etiqueta + '</div>' +
      (sub ? '<div class="sub">' + sub + '</div>' : '') + '</div>';
  };

  const aviso = d.sinCostos > 0
    ? '<div class="alerta">ℹ️ ' + d.sinCostos + ' reporte(s) aprobado(s) este mes no tienen costos cargados y no entran en estos montos.</div>'
    : '';

  return '' +
    '<div class="dash-cabecera"><h2>💰 Dashboard financiero</h2>' +
    '<button class="dash-btn-refrescar" onclick="cargarDashboardFinanciero_()">🔄 Actualizar</button></div>' +
    dashTabs_('financiero') +

    '<div class="dash-kpis">' +
      kpi(dashUSD_(a.totalUSD), 'Facturado USD', dashVariacion_(a.totalUSD, p.totalUSD)) +
      kpi(formatearBs_(a.totalBs), 'Facturado Bs', '') +
      kpi(a.conCosto, 'Reportes con costo', escaparHTML_(d.mes)) +
      kpi(dashUSD_(ticket), 'Ticket promedio', 'por reporte') +
    '</div>' +
    aviso +

    dashSeccion_('🧮 Composición del total (' + escaparHTML_(d.mes) + ')', dashComposicion_(a)) +

    dashSeccion_('📈 Mes anterior vs mes actual (USD)',
      dashBarrasMonto_([
        { nombre: 'Mes anterior (' + d.mesAnterior + ')', valor: p.totalUSD },
        { nombre: 'Mes actual (' + d.mes + ')', valor: a.totalUSD }
      ], '')) +

    dashSeccion_('🏢 Total por cliente (mes actual)',
      dashBarrasMonto_(d.porCliente.slice(0, 8).map(function (c) {
        return { nombre: c.nombre + ' · ' + c.reportes + ' rep.', valor: c.totalUSD };
      }), 'Aún no hay reportes aprobados con costos este mes.'));
}

/* ================================================================
 * FASE 6.5 — HISTORIAL DE REPORTES
 * ================================================================ */

const HISTORIAL = { filtros: {}, items: [], total: 0, opciones: null };
const HIST_CLASE_ESTADO = { 'Cerrado': 'verde', 'Rechazado': 'rojo' };
const HIST_IDS_FILTROS = ['histDesde', 'histHasta', 'histCliente', 'histTecnico', 'histSituacion', 'histEstadoEquipo', 'histEquipo'];
const HIST_CARGANDO = '<div class="loading"><div class="spinner"></div> Cargando...</div>';

// Solo deja pasar enlaces http/https (evita enlaces maliciosos)
function urlSegura_(url) {
  return /^https?:\/\//i.test(String(url || '')) ? String(url) : '';
}

function pedirHistorial_(filtros, offset) {
  return apiFetch(API_URL + '?accion=listarHistorialReportes', {
    method: 'POST',
    body: JSON.stringify({ args: [Object.assign({}, filtros, { offset: offset })] })
  });
}

async function cargarHistorial_() {
  const v = document.getElementById('vista-dashboard-admin');
  if (!v) return;
  v.innerHTML = '<h2>📚 Historial de reportes</h2>' + dashTabs_('historial') + HIST_CARGANDO;
  try {
    const d = await pedirHistorial_({}, 0);
    HISTORIAL.filtros = {};
    HISTORIAL.opciones = d.opciones;
    HISTORIAL.items = d.items;
    HISTORIAL.total = d.total;
    v.innerHTML = htmlHistorial_();
    pintarResultadosHistorial_();
  } catch (err) {
    v.innerHTML = '<h2>📚 Historial de reportes</h2>' + dashTabs_('historial') +
      '<div class="alerta rojo">Error: ' + escaparHTML_(err.message) + '</div>' +
      '<button class="dash-btn-refrescar" onclick="cargarHistorial_()">🔄 Reintentar</button>';
  }
}

function histSelect_(id, etiqueta, valores) {
  return '<label>' + etiqueta + '</label><select id="' + id + '"><option value="">Todos</option>' +
    valores.map(function (x) {
      return '<option value="' + escaparHTML_(x) + '">' + escaparHTML_(x) + '</option>';
    }).join('') + '</select>';
}

function htmlHistorial_() {
  const o = HISTORIAL.opciones;
  return '' +
    '<div class="dash-cabecera"><h2>📚 Historial de reportes</h2>' +
    '<button class="dash-btn-refrescar" onclick="cargarHistorial_()">🔄 Actualizar</button></div>' +
    dashTabs_('historial') +

    '<details class="hist-filtros" id="histFiltros" open><summary>🔎 Filtros</summary>' +
      '<div class="hist-fechas">' +
        '<div><label>Desde</label><input type="date" id="histDesde"></div>' +
        '<div><label>Hasta</label><input type="date" id="histHasta"></div>' +
      '</div>' +
      histSelect_('histCliente', 'Cliente', o.clientes) +
      histSelect_('histTecnico', 'Técnico', o.tecnicos) +
      histSelect_('histSituacion', 'Situación del reporte', o.situaciones) +
      histSelect_('histEstadoEquipo', 'Estado del equipo', o.estadosEquipo) +
      histSelect_('histEquipo', 'Equipo', o.equipos) +
      '<div class="hist-botones">' +
        '<button class="dash-btn-refrescar" onclick="buscarHistorial_()">🔎 Buscar</button>' +
        '<button class="dash-btn-refrescar dash-btn-gris" onclick="limpiarHistorial_()">Limpiar</button>' +
      '</div>' +
    '</details>' +

    '<div id="histResultados"></div>';
}

function leerFiltrosHistorial_() {
  const valor = function (id) { return (document.getElementById(id) || {}).value || ''; };
  return {
    desde: valor('histDesde'),
    hasta: valor('histHasta'),
    cliente: valor('histCliente'),
    tecnico: valor('histTecnico'),
    situacion: valor('histSituacion'),
    estadoEquipo: valor('histEstadoEquipo'),
    equipo: valor('histEquipo')
  };
}

async function buscarHistorial_() {
  const cont = document.getElementById('histResultados');
  if (!cont) return;
  HISTORIAL.filtros = leerFiltrosHistorial_();
  cont.innerHTML = HIST_CARGANDO;
  try {
    const d = await pedirHistorial_(HISTORIAL.filtros, 0);
    HISTORIAL.items = d.items;
    HISTORIAL.total = d.total;
    const panel = document.getElementById('histFiltros');
    if (panel) panel.open = false;
    pintarResultadosHistorial_();
  } catch (err) {
    cont.innerHTML = '<div class="alerta rojo">Error: ' + escaparHTML_(err.message) + '</div>';
  }
}

function limpiarHistorial_() {
  HIST_IDS_FILTROS.forEach(function (id) {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  buscarHistorial_();
}

async function cargarMasHistorial_() {
  try {
    const d = await pedirHistorial_(HISTORIAL.filtros, HISTORIAL.items.length);
    HISTORIAL.items = HISTORIAL.items.concat(d.items);
    HISTORIAL.total = d.total;
    pintarResultadosHistorial_();
  } catch (err) {
    miError('Error', err.message);
  }
}

function pintarResultadosHistorial_() {
  const cont = document.getElementById('histResultados');
  if (!cont) return;
  if (!HISTORIAL.items.length) {
    cont.innerHTML = '<div class="alerta">No hay reportes con esos filtros.</div>';
    return;
  }
  const hayMas = HISTORIAL.items.length < HISTORIAL.total;
  cont.innerHTML =
    '<div class="hist-conteo">' + HISTORIAL.items.length + ' de ' + HISTORIAL.total + ' reportes</div>' +
    HISTORIAL.items.map(histFila_).join('') +
    (hayMas
      ? '<button class="dash-btn-refrescar" style="width:100%;margin-top:10px;" onclick="cargarMasHistorial_()">Cargar más</button>'
      : '');
}

function histFila_(r) {
  const clase = HIST_CLASE_ESTADO[r.estadoReporte] || '';
  const equipo = [r.numeroEquipo, r.tipoEquipo].filter(Boolean).join(' — ');
  return '<div class="tarea" onclick="verDetalleHistorial_(\'' + escaparAttr_(r.codigo) + '\')">' +
    '<span class="badge ' + clase + '">' + escaparHTML_(r.estadoReporte || 'Sin estado') + '</span>' +
    '<div class="eq">' + escaparHTML_(r.codigo) + (equipo ? ' — ' + escaparHTML_(equipo) : '') + '</div>' +
    '<div class="cliente">' + escaparHTML_(r.cliente || '—') + ' · ' + escaparHTML_(r.fecha) +
    (r.tecnico ? ' · ' + escaparHTML_(r.tecnico) : '') + '</div></div>';
}

function verDetalleHistorial_(codigo) {
  const r = HISTORIAL.items.find(function (x) { return x.codigo === codigo; });
  if (!r) return;
  const dato = function (etiqueta, valor) {
    return etiqueta + ': <b>' + escaparHTML_(valor || '—') + '</b><br>';
  };
  const enlace = function (url, texto) {
    const u = urlSegura_(url);
    return u ? '<a href="' + escaparHTML_(u) + '" target="_blank">' + texto + '</a><br>' : '';
  };
  abrirModal_({
    icono: '📄',
    titulo: codigo,
    mensaje:
      dato('Fecha', r.fecha) +
      dato('Cliente', r.cliente) +
      dato('Equipo', [r.numeroEquipo, r.tipoEquipo].filter(Boolean).join(' — ')) +
      dato('Técnico', r.tecnico) +
      dato('Tipo de mantenimiento', r.tipoMantenimiento) +
      dato('Situación del reporte', r.estadoReporte) +
      dato('Estado del equipo', r.estadoEquipo) +
      (r.motivoRechazo ? dato('Motivo del rechazo', r.motivoRechazo) : '') +
      '<hr style="margin:10px 0;border:none;border-top:1px solid #ddd">' +
      enlace(r.pdfTecnico, '📄 Informe técnico (PDF)') +
      enlace(r.pdfFinanciero, '🔒 Informe financiero (PDF)') +
      enlace(r.carpetaUrl, '📸 Carpeta de fotos'),
    botones: [{ texto: 'Cerrar', clase: 'gris' }]
  });
}
function dashComposicion_(a) {
  if (!(a.totalUSD > 0)) return '<div class="alerta">Aún no hay reportes aprobados con costos este mes.</div>';
  const partes = [
    { nombre: 'Mano de obra', valor: a.manoObra,  color: '#F5821F' },
    { nombre: 'Repuestos',    valor: a.repuestos, color: '#1c4a8a' },
    { nombre: 'Otros',        valor: a.otros,     color: '#8a8a8a' },
    { nombre: 'Recargo',      valor: a.recargo,   color: '#e0b400' },
    { nombre: 'IVA',          valor: a.iva,       color: '#6AAA1E' }
  ];
  const pct = function (valor) { return valor / a.totalUSD * 100; };

  const barra = '<div class="dash-apilada">' + partes
    .filter(function (x) { return x.valor > 0; })
    .map(function (x) { return '<div style="width:' + pct(x.valor).toFixed(2) + '%;background:' + x.color + '"></div>'; })
    .join('') + '</div>';

  const leyenda = partes.map(function (x) {
    return '<div class="dash-leyenda-fila"><span class="dash-leyenda-color" style="background:' + x.color + '"></span>' +
      x.nombre + ' <small>(' + pct(x.valor).toFixed(1) + '%)</small><span class="monto">' + dashUSD_(x.valor) + '</span></div>';
  }).join('');

  return barra + leyenda;
}

function dashBarrasMonto_(items, textoVacio) {
  if (!items || !items.length) return '<div class="alerta">' + textoVacio + '</div>';
  const max = Math.max.apply(null, items.map(function (i) { return i.valor; }));
  return items.map(function (i) {
    const pct = max > 0 ? Math.round(i.valor * 100 / max) : 0;
    return '<div class="dash-barra">' +
      '<div class="dash-barra-top"><span>' + escaparHTML_(i.nombre) + '</span><b>' + dashUSD_(i.valor) + '</b></div>' +
      '<div class="dash-barra-fondo"><div class="dash-barra-relleno" style="width:' + pct + '%"></div></div>' +
      '</div>';
  }).join('');
}

/* ================================================================
 * FASE B2 — AUTENTICACIÓN (login por usuario + PIN, token de sesión)
 * Estas funciones reemplazan a las de core.js (admin.js carga después).
 * ================================================================ */

const CLAVE_ULTIMO_USUARIO = 'rj_ultimo_usuario';

// ---------- Sesión local ----------
function guardarSesion_(usuario, token) {
  localStorage.setItem(CLAVE_SESION, JSON.stringify({
    ok: true, ts: Date.now(), token: token, usuario: usuario
  }));
}

// La caducidad real la decide el servidor; aquí solo se exige que haya token
function sesionValida() {
  try {
    const s = JSON.parse(localStorage.getItem(CLAVE_SESION));
    return !!(s && s.ok && s.token);
  } catch (e) {
    return false;
  }
}

// ---------- apiFetch: ahora envía el token en cada llamada ----------
async function apiFetch(url, options) {
  options = options || {};
  const sesion = obtenerSesion();
  const token = (sesion && sesion.token) || '';

  if (options.method === 'POST') {
    // text/plain evita el preflight de CORS; el token va dentro del cuerpo
    options.headers = { 'Content-Type': 'text/plain;charset=utf-8' };
    const cuerpo = JSON.parse(options.body || '{}');
    cuerpo.token = token;
    // Corrección de un reporte rechazado: el envío lleva el código del original
    if (CORRECCION.codigo && /accion=guardarReporteDesdeApp/.test(url) && cuerpo.datos) {
      cuerpo.datos.continuarCodigo = CORRECCION.codigo;
    }
    options.body = JSON.stringify(cuerpo);
  } else if (token) {
    url += (url.indexOf('?') === -1 ? '?' : '&') + 'token=' + encodeURIComponent(token);
  }

  const response = await fetch(url, options);
  const json = await response.json();

  if (json.__error) {
    if (json.__error === 'SESION') {
      sesionExpirada_();
      throw new Error('Tu sesión expiró. Ingresa de nuevo.');
    }
    if (json.__error === 'SIN_PERMISO') throw new Error('No tienes permiso para esta acción.');
    throw new Error(json.__error);
  }
  return json.data !== undefined ? json.data : json;
}

// ---------- Pantalla de login ----------
function limpiarPin_() {
  [0, 1, 2, 3].forEach(function (i) { document.getElementById('pin' + i).value = ''; });
}

function mostrarLogin_(mensaje) {
  document.getElementById('loginOverlay').classList.remove('oculto');
  cerrarMenu();
  limpiarPin_();
  document.getElementById('loginError').textContent = mensaje || '';
  cargarUsuariosLogin_();
}

function sesionExpirada_() {
  localStorage.removeItem(CLAVE_SESION);
  mostrarLogin_('Tu sesión expiró. Ingresa de nuevo.');
}

// Crea (si no existe) y llena el selector de usuario sobre las casillas del PIN
async function cargarUsuariosLogin_() {
  let sel = document.getElementById('loginUsuario');
  if (!sel) {
    const filaPin = document.getElementById('pin0').parentElement;
    sel = document.createElement('select');
    sel.id = 'loginUsuario';
    filaPin.parentElement.insertBefore(sel, filaPin);
    sel.addEventListener('change', function () {
      try { localStorage.setItem(CLAVE_ULTIMO_USUARIO, this.value); } catch (e) { /* sin almacenamiento */ }
      document.getElementById('pin0').focus();
    });
  }
  sel.innerHTML = '<option value="">Cargando usuarios...</option>';
  try {
    const lista = await apiFetch(API_URL + '?accion=listarUsuariosLogin');
    const ultimo = localStorage.getItem(CLAVE_ULTIMO_USUARIO) || '';
    sel.innerHTML = '<option value="">Selecciona tu usuario</option>' +
      lista.map(function (u) {
        return '<option value="' + escaparHTML_(u.nombre) + '"' +
          (u.nombre === ultimo ? ' selected' : '') + '>' + escaparHTML_(u.nombre) + '</option>';
      }).join('');
  } catch (err) {
    sel.innerHTML = '<option value="">No se pudo cargar (revisa tu conexión)</option>';
  }
}

async function validarPin() {
  const btn = document.getElementById('btnLogin');
  const error = document.getElementById('loginError');
  if (btn.disabled) return;   // evita doble envío (auto-envío + botón)

  const usuario = (document.getElementById('loginUsuario') || {}).value || '';
  const pin = [0, 1, 2, 3].map(function (i) { return document.getElementById('pin' + i).value; }).join('');

  if (!usuario) { error.textContent = 'Selecciona tu usuario.'; return; }
  if (pin.length < 4) { error.textContent = 'Completa los 4 dígitos.'; return; }

  btn.disabled = true;
  btn.textContent = 'Verificando...';
  error.textContent = '';
  try {
    const res = await apiFetch(API_URL + '?accion=login', {
      method: 'POST',
      body: JSON.stringify({ args: [usuario, pin] })
    });
    if (res && res.ok) {
      guardarSesion_({ nombre: res.nombre, rol: res.rol, iniciales: res.iniciales }, res.token);
      limpiarPin_();
      iniciarApp_(res);
    } else {
      error.textContent = (res && res.error) || 'No se pudo iniciar sesión.';
      limpiarPin_();
      document.getElementById('pin0').focus();
    }
  } catch (err) {
    error.textContent = 'Error de conexión: ' + err.message;
  } finally {
    btn.disabled = false;
    btn.textContent = 'Ingresar';
  }
}

function cerrarSesion() {
  const s = obtenerSesion();
  if (s && s.token) {
    // Avisa al servidor para invalidar el token (si falla, no importa)
    apiFetch(API_URL + '?accion=cerrarSesion', {
      method: 'POST',
      body: JSON.stringify({ args: [s.token] })
    }).catch(function () {});
  }
  localStorage.removeItem(CLAVE_SESION);
  EQUIPO_CHECKLIST_ACTIVO = null;
  RESPUESTAS = {};
  DATOS_CHECKLIST = [];
  mostrarLogin_('');
  document.getElementById('pin0').focus();
}

document.addEventListener('DOMContentLoaded', cargarUsuariosLogin_);

/* ================================================================
 * Detalle de un reporte (vista del técnico en "Mis Reportes")
 * Reemplaza a verDetalleReporte_ anterior (esta declaración queda última).
 * ================================================================ */
function verDetalleReporte_(codigo) {
  google.script.run
    .withSuccessHandler(function (r) {
      if (!r) return miAlert('No se encontró el reporte.', { icono: '❌' });
      const dato = function (etiqueta, valor) {
        return etiqueta + ': <b>' + escaparHTML_(valor || '—') + '</b><br>';
      };
      const pdf = urlSegura_(r['PDF Técnico URL']);
      miAlert(
        dato('Código', r['Código']) +
        dato('Fecha', String(r['Fecha'] || '').slice(0, 10)) +
        dato('Cliente', r['Cliente']) +
        dato('Equipo', [r['Número Equipo'], r['Tipo Equipo']].filter(Boolean).join(' — ')) +
        dato('Tipo de mantenimiento', r['Tipo Mantenimiento']) +
        dato('Situación del reporte', r['Estado Reporte']) +
        dato('Estado del equipo', r['Estado Equipo']) +
        (pdf ? '<a href="' + escaparHTML_(pdf) + '" target="_blank">📄 Informe técnico (PDF)</a>' : ''),
        { icono: '📋', titulo: 'Detalle del reporte' }
      );
    })
    .withFailureHandler(function (err) { miError('Error', err.message); })
    .obtenerReportePorCodigo(codigo);
}

/* ================================================================
 * FIRMA DE QUIEN APRUEBA (pantalla de revisión del admin)
 * ================================================================ */

let PAD_APROBADOR = null;

// Pizarra de firma reutilizable (funciona con el dedo y con el mouse)
function crearPadFirma_(canvas) {
  const ctx = canvas.getContext('2d');
  const estado = { dibujando: false, tieneTrazo: false };

  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.round(rect.width * ratio);
  canvas.height = Math.round(rect.height * ratio);
  ctx.scale(ratio, ratio);
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#1A1A1A';

  const punto = function (e) {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const terminar = function () { estado.dibujando = false; };

  canvas.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    canvas.setPointerCapture(e.pointerId);
    estado.dibujando = true;
    const p = punto(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  });
  canvas.addEventListener('pointermove', function (e) {
    if (!estado.dibujando) return;
    e.preventDefault();
    const p = punto(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    estado.tieneTrazo = true;
  });
  canvas.addEventListener('pointerup', terminar);
  canvas.addEventListener('pointercancel', terminar);

  return {
    tieneTrazo: function () { return estado.tieneTrazo; },
    limpiar: function () {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
      estado.tieneTrazo = false;
    },
    imagen: function () {
      return {
        data: canvas.toDataURL('image/png').split(',')[1],
        mimeType: 'image/png',
        nombre: 'firma-aprobador.png'
      };
    }
  };
}

// Después de dibujar la pantalla de revisión, agrega la firma sobre los botones
(function () {
  const renderizarBase = renderizarRevisar_;
  renderizarRevisar_ = function (reporte) {
    renderizarBase(reporte);
    agregarFirmaAprobador_();
  };
})();

function agregarFirmaAprobador_() {
  const acciones = document.querySelector('#revisarContenido .revisar-acciones');
  if (!acciones) return;
  const nombre = ((obtenerSesion() || {}).usuario || {}).nombre || '';
  acciones.insertAdjacentHTML('beforebegin',
    '<div class="cierre-seccion"><h3>✍️ Firma de quien aprueba</h3>' +
      '<label>Nombre de quien firma *</label>' +
      '<input type="text" id="nombreAprobador" value="' + escaparHTML_(nombre) + '" placeholder="Ej. Ing. Carlos Rodríguez">' +
      '<label style="margin-top:12px;">Dibuja tu firma con el dedo</label>' +
      '<div class="firma-wrap"><canvas id="firmaAprobadorCanvas" class="firma-canvas"></canvas></div>' +
      '<button type="button" class="firma-btn-limpiar" onclick="limpiarFirmaAprobador_()">🧹 Limpiar firma</button>' +
    '</div>');
  PAD_APROBADOR = crearPadFirma_(document.getElementById('firmaAprobadorCanvas'));
}

function limpiarFirmaAprobador_() {
  if (PAD_APROBADOR) PAD_APROBADOR.limpiar();
}

function enfocarCampo_(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  if (el.focus) el.focus();
}

// Reemplaza a aprobarReporte anterior: ahora exige nombre y firma
function aprobarReporte() {
  if (!REPORTE_ACTUAL) return;
  const leer = function (id) { return (document.getElementById(id) || {}).value || ''; };

  const tasa = parseFloat(leer('tasaBCV')) || 0;
  if (tasa <= 0) {
    miAlert('Debes ingresar la Tasa BCV antes de aprobar.', { icono: '⚠️', titulo: 'Tasa BCV requerida' });
    return enfocarCampo_('tasaBCV');
  }
  const horas = parseFloat(leer('horasTrabajadas')) || 0;
  if (horas <= 0) {
    miAlert('Debes ingresar las horas trabajadas.', { icono: '⚠️', titulo: 'Horas requeridas' });
    return enfocarCampo_('horasTrabajadas');
  }
  const nombre = leer('nombreAprobador').trim();
  if (!nombre) {
    miAlert('Indica el nombre de quien firma.', { icono: '⚠️', titulo: 'Nombre requerido' });
    return enfocarCampo_('nombreAprobador');
  }
  if (!PAD_APROBADOR || !PAD_APROBADOR.tieneTrazo()) {
    miAlert('Debes firmar antes de aprobar el reporte.', { icono: '⚠️', titulo: 'Firma requerida' });
    return enfocarCampo_('firmaAprobadorCanvas');
  }

  miConfirm('¿Aprobar y enviar el informe al cliente? Se generarán los PDFs y se enviarán los correos.',
    { icono: '✅', titulo: 'Confirmar aprobación', textoSi: 'Aprobar y enviar' }
  ).then(function (confirmado) {
    if (!confirmado) return;

    const costos = {
      nivel: COSTOS_ESTADO.nivel,
      horas: horas,
      repuestos: COSTOS_ESTADO.repuestos,
      otros: COSTOS_ESTADO.otros,
      aplicarRecargo: COSTOS_ESTADO.aplicarRecargo,
      recargoPorcentaje: COSTOS_ESTADO.recargoPorcentaje,
      tasaBCV: tasa
    };
    const aprobacion = { nombre: nombre, firmaImagen: PAD_APROBADOR.imagen() };

    const btnAprobar = document.getElementById('btnAprobar');
    const btnRechazar = document.getElementById('btnRechazar');
    const overlay = document.getElementById('enviandoOverlay');
    const procesando = function (activo) {
      btnAprobar.disabled = activo;
      btnRechazar.disabled = activo;
      btnAprobar.textContent = activo ? 'Procesando...' : '✅ Aprobar y Enviar';
      overlay.classList.toggle('activo', activo);
    };

    procesando(true);
    document.getElementById('enviandoTitulo').textContent = 'Aprobando reporte...';
    document.getElementById('enviandoMensaje').textContent = 'Generando PDFs y enviando correos. Puede tardar 30-60 segundos...';

    google.script.run
      .withSuccessHandler(function (res) {
        procesando(false);
        if (res && res.exito) {
          actualizarBadgePendientes_();
          mostrarPantallaExito_(res);
        } else {
          miError('Error al aprobar', (res && res.error) || 'Error desconocido');
        }
      })
      .withFailureHandler(function (err) {
        procesando(false);
        miError('Error de conexión', err.message);
      })
      .aprobarYEnviar(REPORTE_ACTUAL['Código'], costos, aprobacion);
  });
}

// Oculta la opción "Carga de Costos" (pantalla sin construir: los costos se cargan
// al crear un reporte como socio o al aprobar uno de un técnico)
(function () {
  const iniciarAppBase = iniciarApp_;
  iniciarApp_ = function (usuario) {
    iniciarAppBase(usuario);
    const itemCostos = document.getElementById('menuAdminCos');
    if (itemCostos) itemCostos.style.display = 'none';
  };
})();

/* ================================================================
 * FASE 6.6 — CORREGIR UN REPORTE RECHAZADO
 * ================================================================ */

const CORRECCION = { codigo: '', reporte: null };

// Salir a cualquier otra pantalla abandona la corrección en curso
(function () {
  const irABase = irA;
  irA = function (vista) {
    if (CORRECCION.codigo) terminarCorreccion_();
    irABase(vista);
  };
})();

// Asigna un valor a un campo del formulario respetando su tipo (fecha, texto, lista)
function asignarCampo_(id, valor) {
  const el = document.getElementById(id);
  if (!el) return;
  let texto = (valor === undefined || valor === null) ? '' : String(valor);
  if (el.type === 'date') texto = texto.slice(0, 10);
  else if (el.type === 'datetime-local') texto = texto.slice(0, 16);
  el.value = texto;
}

// Deja el formulario de "Nuevo reporte" limpio, igual que cancelarReporte
function terminarCorreccion_() {
  CORRECCION.codigo = '';
  CORRECCION.reporte = null;
  EQUIPO_CHECKLIST_ACTIVO = null;
  RESPUESTAS = {};
  DATOS_CHECKLIST = [];

  const cliente = document.getElementById('fCliente');
  const equipo = document.getElementById('fEquipo');
  if (cliente) { cliente.disabled = false; cliente.value = ''; }
  if (equipo) {
    equipo.innerHTML = '<option value="">Selecciona un cliente primero</option>';
    equipo.disabled = true;
  }
  ['fArea', 'fHorometro', 'fSolicitante', 'fResponsable', 'fMecanico',
   'fTiempoParada', 'fFechaInicio', 'fFechaFin'].forEach(function (id) { asignarCampo_(id, ''); });
  if (DATOS_FORM) asignarCampo_('fFecha', DATOS_FORM.hoy);
  const tipo = document.getElementById('fTipoMantenimiento');
  if (tipo) tipo.selectedIndex = 0;
  const resumen = document.getElementById('resumenSeleccion');
  if (resumen) resumen.style.display = 'none';
  const boton = document.getElementById('btnContinuarChecklist');
  if (boton) boton.disabled = true;
}

// Espera a que el formulario de nuevo reporte termine de cargar sus listas
function esperarFormularioListo_() {
  return new Promise(function (resolver, rechazar) {
    let intentos = 0;
    const temporizador = setInterval(function () {
      intentos++;
      const cliente = document.getElementById('fCliente');
      if (DATOS_FORM && cliente && cliente.options.length > 1) {
        clearInterval(temporizador);
        resolver();
      } else if (intentos > 60) {
        clearInterval(temporizador);
        rechazar(new Error('El formulario no terminó de cargar. Intenta de nuevo.'));
      }
    }, 150);
  });
}

function prellenarDatosGenerales_(r) {
  const cliente = document.getElementById('fCliente');
  cliente.value = r['Cliente'];
  cliente.dispatchEvent(new Event('change'));

  const equipo = document.getElementById('fEquipo');
  equipo.value = r['Número Equipo'];
  equipo.dispatchEvent(new Event('change'));
  if (!equipo.value) {
    throw new Error('El equipo ' + r['Número Equipo'] + ' ya no está disponible. Avisa al administrador.');
  }

  asignarCampo_('fFecha', r['Fecha']);
  asignarCampo_('fTipoMantenimiento', r['Tipo Mantenimiento']);
  asignarCampo_('fArea', r['Área']);
  asignarCampo_('fHorometro', r['Horómetro']);
  asignarCampo_('fSolicitante', r['Solicitante']);
  asignarCampo_('fTiempoParada', r['Tiempo Parada']);
  asignarCampo_('fFechaInicio', r['Fecha Inicio Servicio']);
  asignarCampo_('fFechaFin', r['Fecha Fin Servicio']);
  asignarCampo_('fResponsable', r['Responsable Principal']);
  asignarCampo_('fMecanico', r['Mecánico Principal']);

  // Es el mismo reporte: cliente y equipo no se pueden cambiar
  cliente.disabled = true;
  equipo.disabled = true;
}

// Reemplaza al marcador "en desarrollo" de Mis Reportes
function continuarReporteRechazado_(codigo) {
  miConfirm('Este reporte fue rechazado. ¿Quieres abrirlo para corregirlo?',
    { icono: '✏️', titulo: 'Corregir reporte', textoSi: 'Abrir y corregir' }
  ).then(function (confirmado) {
    if (confirmado) iniciarCorreccion_(codigo);
  });
}

async function iniciarCorreccion_(codigo) {
  try {
    const reporte = await new Promise(function (resolver, rechazar) {
      google.script.run.withSuccessHandler(resolver).withFailureHandler(rechazar)
        .obtenerReportePorCodigo(codigo);
    });
    if (!reporte) throw new Error('No se encontró el reporte.');
    if (reporte['Estado Reporte'] !== 'Rechazado') throw new Error('Este reporte ya no está rechazado.');

    irA('nuevo-reporte');                 // abre el formulario (y reinicia cualquier estado previo)
    CORRECCION.codigo = codigo;
    CORRECCION.reporte = reporte;
    await esperarFormularioListo_();

    EQUIPO_CHECKLIST_ACTIVO = null;
    RESPUESTAS = {};
    DATOS_CHECKLIST = [];
    prellenarDatosGenerales_(reporte);
    continuarAChecklist();                // el checklist se completa en aplicarCorreccionAlChecklist_
  } catch (err) {
    terminarCorreccion_();
    miError('No se pudo abrir el reporte', err.message);
  }
}

// Después de dibujar el checklist, si hay una corrección en curso, se precarga
(function () {
  const renderizarBase = renderizarChecklist_;
  renderizarChecklist_ = function (equipo, tipo) {
    renderizarBase(equipo, tipo);
    if (CORRECCION.codigo) aplicarCorreccionAlChecklist_();
  };
})();

// Marca un ítem del checklist (R, E o P) buscándolo por su nombre
function marcarItemCorreccion_(nombre, letra) {
  let indice = DATOS_CHECKLIST.findIndex(function (c) { return c.items.indexOf(nombre) !== -1; });
  if (indice === -1) {
    // Ítem agregado a mano por el técnico: no se guardó su categoría, va a la primera
    const primera = DATOS_CHECKLIST[0];
    if (!primera) return;
    primera.adicionales = primera.adicionales || [];
    primera.adicionales.push(nombre);
    primera.items.push(nombre);
    document.getElementById('items-cat-0').innerHTML = renderizarItemsCategoria_(primera, 0);
    restaurarMarcasCategoria_(primera, 0);
    indice = 0;
  }
  const categoria = DATOS_CHECKLIST[indice];
  marcarREP(categoria.categoria + '|' + nombre, letra, indice, categoria.items.indexOf(nombre));
}

function aplicarCorreccionAlChecklist_() {
  const r = CORRECCION.reporte;
  if (!r) return;

  // 1. Marcas R / E / P
  const separar = function (texto) {
    return String(texto || '').split(';').map(function (s) { return s.trim(); }).filter(Boolean);
  };
  [['R', r['Checklist R']], ['E', r['Checklist E']], ['P', r['Checklist P']]].forEach(function (par) {
    separar(par[1]).forEach(function (item) { marcarItemCorreccion_(item, par[0]); });
  });

  // 2. Informe técnico, observaciones y cierre
  asignarCampo_('infoMotivo', r['Motivo Ingreso']);
  asignarCampo_('infoDiagnostico', r['Diagnóstico']);
  asignarCampo_('infoActividades', r['Actividades Realizadas']);
  asignarCampo_('infoRepuestos', r['Repuestos Usados']);
  asignarCampo_('infoRecomendaciones', r['Recomendaciones']);
  asignarCampo_('obsCliente', r['Observaciones']);
  asignarCampo_('notasInternas', r['Notas Internas']);
  asignarCampo_('estadoFinal', r['Estado Equipo']);
  actualizarAvisoEstado();
  asignarCampo_('notaCierre', r['Nota Cierre']);
  asignarCampo_('nombreFirmante', r['Nombre Firmante']);

  // 3. Aviso con el motivo del rechazo
  document.getElementById('vista-checklist').insertAdjacentHTML('afterbegin',
    '<div class="alerta rojo"><b>↩️ Reporte rechazado: corrígelo y vuelve a enviarlo</b><br>' +
    'Motivo: ' + escaparHTML_(r['Motivo Rechazo'] || 'No indicado') + '<br>' +
    '<small>Debes firmar de nuevo antes de enviar. Las fotos anteriores se conservan; ' +
    'puedes agregar fotos nuevas.</small></div>');
}
