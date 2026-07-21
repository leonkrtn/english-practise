/**
 * Sentence-combining drill data: the single most evidence-backed technique for improving
 * sentence-level writing quality (85+ studies since the 1970s — see O'Hare's original work and
 * later meta-analyses/SRSD research). The learner is given two short, plain clauses and must
 * combine them into one natural sentence using a connector from a specific logical-relationship
 * category — mirroring the ESL-teaching best practice of introducing connectors "one category at
 * a time" rather than as one big undifferentiated list.
 */

export interface ConnectorCategory {
  id: string;
  label: string;
  labelDe: string;
  /** Accepted connector words/phrases for this relationship — the deterministic usage check. */
  connectors: string[];
}

export const CONNECTOR_CATEGORIES: ConnectorCategory[] = [
  {
    id: "addition",
    label: "Addition",
    labelDe: "Ergänzung",
    connectors: ["and", "also", "in addition", "furthermore", "moreover", "besides", "as well as", "not only", "plus"],
  },
  {
    id: "contrast",
    label: "Contrast",
    labelDe: "Gegensatz",
    connectors: ["but", "however", "although", "though", "while", "whereas", "yet", "on the other hand", "even though", "despite", "in spite of"],
  },
  {
    id: "cause",
    label: "Cause",
    labelDe: "Grund",
    connectors: ["because", "since", "as", "due to", "given that", "seeing that"],
  },
  {
    id: "result",
    label: "Result",
    labelDe: "Folge",
    connectors: ["so", "therefore", "as a result", "consequently", "thus", "which means", "which is why"],
  },
  {
    id: "condition",
    label: "Condition",
    labelDe: "Bedingung",
    connectors: ["if", "unless", "provided that", "as long as", "in case", "even if"],
  },
  {
    id: "time",
    label: "Time",
    labelDe: "Zeit",
    connectors: ["after", "before", "when", "while", "as soon as", "once", "until", "by the time"],
  },
  {
    id: "purpose",
    label: "Purpose",
    labelDe: "Zweck",
    connectors: ["so that", "in order to", "so as to", "to"],
  },
  {
    id: "example",
    label: "Example",
    labelDe: "Beispiel",
    connectors: ["for example", "for instance", "such as", "namely", "specifically"],
  },
];

export const CONNECTOR_CATEGORIES_BY_ID: Record<string, ConnectorCategory> = {};
CONNECTOR_CATEGORIES.forEach((c) => (CONNECTOR_CATEGORIES_BY_ID[c.id] = c));

export interface ClausePair {
  id: string;
  categoryId: string;
  a: string;
  b: string;
  /** One natural, model combined sentence — shown as a reference after checking, never as the "only right answer". */
  model: string;
}

export const CLAUSE_PAIRS: ClausePair[] = [
  // Addition
  { id: "cp1", categoryId: "addition", a: "She speaks fluent Spanish.", b: "She speaks fluent Portuguese.", model: "She speaks fluent Spanish and Portuguese." },
  { id: "cp2", categoryId: "addition", a: "The new phone has a better camera.", b: "The new phone has a longer battery life.", model: "The new phone has a better camera; it also has a longer battery life." },
  { id: "cp3", categoryId: "addition", a: "He finished the report early.", b: "He offered to help his colleague.", model: "He finished the report early, and he also offered to help his colleague." },
  { id: "cp4", categoryId: "addition", a: "The apartment is close to the office.", b: "The apartment is quiet at night.", model: "The apartment is close to the office; moreover, it's quiet at night." },
  { id: "cp5", categoryId: "addition", a: "The company cut costs last year.", b: "The company invested in new equipment.", model: "The company cut costs last year, and it also invested in new equipment." },
  { id: "cp6", categoryId: "addition", a: "The hike was exhausting.", b: "The views were incredible.", model: "The hike was exhausting; the views were incredible as well." },
  // Contrast
  { id: "cp7", categoryId: "contrast", a: "The forecast predicted rain.", b: "We decided to go hiking anyway.", model: "The forecast predicted rain, but we decided to go hiking anyway." },
  { id: "cp8", categoryId: "contrast", a: "The team worked overtime all week.", b: "They missed the deadline.", model: "Although the team worked overtime all week, they missed the deadline." },
  { id: "cp9", categoryId: "contrast", a: "My brother loves spicy food.", b: "I can barely handle black pepper.", model: "My brother loves spicy food, whereas I can barely handle black pepper." },
  { id: "cp10", categoryId: "contrast", a: "The flight was delayed by three hours.", b: "We still made our connection.", model: "The flight was delayed by three hours, yet we still made our connection." },
  { id: "cp11", categoryId: "contrast", a: "The city center is expensive.", b: "The suburbs are quite affordable.", model: "The city center is expensive, while the suburbs are quite affordable." },
  { id: "cp12", categoryId: "contrast", a: "He had almost no experience.", b: "He got the job.", model: "Even though he had almost no experience, he got the job." },
  // Cause
  { id: "cp13", categoryId: "cause", a: "The road was closed.", b: "There was an accident earlier.", model: "The road was closed because there was an accident earlier." },
  { id: "cp14", categoryId: "cause", a: "She was promoted.", b: "She had consistently exceeded her targets.", model: "She was promoted since she had consistently exceeded her targets." },
  { id: "cp15", categoryId: "cause", a: "We postponed the picnic.", b: "It started raining heavily.", model: "We postponed the picnic because it started raining heavily." },
  { id: "cp16", categoryId: "cause", a: "Prices have gone up.", b: "Demand has increased sharply.", model: "Prices have gone up as demand has increased sharply." },
  { id: "cp17", categoryId: "cause", a: "He canceled the trip.", b: "His passport had expired.", model: "He canceled the trip because his passport had expired." },
  { id: "cp18", categoryId: "cause", a: "The plants died.", b: "Nobody watered them for two weeks.", model: "The plants died since nobody watered them for two weeks." },
  // Result
  { id: "cp19", categoryId: "result", a: "The printer ran out of ink.", b: "We couldn't finish the handouts.", model: "The printer ran out of ink, so we couldn't finish the handouts." },
  { id: "cp20", categoryId: "result", a: "Traffic was terrible this morning.", b: "Half the staff arrived late.", model: "Traffic was terrible this morning, so half the staff arrived late." },
  { id: "cp21", categoryId: "result", a: "The company lost its biggest client.", b: "It had to lay off staff.", model: "The company lost its biggest client; as a result, it had to lay off staff." },
  { id: "cp22", categoryId: "result", a: "She hadn't slept in two days.", b: "She fell asleep during the meeting.", model: "She hadn't slept in two days, so she fell asleep during the meeting." },
  { id: "cp23", categoryId: "result", a: "The bridge was under repair.", b: "We had to take a long detour.", model: "The bridge was under repair, so we had to take a long detour." },
  { id: "cp24", categoryId: "result", a: "Sales dropped sharply last quarter.", b: "The board called an emergency meeting.", model: "Sales dropped sharply last quarter; consequently, the board called an emergency meeting." },
  // Condition
  { id: "cp25", categoryId: "condition", a: "You leave now.", b: "You will catch the last train.", model: "If you leave now, you will catch the last train." },
  { id: "cp26", categoryId: "condition", a: "You don't book early.", b: "The tickets will sell out.", model: "Unless you book early, the tickets will sell out." },
  { id: "cp27", categoryId: "condition", a: "The weather stays dry.", b: "We'll have the wedding outdoors.", model: "As long as the weather stays dry, we'll have the wedding outdoors." },
  { id: "cp28", categoryId: "condition", a: "You finish the project on time.", b: "You'll get a bonus.", model: "If you finish the project on time, you'll get a bonus." },
  { id: "cp29", categoryId: "condition", a: "It's cold tonight.", b: "Bring a jacket just in case.", model: "Bring a jacket in case it's cold tonight." },
  { id: "cp30", categoryId: "condition", a: "You keep practicing every day.", b: "Your English will improve quickly.", model: "Provided that you keep practicing every day, your English will improve quickly." },
  // Time
  { id: "cp31", categoryId: "time", a: "We finished dinner.", b: "We went for a walk.", model: "After we finished dinner, we went for a walk." },
  { id: "cp32", categoryId: "time", a: "The guests arrived.", b: "She was still getting ready.", model: "The guests arrived while she was still getting ready." },
  { id: "cp33", categoryId: "time", a: "He heard the news.", b: "He called his sister immediately.", model: "As soon as he heard the news, he called his sister immediately." },
  { id: "cp34", categoryId: "time", a: "You leave the house.", b: "Double-check the stove is off.", model: "Before you leave the house, double-check the stove is off." },
  { id: "cp35", categoryId: "time", a: "The team finishes testing.", b: "The app will be released.", model: "Once the team finishes testing, the app will be released." },
  { id: "cp36", categoryId: "time", a: "She graduated.", b: "She moved to another country.", model: "After she graduated, she moved to another country." },
  // Purpose
  { id: "cp37", categoryId: "purpose", a: "He saved money for two years.", b: "He wanted to buy his own apartment.", model: "He saved money for two years so that he could buy his own apartment." },
  { id: "cp38", categoryId: "purpose", a: "She left work early.", b: "She wanted to catch her daughter's recital.", model: "She left work early in order to catch her daughter's recital." },
  { id: "cp39", categoryId: "purpose", a: "The company changed its logo.", b: "It wanted to appeal to a younger audience.", model: "The company changed its logo to appeal to a younger audience." },
  { id: "cp40", categoryId: "purpose", a: "We arrived an hour early.", b: "We wanted to get good seats.", model: "We arrived an hour early so that we could get good seats." },
  { id: "cp41", categoryId: "purpose", a: "He studies every evening.", b: "He wants to pass the exam.", model: "He studies every evening in order to pass the exam." },
  // Example
  { id: "cp42", categoryId: "example", a: "Many everyday habits harm the environment.", b: "Leaving devices on standby is one of them.", model: "Many everyday habits harm the environment, for example leaving devices on standby." },
  { id: "cp43", categoryId: "example", a: "The city offers several free attractions.", b: "The botanical garden and the history museum are two of them.", model: "The city offers several free attractions, such as the botanical garden and the history museum." },
  { id: "cp44", categoryId: "example", a: "Some fruits are surprisingly high in sugar.", b: "Grapes and mangoes are two of them.", model: "Some fruits are surprisingly high in sugar, for instance grapes and mangoes." },
  { id: "cp45", categoryId: "example", a: "The course covers several soft skills.", b: "Time management is one of the most important.", model: "The course covers several soft skills, namely time management among others." },
];
