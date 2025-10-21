# Bitcorp ERP

**Sistema de Gestión de Equipos para Obras Civiles - Listo para Producción**

ERP moderno para empresas constructoras que gestionan equipos pesados y operadores en múltiples sitios de proyecto.

---

## 🚀 Inicio Rápido

### Despliegue en Producción (Synology NAS)

```bash
# 1. Clonar repositorio
git clone <url-de-tu-repo> bitcorp
cd bitcorp

# 2. Configurar ambiente
cp .env.example .env
nano .env  # Establecer contraseñas seguras

# 3. Desplegar
docker-compose up -d --build

# 4. Inicializar base de datos
docker-compose exec backend python -c "from app.core.init_db import initialize_database; from app.core.database import SessionLocal; initialize_database(SessionLocal())"

# 5. Acceder a la aplicación
# https://bitcorp.mohammadasjad.com
```

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
Internet → Proxy Inverso Synology (SSL)
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
