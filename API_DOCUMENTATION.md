# 📚 Chat RSA Backend - API Documentation

## 📋 Tabla de Contenidos
- [Información General](#información-general)
- [Base URL](#base-url)
- [Autenticación](#autenticación)
- [Endpoints](#endpoints)
  - [Health Check](#health-check)
  - [Registro de Usuario](#registro-de-usuario)
  - [Login de Usuario](#login-de-usuario)
- [Códigos de Estado](#códigos-de-estado)
- [Modelos de Datos](#modelos-de-datos)
- [Ejemplos de Uso](#ejemplos-de-uso)

---

## 🔍 Información General

API REST para gestión de autenticación de usuarios con encriptación de contraseñas usando Argon2 y autenticación mediante JWT.

**Versión:** 1.0.0  
**Tecnología:** Deno + TypeScript  
**Base de Datos:** SQLite

---

## 🌐 Base URL

```
http://localhost:3000
```

---

## 🔐 Autenticación

La API utiliza JSON Web Tokens (JWT) para la autenticación. Después de un registro o login exitoso, recibirás un token que deberás incluir en las peticiones protegidas.

```http
Authorization: Bearer <tu_token_jwt>
```

---

## 📡 Endpoints

### Health Check

Verifica el estado del servidor.

**Endpoint:** `GET /api/health`

**Autenticación:** No requiere

#### Respuesta Exitosa (200 OK)

```json
{
  "status": "ok",
  "timestamp": "2025-10-06T19:43:43.499Z"
}
```

#### Ejemplo de Uso

```bash
curl -X GET http://localhost:3000/api/health
```

---

### Registro de Usuario

Crea una nueva cuenta de usuario.

**Endpoint:** `POST /api/auth/register`

**Autenticación:** No requiere

#### Request Body

| Campo    | Tipo   | Requerido | Descripción                    |
|----------|--------|-----------|--------------------------------|
| name     | string | Sí        | Nombre de usuario (único)      |
| password | string | Sí        | Contraseña del usuario         |

```json
{
  "name": "bob",
  "password": "MyPassword123!"
}
```

#### Respuesta Exitosa (201 Created)

```json
{
  "user": {
    "id": 1,
    "name": "bob",
    "password": "$argon2id$v=19$m=65536,t=3,p=4$..."
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Errores Posibles

**400 Bad Request** - Usuario ya existe
```json
{
  "error": "User with name \"bob\" already exists"
}
```

**400 Bad Request** - Validación fallida
```json
{
  "error": "The name must exist"
}
```

#### Validaciones

- `name`: No puede estar vacío, debe ser string
- `password`: No puede estar vacío, debe ser string

#### Ejemplo de Uso

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "bob",
    "password": "MyPassword123!"
  }'
```

---

### Login de Usuario

Autentica un usuario existente.

**Endpoint:** `POST /api/auth/login`

**Autenticación:** No requiere

#### Request Body

| Campo    | Tipo   | Requerido | Descripción                    |
|----------|--------|-----------|--------------------------------|
| name     | string | Sí        | Nombre de usuario              |
| password | string | Sí        | Contraseña del usuario         |

```json
{
  "name": "bob",
  "password": "MyPassword123!"
}
```

#### Respuesta Exitosa (200 OK)

```json
{
  "user": {
    "id": 1,
    "name": "bob",
    "password": "$argon2id$v=19$m=65536,t=3,p=4$..."
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Errores Posibles

**401 Unauthorized** - Credenciales inválidas
```json
{
  "error": "Invalid credentials"
}
```

**400 Bad Request** - Validación fallida
```json
{
  "error": "The name must exist"
}
```

#### Ejemplo de Uso

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "name": "bob",
    "password": "MyPassword123!"
  }'
```

---

## 📊 Códigos de Estado

| Código | Significado                | Descripción                                    |
|--------|----------------------------|------------------------------------------------|
| 200    | OK                         | Petición exitosa                               |
| 201    | Created                    | Recurso creado exitosamente                    |
| 400    | Bad Request                | Error en los datos enviados                    |
| 401    | Unauthorized               | Credenciales inválidas                         |
| 404    | Not Found                  | Endpoint no encontrado                         |
| 500    | Internal Server Error      | Error interno del servidor                     |

---

## 📦 Modelos de Datos

### User

```typescript
{
  id: number;           // ID único del usuario (auto-generado)
  name: string;         // Nombre de usuario (único)
  password: string;     // Contraseña encriptada con Argon2
}
```

### AuthResponse

```typescript
{
  user: User;           // Datos del usuario
  token: string;        // JWT token válido por 1 hora
}
```

### ErrorResponse

```typescript
{
  error: string;        // Mensaje descriptivo del error
}
```

---

## 💡 Ejemplos de Uso

### Flujo Completo: Registro y Login

#### 1. Verificar estado del servidor

```bash
curl -X GET http://localhost:3000/api/health
```

**Respuesta:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-06T19:43:43.499Z"
}
```

---

#### 2. Registrar nuevo usuario

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "alice",
    "password": "SecurePass123!"
  }'
```

**Respuesta (201):**
```json
{
  "user": {
    "id": 1,
    "name": "alice",
    "password": "$argon2id$v=19$m=65536,t=3,p=4$..."
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzU5Nzc5ODIzLCJleHAiOjE3NTk3ODM0MjN9..."
}
```

---

#### 3. Intentar duplicar usuario (falla esperada)

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "alice",
    "password": "AnotherPassword"
  }'
```

**Respuesta (400):**
```json
{
  "error": "User with name \"alice\" already exists"
}
```

---

#### 4. Login con credenciales correctas

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "name": "alice",
    "password": "SecurePass123!"
  }'
```

**Respuesta (200):**
```json
{
  "user": {
    "id": 1,
    "name": "alice",
    "password": "$argon2id$v=19$m=65536,t=3,p=4$..."
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

#### 5. Login con credenciales incorrectas (falla esperada)

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "name": "alice",
    "password": "WrongPassword"
  }'
```

**Respuesta (401):**
```json
{
  "error": "Invalid credentials"
}
```

---

### Usando el Token JWT

Una vez que obtienes el token, puedes usarlo en peticiones protegidas:

```bash
# Guardar el token en una variable
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Usar el token en peticiones protegidas
curl -X GET http://localhost:3000/api/protected-endpoint \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🔒 Seguridad

### Encriptación de Contraseñas

Las contraseñas se encriptan usando **Argon2id** con los siguientes parámetros:
- Memory cost: 65536 KB
- Time cost: 3 iterations
- Parallelism: 4 threads

### JWT

Los tokens JWT tienen las siguientes características:
- Algoritmo: HS256
- Duración: 1 hora
- Payload incluye: ID del usuario

---

## 🗄️ Base de Datos

### Configuración

La base de datos SQLite se crea automáticamente en:
```
/home/software-development/projects/chat-rsa-backend/var/data/chat-rsa-database.db
```

### Esquema de Tabla Users

```sql
CREATE TABLE Users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);
```

---

## 🚀 Iniciar el Servidor

### Desarrollo

```bash
deno task dev
```

O manualmente:

```bash
deno run --env --allow-net --allow-write --allow-read --allow-env --allow-ffi src/main.ts
```

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
PROD=false
PORT=3000
PATH_DATABASE=/home/software-development/projects/chat-rsa-backend/var/data/
DATABASE=chat-rsa-database.db
TABLE_USER=Users
TABLE_MESSAGE=Messages
JWT_SEED=your-secret-key-here
```

---

## 📝 Notas Adicionales

- Las contraseñas nunca se almacenan en texto plano
- Los tokens JWT expiran después de 1 hora
- El nombre de usuario debe ser único en el sistema
- Todos los endpoints retornan JSON
- Los timestamps están en formato ISO 8601 (UTC)

---

## 🧪 Testing

Puedes usar el script de prueba incluido:

```bash
./test-endpoints.sh
```

O probar manualmente con curl, Postman, o cualquier cliente HTTP.

---

## 📧 Soporte

Para reportar problemas o sugerencias, contacta al equipo de desarrollo.

---

**Última actualización:** 2025-10-06
