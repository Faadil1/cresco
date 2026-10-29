# CRESCO Family — Exécuter l'audit Cloudflare sur Windows (sans déploiement)
**29 octobre 2026 | Statut : PREPARATION UNIQUEMENT | Actual Cloudflare inventory: NOT RUN | Private staging: NO-GO**

## Une seule procédure, sur ton propre PC Windows

L'objectif est de vérifier quels Workers et applications Access existent vraiment, **sans changer la version Cloudflare soumise à Colosseum**. Il n'existe pas de connecteur Cloudflare authentifié dans cette conversation. Le script n'a pas été exécuté sur le compte de l'entreprise.

### Prérequis

- PowerShell et Node.js 22 ou plus, Git, et une copie locale du dépôt `Faadil1/cresco`.
- Accès personnel au tableau de bord Cloudflare et droits de lecture.
- Un **nouveau jeton API limité à la lecture** (pour vérifier cette demande, Cloudflare documente les permissions Workers **Metadata Read-Only** et **Access: Apps and Policies Read**). Le jeton doit être limité au bon compte et expirer rapidement. **Pas de Global API Key, pas de jeton de déploiement, pas de clé Solana.**
- **Ne colle jamais ton Account ID ou ton API token ici**, dans GitHub, dans une capture d'écran ou dans une issue. L'Account ID n'est pas un secret équivalent au jeton, mais ce script le masque quand même dans son résultat.

### Étape A : ouvrir la branche exacte

Dans PowerShell, à la racine du dépôt :

```powershell
git fetch origin family/cloudflare-windows-owner-audit-2026-10-29
git switch --track origin/family/cloudflare-windows-owner-audit-2026-10-29
```

Si la branche existe déjà localement, utilise `git switch family/cloudflare-windows-owner-audit-2026-10-29` à la place. Le lanceur **refuse** de fonctionner sur `main` ou une autre branche, pour ne pas utiliser un script dépassé. Le `git fetch` télécharge seulement du code GitHub, pas une configuration Cloudflare.

### Étape B : vérifier localement sans Cloudflare

```powershell
pwsh -NoProfile -File .\scripts\family-cloudflare-readonly-windows.ps1 -TestsOnly
```

Si tu utilises Windows PowerShell 5 à la place de PowerShell 7, remplace `pwsh` par `powershell`. Une politique locale peut bloquer les scripts : dans ce cas, vérifie la politique de ton ordinateur et le contenu du script avant de changer la politique. Ne désactive pas des protections de sécurité au niveau du système.

La sortie attendue est **« Tests passed. Cloudflare account was NOT queried. »** Aucun appel Cloudflare réel pendant ce test.

### Étape C : effectuer l'inspection *en lecture seule* avec le nouveau jeton

Vérifie d'abord le code local et tes droits Cloudflare. Puis :

```powershell
pwsh -NoProfile -File .\scripts\family-cloudflare-readonly-windows.ps1
```

Le terminal demande un Account ID (32 caractères hexadécimaux) et un jeton API, **avec saisie masquée**. Le programme n'envoie le jeton qu'à l'API HTTPS officielle de Cloudflare, via l'environnement temporaire du processus Node. Il nettoie les variables d'environnement à la sortie. Le jeton n'apparaît pas dans une URL ou un argument de commande.

Il appelle uniquement les **trois endpoints GET** validés :

1. `/accounts/{account_id}/workers/scripts`
2. `/accounts/{account_id}/access/apps?per_page=100`
3. `/accounts/{account_id}/workers/durable_objects/namespaces`

Il ne lit ni le code des Workers, ni les secrets de production, ni les données des exercices. **Si la pagination est incomplète ou qu'une permission manque, l'état reste NO-GO.**

### Étape D : lire le rapport sans partager de secrets

Le rapport JSON affichera notamment :

- `historicWorkers` — noms des Workers historiques trouvés dans ce compte, pas leur contenu ni leur conformité;
- `familyWorkers` — présence des nouveaux noms Family et indices de couverture Access;
- `risks` — signaux à étudier (préversions seulement, chemins publics, Access global, inventaire incomplet, etc.);
- `launchVerdict: "NO_GO"` **dans tous les cas**.

Si tu veux poursuivre ici, **copie uniquement ce JSON expurgé après vérification**. Ne partage ni jeton, ni Account ID complet, ni données Access de membres, ni code de rôle Family. Il suffit de partager les champs `familyWorkers`, `historicWorkers`, `risks` et `ownerReviewRequired` si tu préfères.

### Étape E : ce qui restera bloqué

Même si cet audit est complet, il **ne peut pas** confirmer la politique Access réelle, le SHA en production, les origin/CORS dans Chrome/Safari, les quotas WAF, les secrets installés ou la durée de conservation des sauvegardes. Il ne peut pas créer de Worker ni autoriser une bêta. Il faudra une revue Cloudflare/Access manuelle et une autorisation **séparée** avant tout déploiement privé.

**Aucun accès avec des enfants réels ni aucun flux financier n'est autorisé.** Le prototype Family doit rester un exercice en crédits imaginaires avec adultes volontaires consentants et personas fictifs.

## Références officielles

- Permissions Workers : https://developers.cloudflare.com/workers/authorization/workers/
- Permissions de lecture Access : https://developers.cloudflare.com/fundamentals/api/reference/permissions/
- Workers list : https://developers.cloudflare.com/api/resources/workers/subresources/scripts/methods/list/
- Access Apps : https://developers.cloudflare.com/api/resources/zero_trust/subresources/access/subresources/applications/methods/list/
- Durable Object namespaces : https://developers.cloudflare.com/api/resources/durable_objects/subresources/namespaces/methods/list/

**Status: Windows script prepared / mocked tests must pass / real account not queried / Cloudflare NO-GO / historical Colosseum frozen.**
