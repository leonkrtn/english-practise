export interface GrammarExample {
  en: string;
  de: string;
}

/** Word-reorder task: the target sentence, shuffled at render time. */
export interface BuildVariant {
  sentence: string;
}

/** Fill-in-the-blank: `template` contains "___" once. */
export interface GapVariant {
  template: string;
  answer: string;
  hint: string;
}

/** Multiple choice: exactly one option is correct. */
export interface McVariant {
  prompt: string;
  options: string[];
  correctIndex: number;
}

/** Tap-the-wrong-word: `wrongWord` must appear as a token in `sentence`. */
export interface ErrorVariant {
  sentence: string;
  wrongWord: string;
  correctedSentence: string;
}

/** Cloze multiple choice: same idea as gap, but recognition (pick the right form) instead of typing. */
export interface ConjugateVariant {
  template: string;
  options: string[];
  correctIndex: number;
  hint: string;
}

/** DE → EN typed production: translate the German sentence, applying this rule. */
export interface TranslateVariant {
  de: string;
  en: string;
}

/** Typed sentence rewrite: apply `prompt`'s instruction to `source`, producing `answer`. */
export interface TransformVariant {
  prompt: string;
  source: string;
  answer: string;
}

/** Two similar sentences — pick the one that actually fits the described situation. */
export interface SituationVariant {
  situation: string;
  optionA: string;
  optionB: string;
  correctIndex: 0 | 1;
}

export interface GrammarRule {
  id: string;
  category: string;
  title: string;
  explanation: string;
  examples: GrammarExample[];
  build: BuildVariant[];
  gap: GapVariant[];
  mc: McVariant[];
  error: ErrorVariant[];
  conjugate: ConjugateVariant[];
  translate: TranslateVariant[];
  transform: TransformVariant[];
  situation: SituationVariant[];
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
    build: [
      { sentence: "I have already finished the report." },
      { sentence: "She visited Paris last summer." },
      { sentence: "We have lived here since 2019." },
    ],
    gap: [
      { template: "She ___ Paris last summer.", answer: "visited", hint: "Simple Past — a specific time is stated." },
      { template: "We ___ lived here since 2019.", answer: "have", hint: "Present Perfect — the state continues from the past to now." },
    ],
    mc: [
      {
        prompt: "Which sentence is correct?",
        options: ["I have seen that film yesterday.", "I saw that film yesterday.", "I have saw that film yesterday."],
        correctIndex: 1,
      },
      {
        prompt: "Which sentence correctly uses the Present Perfect?",
        options: ["We lived here since 2019.", "We have lived here since 2019.", "We are living here since 2019."],
        correctIndex: 1,
      },
    ],
    error: [
      { sentence: "She has finished the report yesterday.", wrongWord: "has", correctedSentence: "She finished the report yesterday." },
      { sentence: "I have finished the report last week.", wrongWord: "have", correctedSentence: "I finished the report last week." },
    ],
    conjugate: [
      { template: "She ___ Paris last summer.", options: ["has visited", "visited", "was visiting"], correctIndex: 1, hint: "Specific past time → Simple Past." },
      { template: "We ___ here since 2019.", options: ["lived", "have lived", "are living"], correctIndex: 1, hint: "'since' + unfinished time period → Present Perfect." },
    ],
    translate: [
      { de: "Ich habe den Bericht schon fertiggestellt.", en: "I have already finished the report." },
      { de: "Sie besuchte Paris letzten Sommer.", en: "She visited Paris last summer." },
      { de: "Wir wohnen seit 2019 hier.", en: "We have lived here since 2019." },
    ],
    transform: [
      {
        prompt: "Rewrite with a specific past time (yesterday) instead of the Present Perfect.",
        source: "I have finished the report.",
        answer: "I finished the report yesterday.",
      },
    ],
    situation: [
      {
        situation: "You want to say an action happened at an unspecified time and is still relevant now.",
        optionA: "I have already finished the report.",
        optionB: "I finished the report yesterday.",
        correctIndex: 0,
      },
      {
        situation: "You are stating exactly when something happened, at a specific past time.",
        optionA: "She has visited Paris last summer.",
        optionB: "She visited Paris last summer.",
        correctIndex: 1,
      },
    ],
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
    build: [
      { sentence: "When I arrived the meeting had already started." },
      { sentence: "She had never seen snow before that winter." },
      { sentence: "We had finished dinner before he called." },
    ],
    gap: [
      { template: "By the time we got there, the train ___ already left.", answer: "had", hint: "One past action finished before another." },
      { template: "We ___ finished dinner before he called.", answer: "had", hint: "Dinner ended before the call — the earlier of two past events." },
    ],
    mc: [
      {
        prompt: "Which sentence correctly shows the earlier action?",
        options: [
          "When I arrived, the meeting already started.",
          "When I arrived, the meeting had already started.",
          "When I arrived, the meeting has already started.",
        ],
        correctIndex: 1,
      },
      {
        prompt: "Which sentence is correct?",
        options: ["She never saw snow before that winter.", "She has never seen snow before that winter.", "She had never seen snow before that winter."],
        correctIndex: 2,
      },
    ],
    error: [
      { sentence: "She had never saw snow before that winter.", wrongWord: "saw", correctedSentence: "She had never seen snow before that winter." },
      {
        sentence: "We had finish dinner before he called.",
        wrongWord: "finish",
        correctedSentence: "We had finished dinner before he called.",
      },
    ],
    conjugate: [
      { template: "By the time we got there, the train ___ already left.", options: ["has", "had", "was"], correctIndex: 1, hint: "The train left before we arrived — the earlier past event." },
      { template: "She ___ never seen snow before that winter.", options: ["has", "had", "did"], correctIndex: 1, hint: "Past Perfect: had + past participle." },
    ],
    translate: [
      { de: "Als ich ankam, hatte die Besprechung schon begonnen.", en: "When I arrived, the meeting had already started." },
      { de: "Sie hatte vor diesem Winter noch nie Schnee gesehen.", en: "She had never seen snow before that winter." },
      { de: "Wir hatten das Abendessen beendet, bevor er anrief.", en: "We had finished dinner before he called." },
    ],
    transform: [
      {
        prompt: "Combine into one sentence: the first action must be shown as happening earlier, with the Past Perfect.",
        source: "The train left. We arrived five minutes later.",
        answer: "The train had left before we arrived.",
      },
    ],
    situation: [
      {
        situation: "You are describing two past events and need to make clear which one happened first.",
        optionA: "The meeting started before I arrived.",
        optionB: "The meeting had already started when I arrived.",
        correctIndex: 1,
      },
      {
        situation: "You're simply listing two past facts, with no need to show which came first.",
        optionA: "She visited Rome and she visited Athens.",
        optionB: "She had visited Rome before she visited Athens.",
        correctIndex: 0,
      },
    ],
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
    build: [
      { sentence: "I have been working on this project for three hours." },
      { sentence: "It has been raining all morning." },
      { sentence: "She has been studying English since 2020." },
    ],
    gap: [
      { template: "It ___ been raining all morning.", answer: "has", hint: "Present Perfect Continuous: has/have + been + -ing." },
      { template: "She has been ___ English since 2020.", answer: "studying", hint: "has been + verb-ing." },
    ],
    mc: [
      {
        prompt: "Which sentence is correct?",
        options: ["She has been studying English since 2020.", "She has studying English since 2020.", "She is been studying English since 2020."],
        correctIndex: 0,
      },
      {
        prompt: "Which sentence best emphasizes the duration of an ongoing activity?",
        options: ["I worked on this project for three hours.", "I have been working on this project for three hours.", "I have worked on this project."],
        correctIndex: 1,
      },
    ],
    error: [
      { sentence: "I have been work on this project for three hours.", wrongWord: "work", correctedSentence: "I have been working on this project for three hours." },
      { sentence: "It have been raining all morning.", wrongWord: "have", correctedSentence: "It has been raining all morning." },
    ],
    conjugate: [
      { template: "It ___ been raining all morning.", options: ["has", "have", "is"], correctIndex: 0, hint: "'It' is singular → has been." },
      { template: "I have been ___ on this project for three hours.", options: ["work", "worked", "working"], correctIndex: 2, hint: "have been + -ing." },
    ],
    translate: [
      { de: "Ich arbeite seit drei Stunden an diesem Projekt.", en: "I have been working on this project for three hours." },
      { de: "Es regnet den ganzen Morgen schon.", en: "It has been raining all morning." },
      { de: "Sie lernt seit 2020 Englisch.", en: "She has been studying English since 2020." },
    ],
    transform: [
      {
        prompt: "Rewrite to emphasize that the activity is still ongoing right now, using the Present Perfect Continuous.",
        source: "I worked on this project for three hours today.",
        answer: "I have been working on this project for three hours.",
      },
    ],
    situation: [
      {
        situation: "You want to emphasize how long an activity has been going on, still happening now.",
        optionA: "I have been working on this project for three hours.",
        optionB: "I worked on this project for three hours.",
        correctIndex: 0,
      },
      {
        situation: "You just want to state a completed, finished fact about the past — duration doesn't matter.",
        optionA: "We have been living in Munich for two years.",
        optionB: "We lived in Munich for two years.",
        correctIndex: 1,
      },
    ],
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
    build: [
      { sentence: "I'm going to start a new job next month." },
      { sentence: "Look at those clouds it's going to rain." },
      { sentence: "I'll help you carry that box." },
    ],
    gap: [
      { template: "Look at those clouds — it's ___ to rain.", answer: "going", hint: "Prediction based on present evidence." },
      { template: "I ___ help you carry that box.", answer: "'ll", hint: "Spontaneous offer decided right now." },
    ],
    mc: [
      {
        prompt: "Which sentence is a spontaneous offer?",
        options: ["I'm going to help you carry that box.", "I'll help you carry that box.", "I help you carry that box."],
        correctIndex: 1,
      },
      {
        prompt: "Which sentence expresses an already-decided plan?",
        options: ["I'll start a new job next month.", "I'm going to start a new job next month.", "I start a new job next month."],
        correctIndex: 1,
      },
    ],
    error: [
      {
        sentence: "I already decided — I will start a new job next month.",
        wrongWord: "will",
        correctedSentence: "I already decided — I'm going to start a new job next month.",
      },
      {
        sentence: "The phone is ringing, I'm going to answer it.",
        wrongWord: "going",
        correctedSentence: "The phone is ringing, I'll answer it.",
      },
    ],
    conjugate: [
      { template: "Look at those clouds — it's ___ rain.", options: ["will", "going to", "goes to"], correctIndex: 1, hint: "Evidence right now (the clouds) → going to." },
      { template: "The phone is ringing — I ___ answer it.", options: ["'m going to", "'ll", "am"], correctIndex: 1, hint: "Decided at the moment of speaking → will." },
    ],
    translate: [
      { de: "Ich fange nächsten Monat einen neuen Job an.", en: "I'm going to start a new job next month." },
      { de: "Sieh dir die Wolken an — es wird gleich regnen.", en: "Look at those clouds — it's going to rain." },
      { de: "Ich helfe dir, die Kiste zu tragen.", en: "I'll help you carry that box." },
    ],
    transform: [
      {
        prompt: "Rewrite as a spontaneous decision made right now, using 'will'.",
        source: "I'm going to open the window, I already decided.",
        answer: "I'll open the window.",
      },
    ],
    situation: [
      {
        situation: "You see dark clouds right now and predict rain based on that evidence.",
        optionA: "It will rain.",
        optionB: "It's going to rain.",
        correctIndex: 1,
      },
      {
        situation: "Someone's bag is heavy and you offer to help at that exact moment.",
        optionA: "I'll carry that for you.",
        optionB: "I'm going to carry that for you.",
        correctIndex: 0,
      },
    ],
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
    build: [
      { sentence: "If you heat water to 100 degrees it boils." },
      { sentence: "If I drink coffee late I can't sleep." },
      { sentence: "Plants die if they don't get water." },
    ],
    gap: [
      { template: "If you heat water to 100°C, it ___.", answer: "boils", hint: "General truth: Simple Present in both parts." },
      { template: "Plants ___ if they don't get water.", answer: "die", hint: "General truth — always true, not a one-off event." },
    ],
    mc: [
      {
        prompt: "Which sentence states a general truth correctly?",
        options: ["If you heat water to 100°C, it will boil.", "If you heat water to 100°C, it boils.", "If you heated water to 100°C, it boils."],
        correctIndex: 1,
      },
      {
        prompt: "Which sentence correctly states a general fact?",
        options: ["Plants die if they don't get water.", "Plants will die if they don't get water.", "Plants died if they didn't get water."],
        correctIndex: 0,
      },
    ],
    error: [
      {
        sentence: "If I drink coffee late, I won't sleep well tonight and every night.",
        wrongWord: "won't",
        correctedSentence: "If I drink coffee late, I don't sleep well.",
      },
      { sentence: "Plants will die if they don't get water, that's just a fact.", wrongWord: "will", correctedSentence: "Plants die if they don't get water, that's just a fact." },
    ],
    conjugate: [
      { template: "If you heat water to 100°C, it ___.", options: ["boils", "will boil", "boiled"], correctIndex: 0, hint: "Zero Conditional: Simple Present in both clauses." },
      { template: "If they don't get water, plants ___.", options: ["will die", "die", "died"], correctIndex: 1, hint: "General truth, not one specific future event." },
    ],
    translate: [
      { de: "Wenn man Wasser auf 100°C erhitzt, kocht es.", en: "If you heat water to 100°C, it boils." },
      { de: "Wenn ich spät Kaffee trinke, kann ich nicht schlafen.", en: "If I drink coffee late, I can't sleep." },
      { de: "Pflanzen sterben, wenn sie kein Wasser bekommen.", en: "Plants die if they don't get water." },
    ],
    transform: [
      {
        prompt: "Rewrite as a Zero Conditional general truth (Simple Present in both parts).",
        source: "If you don't water plants, they will die — that always happens.",
        answer: "If you don't water plants, they die.",
      },
    ],
    situation: [
      {
        situation: "You're stating a scientific fact that is always true.",
        optionA: "If you heat water to 100°C, it boils.",
        optionB: "If you heat water to 100°C, it will boil.",
        correctIndex: 0,
      },
      {
        situation: "You're predicting one specific result for a real situation happening next week.",
        optionA: "If it rains next week, the match is cancelled.",
        optionB: "If it rains next week, the match will be cancelled.",
        correctIndex: 1,
      },
    ],
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
    build: [
      { sentence: "If it rains tomorrow we will stay home." },
      { sentence: "If she studies hard she will pass the exam." },
      { sentence: "We'll be late if we don't leave now." },
    ],
    gap: [
      { template: "If she studies hard, she ___ pass the exam.", answer: "will", hint: "First Conditional: will + base verb in the main clause." },
      { template: "We'll be late if we ___ leave now.", answer: "don't", hint: "if + Simple Present — 'don't leave' not 'won't leave'." },
    ],
    mc: [
      {
        prompt: "Which sentence correctly describes a likely future result?",
        options: ["If it rains tomorrow, we stayed home.", "If it rained tomorrow, we will stay home.", "If it rains tomorrow, we will stay home."],
        correctIndex: 2,
      },
      {
        prompt: "Which sentence correctly forms a First Conditional?",
        options: ["If she study hard, she will pass the exam.", "If she studies hard, she will pass the exam.", "If she will study hard, she passes the exam."],
        correctIndex: 1,
      },
    ],
    error: [
      {
        sentence: "If it rains tomorrow, we stay home for sure.",
        wrongWord: "stay",
        correctedSentence: "If it rains tomorrow, we will stay home for sure.",
      },
      { sentence: "If she study hard, she will pass the exam.", wrongWord: "study", correctedSentence: "If she studies hard, she will pass the exam." },
    ],
    conjugate: [
      { template: "If it rains tomorrow, we ___ stay home.", options: ["stay", "will stay", "stayed"], correctIndex: 1, hint: "Main clause of First Conditional uses will." },
      { template: "If she ___ hard, she will pass the exam.", options: ["studies", "will study", "studied"], correctIndex: 0, hint: "if-clause of First Conditional uses Simple Present." },
    ],
    translate: [
      { de: "Wenn es morgen regnet, bleiben wir zu Hause.", en: "If it rains tomorrow, we will stay home." },
      { de: "Wenn sie hart lernt, wird sie die Prüfung bestehen.", en: "If she studies hard, she will pass the exam." },
      { de: "Wir kommen zu spät, wenn wir nicht jetzt losgehen.", en: "We'll be late if we don't leave now." },
    ],
    transform: [
      {
        prompt: "Rewrite as a First Conditional describing a likely real future result.",
        source: "Maybe it rains tomorrow. Maybe we stay home then.",
        answer: "If it rains tomorrow, we will stay home.",
      },
    ],
    situation: [
      {
        situation: "You're describing a real, likely condition for tomorrow and its probable result.",
        optionA: "If it rains tomorrow, we will stay home.",
        optionB: "If it rained tomorrow, we would stay home.",
        correctIndex: 0,
      },
      {
        situation: "You're describing a purely hypothetical, unlikely condition.",
        optionA: "If I won the lottery, I would travel the world.",
        optionB: "If I win the lottery, I will travel the world.",
        correctIndex: 0,
      },
    ],
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
    build: [
      { sentence: "If I won the lottery I would travel the world." },
      { sentence: "If I were you I would apologize." },
      { sentence: "She would help if she had more time." },
    ],
    gap: [
      { template: "If I ___ you, I would apologize.", answer: "were", hint: "Second Conditional uses 'were' for all persons with 'be'." },
      { template: "She would help if she ___ more time.", answer: "had", hint: "if + Simple Past for the hypothetical condition." },
    ],
    mc: [
      {
        prompt: "Which sentence describes a hypothetical situation correctly?",
        options: ["If I win the lottery, I would travel the world.", "If I won the lottery, I would travel the world.", "If I won the lottery, I will travel the world."],
        correctIndex: 1,
      },
      {
        prompt: "Which sentence gives hypothetical advice correctly?",
        options: ["If I am you, I would apologize.", "If I were you, I would apologize.", "If I was you, I would apologized."],
        correctIndex: 1,
      },
    ],
    error: [
      { sentence: "If I was you, I would apologize immediately.", wrongWord: "was", correctedSentence: "If I were you, I would apologize immediately." },
      { sentence: "She would help if she has more time.", wrongWord: "has", correctedSentence: "She would help if she had more time." },
    ],
    conjugate: [
      { template: "If I won the lottery, I ___ travel the world.", options: ["will", "would", "won't"], correctIndex: 1, hint: "Hypothetical, unlikely situation → would." },
      { template: "If I ___ you, I would apologize.", options: ["am", "was", "were"], correctIndex: 2, hint: "Second Conditional always uses 'were' with 'be'." },
    ],
    translate: [
      { de: "Wenn ich im Lotto gewinnen würde, würde ich um die Welt reisen.", en: "If I won the lottery, I would travel the world." },
      { de: "Wenn ich du wäre, würde ich mich entschuldigen.", en: "If I were you, I would apologize." },
      { de: "Sie würde helfen, wenn sie mehr Zeit hätte.", en: "She would help if she had more time." },
    ],
    transform: [
      {
        prompt: "Rewrite as an unreal, hypothetical Second Conditional.",
        source: "I don't have more time, so I can't help.",
        answer: "If I had more time, I would help.",
      },
    ],
    situation: [
      {
        situation: "You're imagining a purely hypothetical situation that is very unlikely to happen.",
        optionA: "If I won the lottery, I would travel the world.",
        optionB: "If I win the lottery, I will travel the world.",
        correctIndex: 0,
      },
      {
        situation: "You're describing a realistic possibility for the near future.",
        optionA: "If she studies hard, she will pass the exam.",
        optionB: "If she studied hard, she would pass the exam.",
        correctIndex: 0,
      },
    ],
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
    build: [
      { sentence: "If I had known I would have told you." },
      { sentence: "She would have passed if she had studied more." },
      { sentence: "We wouldn't have missed the train if we had left earlier." },
    ],
    gap: [
      { template: "She would have passed if she ___ studied more.", answer: "had", hint: "Third Conditional: Past Perfect in the if-clause." },
      { template: "We wouldn't have missed the train if we ___ left earlier.", answer: "had", hint: "if + Past Perfect describes the unreal past condition." },
    ],
    mc: [
      {
        prompt: "Which sentence correctly talks about an unreal past?",
        options: ["If I knew, I would have told you.", "If I had known, I would tell you.", "If I had known, I would have told you."],
        correctIndex: 2,
      },
      {
        prompt: "Which sentence correctly describes an imagined past result?",
        options: ["She would pass if she studied more.", "She would have passed if she had studied more.", "She had passed if she would study more."],
        correctIndex: 1,
      },
    ],
    error: [
      { sentence: "If I had known, I would tell you immediately.", wrongWord: "tell", correctedSentence: "If I had known, I would have told you immediately." },
      {
        sentence: "We wouldn't have missed the train if we left earlier.",
        wrongWord: "left",
        correctedSentence: "We wouldn't have missed the train if we had left earlier.",
      },
    ],
    conjugate: [
      { template: "If I had known, I ___ told you.", options: ["would", "would have", "will have"], correctIndex: 1, hint: "Main clause of Third Conditional: would have + past participle." },
      { template: "She would have passed if she ___ studied more.", options: ["has", "had", "would have"], correctIndex: 1, hint: "if-clause of Third Conditional: Past Perfect." },
    ],
    translate: [
      { de: "Wenn ich es gewusst hätte, hätte ich es dir gesagt.", en: "If I had known, I would have told you." },
      { de: "Sie hätte bestanden, wenn sie mehr gelernt hätte.", en: "She would have passed if she had studied more." },
      { de: "Wir hätten den Zug nicht verpasst, wenn wir früher losgegangen wären.", en: "We wouldn't have missed the train if we had left earlier." },
    ],
    transform: [
      {
        prompt: "Rewrite as a Third Conditional about an unreal past (this didn't actually happen).",
        source: "I didn't know, so I didn't tell you.",
        answer: "If I had known, I would have told you.",
      },
    ],
    situation: [
      {
        situation: "You're talking about something that didn't actually happen in the past, and its imagined result.",
        optionA: "If I had known, I would have told you.",
        optionB: "If I knew, I would tell you.",
        correctIndex: 0,
      },
      {
        situation: "You're giving hypothetical advice about a present situation, not the past.",
        optionA: "If I were you, I would apologize.",
        optionB: "If I had been you, I would have apologized.",
        correctIndex: 0,
      },
    ],
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
    build: [
      { sentence: "The report is written every month." },
      { sentence: "The building was constructed in 1990." },
      { sentence: "Millions of copies were sold last year." },
    ],
    gap: [
      { template: "Millions of copies ___ sold last year.", answer: "were", hint: "Past passive, plural subject: were + past participle." },
      { template: "The report ___ written every month.", answer: "is", hint: "Present passive, singular subject: is + past participle." },
    ],
    mc: [
      {
        prompt: "Which sentence is in the correct passive form?",
        options: ["The report writes every month.", "The report is written every month.", "The report is writing every month."],
        correctIndex: 1,
      },
      {
        prompt: "Which sentence correctly describes the past passive?",
        options: ["The building constructed in 1990.", "The building was constructed in 1990.", "The building has constructed in 1990."],
        correctIndex: 1,
      },
    ],
    error: [
      { sentence: "The building was construct in 1990.", wrongWord: "construct", correctedSentence: "The building was constructed in 1990." },
      { sentence: "Millions of copies was sold last year.", wrongWord: "was", correctedSentence: "Millions of copies were sold last year." },
    ],
    conjugate: [
      { template: "The report ___ every month.", options: ["writes", "is written", "is writing"], correctIndex: 1, hint: "The action matters, not who writes it — passive." },
      { template: "The building ___ in 1990.", options: ["constructed", "was constructed", "was constructing"], correctIndex: 1, hint: "Past passive: was/were + past participle." },
    ],
    translate: [
      { de: "Der Bericht wird jeden Monat geschrieben.", en: "The report is written every month." },
      { de: "Das Gebäude wurde 1990 errichtet.", en: "The building was constructed in 1990." },
      { de: "Letztes Jahr wurden Millionen Exemplare verkauft.", en: "Millions of copies were sold last year." },
    ],
    transform: [
      {
        prompt: "Rewrite in the passive voice — the doer isn't important here.",
        source: "Someone writes the report every month.",
        answer: "The report is written every month.",
      },
    ],
    situation: [
      {
        situation: "You don't know or don't care who built the building — the action matters more.",
        optionA: "Someone constructed the building in 1990.",
        optionB: "The building was constructed in 1990.",
        correctIndex: 1,
      },
      {
        situation: "You want to specifically emphasize who performed the action.",
        optionA: "Our team wrote the report.",
        optionB: "The report was written.",
        correctIndex: 0,
      },
    ],
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
    build: [
      { sentence: "This form must be signed by both parties." },
      { sentence: "The results will be announced tomorrow." },
      { sentence: "The issue can be fixed quickly." },
    ],
    gap: [
      { template: "The results will ___ announced tomorrow.", answer: "be", hint: "Modal + be + past participle." },
      { template: "The issue can be ___ quickly.", answer: "fixed", hint: "can + be + past participle." },
    ],
    mc: [
      {
        prompt: "Which sentence uses the modal passive correctly?",
        options: ["The issue can fixed quickly.", "The issue can be fixed quickly.", "The issue can be fix quickly."],
        correctIndex: 1,
      },
      {
        prompt: "Which sentence correctly expresses obligation in the passive?",
        options: ["This form must sign by both parties.", "This form must be signed by both parties.", "This form must signed by both parties."],
        correctIndex: 1,
      },
    ],
    error: [
      { sentence: "This form must signed by both parties.", wrongWord: "signed", correctedSentence: "This form must be signed by both parties." },
      { sentence: "The results will announced tomorrow.", wrongWord: "announced", correctedSentence: "The results will be announced tomorrow." },
    ],
    conjugate: [
      { template: "The issue can ___ quickly.", options: ["fixed", "be fixed", "being fixed"], correctIndex: 1, hint: "Modal passive: can + be + past participle." },
      { template: "This form must ___ by both parties.", options: ["sign", "be signed", "signed"], correctIndex: 1, hint: "Modal passive: must + be + past participle." },
    ],
    translate: [
      { de: "Dieses Formular muss von beiden Parteien unterschrieben werden.", en: "This form must be signed by both parties." },
      { de: "Die Ergebnisse werden morgen bekannt gegeben.", en: "The results will be announced tomorrow." },
      { de: "Das Problem kann schnell behoben werden.", en: "The issue can be fixed quickly." },
    ],
    transform: [
      {
        prompt: "Rewrite in the modal passive using 'must'.",
        source: "Both parties have to sign this form.",
        answer: "This form must be signed by both parties.",
      },
    ],
    situation: [
      {
        situation: "You're stating a rule — the form has to be signed, and it doesn't matter who does the signing first.",
        optionA: "Both parties must sign this form.",
        optionB: "This form must be signed by both parties.",
        correctIndex: 1,
      },
      {
        situation: "You're telling someone directly what they personally need to do.",
        optionA: "You must sign this form today.",
        optionB: "This form must be signed today.",
        correctIndex: 0,
      },
    ],
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
    build: [
      { sentence: "She said she was tired." },
      { sentence: "He told me he had finished the work." },
      { sentence: "They said they would come later." },
    ],
    gap: [
      { template: "He told me he ___ finished the work.", answer: "had", hint: "Past → Past Perfect when reporting." },
      { template: "They said they ___ come later.", answer: "would", hint: "'will' shifts back to 'would' when reporting." },
    ],
    mc: [
      {
        prompt: "Original: 'I am tired.' Which report is correct?",
        options: ["She said she is tired.", "She said she was tired.", "She said she tired."],
        correctIndex: 1,
      },
      {
        prompt: "Original: 'I will come later.' Which report is correct?",
        options: ["They said they will come later.", "They said they would come later.", "They said they come later."],
        correctIndex: 1,
      },
    ],
    error: [
      { sentence: "They said they will come later.", wrongWord: "will", correctedSentence: "They said they would come later." },
      { sentence: "He told me he has finished the work.", wrongWord: "has", correctedSentence: "He told me he had finished the work." },
    ],
    conjugate: [
      { template: "She said she ___ tired.", options: ["is", "was", "has been"], correctIndex: 1, hint: "Present → Past when reporting a statement." },
      { template: "They said they ___ come later.", options: ["will", "would", "come"], correctIndex: 1, hint: "'will' shifts back to 'would'." },
    ],
    translate: [
      { de: "Sie sagte, sie sei müde.", en: "She said she was tired." },
      { de: "Er sagte mir, er habe die Arbeit beendet.", en: "He told me he had finished the work." },
      { de: "Sie sagten, sie würden später kommen.", en: "They said they would come later." },
    ],
    transform: [
      {
        prompt: "Report what was said, shifting the tense back one step.",
        source: "Direct speech: 'I am tired,' she said.",
        answer: "She said she was tired.",
      },
    ],
    situation: [
      {
        situation: "You're reporting someone else's exact words some time later, as indirect speech.",
        optionA: "She said she was tired.",
        optionB: "She said she is tired.",
        correctIndex: 0,
      },
      {
        situation: "You're quoting someone's exact original words directly, right after they spoke.",
        optionA: "She said, 'I am tired.'",
        optionB: "She said she was tired.",
        correctIndex: 0,
      },
    ],
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
    build: [
      { sentence: "She asked if I was coming." },
      { sentence: "He asked where I lived." },
      { sentence: "They asked what time it was." },
    ],
    gap: [
      { template: "He asked where I ___.", answer: "lived", hint: "Statement word order, tense shifted back." },
      { template: "They asked what time it ___.", answer: "was", hint: "Reported question: normal word order, past tense." },
    ],
    mc: [
      {
        prompt: "Original: 'Where do you live?' Which report is correct?",
        options: ["He asked where did I live.", "He asked where I lived.", "He asked where I live."],
        correctIndex: 1,
      },
      {
        prompt: "Original: 'Are you coming?' Which report is correct?",
        options: ["She asked was I coming.", "She asked if I was coming.", "She asked am I coming."],
        correctIndex: 1,
      },
    ],
    error: [
      { sentence: "They asked what time was it.", wrongWord: "was", correctedSentence: "They asked what time it was." },
      { sentence: "He asked where did I live.", wrongWord: "did", correctedSentence: "He asked where I lived." },
    ],
    conjugate: [
      { template: "He asked ___ I lived.", options: ["that", "where", "did"], correctIndex: 1, hint: "wh-question → keep the question word, no inversion." },
      { template: "She asked ___ I was coming.", options: ["that", "if", "was"], correctIndex: 1, hint: "yes/no question → report with 'if'." },
    ],
    translate: [
      { de: "Sie fragte, ob ich käme.", en: "She asked if I was coming." },
      { de: "Er fragte, wo ich wohne.", en: "He asked where I lived." },
      { de: "Sie fragten, wie spät es sei.", en: "They asked what time it was." },
    ],
    transform: [
      {
        prompt: "Report this question using normal word order and no question mark.",
        source: "Direct speech: 'Where do you live?' he asked.",
        answer: "He asked where I lived.",
      },
    ],
    situation: [
      {
        situation: "You're reporting a yes/no question someone asked you.",
        optionA: "She asked if I was coming.",
        optionB: "She asked was I coming.",
        correctIndex: 0,
      },
      {
        situation: "You're asking the original direct question yourself, right now.",
        optionA: "Where do you live?",
        optionB: "He asked where I lived.",
        correctIndex: 0,
      },
    ],
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
    build: [
      { sentence: "The man who called earlier is my boss." },
      { sentence: "This is the book that I told you about." },
      { sentence: "I need a laptop that has a long battery life." },
    ],
    gap: [
      { template: "This is the book ___ I told you about.", answer: "that", hint: "Defining relative clause for a thing." },
      { template: "I need a laptop ___ has a long battery life.", answer: "that", hint: "Defining relative clause, subject of its clause, for a thing." },
    ],
    mc: [
      {
        prompt: "Which sentence correctly identifies a specific person?",
        options: ["The man which called earlier is my boss.", "The man who called earlier is my boss.", "The man, who called earlier, is my boss."],
        correctIndex: 1,
      },
      {
        prompt: "Which sentence correctly uses a defining relative clause?",
        options: ["I need a laptop, that has a long battery life.", "I need a laptop who has a long battery life.", "I need a laptop that has a long battery life."],
        correctIndex: 2,
      },
    ],
    error: [
      { sentence: "I need a laptop who has a long battery life.", wrongWord: "who", correctedSentence: "I need a laptop that has a long battery life." },
      { sentence: "The man which called earlier is my boss.", wrongWord: "which", correctedSentence: "The man who called earlier is my boss." },
    ],
    conjugate: [
      { template: "The man ___ called earlier is my boss.", options: ["which", "who", "whom"], correctIndex: 1, hint: "Relative clause about a person, as subject → who." },
      { template: "I need a laptop ___ has a long battery life.", options: ["who", "that", "whose"], correctIndex: 1, hint: "Relative clause about a thing → that/which." },
    ],
    translate: [
      { de: "Der Mann, der vorhin anrief, ist mein Chef.", en: "The man who called earlier is my boss." },
      { de: "Das ist das Buch, von dem ich dir erzählt habe.", en: "This is the book that I told you about." },
      { de: "Ich brauche einen Laptop, der eine lange Akkulaufzeit hat.", en: "I need a laptop that has a long battery life." },
    ],
    transform: [
      {
        prompt: "Combine into one sentence using a defining relative clause.",
        source: "I need a laptop. The laptop must have a long battery life.",
        answer: "I need a laptop that has a long battery life.",
      },
    ],
    situation: [
      {
        situation: "The relative clause is essential — without it, you wouldn't know which man you mean.",
        optionA: "The man who called earlier is my boss.",
        optionB: "The man, who called earlier, is my boss.",
        correctIndex: 0,
      },
      {
        situation: "You're adding extra, non-essential information about someone already identified.",
        optionA: "My brother, who lives in Berlin, is visiting.",
        optionB: "My brother who lives in Berlin is visiting.",
        correctIndex: 0,
      },
    ],
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
    build: [
      { sentence: "My brother who lives in Berlin is visiting us." },
      { sentence: "The report which took weeks to write was well received." },
      { sentence: "Paris which I visited last year is beautiful in spring." },
    ],
    gap: [
      { template: "The report, ___ took weeks to write, was well received.", answer: "which", hint: "Non-defining clause, extra info, set off by commas." },
      { template: "Paris, ___ I visited last year, is beautiful in spring.", answer: "which", hint: "Non-defining clause about a place." },
    ],
    mc: [
      {
        prompt: "Which sentence correctly adds extra, non-essential info?",
        options: ["My brother, that lives in Berlin, is visiting us.", "My brother, who lives in Berlin, is visiting us.", "My brother who lives in Berlin, is visiting us."],
        correctIndex: 1,
      },
      {
        prompt: "Which sentence is correctly punctuated?",
        options: ["The report which took weeks to write, was well received.", "The report, which took weeks to write, was well received.", "The report that took weeks to write, was well received."],
        correctIndex: 1,
      },
    ],
    error: [
      { sentence: "Paris, that I visited last year, is beautiful in spring.", wrongWord: "that", correctedSentence: "Paris, which I visited last year, is beautiful in spring." },
      {
        sentence: "The report, that took weeks to write, was well received.",
        wrongWord: "that",
        correctedSentence: "The report, which took weeks to write, was well received.",
      },
    ],
    conjugate: [
      { template: "My brother, ___ lives in Berlin, is visiting us.", options: ["that", "who", "which"], correctIndex: 1, hint: "Non-defining clause about a person → who (never that)." },
      { template: "Paris, ___ I visited last year, is beautiful.", options: ["that", "which", "who"], correctIndex: 1, hint: "Non-defining clause about a place → which (never that)." },
    ],
    translate: [
      { de: "Mein Bruder, der in Berlin wohnt, besucht uns.", en: "My brother, who lives in Berlin, is visiting us." },
      { de: "Der Bericht, der Wochen zum Schreiben brauchte, kam gut an.", en: "The report, which took weeks to write, was well received." },
      { de: "Paris, das ich letztes Jahr besuchte, ist im Frühling wunderschön.", en: "Paris, which I visited last year, is beautiful in spring." },
    ],
    transform: [
      {
        prompt: "Combine into one sentence using a non-defining relative clause, set off by commas.",
        source: "My brother is visiting us. By the way, he lives in Berlin.",
        answer: "My brother, who lives in Berlin, is visiting us.",
      },
    ],
    situation: [
      {
        situation: "You already know exactly which brother is meant — the clause just adds a bonus fact.",
        optionA: "My brother, who lives in Berlin, is visiting us.",
        optionB: "My brother who lives in Berlin is visiting us.",
        correctIndex: 0,
      },
      {
        situation: "You have several brothers and need the clause to say which one you mean.",
        optionA: "My brother who lives in Berlin is visiting us.",
        optionB: "My brother, who lives in Berlin, is visiting us.",
        correctIndex: 0,
      },
    ],
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
    build: [
      { sentence: "He isn't answering he must be asleep." },
      { sentence: "She can't be at work her car is here." },
      { sentence: "It might rain later the sky looks grey." },
    ],
    gap: [
      { template: "She ___ be at work, her car is here.", answer: "can't", hint: "Confident negative conclusion from evidence." },
      { template: "It ___ rain later, the sky looks grey.", answer: "might", hint: "Uncertain guess, not a confident conclusion." },
    ],
    mc: [
      {
        prompt: "Which sentence expresses an uncertain guess?",
        options: ["It must rain later.", "It might rain later.", "It can't rain later."],
        correctIndex: 1,
      },
      {
        prompt: "Which sentence expresses a confident negative conclusion?",
        options: ["She might not be at work.", "She can't be at work, her car is here.", "She mustn't be at work."],
        correctIndex: 1,
      },
    ],
    error: [
      { sentence: "He isn't answering — he mustn't be asleep.", wrongWord: "mustn't", correctedSentence: "He isn't answering — he must be asleep." },
      { sentence: "She might be at work, her car is here, that's certain.", wrongWord: "might", correctedSentence: "She must be at work, her car is here, that's certain." },
    ],
    conjugate: [
      { template: "He isn't answering — he ___ be asleep.", options: ["can't", "must", "mustn't"], correctIndex: 1, hint: "Confident positive conclusion → must." },
      { template: "It ___ rain later, hard to say.", options: ["must", "can't", "might"], correctIndex: 2, hint: "Uncertain guess → might/could/may." },
    ],
    translate: [
      { de: "Er geht nicht ran — er muss schlafen.", en: "He isn't answering — he must be asleep." },
      { de: "Sie kann nicht bei der Arbeit sein, ihr Auto steht hier.", en: "She can't be at work, her car is here." },
      { de: "Es könnte später regnen, der Himmel sieht grau aus.", en: "It might rain later, the sky looks grey." },
    ],
    transform: [
      {
        prompt: "Rewrite as a confident deduction using 'must', based on the evidence given.",
        source: "He isn't answering the phone. I'm sure he's asleep.",
        answer: "He must be asleep.",
      },
    ],
    situation: [
      {
        situation: "The evidence makes you completely sure something is impossible.",
        optionA: "She can't be at work, her car is here.",
        optionB: "She might not be at work, her car is here.",
        correctIndex: 0,
      },
      {
        situation: "You genuinely don't know and are only guessing.",
        optionA: "It might rain later.",
        optionB: "It must rain later.",
        correctIndex: 0,
      },
    ],
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
    build: [
      { sentence: "I must call my mother tonight." },
      { sentence: "You have to wear a helmet on this site." },
      { sentence: "You should see a doctor about that cough." },
    ],
    gap: [
      { template: "You ___ see a doctor about that cough.", answer: "should", hint: "Advice, not a strict rule." },
      { template: "I ___ call my mother tonight.", answer: "must", hint: "Personal, strong obligation the speaker feels." },
    ],
    mc: [
      {
        prompt: "Which sentence expresses an external rule?",
        options: ["You must wear a helmet, it's my personal rule.", "You have to wear a helmet on this site.", "You should wear a helmet."],
        correctIndex: 1,
      },
      {
        prompt: "Which sentence gives advice, not a strict obligation?",
        options: ["You must see a doctor.", "You have to see a doctor.", "You should see a doctor."],
        correctIndex: 2,
      },
    ],
    error: [
      { sentence: "You should wear a helmet, it's the law here.", wrongWord: "should", correctedSentence: "You have to wear a helmet, it's the law here." },
      { sentence: "You must see a doctor, it's just a friendly suggestion.", wrongWord: "must", correctedSentence: "You should see a doctor, it's just a friendly suggestion." },
    ],
    conjugate: [
      { template: "You ___ wear a helmet, it's the site rule.", options: ["should", "have to", "might"], correctIndex: 1, hint: "External rule/regulation → have to." },
      { template: "You ___ see a doctor, just a suggestion.", options: ["must", "have to", "should"], correctIndex: 2, hint: "Advice, not a rule → should." },
    ],
    translate: [
      { de: "Ich muss heute Abend meine Mutter anrufen.", en: "I must call my mother tonight." },
      { de: "Man muss auf diesem Gelände einen Helm tragen.", en: "You have to wear a helmet on this site." },
      { de: "Du solltest wegen des Hustens einen Arzt aufsuchen.", en: "You should see a doctor about that cough." },
    ],
    transform: [
      {
        prompt: "Rewrite as advice rather than a strict rule, using 'should'.",
        source: "You have to see a doctor, it's the law. (Change: it's just friendly advice, not a rule.)",
        answer: "You should see a doctor.",
      },
    ],
    situation: [
      {
        situation: "A site regulation applies to everyone, not just your personal feeling.",
        optionA: "You have to wear a helmet on this site.",
        optionB: "You must wear a helmet on this site, personally I insist.",
        correctIndex: 0,
      },
      {
        situation: "You're giving a friend gentle advice, not stating a rule.",
        optionA: "You have to see a doctor.",
        optionB: "You should see a doctor.",
        correctIndex: 1,
      },
    ],
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
    build: [
      { sentence: "I enjoy reading before bed." },
      { sentence: "She decided to leave early." },
      { sentence: "We avoid eating late at night." },
    ],
    gap: [
      { template: "We avoid ___ late at night.", answer: "eating", hint: "'Avoid' is followed by the gerund (-ing)." },
      { template: "She decided ___ leave early.", answer: "to", hint: "'Decide' is followed by the infinitive with 'to'." },
    ],
    mc: [
      {
        prompt: "Which sentence uses the correct verb pattern?",
        options: ["I enjoy to read before bed.", "I enjoy reading before bed.", "I enjoy read before bed."],
        correctIndex: 1,
      },
      {
        prompt: "Which sentence uses the correct verb pattern?",
        options: ["She decided leaving early.", "She decided to leave early.", "She decided leave early."],
        correctIndex: 1,
      },
    ],
    error: [
      { sentence: "She decided leaving early.", wrongWord: "leaving", correctedSentence: "She decided to leave early." },
      { sentence: "We avoid to eat late at night.", wrongWord: "to", correctedSentence: "We avoid eating late at night." },
    ],
    conjugate: [
      { template: "I enjoy ___ before bed.", options: ["to read", "reading", "read"], correctIndex: 1, hint: "'Enjoy' is always followed by -ing." },
      { template: "We avoid ___ late at night.", options: ["to eat", "eating", "eat"], correctIndex: 1, hint: "'Avoid' is always followed by -ing." },
    ],
    translate: [
      { de: "Ich lese gerne vor dem Schlafengehen.", en: "I enjoy reading before bed." },
      { de: "Sie entschied sich, früh zu gehen.", en: "She decided to leave early." },
      { de: "Wir vermeiden es, spät nachts zu essen.", en: "We avoid eating late at night." },
    ],
    transform: [
      {
        prompt: "Rewrite using 'suggest' (which takes the gerund) instead of 'decide'.",
        source: "She decided to leave early.",
        answer: "She suggested leaving early.",
      },
    ],
    situation: [
      {
        situation: "The verb 'promise' is being used, which always takes the infinitive.",
        optionA: "I promise to call you tonight.",
        optionB: "I promise calling you tonight.",
        correctIndex: 0,
      },
      {
        situation: "The verb 'finish' is being used, which always takes the gerund.",
        optionA: "I finished to write the report.",
        optionB: "I finished writing the report.",
        correctIndex: 1,
      },
    ],
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
    build: [
      { sentence: "a beautiful small old wooden table" },
      { sentence: "a large round red rug" },
      { sentence: "an interesting new Italian restaurant" },
    ],
    gap: [
      { template: "a large round ___ rug", answer: "red", hint: "Order: opinion, size, age, shape, color, origin, material." },
      { template: "an interesting new ___ restaurant", answer: "Italian", hint: "Origin comes right before the noun (after age here)." },
    ],
    mc: [
      {
        prompt: "Which adjective order is correct?",
        options: ["a wooden old small beautiful table", "a beautiful small old wooden table", "an old beautiful wooden small table"],
        correctIndex: 1,
      },
      {
        prompt: "Which adjective order is correct?",
        options: ["a red large round rug", "a large round red rug", "a round large red rug"],
        correctIndex: 1,
      },
    ],
    error: [
      { sentence: "an Italian interesting new restaurant", wrongWord: "Italian", correctedSentence: "an interesting new Italian restaurant" },
      { sentence: "a red large round rug", wrongWord: "red", correctedSentence: "a large round red rug" },
    ],
    conjugate: [
      {
        template: "a ___ small old wooden table",
        options: ["beautiful", "wooden beautiful", "old beautiful"],
        correctIndex: 0,
        hint: "Opinion adjectives (beautiful) come first, before size/age/material.",
      },
      { template: "an interesting new ___ restaurant", options: ["Italian", "restaurant Italian", "new Italian"], correctIndex: 0, hint: "Origin (Italian) goes right before the noun." },
    ],
    translate: [
      { de: "ein schöner kleiner alter Holztisch", en: "a beautiful small old wooden table" },
      { de: "ein großer runder roter Teppich", en: "a large round red rug" },
      { de: "ein interessantes neues italienisches Restaurant", en: "an interesting new Italian restaurant" },
    ],
    transform: [
      {
        prompt: "Put these adjectives into the correct English order before the noun.",
        source: "wooden / old / small / beautiful — table",
        answer: "a beautiful small old wooden table",
      },
    ],
    situation: [
      {
        situation: "You're listing an opinion adjective together with a material adjective for one noun.",
        optionA: "a beautiful wooden table",
        optionB: "a wooden beautiful table",
        correctIndex: 0,
      },
      {
        situation: "You're combining a size adjective with a color adjective.",
        optionA: "a red large rug",
        optionB: "a large red rug",
        correctIndex: 1,
      },
    ],
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
    build: [{ sentence: "Where do you live" }, { sentence: "What is she doing" }, { sentence: "Why haven't you called me" }],
    gap: [
      { template: "What ___ she doing?", answer: "is", hint: "Auxiliary before the subject in questions." },
      { template: "Why ___ you called me?", answer: "haven't", hint: "Negative auxiliary before the subject." },
    ],
    mc: [
      {
        prompt: "Which question is correctly formed?",
        options: ["Why you haven't called me?", "Why haven't you called me?", "Why you have not called me?"],
        correctIndex: 1,
      },
      {
        prompt: "Which question is correctly formed?",
        options: ["What she is doing?", "What is she doing?", "What does she is doing?"],
        correctIndex: 1,
      },
    ],
    error: [
      { sentence: "Where you do live?", wrongWord: "you", correctedSentence: "Where do you live?" },
      { sentence: "What she is doing?", wrongWord: "she", correctedSentence: "What is she doing?" },
    ],
    conjugate: [
      { template: "___ do you live?", options: ["Where", "Where you", "You where"], correctIndex: 0, hint: "Question word first, then auxiliary, then subject." },
      { template: "Why ___ you called me?", options: ["you haven't", "haven't", "not have"], correctIndex: 1, hint: "Auxiliary comes before the subject." },
    ],
    translate: [
      { de: "Wo wohnst du?", en: "Where do you live?" },
      { de: "Was macht sie gerade?", en: "What is she doing?" },
      { de: "Warum hast du mich nicht angerufen?", en: "Why haven't you called me?" },
    ],
    transform: [
      {
        prompt: "Turn this statement into a direct question with correct auxiliary-subject inversion.",
        source: "You live somewhere. (Ask where.)",
        answer: "Where do you live?",
      },
    ],
    situation: [
      {
        situation: "You're asking a direct question out loud to someone.",
        optionA: "Where do you live?",
        optionB: "Where you live?",
        correctIndex: 0,
      },
      {
        situation: "You're reporting a question someone else asked (indirect speech, no inversion).",
        optionA: "He asked where I lived.",
        optionB: "He asked where did I live.",
        correctIndex: 0,
      },
    ],
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
    build: [{ sentence: "I saw a dog in the park." }, { sentence: "The dog I saw was brown." }, { sentence: "Dogs are loyal animals." }],
    gap: [
      { template: "___ dog I saw was brown.", answer: "The", hint: "Specific, already-mentioned noun." },
      { template: "___ are loyal animals.", answer: "Dogs", hint: "General plural statement — no article." },
    ],
    mc: [
      {
        prompt: "Which sentence uses articles correctly?",
        options: ["The dogs are loyal animals.", "Dogs are loyal animals.", "A dogs are loyal animals."],
        correctIndex: 1,
      },
      {
        prompt: "Which sentence uses articles correctly?",
        options: ["I saw dog in the park.", "I saw a dog in the park.", "I saw the dog in a park."],
        correctIndex: 1,
      },
    ],
    error: [
      { sentence: "I saw the dog in the park for the first time.", wrongWord: "the", correctedSentence: "I saw a dog in the park for the first time." },
      { sentence: "A dogs are loyal animals.", wrongWord: "A", correctedSentence: "Dogs are loyal animals." },
    ],
    conjugate: [
      { template: "I saw ___ dog in the park.", options: ["a", "the", "—"], correctIndex: 0, hint: "First mention, non-specific → a/an." },
      { template: "___ dog I saw was brown.", options: ["A", "The", "—"], correctIndex: 1, hint: "Already mentioned, specific → the." },
    ],
    translate: [
      { de: "Ich sah einen Hund im Park.", en: "I saw a dog in the park." },
      { de: "Der Hund, den ich sah, war braun.", en: "The dog I saw was brown." },
      { de: "Hunde sind treue Tiere.", en: "Dogs are loyal animals." },
    ],
    transform: [
      {
        prompt: "Rewrite as a general statement about the whole species — use no article.",
        source: "The dog in the park was loyal.",
        answer: "Dogs are loyal animals.",
      },
    ],
    situation: [
      {
        situation: "You're mentioning a dog for the very first time — the listener doesn't know which one.",
        optionA: "I saw a dog in the park.",
        optionB: "I saw the dog in the park.",
        correctIndex: 0,
      },
      {
        situation: "You're referring back to a dog you already mentioned a moment ago.",
        optionA: "A dog I saw was brown.",
        optionB: "The dog I saw was brown.",
        correctIndex: 1,
      },
    ],
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
    build: [{ sentence: "The meeting starts at 9 a.m." }, { sentence: "We're meeting on Friday." }, { sentence: "She was born in 1995." }],
    gap: [
      { template: "We're meeting ___ Friday.", answer: "on", hint: "Days of the week take 'on'." },
      { template: "She was born ___ 1995.", answer: "in", hint: "Years take 'in'." },
    ],
    mc: [
      {
        prompt: "Which sentence uses the correct preposition?",
        options: ["She was born on 1995.", "She was born in 1995.", "She was born at 1995."],
        correctIndex: 1,
      },
      {
        prompt: "Which sentence uses the correct preposition?",
        options: ["We're meeting in Friday.", "We're meeting on Friday.", "We're meeting at Friday."],
        correctIndex: 1,
      },
    ],
    error: [
      { sentence: "The meeting starts in 9 a.m.", wrongWord: "in", correctedSentence: "The meeting starts at 9 a.m." },
      { sentence: "She was born at 1995.", wrongWord: "at", correctedSentence: "She was born in 1995." },
    ],
    conjugate: [
      { template: "The meeting starts ___ 9 a.m.", options: ["at", "on", "in"], correctIndex: 0, hint: "Clock times take 'at'." },
      { template: "We're meeting ___ Friday.", options: ["at", "on", "in"], correctIndex: 1, hint: "Days of the week take 'on'." },
    ],
    translate: [
      { de: "Das Meeting beginnt um 9 Uhr.", en: "The meeting starts at 9 a.m." },
      { de: "Wir treffen uns am Freitag.", en: "We're meeting on Friday." },
      { de: "Sie wurde 1995 geboren.", en: "She was born in 1995." },
    ],
    transform: [
      {
        prompt: "Rewrite changing the time reference from a year to a specific clock time, adjusting the preposition.",
        source: "She was born in 1995.",
        answer: "She was born at 9 a.m.",
      },
    ],
    situation: [
      {
        situation: "You're giving an exact clock time.",
        optionA: "The meeting starts at 9 a.m.",
        optionB: "The meeting starts on 9 a.m.",
        correctIndex: 0,
      },
      {
        situation: "You're referring to a whole year.",
        optionA: "She was born on 1995.",
        optionB: "She was born in 1995.",
        correctIndex: 1,
      },
    ],
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
    build: [{ sentence: "This car is faster than that one." }, { sentence: "It's the most expensive option." }, { sentence: "Her English is better than mine." }],
    gap: [
      { template: "It's the ___ expensive option.", answer: "most", hint: "Long adjective → 'most' for the superlative." },
      { template: "Her English is ___ than mine.", answer: "better", hint: "Irregular comparative: good → better." },
    ],
    mc: [
      {
        prompt: "Which sentence uses the comparative correctly?",
        options: ["Her English is gooder than mine.", "Her English is better than mine.", "Her English is more good than mine."],
        correctIndex: 1,
      },
      {
        prompt: "Which sentence uses the superlative correctly?",
        options: ["It's the expensivest option.", "It's the most expensive option.", "It's the more expensive option."],
        correctIndex: 1,
      },
    ],
    error: [
      { sentence: "This car is more fast than that one.", wrongWord: "more", correctedSentence: "This car is faster than that one." },
      { sentence: "It's the expensivest option.", wrongWord: "expensivest", correctedSentence: "It's the most expensive option." },
    ],
    conjugate: [
      { template: "This car is ___ than that one.", options: ["fast", "faster", "more fast"], correctIndex: 1, hint: "Short adjective → -er comparative." },
      { template: "It's the ___ expensive option.", options: ["expensivest", "more", "most"], correctIndex: 2, hint: "Long adjective → 'most' superlative." },
    ],
    translate: [
      { de: "Dieses Auto ist schneller als jenes.", en: "This car is faster than that one." },
      { de: "Es ist die teuerste Option.", en: "It's the most expensive option." },
      { de: "Ihr Englisch ist besser als meins.", en: "Her English is better than mine." },
    ],
    transform: [
      {
        prompt: "Rewrite using the superlative instead of the comparative.",
        source: "This car is faster than that one, and faster than every other car here.",
        answer: "This car is the fastest of all.",
      },
    ],
    situation: [
      {
        situation: "You're comparing exactly two things.",
        optionA: "This car is faster than that one.",
        optionB: "This car is the fastest.",
        correctIndex: 0,
      },
      {
        situation: "You're picking out the top one among many options.",
        optionA: "It's a more expensive option.",
        optionB: "It's the most expensive option.",
        correctIndex: 1,
      },
    ],
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
    build: [{ sentence: "I used to play football every weekend." }, { sentence: "She used to live in Munich." }, { sentence: "We played chess yesterday." }],
    gap: [
      { template: "She ___ to live in Munich.", answer: "used", hint: "Past habit, no longer true — 'used to'." },
      { template: "We ___ chess yesterday.", answer: "played", hint: "One-off past fact — Simple Past, not 'used to'." },
    ],
    mc: [
      {
        prompt: "Which sentence best emphasizes a past habit that has changed?",
        options: ["I played football every weekend last year.", "I used to play football every weekend.", "I use to play football every weekend."],
        correctIndex: 1,
      },
      {
        prompt: "Which sentence correctly states a single past event?",
        options: ["We used to play chess yesterday.", "We played chess yesterday.", "We use to play chess yesterday."],
        correctIndex: 1,
      },
    ],
    error: [
      { sentence: "She use to live in Munich.", wrongWord: "use", correctedSentence: "She used to live in Munich." },
      { sentence: "We used to play chess yesterday.", wrongWord: "used", correctedSentence: "We played chess yesterday." },
    ],
    conjugate: [
      { template: "She ___ live in Munich, but not anymore.", options: ["used to", "uses to", "was living"], correctIndex: 0, hint: "Past habit contrasted with now → used to." },
      { template: "We ___ chess yesterday, just once.", options: ["used to play", "played", "use to play"], correctIndex: 1, hint: "Single past event → Simple Past." },
    ],
    translate: [
      { de: "Ich habe früher jedes Wochenende Fußball gespielt.", en: "I used to play football every weekend." },
      { de: "Sie hat früher in München gelebt.", en: "She used to live in Munich." },
      { de: "Wir spielten gestern Schach.", en: "We played chess yesterday." },
    ],
    transform: [
      {
        prompt: "Rewrite emphasizing that this is a past habit no longer true today, using 'used to'.",
        source: "I played football every weekend, but I don't anymore.",
        answer: "I used to play football every weekend.",
      },
    ],
    situation: [
      {
        situation: "You want to contrast a repeated past habit with how things are now.",
        optionA: "I used to play football every weekend.",
        optionB: "I played football every weekend.",
        correctIndex: 0,
      },
      {
        situation: "You're just stating that something happened once, yesterday.",
        optionA: "We used to play chess yesterday.",
        optionB: "We played chess yesterday.",
        correctIndex: 1,
      },
    ],
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
    build: [
      { sentence: "I need some information about the course." },
      { sentence: "There are too many books on this shelf." },
      { sentence: "We don't have much time left." },
    ],
    gap: [
      { template: "There are too ___ books on this shelf.", answer: "many", hint: "Countable plural noun → 'many'." },
      { template: "We don't have ___ time left.", answer: "much", hint: "Uncountable noun → 'much'." },
    ],
    mc: [
      {
        prompt: "Which sentence uses the quantifier correctly?",
        options: ["I need some informations about the course.", "I need some information about the course.", "I need many information about the course."],
        correctIndex: 1,
      },
      {
        prompt: "Which sentence uses the quantifier correctly?",
        options: ["There are too much books on this shelf.", "There are too many books on this shelf.", "There is too many books on this shelf."],
        correctIndex: 1,
      },
    ],
    error: [
      { sentence: "We don't have much advices for you.", wrongWord: "advices", correctedSentence: "We don't have much advice for you." },
      { sentence: "There are too much books on this shelf.", wrongWord: "much", correctedSentence: "There are too many books on this shelf." },
    ],
    conjugate: [
      { template: "There are too ___ books on this shelf.", options: ["much", "many", "little"], correctIndex: 1, hint: "'Books' is countable and plural → many." },
      { template: "We don't have ___ time left.", options: ["many", "much", "few"], correctIndex: 1, hint: "'Time' is uncountable → much." },
    ],
    translate: [
      { de: "Ich brauche ein paar Informationen zum Kurs.", en: "I need some information about the course." },
      { de: "Es sind zu viele Bücher in diesem Regal.", en: "There are too many books on this shelf." },
      { de: "Wir haben nicht mehr viel Zeit übrig.", en: "We don't have much time left." },
    ],
    transform: [
      {
        prompt: "Rewrite about an uncountable noun (advice) instead of a countable one (books), adjusting the quantifier.",
        source: "There are too many books on this shelf.",
        answer: "There is too much advice on this topic.",
      },
    ],
    situation: [
      {
        situation: "You're talking about a noun that has no plural form.",
        optionA: "We don't have much time left.",
        optionB: "We don't have many time left.",
        correctIndex: 0,
      },
      {
        situation: "You're talking about a noun you could count one by one.",
        optionA: "There are too much books on this shelf.",
        optionB: "There are too many books on this shelf.",
        correctIndex: 1,
      },
    ],
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
    build: [{ sentence: "Please turn off the light." }, { sentence: "Turn it off." }, { sentence: "Can you fill out this form" }],
    gap: [
      { template: "Can you fill ___ this form?", answer: "out", hint: "Separable phrasal verb: fill out." },
      { template: "Turn it ___.", answer: "off", hint: "Pronoun object: particle must come after it." },
    ],
    mc: [
      {
        prompt: "Which sentence correctly uses a pronoun with a phrasal verb?",
        options: ["Turn off it.", "Turn it off.", "Turn it."],
        correctIndex: 1,
      },
      {
        prompt: "Which sentence is correctly formed?",
        options: ["Can you fill out this form?", "Can you fill this out form?", "Can you fill this form out it?"],
        correctIndex: 0,
      },
    ],
    error: [
      { sentence: "Please turn off it before you leave.", wrongWord: "off", correctedSentence: "Please turn it off before you leave." },
      { sentence: "Can you fill out it, please?", wrongWord: "out", correctedSentence: "Can you fill it out, please?" },
    ],
    conjugate: [
      { template: "Turn ___ off.", options: ["off it", "it", "it off"], correctIndex: 1, hint: "Pronoun objects go between the verb and particle." },
      { template: "Can you fill ___ this form?", options: ["out", "it out", "out it"], correctIndex: 0, hint: "Noun objects can go before or after the particle." },
    ],
    translate: [
      { de: "Bitte mach das Licht aus.", en: "Please turn off the light." },
      { de: "Mach es aus.", en: "Turn it off." },
      { de: "Kannst du dieses Formular ausfüllen?", en: "Can you fill out this form?" },
    ],
    transform: [
      {
        prompt: "Rewrite replacing the noun object with a pronoun — remember the particle must move after it.",
        source: "Please turn off the light.",
        answer: "Please turn it off.",
      },
    ],
    situation: [
      {
        situation: "The object is a pronoun (it) — the particle must come after it.",
        optionA: "Turn it off.",
        optionB: "Turn off it.",
        correctIndex: 0,
      },
      {
        situation: "The object is a full noun phrase — both word orders are fine.",
        optionA: "Turn off the light.",
        optionB: "Turn off it.",
        correctIndex: 0,
      },
    ],
  },
];

export const GRAMMAR_RULES_BY_ID: Record<string, GrammarRule> = {};
GRAMMAR_RULES.forEach((r) => (GRAMMAR_RULES_BY_ID[r.id] = r));
