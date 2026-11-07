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

# Some lockfiles contain Replit-only tarball URLs. Normalize them temporarily
# because this script runs on an external VPS, then restore Git's copy on exit.
trap 'git restore --source=HEAD --worktree -- package-lock.json' EXIT
node <<'NODE'
const fs = require("node:fs");
const lockPath = "package-lock.json";
let lock = fs.readFileSync(lockPath, "utf8");
const replacements = [
  [
    "http://package-firewall.replit.internal/npm/",
    "https://registry.npmjs.org/",
  ],
  [
    "https://package-firewall.replit.internal/npm/",
    "https://registry.npmjs.org/",
  ],
];
let replacementCount = 0;
for (const [internalPrefix, publicPrefix] of replacements) {
  const parts = lock.split(internalPrefix);
  replacementCount += parts.length - 1;
  lock = parts.join(publicPrefix);
}
if (lock.includes("package-firewall.replit.internal")) {
  throw new Error("Le package-lock contient encore une adresse de registre interne.");
}
if (replacementCount > 0) {
  fs.writeFileSync(lockPath, lock);
}
console.log(
  replacementCount > 0
    ? `${replacementCount} adresse(s) npm interne(s) remplacée(s) temporairement.`
    : "Le package-lock utilise déjà des adresses npm accessibles au VPS.",
);
NODE

npm ci --registry=https://registry.npmjs.org/
npm run build
pm2 restart "$PM2_APP"

echo "Commit déployé : $(git rev-parse --short HEAD)"
pm2 status
