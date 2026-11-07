---
name: Déploiement externe sur VPS
description: Procédure de mise à jour et diagnostic de la production Innov Studio sur un VPS.
---

La production d’Innov Studio est hébergée sur un VPS externe, dans `/var/www/innov-studio`, et le processus PM2 s’appelle `innov-studio`. Le déploiement Replit n’est pas la source de vérité pour l’état du site en production.

**Why:** le journal fourni par l’utilisateur montre que `git pull` peut s’interrompre à cause de modifications locales de `package.json` et `package-lock.json`, tandis que le script continue ensuite le build et le redémarrage PM2, donnant une impression de mise à jour réussie sans confirmer que le nouveau commit a été récupéré.

**How to apply:** pour diagnostiquer la production, demander les journaux du VPS et vérifier le commit local après mise à jour. Ne jamais supprimer ou réinitialiser les changements locaux de dépendances sans les examiner; privilégier un script qui s’arrête dès qu’une étape échoue.
