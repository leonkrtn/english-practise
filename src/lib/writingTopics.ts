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
  {
    id: "t11",
    prompt: "Describe a difficult decision you had to make.",
    hint: "What were the options, and what made it hard to choose?",
  },
  {
    id: "t12",
    prompt: "Describe your ideal weekend.",
    hint: "What would you do, and who would you spend it with?",
  },
  {
    id: "t13",
    prompt: "Give your opinion on social media and its effect on people.",
    hint: "Think about both the benefits and the downsides.",
  },
  {
    id: "t14",
    prompt: "Describe a tradition from your culture or family.",
    hint: "What happens during it, and why does it matter to you?",
  },
  {
    id: "t15",
    prompt: "Talk about a time you overcame a challenge.",
    hint: "What was the challenge, and how did you deal with it?",
  },
  {
    id: "t16",
    prompt: "Describe what makes someone a good leader.",
    hint: "Think of qualities and give an example if you can.",
  },
  {
    id: "t17",
    prompt: "Describe how your neighborhood has changed over the years.",
    hint: "What's different now compared to before?",
  },
  {
    id: "t18",
    prompt: "Talk about a habit you'd like to build or break.",
    hint: "Why is it important to you, and what's stopping you?",
  },
  {
    id: "t19",
    prompt: "Give your opinion: should university education be free?",
    hint: "Consider the arguments for and against.",
  },
  {
    id: "t20",
    prompt: "Describe your first day at a new job or school.",
    hint: "What did you expect, and how did it actually go?",
  },
  {
    id: "t21",
    prompt: "Explain how climate change has affected your everyday life.",
    hint: "Think about weather, prices, habits, or awareness.",
  },
  {
    id: "t22",
    prompt: "Describe the best advice someone has ever given you.",
    hint: "Who gave it, and how has it helped you?",
  },
  {
    id: "t23",
    prompt: "Give your opinion: living in a big city vs. a small town.",
    hint: "Weigh the pros and cons of each.",
  },
  {
    id: "t24",
    prompt: "Describe how you deal with a difficult coworker or classmate.",
    hint: "What's the situation, and what do you do about it?",
  },
  {
    id: "t25",
    prompt: "Talk about your spending and saving habits.",
    hint: "Are you a saver or a spender, and why?",
  },
  {
    id: "t26",
    prompt: "Give your opinion: is it better to specialize in one skill or know a little of everything?",
    hint: "Give reasons for your view.",
  },
  {
    id: "t27",
    prompt: "Describe a place you dream of traveling to and why.",
    hint: "What draws you to it?",
  },
  {
    id: "t28",
    prompt: "Talk about how your eating habits have changed over time.",
    hint: "What used to be different, and what changed it?",
  },
  {
    id: "t29",
    prompt: "Give your opinion on AI and its effect on jobs.",
    hint: "Think about which jobs might change and how.",
  },
  {
    id: "t30",
    prompt: "Describe a long friendship and what keeps it strong.",
    hint: "How did it start, and why has it lasted?",
  },
  {
    id: "t31",
    prompt: "Give your opinion: would you want to work remotely forever?",
    hint: "Consider the benefits and drawbacks for you personally.",
  },
  {
    id: "t32",
    prompt: "Describe a mistake you learned something important from.",
    hint: "What happened, and what did you take away from it?",
  },
  {
    id: "t33",
    prompt: "Talk about what keeps you motivated when things get hard.",
    hint: "Think of a specific example.",
  },
  {
    id: "t34",
    prompt: "Give your opinion on work-life balance.",
    hint: "What does a good balance look like to you?",
  },
  {
    id: "t35",
    prompt: "Describe a time you helped someone, or someone helped you.",
    hint: "What happened, and what did it mean to you?",
  },
];
