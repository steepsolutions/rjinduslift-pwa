# R&J Induslift — Sistema de Mantenimiento de Equipos Móviles

Aplicación web instalable (PWA) para registrar, validar y entregar reportes de mantenimiento de equipos móviles
(montacargas, traspaletas y plantas eléctricas) de **R&J Induslift Mobile, C.A.**

El técnico llena el reporte desde el teléfono (también sin conexión). Los socios lo revisan, cargan los costos,
lo aprueban y el sistema genera los informes en PDF, envía los correos y prepara el mensaje de WhatsApp.

> Estado: paquete de corrección de errores (texto, PDF, correos, WhatsApp) cerrado y reportes abiertos implementados.
> Versión del backend publicada y congelada: **69** (23-nov-2026).

---

## Qué hace

- **Reportes de mantenimiento** preventivo y correctivo, con checklist por tipo de equipo (R / E / P),
  informe técnico, fotos (antes, después y adicionales) y firma en pantalla.
- **Validación por los socios**: aprobar (con costos y firma) o rechazar con motivo.
- **Informes en PDF** automáticos: *Técnico* (para el cliente) y *Financiero* (interno, con desglose de costos).
- **Correos** con los PDF adjuntos y **mensajes de WhatsApp** listos para enviar (enlaces `wa.me`).
- **Reportes abiertos**: si el equipo sigue en reparación, en terceros o esperando repuesto, el reporte queda abierto
  sin necesidad de autorización y se continúa después con el mismo código.
- **Trabajo sin conexión** para técnicos: los reportes se guardan en el teléfono y se envían al volver el internet.
- **Dashboards** operativo y financiero, e **historial** con filtros.
- **Catálogos**: clientes, equipos, repuestos y tarifas de mano de obra.
- **Privacidad**: aceptación versionada de políticas y pantalla de privacidad y seguridad.
- Tema claro, oscuro o automático.

## Roles

| Rol | Qué puede hacer |
|---|---|
| **Técnico** | Crear reportes, ver y continuar los suyos (abiertos o rechazados), trabajar sin conexión. No ve costos. |
| **Administrador (socio)** | Todo lo anterior más: aprobar o rechazar, cargar costos, catálogos, dashboards, historial y regenerar informes. |

El acceso es con **usuario + PIN de 6 dígitos**. El servidor entrega un token de sesión y comprueba el rol en cada
llamada (tabla `PERMISOS` en `WebApp.gs`). El navegador nunca decide quién es el usuario ni su rol.

## Flujo de un reporte

**Estado final del equipo** (lo elige el técnico) → **situación del reporte**:

| Estado final | Situación | ¿Autoriza el socio? |
|---|---|---|
| Equipo entregado | Pendiente Validación | Sí |
| Fuera de servicio | Pendiente Validación | Sí |
| Equipo en reparación | **Abierto** | No |
| Servicios de Terceros | **Abierto** | No |
| Pendiente de repuesto | **Abierto** | No |

```
Técnico crea ──► estado final "entregado / fuera de servicio" ──► Pendiente Validación
                                                                     │
                                          socio rechaza (con motivo) ◄┤► socio aprueba (costos + firma)
                                                     │                      │
                                           técnico corrige y reenvía        ▼
                                                                   Cerrado: PDF técnico + PDF financiero
                                                                   + correos + WhatsApp al cliente

Técnico crea ──► estado final "en reparación / terceros / repuesto" ──► Abierto
                    (sin PDF ni correos; el técnico avisa a los socios por WhatsApp;
                     los socios informan al cliente; el técnico continúa el MISMO reporte
                     desde "Mis Reportes" y al entregar el equipo pasa a validación)
```

Un socio que crea un reporte directamente sigue las mismas reglas: se cierra solo si el equipo se entrega
o queda fuera de servicio.

Códigos de reporte: `RJ-Prev-0001` (preventivo) y `RJ-Corr-0001` (correctivo). Los contadores viven en las
propiedades del script (`contador_Prev`, `contador_Corr`); la función `resetearContadores` los reinicia.

## Arquitectura

```
Teléfono / PC (PWA en GitHub Pages)
        │  HTTPS (token de sesión en cada llamada)
        ▼
Google Apps Script — Web App (API)          ◄── una sola URL de implementación
        │
        ├── Google Sheets  → base de datos (Registros, Clientes, Equipos, ...)
        ├── Google Drive   → fotos, firmas y PDF de cada reporte
        ├── Gmail (MailApp)→ correos con PDF adjunto
        └── wa.me          → enlaces de WhatsApp (el usuario envía el mensaje)
```

### Front-end (este repositorio)

| Archivo | Función |
|---|---|
| `index.html` | Estructura de la app y carga de scripts |
| `core.js` | Sesión, navegación, formulario de reporte, checklist, fotos, firma, costos, catálogos |
| `admin.js` | Aprobación, pendientes, mis reportes, dashboards, historial, login, trabajo sin conexión, privacidad, reportes abiertos. **Se carga después de `core.js`: sus funciones tienen prioridad.** |
| `sw.js` | Service worker (caché). **Subir `CACHE_NAME` en cada despliegue.** |
| `politicas.html` | Aviso de privacidad, política de seguridad y términos de uso |
| (confirmar) | Estilos, manifiesto, íconos y la capa que traduce `google.script.run` a llamadas HTTP |

### Back-end (Google Apps Script)

| Archivo | Función |
|---|---|
| `WebApp.gs` | Punto de entrada (`doGet` / `doPost`), tabla `PERMISOS`, bloqueos (`ACCIONES_CON_LOCK`) |
| `Config.gs` | Constantes (`CONFIG`), estados de reporte, estados de equipo que dejan el reporte abierto |
| `Registros.gs` | Guardar, aprobar, rechazar y regenerar reportes; flujo técnico → socio; reportes abiertos |
| `PDF.gs` | Informes técnico y financiero (Google Docs → PDF) |
| `Correo.gs` | Envío de correos con PDF adjunto |
| `WhatsApp.gs` | Mensajes y enlaces de WhatsApp (completo, avance, aviso al socio, rechazo) |
| `Catalogos.gs` | Clientes, equipos, repuestos, tarifas, checklist y servicios del día |
| `Integridad.gs` | Garantiza que lo escrito en la hoja se guarde como **texto literal** |
| `Aprobacion.gs` | Firma y datos de quien aprueba |
| `Consentimiento.gs` | Registro de aceptación de políticas |
| (confirmar) | Costos, dashboards, login y sesiones, utilidades de hojas, carpetas de Drive y contadores |

### Hojas de Google Sheets

`Registros`, `Clientes`, `Equipos`, `Repuestos`, `Tarifas_ManoObra`, `Checklist`, `Consentimientos`,
la hoja de usuarios (confirmar nombre) y las auxiliares `Diccionario` y `Dashboard`.
No borrar los encabezados de la fila 1: el código busca las columnas por su nombre.

## Configuración

En `Config.gs` (`CONFIG`): datos de la empresa, correo de destino, número de WhatsApp de la empresa,
carpeta de Drive, IVA y parámetros de costos.

- `CONFIG.EMAIL_DEV`: **modo desarrollo**. Si tiene valor, TODOS los correos van a esa dirección con el prefijo `[DEV]`.
  Debe estar vacío en producción.
- `API_URL` (en `core.js`): URL de la implementación del Web App. No cambia mientras se actualice la
  implementación existente.

## Despliegue

**Back-end**
1. Editor de Apps Script → **Implementar → Administrar implementaciones**.
2. Lápiz ✏️ de la implementación activa → *Versión: Nueva versión* → **Implementar**.
   (No crear una "Nueva implementación": cambiaría la URL.)

**Front-end**
1. Subir los cambios a GitHub (GitHub Pages publica la rama principal).
2. Aumentar `CACHE_NAME` en `sw.js`.
3. En el teléfono, cerrar y abrir la app dos veces para que el service worker nuevo se active.

## Pruebas (Apps Script → Ejecutar)

| Función | Qué comprueba | Resultado esperado |
|---|---|---|
| `verificarFunciones` | Que todas las funciones registradas en `PERMISOS` existen | "Todas las funciones existen" |
| `testIntegridadTexto` | Registros: `1.5`, `2.5`, `12345` y `=1+1` se guardan como texto | 10 ✅ |
| `testIntegridadCatalogos` | Lo mismo en Clientes, Equipos y Repuestos | 17 ✅ |
| `testPDFValoresRaros` | PDF con fechas, números y fórmulas en los campos | 2 ✅ |
| `testGenerarPDFs` | PDF de un reporte real | PDFs generados, sin errores |
| `testWhatsAppSeguro` | Sin fechas crudas, sin emojis, enlace al PDF solo si existe, regla de estados | 12 ✅ |
| `testActivarFalloPDF` / `testActivarFalloCorreo` | Simulan un fallo para probar el aviso rojo y "Regenerar informes y reenviar" | — |
| `testDesactivarFallos` | Apaga las simulaciones (**ejecutar siempre al terminar**) | — |

## Lista de verificación antes de producción

- [ ] `CONFIG.EMAIL_DEV` vacío y una prueba real con el correo de un cliente.
- [ ] Ejecutar `testDesactivarFallos` (ninguna simulación activa).
- [ ] Hoja `Registros` sin datos de prueba y contadores reiniciados (`resetearContadores`).
- [ ] Carpetas de prueba de Drive movidas fuera de la carpeta principal.
- [ ] Probar un reporte completo: técnico → aprobación → PDF, correos y WhatsApp.
- [ ] Decidir si el WhatsApp completo debe ir al número del cliente (columna `WhatsApp Reportes` de Clientes).
- [ ] Decidir qué hacer con las "Notas internas" (hoy la app indica que salen en el informe financiero y el PDF no las imprime).

## Decisiones de diseño

- **El servidor manda.** Rol, usuario y situación del reporte se calculan en el servidor, nunca en el navegador.
- **Texto literal.** Las columnas de texto se escriben con formato `@`; `1.5` no se vuelve fecha ni `=1+1` fórmula.
- **Sin fallos silenciosos.** Si fallan los PDF o los correos, la pantalla lo muestra en rojo y ofrece reintentar;
  el reintento no repite los correos que ya salieron bien.
- **Sin duplicados.** Cada envío lleva un identificador único (`idEnvio`); un reintento no crea un reporte nuevo.
- **Bloqueos.** Las acciones que escriben datos se serializan con `LockService`.
- **WhatsApp sin emojis.** Algunos clientes de escritorio los muestran rotos.
- **Solo texto en el PDF.** Todas las celdas de las tablas se convierten a texto antes de crear el documento.

## Seguridad

- La URL del Web App es pública por diseño; la autorización se hace en el servidor con el token de sesión.
- Si el repositorio es público (GitHub Pages gratuito), **no subir al mismo repositorio el código del back-end**
  (`Config.gs` incluye correos, teléfonos y el identificador de la carpeta de Drive). Usar un repositorio privado.
- No escribir en el README ni en el código del front-end claves, correos personales ni números de teléfono.

## Pendientes conocidos

- Respaldo automático diario de la hoja y un `testRegresion` que ejecute todas las pruebas.
- Listado y contador de reportes abiertos con su antigüedad en el dashboard.
- Botón "Enviar por WhatsApp" en el detalle del historial (si la app se recarga, la pantalla final se pierde).
- Estado "En taller" del equipo, para no mostrarlo como vencido mientras se repara.
- Vencimiento de mantenimiento también por horómetro, no solo por días.
- Indicadores para los socios: correctivos frente a preventivos, tiempo de parada y costo por equipo.
- Foto "antes" obligatoria en correctivos y reportes abiertos.
