# CRESCO Family — revue locale du nouveau parcours produit (PR #120)

**Travail en cours, pas une publication.** Cette fiche sert à vérifier sur son propre ordinateur la refonte basée sur l'ancien Cresco, séparément du site historique `cresco-lac.vercel.app` et de la V2 Family publique.

- Branche à examiner : `family/legacy-product-shell-rebuild-2026-11-01` (PR #120, en brouillon).
- Source applicative **vérifiée** : `40176b026041e010e103c7956e9cec9614378a58` — [56/56 tests WebKit iPhone + Chromium desktop](https://github.com/Faadil1/cresco/actions/runs/41358764744), aucun déploiement. Contrôle local Windows indépendant : statut final à vérifier dans la PR.
- **Ne pas utiliser** la branche `family/story-led-multipage-2026-10-31` (PR #119), qui présente encore le modèle à sept chapitres.
- Aucun compte, prénom, âge, courriel, argent réel, authentification parentale ni réseau public : une simulation locale dans un seul onglet, qui se réinitialise lors d'un rechargement.

## Démarrer sous Windows PowerShell

Dans un nouveau dossier, pour ne pas mélanger avec un autre clone Cresco :

```powershell
git clone https://github.com/Faadil1/cresco.git cresco-family-review
cd cresco-family-review
git fetch origin family/legacy-product-shell-rebuild-2026-11-01
git switch --track origin/family/legacy-product-shell-rebuild-2026-11-01

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\apps\web\scripts\family-v3-local-pilot.ps1 -CheckOnly
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\apps\web\scripts\family-v3-local-pilot.ps1
```

Prérequis : Git, Node.js 22+ et le port local 3100 libre. Attendre le message réel de démarrage de Wrangler dans PowerShell, puis ouvrir sur **le même PC** :

```text
http://127.0.0.1:3100/try
```

Le script refuse une mauvaise branche, un dépôt modifié ou un changement d'application après le commit candidat vérifié. Il ne déploie aucun Worker. Un `-CheckOnly` vert n'est pas une validation visuelle du lancement complet.

## Critères de revue (ancien parcours vs nouveau)

1. **Entrée Enfant :** « Let's begin » → trois écrans courts Rêve / Intérêts / Prêt → **Home**. Vérifier qu'on n'arrive pas sur une longue page d'informations empilées.
2. **Home :** on voit seulement l'objectif, la mission principale et l'essentiel du Key. Le reste (leçons, personnages, badges et suivi Parent) n'est accessible qu'en ouvrant **More progress and family details**. Les cinq onglets restent dans la barre de navigation existante ; aucune deuxième barre de raccourcis ne doit encombrer le Home.
3. **Learn :** ouvrir **Save for a goal**, vérifier trois scènes successives (dont un calcul concret), faire l'exercice **Try it**, puis un QCM final séparé. La progression et la mission changent au retour à Home, sans rechargement. Le Parent possède aussi des leçons de plusieurs scènes, non une fiche unique.
4. **Explore :** avec l'intérêt Food & shopping, ouvrir **Neighborhood Markets**. Reconnaître Mina et son épicerie, comprendre l'augmentation des coûts de livraison, puis répondre à son dilemme. Les **deux réponses** doivent être entièrement visibles **au-dessus** de la navigation inférieure, sans défiler ni cliquer à travers la barre. Ce défaut a été constaté dans les captures avant correctif et corrigé en conservant le récit détaillé sur ordinateur.
5. **Parent :** demander 25 crédits quand My Key permet 15. Le Parent simulé examine la demande exacte; son tableau de bord présente **Objectif / Demandes / My Key** en trois colonnes sur grand écran, verticalement sur téléphone. Aucun changement silencieux de Key.
6. **Portfolio / Together / Profile :** dans un portefeuille vide, ouvrir **See how a sample portfolio works**, essayer un choc fictif sur trois positions et vérifier que le solde de l'enfant ne change pas. Après une décision simulée, retrouver les unités, le coût, la valeur du scénario, la répartition, le risque de concentration et les reçus. Dans Together, retrouver Mina. Aucune action financière réelle ni sauvegarde de données.
7. **Recommencer :** revenir à Profile → « Start over for a new family ». Vérifier que l'objectif, les demandes, la décision et le reçu sont réinitialisés avant une nouvelle séance.

### Comment signaler ce qui ne marche toujours pas

Noter le nom de l'écran, la taille mobile ou ordinateur, l'action, ce qui était attendu, ce qui est apparu. Comparer de préférence les **mêmes étapes** que dans l'ancienne vidéo, plutôt que l'écran Parent de connexion d'avant et un dashboard Parent d'après. Un screenshot avec des crédits/états fictifs ne signifie pas que les données sont persistées.

**Ne pas fusionner ni déployer** sur la base de seuls tests automatisés; demander l'acceptation visuelle du fondateur. Si le navigateur garde un ancien serveur localhost, fermer l'ancien terminal avant de relancer; ne pas contourner les contrôles du script.
