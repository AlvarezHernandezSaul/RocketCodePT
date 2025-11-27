# Issue Classification Service

Servicio Python ligero para clasificación automática de issues usando reglas basadas en palabras clave.

## Características

- **FastAPI**: Framework moderno y rápido para APIs
- **Clasificación por reglas**: 10 categorías predefinidas basadas en palabras clave
- **Sin dependencias complejas**: Solo FastAPI, Uvicorn y Pydantic
- **Endpoint REST**: POST `/classify` para clasificar issues

## Instalación

```bash
# Crear entorno virtual (opcional pero recomendado)
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt
```

## Ejecución

```bash
# Desarrollo
uvicorn app:app --reload --host 0.0.0.0 --port 8001

# Producción
uvicorn app:app --host 0.0.0.0 --port 8001
```

## API Endpoints

### POST /classify
Clasifica un issue basado en título y descripción.

**Request:**
```json
{
  "title": "Login authentication fails with token error",
  "description": "Users cannot login when JWT token expires"
}
```

**Response:**
```json
{
  "tags": ["security", "bug"]
}
```

### GET /rules
Muestra las reglas de clasificación disponibles.

### GET /health
Health check del servicio.

## Reglas de Clasificación

1. **security**: auth, login, token, password, credential, session
2. **bug**: bug, error, crash, exception, fail, broken
3. **enhancement**: feature, enhancement, improve, add, new
4. **ui**: ui, interface, design, frontend, css, responsive
5. **backend**: api, backend, server, database, endpoint
6. **performance**: performance, slow, optimize, speed, latency
7. **testing**: test, testing, unit, integration, coverage
8. **documentation**: documentation, docs, readme, guide, manual
9. **deployment**: deployment, deploy, production, staging, ci/cd
10. **urgent**: urgent, critical, blocker, hotfix

## Uso con Docker

```bash
docker build -t issue-classifier .
docker run -p 8001:8001 issue-classifier
```

## Integración

El servicio es consumido automáticamente por el backend Node.js cuando se crea un nuevo issue. Si el servicio no está disponible, el issue se crea sin etiquetas automáticas.
