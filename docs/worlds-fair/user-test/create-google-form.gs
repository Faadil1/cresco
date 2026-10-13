/**
 * Creates the CRESCO round-1 user test form (bilingual French / English) and a
 * linked response Sheet. Paste into https://script.google.com (new project),
 * run createCrescoTestForm, accept the permissions, then read the log.
 *
 * Source of truth for the protocol: docs/worlds-fair/USER-TEST-KIT-2026-10-12.md
 * Never put a workspace or role link in this form: send the home page only.
 */
const CRESCO_URL = "https://cresco.faadil-casecraft.workers.dev";

// Short text: "FR / EN". Long text: FR, blank line, EN.
function t(fr, en) { return fr + " / " + en; }
function tl(fr, en) { return fr + "\n\n" + en; }

function createCrescoTestForm() {
  const form = FormApp.create("CRESCO · Test utilisateur / User test (tour 1 / round 1)");
  form
    .setDescription(
      tl(
        "Merci de tester CRESCO. On teste le produit, pas vous. Il n'y a pas de mauvaise réponse.\n" +
          "Durée : 10 à 15 minutes. Lien : " + CRESCO_URL + "\n" +
          "Solana Devnet uniquement : aucun vrai argent, aucun portefeuille ni clé privée demandés.\n" +
          "Ne collez jamais ici un lien d'espace de travail ou de rôle.",
        "Thank you for testing CRESCO. We are testing the product, not you. There are no wrong answers.\n" +
          "Time: 10 to 15 minutes. Link: " + CRESCO_URL + "\n" +
          "Solana Devnet only: no real money, no wallet or private key needed.\n" +
          "Never paste a workspace or role link here."
      )
    )
    .setCollectEmail(false)
    .setProgressBar(true)
    .setAllowResponseEdits(false);

  const ss = SpreadsheetApp.create("CRESCO · Réponses / Responses test tour 1");
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  const SUCCESS = [t("Seul(e)", "On my own"), t("Avec un indice", "With a hint"), t("Pas réussi", "Not done")];
  const EASE = ["1", "2", "3", "4", "5", "6", "7"];
  const SUCCESS_T = t("Réussite par tâche", "Success per task");
  const EASE_T = t("Facilité par tâche (1 = très difficile, 7 = très facile)", "Ease per task (1 = very hard, 7 = very easy)");
  const STUCK_T = t("Où avez-vous hésité ou bloqué ? Qu'attendiez-vous à la place ?", "Where did you hesitate or get stuck? What did you expect instead?");
  const PROOF_T = t("La preuve (historique, reçu) vous a-t-elle aidé à faire confiance à ce qui s'est passé ?", "Did the proof (history, receipt) help you trust what happened?");

  // ---- Section 1: profil et première impression / profile and first impression ----
  form.addTextItem().setTitle(t("Prénom ou pseudo", "First name or alias")).setRequired(true);
  form
    .addMultipleChoiceItem()
    .setTitle(t("Qu'est-ce qui vous décrit le mieux ?", "What describes you best?"))
    .setChoiceValues([
      t("Parent, ou je gère de l'argent pour quelqu'un", "Parent, or I manage money for someone"),
      t("Je trade, ou je construis avec des agents IA", "I trade, or I build with AI agents"),
      t("Ni l'un ni l'autre", "Neither"),
    ])
    .showOtherOption(true)
    .setRequired(true);
  form
    .addMultipleChoiceItem()
    .setTitle(t("Connaissiez-vous CRESCO avant aujourd'hui ?", "Did you know CRESCO before today?"))
    .setChoiceValues([t("Non", "No"), t("J'en ai entendu parler", "I had heard of it"), t("Oui, je l'ai déjà utilisé", "Yes, I have used it")])
    .setRequired(true);
  form
    .addParagraphTextItem()
    .setTitle(t("Première impression", "First impression"))
    .setHelpText(
      tl(
        "Ouvrez " + CRESCO_URL + ", regardez la page 10 secondes, puis répondez sans y revenir : qu'est-ce que CRESCO, et pour qui ?",
        "Open " + CRESCO_URL + ", look at the page for 10 seconds, then answer without going back: what is CRESCO, and who is it for?"
      )
    )
    .setRequired(true);

  const trackItem = form
    .addMultipleChoiceItem()
    .setTitle(t("Quel parcours vous a été attribué ?", "Which track were you given?"))
    .setHelpText(t("Si personne ne vous en a attribué un, choisissez celui qui vous parle le plus.", "If nobody gave you one, pick the one that speaks to you most."))
    .setRequired(true);

  // ---- Section A ----
  const pageA = form.addPageBreakItem().setTitle(t("Parcours A · Application Family", "Track A · Family app")).setHelpText(
    tl(
      "Partez de la page d'accueil. Pour chaque tâche, notez si vous avez réussi seul(e), puis la facilité.\n" +
        "1. Entrer dans l'application Family en tant qu'ado.\n" +
        "2. Trouver combien vaut le portefeuille d'entraînement.\n" +
        "3. Trouver une leçon à continuer et l'ouvrir.\n" +
        "4. Savoir si les prix affichés sont réels.\n" +
        "5. Trouver ce que le parent contrôle.",
      "Start from the home page. For each task, note whether you did it on your own, then how easy it was.\n" +
        "1. Get into the Family app as the teen.\n" +
        "2. Find how much the practice portfolio is worth.\n" +
        "3. Find a lesson to continue and open it.\n" +
        "4. Find out whether the prices shown are real.\n" +
        "5. Find what the parent controls."
    )
  );
  const tasksA = [
    t("1. Entrer comme ado", "1. Enter as the teen"),
    t("2. Valeur du portefeuille", "2. Portfolio value"),
    t("3. Ouvrir une leçon", "3. Open a lesson"),
    t("4. Prix réels ?", "4. Real prices?"),
    t("5. Ce que le parent contrôle", "5. What the parent controls"),
  ];
  form.addGridItem().setTitle(SUCCESS_T).setRows(tasksA).setColumns(SUCCESS).setRequired(true);
  form.addGridItem().setTitle(EASE_T).setRows(tasksA).setColumns(EASE).setRequired(true);
  form.addParagraphTextItem().setTitle(t("Les prix sont-ils réels ? Comment l'avez-vous su ?", "Are the prices real? How did you know?"));
  form.addParagraphTextItem().setTitle(t("Selon vous, que contrôle le parent ?", "In your words, what does the parent control?"));
  form.addParagraphTextItem().setTitle(STUCK_T);

  // ---- Section B ----
  const pageB = form.addPageBreakItem().setTitle(t("Parcours B · Mandat famille en direct sur Solana", "Track B · Live family mandate on Solana")).setHelpText(
    tl(
      "Partez de la page d'accueil.\n" +
        "1. Trouver le mandat famille en direct et le configurer avec les noms et la limite proposés.\n" +
        "2. Créer le mandat sur Solana Devnet et attendre qu'il soit prêt.\n" +
        "3. En tant qu'ado, investir 0,30 $.\n" +
        "4. En tant qu'ado, investir 0,75 $.\n" +
        "5. En tant que parent, décider de la demande.\n" +
        "6. Trouver la preuve de ce qui s'est passé (historique, reçu).",
      "Start from the home page.\n" +
        "1. Find the live family mandate and set it up with the suggested names and limit.\n" +
        "2. Create the mandate on Solana Devnet and wait until it is ready.\n" +
        "3. As the teen, invest $0.30.\n" +
        "4. As the teen, invest $0.75.\n" +
        "5. As the parent, decide on the request.\n" +
        "6. Find the proof of what happened (history, receipt)."
    )
  );
  const tasksB = [
    t("1. Trouver et configurer", "1. Find and set up"),
    t("2. Créer le mandat", "2. Create the mandate"),
    t("3. Investir 0,30 $", "3. Invest $0.30"),
    t("4. Investir 0,75 $", "4. Invest $0.75"),
    t("5. Décision du parent", "5. Parent's decision"),
    t("6. Trouver la preuve", "6. Find the proof"),
  ];
  form.addGridItem().setTitle(SUCCESS_T).setRows(tasksB).setColumns(SUCCESS).setRequired(true);
  form.addGridItem().setTitle(EASE_T).setRows(tasksB).setColumns(EASE).setRequired(true);
  form.addParagraphTextItem().setTitle(t("Qu'est-il arrivé à 0,30 $ ? Et à 0,75 $ ?", "What happened at $0.30? And at $0.75?"));
  form.addParagraphTextItem().setTitle(t("Après la décision du parent, qu'est-ce qui a changé, et qu'est-ce qui n'a pas changé ?", "After the parent's decision, what changed, and what did not?"));
  form.addScaleItem().setTitle(PROOF_T).setBounds(1, 5).setLabels(t("Pas du tout", "Not at all"), t("Beaucoup", "A lot"));
  form.addParagraphTextItem().setTitle(STUCK_T);

  // ---- Section C ----
  const pageC = form.addPageBreakItem().setTitle(t("Parcours C · Capital délégué (stratégie ou agent IA)", "Track C · Delegated capital (strategy or AI agent)")).setHelpText(
    tl(
      "Partez de la page d'accueil.\n" +
        "1. Entrer dans Delegated capital et configurer avec les valeurs proposées.\n" +
        "2. Créer le mandat sur Solana Devnet et attendre qu'il soit prêt.\n" +
        "3. En tant que stratégie, soumettre une action de 0,30 $.\n" +
        "4. Soumettre une action de 0,75 $.\n" +
        "5. En tant qu'allocateur, décider de la demande.\n" +
        "6. Trouver la preuve de ce qui s'est passé (historique, reçu).",
      "Start from the home page.\n" +
        "1. Enter Delegated capital and set it up with the suggested values.\n" +
        "2. Create the mandate on Solana Devnet and wait until it is ready.\n" +
        "3. As the strategy, submit a $0.30 action.\n" +
        "4. Submit a $0.75 action.\n" +
        "5. As the allocator, decide on the request.\n" +
        "6. Find the proof of what happened (history, receipt)."
    )
  );
  const tasksC = [
    t("1. Entrer et configurer", "1. Enter and set up"),
    t("2. Créer le mandat", "2. Create the mandate"),
    t("3. Action 0,30 $", "3. $0.30 action"),
    t("4. Action 0,75 $", "4. $0.75 action"),
    t("5. Décision de l'allocateur", "5. Allocator's decision"),
    t("6. Trouver la preuve", "6. Find the proof"),
  ];
  form.addGridItem().setTitle(SUCCESS_T).setRows(tasksC).setColumns(SUCCESS).setRequired(true);
  form.addGridItem().setTitle(EASE_T).setRows(tasksC).setColumns(EASE).setRequired(true);
  form.addParagraphTextItem().setTitle(t("Qu'est-il arrivé à 0,30 $ ? Et à 0,75 $ ?", "What happened at $0.30? And at $0.75?"));
  form.addParagraphTextItem().setTitle(t("Une stratégie ou un agent IA pourrait-il élargir sa propre limite ici ? Pourquoi ?", "Could a strategy or AI agent widen its own limit here? Why?"));
  form.addScaleItem().setTitle(PROOF_T).setBounds(1, 5).setLabels(t("Pas du tout", "Not at all"), t("Beaucoup", "A lot"));
  form.addParagraphTextItem().setTitle(STUCK_T);

  // ---- Section finale / final section ----
  const pageEnd = form.addPageBreakItem().setTitle(t("Pour finir", "To finish"));
  // Correct answers (not shown): the first choice of each of the next two questions.
  form
    .addMultipleChoiceItem()
    .setTitle(t("Pourquoi l'action la plus grosse a-t-elle eu besoin d'une approbation ?", "Why did the larger action need approval?"))
    .setChoiceValues([
      t("Elle dépassait la limite fixée", "It was above the set limit"),
      t("Le marché était fermé", "The market was closed"),
      t("Toutes les actions demandent une approbation", "Every action needs approval"),
      t("Je ne sais pas", "I don't know"),
    ])
    .setRequired(true);
  form
    .addMultipleChoiceItem()
    .setTitle(t("Après l'approbation, que devient la limite ?", "After the approval, what happens to the limit?"))
    .setChoiceValues([
      t("Inchangée", "Unchanged"),
      t("Elle augmente au montant approuvé", "It rises to the approved amount"),
      t("Elle est supprimée", "It is removed"),
      t("Je ne sais pas", "I don't know"),
    ])
    .setRequired(true);
  const AGREE = [t("Pas du tout d'accord", "Strongly disagree"), t("Tout à fait d'accord", "Strongly agree")];
  form.addScaleItem().setTitle(t("CRESCO répond à ce dont j'aurais besoin.", "CRESCO meets what I would need.")).setBounds(1, 7).setLabels(AGREE[0], AGREE[1]).setRequired(true);
  form.addScaleItem().setTitle(t("CRESCO est facile à utiliser.", "CRESCO is easy to use.")).setBounds(1, 7).setLabels(AGREE[0], AGREE[1]).setRequired(true);
  form.addParagraphTextItem().setTitle(t("Est-ce que cela résoudrait un vrai problème pour vous ou quelqu'un que vous connaissez ? Qui ?", "Would this solve a real problem for you or someone you know? Who?"));
  form.addMultipleChoiceItem().setTitle(t("Lequel vous parle le plus ?", "Which speaks to you most?")).setChoiceValues(["Family", "Delegated capital", t("Les deux", "Both"), t("Aucun", "Neither")]);
  form.addParagraphTextItem().setTitle(t("De quoi auriez-vous besoin avant de l'utiliser avec de l'argent réel ?", "What would you need before using it with real money?"));
  form.addParagraphTextItem().setTitle(t("La première chose à changer", "The first thing to change")).setRequired(true);
  form.addTextItem().setTitle(t("Temps passé (minutes)", "Time spent (minutes)"));
  form.addMultipleChoiceItem().setTitle(t("D'accord pour qu'on cite votre réponse (anonymement) ?", "OK for us to quote your answer (anonymously)?")).setChoiceValues([t("Oui", "Yes"), t("Non", "No")]).setRequired(true);
  form.addTextItem().setTitle(t("Email, seulement si vous acceptez qu'on vous recontacte (facultatif)", "Email, only if you agree to be contacted again (optional)"));

  // Branching: track choice -> its section; each track section -> final section.
  trackItem.setChoices([
    trackItem.createChoice(t("A · Application Family", "A · Family app"), pageA),
    trackItem.createChoice(t("B · Mandat famille en direct", "B · Live family mandate"), pageB),
    trackItem.createChoice(t("C · Capital délégué", "C · Delegated capital"), pageC),
  ]);
  setSectionExit_(form, pageA, pageEnd);
  setSectionExit_(form, pageB, pageEnd);

  Logger.log("Formulaire à envoyer / Form to send: " + form.getPublishedUrl());
  Logger.log("Édition / Edit: " + form.getEditUrl());
  Logger.log("Feuille des réponses / Responses sheet: " + ss.getUrl());
}

// In Google Forms, where a section goes after its last question is set on the
// NEXT page break. So the exit of section A is set on page break B, and so on.
function setSectionExit_(form, sectionPage, target) {
  const items = form.getItems(FormApp.ItemType.PAGE_BREAK).map((i) => i.asPageBreakItem());
  const idx = items.findIndex((p) => p.getId() === sectionPage.getId());
  if (idx >= 0 && idx + 1 < items.length) items[idx + 1].setGoToPage(target);
}
