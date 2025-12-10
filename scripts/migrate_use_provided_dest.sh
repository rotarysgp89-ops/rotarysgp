#!/usr/bin/env bash
set -euo pipefail

# Script de migração local com DEST_DB preenchido a partir do valor fornecido.
# Uso: ./scripts/migrate_use_provided_dest.sh "postgres://USER:PASSWORD@HOST:PORT/SOURCE_DB"
# Atenção: este script faz RESTORE que sobrescreve o banco destino. Faça backups antes.

# --- DESTINO (preenchido pelo usuário) ---
DEST_DB="postgresql://postgres:Rotaract0725@db.rahxoubvawxonvnxuwvw.supabase.co:5432/postgres"
# ------------------------------------------

if [ "$#" -lt 1 ]; then
  echo "Uso: $0 \"postgres://USER:PASSWORD@HOST:PORT/SOURCE_DB\""
  exit 2
fi

SOURCE_DB="$1"
TIMESTAMP=$(date +%Y%m%d%H%M%S)
TMP_DIR="/tmp/supabase_migrate_${TIMESTAMP}"
mkdir -p "$TMP_DIR"

SOURCE_DUMP="$TMP_DIR/source_dump.dump"
DEST_BACKUP="$TMP_DIR/dest_backup_before_restore.dump"

echo "[1/6] Verificando comandos necessários..."
command -v pg_dump >/dev/null 2>&1 || { echo "pg_dump não encontrado. Instale o cliente Postgres (ex: apt install postgresql-client)"; exit 1; }
command -v pg_restore >/dev/null 2>&1 || { echo "pg_restore não encontrado. Instale o cliente Postgres (ex: apt install postgresql-client)"; exit 1; }

echo "[2/6] Fazendo backup do destino (antes de sobrescrever): $DEST_BACKUP"
pg_dump --format=custom --no-owner --no-acl --dbname="$DEST_DB" -f "$DEST_BACKUP"

echo "[3/6] Fazendo dump do fonte para: $SOURCE_DUMP"
pg_dump --format=custom --no-owner --no-acl --dbname="$SOURCE_DB" -f "$SOURCE_DUMP"

echo "[4/6] Restaurando dump no destino (este passo sobrescreve o destino):"
pg_restore --clean --no-owner --no-acl --exit-on-error --dbname="$DEST_DB" "$SOURCE_DUMP"

echo "[5/6] (Opcional) Aplicar migrations via supabase CLI se desejar. Se estiver autenticado e quiser executar, remova o comentário abaixo e ajuste o project-ref."
# Exemplo (descomente e ajuste se quiser executar automaticamente):
# npx supabase db push --project-ref rahxoubvawxonvnxuwvw

echo "[6/6] (Opcional) Redeploy das Edge Functions via supabase CLI (descomente para executar):"
# Exemplo (descomente se quiser executar automaticamente):
# npx supabase functions deploy create-user --project-ref rahxoubvawxonvnxuwvw
# npx supabase functions deploy manage-user --project-ref rahxoubvawxonvnxuwvw

echo "Migração concluída com sucesso. Arquivos temporários em: $TMP_DIR"

echo "Recomendações pós-restore:"
echo " - Verifique se as roles/RLS e policies foram aplicadas:"
echo "   psql \"$DEST_DB\" -c \"SELECT * FROM pg_policies WHERE tablename = 'profiles';\""
echo " - Teste operações de escrita com o frontend ou via supabase-js usando a VITE_SUPABASE_PUBLISHABLE_KEY"

exit 0
