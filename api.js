(function () {
  const API_URL = 'https://script.google.com/macros/s/AKfycbyp1B6WwOd6d2-Od_2KMZXsYR3NzbZEhy4y-7kQKl95GYn3y2PNylxp5TxXre4utMmizg/exec';
  const CLAVE_SESION = 'rj_sesion_v1';

  // Token de la sesión guardada al iniciar sesión ('' si no hay)
  function tokenSesion() {
    try {
      const s = JSON.parse(localStorage.getItem(CLAVE_SESION));
      return (s && s.token) || '';
    } catch (e) {
      return '';
    }
  }

  function mensajeError(codigo) {
    if (codigo === 'SESION') return 'Tu sesión expiró. Ingresa de nuevo.';
    if (codigo === 'SIN_PERMISO') return 'No tienes permiso para esta acción.';
    return codigo;
  }

  function runner(ok, fail) {
    return new Proxy({}, {
      get(_, name) {
        if (name === 'withSuccessHandler') return f => runner(f, fail);
        if (name === 'withFailureHandler') return f => runner(ok, f);
        return (...args) => {
          fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // evita el preflight de CORS
            body: JSON.stringify({ funcion: name, args, token: tokenSesion() })
          })
            .then(r => r.json())
            .then(r => {
              if (r.__error) {
                if (r.__error === 'SESION' && typeof window.sesionExpirada_ === 'function') {
                  window.sesionExpirada_();
                }
                throw new Error(mensajeError(r.__error));
              }
              if (ok) ok(r.data);
            })
            .catch(e => {
              const error = (e instanceof TypeError)
                ? new Error('Sin conexión. Revisa tu internet e intenta de nuevo.')
                : e;
              if (fail) fail(error); else console.error(error);
            });
        };
      }
    });
  }

  window.google = window.google || {};
  window.google.script = { run: runner(null, null) };
})();
