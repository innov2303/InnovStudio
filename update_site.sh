#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="/var/www/innov-studio"
BRANCH="main"
PM2_APP="innov-studio"

cd "$APP_DIR"

current_branch="$(git branch --show-current)"
if [[ "$current_branch" != "$BRANCH" ]]; then
  echo "Branche actuelle : $current_branch (attendu : $BRANCH). Arrêt." >&2
  exit 1
fi

# Sauvegarde puis restauration des seuls manifestes locaux de dépendances.
# La version du dépôt Git reste la source de vérité.
if ! git diff --quiet HEAD -- package.json package-lock.json; then
  mkdir -p /root/innov-studio-package-backups
  backup_dir="$(mktemp -d /root/innov-studio-package-backups/backup-XXXXXX)"
  cp -a package.json package-lock.json "$backup_dir/"
  echo "Manifestes locaux sauvegardés dans : $backup_dir"
  git restore --source=HEAD --staged --worktree -- package.json package-lock.json
fi

# N'écrase pas les autres changements suivis localement.
if ! git diff --quiet HEAD --; then
  echo "D'autres fichiers suivis ont des changements locaux. Examinez-les avant de continuer :" >&2
  git status --short
  exit 1
fi

git fetch origin "$BRANCH"
git pull --ff-only origin "$BRANCH"
npm ci
npm run build
pm2 restart "$PM2_APP"

echo "Commit déployé : $(git rev-parse --short HEAD)"
pm2 status
