---
name: Dépendances post-merge
description: Récupération sûre lorsqu'une installation post-merge est bloquée par le registre de sécurité.
---

Ne contourner pas le pare-feu de paquets. Si `npm ci` est bloqué par une version vulnérable verrouillée, identifie la dépendance directe qui l'introduit, mets cette dépendance à jour vers une version maintenue, régénère le lockfile, puis relance le setup.

**Why:** le registre Replit bloque les téléchargements de paquets identifiés comme vulnérables, même lorsque la contrainte semver du parent autoriserait une version corrigée.

**How to apply:** vérifier l'arbre de dépendances et `package-lock.json`, mettre à jour le parent direct avec le gestionnaire de packages, puis exécuter de nouveau le script post-merge.
