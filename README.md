# Sistema de Gestión de Biblioteca (Monorepo)

Proyecto de Evaluación de Desarrollo Ágil (Variante 1) para 6to. Informática de Kinal.

Este proyecto consiste en un sistema distribuido compuesto por tres microservicios de Node.js/Express y una interfaz web interactiva desarrollada en React.

---

## Arquitectura del Monorepo

```
gestor-biblioteca/
├── docker-compose.yml
├── README.md
├── frontend/
│   ├── Dockerfile
│   └── src/
├── service-auth/
│   ├── Dockerfile
│   └── src/
├── service-library/
│   ├── Dockerfile
│   └── src/
└── service-statistics/
    ├── Dockerfile
    └── src/
```

### Servicios y Puertos Asignados

| Servicio | Tecnología | Puerto | Propósito |
|---|---|---|---|
| `service-auth` | Node.js / Express | `3001` | Registro y autenticación de usuarios con JWT |
| `service-library` | Node.js / Express | `3002` | CRUD de libros y transacciones de préstamos/devoluciones |
| `service-statistics` | Node.js / Express | `3003` | Analítica, reporte general y motor de recomendaciones |
| `frontend` | React / Vite | `5173` | Panel de control, catálogo y estadísticas web |
| `mongodb` | MongoDB | `27017` | Base de datos persistente (Colecciones independientes) |

---

## Configuración de Variables de Entorno

Cada servicio de backend requiere de un archivo `.env` en su respectivo directorio con las siguientes variables:

### 1. `service-auth/.env`
```env
PORT=3001
URI_MONGODB=mongodb://127.0.0.1:27017/biblioteca_auth
JWT_SECRET=ClaveSecretaKinal2026SuperSeguraYFuerte
```

### 2. `service-library/.env`
```env
PORT=3002
URI_MONGODB=mongodb://127.0.0.1:27017/biblioteca_library
JWT_SECRET=ClaveSecretaKinal2026SuperSeguraYFuerte
```

### 3. `service-statistics/.env`
```env
PORT=3003
JWT_SECRET=ClaveSecretaKinal2026SuperSeguraYFuerte
LIBRARY_SERVICE_URL=http://127.0.0.1:3002/api/v1
```

### 4. `frontend/.env`
```env
VITE_AUTH_URL=http://localhost:3001/api/v1
VITE_LIBRARY_URL=http://localhost:3002/api/v1
VITE_STATISTICS_URL=http://localhost:3003/api/v1
```

---

## Ejecución con Docker Compose (Recomendado)

Docker Compose levantará todos los servicios, configurará la red compartida e iniciará una instancia de MongoDB dedicada de forma automática.

1. Asegúrate de tener instalado y activo Docker Desktop en tu sistema.
2. Abre una terminal en la raíz del proyecto.
3. Ejecuta el comando para construir y levantar los contenedores:
   ```bash
   docker compose up --build -d
   ```
4. Accede a la aplicación React en tu navegador a través de `http://localhost:5173`.

---

## Ejecución Local (Nativa)

### Requisitos Previos
- Node.js versión 18 o superior instalado.
- MongoDB iniciado localmente y escuchando en el puerto `27017`.

### Pasos para Ejecutar
1. Instala las dependencias para cada proyecto ingresando a cada directorio y ejecutando:
   ```bash
   npm install
   ```
2. Inicia los servidores ejecutando en consolas separadas:
   - En `service-auth`: `npm run dev`
   - En `service-library`: `npm run dev`
   - En `service-statistics`: `npm run dev`
   - En `frontend`: `npm run dev`
3. Abre tu navegador e ingresa a `http://localhost:5173`.
