# Deployment Guide
## Customizable Inventory Management System

Complete deployment instructions for development, staging, and production environments.

---

## Table of Contents
1. [Local Development Setup](#1-local-development-setup)
2. [Docker Setup](#2-docker-setup)
3. [Staging Deployment](#3-staging-deployment)
4. [Production Deployment](#4-production-deployment)
5. [Database Migration](#5-database-migration)
6. [Backup & Recovery](#6-backup--recovery)
7. [Monitoring](#7-monitoring)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Local Development Setup

### Prerequisites
- Node.js 18+ (`node --version`)
- Python 3.11+ (`python3 --version`)
- Git (`git --version`)
- pnpm (`npm install -g pnpm`)

### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Update .env with local settings
DATABASE_URL=sqlite:///./inventory.db
JWT_SECRET_KEY=your-dev-secret-key-change-in-production
ENVIRONMENT=development

# Create database and run migrations
alembic upgrade head

# Create initial admin user (optional script)
python -c "
from app.core.security import hash_password
from app.database.models import User, Role, Base
from app.database.session import engine, SessionLocal

# Create tables
Base.metadata.create_all(bind=engine)

# Create default role
db = SessionLocal()
admin_role = Role(name='admin', description='Administrator')
db.add(admin_role)
db.commit()

# Create admin user
admin_user = User(
    email='admin@example.com',
    username='admin',
    password_hash=hash_password('Admin@123456'),
    first_name='Admin',
    last_name='User',
    role_id=admin_role.id,
    is_active=True
)
db.add(admin_user)
db.commit()
print('Admin user created: admin@example.com / Admin@123456')
"

# Start development server
uvicorn app.main:app --reload --port 8000
```

Backend running at: http://localhost:8000

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
pnpm install

# Create .env.local file
cp .env.example .env.local

# Update .env.local with dev settings
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_ENVIRONMENT=development

# Start development server
pnpm dev
```

Frontend running at: http://localhost:3000

### Initial Login
- Email: `admin@example.com`
- Password: `Admin@123456`

---

## 2. Docker Setup

### Prerequisites
- Docker Desktop installed and running
- Docker Compose 2.0+

### Docker Compose Setup (Recommended)

```bash
# From project root directory
docker-compose up -d

# Check services status
docker-compose ps

# View logs
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f sqlite

# Stop services
docker-compose down

# Remove containers and volumes
docker-compose down -v

# Rebuild images
docker-compose build --no-cache
```

### Accessing Services

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3000 | Web application |
| Backend | http://localhost:8000 | API server |
| API Docs | http://localhost:8000/docs | Swagger UI |
| ReDoc | http://localhost:8000/redoc | Alternative API docs |

### Docker Commands Reference

```bash
# Build images
docker build -t inventory-backend ./backend
docker build -t inventory-frontend ./frontend

# Run container
docker run -p 8000:8000 inventory-backend
docker run -p 3000:3000 inventory-frontend

# View logs
docker logs <container-id>

# Stop container
docker stop <container-id>

# Remove container
docker rm <container-id>
```

---

## 3. Staging Deployment

### Environment: Staging (Pre-production testing)

### Prerequisites
- AWS/DigitalOcean/Render account
- Domain name if applicable
- SSL certificate

### Staging Setup Steps

#### 1. Prepare Environment Variables

Create `.env.staging`:
```
# Backend
DATABASE_URL=postgresql://user:password@host:5432/inventory_staging
JWT_SECRET_KEY=your-staging-secret-key
JWT_ALGORITHM=HS256
ENVIRONMENT=staging
CORS_ORIGINS=https://staging.yourdomain.com

# Frontend
NEXT_PUBLIC_API_URL=https://api-staging.yourdomain.com/api/v1
NEXT_PUBLIC_ENVIRONMENT=staging
```

#### 2. Database Setup

```bash
# If using PostgreSQL
createdb inventory_staging
createuser inventory_user

# Run migrations
alembic upgrade head

# Load test data (optional)
python scripts/load_test_data.py
```

#### 3. Deploy Backend

Option A: Using Docker
```bash
# Build image
docker build -t inventory-backend:staging ./backend

# Push to registry
docker tag inventory-backend:staging your-registry/inventory-backend:staging
docker push your-registry/inventory-backend:staging

# Pull and run
docker pull your-registry/inventory-backend:staging
docker run -d \
  -p 8000:8000 \
  --env-file .env.staging \
  your-registry/inventory-backend:staging
```

Option B: Using Render/Railway
```bash
# Connect GitHub repo
# Select backend directory: ./backend
# Set environment variables from .env.staging
# Deploy
```

#### 4. Deploy Frontend

Option A: Using Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Login and deploy
vercel --prod

# Set environment variables
# NEXT_PUBLIC_API_URL=https://api-staging.yourdomain.com/api/v1
```

Option B: Using Docker
```bash
docker build -t inventory-frontend:staging ./frontend
docker tag inventory-frontend:staging your-registry/inventory-frontend:staging
docker push your-registry/inventory-frontend:staging
```

#### 5. Configure Domain & SSL

```bash
# Update DNS records
# CNAME to staging.yourdomain.com -> <staging-ip>
# CNAME to api-staging.yourdomain.com -> <api-staging-ip>

# Enable HTTPS with Let's Encrypt (Certbot)
sudo certbot certonly --standalone -d api-staging.yourdomain.com
```

#### 6. Configure Reverse Proxy (Nginx)

```nginx
# /etc/nginx/sites-available/staging.yourdomain.com

server {
    listen 80;
    server_name staging.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name staging.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/staging.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/staging.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# API
server {
    listen 443 ssl http2;
    server_name api-staging.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/api-staging.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api-staging.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Staging Verification Checklist
- [ ] Application loads successfully
- [ ] API endpoints respond
- [ ] Database connectivity confirmed
- [ ] Authentication working
- [ ] HTTPS properly configured
- [ ] Logs accessible
- [ ] Monitoring enabled

---

## 4. Production Deployment

### ⚠️ Production Checklist

| Item | Status |
|------|--------|
| Database backed up | ☐ |
| Rollback plan documented | ☐ |
| All tests passing | ☐ |
| Code reviewed | ☐ |
| Performance tested | ☐ |
| Security audit complete | ☐ |
| Monitoring configured | ☐ |
| Team notified | ☐ |

### Production Environment Variables

Create `.env.production`:
```
# Backend
DATABASE_URL=postgresql://user:password@host:5432/inventory_prod
JWT_SECRET_KEY=<generate-strong-secret>
JWT_ALGORITHM=HS256
ENVIRONMENT=production
CORS_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
DEBUG=false
LOG_LEVEL=INFO

# Frontend
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_SENTRY_DSN=<your-sentry-dsn>
```

### Production Deployment Process

#### Phase 1: Pre-deployment (Day before)
```bash
# 1. Create full database backup
pg_dump -U postgres inventory_prod > backup_$(date +%Y%m%d).sql
# Store backup securely

# 2. Test database migrations
pg_restore -d inventory_staging < backup_$(date +%Y%m%d).sql
alembic upgrade head  # Test on staging copy

# 3. Load test data on production-like environment
python scripts/load_production_test_data.py

# 4. Run full test suite
pytest --cov=app tests/
pnpm test:coverage

# 5. Performance test
locust -f tests/performance/locustfile.py --headless -u 100 -r 10 -t 300s
```

#### Phase 2: Deployment Day

**Notify team**: Post in Slack #deployments channel

```bash
# 1. Start deployment window (declare maintenance if needed)
echo "Deployment in progress: ETA 30 minutes"

# 2. Final backup
pg_dump -U postgres inventory_prod > backup_final_$(date +%Y%m%d_%H%M%S).sql

# 3. Deploy backend
git checkout main
git pull origin main

# Option A: Docker
docker pull your-registry/inventory-backend:latest
docker stop inventory-backend || true
docker run -d --name inventory-backend \
  -p 8000:8000 \
  --env-file .env.production \
  -v /data/inventory:/app/data \
  your-registry/inventory-backend:latest

# Option B: Direct deployment
# Make sure no old processes are running
pkill -f "uvicorn"

# Start new instance
nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 &

# 4. Run database migrations
alembic upgrade head

# 5. Health check
curl https://api.yourdomain.com/api/v1/health

# 6. Deploy frontend (usually automatic via Vercel/CI)
# Verify deployment
curl https://yourdomain.com

# 7. Smoke tests
pytest tests/smoke_tests.py

# 8. Monitor logs
tail -f /var/log/inventory-*.log
```

#### Phase 3: Post-deployment (1 hour)
```bash
# 1. Monitor all systems
# - Check error logs
# - Monitor CPU/memory
# - Check database connections
# - Monitor response times

# 2. User testing
# - Test critical workflows
# - Check performance
# - Verify data integrity

# 3. Document issues
# - Note any problems
# - Create issue if needed

# 4. Team notification
# - Announce successful deployment
# - Share metrics/observations
```

### Rollback Procedure

If critical issues found within 1 hour:

```bash
# 1. Stop current deployment
docker stop inventory-backend

# 2. Restore from backup
pg_restore -d inventory_prod < backup_final_$(date).sql

# 3. Start previous version
docker run -d --name inventory-backend \
  -p 8000:8000 \
  --env-file .env.production \
  your-registry/inventory-backend:previous-tag

# 4. Verify
curl https://api.yourdomain.com/api/v1/health

# 5. Notify team
# Post in #deployments: "Rollback completed to previous version"

# 6. Post-mortem
# Schedule team discussion to understand failure
```

---

## 5. Database Migration

### SQLite to PostgreSQL

#### Prerequisites
- PostgreSQL 12+ installed
- pg_dump and pg_restore available
- Sufficient disk space

#### Migration Steps

```bash
# 1. Export SQLite database
sqlite3 inventory.db .dump > sqlite_dump.sql

# 2. Create PostgreSQL database
createdb inventory_prod
psql inventory_prod < scripts/convert_sqlite_to_postgres.sql

# 3. Install migration tool
pip install pgloader

# 4. Run migration (best option)
pgloader --from sqlite:///path/to/inventory.db \
         --into postgresql://user:pass@localhost/inventory_prod \
         --with "data only"

# 5. Verify data
psql inventory_prod -c "SELECT COUNT(*) FROM products;"
psql inventory_prod -c "SELECT COUNT(*) FROM inventory;"

# 6. Create indexes
python scripts/create_postgres_indexes.py

# 7. Test backup/restore
pg_dump inventory_prod > backup_verify.sql
dropdb inventory_test || true
createdb inventory_test
psql inventory_test < backup_verify.sql
```

---

## 6. Backup & Recovery

### Automated Backups

#### Daily Backup Script

```bash
#!/bin/bash
# /opt/scripts/backup_inventory.sh

BACKUP_DIR="/backups/inventory"
DB_NAME="inventory_prod"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/inventory_$DATE.sql"

# Create backup
pg_dump -U postgres $DB_NAME > $BACKUP_FILE

# Compress
gzip $BACKUP_FILE

# Delete backups older than 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

# Send to S3 (optional)
aws s3 cp "$BACKUP_FILE.gz" s3://my-backup-bucket/inventory/

echo "Backup completed: $BACKUP_FILE.gz"
```

#### Cron Schedule

```bash
# Add to crontab
0 2 * * * /opt/scripts/backup_inventory.sh

# View crontab
crontab -l
```

#### Recovery Procedure

```bash
# 1. List available backups
ls -lah /backups/inventory/

# 2. Decompress backup
gunzip inventory_20260327_020000.sql.gz

# 3. Restore to new database
createdb inventory_recovery
psql inventory_recovery < inventory_20260327_020000.sql

# 4. Verify data integrity
psql inventory_recovery -c "SELECT COUNT(*) FROM users;"
psql inventory_recovery -c "SELECT COUNT(*) FROM inventory;"

# 5. Switch to recovered database (after verification)
# Backup current db first!
pg_dump inventory_prod > /backups/inventory_before_switch.sql

# Drop current and rename
dropdb inventory_prod
psql -c "ALTER DATABASE inventory_recovery RENAME TO inventory_prod;"
```

---

## 7. Monitoring

### Health Checks

```bash
# Backend health endpoint
curl https://api.yourdomain.com/api/v1/health

# Response example:
# {"status": "healthy", "database": "connected", "uptime": 3600}
```

### Logging

```bash
# View real-time logs
tail -f /var/log/inventory.log

# Search logs
grep "ERROR" /var/log/inventory.log

# Structured log example:
# {"level": "ERROR", "timestamp": "2026-03-27T10:30:00Z", "message": "Auth failed"}
```

### Performance Monitoring

```bash
# Monitor resource usage
watch -n 1 'docker stats inventory-backend'

# Check database connections
psql -c "SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;"

# Slow query log (PostgreSQL)
psql inventory_prod -c "
SELECT query, mean_exec_time FROM pg_stat_statements 
WHERE mean_exec_time > 1000 
ORDER BY mean_exec_time DESC LIMIT 10;"
```

---

## 8. Troubleshooting

### Frontend Won't Load

```bash
# Check React build
pnpm build
pnpm export

# Clear cache
rm -rf .next

# Rebuild
pnpm dev

# Check browser console for errors
# Open DevTools → Console tab
```

### Backend API Errors

```bash
# Check logs
journalctl -u inventory-backend -n 50

# Restart service
systemctl restart inventory-backend

# Check port
lsof -i :8000

# Verify database connection
psql -U postgres -d inventory_prod -c "SELECT 1;"
```

### Database Connection Issues

```bash
# Test connection
psql -h localhost -U postgres -d inventory_prod

# Check postgres service
systemctl status postgresql

# Check connection pools
psql inventory_prod -c "SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;"

# If too many connections, kill idle ones
psql inventory_prod -c "
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE state = 'idle' AND query_start < now() - interval '30 minutes';"
```

### High Memory Usage

```bash
# Check process
ps aux | grep uvicorn
docker stats inventory-backend

# Restart to clear
docker restart inventory-backend

# Check for memory leaks
# Enable Python memory profiling
PYTHONUNBUFFERED=1 python -m memory_profiler app/main.py
```

### CORS Errors

```bash
# Check backend configuration
# Update .env:
CORS_ORIGINS=https://yourdomain.com,https://staging.yourdomain.com

# Restart backend
docker restart inventory-backend
```

---

## Quick Reference

### Essential Commands

```bash
# Database
alembic upgrade head      # Run migrations
alembic downgrade -1      # Rollback 1 migration

# Backend
uvicorn app.main:app --reload --port 8000
pytest --cov=app tests/

# Frontend
pnpm dev
pnpm build
pnpm test

# Docker
docker-compose up -d
docker-compose logs -f
docker-compose down

# Git
git checkout main && git pull
git tag v1.0.0
git push --tags
```

---

**Document Version**: 1.0  
**Last Updated**: March 2026  
**Next Review**: After first production deployment

