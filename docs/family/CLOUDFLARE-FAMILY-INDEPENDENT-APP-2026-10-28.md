# Cresco Family — nouvelle application Cloudflare **séparée** (2026-10-28)

**Décision produit du fondateur : ne jamais modifier le produit Cloudflare soumis à Colosseum.**

## Délimitation canonique

| | Soumission Colosseum (intouchable) | Cresco Family (nouveau déploiement envisagé) |
|---|---|---|
| Site Cloudflare | `cresco` / `https://cresco.faadil-casecraft.workers.dev` | `cresco-family-web` — URL seulement prévue, non publiée |
| API Cloudflare | `cresco-api-stocklana` / `https://keys-api-stocklana.faadil-casecraft.workers.dev` | `cresco-family-api` — URL seulement prévue, non publiée |
| Fichier d’entrée backend | `src/cloudflare-worker.mjs` | `src/cloudflare-family-only-worker.mjs` |
| Config API | `wrangler.jsonc` — NE PAS TOUCHER | `wrangler.family-api.jsonc` |
| Config Web | `apps/web/wrangler.jsonc` — NE PAS TOUCHER | `apps/web/wrangler.family.jsonc` |
| Durable Object class | `FamilyState` (ancienne identité) | `CrescoFamilyIsolatedState` (nouveau namespace) |
| Source du frontend | Application complète historique | Build explicitement Family-only; accueil Family et filtre des routes Capital |
| Données/jetons/états | État soumis à Colosseum conservé | Workspaces et jetons **neufs**; aucune migration automatique |
| Autorité financière | Preuves Devnet historiques | **BLOQUÉE PAR DÉFAUT** tant que non approuvée |

Le préfixe `cresco-family-...` est un **nom de Worker prévu**, pas une preuve d’URL actuellement en ligne. Le suffixe `faadil-casecraft.workers.dev` doit être confirmé par le propriétaire du compte Cloudflare **avant tout déploiement**. Une build Family refuse toute URL API qui ne commence pas par `https://cresco-family-api.`; le nom final et le domaine doivent être exacts, pas supposés.

La soumission Colosseum, son URL, ses données et ses preuves historiques ne sont pas des cibles de modification. La branche et la PR Family sont totalement distinctes, en **DRAFT**.

### Interdiction supplémentaire — Workers Builds sur `main`

Les notes canoniques `state/CURRENT.yaml` indiquent que le frontend soumis à Colosseum peut être automatiquement reconstruit par Cloudflare Workers Builds à chaque modification de `main`. **Il est donc interdit de fusionner la PR Family #94 ou ses PR parentes dans `main` tant que l'autodéploiement du Worker Colosseum n'est pas découplé ou bloqué de manière vérifiée.** Un merge apparemment purement source peut modifier la version publique du concours. La stratégie de livraison Family est une **branche longue durée propre à Family ou un dépôt séparé**, avec deux nouveaux Workers et des règles de build indépendantes. Cette PR reste en DRAFT, elle ne doit pas être marquée « Ready » ni fusionnée pour faciliter le déploiement.


## Ce qui fonctionne sur la branche Family

1. Le nouveau Worker API accepte uniquement la surface `/api/v0.4/worlds-fair/` et `/health` ; les anciennes routes de démo et les autres APIs ne sont pas routées. Il refuse explicitement un `POST /workspaces` non-Family.
2. La création exige **`CRESCO_FAMILY_CREATE_TOKEN`**, secret à configurer seulement sur le nouveau Worker, envoyé comme `x-cresco-create-token`. Sans secret configuré, la création échoue plutôt que de s’ouvrir au public. Ne jamais ajouter ce secret au dépôt, aux logs, à une variable `NEXT_PUBLIC_` ou au site.
3. La variante utilise un **nouveau namespace Durable Object** et un nom de Worker API différent. Ne jamais injecter les anciennes clés/DO migrations historiques ni les paramètres Devnet de Colosseum dans la nouvelle API.
4. Le mode `CRESCO_FAMILY_DEVNET_WRITES` n’est **pas activé**. Tant qu’il n’est pas exactement `enabled-by-owner`, le backend refuse par HTTP 423 bootstrap, intents, décisions, politiques, financement, signatures guardian et réconciliation. Les rôles, liens et signatures de récupération du Parent restent dans la couche API, sans opération financière.
5. La variante Web compile le frontend existant avec `CRESCO_FAMILY_BUILD=1`. Elle présente un accueil Family-only et filtre les routes publiques à l’accueil et au desk Family. Il n’y a pas de sélecteur Capital ni de bouton de transaction actif.
6. Le navigateur de la nouvelle application utilise **uniquement l’URL Family API explicitement configurée** ; le fallback vers `keys-api-stocklana` est désactivé. La clé privée d’invitation n’est pas conservée dans le trousseau des rôles.
7. Le build `build:family` produit un **artefact**, puis vérifie que son nom de Worker compilé est bien `cresco-family-web`. **Aucune commande de déploiement Family** n’est incluse dans les scripts.

## Commandes pour vérifier (sans déploiement)

Dans le dépôt :

```bash
npm ci
npm test

cd apps/web
npm ci
npm run typecheck
npm test
NEXT_PUBLIC_CRESCO_API_URL=https://cresco-family-api.faadil-casecraft.workers.dev npm run build:family
```

La dernière commande ne téléverse rien. Elle doit soit produire `dist/server/wrangler.json` avec `name=cresco-family-web`, soit échouer. **Elle ne doit jamais produire `cresco`**. La valeur API ci-dessus est une **cible attendue**, non une URL vérifiée ou un déploiement réel.

## Préparatifs exigés avant une nouvelle version Cloudflare

- [ ] Identifier explicitement le bon compte Cloudflare, les deux nouveaux noms, les zones et les sous-domaines exacts. Vérifier que `cresco` et `cresco-api-stocklana` ne seront jamais écrasés.
- [ ] Configurer `CRESCO_FAMILY_CREATE_TOKEN` comme secret du **nouveau** Worker API, jamais comme variable publique. Restreindre l’accès pendant la phase bêta.
- [ ] Vérifier sur un environnement provisoire que les Durable Objects sont vierges et ne partagent aucun stockage avec Colosseum.
- [ ] Audit indépendant Family : rôle Parent, token, identité, risque mineur, contrôle d’abus et limites de récupération.
- [ ] Préparer des clés et un financement Devnet dédiés **uniquement après** autorisation séparée; aucun réemploi des clés de la soumission.
- [ ] Approuver explicitement un déploiement **dans les deux nouveaux Workers**, puis vérifier le SHA exact Web et API, CORS, routes et parcours multi-appareils.
- [ ] Seulement après ces étapes : activation expérimentale de la voie Devnet, sans argent réel, avec preuves de refus et reprise UNKNOWN.

## Réalité des preuves

- **SOURCE/TEST**: isolation des noms de Workers, du namespace DO, refus Capital, garde secret invitation, refus Devnet, filtrage Web.
- **CI**: en attente des nouveaux contrôles exact-HEAD et du build spécifique Family.
- **LIVE**: **NON EFFECTUÉ** pour `cresco-family-api` et `cresco-family-web`. Les données de Colosseum restent historiques.
- **SÉCURITÉ / CONFORMITÉ**: aucune preuve d'identité parentale, de conformité financière ni d’aptitude aux familles réelles.

**Interdictions de cette étape :** fusion, déploiement, modification du Worker `cresco`, modification du Worker `cresco-api-stocklana`, réutilisation de leur DO, réutilisation des secrets Solana et transaction blockchain.
