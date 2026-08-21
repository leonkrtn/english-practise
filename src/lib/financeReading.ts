// Reading mode: complex, advanced-level (C1/C2) finance texts. Each text is read in full, then
// checked with a fixed set of multiple-choice comprehension questions, then compared against a
// model summary the learner writes their own version against — see ReadingScreen.tsx for the flow.

export type ReadingTopic =
  | "monetary-policy"
  | "inflation"
  | "stock-markets"
  | "mergers-acquisitions"
  | "venture-capital"
  | "bonds"
  | "cryptocurrency"
  | "forex"
  | "private-equity"
  | "ipo"
  | "corporate-governance"
  | "derivatives"
  | "credit-ratings"
  | "behavioral-finance"
  | "esg-investing"
  | "real-estate"
  | "hedge-funds"
  | "banking-regulation"
  | "financial-crises"
  | "retirement"
  | "insurance"
  | "commodities";

export const READING_TOPIC_META: Record<ReadingTopic, { label: string }> = {
  "monetary-policy": { label: "Monetary Policy" },
  inflation: { label: "Inflation" },
  "stock-markets": { label: "Stock Markets" },
  "mergers-acquisitions": { label: "Mergers & Acquisitions" },
  "venture-capital": { label: "Venture Capital" },
  bonds: { label: "Bonds" },
  cryptocurrency: { label: "Cryptocurrency" },
  forex: { label: "Foreign Exchange" },
  "private-equity": { label: "Private Equity" },
  ipo: { label: "IPOs" },
  "corporate-governance": { label: "Corporate Governance" },
  derivatives: { label: "Derivatives" },
  "credit-ratings": { label: "Credit Ratings" },
  "behavioral-finance": { label: "Behavioral Finance" },
  "esg-investing": { label: "ESG Investing" },
  "real-estate": { label: "Real Estate" },
  "hedge-funds": { label: "Hedge Funds" },
  "banking-regulation": { label: "Banking Regulation" },
  "financial-crises": { label: "Financial Crises" },
  retirement: { label: "Retirement & Pensions" },
  insurance: { label: "Insurance" },
  commodities: { label: "Commodities" },
};

export interface ReadingQuestion {
  question: string;
  /** Always exactly 4 options. */
  options: string[];
  correctIndex: number;
}

export interface ReadingText {
  id: string;
  topic: ReadingTopic;
  title: string;
  /** Paragraphs separated by a blank line. */
  body: string;
  /** Always exactly 4 comprehension questions, answerable from the text alone. */
  questions: ReadingQuestion[];
  /** A model summary the learner compares their own summary against. */
  sampleSummary: string;
}

export const READING_TEXTS: ReadingText[] = [
  {
    id: "fr1",
    topic: "monetary-policy",
    title: "How Central Banks Steer the Economy",
    body: `Central banks occupy an unusual position in modern economies: formally independent from elected governments in most developed countries, yet capable of decisions that ripple through the financial lives of millions almost overnight. Their principal instrument is the benchmark interest rate — the price at which commercial banks themselves borrow money — which they raise or lower in pursuit of two goals that frequently pull in opposite directions: keeping inflation low and stable while also supporting employment and growth.

In ordinary times, this mostly means small, incremental adjustments made every few months, closely watched by markets but barely noticed by the general public. When a central bank raises rates, borrowing becomes more expensive across the whole economy, from mortgages to corporate loans, which tends to cool down spending and investment. Lowering rates has the opposite effect, making credit cheaper and encouraging households and businesses to borrow and spend rather than save. The difficulty is that these effects are neither immediate nor precisely measurable: it can take the better part of a year for a single rate change to fully work its way through the economy, forcing policymakers to act on forecasts rather than certainty.

During a genuine crisis, central banks have shown they are willing to go much further, including buying enormous quantities of government bonds to inject newly created money directly into the financial system — a policy known as quantitative easing. Critics argue this distorts asset prices and disproportionately benefits those who already hold financial wealth, since cheap and abundant money tends to push up the value of stocks and property. Defenders counter that the alternative, allowing credit markets to seize up entirely, would have caused far greater damage to ordinary households, most of whom hold few investments of any kind. The tension between short-term political pressure and long-term credibility is precisely why so many countries deliberately keep their central banks at arm's length from government.`,
    questions: [
      {
        question: "What is described as the central bank's principal instrument for steering the economy?",
        options: ["Government spending", "The benchmark interest rate", "Corporate tax rates", "Currency printing limits"],
        correctIndex: 1,
      },
      {
        question: "According to the text, why is it hard for a central bank to know exactly how a rate change will affect the economy?",
        options: [
          "Because rate changes are illegal in most countries",
          "Because the effects take time and are not precisely measurable",
          "Because commercial banks ignore rate changes",
          "Because only one interest rate exists worldwide",
        ],
        correctIndex: 1,
      },
      {
        question: "What is quantitative easing, as explained in the text?",
        options: [
          "A tax cut for large corporations",
          "A ban on commercial lending",
          "Buying large quantities of government bonds to inject money into the financial system",
          "A fixed exchange rate policy",
        ],
        correctIndex: 2,
      },
      {
        question: "Why do many countries keep their central banks independent from government?",
        options: [
          "To avoid short-term political pressure undermining long-term credibility",
          "Because governments are legally forbidden from discussing the economy",
          "Because independence guarantees permanently low inflation",
          "Because elected officials are not allowed to borrow money",
        ],
        correctIndex: 0,
      },
    ],
    sampleSummary:
      "Central banks use interest rates to balance inflation control with growth and employment, raising rates to cool spending and lowering them to encourage it, though effects take months to appear. In crises they may resort to quantitative easing, buying bonds to inject money into the system — a controversial move that props up asset prices but may prevent a wider collapse. Their independence from government exists to protect long-term credibility from short-term political pressure.",
  },
  {
    id: "fr2",
    topic: "inflation",
    title: "The Quiet Erosion of Inflation",
    body: `Inflation is usually defined as the rate at which the general level of prices for goods and services rises over time, which in practical terms means that the same amount of money buys a little less with each passing year. Because the change happens gradually, it is easy to underestimate: a modest annual rate of two or three percent can feel almost invisible month to month, yet compounded over a decade it can quietly erode a substantial share of a saver's purchasing power.

A small, steady amount of inflation is generally considered healthy for an economy, since it discourages people from hoarding cash and instead encourages spending and productive investment. Problems emerge when inflation accelerates faster than wages can keep pace, because the everyday cost of living then rises noticeably faster than people's ability to pay for it. This is particularly damaging for those on fixed incomes, such as pensioners, whose payments often adjust to rising prices only after a considerable delay, if at all. Businesses, too, struggle under rapid inflation, since it becomes harder to plan future costs and to negotiate long-term contracts with any confidence.

The most direct tool available for controlling inflation is the interest rate policy of a country's central bank, since raising rates makes borrowing more expensive and tends to slow the pace of spending throughout the economy. This is a blunt instrument, however: it affects every borrower and saver simultaneously, regardless of whether they are contributing to inflationary pressure or not, and it can just as easily tip an economy into recession if pushed too far. Because of this trade-off, controlling inflation is rarely a matter of eliminating it outright, but rather of keeping it within a narrow, tolerable band — often explicitly targeted at around two percent by central banks in developed economies.`,
    questions: [
      {
        question: "Why is inflation described as easy to underestimate?",
        options: [
          "It only affects businesses, not individuals",
          "It happens gradually, so its cumulative effect over years is not obvious month to month",
          "It is always reversed within a year",
          "Governments hide inflation statistics",
        ],
        correctIndex: 1,
      },
      {
        question: "Who is described as particularly vulnerable to rapid inflation?",
        options: [
          "People on fixed incomes, such as pensioners",
          "Central bank employees",
          "Foreign tourists",
          "Companies that export goods",
        ],
        correctIndex: 0,
      },
      {
        question: "What is the main tool used to control inflation, according to the text?",
        options: ["Import tariffs", "Interest rate policy", "Minimum wage laws", "Stock market regulation"],
        correctIndex: 1,
      },
      {
        question: "Why is raising interest rates described as a 'blunt instrument'?",
        options: [
          "It only works in emergencies",
          "It requires a vote in parliament every time",
          "It affects all borrowers and savers at once, not just those driving inflation",
          "It has no effect on spending at all",
        ],
        correctIndex: 2,
      },
    ],
    sampleSummary:
      "Inflation gradually reduces purchasing power, and while a small steady rate is considered healthy, faster inflation that outpaces wages hurts people on fixed incomes and complicates business planning. Central banks control it mainly through interest rates, which slow spending but affect everyone equally and risk causing a recession if raised too aggressively. As a result, policy usually aims to keep inflation within a low target range rather than eliminate it entirely.",
  },
  {
    id: "fr3",
    topic: "stock-markets",
    title: "What a Price-Earnings Ratio Really Tells You",
    body: `Among the countless numbers investors track, few are cited as often as the price-earnings ratio, or P/E ratio — a simple calculation obtained by dividing a company's current share price by its earnings per share. In principle, it tells you how many years of current profit an investor would need, at today's price, to recoup the cost of buying the stock, assuming profits never changed. A P/E of twenty, for instance, means investors are paying twenty times the company's annual earnings for a share of ownership.

On its own, however, a P/E ratio reveals surprisingly little. A high ratio might mean a stock is genuinely overpriced, but it might equally mean investors expect earnings to grow rapidly in the future, which would justify today's price once profits catch up. A low ratio might signal a bargain, or it might reflect a business in genuine decline, where the market correctly anticipates that today's earnings will not be repeated. This is why experienced investors almost never look at a P/E ratio in isolation, but instead compare it against a company's own historical average, against its direct competitors, and against the broader market.

Different industries also carry structurally different typical ratios, which makes cross-sector comparison particularly misleading. A fast-growing technology company might trade at a P/E of fifty or more, reflecting investor confidence in future expansion, while a mature utility company generating stable but unspectacular profits might trade at a P/E closer to twelve. Comparing the two directly and concluding that the utility is simply "cheaper" ignores the fundamentally different growth expectations embedded in each price. Used carefully, alongside other measures such as debt levels and cash flow, the P/E ratio remains a useful starting point — but treated as a standalone verdict on value, it can mislead as easily as it informs.`,
    questions: [
      {
        question: "How is the price-earnings ratio calculated?",
        options: [
          "Total company debt divided by revenue",
          "Share price divided by earnings per share",
          "Annual dividend divided by share price",
          "Market capitalization divided by number of employees",
        ],
        correctIndex: 1,
      },
      {
        question: "Why might a high P/E ratio not necessarily mean a stock is overpriced?",
        options: [
          "P/E ratios are always calculated incorrectly",
          "Investors might be expecting rapid future earnings growth",
          "High P/E ratios are illegal in most markets",
          "The stock market never overprices anything",
        ],
        correctIndex: 1,
      },
      {
        question: "Why does the text warn against comparing P/E ratios across different industries?",
        options: [
          "Because different industries carry structurally different typical ratios and growth expectations",
          "Because only technology companies have a P/E ratio",
          "Because P/E ratios are reported in different currencies",
          "Because utility companies do not report earnings",
        ],
        correctIndex: 0,
      },
      {
        question: "What does the text recommend doing with a P/E ratio?",
        options: [
          "Ignoring it completely and using only dividend yield",
          "Using it as a standalone verdict on whether to buy a stock",
          "Comparing it to historical averages, competitors, and the market, alongside other measures",
          "Only trusting it for companies with a P/E above fifty",
        ],
        correctIndex: 2,
      },
    ],
    sampleSummary:
      "The P/E ratio, calculated as share price divided by earnings per share, shows how much investors are paying relative to current profit, but it is easily misread in isolation. A high or low ratio can reflect growth expectations rather than simple over- or under-pricing, and typical ratios vary greatly between industries. The text recommends comparing P/E against history, competitors, and the market, alongside other financial measures, rather than treating it as a standalone signal.",
  },
  {
    id: "fr4",
    topic: "mergers-acquisitions",
    title: "Why Companies Merge — and Why So Many Deals Fail",
    body: `When one company buys another outright, the transaction is usually called an acquisition; when two companies of roughly comparable size combine to form a single new entity, it is more often described as a merger, though in practice the two terms are frequently used loosely and somewhat interchangeably. Companies pursue such deals for a range of stated reasons: to eliminate a competitor, to gain immediate access to new technology or customers, or simply because acquiring an existing business can be cheaper and faster than building an equivalent one from scratch.

The logic behind any individual deal can sound compelling on paper, yet the process of actually combining two organizations is rarely smooth. Merging separate corporate cultures, incompatible IT systems, and overlapping management teams can take years longer than initially planned, and a striking number of high-profile deals ultimately fail to deliver the financial benefits that were promised to shareholders at the outset. Studies examining decades of merger activity have repeatedly found that a majority of large acquisitions destroy shareholder value rather than create it, a statistic that has done surprisingly little to slow the overall pace of dealmaking.

Employees at the company being acquired often bear the most immediate cost, since restructuring and layoffs frequently follow soon after a deal closes, as the combined company looks to eliminate duplicated roles and cut costs to justify the price paid. Regulators, meanwhile, play an increasingly assertive role in scrutinizing proposed mergers: if a deal would grant the combined company excessive power over a single market, competition authorities in the relevant jurisdictions can block it outright, or demand that certain divisions be sold off before approval is granted. This regulatory scrutiny has grown particularly intense in technology markets in recent years, where a small number of dominant firms have faced increasing pressure over acquisitions that critics argue exist mainly to neutralize future competitors before they can grow.`,
    questions: [
      {
        question: "What is the typical distinction the text draws between a 'merger' and an 'acquisition'?",
        options: [
          "A merger always involves a government agency",
          "An acquisition is one company buying another outright; a merger is two similarly sized companies combining",
          "There is no difference; the terms describe unrelated events",
          "A merger only happens between companies in different countries",
        ],
        correctIndex: 1,
      },
      {
        question: "What have studies of merger activity generally found?",
        options: [
          "Almost all mergers exceed shareholder expectations",
          "A majority of large acquisitions destroy shareholder value rather than create it",
          "Mergers have no measurable effect on shareholder value",
          "Only small mergers tend to fail",
        ],
        correctIndex: 1,
      },
      {
        question: "Who does the text say often bears the most immediate cost of a merger?",
        options: [
          "Government regulators",
          "Shareholders of the acquiring company only",
          "Employees at the company being acquired, through restructuring and layoffs",
          "Customers in unrelated industries",
        ],
        correctIndex: 2,
      },
      {
        question: "Why have technology-sector mergers faced particularly intense regulatory scrutiny, according to the text?",
        options: [
          "Because critics argue some acquisitions exist to neutralize future competitors",
          "Because technology companies are legally required to merge every five years",
          "Because technology mergers are always international",
          "Because regulators do not understand technology",
        ],
        correctIndex: 0,
      },
    ],
    sampleSummary:
      "Companies merge or acquire one another to eliminate competition, gain technology or customers, or grow faster than building internally, but combining two organizations is difficult and many deals fail to deliver the promised value. Acquired employees often face layoffs as costs are cut, and regulators increasingly scrutinize deals that could grant excessive market power, especially in technology, where acquisitions are sometimes criticized as a way of neutralizing future rivals.",
  },
  {
    id: "fr5",
    topic: "venture-capital",
    title: "The Economics of Venture Capital",
    body: `A startup typically begins with very little revenue and a great deal of uncertainty, which is precisely the combination that venture capital firms are structured to handle. These firms raise money from wealthy individuals, pension funds, and other institutions, then invest it across a large number of young companies, fully expecting that most of those companies will eventually fail outright or simply fade into irrelevance. The strategy only makes economic sense because a small number of successful investments can grow so large that their returns cover the losses from everything else many times over.

This dynamic, often summarized as a "power law" distribution of returns, shapes venture capital behavior in ways that can seem counterintuitive from the outside. A fund that expects nine out of ten investments to fail is not necessarily behaving recklessly — it may simply be pursuing the only strategy mathematically capable of generating the outsized returns its own investors demand. This also explains why venture capitalists often push portfolio companies to pursue rapid, aggressive growth rather than slow, sustainable profitability: a startup that grows cautiously and survives indefinitely at a modest size is, from a venture fund's perspective, close to a failure, since it will never produce the kind of outsized exit needed to offset the fund's other losses.

In exchange for their investment, venture capitalists typically receive a proportional stake in the company's shares, along with the expectation that the startup will eventually be sold to a larger company or listed on a public stock exchange, giving investors a way to convert their paper gains into cash. Founders who accept this kind of funding usually surrender a meaningful degree of control, since investors commonly negotiate a seat on the board and a formal say in major strategic decisions. Not every founder finds this trade-off acceptable: some deliberately choose to remain small and independent, funding growth entirely through their own revenue — an approach often called bootstrapping — rather than answering to outside investors whose incentives may not always align neatly with the founders' own.`,
    questions: [
      {
        question: "Why does the venture capital strategy make sense even if most investments fail?",
        options: [
          "Because failed startups are legally required to repay investors",
          "Because a small number of very successful investments can cover the losses from the rest many times over",
          "Because venture capital firms never actually lose money",
          "Because governments subsidize venture capital losses",
        ],
        correctIndex: 1,
      },
      {
        question: "Why might venture capitalists push startups toward rapid, aggressive growth rather than slow profitability?",
        options: [
          "Rapid growth is required by law for all startups",
          "A modestly successful, slow-growing company won't produce the outsized returns the fund needs",
          "Slow growth always leads to bankruptcy",
          "Aggressive growth guarantees an IPO within one year",
        ],
        correctIndex: 1,
      },
      {
        question: "What do venture capitalists typically receive in exchange for their investment?",
        options: [
          "A guaranteed fixed interest payment",
          "Full ownership of the company",
          "A proportional stake in shares, often with a board seat and say in major decisions",
          "A government tax credit",
        ],
        correctIndex: 2,
      },
      {
        question: "What is 'bootstrapping', as described in the text?",
        options: [
          "Borrowing money exclusively from banks",
          "Funding a company's growth entirely through its own revenue rather than outside investors",
          "A legal requirement before accepting venture capital",
          "A type of venture capital fund",
        ],
        correctIndex: 1,
      },
    ],
    sampleSummary:
      "Venture capital firms invest across many startups expecting most to fail, because a handful of major successes can outweigh all the losses combined — a dynamic that pushes funds to favor aggressive growth over steady, modest success. In return for investment, VCs typically take a share stake and influence over major decisions, which is why some founders instead choose bootstrapping, growing the business from its own revenue to retain full control.",
  },
  {
    id: "fr6",
    topic: "bonds",
    title: "Reading the Yield Curve",
    body: `A bond is, at its core, a loan: an investor lends money to a government or a company for a fixed period in exchange for regular interest payments and the return of the original amount once the bond matures. Bonds of different maturities — the length of time until the loan is repaid — typically pay different interest rates, known as yields, and plotting these yields against their respective maturities produces what is called the yield curve.

Under normal economic conditions, the yield curve slopes gently upward: bonds that tie up an investor's money for longer periods pay higher yields, compensating lenders for the additional risk and uncertainty of committing funds over a longer horizon. Occasionally, however, the curve inverts, meaning short-term bonds pay higher yields than long-term ones — an unusual configuration that has historically preceded economic recessions with striking consistency in many developed economies, though the reasons for this relationship remain a subject of genuine debate among economists.

One common explanation is that an inverted yield curve reflects investor expectations: if enough investors believe interest rates will need to fall in the future — typically because the central bank is expected to cut rates to counter a slowing economy — they rush to lock in today's relatively higher long-term yields before they disappear, which pushes long-term bond prices up and their yields down. This buying pressure on long-term bonds, combined with a central bank actively keeping short-term rates elevated to fight current inflation, can produce the unusual inversion. Because of this apparent predictive power, the yield curve is watched closely by investors, economists, and policymakers alike, even though a purely mechanical relationship between an inverted curve and an actual recession has never been definitively proven — correlation, in this case, has consistently outpaced full scientific explanation.`,
    questions: [
      {
        question: "What does the yield curve plot?",
        options: [
          "Stock prices against company size",
          "Bond yields against their maturities",
          "Interest rates against inflation only",
          "Currency values against gold prices",
        ],
        correctIndex: 1,
      },
      {
        question: "What does the yield curve typically look like under normal economic conditions?",
        options: [
          "It slopes downward, with short-term bonds paying more",
          "It is perfectly flat at all times",
          "It slopes upward, with longer maturities paying higher yields",
          "It does not exist under normal conditions",
        ],
        correctIndex: 2,
      },
      {
        question: "What has an inverted yield curve historically preceded, according to the text?",
        options: ["Stock market holidays", "Economic recessions", "Currency devaluations only", "Higher corporate tax rates"],
        correctIndex: 1,
      },
      {
        question: "According to one explanation in the text, why might long-term yields fall relative to short-term yields?",
        options: [
          "Investors rush to lock in higher long-term yields before expected future rate cuts, pushing those yields down",
          "Governments ban long-term bonds during a recession",
          "Long-term bonds are abolished during inversions",
          "Short-term bonds always disappear from the market",
        ],
        correctIndex: 0,
      },
    ],
    sampleSummary:
      "The yield curve plots bond yields against their maturities, normally sloping upward since longer loans demand higher compensation. When it inverts — short-term yields exceeding long-term ones — it has historically preceded recessions, possibly because investors anticipate future rate cuts and rush to lock in long-term yields, pushing them down. Despite being closely watched, the exact causal link between an inverted curve and a recession remains scientifically unproven.",
  },
  {
    id: "fr7",
    topic: "cryptocurrency",
    title: "Cryptocurrency's Uneasy Place in Finance",
    body: `Cryptocurrency began as a fairly obscure experiment among computer scientists and cryptographers but has since grown into an asset class that even the most traditional financial institutions can no longer afford to dismiss outright. Unlike a conventional currency issued and backed by a government, most cryptocurrencies run on a decentralized network of computers, with no single company, bank, or country in full control of the system, verifying transactions through a public, tamper-resistant ledger known as a blockchain.

Supporters argue that this decentralized structure makes the system more resistant to political interference and censorship, and more transparent than conventional finance, since every transaction is permanently recorded and, in principle, publicly verifiable by anyone. Critics counter that prices for most cryptocurrencies remain extraordinarily volatile, at times rising or falling by double-digit percentages within a single day, which makes them a poor choice for anyone unable to tolerate losing a significant share of their investment in a short period. This volatility has also complicated cryptocurrency's usefulness as an everyday medium of exchange, since a currency whose value can swing dramatically overnight makes for an unreliable way to price goods and services.

Governments worldwide have struggled to agree on a consistent regulatory approach, with some jurisdictions embracing the technology enthusiastically in the hope of attracting investment and talent, while others have banned significant parts of the industry outright, citing concerns over fraud, money laundering, and financial stability. This regulatory fragmentation has arguably held back mainstream adoption more than any purely technical limitation. Whatever ultimately happens to individual cryptocurrencies themselves, the underlying blockchain technology has already forced many established financial institutions to seriously reconsider aspects of how international payments, settlement, and record-keeping are handled, an influence that appears likely to persist regardless of where cryptocurrency prices head next.`,
    questions: [
      {
        question: "What is described as the key structural difference between cryptocurrency and conventional currency?",
        options: [
          "Cryptocurrency is only used for illegal transactions",
          "Cryptocurrency runs on a decentralized network with no single controlling authority",
          "Cryptocurrency cannot be transferred between individuals",
          "Conventional currency has no government involvement",
        ],
        correctIndex: 1,
      },
      {
        question: "Why does the text say cryptocurrency's volatility complicates its use as an everyday currency?",
        options: [
          "Volatile prices make it unreliable for pricing goods and services consistently",
          "Volatility is illegal under international law",
          "Volatile currencies cannot be stored electronically",
          "Volatility only affects government-issued currencies",
        ],
        correctIndex: 0,
      },
      {
        question: "How have governments responded to cryptocurrency, according to the text?",
        options: [
          "All governments have banned it uniformly",
          "All governments have embraced it identically",
          "Responses vary widely, from enthusiastic embrace to outright bans",
          "Governments have ignored it entirely",
        ],
        correctIndex: 2,
      },
      {
        question: "What does the text suggest will likely persist regardless of cryptocurrency price movements?",
        options: [
          "The influence of blockchain technology on payments and record-keeping",
          "A single global cryptocurrency regulation",
          "Complete elimination of traditional banks",
          "Guaranteed profits for all crypto investors",
        ],
        correctIndex: 0,
      },
    ],
    sampleSummary:
      "Cryptocurrency runs on decentralized, transparent blockchain networks rather than being issued by a government, which supporters see as resistant to interference but critics see as prone to extreme volatility. That volatility undermines its use as everyday money, and inconsistent government regulation worldwide has further slowed mainstream adoption. Regardless, blockchain technology has already influenced how traditional finance approaches payments and record-keeping.",
  },
  {
    id: "fr8",
    topic: "forex",
    title: "How Currencies Find Their Price",
    body: `The foreign exchange market, often shortened to forex or FX, is by most measures the largest financial market in the world, with trillions of dollars' worth of currencies changing hands every single day. Unlike a stock exchange, it has no single physical location or centralized authority; instead, it operates as a continuous global network of banks, corporations, governments, and individual traders, buying and selling currencies around the clock as markets open and close across different time zones.

At its most basic level, a currency's price — its exchange rate against another currency — is determined by supply and demand, much like any other traded good. If foreign investors want to buy a country's exports, or invest in its stock market, or simply hold its bonds, they must first acquire that country's currency, increasing demand and typically pushing its value upward relative to others. Conversely, if a country imports far more than it exports, or if investors grow nervous about its economic stability and begin withdrawing money, its currency tends to weaken as demand for it falls.

Central banks add another layer of complexity, since their interest rate decisions directly influence currency values: a country offering higher interest rates tends to attract foreign investors seeking better returns on their savings, which increases demand for that country's currency and pushes its value up, all else being equal. Some governments go further and actively intervene in currency markets, buying or selling their own currency in large quantities to influence its value directly, usually to support struggling exporters or to curb inflation caused by an overly weak currency making imports expensive. Because exchange rates affect the price of everything from imported electronics to overseas holidays, even small currency movements can have outsized, and often underappreciated, effects on ordinary consumers and businesses alike.`,
    questions: [
      {
        question: "What distinguishes the foreign exchange market from a stock exchange, according to the text?",
        options: [
          "It has no single physical location or centralized authority",
          "It only operates during a single time zone",
          "It is smaller than most national stock exchanges",
          "Only governments are allowed to participate",
        ],
        correctIndex: 0,
      },
      {
        question: "What basic economic force determines a currency's exchange rate, according to the text?",
        options: ["Government decree alone", "Supply and demand", "The price of gold", "The size of a country's population"],
        correctIndex: 1,
      },
      {
        question: "How do higher interest rates typically affect a country's currency, according to the text?",
        options: [
          "They tend to weaken the currency by discouraging saving",
          "They have no effect on currency value",
          "They tend to attract foreign investors and push the currency's value up",
          "They automatically cause inflation to double",
        ],
        correctIndex: 2,
      },
      {
        question: "Why might a government intervene directly in currency markets, according to the text?",
        options: [
          "To support exporters or curb inflation caused by a weak currency",
          "Because central banks are legally required to intervene weekly",
          "To eliminate the need for interest rates entirely",
          "Because forex trading is otherwise illegal",
        ],
        correctIndex: 0,
      },
    ],
    sampleSummary:
      "The foreign exchange market is the world's largest financial market, operating globally without a central location, with exchange rates set by supply and demand for each currency. Trade flows, investment flows, and central bank interest rate decisions all shift that demand, and some governments intervene directly to manage their currency's value. Because exchange rates affect the price of imports and travel, even small currency shifts have wide real-world consequences.",
  },
  {
    id: "fr9",
    topic: "private-equity",
    title: "Inside a Leveraged Buyout",
    body: `Private equity firms specialize in buying entire companies outright, typically taking them off public stock exchanges, restructuring their operations over a period of several years, and eventually selling them again at a profit — either to another company, to another private equity firm, or back onto the public markets through a new listing. Unlike a venture capital firm, which mostly funds young, unproven startups, private equity typically targets established, cash-generating businesses that are viewed as underperforming or undervalued relative to their potential.

A large share of these transactions are structured as leveraged buyouts, meaning the private equity firm funds only a portion of the purchase price with its own investors' money and borrows the rest, often the majority of the total cost, using the target company's own future cash flows and assets as collateral for the debt. This structure allows a private equity firm to control a company many times larger than its own capital would otherwise permit, magnifying returns if the deal succeeds — but also magnifying losses, and the risk of bankruptcy, if it does not, since the acquired company itself now carries a substantial new debt burden it did not have before being bought.

Critics of this model argue that loading a newly acquired company with debt can force damaging cost-cutting, including layoffs and reduced investment, purely to service interest payments, sometimes leaving the business permanently weaker even if the private equity firm itself profits handsomely from the eventual sale. Defenders counter that private equity ownership often brings genuinely more disciplined management, sharper cost control, and a willingness to make difficult decisions that the previous owners — whether founding families or public shareholders focused on quarterly results — had been reluctant to make. Empirical research on whether leveraged buyouts create or destroy long-term value across the wider economy remains genuinely mixed, varying considerably by industry, time period, and how a given study defines success.`,
    questions: [
      {
        question: "What typically distinguishes private equity firms from venture capital firms, according to the text?",
        options: [
          "Private equity only invests in startups, unlike venture capital",
          "Private equity targets established, cash-generating businesses rather than young startups",
          "Venture capital firms never make a profit",
          "There is no meaningful difference between the two",
        ],
        correctIndex: 1,
      },
      {
        question: "In a leveraged buyout, what is used as collateral for the borrowed money?",
        options: [
          "The private equity firm's personal assets",
          "Government bonds",
          "The target company's own future cash flows and assets",
          "Shares in an unrelated company",
        ],
        correctIndex: 2,
      },
      {
        question: "What do critics argue can happen when a company is loaded with debt after a leveraged buyout?",
        options: [
          "The company automatically becomes more profitable",
          "It can force damaging cost-cutting, including layoffs, to service interest payments",
          "The debt is immediately forgiven by regulators",
          "Employee wages are legally guaranteed to rise",
        ],
        correctIndex: 1,
      },
      {
        question: "What does the text say about research on whether leveraged buyouts create long-term value?",
        options: [
          "It conclusively proves buyouts always destroy value",
          "It conclusively proves buyouts always create value",
          "The evidence is genuinely mixed, varying by industry and time period",
          "No research has ever been conducted on the topic",
        ],
        correctIndex: 2,
      },
    ],
    sampleSummary:
      "Private equity firms buy established companies, often using leveraged buyouts where most of the purchase price is borrowed against the target company's own assets and cash flow, magnifying both potential returns and risks. Critics say the resulting debt burden can force harmful cost-cutting, while defenders argue private equity brings needed managerial discipline. Research on whether buyouts create genuine long-term value remains mixed rather than conclusive.",
  },
  {
    id: "fr10",
    topic: "ipo",
    title: "Going Public: The Anatomy of an IPO",
    body: `When a company sells shares to the public for the first time, the transaction is known as an initial public offering, or IPO. Before that moment, the company is typically owned by its founders, employees holding stock options, and a limited circle of private investors such as venture capital firms; afterward, ownership is thrown open to anyone willing to buy shares on a public stock exchange, and the company takes on an entirely new set of obligations toward those shareholders.

Going public allows a company to raise a substantial amount of capital relatively quickly, money it can then use to expand operations, pay down existing debt, or fund research into new products. In exchange, the company must begin disclosing detailed financial information on a regular schedule, submit to far greater scrutiny from analysts, journalists, and regulators, and answer to a shareholder base that may number in the tens of thousands, each with a legitimate interest in the company's performance. Many founders describe this transition as genuinely uncomfortable, since decisions that were once made quickly and privately must now be justified publicly, often under considerable short-term pressure to meet quarterly earnings expectations.

The process itself typically involves investment banks acting as underwriters, who help determine an initial share price, market the offering to large institutional investors, and, formally, guarantee to buy any shares that fail to sell at that price. Pricing an IPO correctly is notoriously difficult: price it too high, and the shares may fall immediately after trading begins, embarrassing the company and its bankers; price it too low, and the company effectively leaves money on the table that could otherwise have been raised, a phenomenon so common that academic studies have measured the average amount left unclaimed across thousands of historical IPOs. Employees holding stock options can become suddenly and substantially wealthier the moment trading begins, while the company itself must adapt quickly to a permanently more public existence.`,
    questions: [
      {
        question: "What happens to a company's ownership structure after an IPO?",
        options: [
          "Ownership is restricted to the original founders only",
          "Ownership becomes open to anyone willing to buy shares on a public exchange",
          "The company is dissolved and reformed",
          "Only banks are allowed to own shares",
        ],
        correctIndex: 1,
      },
      {
        question: "What new obligation does a company take on after going public, according to the text?",
        options: [
          "It must stop paying employees in stock options",
          "It must disclose detailed financial information regularly and face greater scrutiny",
          "It must relocate its headquarters",
          "It is no longer allowed to raise further capital",
        ],
        correctIndex: 1,
      },
      {
        question: "What role do investment banks typically play as underwriters in an IPO?",
        options: [
          "They help set the initial price, market the offering, and guarantee to buy unsold shares",
          "They set the company's tax rate",
          "They are legally barred from involvement in pricing",
          "They only participate after the shares have started trading",
        ],
        correctIndex: 0,
      },
      {
        question: "What is described as a common problem when an IPO is priced too low?",
        options: [
          "The company is automatically fined by regulators",
          "The company effectively leaves money on the table it could have raised",
          "Trading is permanently suspended",
          "Employees lose their stock options",
        ],
        correctIndex: 1,
      },
    ],
    sampleSummary:
      "An IPO opens company ownership to the public for the first time, letting it raise capital quickly in exchange for ongoing disclosure obligations and public scrutiny that many founders find uncomfortable. Investment banks underwrite the process, setting an initial price that is notoriously difficult to get right — too high risks an embarrassing post-listing drop, too low leaves money unraised — while employees with stock options can become wealthy once trading begins.",
  },
  {
    id: "fr11",
    topic: "corporate-governance",
    title: "Who Really Controls a Public Company?",
    body: `In theory, a public company is controlled by its shareholders, who collectively own the business and elect a board of directors to represent their interests and oversee management on their behalf. In practice, the relationship is considerably more complicated, largely because ownership in most large public companies is spread across an enormous number of individual and institutional shareholders, few of whom hold anywhere near enough shares to meaningfully influence decisions on their own.

This dispersion of ownership creates what economists call a principal-agent problem: the people who technically own the company, the shareholders, are not the people actually running it day to day, the executives, and the two groups' interests do not always align neatly. Executives might reasonably be tempted to prioritize decisions that boost their own compensation, prestige, or job security over decisions that maximize long-term shareholder value, particularly if their pay is tied to short-term metrics like quarterly earnings or the current share price rather than the company's health a decade from now. Boards of directors exist specifically to police this gap, but board members are frequently nominated with significant input from the very executives they are meant to oversee, which can blunt their willingness to challenge management too forcefully.

In recent decades, large institutional investors — pension funds, mutual funds, and index funds that collectively hold enormous blocks of shares across the entire market — have taken on an increasingly assertive governance role, using their considerable voting power to push for changes in company strategy, executive pay, or board composition where they believe management is falling short. Activist investors have gone further still, deliberately buying meaningful stakes in specific companies with the explicit purpose of forcing changes to strategy or leadership, sometimes through public campaigns aimed directly at other shareholders. Whether concentrated activist pressure of this kind improves companies over the long run, or merely forces short-term financial engineering at the expense of longer-term investment, remains a genuinely contested question among researchers.`,
    questions: [
      {
        question: "What is the 'principal-agent problem' described in the text?",
        options: [
          "A legal requirement for all public companies",
          "A conflict between shareholders' interests and the interests of the executives running the company",
          "A tax rule affecting only small companies",
          "A rule preventing shareholders from voting",
        ],
        correctIndex: 1,
      },
      {
        question: "Why might a board of directors be reluctant to challenge management forcefully, according to the text?",
        options: [
          "Boards are legally forbidden from disagreeing with executives",
          "Board members are often nominated with significant input from the executives they oversee",
          "Boards have no formal authority over executives",
          "Shareholders directly appoint executives instead of the board",
        ],
        correctIndex: 1,
      },
      {
        question: "What role have large institutional investors increasingly taken on, according to the text?",
        options: [
          "They have withdrawn entirely from corporate governance",
          "They have taken an increasingly assertive role in pushing for governance changes",
          "They are legally barred from voting on company matters",
          "They only invest in private companies",
        ],
        correctIndex: 1,
      },
      {
        question: "What does the text say about the effect of activist investor campaigns?",
        options: [
          "Research has definitively proven they always help companies",
          "Research has definitively proven they always harm companies",
          "Whether they help or merely force short-term financial engineering remains contested",
          "Activist investors have no measurable effect on any company",
        ],
        correctIndex: 2,
      },
    ],
    sampleSummary:
      "Public companies are formally controlled by dispersed shareholders, but day-to-day power sits with executives whose interests do not always align with shareholders' — a conflict known as the principal-agent problem, which boards are meant to police but sometimes fail to due to their ties to management. Large institutional investors and activist investors have taken a more assertive governance role in recent decades, though whether this pressure genuinely benefits companies long-term remains a contested question.",
  },
  {
    id: "fr12",
    topic: "derivatives",
    title: "Options, Futures, and the Logic of Hedging",
    body: `A derivative is a financial contract whose value is based on, or "derived" from, the price of some other underlying asset — a stock, a currency, a commodity like oil or wheat, or even an interest rate. Rather than buying the underlying asset directly, a derivative allows an investor to make a bet on how that asset's price will move, or to protect against an unwanted price movement, often using far less capital upfront than buying the asset outright would require.

Two of the most common derivatives are futures and options. A futures contract obligates both parties to buy and sell a specific asset at a predetermined price on a specific future date, regardless of what the market price happens to be by then. An options contract, by contrast, gives its buyer the right, but crucially not the obligation, to buy or sell an asset at a set price before a certain date, in exchange for an upfront fee called a premium; the seller of that option, however, does take on an obligation, and must fulfill the contract if the buyer chooses to exercise it. This distinction — an obligation on both sides for futures, versus a right for one side and an obligation for the other in options — shapes how each instrument is typically used.

Derivatives were originally developed largely as a hedging tool: a wheat farmer, for instance, might use a futures contract to lock in today's price for a harvest that will not actually be sold for another six months, protecting against the risk that prices fall in the meantime. An airline might similarly use derivatives to lock in fuel costs months in advance, insulating itself from a sudden spike in oil prices. Used this way, derivatives genuinely reduce risk for the parties involved. The same instruments, however, can just as easily be used for pure speculation rather than hedging, allowing traders with no interest whatsoever in ever owning wheat or oil to bet on price movements using borrowed money, a use of derivatives that regulators have blamed, at least in part, for amplifying several major financial crises.`,
    questions: [
      {
        question: "What is a derivative, according to the text?",
        options: [
          "A type of bank account",
          "A financial contract whose value is derived from an underlying asset",
          "A government bond with no maturity date",
          "A physical commodity like oil or wheat",
        ],
        correctIndex: 1,
      },
      {
        question: "What is the key difference between a futures contract and an options contract, according to the text?",
        options: [
          "Futures only apply to currencies, options only to stocks",
          "A futures contract obligates both parties; an options contract gives the buyer a right without an obligation",
          "Options contracts are illegal in most countries",
          "There is no meaningful difference between them",
        ],
        correctIndex: 1,
      },
      {
        question: "How might a wheat farmer use a futures contract, according to the text?",
        options: [
          "To avoid growing wheat altogether",
          "To lock in today's price for a future harvest, protecting against falling prices",
          "To borrow money from a bank",
          "To sell wheat immediately at any price",
        ],
        correctIndex: 1,
      },
      {
        question: "What have regulators blamed derivatives for, according to the text?",
        options: [
          "Amplifying several major financial crises when used for speculation",
          "Causing all agricultural shortages",
          "Making hedging illegal",
          "Eliminating the need for futures contracts",
        ],
        correctIndex: 0,
      },
    ],
    sampleSummary:
      "Derivatives are contracts whose value depends on an underlying asset, with futures obligating both parties to a trade and options giving the buyer a right without obligation. Originally developed for hedging — letting farmers or airlines lock in prices in advance — the same instruments can be used for pure speculation, which regulators have blamed for amplifying past financial crises.",
  },
  {
    id: "fr13",
    topic: "credit-ratings",
    title: "What a Credit Rating Actually Measures",
    body: `Credit rating agencies exist to answer a single, seemingly simple question on behalf of investors: how likely is a given borrower — a company or a government — to repay its debt in full and on time? The agencies express their answer as a letter grade, typically ranging from AAA at the very top, denoting the lowest perceived risk of default, down through various intermediate grades to categories reserved for debt considered speculative or "junk," where the risk of non-payment is considered materially higher.

These ratings matter enormously in practice, because they directly influence the interest rate a borrower must offer to attract lenders. A government or company with a high rating can typically borrow at a comparatively low interest rate, since lenders demand less compensation for a risk they perceive as small; a borrower with a poor rating must offer a substantially higher rate to compensate lenders for the greater chance of losing some or all of their money. Many large institutional investors, such as pension funds, are further restricted by their own internal rules from holding debt below a certain rating at all, meaning a downgrade can trigger automatic, forced selling regardless of whether the fund manager personally still believes in the borrower's prospects.

The agencies themselves have faced significant criticism, particularly following the 2008 financial crisis, when securities built from bundles of risky mortgages had received top-tier ratings shortly before collapsing in value, raising serious and largely unresolved questions about potential conflicts of interest, since agencies are typically paid by the very issuers whose debt they are rating. Despite this reputational damage, credit ratings remain deeply embedded in how global financial markets function, from the interest rates governments pay to borrow, to the rules governing what pension funds and insurance companies are permitted to hold, making the agencies' judgments influential well beyond what their patchy historical track record might seem to justify.`,
    questions: [
      {
        question: "What question do credit rating agencies aim to answer, according to the text?",
        options: [
          "How profitable a company is expected to be",
          "How likely a borrower is to repay its debt in full and on time",
          "How much tax a company owes",
          "How many employees a company has",
        ],
        correctIndex: 1,
      },
      {
        question: "How does a credit rating typically affect the interest rate a borrower pays?",
        options: [
          "Ratings have no effect on interest rates",
          "A higher rating usually allows borrowing at a lower interest rate",
          "A higher rating always requires a higher interest rate",
          "Interest rates are set only by governments, not ratings",
        ],
        correctIndex: 1,
      },
      {
        question: "What can happen when an institutional investor's holding is downgraded below a certain rating?",
        options: [
          "Nothing changes for the investor",
          "The investor may be forced to sell automatically due to internal rules",
          "The government seizes the asset",
          "The rating agency must buy back the debt",
        ],
        correctIndex: 1,
      },
      {
        question: "What conflict of interest does the text raise regarding rating agencies?",
        options: [
          "Agencies are typically paid by the very issuers whose debt they rate",
          "Agencies are owned entirely by competing companies",
          "Agencies are banned from rating governments",
          "Agencies only rate companies they have invested in",
        ],
        correctIndex: 0,
      },
    ],
    sampleSummary:
      "Credit rating agencies grade how likely borrowers are to repay debt, and these ratings directly shape the interest rates borrowers pay and what institutional investors like pension funds are allowed to hold, sometimes forcing automatic selling after a downgrade. The agencies faced heavy criticism after the 2008 crisis for rating risky mortgage-backed securities highly, raising conflict-of-interest concerns since issuers pay for their own ratings — yet ratings remain deeply embedded in global markets regardless.",
  },
  {
    id: "fr14",
    topic: "behavioral-finance",
    title: "Why Rational Markets Keep Behaving Irrationally",
    body: `Traditional economic theory has long rested on the assumption that investors act rationally, carefully weighing available information about risk and potential reward before making a decision. Behavioral finance has spent several decades systematically challenging that assumption, drawing on psychology to show that human decision-making introduces predictable, and often costly, biases into financial choices — biases that persist even among professional investors whose careers depend on avoiding them.

One of the most thoroughly documented biases is loss aversion: people tend to feel the pain of a financial loss roughly twice as intensely as the pleasure of an equivalent gain. This asymmetry can lead investors to hold on to a failing investment for far longer than a purely rational calculation would justify, purely to avoid the discomfort of formally "realizing" the loss by selling, even when the money would clearly be better deployed elsewhere. A closely related pattern is the disposition effect, in which investors sell winning investments too early, to lock in the satisfying feeling of a gain, while continuing to hold losing ones in the hope of an eventual recovery.

Herd behavior represents another well-studied pattern, in which investors follow the actions of those around them rather than conducting independent analysis of their own, a tendency that helps explain how speculative bubbles can inflate dramatically before eventually collapsing, often quite suddenly. Overconfidence compounds these effects further: even seasoned fund managers, whose entire profession depends on accurately assessing risk and predicting market movements, consistently overestimate their own ability to do so, a finding replicated across numerous studies comparing professional forecasts against actual outcomes. Recognizing these patterns intellectually does not make anyone immune to them in practice — awareness alone rarely overrides deeply ingrained instinct — but it has meaningfully reshaped how financial advisors design products and advice, increasingly building in sensible default options and gentle behavioral "nudges" intended to work with human psychology rather than naively assuming it away.`,
    questions: [
      {
        question: "What is 'loss aversion', as defined in the text?",
        options: [
          "The tendency to avoid all financial risk entirely",
          "Feeling the pain of a loss roughly twice as intensely as the pleasure of an equivalent gain",
          "A legal rule limiting how much money can be lost in trading",
          "A preference for government bonds over stocks",
        ],
        correctIndex: 1,
      },
      {
        question: "What is the 'disposition effect' described in the text?",
        options: [
          "Selling winning investments too early while holding on to losing ones",
          "Only investing in companies with a good public disposition",
          "A rule requiring investors to disclose their holdings",
          "A tendency to invest exclusively in bonds",
        ],
        correctIndex: 0,
      },
      {
        question: "How does herd behavior help explain speculative bubbles, according to the text?",
        options: [
          "Investors following others rather than independent analysis can inflate prices dramatically before a collapse",
          "Herd behavior only occurs in agricultural commodity markets",
          "Herd behavior prevents bubbles from ever forming",
          "Herd behavior is illegal in most financial markets",
        ],
        correctIndex: 0,
      },
      {
        question: "What has awareness of behavioral biases changed, according to the text?",
        options: [
          "It has made professional investors completely immune to bias",
          "It has eliminated the need for financial advisors",
          "It has reshaped how advisors design products, using defaults and nudges that work with psychology",
          "It has proven that behavioral finance theory is incorrect",
        ],
        correctIndex: 2,
      },
    ],
    sampleSummary:
      "Behavioral finance shows that investors, including professionals, are not purely rational, exhibiting biases like loss aversion, the disposition effect, herd behavior, and overconfidence that predictably distort financial decisions. These patterns help explain phenomena like speculative bubbles, and while awareness alone does not eliminate them, it has led advisors to design products with sensible defaults and nudges that account for human psychology rather than ignoring it.",
  },
  {
    id: "fr15",
    topic: "esg-investing",
    title: "The Contested Rise of ESG Investing",
    body: `ESG investing refers to an approach that evaluates companies not only on traditional financial metrics such as revenue and profit, but also on environmental, social, and governance factors — everything from carbon emissions and labor practices to board diversity and executive accountability. Proponents argue that these factors, though harder to quantify than a quarterly earnings report, can meaningfully affect a company's long-term risk profile and financial performance, making them directly relevant to investors rather than a purely ethical add-on.

The approach has grown rapidly over the past decade, with trillions of dollars now managed under funds explicitly marketed as ESG-focused, and major asset managers increasingly incorporating ESG scores into their broader investment decisions even outside dedicated funds. Supporters point to research suggesting that companies with strong governance and responsible environmental practices may be less exposed to regulatory fines, reputational damage, and operational disruptions, potentially making them more resilient investments over the long run, particularly as climate-related regulation continues to tighten across many jurisdictions.

The approach has also attracted substantial criticism from several directions simultaneously. Some critics argue that ESG ratings are inconsistent and poorly standardized, with different rating agencies sometimes reaching sharply contradictory conclusions about the very same company, undermining confidence in what the scores actually measure. Others argue that ESG investing has been used as a marketing exercise by fund managers charging higher fees for portfolios that differ only marginally from conventional ones, a practice critics have labeled "greenwashing." A separate line of criticism, more prominent in certain political and investment circles, argues that fund managers should focus exclusively on maximizing financial returns and leave broader social and environmental considerations to elected governments and regulators instead. This debate shows no clear sign of resolving, and ESG investing consequently remains one of the more genuinely polarizing developments in contemporary finance.`,
    questions: [
      {
        question: "What does ESG investing evaluate, beyond traditional financial metrics?",
        options: [
          "Only a company's stock price history",
          "Environmental, social, and governance factors",
          "Only executive salaries",
          "Only a company's advertising budget",
        ],
        correctIndex: 1,
      },
      {
        question: "What do supporters of ESG investing argue about companies with strong governance and environmental practices?",
        options: [
          "They are legally required to outperform the market",
          "They may be less exposed to fines, reputational damage, and disruption, making them more resilient",
          "They never generate any profit",
          "They are exempt from all financial regulation",
        ],
        correctIndex: 1,
      },
      {
        question: "What is 'greenwashing', as described in the text?",
        options: [
          "A government subsidy for renewable energy",
          "Marketing conventional portfolios as ESG-focused while charging higher fees, with little real difference",
          "A type of environmental regulation",
          "A method for calculating carbon emissions",
        ],
        correctIndex: 1,
      },
      {
        question: "What criticism does the text mention regarding ESG rating agencies?",
        options: [
          "They all agree perfectly on every company's score",
          "Different agencies sometimes reach sharply contradictory conclusions about the same company",
          "They are banned from operating in most countries",
          "They only rate government bonds",
        ],
        correctIndex: 1,
      },
    ],
    sampleSummary:
      "ESG investing considers environmental, social, and governance factors alongside financial metrics, with supporters arguing this improves long-term risk assessment and resilience. The approach has grown rapidly but faces criticism over inconsistent ratings between agencies, 'greenwashing' by fund managers charging extra fees for minimal real difference, and arguments that financial managers should leave social considerations to governments — leaving the debate unresolved.",
  },
  {
    id: "fr16",
    topic: "real-estate",
    title: "Owning Property Without Owning a Building",
    body: `A real estate investment trust, almost universally known by its acronym REIT, is a company that owns, and typically operates, a portfolio of income-producing real estate — office buildings, shopping centers, apartment complexes, warehouses, or increasingly, data centers — without requiring individual investors to buy an entire building themselves. Instead, investors buy shares in the REIT itself, much as they would buy shares in any other public company, gaining proportional exposure to the rental income and any change in value of the underlying properties.

REITs were originally created by legislation specifically intended to let ordinary investors access the kind of steady income that large-scale commercial real estate can generate, income that had previously been available mainly to wealthy individuals and large institutions with the capital to buy entire properties outright. In exchange for certain tax advantages, REITs are typically required by law to distribute the large majority of their taxable income to shareholders as dividends, which is why they are often favored by investors specifically seeking regular income rather than primarily capital growth.

Because REITs are usually traded on public stock exchanges just like ordinary shares, they offer a degree of liquidity that direct property ownership simply cannot match — an investor can sell REIT shares within seconds during market hours, whereas selling an actual building can take months of negotiation and paperwork to complete. This liquidity comes with a trade-off, however: because REIT shares trade on public markets, their prices can be considerably more volatile in the short term than the value of the underlying physical properties would suggest, since they are also influenced by broader stock market sentiment, interest rate expectations, and investor psychology, not solely by the fundamentals of the buildings the REIT actually owns.`,
    questions: [
      {
        question: "What does a REIT allow investors to do, according to the text?",
        options: [
          "Buy an entire building directly at a discount",
          "Gain exposure to income-producing real estate by buying shares, without owning a building themselves",
          "Avoid paying any taxes on property income",
          "Only invest in residential apartments",
        ],
        correctIndex: 1,
      },
      {
        question: "What are REITs typically required to do in exchange for tax advantages?",
        options: [
          "Reinvest all income into new properties",
          "Distribute the large majority of taxable income to shareholders as dividends",
          "Pay double the standard corporate tax rate",
          "Avoid trading on public stock exchanges",
        ],
        correctIndex: 1,
      },
      {
        question: "What advantage do REITs offer compared to direct property ownership, according to the text?",
        options: [
          "Guaranteed annual price increases",
          "Immunity from stock market influence",
          "Greater liquidity, since shares can be sold quickly on a public exchange",
          "No need to pay any dividends",
        ],
        correctIndex: 2,
      },
      {
        question: "Why can REIT share prices be more volatile than the underlying properties' value, according to the text?",
        options: [
          "Because REITs are not allowed to own real estate directly",
          "Because their prices are also influenced by stock market sentiment and interest rate expectations",
          "Because REITs change ownership of properties daily",
          "Because REIT dividends are paid in foreign currency",
        ],
        correctIndex: 1,
      },
    ],
    sampleSummary:
      "REITs let investors buy shares in a portfolio of income-producing real estate rather than purchasing property directly, offering access to commercial real estate income that was once mostly available to wealthy investors. In exchange for tax benefits, REITs must distribute most income as dividends, and being publicly traded gives them far greater liquidity than physical property — though this also makes their share prices more volatile, reflecting broader market sentiment rather than only the value of the buildings themselves.",
  },
  {
    id: "fr17",
    topic: "hedge-funds",
    title: "Inside the Hedge Fund Business Model",
    body: `Hedge funds occupy a distinctive niche within the investment world: largely exempt from many of the regulations governing ordinary mutual funds, typically open only to wealthy individuals and institutional investors who meet specific wealth thresholds, and consequently free to pursue strategies that most conventional, retail-facing investment funds would be legally prevented from attempting. The name itself derives from "hedging," originally the practice of taking offsetting positions specifically designed to protect against losses elsewhere in a portfolio, though in practice many hedge funds today pursue aggressive, high-risk strategies that bear little resemblance to hedging in its original, more conservative sense.

Some hedge funds borrow substantial sums of money to amplify their bets, a practice known as leverage, meaning a relatively modest market movement can produce dramatically outsized gains — or, with equal ease, catastrophic losses severe enough to threaten the fund's continued existence entirely. Their fee structures have attracted persistent criticism over the years, since many funds charge a fixed annual management fee regardless of performance, on top of a substantial share of any profits the fund actually generates, a combination that can prove extremely costly for investors even during years of only modest returns.

Supporters of the hedge fund model argue that genuinely skilled managers can outperform broader market indexes over the long run and provide valuable liquidity to financial markets by willingly taking on risks that other, more conservative investors are unwilling to bear. Critics counter that, once their considerable fees are properly accounted for, hedge funds have on average struggled to consistently outperform far simpler and dramatically cheaper investment strategies, such as passively tracking a broad stock market index, making them, in the view of many independent researchers, a questionable choice for all but the most sophisticated and well-resourced investors.`,
    questions: [
      {
        question: "Who are hedge funds typically open to, according to the text?",
        options: [
          "Any retail investor with a bank account",
          "Only government institutions",
          "Wealthy individuals and institutional investors meeting specific wealth thresholds",
          "Only companies listed on a stock exchange",
        ],
        correctIndex: 2,
      },
      {
        question: "What does 'leverage' mean in the context of hedge funds, according to the text?",
        options: [
          "Refusing to borrow any money",
          "Borrowing substantial sums to amplify bets, magnifying both gains and losses",
          "A type of government regulation",
          "A fixed annual fee charged to investors",
        ],
        correctIndex: 1,
      },
      {
        question: "What fee structure does the text describe as common among hedge funds?",
        options: [
          "No fees at all, regardless of performance",
          "A fixed management fee plus a share of profits generated",
          "A single one-time fee paid at fund closure",
          "Fees paid only by the fund manager",
        ],
        correctIndex: 1,
      },
      {
        question: "What do critics argue about hedge fund performance once fees are accounted for?",
        options: [
          "Hedge funds always outperform simple index strategies",
          "Hedge funds have on average struggled to consistently beat cheaper, simpler strategies",
          "Hedge funds are guaranteed to lose money",
          "Fees have no impact on overall investor returns",
        ],
        correctIndex: 1,
      },
    ],
    sampleSummary:
      "Hedge funds operate with fewer regulatory restrictions than mutual funds, typically serving only wealthy investors, and often use leverage to amplify returns and risks well beyond original hedging strategies. Their fee structures, combining a fixed management fee with a share of profits, draw criticism, and while supporters credit skilled managers with outperformance, critics argue that after fees, hedge funds often fail to beat simpler, cheaper strategies like index investing.",
  },
  {
    id: "fr18",
    topic: "banking-regulation",
    title: "Why Banks Are Forced to Hold Capital",
    body: `Banks occupy a uniquely fragile position in the financial system: they take in deposits that customers expect to be able to withdraw on demand, at any time, while simultaneously lending a large share of that same money out over much longer periods, often years, to borrowers who cannot repay instantly if suddenly asked to. This fundamental mismatch, between short-term liabilities and long-term assets, makes banks inherently vulnerable to a sudden loss of confidence, since a bank generally does not keep enough cash on hand to repay every depositor simultaneously if a large number all demand their money back at once — a scenario known as a bank run.

To guard against this vulnerability, and against the broader danger that one bank's failure can spread rapidly to others through the tangled web of loans and obligations connecting the banking system, regulators require banks to hold a minimum amount of capital — essentially, funds contributed by the bank's own shareholders that can absorb losses before depositors' money is ever put at risk. Following the 2008 financial crisis, international regulators substantially tightened these requirements through a framework known as Basel III, which mandated that banks hold significantly more high-quality capital relative to their loans and other assets than had previously been required, alongside new rules governing how much easily accessible cash banks must keep on hand to survive short-term funding disruptions.

Banks have generally resisted these tightened requirements, arguing that capital held in reserve is capital that cannot be lent out productively to businesses and households, potentially slowing economic growth and reducing the profitability of an entire industry. Regulators counter that the far greater cost of allowing banks to fail, as vividly demonstrated in 2008 when governments were forced to spend enormous sums rescuing failing institutions to prevent a complete collapse of the financial system, far outweighs the more modest cost of banks holding somewhat less profitable, more conservative balance sheets during ordinary times.`,
    questions: [
      {
        question: "What fundamental mismatch makes banks vulnerable, according to the text?",
        options: [
          "Banks hold too much cash and lend too little",
          "Banks take short-term deposits but lend the money out over much longer periods",
          "Banks are not allowed to accept deposits",
          "Banks only lend to governments",
        ],
        correctIndex: 1,
      },
      {
        question: "What is a 'bank run', as described in the text?",
        options: [
          "A marketing campaign run by a bank",
          "A large number of depositors demanding their money back simultaneously",
          "A government audit of a bank's accounts",
          "A merger between two banks",
        ],
        correctIndex: 1,
      },
      {
        question: "What did the Basel III framework require of banks, according to the text?",
        options: [
          "Lower capital requirements to boost lending",
          "Significantly more high-quality capital relative to their loans and assets",
          "A complete ban on international lending",
          "Mandatory government ownership of all banks",
        ],
        correctIndex: 1,
      },
      {
        question: "What argument do regulators make in favor of stricter capital requirements, according to the text?",
        options: [
          "The cost of bank failures, as seen in 2008, far outweighs the cost of holding more capital",
          "Capital requirements have no effect on financial stability",
          "Banks never actually fail, so the rules are precautionary only",
          "Stricter rules are required only for banks outside the country",
        ],
        correctIndex: 0,
      },
    ],
    sampleSummary:
      "Banks are structurally vulnerable because they take short-term deposits but make long-term loans, exposing them to bank runs if confidence collapses. To guard against this, regulators require minimum capital reserves, tightened significantly after 2008 through the Basel III framework. Banks argue this reduces lending capacity, but regulators counter that the cost of bank failures far exceeds the cost of holding more conservative reserves.",
  },
  {
    id: "fr19",
    topic: "financial-crises",
    title: "Anatomy of a Financial Crisis",
    body: `The 2008 financial crisis is most commonly traced back to the American housing market, where banks and mortgage lenders had spent years extending loans to homebuyers who, in a significant number of cases, had little realistic prospect of repaying them once introductory low interest rates expired and reset to much higher levels. These risky mortgages were then bundled together into complex financial products and sold on to investors around the world as seemingly safe investments, a process that obscured just how much underlying risk the wider global financial system had quietly accumulated over the preceding years.

When large numbers of homeowners began defaulting on their mortgages simultaneously as the housing market turned, the value of these bundled mortgage products collapsed abruptly, and banks that had bet heavily on them suddenly faced losses far larger than almost anyone in the industry had anticipated. Because major financial institutions were so deeply interconnected through mutual loans, guarantees, and other contractual obligations, the failure of even a handful of large firms threatened to bring down the entire global banking system through a cascading chain reaction, forcing governments across multiple continents to intervene with extraordinarily large rescue packages to prevent what many officials at the time genuinely feared could become a complete collapse of the financial system.

The crisis ultimately destroyed trillions of dollars in household and institutional wealth, pushed unemployment sharply higher across much of the developed world for several years, and left a lasting legacy of public distrust toward large financial institutions that persists in many countries to this day. In its aftermath, regulators in most major economies introduced considerably stricter rules intended to make banks hold more capital in reserve and undergo regular stress tests, so that the financial system as a whole would be better positioned to absorb future shocks without requiring another taxpayer-funded rescue on a similar scale.`,
    questions: [
      {
        question: "Where does the text trace the origins of the 2008 financial crisis to?",
        options: [
          "The European bond market",
          "The American housing market and risky mortgage lending",
          "A sudden rise in oil prices",
          "A currency collapse in Asia",
        ],
        correctIndex: 1,
      },
      {
        question: "What happened to risky mortgages before the crisis, according to the text?",
        options: [
          "They were cancelled by regulators",
          "They were bundled into products and sold globally as seemingly safe investments",
          "They were converted into government bonds",
          "They were only ever held by the original lender",
        ],
        correctIndex: 1,
      },
      {
        question: "Why did the failure of a few large financial institutions threaten the entire global banking system, according to the text?",
        options: [
          "Because all banks used the exact same computer software",
          "Because major institutions were deeply interconnected through loans and obligations",
          "Because governments owned all major banks",
          "Because only one country was affected",
        ],
        correctIndex: 1,
      },
      {
        question: "What did regulators introduce after the crisis, according to the text?",
        options: [
          "Lower capital requirements to encourage lending",
          "Stricter rules requiring more capital reserves and regular stress tests",
          "A permanent ban on mortgage lending",
          "The abolition of central banks",
        ],
        correctIndex: 1,
      },
    ],
    sampleSummary:
      "The 2008 crisis originated in risky American mortgage lending, which was bundled into products sold globally and obscured the true risk building in the financial system. When defaults surged, losses cascaded through deeply interconnected institutions, forcing massive government rescues to prevent total collapse, destroying trillions in wealth and raising unemployment. Regulators responded with stricter capital and stress-testing requirements to prevent a repeat.",
  },
  {
    id: "fr20",
    topic: "retirement",
    title: "The Slow-Motion Crisis in Pension Funding",
    body: `Retirement systems around the world broadly fall into two categories: defined-benefit plans, which promise a specific, predetermined payment to retirees regardless of how the underlying investments actually perform, and defined-contribution plans, where the eventual payout depends entirely on how much was contributed and how those contributions' investments performed over time, with the retiree bearing the investment risk directly rather than an employer or government.

Defined-benefit pensions, once the dominant model across much of the developed world, have become increasingly rare in the private sector, largely because they expose the organization providing them — whether a corporation or a government — to open-ended financial risk. If investment returns fall short of what was originally assumed when the promises were made, or if retirees simply live for considerably longer than earlier actuarial projections anticipated, the shortfall must be covered by the sponsoring organization itself, sometimes requiring painful cuts elsewhere in the budget or additional contributions to plug a widening gap.

This dynamic has produced a genuine, slow-motion funding crisis in many public pension systems specifically, where governments made generous long-term promises decades ago, often under different demographic assumptions, without setting aside sufficient funds at the time to guarantee they could be honored in full. As populations age and the ratio of working contributors to retirees shrinks steadily in many countries, some pension systems face a widening and increasingly difficult-to-close gap between what has been promised to current and future retirees and what existing assets and contributions can realistically support. Proposed solutions vary considerably by country and political system — raising retirement ages, increasing contribution rates, adjusting future benefit formulas — but nearly all involve politically difficult trade-offs that elected officials have often preferred to defer to their successors rather than resolve directly during their own time in office.`,
    questions: [
      {
        question: "What is the key difference between defined-benefit and defined-contribution retirement plans?",
        options: [
          "Defined-benefit plans promise a specific payment regardless of investment performance; defined-contribution payouts depend on investment results",
          "Defined-contribution plans are only available to government employees",
          "There is no meaningful difference between the two",
          "Defined-benefit plans do not exist in any country",
        ],
        correctIndex: 0,
      },
      {
        question: "Why have defined-benefit pensions become rarer in the private sector, according to the text?",
        options: [
          "They are illegal in most countries",
          "They expose the sponsoring organization to open-ended financial risk",
          "Employees no longer want guaranteed payments",
          "They require no funding at all",
        ],
        correctIndex: 1,
      },
      {
        question: "What has contributed to the funding crisis in many public pension systems, according to the text?",
        options: [
          "Retirees living longer and shrinking ratios of workers to retirees, against insufficiently funded promises",
          "A sudden ban on pension contributions",
          "Governments overfunding pensions decades ago",
          "A worldwide decrease in retirement ages",
        ],
        correctIndex: 0,
      },
      {
        question: "How does the text describe proposed solutions to pension funding gaps?",
        options: [
          "All solutions are simple and politically uncontroversial",
          "They involve politically difficult trade-offs often deferred by elected officials",
          "There are no proposed solutions in any country",
          "The only solution is eliminating all pensions",
        ],
        correctIndex: 1,
      },
    ],
    sampleSummary:
      "Defined-benefit pensions guarantee fixed payments regardless of investment performance, exposing sponsors to open-ended risk, while defined-contribution plans shift that risk to retirees. Many public defined-benefit systems now face a funding crisis as populations age and promises made decades ago outstrip available assets. Proposed fixes — raising retirement ages, higher contributions, adjusted benefits — all involve difficult trade-offs politicians have often deferred rather than resolved.",
  },
  {
    id: "fr21",
    topic: "insurance",
    title: "How Insurers Price the Unpredictable",
    body: `At its core, insurance operates on a deceptively simple principle: a large number of people each pay a relatively small, regular amount into a shared pool, from which the comparatively few who experience an actual loss are compensated, sometimes many times over what they personally contributed. This pooling of risk across a large population is precisely what allows an individual to protect against a financial loss that might otherwise be devastating — a house fire, a serious illness, a car accident — in exchange for a predictable, manageable cost paid regularly regardless of whether a claim is ever made.

Insurance companies rely heavily on actuarial science, a specialized discipline combining statistics and financial theory, to estimate the likelihood and probable cost of future claims across large populations with considerable precision, even though no individual claim can be predicted with any certainty at all. By pooling risk across enough policyholders, insurers can rely on the fact that, while any single driver's chance of an accident in a given year is highly uncertain, the aggregate number of accidents across a million drivers can be estimated with startling statistical accuracy, allowing premiums to be set at a level that reliably covers expected claims while still leaving the insurer a viable profit margin.

This model depends critically on risks being sufficiently independent of one another — one person's house fire, in the ordinary course of events, does not meaningfully increase the likelihood of another policyholder's house also catching fire. Certain risks break this assumption badly, however, which is why insurance against events like widespread flooding, major earthquakes, or pandemics has historically proven far harder to price and provide affordably, since a single event can simultaneously trigger enormous numbers of claims all at once, defeating the fundamental logic of risk pooling. Climate change has intensified this particular challenge considerably in recent years, as insurers in several regions have been forced to raise premiums sharply, restrict coverage significantly, or withdraw from certain markets altogether, as previously rare, catastrophic weather events have become measurably more frequent and more severe than historical pricing models had originally assumed.`,
    questions: [
      {
        question: "What core principle does insurance operate on, according to the text?",
        options: [
          "Only wealthy individuals are allowed to purchase insurance",
          "Many people pool small regular payments to compensate the few who experience a loss",
          "Insurance companies never pay out claims",
          "Every policyholder receives an identical payout regardless of loss",
        ],
        correctIndex: 1,
      },
      {
        question: "What does actuarial science allow insurers to do, according to the text?",
        options: [
          "Predict any individual claim with total certainty",
          "Estimate the likelihood and cost of claims across large populations with precision",
          "Eliminate all risk of financial loss",
          "Avoid paying any taxes",
        ],
        correctIndex: 1,
      },
      {
        question: "What assumption does the insurance risk-pooling model depend on, according to the text?",
        options: [
          "That all policyholders live in the same city",
          "That risks are sufficiently independent of one another",
          "That claims never actually occur",
          "That premiums remain fixed forever",
        ],
        correctIndex: 1,
      },
      {
        question: "Why has climate change made certain insurance harder to price, according to the text?",
        options: [
          "Catastrophic weather events have become more frequent and severe than historical models assumed",
          "Climate change has eliminated the need for insurance",
          "Governments have banned climate-related insurance",
          "Weather has become entirely predictable",
        ],
        correctIndex: 0,
      },
    ],
    sampleSummary:
      "Insurance pools small regular payments from many people to compensate the few who suffer losses, relying on actuarial science to price risk accurately across large populations even though individual claims stay unpredictable. This works only when risks are largely independent of each other, which is why widescale events like floods or pandemics are much harder to insure — a problem climate change has intensified as extreme weather grows more frequent than historical models assumed.",
  },
  {
    id: "fr22",
    topic: "commodities",
    title: "The Hidden Market Behind Everyday Goods",
    body: `Long before a barrel of oil, a bushel of wheat, or an ounce of gold reaches an actual buyer, its price has typically already been shaped by an enormous, largely invisible global market in commodities — raw materials and agricultural products traded in standardized units, often without the buyer and seller ever handling the physical goods directly at the moment the trade takes place. Commodity prices are set through the same fundamental forces as any other market: supply, driven by factors like weather, mining output, or geopolitical stability in producing regions, and demand, driven by global economic growth, seasonal patterns, and shifting consumer preferences.

Unlike company shares, most commodities are essentially interchangeable regardless of who produced them — a barrel of a given oil grade is functionally identical whether it came from one producer or another, a characteristic economists describe as fungibility. This uniformity is precisely what allows commodities to be traded on centralized global exchanges using standardized contracts, rather than requiring buyers and sellers to individually negotiate the specific quality or origin of each shipment involved, dramatically simplifying global trade in these goods.

Commodity prices tend to be considerably more volatile than most financial assets, since supply often cannot adjust quickly to sudden changes in demand, or vice versa: a drought can devastate a harvest within a single growing season, while building a new mine or oil field can take years of investment before it produces anything at all, creating persistent mismatches between supply and demand that other, more flexible markets typically avoid. This volatility affects far more than specialist commodity traders — sharp movements in oil prices ripple through transportation and manufacturing costs economy-wide, while swings in agricultural commodity prices directly affect food costs for entire populations, particularly in developing countries where food often represents a much larger share of household spending than in wealthier nations, making commodity markets, despite their relative obscurity to most people, one of the more consequential corners of the global financial system.`,
    questions: [
      {
        question: "What forces set commodity prices, according to the text?",
        options: [
          "Only government price controls",
          "Supply and demand, driven by factors like weather, output, and economic growth",
          "The value of a country's currency alone",
          "Only the size of the trading exchange",
        ],
        correctIndex: 1,
      },
      {
        question: "What does 'fungibility' mean in the context of commodities, according to the text?",
        options: [
          "Commodities are illegal to trade internationally",
          "A commodity is essentially interchangeable regardless of who produced it",
          "Commodities cannot be traded on exchanges",
          "Each unit of a commodity is entirely unique",
        ],
        correctIndex: 1,
      },
      {
        question: "Why are commodity prices often more volatile than other financial assets, according to the text?",
        options: [
          "Because supply cannot adjust quickly to sudden demand changes",
          "Because commodities are never actually traded",
          "Because governments fix commodity prices permanently",
          "Because commodities have no real-world uses",
        ],
        correctIndex: 0,
      },
      {
        question: "Who does the text say is most affected by swings in agricultural commodity prices?",
        options: [
          "Only commodity traders",
          "Populations in developing countries, where food is a larger share of household spending",
          "Only government treasuries",
          "Only companies that mine gold",
        ],
        correctIndex: 1,
      },
    ],
    sampleSummary:
      "Commodity prices are set by global supply and demand, and because commodities like oil or wheat are largely fungible, they can be traded on standardized exchanges without negotiating each shipment individually. Slow-adjusting supply makes commodity prices unusually volatile, and these swings ripple through transportation, manufacturing, and food costs worldwide — hitting developing countries hardest, since food represents a larger share of household spending there.",
  },
];
