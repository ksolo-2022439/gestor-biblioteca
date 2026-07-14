# Sistema de Gestión de Biblioteca (Monorepo)

Proyecto de Evaluación de Desarrollo Ágil (Variante 1) para 6to. Informática de Kinal.

## Servicios

- `frontend`: Aplicación React + Vite (Puerto 5173)
- `service-auth`: Microservicio de Autenticación (Puerto 3001)
- `service-library`: Microservicio de Catálogo y Préstamos (Puerto 3002)
- `service-statistics`: Microservicio de Estadísticas analíticas (Puerto 3003)

## Requisitos de Ejecución

1. Tener MongoDB corriendo localmente en `mongodb://localhost:27017`.
2. Ejecutar `npm install` en cada uno de los directorios de los servicios.
3. Iniciar cada servicio con `npm run dev`.
