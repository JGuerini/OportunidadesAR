# Firebase Backup & Restore Guide

Guia completa para respaldar y restaurar la base de datos del CRM OportunidadesAR.

---

## Resumen rapido

La aplicacion cuenta con una herramienta integrada en la seccion **Administracion** que permite exportar e importar la base de datos completa en formato JSON.

- **Exportar**: Genera un archivo `.json` con todos los datos del sistema
- **Importar**: Restaura datos desde un archivo `.json` de backup previo

Ambas opciones estan disponibles unicamente para usuarios con perfil **Admin**.

---

## Ubicacion

`Administracion` > **Backup de Base de Datos**

---

## Que incluye el backup?

El archivo JSON generado contiene las siguientes colecciones:

| Coleccion | Descripcion | Contenido |
|:---|:---|:---|
| `oportunidades` | Todas las oportunidades del sistema | ID de Firestore, codigo OPP-XXXX, cliente, estado, fechas, TCV, notas, todos los campos |
| `usuarios` | Perfiles de usuarios | Nombre, email, perfil (admin/usuario/solo lectura), estado activo |
| `log_eventos` | Registro historico de eventos | Creaciones, ediciones, eliminaciones, cambios de estado con fecha y usuario |
| `counter` | Contador secuencial | Valor actual de `nextId` para la generacion automatica de codigos OPP-XXXX |

Adicionalmente, el archivo incluye un bloque `_meta` con metadatos:

```json
{
  "_meta": {
    "version": 2,
    "fecha": "2025-01-15T10:30:00.000Z",
    "generadoPor": "OportunidadesAR CRM",
    "coleccion": {
      "oportunidades": 42,
      "log_eventos": 156,
      "usuarios": 8
    }
  },
  "counter": { "nextId": 43 },
  "oportunidades": [ ... ],
  "log_eventos": [ ... ],
  "usuarios": [ ... ]
}
```

---

## Exportar un backup

1. Ir a **Administracion** desde la barra lateral
2. En la card **Backup de Base de Datos**, hacer click en **"Exportar JSON"**
3. Se descargara automaticamente un archivo llamado `backup_oportunidades_YYYY-MM-DD.json`
4. Guardar el archivo en un lugar seguro

No se necesita configuracion adicional. El archivo se genera con todos los datos actuales al momento de la exportacion.

---

## Restaurar un backup (misma instancia)

Util para recuperar datos en caso de perdida accidental o corrupcion.

1. Ir a **Administracion** > **Backup de Base de Datos**
2. En la seccion **"Restaurar desde archivo"**, seleccionar el archivo `.json` del backup
3. Hacer click en **"Restaurar Backup"**
4. Aparecera un dialogo de confirmacion, ya que el proceso **sobreescribe todos los datos actuales**
5. Esperar a que la barra de progreso termine
6. Al finalizar, se muestra un resumen con la cantidad de registros restaurados

### Que hacer despues de restaurar

- La aplicacion detecta los cambios automaticamente via el listener en tiempo real
- Si alguna pagina muestra datos vacios o incorrectos, navegar a otra seccion y volver
- Si el problema persiste, refrescar la pagina con `Ctrl+Shift+R`

---

## Migrar a otra instancia de Firebase

Guia paso a paso para mudar toda la base de datos a un proyecto nuevo de Firebase.

### Requisitos previos

- Acceso como Admin al CRM actual (para exportar)
- Acceso como Admin al nuevo proyecto Firebase (Firebase Console)
- El archivo `.json` de backup exportado

### Paso 1: Crear el nuevo proyecto en Firebase

1. Ir a [Firebase Console](https://console.firebase.google.com/)
2. Crear un nuevo proyecto (o seleccionar uno existente)
3. Activar **Authentication** > **Email/Password** como metodo de inicio de sesion
4. Crear la base de datos **Cloud Firestore** (modo de produccion o test)
5. En **Authentication** > **Settings** > **Authorized Domains**, agregar el dominio donde se desplegara la app (ej: `tudominio.github.io`)
6. Aplicar las reglas de seguridad desde el archivo `firestore.rules` del repositorio:
   - Ir a **Firestore** > **Rules** y reemplazar con el contenido del archivo
   - Guardar y publicar

### Paso 2: Configurar las credenciales en la aplicacion

1. En Firebase Console, ir a **Project Settings** (engranaje) > **General**
2. Anotar los valores de:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`
3. Editar el archivo `assets/firebase-config.js` en el repositorio y reemplazar los valores
4. Hacer deploy de la aplicacion con las nuevas credenciales

### Paso 3: Restaurar los datos

1. Iniciar sesion como Admin en la nueva instancia (se necesita al menos un usuario creado)
2. Para crear el primer usuario Admin:
   - Ir a **Firebase Console** > **Authentication** > **Users** > **Add User**
   - Ingresar email y contrasena
   - Luego, en **Firestore**, crear el documento `usuarios/{UID_DEL_USUARIO}` con:
     ```json
     {
       "nombre": "Tu Nombre",
       "email": "tu@email.com",
       "usuario": "tu_usuario",
       "perfil": "admin",
       "activo": true
     }
     ```
3. Iniciar sesion en la aplicacion con ese usuario
4. Ir a **Administracion** > **Backup de Base de Datos**
5. Seleccionar el archivo `.json` exportado de la instancia anterior
6. Hacer click en **"Restaurar Backup"**
7. Esperar a que termine el proceso

### Paso 4: Crear las cuentas de usuario en Firebase Auth

El backup restaura los **perfiles** de usuarios en Firestore (nombre, email, perfil, activo), pero **no** las cuentas de autenticacion (Firebase Auth). Esto es por diseno, ya que las contrasenas nunca se almacenan.

Opciones para recrear los usuarios:

**Opcion A: Desde la aplicacion (recomendado para pocos usuarios)**

1. Ir a **Administracion** > **Gestion de Usuarios**
2. Hacer click en **"Crear Usuario"**
3. Ingresar los datos del usuario (nombre, email, perfil)
4. Asignar una contrasena temporal
5. Repetir para cada usuario
6. Los usuarios deberan cambiar su contrasena al primer inicio

**Opcion B: Desde Firebase Console (recomendado para muchos usuarios)**

1. Ir a **Firebase Console** > **Authentication** > **Users**
2. Hacer click en **"Add User"** para cada usuario
3. Usar los emails que figuran en el backup JSON (seccion `usuarios`)
4. Asignar contrasenas temporales
5. Comunicar las contrasenas temporales a cada usuario por canal seguro

**Opcion C: Importar usuarios con Firebase Admin SDK (avanzado)**

Para proyectos con muchos usuarios, se puede usar el Firebase Admin SDK con un script que lea el archivo JSON y cree las cuentas en lote. Esto requiere un entorno Node.js y las credenciales de administrador del proyecto.

### Paso 5: Verificar la migracion

- [ ] Iniciar sesion con un usuario Admin
- [ ] Verificar que las oportunidades se muestran correctamente en todas las vistas (Mis Oportunidades, Ver Todas, Kanban, Calendario)
- [ ] Verificar que el contador OPP-XXXX asigna codigos correlativos correctos (el proximo OPP-XXXX deberia seguir la secuencia del backup)
- [ ] Verificar que los filtros de estadisticas funcionan
- [ ] Verificar que el log de eventos muestra el historial
- [ ] Iniciar sesion con un usuario normal y verificar permisos
- [ ] Probar crear, editar y eliminar una oportunidad

---

## Consideraciones importantes

### Sobre los IDs de Firestore

El backup preserva los IDs originales de los documentos. Esto significa que al restaurar:

- Los documentos se crean con el mismo ID que tenian en la instancia original
- Las referencias internas se mantienen intactas
- Si existian documentos con esos IDs en la instancia destino, seran sobrescritos

### Sobre Firebase Auth vs Firestore

El sistema de usuarios funciona en dos capas:

1. **Firebase Authentication**: Gestiona email, contrasena y sesion (no se incluye en el backup por seguridad)
2. **Firestore (coleccion `usuarios`)**: Almacena el perfil (nombre, email, rol, estado activo) — si se incluye en el backup

Ambas capas deben estar sincronizadas para que la aplicacion funcione correctamente. El email en Firebase Auth debe coincidir con el email en el perfil de Firestore.

### Limitaciones

- El backup no incluye las **reglas de seguridad** de Firestore (estas estan en el archivo `firestore.rules` del repositorio)
- El backup no incluye la **configuracion de Firebase** (project settings, authorized domains, etc.)
- Las **contrasenas de usuarios** nunca se almacenan ni se exportan
- Si el archivo JSON es muy grande (miles de oportunidades), el proceso de importacion puede tardar algunos minutos
- Firestore permite un maximo de **500 operaciones por batch write**; la importacion se divide automaticamente en lotes

### Frecuencia recomendada

- **Antes de cambios importantes**: Siempre exportar un backup antes de actualizar la aplicacion o hacer cambios masivos
- **Periodico**: Se recomienda exportar un backup semanal o quincenal como practica de buena fe
- **Antes de una migracion**: Exportar inmediatamente antes de iniciar el proceso de migracion a otra instancia

---

## Estructura del archivo JSON

```json
{
  "_meta": {
    "version": 2,
    "fecha": "2025-01-15T10:30:00.000Z",
    "generadoPor": "OportunidadesAR CRM",
    "coleccion": {
      "oportunidades": 42,
      "log_eventos": 156,
      "usuarios": 8
    }
  },

  "counter": {
    "nextId": 43
  },

  "oportunidades": [
    {
      "id": "aBcDeFgHiJkLmNoPqRsTuV",
      "codigo": "OPP-0001",
      "cliente": "Cliente Ejemplo",
      "industria": "Tecnologia",
      "practica": "CES",
      "nombre": "Proyecto de ejemplo",
      "descripcion": "Descripcion de la oportunidad",
      "origen": "Proyecto",
      "responsable": "Juan Perez",
      "estado": "En Desarrollo",
      "fechaInicio": "2025-01-01",
      "fechaEntrega": "2025-03-15",
      "notas": "Notas internas",
      "sharepoint": "https://...",
      "tcv": "1500000",
      "currency": "ARS",
      "tcvEur": "15000",
      "tipoCambio": "100",
      "probabilidad": "70",
      "pm": "15",
      "fechaCreacion": "2025-01-15T10:00:00.000Z",
      "fechaModificacion": "2025-01-15T12:00:00.000Z"
    }
  ],

  "log_eventos": [
    {
      "id": "xYzAbCdEfGhIjKlMnOpQr",
      "fecha": "2025-01-15T10:00:00.000Z",
      "usuario": "Juan Perez",
      "usuarioUid": "uid123",
      "accion": "creacion",
      "detalle": "Oportunidad creada: OPP-0001",
      "oppId": "aBcDeFgHiJkLmNoPqRsTuV",
      "oppCodigo": "OPP-0001",
      "oppNombre": "Proyecto de ejemplo"
    }
  ],

  "usuarios": [
    {
      "uid": "uid123",
      "nombre": "Juan Perez",
      "email": "juan@ejemplo.com",
      "usuario": "jperez",
      "perfil": "admin",
      "activo": true
    }
  ]
}
```
