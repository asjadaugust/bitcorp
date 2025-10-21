# Bitcorp ERP

**Sistema de Gestión de Equipos para Obras Civiles - Listo para Producción**

ERP moderno para empresas constructoras que gestionan equipos pesados y operadores en múltiples sitios de proyecto.

---

## 🚀 Inicio Rápido

### Despliegue en Producción (Synology NAS)

```bash
# 1. Clonar repositorio a Synology (vía SSH o File Station)
cd /volume1/docker
git clone <url-de-tu-repo> bitcorp
cd bitcorp

# 2. Configurar ambiente
cp .env.example .env
nano .env  # Establecer contraseñas seguras

# 3. Desplegar contenedores
docker-compose up -d --build

# 4. Inicializar base de datos (esperar 1 minuto)
docker-compose exec backend python -c "from app.core.init_db import initialize_database; from app.core.database import SessionLocal; initialize_database(SessionLocal())"

# 5. Configurar Proxy Inverso de Synology (ver abajo)
```

### ⚙️ Configuración de Proxy Inverso en Synology

**Panel de Control DSM > Portal de Inicio > Avanzado > Proxy Inverso**

Crear regla para Bitcorp:

| Campo | Valor |
|-------|-------|
| **Descripción** | Bitcorp ERP |
| **Protocolo de Origen** | HTTPS |
| **Nombre de Host de Origen** | bitcorp.mohammadasjad.com |
| **Puerto de Origen** | 443 |
| **Protocolo de Destino** | HTTPS |
| **Nombre de Host de Destino** | localhost |
| **Puerto de Destino** | **8443** |

**Encabezados Personalizados** (soporte WebSocket):
- `Upgrade: $http_upgrade`
- `Connection: $connection_upgrade`

✅ Habilitar HSTS  
✅ Habilitar HTTP/2

**Acceso**: https://bitcorp.mohammadasjad.com

---

## 🔑 Cuentas de Prueba

| Rol | Email/Usuario | Contraseña |
|-----|---------------|------------|
| Admin | `admin@bitcorp.com` | `admin123456!` |
| Desarrollador | `developer@bitcorp.com` | `dev123456!` |
| Operador | `john.operator` | `operator123!` |

**⚠️ ¡Cambiar inmediatamente en producción!**

---

## 📦 Qué Incluye

- **Backend**: FastAPI + PostgreSQL + Redis
- **Frontend**: Next.js 14 + Material-UI + SWR
- **Proxy Inverso**: Nginx (HTTPS + dominio unificado)
- **Funciones**: Seguimiento de equipos, gestión de operadores, reportes móviles, análisis de costos

---

## 🛠 Comandos Comunes

```bash
# Ver registros
docker-compose logs -f

# Reiniciar servicios
docker-compose restart

# Detener todo
docker-compose down

# Resetear base de datos (⚠️ destruye datos)
docker-compose down -v
docker-compose up -d --build
```

---

## 🌐 Puntos de Acceso

- **Aplicación**: https://bitcorp.mohammadasjad.com
- **Documentación API**: https://bitcorp.mohammadasjad.com/docs
- **Estado Backend**: https://bitcorp.mohammadasjad.com/api/v1/health

---

## 📁 Archivos Clave

```
bitcorp/
├── docker-compose.yml     # Despliegue de producción
├── .env                   # Configuración (crear desde .env.example)
├── backend/               # Aplicación FastAPI
├── frontend/              # Aplicación Next.js
├── nginx/                 # Configuración proxy inverso
└── README.md              # Este archivo
```

---

## 🔧 Solución de Problemas

### Puerto 443 ya en uso
**Error**: `bind: address already in use`

**Solución**: Synology DSM usa los puertos 80/443. Nuestro nginx usa **8080/8443** internamente.

1. **Detener contenedores si están corriendo**:
   ```bash
   docker-compose down
   ```

2. **Verificar que docker-compose.yml tiene puertos correctos**:
   ```yaml
   nginx:
     ports:
       - "8080:80"
       - "8443:443"  # Puerto interno, sin conflicto
   ```

3. **Iniciar contenedores**:
   ```bash
   docker-compose up -d --build
   ```

4. **Configurar Proxy Inverso de Synology** (ver sección Inicio Rápido)

### El contenedor no inicia
```bash
docker-compose logs <nombre-servicio>
```

### Fallo de conexión a base de datos
```bash
# Verificar estado de BD
docker-compose ps

# Recrear BD
docker-compose down -v
docker-compose up -d db
# Esperar 30 segundos
docker-compose up -d
```

### Frontend no puede conectar con backend
- Verificar nginx corriendo: `docker-compose ps nginx`
- Ver registros nginx: `docker-compose logs nginx`
- Asegurar que todos los servicios estén en redes correctas

### Errores de contenido mixto (HTTP/HTTPS)
- Todos los servicios se comunican via redes Docker (sin llamadas externas)
- Nginx maneja terminación SSL
- Frontend llama backend via prefijo `/api` (mismo dominio)

---

## 🏗 Arquitectura

```
Internet (Puerto 443) 
    ↓
Proxy Inverso Synology DSM (Terminación SSL)
    ↓
Contenedor bitcorp_nginx (Puerto 8443)
    ├─→ /api/v1/* → bitcorp_backend (Puerto 8000)
    └─→ /* → bitcorp_frontend (Puerto 3000)
              ↓
         bitcorp_db (PostgreSQL:5432)
         bitcorp_redis (Redis:6379)
```

**Puntos Clave:**
- Synology DSM maneja SSL externo (puerto 443)
- Nginx corre en puerto interno 8443 (sin conflicto de puertos)
- Todos los servicios se comunican via redes Docker internas
- Dominio único para frontend + backend (sin problemas CORS)
         → Puerto 443 → Docker Nginx
                      → /api → Backend (FastAPI)
                      → / → Frontend (Next.js)
                          Backend → PostgreSQL
                          Backend → Redis
```

---

## 📊 Monitoreo

```bash
# Uso de recursos
docker stats

# Todos los registros
docker-compose logs -f

# Servicio específico
docker-compose logs -f backend
```

---

## 🔐 Lista de Seguridad

- [ ] Cambiar todas las contraseñas predeterminadas en `.env`
- [ ] Establecer `SECRET_KEY` a cadena aleatoria de 64+ caracteres
- [ ] Configurar reglas de firewall Synology
- [ ] Habilitar auto-bloqueo Synology para intentos fallidos
- [ ] Configurar copias de seguridad automatizadas de BD
- [ ] Revisar configuración SSL de nginx
- [ ] Restringir puerto PostgreSQL solo a localhost

---

## 📚 Stack Tecnológico

| Componente | Tecnología |
|------------|------------|
| Backend | FastAPI 0.104+ |
| Frontend | Next.js 14 + TypeScript |
| Base de Datos | PostgreSQL 15 |
| Caché | Redis 7 |
| Proxy | Nginx (Alpine) |
| Contenedor | Docker + Docker Compose |

---

## 🤝 Soporte

**¿Problemas?**
1. Ver registros: `docker-compose logs -f`
2. Verificar estado: `docker-compose ps`
3. Revisar este README
4. Verificar configuración `.env`

**¿Necesitas ayuda?** Abre un issue con:
- Salida de `docker-compose logs`
- Salida de `docker-compose ps`
- Tu `.env` (con contraseñas ocultas)

---

## 📄 Licencia

Propietario - Bitcorp

---

**Versión**: 1.0.0  
**Última Actualización**: 2025-01-21  
**Estado**: Listo para Producción ✅
