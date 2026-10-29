(function () {
  //https://script.google.com/macros/s/AKfycbyp1B6WwOd6d2-Od_2KMZXsYR3NzbZEhy4y-7kQKl95GYn3y2PNylxp5TxXre4utMmizg/exec
  const API_URL = 'https://script.google.com/macros/s/AKfycbyp1B6WwOd6d2-Od_2KMZXsYR3NzbZEhy4y-7kQKl95GYn3y2PNylxp5TxXre4utMmizg/exec';

  function runner(ok, fail) {
    return new Proxy({}, {
      get(_, name) {
        if (name === 'withSuccessHandler') return f => runner(f, fail);
        if (name === 'withFailureHandler') return f => runner(ok, f);
        return (...args) => {
          fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // Importante para evitar CORS
            body: JSON.stringify({ funcion: name, args })
          })
            .then(r => r.json())
            .then(r => {
              if (r.__error) throw new Error(r.__error);
              if (ok) ok(r.data);
            })
            .catch(e => { if (fail) fail(e); else console.error(e); });
        };
      }
    });
  }

  window.google = window.google || {};
  window.google.script = { run: runner(null, null) };
})();
