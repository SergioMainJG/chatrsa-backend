# 💬 Chat RSA Backend

Backend de aplicación de chat con encriptación RSA, construido con **Deno** y **TypeScript**.

---

## 🚀 Estado del Proyecto

### ✅ Funcionalidades Completadas (61%)

```
Infraestructura:      ████████████████████ 100%
Autenticación:        ████████████████████ 100%
Mensajes (HTTP):      ████████░░░░░░░░░░░░  45%
WebSockets:           ░░░░░░░░░░░░░░░░░░░░   0%
Documentación:        ████████████████████ 100%
```

### 📊 Lo que está FUNCIONANDO:

- ✅ **Sistema de Autenticación Completo**
  - Registro de usuarios con validación
  - Login con verificación de credenciales
  - Encriptación de contraseñas (Argon2id)
  - Generación de JWT con expiración
  - Manejo robusto de errores

- ✅ **Infraestructura**
  - Servidor Deno configurado y estable
  - Base de datos SQLite funcionando
  - Sistema de routing personalizado
  - Manejo de errores HTTP
  - Variables de entorno

- ✅ **API REST**
  - Health check endpoint
  - Endpoints de autenticación
  - Documentación completa

### 🚧 En Desarrollo:

- ⏳ Sistema de mensajes HTTP (45% completo)
- ⏳ WebSockets para tiempo real (0%)
- ⏳ Middleware de autenticación JWT (0%)

---

## 📚 Documentación

- [📖 Documentación de API](./API_DOCUMENTATION.md) - Guía completa de endpoints
- [📊 Estado del Proyecto](./PROJECT_STATUS.md) - Análisis detallado de progreso
- [🧪 Script de Testing](./test-endpoints.sh) - Pruebas automatizadas

---

## 🏗️ Arquitectura

El proyecto sigue **Clean Architecture** con separación de responsabilidades:

```
src/
├── config/           # Configuración (DB, JWT, Encrypter)
├── controllers/      # Controladores HTTP
├── datasources/      # Acceso a datos (SQLite)
├── dtos/            # Data Transfer Objects con validación
├── models/          # Modelos de dominio
├── repositories/    # Capa de abstracción de datos
├── routes/          # Definición de rutas
├── services/        # Lógica de negocio
├── use-cases/       # Casos de uso
├── utils/           # Utilidades y helpers
└── main.ts          # Punto de entrada
```

---

## 🛠️ Tecnologías

- **Runtime:** Deno 2.x
- **Lenguaje:** TypeScript
- **Base de Datos:** SQLite
- **Autenticación:** JWT (jsonwebtoken)
- **Encriptación:** Argon2id
- **Arquitectura:** Clean Architecture
- **Patrones:** Repository, Singleton, Result Pattern

---

## 🚀 Inicio Rápido

### Prerrequisitos

- Deno 2.x instalado ([Instalación](https://deno.land/))

### Instalación

1. Clonar el repositorio
```bash
git clone <url-repositorio>
cd chat-rsa-backend
```

2. Configurar variables de entorno

El archivo `.env` ya está configurado:
```env
PROD=false
PORT=3000
PATH_DATABASE=/home/software-development/projects/chat-rsa-backend/var/data/
DATABASE=chat-rsa-database.db
TABLE_USER=Users
TABLE_MESSAGE=Messages
JWT_SEED=your-secret-key-here
```

3. Iniciar el servidor
```bash
deno task dev
```

O manualmente:
```bash
deno run --env --allow-net --allow-write --allow-read --allow-env --allow-ffi src/main.ts
```

El servidor estará disponible en `http://localhost:3000`

---

## 🧪 Testing

### Ejecutar pruebas automatizadas

```bash
./test-endpoints.sh
```

### Probar manualmente con curl

**Health Check:**
```bash
curl http://localhost:3000/api/health
```

**Registrar usuario:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"alice","password":"SecurePass123!"}'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"name":"alice","password":"SecurePass123!"}'
```

---

## 📡 API Endpoints

### Autenticación

| Método | Endpoint               | Descripción              | Estado |
|--------|------------------------|--------------------------|--------|
| GET    | `/api/health`          | Health check             | ✅     |
| POST   | `/api/auth/register`   | Registrar usuario        | ✅     |
| POST   | `/api/auth/login`      | Login de usuario         | ✅     |

### Mensajes (Próximamente)

| Método | Endpoint               | Descripción              | Estado |
|--------|------------------------|--------------------------|--------|
| POST   | `/api/messages`        | Crear mensaje            | 🚧     |
| GET    | `/api/messages`        | Obtener mensajes         | 🚧     |
| GET    | `/api/messages/:id`    | Obtener mensaje por ID   | 🚧     |

Ver [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) para detalles completos.

---

## 🔐 Seguridad

### Contraseñas
- **Algoritmo:** Argon2id
- **Memory Cost:** 65536 KB
- **Time Cost:** 3 iteraciones
- **Paralelismo:** 4 threads

### JWT
- **Algoritmo:** HS256
- **Expiración:** 1 hora
- **Seed:** Configurable vía `.env`

### Validaciones
- Validación de datos de entrada en DTOs
- Verificación de duplicados
- Manejo de errores tipados
- Códigos HTTP apropiados

---

## 📁 Estructura de la Base de Datos

### Tabla `Users`
```sql
CREATE TABLE Users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);
```

### Tabla `Messages`
```sql
CREATE TABLE Messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  content TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE INDEX idx_messages_userId ON Messages(userId);
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📝 Scripts Disponibles

```json
{
  "dev": "deno run --env --allow-net --allow-write --allow-read --allow-env --allow-ffi --watch src/main.ts"
}
```

**Ejecutar:**
```bash
deno task dev
```

---

## 🐛 Troubleshooting

### Error: Cannot connect to database
**Solución:** Verifica que el directorio `var/data/` existe:
```bash
mkdir -p var/data/
```

### Error: JWT token invalid
**Solución:** Verifica que `JWT_SEED` está configurado en `.env`

### Error: Port already in use
**Solución:** Cambia el puerto en `.env` o detén el proceso que usa el puerto:
```bash
lsof -ti:3000 | xargs kill
```

---

## 📊 Métricas del Proyecto

- **Líneas de código:** ~2,000+
- **Archivos TypeScript:** 30+
- **Cobertura de tests:** 25%
- **Endpoints funcionales:** 3/3 (Auth) + 0/3 (Messages)
- **Tiempo de respuesta promedio:** <50ms

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT.

---

## 👥 Autores

- Equipo de Desarrollo

---

## 🙏 Agradecimientos

- Deno team por el excelente runtime
- Argon2 por el algoritmo de hashing seguro
- Comunidad de TypeScript

---

**Última actualización:** 2025-10-06  
**Versión:** 1.0.0  
**Estado:** En desarrollo activo 🚀
 