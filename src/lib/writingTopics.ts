export interface WritingTopic {
  id: string;
  prompt: string;
  hint: string;
}

export const WRITING_MIN_WORDS = 5;
export const WRITING_MIN_RULES = 2;

/** 10 base topic templates ("Grundgerüste"). Combined with a fresh random pick of required words
 * and grammar rules on every attempt, so the actual task feels different each time even though
 * the pool of topics itself is fixed. */
export const WRITING_TOPICS: WritingTopic[] = [
  {
    id: "t1",
    prompt: "Describe your typical day, from morning to evening.",
    hint: "What do you usually do, and in what order?",
  },
  {
    id: "t2",
    prompt: "Talk about a trip you took, or one you'd like to take.",
    hint: "Where did you go (or want to go), and why?",
  },
  {
    id: "t3",
    prompt: "Describe a person who inspires you and explain why.",
    hint: "What do they do, and what do you admire about them?",
  },
  {
    id: "t4",
    prompt: "Give your opinion: working from home vs. working in an office.",
    hint: "What are the advantages and disadvantages of each?",
  },
  {
    id: "t5",
    prompt: "Describe your hometown or the city you live in.",
    hint: "What is it known for, and what do you like or dislike about it?",
  },
  {
    id: "t6",
    prompt: "Talk about a skill you'd like to learn and why.",
    hint: "How would you start learning it?",
  },
  {
    id: "t7",
    prompt: "Describe a memorable meal or restaurant experience.",
    hint: "What made it memorable — the food, the company, the place?",
  },
  {
    id: "t8",
    prompt: "Explain how technology has changed your daily life.",
    hint: "Think about communication, work, or free time.",
  },
  {
    id: "t9",
    prompt: "Talk about a book, film, or show that made an impression on you.",
    hint: "What was it about, and why did it stay with you?",
  },
  {
    id: "t10",
    prompt: "Describe your plans or goals for the next five years.",
    hint: "Personal, professional, or both.",
  },
];
