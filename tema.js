/* tema.js — Modo claro / oscuro / automático.
 * La preferencia se guarda solo en este dispositivo (localStorage). */
const CLAVE_TEMA = 'rj_tema';   // 'auto' | 'claro' | 'oscuro'

function temaPreferido_() {
  try { return localStorage.getItem(CLAVE_TEMA) || 'auto'; } catch (e) { return 'auto'; }
}

function temaEfectivo_(pref) {
  if (pref === 'claro' || pref === 'oscuro') return pref;
  return (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches) ? 'oscuro' : 'claro';
}

// Pone data-tema="claro" u "oscuro" en <html>; los estilos se enganchan a ese atributo
function aplicarTema_(pref) {
  const efectivo = temaEfectivo_(pref);
  document.documentElement.setAttribute('data-tema', efectivo);
  const meta = document.querySelector('meta[name="theme-color"]');   // color de la barra del navegador
  if (meta) meta.setAttribute('content', efectivo === 'oscuro' ? '#0F1115' : '#F5821F');
}

function elegirTema(pref) {
  try { localStorage.setItem(CLAVE_TEMA, pref); } catch (e) { /* sin almacenamiento */ }
  aplicarTema_(pref);
  marcarTemaActivo_();
}

function marcarTemaActivo_() {
  const pref = temaPreferido_();
  document.querySelectorAll('.tema-opcion').forEach(function (boton) {
    boton.classList.toggle('activo', boton.getAttribute('data-tema-op') === pref);
  });
}

// Si el teléfono cambia de modo y el usuario eligió "Automático", se sigue al sistema
if (window.matchMedia) {
  const consulta = matchMedia('(prefers-color-scheme: dark)');
  const alCambiar = function () { if (temaPreferido_() === 'auto') aplicarTema_('auto'); };
  if (consulta.addEventListener) consulta.addEventListener('change', alCambiar);
  else if (consulta.addListener) consulta.addListener(alCambiar);
}
document.addEventListener('DOMContentLoaded', function () { aplicarTema_(temaPreferido_()); });
