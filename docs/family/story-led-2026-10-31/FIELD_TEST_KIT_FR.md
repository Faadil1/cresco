# CRESCO Family V3 — kit terrain (FR) pour 5 essais parent–enfant

**État : prêt à utiliser localement, séances non réalisées.** Complément au protocole [FAMILY_USABILITY_PILOT.md](FAMILY_USABILITY_PILOT.md), pas preuve de validation externe ni autorisation de publier. Cette fiche appartient à la PR #119 (V3), et **non** à la V2 publique.

## 0. Conditions qui évitent un faux test

- **Interface testée : V3 en anglais.** Faire d'abord les essais avec des personnes capables de lire le parcours anglais. Demander séparément si une interface française serait préférable. Ne pas traduire les questions ou aider à choisir pendant la tâche : noter « langue » comme friction; un obstacle linguistique ne prouve pas un mauvais récit.
- **Un seul appareil et un seul onglet.** Les vues « Child » et « Parent » sont une simulation dans le même navigateur; aucun parent n'est authentifié, aucun compte n'est créé. Ce n'est pas une démonstration de synchronisation entre appareils.
- **100 crédits fictifs**, limite « My Key » de 15 crédits par action avant intervention Parent simulée. Aucun achat, investissement, portefeuille réel, transaction blockchain ni paiement.
- **La progression est volatile** et disparaît lors d'un rechargement complet. Ne pas rafraîchir la page au milieu d'une session. Réinitialiser entre séances par rechargement/onglet neuf.
- Ne pas utiliser [le site Cresco historique](https://cresco-lac.vercel.app/) ni la Worker V2 pour cette validation : ils ne montrent pas la V3 de cette PR.
- Ne pas ouvrir de port public, installer Cloudflare Access, inventer un lien testeur, fusionner, déployer, activer de comptes ou stocker des informations sur des enfants.

## 1. Faire tourner V3 en local sur Windows — sans déploiement

Prérequis : Git, Node.js **22 ou plus** et accès au dépôt GitHub autorisé. Exécuter dans PowerShell sur l'ordinateur du facilitateur, pas sur une machine de production.

```powershell
git clone https://github.com/Faadil1/cresco.git
cd cresco
git fetch origin family/story-led-multipage-2026-10-31
git checkout --detach ebdbee4abafedf597b1865dabdcabbc0cbaebce0
cd apps/web
Remove-Item Env:NEXT_PUBLIC_CRESCO_API_URL -ErrorAction SilentlyContinue
npm ci --no-audit --no-fund
npm run build:public-family
npm run start:vinext -- --ip 127.0.0.1 --port 3100
```

Ouvrir **http://127.0.0.1:3100/try** sur le *même ordinateur*. Le serveur doit rester lancé. Le lien `127.0.0.1` n'est **pas** une URL partageable avec une famille à distance. Si une autre version occupe le port 3100, ne pas réutiliser son serveur : arrêter l'ancien processus et relancer la V3 vérifiée. Les commandes ont été vérifiées contre les scripts `package.json`, `build-public-family.mjs` et la configuration Playwright du dépôt; la recette terrain elle-même n'a pas été exécutée sur un Windows physique ici.

Avant d'inviter qui que ce soit : vérifier à l'écran la page `/try`, le choix du rêve, Mina, la limite de crédits, et qu'aucun écran ne prétend traiter de l'argent réel. Faire une **séance blanche avec un adulte**, enregistrée « dry-run », distincte des séances avec enfant.

## 2. Déroulé : 12 à 18 minutes, non dirigé

Accueillir un adulte et un enfant ensemble. Demander l'autorisation explicite à l'adulte et vérifier que l'enfant souhaite participer. Participation libre, arrêt immédiat à la demande, questions sautables. Ne pas noter nom, prénom, âge précis, courriel, coordonnées, identifiant, situation financière ni image/voix.

**Texte d'ouverture :**

> C'est une histoire d'apprentissage encore en développement. Les entreprises et les crédits sont fictifs : rien n'est acheté, aucun compte n'est ouvert. Ce n'est pas toi qu'on évalue, c'est le parcours. Tu peux arrêter à tout moment. Je vais seulement noter ce qui est facile ou difficile, sans informations personnelles. Voulez-vous essayer ensemble ?

Proposer la souris ou le pavé tactile à l'enfant. Ne pas toucher l'interface à sa place, sauf s'il demande de l'aide, auquel cas noter l'aide et la raison. Pour le tour Parent, le parent reprend **le même onglet**.

| Étape | Consigne à dire (sans donner la réponse) | Observer |
|---|---|---|
| 1 — Mon objectif | « Choisis un rêve pour lequel tu aimerais économiser. » | Trouve les trois cartes; choisit sans assistance; sait ce qui change ensuite. |
| 2 — Découvrir | « Ouvre une leçon, puis explique-moi ce que tu en retiens. » | Progrès compréhensible; pas de confusion entre apprendre et autoriser de l'argent. |
| 3 — Mina | « Ouvre Neighborhood Markets. Lis l'histoire de Mina et réponds à sa question. » | Identifie personnage, problème des frais de livraison, deux options, explication possible. |
| 4 — Ma limite | « Essaye le choix fictif de 25 crédits. Que va-t-il se passer ? » | Voit la limite 15, la demande Parent et l'absence d'achat. |
| 5 — Parent | « À vous de jouer : regardez sa raison, puis décidez pour cette demande seulement. » | Décision unique, résultat immédiat, pas de modification silencieuse de My Key. |
| 6 — Ensemble | « Revenez au résultat. Parlez de Mina et de ce que vous voudriez vérifier ensuite. » | Discussion autonome; rappelle situation et conséquence de la décision. |

## 3. Questions de rappel hors écran

Après l'expérience, **masquer l'écran** et demander en français ou dans la langue de discussion familiale, sans proposer les bonnes réponses :

1. Qui était Mina? Quel problème sa famille avait-elle?
2. Pourquoi une boutique plus fréquentée pourrait-elle gagner moins d'argent?
3. À quoi sert « My Key »? Quelle décision fallait-il demander au Parent?
4. Qu'est-il arrivé au choix de 25 crédits? Est-ce qu'un vrai achat a eu lieu?
5. Qu'aimeriez-vous découvrir ensemble une prochaine fois? Pour quelle raison?

Noter ce que la personne **dit spontanément**, pas ce qu'elle est capable de répéter après une explication.

## 4. Règles de consignation (zéro donnée personnelle)

Utiliser [SESSION_OBSERVATIONS_TEMPLATE.csv](SESSION_OBSERVATIONS_TEMPLATE.csv) comme modèle **local** par séance et conserver les données brutes hors du dépôt GitHub. Attribuer seulement P01–P05; ne saisir ni nom, ni enregistrement, ni citation identifiable. Ne pas ouvrir d'issue GitHub par enfant. Résumer uniquement des tendances non identifiantes après analyse.

**Échelle** 0 : non réalisé / confusion importante; 1 : partiellement ou avec aide; 2 : compris/réalisé sans aide; NA : non testé. Distinguer le score de tâche du score de rappel. Toute mauvaise compréhension de « argent réel », « consentement parental vérifié » ou « conseil financier » vaut **STOP / révision avant diffusion**.

Les cinq séances sont exploratoires et **non représentatives**. Cible indicative (non encore mesurée) : au moins quatre sur cinq rappellent Mina et l'enjeu recettes/coûts, et quatre sur cinq comprennent la décision ponctuelle du Parent. Une réponse positive « je reviendrais » n'est **pas** une preuve de rétention.

## 5. Message d'invitation (à utiliser uniquement quand un accès réel est possible)

> Bonjour ! Je prépare de courts essais de Cresco Family, une histoire interactive d'éducation financière avec des entreprises et des crédits fictifs. Je cherche quelques parents qui accepteraient de l'essayer **avec leur enfant**, dans une séance accompagnée d'environ 15 minutes. Il n'y a ni compte ni argent réel, et aucune information personnelle sur l'enfant n'est demandée. Le but est de comprendre ce qui fonctionne et ce qui est confus. La version de test est actuellement disponible uniquement sur mon ordinateur, pas via un lien public. Si cela vous intéresse, on peut convenir d'une séance.

Ce brouillon **n'a pas été envoyé**. Ne pas promettre de lien V3 tant qu'un environnement testeur dédié n'est pas construit, audité et approuvé séparément.

## 6. Verdict de séance / suites

- **HOLD** : confusion sur argent réel ou autorité Parent, problème majeur de compréhension répété, blocage sans aide.
- **ITERATE** : hésitation récurrente, question trop basse sur mobile, texte difficile, friction linguistique, histoire mémorisée sans conséquence comprise.
- **CANDIDATE POUR PILOTE PLUS LARGE** : retours positifs documentés et aucun blocage critique. Ce n'est **pas** une approbation de déploiement. Toute publication V3 reste une décision distincte, avec périmètre Cloudflare et rollback vérifiés.

**Suivi au 31 octobre 2026 :** 0 famille testée; 0 prise de contact effectuée; aucun lien V3 public créé. PR #119 toujours en brouillon, V2 et Workers historiques inchangés.
