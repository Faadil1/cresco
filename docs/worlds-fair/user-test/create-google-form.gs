/**
 * Creates the CRESCO round-1 user test form (French) and a linked response
 * Sheet. Paste into https://script.google.com (new project), run
 * createCrescoTestForm, accept the permissions, then read the log.
 *
 * Source of truth for the protocol: docs/worlds-fair/USER-TEST-KIT-2026-10-12.md
 * Never put a workspace or role link in this form: send the home page only.
 */
const CRESCO_URL = "https://cresco.faadil-casecraft.workers.dev";

function createCrescoTestForm() {
  const form = FormApp.create("CRESCO · Test utilisateur (tour 1)");
  form
    .setDescription(
      "Merci de tester CRESCO. On teste le produit, pas vous. Il n'y a pas de mauvaise réponse.\n\n" +
        "Durée : 10 à 15 minutes. Lien : " + CRESCO_URL + "\n" +
        "Solana Devnet uniquement : aucun vrai argent, aucun portefeuille ni clé privée demandés.\n" +
        "Ne collez jamais ici un lien d'espace de travail ou de rôle."
    )
    .setCollectEmail(false)
    .setProgressBar(true)
    .setAllowResponseEdits(false);

  const ss = SpreadsheetApp.create("CRESCO · Réponses test tour 1");
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  const SUCCESS = ["Seul(e)", "Avec un indice", "Pas réussi"];
  const EASE = ["1", "2", "3", "4", "5", "6", "7"];

  // ---- Section 1: profil et première impression ----
  form.addTextItem().setTitle("Prénom ou pseudo").setRequired(true);
  form
    .addMultipleChoiceItem()
    .setTitle("Qu'est-ce qui vous décrit le mieux ?")
    .setChoiceValues([
      "Parent, ou je gère de l'argent pour quelqu'un",
      "Je trade, ou je construis avec des agents IA",
      "Ni l'un ni l'autre",
    ])
    .showOtherOption(true)
    .setRequired(true);
  form
    .addMultipleChoiceItem()
    .setTitle("Connaissiez-vous CRESCO avant aujourd'hui ?")
    .setChoiceValues(["Non", "J'en ai entendu parler", "Oui, je l'ai déjà utilisé"])
    .setRequired(true);
  form
    .addParagraphTextItem()
    .setTitle("Première impression")
    .setHelpText("Ouvrez " + CRESCO_URL + ", regardez la page 10 secondes, puis répondez sans y revenir : qu'est-ce que CRESCO, et pour qui ?")
    .setRequired(true);

  const trackItem = form
    .addMultipleChoiceItem()
    .setTitle("Quel parcours vous a été attribué ?")
    .setHelpText("Si personne ne vous en a attribué un, choisissez celui qui vous parle le plus.")
    .setRequired(true);

  // ---- Section A: application Family ----
  const pageA = form.addPageBreakItem().setTitle("Parcours A · Application Family").setHelpText(
    "Partez de la page d'accueil. Pour chaque tâche, notez si vous avez réussi seul(e), puis la facilité.\n" +
      "1. Entrer dans l'application Family en tant qu'ado.\n" +
      "2. Trouver combien vaut le portefeuille d'entraînement.\n" +
      "3. Trouver une leçon à continuer et l'ouvrir.\n" +
      "4. Savoir si les prix affichés sont réels.\n" +
      "5. Trouver ce que le parent contrôle."
  );
  const tasksA = ["1. Entrer comme ado", "2. Valeur du portefeuille", "3. Ouvrir une leçon", "4. Prix réels ?", "5. Ce que le parent contrôle"];
  form.addGridItem().setTitle("Réussite par tâche").setRows(tasksA).setColumns(SUCCESS).setRequired(true);
  form.addGridItem().setTitle("Facilité par tâche (1 = très difficile, 7 = très facile)").setRows(tasksA).setColumns(EASE).setRequired(true);
  form.addParagraphTextItem().setTitle("Les prix sont-ils réels ? Comment l'avez-vous su ?");
  form.addParagraphTextItem().setTitle("Selon vous, que contrôle le parent ?");
  form.addParagraphTextItem().setTitle("Où avez-vous hésité ou bloqué ? Qu'attendiez-vous à la place ?");

  // ---- Section B: mandat famille en direct ----
  const pageB = form.addPageBreakItem().setTitle("Parcours B · Mandat famille en direct sur Solana").setHelpText(
    "Partez de la page d'accueil.\n" +
      "1. Trouver le mandat famille en direct et le configurer avec les noms et la limite proposés.\n" +
      "2. Créer le mandat sur Solana Devnet et attendre qu'il soit prêt.\n" +
      "3. En tant qu'ado, investir 0,30 $.\n" +
      "4. En tant qu'ado, investir 0,75 $.\n" +
      "5. En tant que parent, décider de la demande.\n" +
      "6. Trouver la preuve de ce qui s'est passé (historique, reçu)."
  );
  const tasksB = ["1. Trouver et configurer", "2. Créer le mandat", "3. Investir 0,30 $", "4. Investir 0,75 $", "5. Décision du parent", "6. Trouver la preuve"];
  form.addGridItem().setTitle("Réussite par tâche").setRows(tasksB).setColumns(SUCCESS).setRequired(true);
  form.addGridItem().setTitle("Facilité par tâche (1 = très difficile, 7 = très facile)").setRows(tasksB).setColumns(EASE).setRequired(true);
  form.addParagraphTextItem().setTitle("Qu'est-il arrivé à 0,30 $ ? Et à 0,75 $ ?");
  form.addParagraphTextItem().setTitle("Après la décision du parent, qu'est-ce qui a changé, et qu'est-ce qui n'a pas changé ?");
  form.addScaleItem().setTitle("La preuve (historique, reçu) vous a-t-elle aidé à faire confiance à ce qui s'est passé ?").setBounds(1, 5).setLabels("Pas du tout", "Beaucoup");
  form.addParagraphTextItem().setTitle("Où avez-vous hésité ou bloqué ? Qu'attendiez-vous à la place ?");

  // ---- Section C: capital délégué ----
  const pageC = form.addPageBreakItem().setTitle("Parcours C · Capital délégué (stratégie ou agent IA)").setHelpText(
    "Partez de la page d'accueil.\n" +
      "1. Entrer dans Delegated capital et configurer avec les valeurs proposées.\n" +
      "2. Créer le mandat sur Solana Devnet et attendre qu'il soit prêt.\n" +
      "3. En tant que stratégie, soumettre une action de 0,30 $.\n" +
      "4. Soumettre une action de 0,75 $.\n" +
      "5. En tant qu'allocateur, décider de la demande.\n" +
      "6. Trouver la preuve de ce qui s'est passé (historique, reçu)."
  );
  const tasksC = ["1. Entrer et configurer", "2. Créer le mandat", "3. Action 0,30 $", "4. Action 0,75 $", "5. Décision de l'allocateur", "6. Trouver la preuve"];
  form.addGridItem().setTitle("Réussite par tâche").setRows(tasksC).setColumns(SUCCESS).setRequired(true);
  form.addGridItem().setTitle("Facilité par tâche (1 = très difficile, 7 = très facile)").setRows(tasksC).setColumns(EASE).setRequired(true);
  form.addParagraphTextItem().setTitle("Qu'est-il arrivé à 0,30 $ ? Et à 0,75 $ ?");
  form.addParagraphTextItem().setTitle("Une stratégie ou un agent IA pourrait-il élargir sa propre limite ici ? Pourquoi ?");
  form.addScaleItem().setTitle("La preuve (historique, reçu) vous a-t-elle aidé à faire confiance à ce qui s'est passé ?").setBounds(1, 5).setLabels("Pas du tout", "Beaucoup");
  form.addParagraphTextItem().setTitle("Où avez-vous hésité ou bloqué ? Qu'attendiez-vous à la place ?");

  // ---- Section finale: compréhension et avis ----
  const pageEnd = form.addPageBreakItem().setTitle("Pour finir");
  // Correct answers (not shown): "Elle dépassait la limite fixée" and "Inchangée".
  form
    .addMultipleChoiceItem()
    .setTitle("Pourquoi l'action la plus grosse a-t-elle eu besoin d'une approbation ?")
    .setChoiceValues([
      "Elle dépassait la limite fixée",
      "Le marché était fermé",
      "Toutes les actions demandent une approbation",
      "Je ne sais pas",
    ])
    .setRequired(true);
  form
    .addMultipleChoiceItem()
    .setTitle("Après l'approbation, que devient la limite ?")
    .setChoiceValues(["Inchangée", "Elle augmente au montant approuvé", "Elle est supprimée", "Je ne sais pas"])
    .setRequired(true);
  form.addScaleItem().setTitle("CRESCO répond à ce dont j'aurais besoin.").setBounds(1, 7).setLabels("Pas du tout d'accord", "Tout à fait d'accord").setRequired(true);
  form.addScaleItem().setTitle("CRESCO est facile à utiliser.").setBounds(1, 7).setLabels("Pas du tout d'accord", "Tout à fait d'accord").setRequired(true);
  form.addParagraphTextItem().setTitle("Est-ce que cela résoudrait un vrai problème pour vous ou quelqu'un que vous connaissez ? Qui ?");
  form.addMultipleChoiceItem().setTitle("Lequel vous parle le plus ?").setChoiceValues(["Family", "Delegated capital", "Les deux", "Aucun"]);
  form.addParagraphTextItem().setTitle("De quoi auriez-vous besoin avant de l'utiliser avec de l'argent réel ?");
  form.addParagraphTextItem().setTitle("La première chose à changer").setRequired(true);
  form.addTextItem().setTitle("Temps passé (minutes)");
  form.addMultipleChoiceItem().setTitle("D'accord pour qu'on cite votre réponse (anonymement) ?").setChoiceValues(["Oui", "Non"]).setRequired(true);
  form.addTextItem().setTitle("Email, seulement si vous acceptez qu'on vous recontacte (facultatif)");

  // Branching: track choice -> its section; each track section -> final section.
  trackItem.setChoices([
    trackItem.createChoice("A · Application Family", pageA),
    trackItem.createChoice("B · Mandat famille en direct", pageB),
    trackItem.createChoice("C · Capital délégué", pageC),
  ]);
  // Sections run in order A, B, C, end: send A and B straight to the end.
  setSectionExit_(form, pageA, pageEnd);
  setSectionExit_(form, pageB, pageEnd);

  Logger.log("Form (send this): " + form.getPublishedUrl());
  Logger.log("Edit: " + form.getEditUrl());
  Logger.log("Responses sheet: " + ss.getUrl());
}

// In Google Forms, where a section goes after its last question is set on the
// NEXT page break. So the exit of section A is set on page break B, and so on.
function setSectionExit_(form, sectionPage, target) {
  const items = form.getItems(FormApp.ItemType.PAGE_BREAK).map((i) => i.asPageBreakItem());
  const idx = items.findIndex((p) => p.getId() === sectionPage.getId());
  if (idx >= 0 && idx + 1 < items.length) items[idx + 1].setGoToPage(target);
}
