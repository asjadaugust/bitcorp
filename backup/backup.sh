#!/bin/bash

# Bitcorp ERP Database Backup Script
# Run this script regularly to backup your data

set -e

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Colors
GREEN='\033[0;32m'
NC='\033[0m'

# Create backup directory
mkdir -p $BACKUP_DIR

echo "🗄️  Bitcorp ERP Backup - $DATE"
echo "================================"
echo ""

# Database backup
echo "📦 Backing up PostgreSQL database..."
docker exec bitcorp-db pg_dump -U bitcorp bitcorp_erp | gzip > "$BACKUP_DIR/db_backup_$DATE.sql.gz"

if [ $? -eq 0 ]; then
    DB_SIZE=$(du -h "$BACKUP_DIR/db_backup_$DATE.sql.gz" | cut -f1)
    echo -e "${GREEN}✓ Database backup complete: $DB_SIZE${NC}"
else
    echo "❌ Database backup failed"
    exit 1
fi

# Redis backup
echo "📦 Backing up Redis data..."
docker exec bitcorp-redis redis-cli --rdb /data/dump.rdb SAVE > /dev/null 2>&1
docker cp bitcorp-redis:/data/dump.rdb "$BACKUP_DIR/redis_backup_$DATE.rdb"

if [ $? -eq 0 ]; then
    REDIS_SIZE=$(du -h "$BACKUP_DIR/redis_backup_$DATE.rdb" | cut -f1)
    echo -e "${GREEN}✓ Redis backup complete: $REDIS_SIZE${NC}"
else
    echo "❌ Redis backup failed"
fi

# Backup uploaded files
echo "📦 Backing up uploaded files..."
docker run --rm -v bitcorp_upload_data:/data -v $(pwd)/$BACKUP_DIR:/backup alpine tar czf /backup/uploads_$DATE.tar.gz -C /data .

if [ $? -eq 0 ]; then
    UPLOAD_SIZE=$(du -h "$BACKUP_DIR/uploads_$DATE.tar.gz" | cut -f1)
    echo -e "${GREEN}✓ Uploads backup complete: $UPLOAD_SIZE${NC}"
else
    echo "❌ Uploads backup failed"
fi

# Clean old backups
echo ""
echo "🧹 Cleaning old backups (older than $RETENTION_DAYS days)..."
find $BACKUP_DIR -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "*.rdb" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo ""
echo -e "${GREEN}✅ Backup complete!${NC}"
echo "📁 Backup location: $BACKUP_DIR"
echo ""
ls -lh $BACKUP_DIR/*$DATE*
echo ""
