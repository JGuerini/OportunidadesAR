# Security Policy

## Firebase API Keys

Este proyecto utiliza Firebase como backend (Authentication + Firestore). La `apiKey` que aparece en `assets/firebase-config.js` es **publica por diseño** y no representa una vulnerabilidad de seguridad.

### Por que es segura?

Firebase API keys son identificadores publicos, no secretos. La seguridad del proyecto no depende de mantener esta clave en secreto, sino de las siguientes capas de proteccion:

1. **Firebase Authentication** — Todas las operaciones requieren un usuario autenticado con email y contrasena validos.
2. **Firestore Security Rules** — Reglas definidas en `firestore.rules` controlan el acceso por rol (`admin`, `usuario`, `solo lectura`):
   - Lectura: solo usuarios autenticados
   - Escritura/edicion: solo `admin` o `usuario` sobre sus propias oportunidades
   - Eliminacion: solo `admin`
3. **Authorized Domains** — Firebase rechaza automaticamente peticiones desde dominios no autorizados en la consola de Firebase.

### Referencias

- [Firebase Documentation: API Keys](https://firebase.google.com/docs/projects/api-keys)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Stack Overflow: Is it safe to expose Firebase API key?](https://stackoverflow.com/questions/37480857/is-it-safe-to-expose-firebase-api-key-to-the-public)

---

## Content Security Policy (CSP)

Desde la version que incluye el commit `9b11a64`, la aplicacion cuenta con una **Content Security Policy** configurada via `<meta>` tag tanto en `index.html` como en `login.html`. Esta medida de hardening restringe los dominios desde los cuales se pueden cargar scripts, estilos, fuentes y establecer conexiones de red, mitigando el riesgo de ataques XSS (Cross-Site Scripting) y la inyeccion de recursos maliciosos desde dominios no autorizados.

### Directivas configuradas

| Directiva | Valor | Descripcion |
|:---|:---|:---|
| `default-src` | `'self'` | Politica por defecto: solo permite recursos del mismo origen |
| `script-src` | `'self' 'unsafe-inline' cdnjs.cloudflare.com www.gstatic.com` | Scripts locales, inline handlers, Chart.js/XLSX desde CDN, Firebase SDK |
| `style-src` | `'self' 'unsafe-inline' fonts.googleapis.com` | Estilos locales, inline, Google Fonts CSS |
| `font-src` | `'self' fonts.gstatic.com` | Fuentes locales y Google Fonts |
| `connect-src` | `'self' api.exchangerate-api.com firestore.googleapis.com identitytoolkit.googleapis.com` | APIs de cotizacion, Firestore y Firebase Auth |
| `img-src` | `'self' data:` | Imagenes locales y data URIs (SVGs inline) |
| `frame-src` | `'none'` | Bloquea iframes embebidos |
| `object-src` | `'none'` | Bloquea plugins embebidos (Flash, Java, etc.) |

### Notas

- Se utiliza `'unsafe-inline'` en `script-src` y `style-src` porque la aplicacion contiene event handlers inline (`onclick`, `oninput`, etc.) y estilos embebidos. En una futura version, estos podrian migrarse a archivos externos y reemplazarse por nonces/hashes CSP para mayor seguridad.
- La CSP se implementa via `<meta>` tag por estar hosteada en **GitHub Pages**, que no soporta headers HTTP personalizados. Si el hosting migrara a Firebase Hosting, Cloudflare Pages, Netlify o Vercel, se recomienda pasar la configuracion a headers HTTP para mayor robustez (los headers HTTP no pueden ser modificados por un atacante con acceso al frontend).
- Si en el futuro se agrega un nuevo dominio externo (CDN, API, fuente), es necesario actualizar la CSP correspondiente en ambos archivos HTML, de lo contrario el recurso sera bloqueado por el navegador.

### Referencias

- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [MDN: CSP via meta tag](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy)
