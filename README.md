# Issue Tracker Application

Una aplicación completa de gestión de incidencias (Issue Tracker) con autenticación, clasificación automática y arquitectura de microservicios.

> **🤖 Desarrollo con Apoyo de IA**  
> Este proyecto fue desarrollado con el apoyo de **Windsurf** y **Claude Sonnet 4.5 Thinking**, siguiendo las mejores prácticas de desarrollo:
> - ✅ Clean Architecture y principios SOLID
> - ✅ Código mantenible y escalable
> - ✅ Separación de responsabilidades
> - ✅ Patrones de diseño reconocidos
> - ✅ Documentación completa y clara
> 
> La IA fue utilizada como herramienta de apoyo para acelerar el desarrollo, garantizar las buenas prácticas y mejorar la calidad del código, siempre bajo supervisión humana para las decisiones técnicas críticas.

## 🏗️ Arquitectura

- **Backend**: Node.js + Express + Supabase + JWT
- **Frontend**: React + Zustand + Tailwind CSS + Axios
- **Servicio Auxiliar**: Python + FastAPI (clasificación automática)
- **Despliegue**: Docker Compose
- **Base de Datos** :No es necesaria la creacion local de una base de datos, ya que el proyecto se encuentra conectado a una BD-SQL en la nube (supabase), puede acceder creando sus licencias o acceder con las licencias: test@example.com y test123

## 🚀 Características

### Backend Principal (Node.js)
- ✅ API REST completa para usuarios, proyectos e incidencias
- ✅ Autenticación con JWT y bloqueo temporal (3 intentos fallidos)
- ✅ Integración con Supabase para persistencia
- ✅ Clean Architecture con separación de responsabilidades
- ✅ Middleware de autenticación y manejo de errores

### Servicio Auxiliar (Python)
- ✅ Clasificación automática de issues con 10 categorías
- ✅ FastAPI con documentación automática
- ✅ Reglas basadas en palabras clave
- ✅ Health check y endpoints de diagnóstico

### Frontend (React)
- ✅ Login/Register con manejo de bloqueo temporal
- ✅ Dashboard de proyectos con búsqueda y filtros
- ✅ Vista Kanban de issues (To Do, In Progress, Done)
- ✅ Creación de issues con tags automáticos
- ✅ Estado global con Zustand
- ✅ Diseño responsivo con Tailwind CSS

## 📋 Requisitos Previos

- Node.js 22+
- Python 3.11+
- Docker y Docker Compose
- Cuenta de Supabase (gratuita-SQL)

## 🛠️ Instalación y Ejecución

### Opción 1: Docker Compose (Recomendado)

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd issue-tracker
   ```

2. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```

3. **Levant todos los servicios**
   ```bash
   docker-compose up --build
   ```

4. **Acceder a la aplicación**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - Servicio Python: http://localhost:8001

### Opción 2: Desarrollo Local

1. **Backend Node.js**
   ```bash
   cd api-node/api-node
   npm install
   cp .env.example .env
   # Configurar variables de entorno
   npm run dev
   ```

2. **Servicio Python**
   ```bash
   cd python-service
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn app:app --reload --host 0.0.0.0 --port 8001
   ```

3. **Frontend React**
   ```bash
   cd api-node/frontend
   npm install
   npm run dev
   ```

## 🗄️ Configuración de Base de Datos (Supabase)

### Tablas Requeridas

Ejecuta estos SQL en tu proyecto Supabase:

```sql
-- Users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Issues table
CREATE TABLE issues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reporter_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'todo',
  priority VARCHAR(50) DEFAULT 'medium',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_issues_project_id ON issues(project_id);
CREATE INDEX idx_issues_assignee_id ON issues(assignee_id);
CREATE INDEX idx_issues_reporter_id ON issues(reporter_id);
CREATE INDEX idx_issues_status ON issues(status);

## 📚 API Endpoints

### Autenticación
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/register` - Registro
- `GET /api/auth/profile` - Perfil de usuario

### Proyectos
- `GET /api/projects` - Listar proyectos del usuario
- `POST /api/projects` - Crear proyecto
- `GET /api/projects/:id` - Obtener proyecto
- `PUT /api/projects/:id` - Actualizar proyecto
- `DELETE /api/projects/:id` - Eliminar proyecto
- `GET /api/projects/:id/issues` - Listar issues del proyecto

### Issues
- `GET /api/issues` - Listar issues (con filtros)
- `POST /api/issues` - Crear issue (con clasificación automática)
- `GET /api/issues/:id` - Obtener issue
- `PUT /api/issues/:id` - Actualizar issue
- `DELETE /api/issues/:id` - Eliminar issue

### Servicio de Clasificación
- `POST /classify` - Clasificar issue
- `GET /rules` - Ver reglas de clasificación
- `GET /health` - Health check

## 🎯 Funcionalidades Principales

### 1. Autenticación Segura
- JWT tokens con expiración de 24h
- Bloqueo temporal después de 3 intentos fallidos (3 minutos)
- Hashing de contraseñas con bcryptjs
- Middleware de autenticación en rutas protegidas

### 2. Gestión de Proyectos
- Crear, editar, eliminar proyectos
- Asignación automática de owner
- Búsqueda y filtrado de proyectos
- Vista de cards con información relevante

### 3. Gestión de Issues
- Vista Kanban con 3 columnas (To Do, In Progress, Done)
- Creación de issues con tags automáticos
- Prioridades (High, Medium, Low)
- Cambio de estado con drag & drop visual
- Asignación de usuarios

### 4. Clasificación Automática
- 10 categorías predefinidas
- Detección basada en palabras clave
- Integración transparente con el backend
- Fallback si el servicio no está disponible


## 🔧 Desarrollo

### Estructura de Proyecto
```
├── api-node/
│   ├── api-node/          # Backend Node.js
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── repositories/
│   │   │   ├── models/
│   │   │   ├── middlewares/
│   │   │   └── routes/
│   │   └── Dockerfile
│   └── frontend/          # Frontend React
│       ├── src/
│       │   ├── pages/
│       │   ├── components/
│       │   ├── store/
│       │   └── services/
│       └── Dockerfile
├── python-service/        # Servicio Python
│   ├── app.py
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

### Buenas Prácticas Implementadas
- ✅ Clean Architecture
- ✅ SOLID Principles
- ✅ DRY (Don't Repeat Yourself)
- ✅ KISS (Keep It Simple, Stupid)
- ✅ Manejo de errores centralizado
- ✅ Logging estructurado
- ✅ Variables de entorno
- ✅ Docker multi-stage builds

## 🚀 Despliegue en Producción

### Docker Compose (Producción)
```bash
# Variables de entorno producción
export NODE_ENV=production
export JWT_SECRET=your-super-secret-key

# Levantar servicios
docker-compose -f docker-compose.yml up -d
```

### Health Checks
- Backend: `/health`
- Python Service: `/health`
- Frontend: Vite dev server
