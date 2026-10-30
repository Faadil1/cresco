# Cresco Family — Activation publique du seul Worker Web

**30 octobre 2026 — Accord du fondateur pour un essai public en un clic.**
Ce guide concerne exclusivement `cresco-family-web` sur une URL `workers.dev`. Il ne constitue **pas** une autorisation de modifier `main`, les Workers Colosseum `cresco` ou `keys-api-stocklana`, de déployer `cresco-family-api`, ni de permettre des transactions.

## État et périmètre

- Branche d'origine : `family/public-one-click-practice-2026-10-30` (PR #111 en brouillon), indépendamment de `main`.
- Le navigateur simule Parent et Teen sur **le même appareil** ; 100 crédits fictifs, épargne de 20, demande de discussion, approbation/refus, réinitialisation. Aucune identité, aucun compte, aucune synchronisation, aucun appel financier.
- Les sources `apps/web/wrangler.family.jsonc` et le bundle généré `dist/server/wrangler.json` **restent scellés** : `workers_dev:false` et `preview_urls:false`.
- La préparation produit deux configs **éphémères et non suivies par Git**, avec le même bundle et la même identité `cresco-family-web` : une d'activation `workers_dev:true`, l'autre de fermeture `workers_dev:false`. Les deux conservent `preview_urls:false` et aucune route personnalisée.
- Une URL publique n'existe **qu'après un déploiement réellement confirmé par Cloudflare**. Ne pas déduire une URL active d'une compilation ou d'un succès GitHub Actions.

## 1 — Contrôles et préparation sur Windows (PowerShell)

Depuis le dépôt local, vérifier que la branche consultée est bien la PR #111 :

```powershell
git fetch origin
git switch family/public-one-click-practice-2026-10-30
git pull --ff-only
$sha = (git rev-parse HEAD).Trim()
cd apps/web
npm ci
$env:NEXT_PUBLIC_CRESCO_API_URL = ""
npm run build:public-family
node scripts/family-public-web-release.mjs --expected-sha $sha
```

La dernière commande vérifie le commit, la branche, l'absence de modifications non commitées, les blobs historiques intacts, les configs fermées et l'absence de bindings API/DO/stockage. Elle prépare uniquement des fichiers locaux, **ne déploie rien**. Si elle échoue, arrêter et examiner l'erreur ; ne pas contourner les vérifications.

## 2 — Authentifier et confirmer l'identité Cloudflare

```powershell
npx wrangler login
npx wrangler whoami
```

Confirmer dans le tableau de bord Cloudflare que le compte affiché est le bon compte historique et que **`cresco-family-web` n'y existe pas déjà**. Si le compte diffère, si plusieurs comptes sont proposés, ou si un Worker de ce nom est déjà présent, **STOP** : ne pas écraser un Worker inconnu. Aucune clé ni identifiant de compte ne doit être publié dans GitHub ou dans la conversation. Un jeton Cloudflare lecture seule ne peut pas déployer ; utiliser une authentification locale disposant du droit nécessaire sur le bon compte.

Ne configurer **aucun déploiement automatique** depuis `main` ou les branches historiques.

## 3 — Déployer exclusivement `cresco-family-web`

**Uniquement après les contrôles ci-dessus :**

```powershell
npx wrangler deploy --config dist/server/wrangler.family-public-release.json
```

Le script doit confirmer que le nom ciblé est `cresco-family-web`. Si Wrangler affiche `cresco`, `keys-api-stocklana` ou `cresco-family-api`, interrompre l'opération avant de valider toute action. Conserver localement l'URL publique **exacte** renvoyée par Cloudflare et le SHA du commit. Ne pas inventer l'URL.

## 4 — Smoke tests de la véritable URL publique

Sur **l'URL affichée par Wrangler** (et aucune URL Colosseum), vérifier :

- `GET /` → 200 ; le CTA « Try Cresco - no sign-in » ouvre `/try`.
- `GET /try` → 200 ; 100 → 80 crédits disponibles, 20 épargnés, discussion Parent acceptée/refusée, remise à zéro après actualisation.
- `GET /family-practice`, `GET /worlds-fair/desk`, `GET /worlds-fair/desk/capital`, `GET /api/v0.4/worlds-fair/openapi` → 404 (pas d'API financière héritée).
- Aucune requête vers `keys-api-stocklana`, `cresco-family-api`, RPC Solana ni wallet ; pas de collecte de données personnelles par la démo.
- Confirmer qu'il n'existe **aucun** Worker Family API déployé ni aucune route/Durable Object supplémentaire, et que les deux Workers Colosseum ne sont pas modifiés.

Si l'une de ces conditions échoue, **fermer immédiatement** la route publique, avant de partager le lien.

## 5 — Fermeture d'urgence sans toucher aux anciens Workers

Depuis `apps/web`, avec les deux fichiers préparés :

```powershell
npx wrangler deploy --config dist/server/wrangler.family-public-close.json
```

La fermeture vise la **même** identité `cresco-family-web` avec `workers_dev:false` et `preview_urls:false`. Recontrôler publiquement que `/try` n'est plus accessible. Si le CLI échoue, désactiver `workers.dev` pour **ce Worker uniquement** dans Cloudflare Workers & Pages > `cresco-family-web` > Settings > Domains & Routes ; ne pas utiliser « Protect all Workers ».

## Après la publication

Partager le lien uniquement après un smoke test hébergé PASS. Demander à quelques **adultes volontaires** d'essayer la démo avec des personnages fictifs et d'expliquer ce qu'ils ont compris ; ne pas inviter de vrais enfants à fournir des informations. Noter les frictions de compréhension et la demande réelle de fonctionnalités Family avant de développer des comptes ou une synchronisation multi-appareils.

### Traçabilité

- GitHub CI sur le HEAD antérieur `db61164` : Web, Node, build isolé et WebKit Worker local PASS. Revalider les nouveaux commits avant activation.
- Le test du contrat **historique hébergé** peut échouer sur trois routes API Family non publiées dans Colosseum ; ne jamais corriger cela en déployant les anciens Workers.
- **Sans preuve d'un déploiement Cloudflare et de smoke tests réels, statut final : NOT DEPLOYED.**
