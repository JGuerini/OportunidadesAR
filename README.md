<div align="center">

<img src="favicon.svg" width="48" alt="PRESALES AR Logo"/>

# PRESALES AR

**CRM de Oportunidades Comerciales para equipos de Presales**

Gestión integral de pipeline comercial con seguimiento en tiempo real, análisis avanzado y colaboración entre equipos.

[![Deploy](https://img.shields.io/badge/Deploy-GitHub%20Pages-black?style=flat-square&logo=github)](https://pages.github.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore-orange?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-Uso%20Interno-blue?style=flat-square)]()

</div>

---

## Capturas

| Dashboard | Kanban Board | Estadísticas |
|:---:|:---:|:---:|
| KPIs, próximas entregas y métricas clave | Drag & drop entre columnas de estado | Gráficos interactivos con Chart.js |

---

## Funcionalidades

### Gestión de Oportunidades

- **Alta de oportunidades** — Formulario completo con información general, BID y datos comerciales
- **Edición por modal** — Editar cualquier oportunidad sin abandonar la pantalla actual
- **Vista detallada** — Modal de solo lectura con toda la info organizada por secciones
- **Eliminación individual o masiva** — Con confirmación y log de eventos
- **Código secuencial automático** — Cada oportunidad recibe un ID `OPP-XXXX` incremental
- **Autocompletado de clientes** — Sugerencias basadas en clientes ya existentes al crear/editar
- **Campos disponibles:** Cliente, Industria, Práctica/Área, Nombre, Descripción, Origen, Responsable, Estado, Fechas de Inicio/Entrega, Notas, SharePoint (URL), TCV, Currency, TCV EUR, Tipo de Cambio, Probabilidad, PM

### Dashboard

- **Oportunidades activas** — Cantidad de oportunidades en estados activos (En Desarrollo, Pausa, Entregada)
- **En Desarrollo** — Cantidad de oportunidades actualmente en desarrollo
- **Nuevas este mes** — Oportunidades creadas en el mes corriente (basado en fecha de inicio)
- **Oportunidades entregadas** — Total de oportunidades en estado "Entregada"
- **Próximas a Entregar** — Tabla con las 5 entregas más cercanas, con indicador de urgencia por color (rojo/amarillo/gris)

### Tablas con Interactividad

- **Mis Oportunidades** — Vista filtrada por responsable (solo las del usuario logueado)
- **Ver Todas** — Listado completo de todas las oportunidades del sistema
- **Ordenamiento por columna** — Click en encabezados para ordenar ascendente/descendente
- **Búsqueda en tiempo real** — Filtro por texto libre
- **Filtros múltiples** — Por estado, cliente, práctica, responsable e industria
- **Filtro por rango de fechas** — Selector desplegable para filtrar por fecha de inicio (desde/hasta)
- **Paginación** — 20 registros por página con navegación completa
- **Selección masiva (admin)** — Checkboxes para seleccionar y eliminar múltiples registros
- **Tooltips informativos** — Hover sobre nombre muestra *notas*, hover sobre estado muestra *fecha de entrega*
- **Click para ver detalle** — Click en cualquier fila abre el modal de vista

- **Exportar a Excel** — Descarga de todas las oportunidades (filtradas) en formato `.xlsx`

### Kanban Board

- **Tablero visual por estados** — Columnas dinámicas: En Desarrollo, Entregada, Pausa, No Go, Cancelada, Perdida, Ganada
- **Headers sticky** — Los encabezados de columna permanecen visibles al hacer scroll
- **Drag & drop** — Mover cards entre columnas para cambiar el estado de una oportunidad
- **Actualización optimista** — La UI responde al instante y se sincroniza con Firestore en background
- **Filtro de columnas** — Mostrar/ocultar columnas individuales (persistencia en localStorage)
- **Búsqueda y filtro por responsable** — Encontrar oportunidades rápidamente en el tablero
- **Click en card** — Ver detalle completo de la oportunidad

### Calendario

- **Vista mensual** — Calendario con navegación mes a mes y botón "Hoy"
- **Eventos de entrega** — Marcados con color del estado de la oportunidad
- **Eventos de inicio** — Diferenciados visualmente de los de entrega
- **Click en evento** — Abre el modal de detalle de la oportunidad
- **Resaltado del día actual** — Indicador visual del día de hoy

### Notificaciones

- **Panel de notificaciones** — Campana en el header con badge de cantidad y dropdown en tiempo real
- **Entrega próxima** — Alerta automática cuando una oportunidad se entrega en ≤3 días (hoy, mañana o en 2-3 días), notificando al responsable y a los admins
- **Oportunidad sin actualizar** — Alerta cuando una oportunidad lleva ≥15 días sin modificaciones, notificando al responsable
- **Nueva asignación** — Notificación al responsable cuando le asignan una oportunidad
- **Edición por tercero** — Notificación al responsable cuando otro usuario edita su oportunidad
- **Deduplicación inteligente** — Cada combinación usuario + oportunidad genera una sola notificación por tipo, evitando repetición en los checks periódicos (cada 15 minutos)
- **Marcar como leída** — Click individual en una notificación o botón "Marcar todas como leídas"
- **Listener en tiempo real** — Las notificaciones se actualizan instantáneamente vía Firestore onSnapshot

### Estadísticas

- **Navegación por período** — Filtros temporales: Mes actual, Trimestre, Año, Personalizado (rango de fechas) o Todo
- **Filtros avanzados** — Multi-select dropdowns por estado, práctica, responsable, cliente e industria (independientes del período)
- **KPIs principales** — Oportunidades activas, TCV EUR Total, Nuevas este período, Oportunidades entregadas
- **Distribución por estado** — Gráfico doughnut con cantidades
- **TCV EUR por estado** — Gráfico de barras con valores en euros
- **Pipeline por estado** — Funnel chart horizontal con barras proporcionales
- **Origen de oportunidades** — Gráfico pie (Otro, Proyecto, Renovación, RFP)
- **Por responsable** — Gráfico de barras horizontales (top 8)
- **Por práctica/área** — Gráfico de barras horizontales (AM, CES, IA, SAP, etc.)
- **Por industria** — Gráfico pie con 15 industrias
- **Exportar a PDF** — Generación de reporte de 3 páginas con HTML+print: KPIs, funnel, gráficos y filtros activos. Se abre en nueva ventana para "Guardar como PDF" del navegador

### Administración (solo Admin)

- **Gestión de usuarios** — Crear, editar, activar/desactivar cuentas
- **Carga masiva desde Excel** — Importar oportunidades por lotes con preview, validación y barra de progreso
- **Plantilla descargable** — Excel template con las columnas esperadas
- **Soporte multi-formato** — `.xlsx`, `.xls` y `.csv`
- **Conversión FX automática** — Durante la importación, calcula TCV EUR si se provee TCV + Currency
- **Log de eventos** — Registro completo de actividad (creación, edición, cambio de estado, eliminación) con paginación de 50 en 50
- **Backup de base de datos (JSON)** — Exportar/importar un JSON completo con todas las oportunidades, usuarios, log de eventos y configuración
- **Barra de progreso** — Indicador visual durante la importación de backups con conteo de registros procesados

### Datos Comerciales y FX

- **TCV en múltiples monedas** — ARS, CLP, EUR, USD
- **Conversión automática a EUR** — Tipo de cambio obtenido desde API en tiempo real
- **Cache de tasas** — 30 minutos de cache por moneda para evitar llamadas innecesarias
- **Formato argentino** — Soporte para ingreso de números con formato local (puntos como miles, coma como decimal)

### UX y Diseño

- **Glassmorphism** — Diseño moderno con glassmorphism, degradados y floating blobs
- **Modo claro/oscuro** — Toggle con persistencia por usuario en localStorage
- **Sidebar colapsable** — Navegación compacta con tooltips en modo colapsado
- **Autocompletado de clientes** — Sugerencias en tiempo real al crear/editar oportunidades basadas en clientes ya cargados
- **Notificaciones toast** — Feedback visual inmediato para cada acción (success, error, warning, info)
- **Skeleton loading** — Estados de carga con animación shimmer
- **Indicador de conexión** — Status dot en tiempo real (conectado, sincronizando, sin conexión)
- **Responsive** — Adaptable a diferentes tamaños de pantalla

### Perfil de Usuario

- **Información de cuenta** — Nombre, email, perfil y estado
- **Cambio de contraseña** — Formulario seguro con validación
- **Selector de tema** — Toggle claro/oscuro accesible desde el perfil

---

## Estados de Oportunidad

| Estado | Color | Descripción |
|:---|:---:|:---|
| En Desarrollo | 🟡 | Oportunidad en etapa inicial de trabajo |
| Entregada | 🔵 | Propuesta enviada al cliente |
| Pausa | 🟠 | Temporalmente detenida |
| No Go | ⚪ | Descartada por el equipo |
| Cancelada | ⚪ | Cancelada por el cliente |
| Perdida | 🔴 | No ganada |
| Ganada | 🟩 | Cerrada y ganada |

---

## Roles y Permisos

| Acción | Admin | Usuario | Solo Lectura |
|:---|:---:|:---:|:---:|
| Ver todas las oportunidades | ✅ | ✅ | ✅ |
| Ver Kanban (todas las cards) | ✅ | ✅ | ✅ |
| Ver Calendario | ✅ | ✅ | ✅ |
| Ver Estadísticas | ✅ | ✅ | ✅ |
| Ver Log de Eventos | ✅ | ✅ | ✅ |
| Crear oportunidad | ✅ | ✅ | ❌ |
| Editar oportunidad propia | ✅ | ✅ | ❌ |
| Editar oportunidad ajena | ✅ | ❌ | ❌ |
| Mover card en Kanban (propia) | ✅ | ✅ | ❌ |
| Mover card en Kanban (ajena) | ✅ | ❌ | ❌ |
| Eliminar oportunidad | ✅ | ❌ | ❌ |
| Eliminar en bulk | ✅ | ❌ | ❌ |
| Administrar usuarios | ✅ | ❌ | ❌ |
| Carga masiva Excel | ✅ | ❌ | ❌ |

---

## Tech Stack

| Capa | Tecnología |
|:---|:---|
| Frontend | HTML5, CSS3, JavaScript (ES6+, vanilla) |
| Autenticación | Firebase Auth (Email/Password) |
| Base de datos | Cloud Firestore con persistencia offline |
| Gráficos | Chart.js 4.x |
| Excel | SheetJS (XLSX) para importación/exportación |
| PDF | Generación via HTML + CSS print (sin dependencias de librerías) |
| FX Rates | ExchangeRate API (cache 30 min) |
| Estilos | Glassmorphism, CSS Custom Properties, Dark Mode |
| Deploy | GitHub Pages |

---

## Estructura del Proyecto

```
├── index.html                  # SPA principal (todas las vistas)
├── login.html                  # Página de login/autenticación
├── favicon.svg                 # Icono de la aplicación
├── firestore.rules             # Reglas de seguridad de Firestore
├── SECURITY.md                 # Política de seguridad
├── .gitignore
│
└── assets/
    ├── app.js                  # Lógica principal: navegación, CRUD, Kanban,
    │                           #   Calendario, Estadísticas, Import, Perfil
    ├── firebase-auth.js        # Autenticación y gestión de usuarios
    ├── firebase-config.js      # Configuración del proyecto Firebase
    ├── firebase-db.js          # Capa de datos Firestore (CRUD, cache,
    │                           #   listeners, log, exportación Excel)
    ├── style.css               # Estilos unificados (glassmorphism, dark mode,
    │                           #   responsive, animaciones)
    └── theme.js                # Toggle y persistencia de tema claro/oscuro
```

---

## Despliegue

La aplicación se despliega automáticamente en **GitHub Pages** al hacer push a la rama `main`.

### Configuración requerida en Firebase

1. **Firestore Rules** — Actualizar desde [Firebase Console](https://console.firebase.google.com/) > Firestore > Rules con el contenido de `firestore.rules`
2. **Authorized Domains** — Agregar el dominio de GitHub Pages en Firebase Console > Authentication > Settings > Authorized Domains
3. **Counter inicial** — Asegurar que exista el documento `counters/oportunidades` con `{ nextId: 1 }` (se crea automáticamente en el primer alta)

---

## Seguridad

La API key de Firebase incluida en el código es **pública por diseño** y no representa un riesgo de seguridad. Las reglas de Firestore protegen el acceso a los datos. Ver [SECURITY.md](SECURITY.md) para más detalles.

---

## Licencia

Uso interno — PRESALES AR
