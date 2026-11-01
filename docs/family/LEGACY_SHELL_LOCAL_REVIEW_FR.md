# CRESCO Family — revue locale du nouveau parcours produit (PR #120)

**Travail en cours, pas une publication.** Cette fiche sert à vérifier sur son propre ordinateur la refonte basée sur l'ancien Cresco, séparément du site historique `cresco-lac.vercel.app` et de la V2 Family publique.

- Branche à examiner : `family/legacy-product-shell-rebuild-2026-11-01` (PR #120, en brouillon).
- Source applicative **vérifiée** : `2e2dd31bc5d9325613fda5062ffd356e6becd78d` — [58/58 tests WebKit iPhone + Chromium desktop](https://github.com/Faadil1/cresco/actions/runs/41363010547), aucun déploiement. Les exercices appliqués et les trois calculateurs éducatifs sont purement fictifs; aucune bonne réponse n'est exigée pour avancer.
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
2. **Home :** on voit seulement l'objectif, la mission principale et l'essentiel du Key. Le reste (leçons, personnages, badges et suivi Parent) n'est accessible qu'en ouvrant **More progress and family details**. Les cinq onglets restent dans la barre existante, sans deuxième navigation ni paragraphe expliquant inutilement comment cliquer dessus.
3. **Learn :** ouvrir **Save for a goal**, vérifier trois scènes successives (dont un calcul concret). Sur l'écran **Try it**, le bouton suivant doit être **désactivé avant la première réponse**. Choisir une option, lire sa conséquence, puis ouvrir la troisième scène pour essayer **Hands-on lab : Change the numbers**. Faire glisser **Practice periods** de 4 à 3 : pour un vélo de 60 crédits non épargnés, le plan passe de 15 à 20 crédits par période. Puis répondre au QCM final distinct. Essayer aussi les ateliers de **Know what you own** (facture de livraison de Mina) et de **Practice with risk** (perte hypothétique). Aucun de ces essais ne doit créer de reçu ni changer My Key. Une réponse imparfaite doit permettre d'apprendre et d'avancer. La mission change au retour à Home ; le Parent a aussi des leçons structurées.
4. **Explore :** avec l'intérêt Food & shopping, ouvrir **Neighborhood Markets**. Reconnaître Mina et son épicerie, comprendre l'augmentation des coûts de livraison, puis répondre à son dilemme. Les **deux réponses** doivent être entièrement visibles **au-dessus** de la navigation inférieure, sans défiler ni cliquer à travers la barre. Ce défaut a été constaté dans les captures avant correctif et corrigé en conservant le récit détaillé sur ordinateur.
5. **Parent :** demander 25 crédits quand My Key permet 15. Le Parent simulé examine la demande exacte; son tableau de bord présente **Objectif / Demandes / My Key** en trois colonnes sur grand écran, verticalement sur téléphone. Aucun changement silencieux de Key.
6. **Portfolio / Together / Profile :** dans un portefeuille vide, ouvrir **See how a sample portfolio works**, essayer un choc fictif sur trois positions et vérifier que le solde de l'enfant ne change pas. Après une décision simulée, retrouver les unités, le coût, la valeur du scénario, la répartition, le risque de concentration et les reçus. Dans Together, retrouver Mina. Aucune action financière réelle ni sauvegarde de données.
7. **Recommencer :** revenir à Profile → « Start over for a new family ». Vérifier que l'objectif, les demandes, la décision et le reçu sont réinitialisés avant une nouvelle séance.

### Comment signaler ce qui ne marche toujours pas

Noter le nom de l'écran, la taille mobile ou ordinateur, l'action, ce qui était attendu, ce qui est apparu. Comparer de préférence les **mêmes étapes** que dans l'ancienne vidéo, plutôt que l'écran Parent de connexion d'avant et un dashboard Parent d'après. Un screenshot avec des crédits/états fictifs ne signifie pas que les données sont persistées.

**Ne pas fusionner ni déployer** sur la base de seuls tests automatisés; demander l'acceptation visuelle du fondateur. Si le navigateur garde un ancien serveur localhost, fermer l'ancien terminal avant de relancer; ne pas contourner les contrôles du script.
