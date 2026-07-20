export interface GrammarExample {
  en: string;
  de: string;
}

export interface GrammarRule {
  id: string;
  category: string;
  title: string;
  explanation: string;
  examples: GrammarExample[];
  /** Word-reorder task: the target sentence, shuffled at render time. */
  build: { sentence: string };
  /** Fill-in-the-blank: `template` contains "___" once. */
  gap: { template: string; answer: string; hint: string };
  /** Multiple choice: exactly one option is correct. */
  mc: { prompt: string; options: string[]; correctIndex: number };
  /** Tap-the-wrong-word: `wrongWord` must appear as a token in `sentence`. */
  error: { sentence: string; wrongWord: string; correctedSentence: string };
}

export const GRAMMAR_RULES: GrammarRule[] = [
  {
    id: "gr1",
    category: "Zeiten",
    title: "Present Perfect vs. Simple Past",
    explanation:
      "Use the Present Perfect (have/has + past participle) when no exact time is given or the action still matters now. Use the Simple Past for finished actions at a stated, specific past time (yesterday, in 2019, last week).",
    examples: [
      { en: "I have already finished the report.", de: "Ich habe den Bericht schon fertiggestellt." },
      { en: "She visited Paris last summer.", de: "Sie besuchte Paris letzten Sommer." },
      { en: "We have lived here since 2019.", de: "Wir wohnen seit 2019 hier." },
    ],
    build: { sentence: "I have already finished the report." },
    gap: { template: "She ___ Paris last summer.", answer: "visited", hint: "Simple Past — a specific time is stated." },
    mc: {
      prompt: "Which sentence is correct?",
      options: ["I have seen that film yesterday.", "I saw that film yesterday.", "I have saw that film yesterday."],
      correctIndex: 1,
    },
    error: {
      sentence: "She has finished the report yesterday.",
      wrongWord: "has",
      correctedSentence: "She finished the report yesterday.",
    },
  },
  {
    id: "gr2",
    category: "Zeiten",
    title: "Past Perfect",
    explanation:
      "The Past Perfect (had + past participle) describes an action that finished before another past action or time. It clarifies the order of two past events.",
    examples: [
      { en: "When I arrived, the meeting had already started.", de: "Als ich ankam, hatte die Besprechung schon begonnen." },
      { en: "She had never seen snow before that winter.", de: "Sie hatte vor diesem Winter noch nie Schnee gesehen." },
      { en: "We had finished dinner before he called.", de: "Wir hatten das Abendessen beendet, bevor er anrief." },
    ],
    build: { sentence: "When I arrived the meeting had already started." },
    gap: { template: "By the time we got there, the train ___ already left.", answer: "had", hint: "One past action finished before another." },
    mc: {
      prompt: "Which sentence correctly shows the earlier action?",
      options: ["When I arrived, the meeting already started.", "When I arrived, the meeting had already started.", "When I arrived, the meeting has already started."],
      correctIndex: 1,
    },
    error: {
      sentence: "She had never saw snow before that winter.",
      wrongWord: "saw",
      correctedSentence: "She had never seen snow before that winter.",
    },
  },
  {
    id: "gr3",
    category: "Zeiten",
    title: "Present Perfect Continuous",
    explanation:
      "Use have/has + been + -ing to emphasize the duration of an activity that started in the past and continues now, or has just stopped with visible results.",
    examples: [
      { en: "I have been working on this project for three hours.", de: "Ich arbeite seit drei Stunden an diesem Projekt." },
      { en: "It has been raining all morning.", de: "Es regnet den ganzen Morgen schon." },
      { en: "She has been studying English since 2020.", de: "Sie lernt seit 2020 Englisch." },
    ],
    build: { sentence: "I have been working on this project for three hours." },
    gap: { template: "It ___ been raining all morning.", answer: "has", hint: "Present Perfect Continuous: has/have + been + -ing." },
    mc: {
      prompt: "Which sentence is correct?",
      options: ["She has been studying English since 2020.", "She has studying English since 2020.", "She is been studying English since 2020."],
      correctIndex: 0,
    },
    error: {
      sentence: "I have been work on this project for three hours.",
      wrongWord: "work",
      correctedSentence: "I have been working on this project for three hours.",
    },
  },
  {
    id: "gr4",
    category: "Zeiten",
    title: "Future: will vs. going to",
    explanation:
      "Use 'going to' for plans already decided or predictions based on present evidence. Use 'will' for spontaneous decisions made at the moment of speaking, promises, and offers.",
    examples: [
      { en: "I'm going to start a new job next month.", de: "Ich fange nächsten Monat einen neuen Job an." },
      { en: "Look at those clouds — it's going to rain.", de: "Sieh dir die Wolken an — es wird gleich regnen." },
      { en: "I'll help you carry that box.", de: "Ich helfe dir, die Kiste zu tragen." },
    ],
    build: { sentence: "I'm going to start a new job next month." },
    gap: { template: "Look at those clouds — it's ___ to rain.", answer: "going", hint: "Prediction based on present evidence." },
    mc: {
      prompt: "Which sentence is a spontaneous offer?",
      options: ["I'm going to help you carry that box.", "I'll help you carry that box.", "I help you carry that box."],
      correctIndex: 1,
    },
    error: {
      sentence: "I already decided — I will start a new job next month.",
      wrongWord: "will",
      correctedSentence: "I already decided — I'm going to start a new job next month.",
    },
  },
  {
    id: "gr5",
    category: "Konditionalsätze",
    title: "Zero Conditional",
    explanation:
      "if + Simple Present, ... Simple Present. Describes general truths and things that always happen under a certain condition — facts, not hypotheses.",
    examples: [
      { en: "If you heat water to 100°C, it boils.", de: "Wenn man Wasser auf 100°C erhitzt, kocht es." },
      { en: "If I drink coffee late, I can't sleep.", de: "Wenn ich spät Kaffee trinke, kann ich nicht schlafen." },
      { en: "Plants die if they don't get water.", de: "Pflanzen sterben, wenn sie kein Wasser bekommen." },
    ],
    build: { sentence: "If you heat water to 100 degrees it boils." },
    gap: { template: "If you heat water to 100°C, it ___.", answer: "boils", hint: "General truth: Simple Present in both parts." },
    mc: {
      prompt: "Which sentence states a general truth correctly?",
      options: ["If you heat water to 100°C, it will boil.", "If you heat water to 100°C, it boils.", "If you heated water to 100°C, it boils."],
      correctIndex: 1,
    },
    error: {
      sentence: "If I drink coffee late, I won't sleep well tonight and every night.",
      wrongWord: "won't",
      correctedSentence: "If I drink coffee late, I don't sleep well.",
    },
  },
  {
    id: "gr6",
    category: "Konditionalsätze",
    title: "First Conditional",
    explanation:
      "if + Simple Present, ... will + base verb. Describes a real, likely future situation and its probable result.",
    examples: [
      { en: "If it rains tomorrow, we will stay home.", de: "Wenn es morgen regnet, bleiben wir zu Hause." },
      { en: "If she studies hard, she will pass the exam.", de: "Wenn sie hart lernt, wird sie die Prüfung bestehen." },
      { en: "We'll be late if we don't leave now.", de: "Wir kommen zu spät, wenn wir nicht jetzt losgehen." },
    ],
    build: { sentence: "If it rains tomorrow we will stay home." },
    gap: { template: "If she studies hard, she ___ pass the exam.", answer: "will", hint: "First Conditional: will + base verb in the main clause." },
    mc: {
      prompt: "Which sentence correctly describes a likely future result?",
      options: ["If it rains tomorrow, we stayed home.", "If it rained tomorrow, we will stay home.", "If it rains tomorrow, we will stay home."],
      correctIndex: 2,
    },
    error: {
      sentence: "If it rains tomorrow, we stay home for sure.",
      wrongWord: "stay",
      correctedSentence: "If it rains tomorrow, we will stay home for sure.",
    },
  },
  {
    id: "gr7",
    category: "Konditionalsätze",
    title: "Second Conditional",
    explanation:
      "if + Simple Past, ... would + base verb. Describes an unreal or unlikely present/future situation — hypothetical, not real.",
    examples: [
      { en: "If I won the lottery, I would travel the world.", de: "Wenn ich im Lotto gewinnen würde, würde ich um die Welt reisen." },
      { en: "If I were you, I would apologize.", de: "Wenn ich du wäre, würde ich mich entschuldigen." },
      { en: "She would help if she had more time.", de: "Sie würde helfen, wenn sie mehr Zeit hätte." },
    ],
    build: { sentence: "If I won the lottery I would travel the world." },
    gap: { template: "If I ___ you, I would apologize.", answer: "were", hint: "Second Conditional uses 'were' for all persons with 'be'." },
    mc: {
      prompt: "Which sentence describes a hypothetical situation correctly?",
      options: ["If I win the lottery, I would travel the world.", "If I won the lottery, I would travel the world.", "If I won the lottery, I will travel the world."],
      correctIndex: 1,
    },
    error: {
      sentence: "If I was you, I would apologize immediately.",
      wrongWord: "was",
      correctedSentence: "If I were you, I would apologize immediately.",
    },
  },
  {
    id: "gr8",
    category: "Konditionalsätze",
    title: "Third Conditional",
    explanation:
      "if + Past Perfect, ... would have + past participle. Describes an unreal situation in the past — something that didn't happen, and its imagined result.",
    examples: [
      { en: "If I had known, I would have told you.", de: "Wenn ich es gewusst hätte, hätte ich es dir gesagt." },
      { en: "She would have passed if she had studied more.", de: "Sie hätte bestanden, wenn sie mehr gelernt hätte." },
      { en: "We wouldn't have missed the train if we had left earlier.", de: "Wir hätten den Zug nicht verpasst, wenn wir früher losgegangen wären." },
    ],
    build: { sentence: "If I had known I would have told you." },
    gap: { template: "She would have passed if she ___ studied more.", answer: "had", hint: "Third Conditional: Past Perfect in the if-clause." },
    mc: {
      prompt: "Which sentence correctly talks about an unreal past?",
      options: ["If I knew, I would have told you.", "If I had known, I would tell you.", "If I had known, I would have told you."],
      correctIndex: 2,
    },
    error: {
      sentence: "If I had known, I would tell you immediately.",
      wrongWord: "tell",
      correctedSentence: "If I had known, I would have told you immediately.",
    },
  },
  {
    id: "gr9",
    category: "Passiv",
    title: "Passive Voice (Present/Past)",
    explanation:
      "Form the passive with a form of 'be' + past participle. Use it when the action matters more than who does it, or the doer is unknown/unimportant.",
    examples: [
      { en: "The report is written every month.", de: "Der Bericht wird jeden Monat geschrieben." },
      { en: "The building was constructed in 1990.", de: "Das Gebäude wurde 1990 errichtet." },
      { en: "Millions of copies were sold last year.", de: "Letztes Jahr wurden Millionen Exemplare verkauft." },
    ],
    build: { sentence: "The building was constructed in 1990." },
    gap: { template: "Millions of copies ___ sold last year.", answer: "were", hint: "Past passive, plural subject: were + past participle." },
    mc: {
      prompt: "Which sentence is in the correct passive form?",
      options: ["The report writes every month.", "The report is written every month.", "The report is writing every month."],
      correctIndex: 1,
    },
    error: {
      sentence: "The building was construct in 1990.",
      wrongWord: "construct",
      correctedSentence: "The building was constructed in 1990.",
    },
  },
  {
    id: "gr10",
    category: "Passiv",
    title: "Passive Voice with Modal Verbs",
    explanation: "Modal + be + past participle. Common with must, can, should, will to express rules, ability, or obligation in the passive.",
    examples: [
      { en: "This form must be signed by both parties.", de: "Dieses Formular muss von beiden Parteien unterschrieben werden." },
      { en: "The results will be announced tomorrow.", de: "Die Ergebnisse werden morgen bekannt gegeben." },
      { en: "The issue can be fixed quickly.", de: "Das Problem kann schnell behoben werden." },
    ],
    build: { sentence: "This form must be signed by both parties." },
    gap: { template: "The results will ___ announced tomorrow.", answer: "be", hint: "Modal + be + past participle." },
    mc: {
      prompt: "Which sentence uses the modal passive correctly?",
      options: ["The issue can fixed quickly.", "The issue can be fixed quickly.", "The issue can be fix quickly."],
      correctIndex: 1,
    },
    error: {
      sentence: "This form must signed by both parties.",
      wrongWord: "signed",
      correctedSentence: "This form must be signed by both parties.",
    },
  },
  {
    id: "gr11",
    category: "Reported Speech",
    title: "Reported Speech: Statements",
    explanation:
      "When reporting statements, tenses usually shift one step back (present → past, past → past perfect) and pronouns/time words adapt to the new perspective.",
    examples: [
      { en: "She said she was tired.", de: "Sie sagte, sie sei müde." },
      { en: "He told me he had finished the work.", de: "Er sagte mir, er habe die Arbeit beendet." },
      { en: "They said they would come later.", de: "Sie sagten, sie würden später kommen." },
    ],
    build: { sentence: "She said she was tired." },
    gap: { template: "He told me he ___ finished the work.", answer: "had", hint: "Past → Past Perfect when reporting." },
    mc: {
      prompt: "Original: 'I am tired.' Which report is correct?",
      options: ["She said she is tired.", "She said she was tired.", "She said she tired."],
      correctIndex: 1,
    },
    error: {
      sentence: "They said they will come later.",
      wrongWord: "will",
      correctedSentence: "They said they would come later.",
    },
  },
  {
    id: "gr12",
    category: "Reported Speech",
    title: "Reported Speech: Questions",
    explanation:
      "Reported questions use normal word order (no auxiliary inversion) and no question mark. Use 'if/whether' for yes/no questions, and the question word for wh-questions.",
    examples: [
      { en: "She asked if I was coming.", de: "Sie fragte, ob ich käme." },
      { en: "He asked where I lived.", de: "Er fragte, wo ich wohne." },
      { en: "They asked what time it was.", de: "Sie fragten, wie spät es sei." },
    ],
    build: { sentence: "She asked if I was coming." },
    gap: { template: "He asked where I ___.", answer: "lived", hint: "Statement word order, tense shifted back." },
    mc: {
      prompt: "Original: 'Where do you live?' Which report is correct?",
      options: ["He asked where did I live.", "He asked where I lived.", "He asked where I live."],
      correctIndex: 1,
    },
    error: {
      sentence: "They asked what time was it.",
      wrongWord: "was",
      correctedSentence: "They asked what time it was.",
    },
  },
  {
    id: "gr13",
    category: "Relativsätze",
    title: "Defining Relative Clauses",
    explanation:
      "Defining relative clauses (who/which/that) give essential information — without them the sentence loses its meaning. No commas are used.",
    examples: [
      { en: "The man who called earlier is my boss.", de: "Der Mann, der vorhin anrief, ist mein Chef." },
      { en: "This is the book that I told you about.", de: "Das ist das Buch, von dem ich dir erzählt habe." },
      { en: "I need a laptop that has a long battery life.", de: "Ich brauche einen Laptop, der eine lange Akkulaufzeit hat." },
    ],
    build: { sentence: "The man who called earlier is my boss." },
    gap: { template: "This is the book ___ I told you about.", answer: "that", hint: "Defining relative clause for a thing." },
    mc: {
      prompt: "Which sentence correctly identifies a specific person?",
      options: ["The man which called earlier is my boss.", "The man who called earlier is my boss.", "The man, who called earlier, is my boss."],
      correctIndex: 1,
    },
    error: {
      sentence: "I need a laptop who has a long battery life.",
      wrongWord: "who",
      correctedSentence: "I need a laptop that has a long battery life.",
    },
  },
  {
    id: "gr14",
    category: "Relativsätze",
    title: "Non-Defining Relative Clauses",
    explanation:
      "Non-defining relative clauses add extra, non-essential information, set off by commas. 'That' cannot be used here — only who/which.",
    examples: [
      { en: "My brother, who lives in Berlin, is visiting us.", de: "Mein Bruder, der in Berlin wohnt, besucht uns." },
      { en: "The report, which took weeks to write, was well received.", de: "Der Bericht, der Wochen zum Schreiben brauchte, kam gut an." },
      { en: "Paris, which I visited last year, is beautiful in spring.", de: "Paris, das ich letztes Jahr besuchte, ist im Frühling wunderschön." },
    ],
    build: { sentence: "My brother who lives in Berlin is visiting us." },
    gap: { template: "The report, ___ took weeks to write, was well received.", answer: "which", hint: "Non-defining clause, extra info, set off by commas." },
    mc: {
      prompt: "Which sentence correctly adds extra, non-essential info?",
      options: ["My brother, that lives in Berlin, is visiting us.", "My brother, who lives in Berlin, is visiting us.", "My brother who lives in Berlin, is visiting us."],
      correctIndex: 1,
    },
    error: {
      sentence: "Paris, that I visited last year, is beautiful in spring.",
      wrongWord: "that",
      correctedSentence: "Paris, which I visited last year, is beautiful in spring.",
    },
  },
  {
    id: "gr15",
    category: "Modalverben",
    title: "Modals of Deduction",
    explanation:
      "Use 'must' for a confident positive conclusion, 'can't' for a confident negative conclusion, and 'might/could/may' for an uncertain guess, based on evidence.",
    examples: [
      { en: "He isn't answering — he must be asleep.", de: "Er geht nicht ran — er muss schlafen." },
      { en: "She can't be at work, her car is here.", de: "Sie kann nicht bei der Arbeit sein, ihr Auto steht hier." },
      { en: "It might rain later, the sky looks grey.", de: "Es könnte später regnen, der Himmel sieht grau aus." },
    ],
    build: { sentence: "He isn't answering he must be asleep." },
    gap: { template: "She ___ be at work, her car is here.", answer: "can't", hint: "Confident negative conclusion from evidence." },
    mc: {
      prompt: "Which sentence expresses an uncertain guess?",
      options: ["It must rain later.", "It might rain later.", "It can't rain later."],
      correctIndex: 1,
    },
    error: {
      sentence: "He isn't answering — he mustn't be asleep.",
      wrongWord: "mustn't",
      correctedSentence: "He isn't answering — he must be asleep.",
    },
  },
  {
    id: "gr16",
    category: "Modalverben",
    title: "Modals of Obligation",
    explanation:
      "'Must' expresses a personal/strong obligation from the speaker; 'have to' expresses an external rule or necessity; 'should' expresses advice, not a strict obligation.",
    examples: [
      { en: "I must call my mother tonight.", de: "Ich muss heute Abend meine Mutter anrufen." },
      { en: "You have to wear a helmet on this site.", de: "Man muss auf diesem Gelände einen Helm tragen." },
      { en: "You should see a doctor about that cough.", de: "Du solltest wegen des Hustens einen Arzt aufsuchen." },
    ],
    build: { sentence: "You have to wear a helmet on this site." },
    gap: { template: "You ___ see a doctor about that cough.", answer: "should", hint: "Advice, not a strict rule." },
    mc: {
      prompt: "Which sentence expresses an external rule?",
      options: ["You must wear a helmet, it's my personal rule.", "You have to wear a helmet on this site.", "You should wear a helmet."],
      correctIndex: 1,
    },
    error: {
      sentence: "You should wear a helmet, it's the law here.",
      wrongWord: "should",
      correctedSentence: "You have to wear a helmet, it's the law here.",
    },
  },
  {
    id: "gr17",
    category: "Verbmuster",
    title: "Gerund vs. Infinitive",
    explanation:
      "Some verbs are followed by -ing (enjoy, avoid, suggest, finish), others by 'to' + base verb (want, decide, promise, plan). There's no shortcut rule — it depends on the verb.",
    examples: [
      { en: "I enjoy reading before bed.", de: "Ich lese gerne vor dem Schlafengehen." },
      { en: "She decided to leave early.", de: "Sie entschied sich, früh zu gehen." },
      { en: "We avoid eating late at night.", de: "Wir vermeiden es, spät nachts zu essen." },
    ],
    build: { sentence: "She decided to leave early." },
    gap: { template: "We avoid ___ late at night.", answer: "eating", hint: "'Avoid' is followed by the gerund (-ing)." },
    mc: {
      prompt: "Which sentence uses the correct verb pattern?",
      options: ["I enjoy to read before bed.", "I enjoy reading before bed.", "I enjoy read before bed."],
      correctIndex: 1,
    },
    error: {
      sentence: "She decided leaving early.",
      wrongWord: "leaving",
      correctedSentence: "She decided to leave early.",
    },
  },
  {
    id: "gr18",
    category: "Wortstellung",
    title: "Adjective Order",
    explanation:
      "When several adjectives come before a noun, English follows a typical order: opinion, size, age, shape, color, origin, material, purpose + noun.",
    examples: [
      { en: "a beautiful small old wooden table", de: "ein schöner kleiner alter Holztisch" },
      { en: "a large round red rug", de: "ein großer runder roter Teppich" },
      { en: "an interesting new Italian restaurant", de: "ein interessantes neues italienisches Restaurant" },
    ],
    build: { sentence: "a beautiful small old wooden table" },
    gap: { template: "a large round ___ rug", answer: "red", hint: "Order: opinion, size, age, shape, color, origin, material." },
    mc: {
      prompt: "Which adjective order is correct?",
      options: ["a wooden old small beautiful table", "a beautiful small old wooden table", "an old beautiful wooden small table"],
      correctIndex: 1,
    },
    error: {
      sentence: "an Italian interesting new restaurant",
      wrongWord: "Italian",
      correctedSentence: "an interesting new Italian restaurant",
    },
  },
  {
    id: "gr19",
    category: "Wortstellung",
    title: "Question Word Order",
    explanation:
      "In direct questions, the auxiliary or modal verb comes before the subject (subject-auxiliary inversion): Question word + auxiliary + subject + verb.",
    examples: [
      { en: "Where do you live?", de: "Wo wohnst du?" },
      { en: "What is she doing?", de: "Was macht sie gerade?" },
      { en: "Why haven't you called me?", de: "Warum hast du mich nicht angerufen?" },
    ],
    build: { sentence: "Where do you live" },
    gap: { template: "What ___ she doing?", answer: "is", hint: "Auxiliary before the subject in questions." },
    mc: {
      prompt: "Which question is correctly formed?",
      options: ["Why you haven't called me?", "Why haven't you called me?", "Why you have not called me?"],
      correctIndex: 1,
    },
    error: {
      sentence: "Where you do live?",
      wrongWord: "you",
      correctedSentence: "Where do you live?",
    },
  },
  {
    id: "gr20",
    category: "Artikel & Nomen",
    title: "Articles: a / an / the / zero",
    explanation:
      "Use 'a/an' for a non-specific singular noun mentioned for the first time, 'the' for something specific/already known, and no article for general plural or uncountable nouns.",
    examples: [
      { en: "I saw a dog in the park.", de: "Ich sah einen Hund im Park." },
      { en: "The dog I saw was brown.", de: "Der Hund, den ich sah, war braun." },
      { en: "Dogs are loyal animals.", de: "Hunde sind treue Tiere." },
    ],
    build: { sentence: "I saw a dog in the park." },
    gap: { template: "___ dog I saw was brown.", answer: "The", hint: "Specific, already-mentioned noun." },
    mc: {
      prompt: "Which sentence uses articles correctly?",
      options: ["The dogs are loyal animals.", "Dogs are loyal animals.", "A dogs are loyal animals."],
      correctIndex: 1,
    },
    error: {
      sentence: "I saw the dog in the park for the first time.",
      wrongWord: "the",
      correctedSentence: "I saw a dog in the park for the first time.",
    },
  },
  {
    id: "gr21",
    category: "Präpositionen",
    title: "Prepositions of Time: in / on / at",
    explanation: "Use 'at' for clock times and specific points, 'on' for days and dates, and 'in' for months, years, and longer periods.",
    examples: [
      { en: "The meeting starts at 9 a.m.", de: "Das Meeting beginnt um 9 Uhr." },
      { en: "We're meeting on Friday.", de: "Wir treffen uns am Freitag." },
      { en: "She was born in 1995.", de: "Sie wurde 1995 geboren." },
    ],
    build: { sentence: "The meeting starts at 9 a.m." },
    gap: { template: "We're meeting ___ Friday.", answer: "on", hint: "Days of the week take 'on'." },
    mc: {
      prompt: "Which sentence uses the correct preposition?",
      options: ["She was born on 1995.", "She was born in 1995.", "She was born at 1995."],
      correctIndex: 1,
    },
    error: {
      sentence: "The meeting starts in 9 a.m.",
      wrongWord: "in",
      correctedSentence: "The meeting starts at 9 a.m.",
    },
  },
  {
    id: "gr22",
    category: "Vergleiche",
    title: "Comparatives and Superlatives",
    explanation:
      "Short adjectives add -er/-est (fast → faster → fastest). Longer adjectives use more/most (expensive → more expensive → most expensive). Watch out for irregular forms like good → better → best.",
    examples: [
      { en: "This car is faster than that one.", de: "Dieses Auto ist schneller als jenes." },
      { en: "It's the most expensive option.", de: "Es ist die teuerste Option." },
      { en: "Her English is better than mine.", de: "Ihr Englisch ist besser als meins." },
    ],
    build: { sentence: "This car is faster than that one." },
    gap: { template: "It's the ___ expensive option.", answer: "most", hint: "Long adjective → 'most' for the superlative." },
    mc: {
      prompt: "Which sentence uses the comparative correctly?",
      options: ["Her English is gooder than mine.", "Her English is better than mine.", "Her English is more good than mine."],
      correctIndex: 1,
    },
    error: {
      sentence: "This car is more fast than that one.",
      wrongWord: "more",
      correctedSentence: "This car is faster than that one.",
    },
  },
  {
    id: "gr23",
    category: "Zeiten",
    title: "Used to vs. Simple Past",
    explanation:
      "'Used to' + base verb describes past habits or states that are no longer true, emphasizing the contrast with now. The Simple Past just states a fact happened, without that contrast.",
    examples: [
      { en: "I used to play football every weekend.", de: "Ich habe früher jedes Wochenende Fußball gespielt." },
      { en: "She used to live in Munich.", de: "Sie hat früher in München gelebt." },
      { en: "We played chess yesterday.", de: "Wir spielten gestern Schach." },
    ],
    build: { sentence: "I used to play football every weekend." },
    gap: { template: "She ___ to live in Munich.", answer: "used", hint: "Past habit, no longer true — 'used to'." },
    mc: {
      prompt: "Which sentence best emphasizes a past habit that has changed?",
      options: ["I played football every weekend last year.", "I used to play football every weekend.", "I use to play football every weekend."],
      correctIndex: 1,
    },
    error: {
      sentence: "She use to live in Munich.",
      wrongWord: "use",
      correctedSentence: "She used to live in Munich.",
    },
  },
  {
    id: "gr24",
    category: "Artikel & Nomen",
    title: "Countable / Uncountable Nouns",
    explanation:
      "Countable nouns have plurals and use a/an, many, few (a book, two books). Uncountable nouns have no plural and use much, little, some (water, advice, information).",
    examples: [
      { en: "I need some information about the course.", de: "Ich brauche ein paar Informationen zum Kurs." },
      { en: "There are too many books on this shelf.", de: "Es sind zu viele Bücher in diesem Regal." },
      { en: "We don't have much time left.", de: "Wir haben nicht mehr viel Zeit übrig." },
    ],
    build: { sentence: "We don't have much time left." },
    gap: { template: "There are too ___ books on this shelf.", answer: "many", hint: "Countable plural noun → 'many'." },
    mc: {
      prompt: "Which sentence uses the quantifier correctly?",
      options: ["I need some informations about the course.", "I need some information about the course.", "I need many information about the course."],
      correctIndex: 1,
    },
    error: {
      sentence: "We don't have much advices for you.",
      wrongWord: "advices",
      correctedSentence: "We don't have much advice for you.",
    },
  },
  {
    id: "gr25",
    category: "Verbmuster",
    title: "Separable Phrasal Verbs",
    explanation:
      "Separable phrasal verbs (turn off, pick up, fill out) can split around a noun object, but with a pronoun object (it, them) the particle MUST come after the pronoun.",
    examples: [
      { en: "Please turn off the light. / Please turn the light off.", de: "Bitte mach das Licht aus." },
      { en: "Turn it off.", de: "Mach es aus." },
      { en: "Can you fill out this form? / Can you fill this form out?", de: "Kannst du dieses Formular ausfüllen?" },
    ],
    build: { sentence: "Please turn off the light." },
    gap: { template: "Can you fill ___ this form?", answer: "out", hint: "Separable phrasal verb: fill out." },
    mc: {
      prompt: "Which sentence correctly uses a pronoun with a phrasal verb?",
      options: ["Turn off it.", "Turn it off.", "Turn it."],
      correctIndex: 1,
    },
    error: {
      sentence: "Please turn off it before you leave.",
      wrongWord: "off",
      correctedSentence: "Please turn it off before you leave.",
    },
  },
];

export const GRAMMAR_RULES_BY_ID: Record<string, GrammarRule> = {};
GRAMMAR_RULES.forEach((r) => (GRAMMAR_RULES_BY_ID[r.id] = r));
