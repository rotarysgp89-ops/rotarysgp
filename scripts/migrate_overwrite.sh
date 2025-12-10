#!/usr/bin/env bash
set -euo pipefail

# USO:
# chmod +x scripts/migrate_overwrite.sh
# ./scripts/migrate_overwrite.sh \
#   "postgresql://src_user@src_host:5432/src_db" SRC_PASSWORD \
#   "postgresql://dest_user@dest_host:5432/dest_db" DEST_PASSWORD \
#   <SUPABASE_PROJECT_REF>
#
# Exemplo:
# ./scripts/migrate_overwrite.sh \
#   "postgresql://postgres@db.source.supabase.co:5432/postgres" "SenhaFonte" \
#   "postgresql://postgres@db.dest.supabase.co:5432/postgres" "SenhaDestino" \
#   rahxoubvawxonvnxuwvw

if [ "$#" -ne 5 ]; then
  echo "Uso: $0 <SRC_CONN_NO_PW> <SRC_PASSWORD> <DEST_CONN_NO_PW> <DEST_PASSWORD> <SUPABASE_PROJECT_REF>"
  echo "Exemplo: $0 \"postgresql://postgres@db.source.supabase.co:5432/postgres\" \"SenhaFonte\" \"postgresql://postgres@db.dest.supabase.co:5432/postgres\" \"SenhaDestino\" rahxoubvawxonvnxuwvw"
  exit 1
fi

SRC_CONN_NO_PW="$1"
SRC_PW="$2"
DEST_CONN_NO_PW="$3"
DEST_PW="$4"
PROJECT_REF="$5"

TIMESTAMP=$(date +%Y%m%d%H%M%S)
BACKUP_DIR="$(pwd)/backups"
mkdir -p "$BACKUP_DIR"
SRC_DUMP="$BACKUP_DIR/source-dump-$TIMESTAMP.dump"

echo "Gerando dump do banco fonte..."
export PGPASSWORD="$SRC_PW"
# Extrai host/port/user/db para usar com pg_dump -U -h -p -d
# Assume a conn sem password no formato: postgresql://user@host:port/db
# Para simplicidade, usa psql/pg_dump com a conn completa sem senha via PGPASSWORD
pg_dump -Fc --no-acl --no-owner "$SRC_CONN_NO_PW" -f "$SRC_DUMP"

echo "Dump salvo em: $SRC_DUMP"

echo "Restaurando dump no banco destino (sobrescrevendo)..."
export PGPASSWORD="$DEST_PW"
pg_restore --verbose --clean --no-owner --no-acl --dbname="$DEST_CONN_NO_PW" "$SRC_DUMP"

echo "Restauração concluída. Aplicando migrations do repositório via Supabase CLI..."

# Usa npx para evitar necessidade de instalação global do supabase CLI
npx supabase db push --project-ref "$PROJECT_REF"

echo "Migrations aplicadas. Redeploy das functions (opcional)."
for fn in supabase/functions/*; do
  name=$(basename "$fn")
  echo "Deploying function: $name"
  npx supabase functions deploy "$name" --project-ref "$PROJECT_REF" --use-api || true
done

echo "Migração completa. Verifique o aplicativo e logs das functions." 
