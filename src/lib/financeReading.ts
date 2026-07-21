// Reading mode: multi-gap finance texts (B2–C2). Each text has a fixed pool of gap tokens
// ({{gapId}} inside `body`), each tagged by where it should be drawn from:
// - "finance": a finance/business term, always an interactive blank — the whole point of
//   this mode is exposure to that vocabulary, so it doesn't wait on prior progress.
// - "vocab": a word from the general Vocabulary track. Only becomes an interactive blank once
//   the learner has actually mastered that word (stage 4) — otherwise it's shown as plain text,
//   since blanking a word they've never seen would just be guessing. This is what makes the mix
//   of "already-learned words + finance vocabulary" personalized instead of one fixed text.
export type ReadingLevel = "B2" | "C1" | "C2";

export interface ReadingGap {
  id: string;
  /** The correct word/phrase for this gap, exactly as it appears in `body`'s prose. */
  answer: string;
  distractors: [string, string, string];
  source: "finance" | "vocab";
}

export interface ReadingText {
  id: string;
  level: ReadingLevel;
  topic: string;
  title: string;
  /** Prose with gap tokens as {{gapId}}. */
  body: string;
  gaps: ReadingGap[];
}

/** Which of a text's gaps should be interactive this session, given what's already learned. */
export function eligibleGapIds(text: ReadingText, isVocabLearned: (en: string) => boolean): Set<string> {
  const ids = new Set<string>();
  text.gaps.forEach((g) => {
    if (g.source === "finance" || isVocabLearned(g.answer)) ids.add(g.id);
  });
  return ids;
}

export const READING_TEXTS: ReadingText[] = [
  {
    id: "r1",
    level: "B2",
    topic: "Personal Finance",
    title: "Opening Your First Bank Account",
    body:
      "When you open a bank account for the first time, you usually have to choose between a current account and a savings account. A current account is meant for everyday {{g1}}, like paying bills or withdrawing cash, while a savings account is designed to help you {{g2}} money over time. Most banks now let you {{g3}} an account entirely online, without ever visiting a branch. Before you decide, it's worth comparing the monthly fees and the {{g4}} rate each bank offers, since even a small difference can add up over the years. Many young people are {{g5}} to open a second account purely for savings, so they aren't tempted to spend the money they set aside. It also makes it easier to see, at a glance, how much progress you've made toward a goal, such as {{g6}} a trip or a new laptop.",
    gaps: [
      { id: "g1", answer: "expenses", distractors: ["profits", "shares", "assets"], source: "finance" },
      { id: "g2", answer: "save", distractors: ["borrow", "owe", "lend"], source: "vocab" },
      { id: "g3", answer: "open", distractors: ["cancel", "freeze", "overdraw"], source: "finance" },
      { id: "g4", answer: "interest", distractors: ["dividend", "inflation", "revenue"], source: "finance" },
      { id: "g5", answer: "encouraged", distractors: ["forbidden", "obliged", "warned"], source: "vocab" },
      { id: "g6", answer: "affording", distractors: ["avoiding", "risking", "investing"], source: "vocab" },
    ],
  },
  {
    id: "r2",
    level: "B2",
    topic: "Personal Finance",
    title: "What Is a Budget?",
    body:
      "A budget is simply a plan for how you will spend and {{g1}} your money over a certain period, usually a month. The first step is to write down your income and then list your fixed {{g2}}, such as rent, insurance, and phone bills. Once you know what's left, you can decide how much to put toward groceries, going out, and savings. Many people find it hard to {{g3}} to a budget at first, especially if they're used to spending without tracking anything. A simple trick is to set a small, realistic {{g4}} for one category, like eating out, rather than trying to change everything at once. Over time, a good budget doesn't feel restrictive — it actually makes it easier to {{g5}} for things that really matter, because you already know the money is there. Some apps will even {{g6}} how much you'll have left by the end of the month.",
    gaps: [
      { id: "g1", answer: "save", distractors: ["borrow", "waste", "owe"], source: "vocab" },
      { id: "g2", answer: "expenses", distractors: ["assets", "shares", "profits"], source: "finance" },
      { id: "g3", answer: "stick", distractors: ["apply", "commit", "adjust"], source: "finance" },
      { id: "g4", answer: "budget", distractors: ["deposit", "dividend", "surplus"], source: "finance" },
      { id: "g5", answer: "afford", distractors: ["avoid", "risk", "invest"], source: "vocab" },
      { id: "g6", answer: "predict", distractors: ["repay", "recover", "reduce"], source: "vocab" },
    ],
  },
  {
    id: "r3",
    level: "B2",
    topic: "Personal Finance",
    title: "Saving vs. Spending",
    body:
      "Everyone has their own balance between saving and spending, and there's no single right answer for how much to set aside. Some financial advisors {{g1}} saving at least ten percent of your income, but that isn't realistic for everyone, especially early in a career. What matters more is being {{g2}} about why you're saving in the first place — is it for an {{g3}}, a house, or simply peace of mind? People who spend without any plan often {{g4}} to explain, later, where their money actually went. On the other hand, being too careful with every purchase can make life feel joyless. A useful habit is to {{g5}} your spending into needs, wants, and savings, and to check in on that balance every few months. Small, {{g6}} changes — like cooking at home twice a week — tend to work better than sudden, extreme ones.",
    gaps: [
      { id: "g1", answer: "recommend", distractors: ["forbid", "predict", "afford"], source: "finance" },
      { id: "g2", answer: "conscious", distractors: ["cautious", "confident", "reluctant"], source: "vocab" },
      { id: "g3", answer: "emergency", distractors: ["dividend", "subsidiary", "merger"], source: "finance" },
      { id: "g4", answer: "struggle", distractors: ["manage", "recover", "expand"], source: "vocab" },
      { id: "g5", answer: "divide", distractors: ["diversify", "leverage", "hedge"], source: "finance" },
      { id: "g6", answer: "gradual", distractors: ["excessive", "modest", "substantial"], source: "vocab" },
    ],
  },
  {
    id: "r4",
    level: "B2",
    topic: "Stocks & Investing",
    title: "How the Stock Market Works",
    body:
      "The stock market is a place — today, almost entirely online — where investors buy and sell small pieces of {{g1}} in public companies. When a company wants to raise money to grow, it can offer {{g2}} to the public in exchange for cash. If the company performs well, the {{g3}} tends to rise, meaning investors who bought early can sell for a profit. If it performs badly, the opposite happens. Prices don't only move based on how a company is actually doing, though — they're also driven by how investors {{g4}} the company will do in the future. This is why the market can feel unpredictable, and why it's generally considered {{g5}} to invest money you might need again soon. Most experts {{g6}} holding a mix of different companies rather than betting everything on one, so that a single bad result doesn't ruin your whole portfolio.",
    gaps: [
      { id: "g1", answer: "ownership", distractors: ["revenue", "liability", "leverage"], source: "finance" },
      { id: "g2", answer: "shares", distractors: ["bonds", "loans", "subsidies"], source: "finance" },
      { id: "g3", answer: "share price", distractors: ["credit score", "tax rate", "wage"], source: "finance" },
      { id: "g4", answer: "predict", distractors: ["repay", "afford", "encourage"], source: "vocab" },
      { id: "g5", answer: "risky", distractors: ["reliable", "profitable", "steady"], source: "vocab" },
      { id: "g6", answer: "recommend", distractors: ["forbid", "delay", "reject"], source: "finance" },
    ],
  },
  {
    id: "r5",
    level: "B2",
    topic: "Stocks & Investing",
    title: "What Are Shares?",
    body:
      "A share is simply a tiny piece of a company that you can buy, which makes you a part-owner alongside thousands of other shareholders. If the company makes a profit, it may choose to pay some of that money back to shareholders as a {{g1}}, usually a few times a year. Not every company does this — some prefer to {{g2}} the profit back into the business instead, to help it grow faster. As a shareholder, you also usually get the right to vote on major company decisions, although in practice most small investors don't bother. Buying individual shares can feel {{g3}}, because the value of one single company can rise or fall sharply within days. That's why many beginners choose to {{g4}} their money across dozens or hundreds of companies at once, often through a single {{g5}} that does the mixing for them. This is generally seen as a more {{g6}} way to start investing.",
    gaps: [
      { id: "g1", answer: "dividend", distractors: ["deposit", "subsidy", "premium"], source: "finance" },
      { id: "g2", answer: "invest", distractors: ["donate", "insure", "budget"], source: "vocab" },
      { id: "g3", answer: "risky", distractors: ["modest", "generous", "flexible"], source: "vocab" },
      { id: "g4", answer: "spread", distractors: ["hedge", "liquidate", "leverage"], source: "finance" },
      { id: "g5", answer: "fund", distractors: ["bond", "asset", "ledger"], source: "vocab" },
      { id: "g6", answer: "reliable", distractors: ["risky", "reluctant", "vulnerable"], source: "vocab" },
    ],
  },
  {
    id: "r6",
    level: "B2",
    topic: "Personal Finance",
    title: "Credit Cards Explained",
    body:
      "A credit card lets you borrow money from a bank up to a certain limit, which you then have to pay back, usually every month. If you {{g1}} the full balance on time, you typically pay no extra interest at all, which is why many people use credit cards for everyday purchases and rewards. But if you only pay part of the bill, the bank will {{g2}} interest on whatever you still {{g3}}, and that interest rate is often much higher than on a normal loan. Missing payments can also damage your {{g4}}, a number that lenders check before deciding whether to approve future loans, mortgages, or even some rental agreements. It's generally {{g5}} to think of a credit card as a payment tool, not as extra income — spending money you don't actually have can quietly turn into a serious problem. Setting up an automatic payment for at least the minimum amount is a simple way to {{g6}} missing a due date by accident.",
    gaps: [
      { id: "g1", answer: "repay", distractors: ["borrow", "invest", "insure"], source: "vocab" },
      { id: "g2", answer: "charge", distractors: ["waive", "refund", "deposit"], source: "finance" },
      { id: "g3", answer: "owe", distractors: ["earn", "save", "afford"], source: "vocab" },
      { id: "g4", answer: "credit score", distractors: ["tax bracket", "net worth", "profit margin"], source: "finance" },
      { id: "g5", answer: "cautious", distractors: ["generous", "confident", "reluctant"], source: "vocab" },
      { id: "g6", answer: "avoid", distractors: ["risk", "afford", "predict"], source: "finance" },
    ],
  },
  {
    id: "r7",
    level: "B2",
    topic: "Economics",
    title: "Understanding Inflation",
    body:
      "Inflation is the rate at which prices for everyday goods and services {{g1}} rise over time, which means the same amount of money buys a little less each year. A small, {{g2}} amount of inflation is actually considered healthy for an economy, since it encourages people to spend and invest rather than keep all their cash under a mattress. Problems appear when inflation rises too quickly, because wages usually take longer to catch up, and everyday life can suddenly feel far more {{g3}} than it did a year before. Central banks try to keep inflation under control mainly by adjusting {{g4}} rates — raising them tends to slow spending down, while lowering them tends to {{g5}} it. If someone keeps their savings entirely in cash for many years, inflation can quietly {{g6}} the real value of that money, even though the number in the account never actually goes down.",
    gaps: [
      { id: "g1", answer: "gradually", distractors: ["excessively", "reluctantly", "cautiously"], source: "vocab" },
      { id: "g2", answer: "steady", distractors: ["risky", "generous", "modest"], source: "vocab" },
      { id: "g3", answer: "expensive", distractors: ["profitable", "liquid", "diversified"], source: "finance" },
      { id: "g4", answer: "interest", distractors: ["dividend", "tax", "exchange"], source: "finance" },
      { id: "g5", answer: "encourage", distractors: ["reduce", "predict", "recover"], source: "vocab" },
      { id: "g6", answer: "reduce", distractors: ["boost", "insure", "diversify"], source: "vocab" },
    ],
  },
  {
    id: "r8",
    level: "B2",
    topic: "Business",
    title: "Why Companies Go Public",
    body:
      "When a company decides to sell shares to the public for the first time, this is called an {{g1}} — an initial public offering. Before that, the company is usually owned by its founders and a small group of private investors. Going public allows a company to {{g2}} a large amount of money very quickly, which it can then use to grow, hire more staff, or {{g3}} into new markets. In return, the company has to share detailed financial information with the public and answer to thousands of new shareholders, which some founders find quite {{g4}}. It's a major milestone, but not always a positive one for everyone involved — employees who received {{g5}} instead of a higher salary can suddenly become very wealthy overnight, while others may feel the company has lost some of its original culture. Many well-known technology companies chose to stay private for years before finally deciding to {{g6}} public.",
    gaps: [
      { id: "g1", answer: "IPO", distractors: ["ETF", "APR", "P&L"], source: "finance" },
      { id: "g2", answer: "raise", distractors: ["insure", "audit", "hedge"], source: "finance" },
      { id: "g3", answer: "expand", distractors: ["struggle", "recover", "owe"], source: "vocab" },
      { id: "g4", answer: "uncomfortable", distractors: ["profitable", "reliable", "flexible"], source: "finance" },
      { id: "g5", answer: "shares", distractors: ["bonds", "subsidies", "grants"], source: "finance" },
      { id: "g6", answer: "go", distractors: ["stay", "remain", "keep"], source: "finance" },
    ],
  },
  {
    id: "r9",
    level: "C1",
    topic: "Stocks & Investing",
    title: "Diversifying Your Portfolio",
    body:
      "Diversification is one of the oldest pieces of advice in investing, and for good reason: spreading your money across different assets reduces the impact any single bad outcome can have on your overall {{g1}}. Instead of putting all your savings into one company's shares, an investor might hold a mix of stocks, bonds, and perhaps some property, since these asset types don't usually rise and fall at exactly the same time. When stocks are performing poorly, bonds often hold up better, which can help {{g2}} the losses elsewhere. It's also common to {{g3}} within a single asset class — owning shares in companies from several different industries and countries, rather than concentrating everything in one sector that could suddenly become {{g4}}. This doesn't guarantee you'll never lose money, and a highly diversified portfolio is unlikely to make you rich overnight either. What it does is make the ride considerably smoother, which matters enormously to people who can't {{g5}} to watch their retirement savings swing wildly from month to month, and who need their plan to remain {{g6}} over decades.",
    gaps: [
      { id: "g1", answer: "portfolio", distractors: ["ledger", "liability", "subsidiary"], source: "finance" },
      { id: "g2", answer: "offset", distractors: ["multiply", "liquidate", "leverage"], source: "finance" },
      { id: "g3", answer: "diversify", distractors: ["consolidate", "liquidate", "leverage"], source: "finance" },
      { id: "g4", answer: "vulnerable", distractors: ["profitable", "generous", "reliable"], source: "vocab" },
      { id: "g5", answer: "afford", distractors: ["risk", "predict", "encourage"], source: "vocab" },
      { id: "g6", answer: "sustainable", distractors: ["excessive", "reluctant", "modest"], source: "vocab" },
    ],
  },
  {
    id: "r10",
    level: "C1",
    topic: "Cryptocurrency",
    title: "The Rise of Cryptocurrency",
    body:
      "Cryptocurrency began as a fairly obscure experiment among computer scientists but has since grown into an asset class that even traditional banks can no longer afford to {{g1}}. Unlike a normal currency issued by a government, most {{g2}} run on a decentralized network of computers, with no single company or country fully in control. Supporters argue this makes the system more resistant to political interference and more transparent, since every transaction is permanently recorded on a public {{g3}}. Critics point out that prices can be extraordinarily {{g4}}, sometimes rising or falling by double-digit percentages within a single day, which makes it a poor choice for anyone who can't {{g5}} losing a significant portion of their investment. Governments have also struggled to agree on how to {{g6}} this new kind of asset, with some countries embracing it enthusiastically and others banning it outright. Whatever happens next, the underlying technology has already forced many established financial institutions to rethink how they operate.",
    gaps: [
      { id: "g1", answer: "ignore", distractors: ["insure", "audit", "diversify"], source: "finance" },
      { id: "g2", answer: "cryptocurrencies", distractors: ["subsidiaries", "securities", "liabilities"], source: "finance" },
      { id: "g3", answer: "ledger", distractors: ["portfolio", "margin", "premium"], source: "finance" },
      { id: "g4", answer: "volatile", distractors: ["reliable", "modest", "generous"], source: "finance" },
      { id: "g5", answer: "afford", distractors: ["avoid", "predict", "recover"], source: "vocab" },
      { id: "g6", answer: "regulate", distractors: ["liquidate", "subsidize", "audit"], source: "finance" },
    ],
  },
  {
    id: "r11",
    level: "C1",
    topic: "Economics",
    title: "How Interest Rates Affect the Economy",
    body:
      "Central banks use interest rates as one of their main tools to steer an entire economy, even though most people only notice them through their mortgage or savings account. When a central bank raises rates, borrowing becomes more expensive, which tends to {{g1}} spending and cool down an economy that's growing too fast or where inflation has become {{g2}}. Lowering rates has roughly the opposite effect: it makes loans cheaper, which can {{g3}} businesses to invest and consumers to spend, helping a struggling economy {{g4}}. The tricky part is that these effects don't happen immediately — it can take many months for a rate change to fully work its way through the economy, which forces central banks to act based on {{g5}} rather than certainty. A rate that's raised too aggressively risks pushing an economy into recession, while one kept too low for too long risks letting inflation spiral out of control. Balancing these two dangers is arguably one of the hardest jobs in modern economic policy, and even experienced economists frequently {{g6}}.",
    gaps: [
      { id: "g1", answer: "reduce", distractors: ["boost", "diversify", "insure"], source: "vocab" },
      { id: "g2", answer: "excessive", distractors: ["modest", "gradual", "steady"], source: "vocab" },
      { id: "g3", answer: "encourage", distractors: ["forbid", "delay", "audit"], source: "vocab" },
      { id: "g4", answer: "recover", distractors: ["expand", "collapse", "diversify"], source: "vocab" },
      { id: "g5", answer: "predictions", distractors: ["dividends", "subsidies", "liabilities"], source: "finance" },
      { id: "g6", answer: "disagree", distractors: ["diversify", "liquidate", "default"], source: "finance" },
    ],
  },
  {
    id: "r12",
    level: "C1",
    topic: "Business",
    title: "Mergers and Acquisitions",
    body:
      "When one company buys another outright, it's usually called an {{g1}}; when two companies of roughly similar size combine into a single new entity, that's typically described as a {{g2}}. Companies pursue these deals for a range of reasons — to eliminate a competitor, to gain access to new technology or customers, or simply because it's cheaper to buy an existing business than to {{g3}} a similar one from scratch. The process is rarely smooth. Combining two separate company cultures, IT systems, and management teams can take years, and a significant number of deals ultimately fail to deliver the benefits that were originally {{g4}}. Employees at the company being acquired often feel particularly {{g5}}, since restructuring and layoffs frequently follow soon after a deal closes. Regulators also play a major role: if a merger would give the combined company too much power over a single market, competition authorities can block the deal entirely or demand that certain parts of the business be sold off before they'll {{g6}} it.",
    gaps: [
      { id: "g1", answer: "acquisition", distractors: ["subsidiary", "dividend", "liability"], source: "finance" },
      { id: "g2", answer: "merger", distractors: ["acquisition", "buyout", "default"], source: "finance" },
      { id: "g3", answer: "build", distractors: ["insure", "audit", "liquidate"], source: "finance" },
      { id: "g4", answer: "predicted", distractors: ["afforded", "encouraged", "repaid"], source: "vocab" },
      { id: "g5", answer: "vulnerable", distractors: ["confident", "generous", "flexible"], source: "vocab" },
      { id: "g6", answer: "approve", distractors: ["subsidize", "liquidate", "insure"], source: "finance" },
    ],
  },
  {
    id: "r13",
    level: "C1",
    topic: "Stocks & Investing",
    title: "Understanding Bonds",
    body:
      "A bond is essentially a loan that an investor makes to a government or a company, in exchange for regular interest payments and the return of the original amount once the bond matures. Unlike shares, buying a bond doesn't make you a part-owner of anything — you're simply {{g1}} money to be repaid on agreed terms, which is generally considered a more {{g2}} way to invest, though rarely as profitable in the long run. Bond prices move in a way that often confuses beginners: when interest rates rise, existing bonds that pay a lower rate become less attractive, so their price on the market tends to fall. The {{g3}} a bond pays out relative to its price is what investors watch closely, since that figure ultimately determines the real return. Government bonds from stable countries are usually seen as one of the safest investments available, while bonds issued by companies with a shaky financial history — often called “high-yield” or “junk” bonds — {{g4}} much higher interest to {{g5}} investors for the extra risk that the company might fail to {{g6}} what it owes.",
    gaps: [
      { id: "g1", answer: "lending", distractors: ["donating", "insuring", "spending"], source: "vocab" },
      { id: "g2", answer: "reliable", distractors: ["profitable", "flexible", "generous"], source: "vocab" },
      { id: "g3", answer: "yield", distractors: ["premium", "margin", "surplus"], source: "finance" },
      { id: "g4", answer: "offer", distractors: ["waive", "insure", "audit"], source: "finance" },
      { id: "g5", answer: "compensate", distractors: ["discourage", "predict", "reassure"], source: "finance" },
      { id: "g6", answer: "repay", distractors: ["earn", "invest", "afford"], source: "vocab" },
    ],
  },
  {
    id: "r14",
    level: "C1",
    topic: "Personal Finance",
    title: "The Basics of Compound Interest",
    body:
      "Compound interest is often called one of the most powerful forces in personal finance, and once you understand it, it's easy to see why. Unlike simple interest, which is calculated only on the original amount you {{g1}}, compound interest is calculated on that original amount plus whatever interest has already been added — meaning your money effectively starts earning interest on its own interest. Over short periods, the difference is barely noticeable, but over decades it becomes dramatic: a modest sum invested consistently in your twenties can grow to far {{g2}} more than the same amount invested later, purely because it had more time to compound. This is precisely why financial advisors so often {{g3}} starting to save early, even in small amounts, rather than waiting until you can {{g4}} to invest larger sums. The same principle works against you with debt, however — interest on an unpaid credit card balance compounds too, which is exactly why that kind of debt can {{g5}} so quickly if it's left {{g6}} for a long time.",
    gaps: [
      { id: "g1", answer: "invested", distractors: ["donated", "insured", "audited"], source: "vocab" },
      { id: "g2", answer: "substantial", distractors: ["modest", "gradual", "steady"], source: "vocab" },
      { id: "g3", answer: "recommend", distractors: ["forbid", "delay", "predict"], source: "finance" },
      { id: "g4", answer: "afford", distractors: ["risk", "encourage", "avoid"], source: "vocab" },
      { id: "g5", answer: "grow", distractors: ["shrink", "vanish", "freeze"], source: "finance" },
      { id: "g6", answer: "unpaid", distractors: ["insured", "diversified", "audited"], source: "finance" },
    ],
  },
  {
    id: "r15",
    level: "C1",
    topic: "Business",
    title: "Startups and Venture Capital",
    body:
      "A startup usually begins with very little money and a great deal of risk, which is exactly the combination that venture capital firms are built to handle. These firms {{g1}} money from wealthy individuals and institutions, then invest it in a large number of young companies, fully expecting that most of them will eventually fail. The strategy only works because a small number of successful startups can grow so large that they cover the losses from all the others many times over. In exchange for their investment, venture capitalists typically receive a {{g2}} of the company's shares, along with the expectation that the startup will eventually be sold or go public, giving them a way to {{g3}} their profit. Founders who accept this kind of funding usually have to give up a degree of control over their own company, since investors often want a seat on the board and a say in major decisions. Not every founder finds this trade-off {{g4}} — some deliberately choose to stay small and independent, funding growth purely through {{g5}}, which means relying entirely on the revenue the business itself generates rather than {{g6}} money from outside investors.",
    gaps: [
      { id: "g1", answer: "raise", distractors: ["insure", "audit", "waive"], source: "finance" },
      { id: "g2", answer: "stake", distractors: ["subsidy", "premium", "ledger"], source: "finance" },
      { id: "g3", answer: "realize", distractors: ["insure", "diversify", "audit"], source: "finance" },
      { id: "g4", answer: "acceptable", distractors: ["profitable", "reliable", "vulnerable"], source: "finance" },
      { id: "g5", answer: "bootstrapping", distractors: ["auditing", "hedging", "subsidizing"], source: "finance" },
      { id: "g6", answer: "borrowing", distractors: ["insuring", "donating", "auditing"], source: "vocab" },
    ],
  },
  {
    id: "r16",
    level: "C1",
    topic: "Business",
    title: "Reading a Company's Balance Sheet",
    body:
      "A balance sheet is a snapshot, taken at one specific moment, of everything a company owns and everything it owes. On one side sit the company's {{g1}} — cash, property, equipment, and anything else of value it controls. On the other side sit its liabilities, meaning debts and other obligations it will eventually have to {{g2}}. The difference between the two is known as shareholders' equity, essentially what would be left over for the owners if the company sold everything and paid off every debt at once. Investors {{g3}} balance sheets closely because a company that looks profitable on paper can still be in serious trouble if it has taken on far more debt than it can realistically manage. A healthy balance sheet usually shows a company with enough {{g4}} assets — cash or things that can quickly be turned into cash — to cover its short-term obligations comfortably. A company that consistently struggles to do this, even while reporting profits elsewhere, is often described as {{g5}}, and can eventually be forced into bankruptcy if the situation doesn't {{g6}}.",
    gaps: [
      { id: "g1", answer: "assets", distractors: ["liabilities", "subsidies", "dividends"], source: "finance" },
      { id: "g2", answer: "repay", distractors: ["earn", "invest", "afford"], source: "vocab" },
      { id: "g3", answer: "examine", distractors: ["ignore", "waive", "subsidize"], source: "finance" },
      { id: "g4", answer: "liquid", distractors: ["diversified", "leveraged", "insured"], source: "finance" },
      { id: "g5", answer: "vulnerable", distractors: ["profitable", "generous", "reliable"], source: "vocab" },
      { id: "g6", answer: "improve", distractors: ["expand", "recover", "reduce"], source: "vocab" },
    ],
  },
  {
    id: "r17",
    level: "C1",
    topic: "Stocks & Investing",
    title: "Bull Markets and Bear Markets",
    body:
      "Investors often describe long periods of rising prices as a “bull market” and long periods of falling prices as a “bear market,” although nobody agrees entirely on where the terms originally came from. During a bull market, {{g1}} tends to be high, more people feel comfortable investing, and even fairly ordinary news can be enough to push prices further up. This optimism can eventually become a problem of its own: when prices rise mainly because everyone {{g2}} them to keep rising, rather than because companies are actually becoming more valuable, many analysts start to worry about a {{g3}}. A bear market feels very different — pessimism dominates, investors {{g4}} selling to limit their losses, and even genuinely good news can fail to move prices upward. Trying to guess exactly when one period will turn into the other has proven extremely difficult, even for professional investors, which is why so many financial advisors {{g5}} staying invested through both kinds of markets rather than attempting to time them perfectly. History suggests that markets have always eventually {{g6}} from even the sharpest downturns, though how long that takes can vary enormously.",
    gaps: [
      { id: "g1", answer: "confidence", distractors: ["liability", "subsidy", "margin"], source: "finance" },
      { id: "g2", answer: "expects", distractors: ["avoids", "risks", "affords"], source: "vocab" },
      { id: "g3", answer: "bubble", distractors: ["merger", "ledger", "subsidy"], source: "finance" },
      { id: "g4", answer: "rush", distractors: ["hesitate", "decline", "hedge"], source: "finance" },
      { id: "g5", answer: "recommend", distractors: ["forbid", "predict", "delay"], source: "finance" },
      { id: "g6", answer: "recovered", distractors: ["collapsed", "diversified", "expanded"], source: "vocab" },
    ],
  },
  {
    id: "r18",
    level: "C1",
    topic: "Personal Finance",
    title: "Building an Emergency Fund",
    body:
      "Financial advisors almost universally {{g1}} building an emergency fund before investing in anything riskier, and for good reason: unexpected expenses have a habit of arriving at exactly the worst possible time. Most experts suggest {{g2}} enough to cover three to six months of essential living costs, kept somewhere easily accessible rather than tied up in investments that could lose value right when you need the money most. The idea isn't to earn the highest possible {{g3}} on this particular pot of money — it's simply to make sure that a sudden job loss, medical bill, or car repair doesn't force you to {{g4}} money at a high interest rate or sell investments at a bad moment. Building this kind of fund from nothing can feel {{g5}}, especially on a modest income, but even small, automatic transfers each month add up faster than most people expect. Once the fund is fully built, many people find they can finally {{g6}} to take slightly more risk with the rest of their savings, precisely because they know they have a safety net underneath them.",
    gaps: [
      { id: "g1", answer: "recommend", distractors: ["forbid", "predict", "delay"], source: "finance" },
      { id: "g2", answer: "saving", distractors: ["donating", "insuring", "auditing"], source: "vocab" },
      { id: "g3", answer: "return", distractors: ["subsidy", "premium", "ledger"], source: "finance" },
      { id: "g4", answer: "borrow", distractors: ["invest", "insure", "audit"], source: "vocab" },
      { id: "g5", answer: "overwhelming", distractors: ["profitable", "reliable", "flexible"], source: "finance" },
      { id: "g6", answer: "afford", distractors: ["risk", "predict", "encourage"], source: "vocab" },
    ],
  },
  {
    id: "r19",
    level: "C2",
    topic: "Economics",
    title: "Central Banks and Monetary Policy",
    body:
      "Central banks occupy a strange position in modern economies: technically independent from elected governments in most developed countries, yet capable of decisions that shape the financial lives of millions almost overnight. Their primary tool, {{g1}} policy, revolves around controlling the money supply and interest rates in pursuit of two often-conflicting goals — keeping inflation low and stable while also supporting employment and growth. In ordinary times, this mostly means small, incremental adjustments to a benchmark interest rate. During a genuine crisis, however, central banks have shown they're willing to go far further, including {{g2}} enormous sums of newly created money into the financial system, a policy widely known as quantitative easing. Critics argue this kind of intervention distorts markets and rewards those who already hold {{g3}}, since asset prices tend to rise when money is cheap and plentiful. Defenders counter that the alternative — allowing a financial system to seize up entirely — would have been far more {{g4}} for ordinary people, most of whom don't own significant investments at all. The independence of central banks from short-term political pressure remains one of the more {{g5}} arrangements in modern governance: essential, according to most economists, for credible long-term policy, yet inherently difficult to reconcile with democratic {{g6}}.",
    gaps: [
      { id: "g1", answer: "monetary", distractors: ["fiscal", "trade", "labor"], source: "finance" },
      { id: "g2", answer: "injecting", distractors: ["auditing", "insuring", "subsidizing"], source: "finance" },
      { id: "g3", answer: "assets", distractors: ["liabilities", "subsidies", "dividends"], source: "finance" },
      { id: "g4", answer: "damaging", distractors: ["profitable", "reliable", "modest"], source: "finance" },
      { id: "g5", answer: "controversial", distractors: ["profitable", "reliable", "flexible"], source: "finance" },
      { id: "g6", answer: "accountability", distractors: ["liability", "subsidy", "liquidity"], source: "finance" },
    ],
  },
  {
    id: "r20",
    level: "C2",
    topic: "Economics",
    title: "The 2008 Financial Crisis Explained",
    body:
      "The 2008 financial crisis is often traced back to the American housing market, where banks had spent years {{g1}} money to homebuyers who, in many cases, had little realistic chance of repaying it. These risky mortgages were then bundled together and sold on to investors around the world as seemingly safe financial products, a process that obscured just how much risk the wider financial system had quietly {{g2}}. When large numbers of homeowners began defaulting at once, the value of these bundled products collapsed, and banks that had bet heavily on them suddenly found themselves facing losses far larger than anyone had {{g3}}. Because major banks were so deeply connected to one another through loans and other financial commitments, the failure of a few institutions threatened to bring down the entire global banking system, forcing governments to step in with enormous rescue packages to prevent a total {{g4}}. The crisis destroyed trillions of dollars in wealth, pushed unemployment sharply higher across much of the world, and left many ordinary people permanently more {{g5}} of financial institutions. In its aftermath, regulators introduced stricter rules intended to make banks hold more capital in reserve, so they would be better able to {{g6}} future shocks without needing another taxpayer-funded rescue.",
    gaps: [
      { id: "g1", answer: "lending", distractors: ["donating", "insuring", "auditing"], source: "vocab" },
      { id: "g2", answer: "accumulated", distractors: ["insured", "audited", "subsidized"], source: "finance" },
      { id: "g3", answer: "predicted", distractors: ["afforded", "encouraged", "repaid"], source: "vocab" },
      { id: "g4", answer: "collapse", distractors: ["merger", "surplus", "rebound"], source: "vocab" },
      { id: "g5", answer: "cautious", distractors: ["confident", "generous", "reluctant"], source: "vocab" },
      { id: "g6", answer: "withstand", distractors: ["subsidize", "liquidate", "diversify"], source: "finance" },
    ],
  },
  {
    id: "r21",
    level: "C2",
    topic: "Stocks & Investing",
    title: "Hedge Funds and Risk Management",
    body:
      "Hedge funds occupy a peculiar niche in the investment world: largely unregulated compared to ordinary mutual funds, open only to wealthy individuals and institutions, and free to pursue strategies that most conventional investors would consider far too {{g1}}. The name itself comes from “hedging,” the practice of taking positions specifically designed to {{g2}} against losses elsewhere in a portfolio, though in practice many hedge funds today pursue aggressive, high-risk strategies that have little to do with hedging in the original sense. Some borrow enormous sums to {{g3}} their bets, meaning a relatively small market movement can produce outsized gains — or, just as easily, catastrophic losses that threaten the fund's survival entirely. Their fee structures have long attracted criticism, since many charge substantial fees regardless of performance, on top of a share of any profits generated. Supporters argue that skilled hedge fund managers can genuinely {{g4}} the wider market over the long run and provide valuable {{g5}} to financial markets by taking on risks other investors are unwilling to. Critics counter that, on average, hedge funds have struggled to consistently beat much simpler and cheaper investment strategies, once their considerable fees are properly accounted for, making them a questionable choice for anyone who isn't already extremely {{g6}}.",
    gaps: [
      { id: "g1", answer: "risky", distractors: ["reliable", "modest", "steady"], source: "vocab" },
      { id: "g2", answer: "protect", distractors: ["subsidize", "liquidate", "audit"], source: "finance" },
      { id: "g3", answer: "leverage", distractors: ["diversify", "liquidate", "audit"], source: "finance" },
      { id: "g4", answer: "outperform", distractors: ["subsidize", "liquidate", "audit"], source: "finance" },
      { id: "g5", answer: "liquidity", distractors: ["subsidy", "premium", "surplus"], source: "finance" },
      { id: "g6", answer: "wealthy", distractors: ["cautious", "confident", "reluctant"], source: "vocab" },
    ],
  },
  {
    id: "r22",
    level: "C2",
    topic: "Cryptocurrency",
    title: "Blockchain Beyond Bitcoin",
    body:
      "While most people first encounter blockchain technology through Bitcoin, the underlying idea has since spread into applications that have very little to do with currency at all. At its core, a blockchain is simply a shared record of information, maintained across a large network of computers rather than a single central server, and designed so that once information has been added, it becomes extremely difficult to {{g1}} without the network noticing. This property has proven useful well beyond finance: supply chain companies use it to {{g2}} products as they move from factory to shelf, and some legal systems have experimented with using it to record property ownership more transparently. Within finance itself, so-called “smart contracts” — self-executing agreements written directly into blockchain code — have enabled entirely new kinds of {{g3}}, allowing people to lend, borrow, and trade assets without needing a traditional bank as an intermediary at all. Enthusiasts argue this could eventually make financial services more accessible to people who currently have no access to traditional banking. Skeptics point to the technology's significant energy consumption, its continued vulnerability to fraud and technical failure, and the fact that most {{g4}} use cases still remain more {{g5}} than genuinely useful. Whether blockchain ultimately transforms entire industries or ends up confined to a handful of {{g6}} applications remains one of the more open questions in modern technology.",
    gaps: [
      { id: "g1", answer: "alter", distractors: ["insure", "audit", "subsidize"], source: "finance" },
      { id: "g2", answer: "track", distractors: ["insure", "audit", "subsidize"], source: "finance" },
      { id: "g3", answer: "transactions", distractors: ["subsidies", "liabilities", "premiums"], source: "finance" },
      { id: "g4", answer: "proposed", distractors: ["insured", "audited", "subsidized"], source: "finance" },
      { id: "g5", answer: "theoretical", distractors: ["profitable", "reliable", "modest"], source: "finance" },
      { id: "g6", answer: "niche", distractors: ["profitable", "reliable", "flexible"], source: "finance" },
    ],
  },
  {
    id: "r23",
    level: "C2",
    topic: "Business",
    title: "Corporate Debt and Leverage",
    body:
      "Businesses, unlike most individuals, are often actively {{g1}} to take on debt, provided it's used sensibly, since borrowed money can allow a company to grow far faster than it could using only its own profits. This use of borrowed money to amplify potential returns is known as {{g2}}, and it works exactly the same way in both directions — it can dramatically boost profits during good years and just as dramatically {{g3}} losses during bad ones. A highly leveraged company that suddenly faces falling revenue can find itself unable to make its debt payments, even if the underlying business is otherwise perfectly sound, which is precisely how a temporary downturn can turn into a full {{g4}}. Credit rating agencies exist largely to help investors judge how {{g5}} a given company's debt actually is, assigning ratings that heavily influence how much interest a company has to offer when it wants to borrow. A company with a poor credit rating will typically have to pay a much higher interest rate to attract lenders willing to accept the additional risk, which can, in turn, make its financial situation even more {{g6}}, creating a difficult cycle to escape from once it begins.",
    gaps: [
      { id: "g1", answer: "encouraged", distractors: ["forbidden", "obliged", "warned"], source: "vocab" },
      { id: "g2", answer: "leverage", distractors: ["liquidity", "subsidy", "margin"], source: "finance" },
      { id: "g3", answer: "amplify", distractors: ["subsidize", "insure", "liquidate"], source: "finance" },
      { id: "g4", answer: "bankruptcy", distractors: ["merger", "surplus", "rebound"], source: "finance" },
      { id: "g5", answer: "reliable", distractors: ["profitable", "generous", "flexible"], source: "vocab" },
      { id: "g6", answer: "precarious", distractors: ["profitable", "reliable", "modest"], source: "finance" },
    ],
  },
  {
    id: "r24",
    level: "C2",
    topic: "Economics",
    title: "Behavioral Economics and Investor Psychology",
    body:
      "Traditional economic theory has long assumed that investors act rationally, carefully weighing risk and reward before making a decision. Behavioral economics has spent decades systematically {{g1}} that assumption, showing instead that human psychology introduces predictable and often costly biases into financial decision-making. One of the best-documented is loss aversion: people tend to feel the pain of a loss roughly twice as strongly as the pleasure of an equivalent gain, which can {{g2}} investors to hold on to a failing investment far longer than makes any rational sense, purely to avoid formally “realizing” the loss. Another is herd behavior, in which investors {{g3}} the decisions of those around them rather than conducting independent analysis, helping to explain why market bubbles can inflate so dramatically before eventually {{g4}}. Overconfidence is a further, particularly stubborn bias: even professional fund managers, whose entire careers depend on accurately assessing risk, consistently {{g5}} their own ability to predict where markets are headed. Recognizing these patterns doesn't make anyone immune to them — awareness alone rarely overrides deeply ingrained instinct — but it has reshaped how many financial advisors design products and advice, building in {{g6}} defaults and gentle nudges specifically intended to work with human psychology rather than naively assuming against it.",
    gaps: [
      { id: "g1", answer: "undermining", distractors: ["subsidizing", "insuring", "auditing"], source: "finance" },
      { id: "g2", answer: "encourage", distractors: ["forbid", "predict", "afford"], source: "vocab" },
      { id: "g3", answer: "imitate", distractors: ["subsidize", "insure", "liquidate"], source: "finance" },
      { id: "g4", answer: "collapsing", distractors: ["merging", "rebounding", "diversifying"], source: "vocab" },
      { id: "g5", answer: "overestimate", distractors: ["subsidize", "insure", "liquidate"], source: "finance" },
      { id: "g6", answer: "sensible", distractors: ["excessive", "reluctant", "modest"], source: "vocab" },
    ],
  },
  {
    id: "r25",
    level: "C2",
    topic: "Stocks & Investing",
    title: "The Ethics of Short Selling",
    body:
      "Short selling allows an investor to profit when a company's share price falls, essentially by borrowing shares, selling them immediately, and hoping to {{g1}} them later at a lower price to return to the lender, pocketing the difference. It's a strategy that has always attracted controversy, since it means certain investors are openly betting on — and in some cases actively publicizing research intended to accelerate — another company's decline. Defenders argue that short sellers play a genuinely valuable role in {{g2}} markets, since their research has repeatedly exposed corporate fraud and mismanagement long before regulators or ordinary investors caught on, effectively acting as an unofficial check on companies that might otherwise get away with misleading their shareholders. Critics counter that short selling can become self-fulfilling and destructive, particularly when a company is already fragile: aggressive short selling can spook other investors into selling as well, driving the price down further and potentially pushing an otherwise {{g3}} company toward a crisis it might have avoided entirely. Short selling carries a distinctive risk that ordinary investing doesn't: because a share price can theoretically rise without any {{g4}}, potential losses on a short position are, at least in theory, unlimited, whereas someone who simply buys shares can never lose more than they originally {{g5}}. This unusually asymmetric risk explains why short selling remains largely the domain of experienced, well-capitalized investors rather than casual ones, and why regulators continue to {{g6}} it far more closely than ordinary buying and selling.",
    gaps: [
      { id: "g1", answer: "repurchase", distractors: ["insure", "audit", "subsidize"], source: "finance" },
      { id: "g2", answer: "healthy", distractors: ["liquid", "leveraged", "diversified"], source: "vocab" },
      { id: "g3", answer: "viable", distractors: ["profitable", "reliable", "modest"], source: "finance" },
      { id: "g4", answer: "limit", distractors: ["subsidy", "premium", "surplus"], source: "finance" },
      { id: "g5", answer: "invested", distractors: ["donated", "insured", "audited"], source: "vocab" },
      { id: "g6", answer: "scrutinize", distractors: ["subsidize", "liquidate", "diversify"], source: "finance" },
    ],
  },
];
