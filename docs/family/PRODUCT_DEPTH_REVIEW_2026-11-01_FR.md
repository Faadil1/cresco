# Cresco Family — revue de profondeur produit du 1er novembre 2026

## Origine : deux vidéos du fondateur

Deux enregistrements d'une navigation locale Family V3 ont été regardés : le premier montre l'accueil, la création de l'objectif, le Home, une leçon et Explore (durée d'environ 68 secondes) ; le second montre surtout Portfolio, Profile et la vue Parent (environ 30 secondes). Le commentaire du fondateur est clair : **Home surchargé ; les leçons n'ont pas la profondeur de vraies leçons ; le portefeuille manque de substance et de réalisme**. Les captures de ces vidéos ne sont pas publiées dans le dépôt, afin de ne pas exposer inutilement les données et l'environnement du fondateur.

## Diagnostic source, avant correctifs

- **Home** : objectif, mission, deux prochaines leçons, prochaine personne à rencontrer, My Key, Parent et quatre badges se disputaient l'attention alors que la navigation Home / Learn / Explore / Portfolio / Profile existait déjà. Le Home répétait des fonctions des autres destinations.
- **Learn** : les modules d'introduction Child (`c-save`, `c-explore`, `c-risk`) et les cinq modules Parent n'avaient qu'un concept textuel puis un QCM, sans application guidée. Les six anciens modules illustrés d'origine contenaient plus d'étapes, mais il manquait une activité appliquée distincte de la question finale.
- **Portfolio** : le panneau vert présentait les crédits *dépensés* comme indicateur principal; coût, allocation, valorisation fictive et conséquences par position n'étaient pas assez lisibles. Le portefeuille vide ne montrait pas comment fonctionne un portefeuille, hormis l'incitation à commencer.

## Modifications codées sur la branche de la PR #120

1. **Home** — `family-story-home.tsx` : une priorité lisible (objectif et mission), explication compacte de My Key; affiche immédiatement une demande Parent en cours, mais les contenus secondaires (leçons, personnes, suivi Parent, badges) sont repliés dans un `details` facultatif. Aucune deuxième navigation à trois cartes : les cinq destinations existantes restent la seule barre principale.
2. **Learn** — `family-learning-depth.ts`, `family-public-practice.ts`, `family-story-learn.tsx` : scènes pédagogiques progressives pour les trois modules Child fondamentaux et les cinq modules Parent, et **une situation appliquée avec deux raisonnements et un retour spécifique dans chacune des 14 leçons**. Le QCM final est maintenu et reste distinct de l'activité, qui ne modifie aucun droit. Les six modules d'origine gardent leurs sources et leurs contenus illustrés.
3. **Portfolio** — `family-story-portfolio.tsx` : vocabulaire explicite de coût investi, barres d'allocation, quantité de parts fictives, répartition et valorisation par scénario de chaque position, aperçu de la concentration. Avant le premier achat, on peut ouvrir un **portefeuille exemple** de trois actifs et changer son scénario sans générer ni acheter aucun actif. Les demandes et reçus réels de la simulation sont séparés du portefeuille exemple.

## Non-objectifs, limites et sécurité

Il s'agit **d'un simulateur pédagogique**. Aucun prix de marché en temps réel, aucun titre juridique, aucune connexion bancaire, aucun marché réel, aucune transaction, aucun wallet, aucune identité de mineur et aucune authentification de parent n'est ajoutée. Il ne faut pas faire passer le portefeuille exemple pour les avoirs de l'enfant, ni présenter les scénarios comme des prévisions.

Le moteur `family-public-practice.ts` conserve les limites de Key, demandes, validations ponctuelles et reçus. Les modifications de ce fichier se limitent à l'assemblage des contenus pédagogiques (aucune modification du réducteur de permissions ou de transaction). Le state reste volontairement en mémoire sur le même onglet et disparaît lors d'un rechargement.

Les tests automatiques vérifient l'absence de régression technique. **Ils ne prouvent pas que les leçons sont pédagogiquement suffisantes ou que les familles trouvent le Portfolio crédible.** Il reste la revue visuelle du fondateur, une relecture du contenu par un spécialiste de l'éducation financière, et des essais réels avec des familles. Aucune fusion ni publication n'est autorisée par ce document.

## Critères de revue

- **Home** : comprendre l'objectif et la prochaine action sans lire six cartes ; accès aux autres outils via la barre principale.
- **Learn** : `Save for a goal` doit être une séquence de trois scènes avec calcul concret (60 crédits sur quatre périodes), un cas à résoudre avec retour explicatif et un QCM distinct ; le Parent doit avoir le même niveau de profondeur minimum.
- **Portfolio vide** : pouvoir explorer trois positions exemples et un choc de marché sans fabriquer de reçus ni modifier le Key. **Portfolio après pratique** : coût, unités, poids, et valeur par scénario sont cohérents avec les reçus et la somme des crédits.
- **Sécurité** : toujours une seule approbation exacte au-delà du Key ; aucune modification de la V2 publique ni des Workers historiques.

**État de preuve** : les nouveaux commits doivent obtenir une CI sur leur SHA exact et une capture mobile/ordinateur inspectée avant d'être proposés comme référence locale validée.
