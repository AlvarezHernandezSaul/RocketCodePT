# Issue Tracker API - Node.js Backend

Backend principal de la aplicación de gestión de incidencias.

## Estructura del proyecto

```
src/
├── index.js          # Punto de entrada
├── app.js            # Configuración de Express
├── routes/           # Definición de rutas
├── controllers/      # Lógica de controladores
├── services/         # Lógica de negocio
├── middlewares/      # Middlewares personalizados
└── models/           # Modelos de datos
tests/                # Tests unitarios e integración
```

## Instalación

```bash
npm install
```

## Ejecución

Modo desarrollo (con hot reload):
```bash
npm run dev
```

Modo producción:
```bash
npm start
```

## Testing

```bash
npm test
```

## Endpoints sugeridos

- `POST /api/auth/login` - Login mock
- `GET /api/projects` - Listar proyectos
- `POST /api/projects` - Crear proyecto
- `GET /api/issues` - Listar issues
- `POST /api/issues` - Crear issue (integra con Python classifier)
- `PUT /api/issues/:id` - Actualizar issue
- `DELETE /api/issues/:id` - Eliminar issue

## Notas

- Puedes modificar esta estructura según tus preferencias
- Se recomienda agregar validación de datos
- Considera implementar autenticación JWT
- Agrega tests unitarios e integración
