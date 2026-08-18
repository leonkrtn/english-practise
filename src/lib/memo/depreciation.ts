import { memoRule, type MemoRule } from "./types";

/**
 * Depreciation, amortisation and depletion — the IFRS/IAS 16 treatment, with the conventions and
 * thresholds that show up in exams and in practice. Written to be memorised: every rule states the
 * thing you must be able to say, then pins the numbers and conditions as separate facts.
 */
export const DEPRECIATION_RULES: MemoRule[] = [
  memoRule({
    id: "dep1",
    setId: "depreciation",
    category: "Fundamentals",
    title: "What depreciation is",
    statement:
      "Depreciation is the systematic allocation of an asset's depreciable amount over its useful life — it is an allocation of cost, not a valuation of the asset.",
    explanation:
      "This is the single most misunderstood point. Depreciation does not attempt to track what the asset is worth on the market, and it is not a cash outflow. It exists to match the cost of a long-lived asset against the periods that benefit from it, so profit is not distorted by charging the whole cost in year one.",
    facts: [
      { label: "Purpose", value: "Allocation of cost, not valuation", accepted: ["cost allocation", "allocation of cost"] },
      { label: "Cash effect", value: "None — it is a non-cash expense", accepted: ["non-cash", "no cash effect"] },
      { label: "Underlying principle", value: "Matching principle", accepted: ["matching"] },
    ],
    example:
      "A €50,000 machine used for 5 years is charged €10,000 a year to profit or loss, even though the whole €50,000 left the bank in year one.",
    cloze: [
      {
        text: "Depreciation is the systematic allocation of an asset's depreciable amount over its ___.",
        answer: "useful life",
        hint: "Not its physical life, and not its market life.",
      },
      {
        text: "Depreciation is an allocation of ___, not a valuation of the asset.",
        answer: "cost",
        hint: "It answers 'how much of what we paid belongs to this year', not 'what is it worth'.",
      },
    ],
    mc: [
      {
        question: "Which statement about depreciation is correct?",
        options: [
          "It allocates cost over the periods that benefit from the asset",
          "It measures the asset's current market value",
          "It is a cash outflow in each period",
          "It is only recorded when the asset loses value",
        ],
        correctIndex: 0,
        explanation:
          "Depreciation is cost allocation under the matching principle. Market value is irrelevant to it, and no cash moves when it is recorded.",
      },
    ],
    trueFalse: [
      {
        statement: "Depreciation expense reduces the company's cash balance in the period it is recorded.",
        isTrue: false,
        explanation: "It is a non-cash expense. The cash left when the asset was purchased; depreciation only allocates that cost.",
      },
      {
        statement: "An asset's carrying amount after depreciation is intended to equal its market value.",
        isTrue: false,
        explanation: "Carrying amount is cost less accumulated depreciation. Any resemblance to market value is coincidental.",
      },
    ],
  }),

  memoRule({
    id: "dep2",
    setId: "depreciation",
    category: "Fundamentals",
    title: "Depreciable amount",
    statement: "Depreciable amount = cost − residual value. Only that amount is ever depreciated, never the full cost.",
    explanation:
      "Residual value is what you expect to recover at the end of the asset's useful life, net of disposal costs. Because you will get it back, it is not a cost of using the asset and must be excluded. In practice residual value is often estimated at zero, which is why the distinction is easy to forget — and why it costs marks when the exam gives you a non-zero one.",
    formulaTex: "\\text{Depreciable amount} = \\text{Cost} - \\text{Residual value}",
    facts: [
      { label: "Formula", value: "Cost − residual value", accepted: ["cost minus residual value", "cost - residual value"] },
      { label: "Residual value", value: "Expected proceeds at end of useful life, net of disposal costs", accepted: ["salvage value", "scrap value"] },
      { label: "Common simplification", value: "Residual value assumed to be zero", accepted: ["zero", "0"] },
    ],
    example: "Machine cost €50,000, residual value €5,000 → depreciable amount €45,000, not €50,000.",
    cloze: [
      { text: "Depreciable amount = cost − ___.", answer: "residual value", accepted: ["salvage value"], hint: "What you expect to get back at the end." },
      {
        text: "An asset is never depreciated below its ___ value.",
        answer: "residual",
        accepted: ["salvage"],
        hint: "Once carrying amount reaches it, depreciation stops.",
      },
    ],
    mc: [
      {
        question: "Cost €80,000, residual value €8,000, useful life 6 years, straight-line. What is the annual charge?",
        options: ["€12,000", "€13,333", "€8,000", "€14,667"],
        correctIndex: 0,
        explanation: "Depreciable amount is 80,000 − 8,000 = 72,000. Over 6 years that is 12,000 a year. Dividing the full 80,000 would give 13,333 — the classic error.",
      },
    ],
    trueFalse: [
      {
        statement: "The full cost of an asset is depreciated over its useful life.",
        isTrue: false,
        explanation: "Only the depreciable amount is: cost less residual value.",
      },
    ],
  }),

  memoRule({
    id: "dep3",
    setId: "depreciation",
    category: "Fundamentals",
    title: "Useful life",
    statement:
      "Useful life is the period over which the asset is expected to be available for use by the entity — not the asset's total economic or physical life.",
    explanation:
      "The definition is entity-specific on purpose. If your policy is to replace vehicles after four years, four years is the useful life, even if the vehicle would physically run for fifteen. Useful life may also be expressed in units of output rather than time.",
    facts: [
      { label: "Whose perspective", value: "The entity's, not the market's", accepted: ["entity specific", "the entity"] },
      { label: "May be expressed as", value: "Time, or units of production/output", accepted: ["units of production", "units of output"] },
      { label: "Factors to consider", value: "Expected usage, wear and tear, technical obsolescence, legal limits" },
    ],
    example:
      "A company that replaces its delivery vans every 4 years depreciates them over 4 years, even though the vans would last 15.",
    cloze: [
      {
        text: "Useful life is the period over which an asset is expected to be available for use by the ___.",
        answer: "entity",
        accepted: ["company", "business"],
        hint: "Not by anyone — by whoever owns it.",
      },
    ],
    trueFalse: [
      {
        statement: "Useful life must equal the asset's expected physical life.",
        isTrue: false,
        explanation: "It is the period the entity expects to use it, which is often much shorter than the physical life.",
      },
      {
        statement: "Useful life can be measured in units of production instead of years.",
        isTrue: true,
        explanation: "IAS 16 permits it, and it is the basis of the units-of-production method.",
      },
    ],
  }),

  memoRule({
    id: "dep4",
    setId: "depreciation",
    category: "Methods",
    title: "Straight-line method",
    statement: "The straight-line method charges the same amount every period: depreciable amount divided by useful life.",
    explanation:
      "The default method and by far the most common. It suits assets whose benefit is consumed evenly over time — buildings, fixtures, most equipment. The charge is a constant amount, so the carrying amount falls in a straight line, hence the name.",
    formulaTex: "\\text{Annual charge} = \\frac{\\text{Cost} - \\text{Residual value}}{\\text{Useful life}}",
    facts: [
      { label: "Formula", value: "(Cost − residual value) ÷ useful life" },
      { label: "Charge pattern", value: "Constant every period", accepted: ["constant", "equal", "same every year"] },
      { label: "Best suited to", value: "Assets consumed evenly over time" },
    ],
    example: "Cost €50,000, residual €5,000, life 5 years → (50,000 − 5,000) ÷ 5 = €9,000 per year.",
    cloze: [
      {
        text: "Straight-line annual charge = (cost − residual value) ÷ ___.",
        answer: "useful life",
        hint: "The denominator is the number of periods.",
      },
    ],
    mc: [
      {
        question: "Cost €30,000, residual €0, useful life 4 years. What is the carrying amount after 3 years under straight-line?",
        options: ["€7,500", "€22,500", "€10,000", "€0"],
        correctIndex: 0,
        explanation: "Annual charge is 7,500. After 3 years accumulated depreciation is 22,500, so the carrying amount is 30,000 − 22,500 = 7,500.",
      },
    ],
  }),

  memoRule({
    id: "dep5",
    setId: "depreciation",
    category: "Methods",
    title: "Declining balance method",
    statement:
      "The declining balance method applies a fixed percentage to the carrying amount, so the charge is highest in year one and falls every period. Residual value is ignored in the calculation but still acts as a floor.",
    explanation:
      "An accelerated method: it front-loads the expense. The rationale is that many assets deliver most of their benefit early and cost more to maintain later, so a falling depreciation charge plus rising maintenance gives a steadier total cost. Note the asymmetry that catches people out — residual value is not subtracted before applying the rate, but you still stop once carrying amount reaches it.",
    formulaTex: "\\text{Charge}_t = \\text{Carrying amount}_{t-1} \\times \\text{rate}",
    facts: [
      { label: "Applied to", value: "Carrying amount at the start of the period", accepted: ["carrying amount", "book value", "net book value"] },
      { label: "Residual value in the calculation", value: "Ignored — but acts as a floor", accepted: ["ignored", "not subtracted"] },
      { label: "Charge pattern", value: "Highest in year one, falling thereafter", accepted: ["decreasing", "falling", "accelerated"] },
      { label: "Double-declining rate", value: "2 ÷ useful life", accepted: ["2/useful life", "twice the straight-line rate"] },
    ],
    example:
      "Cost €10,000, double-declining over 5 years → rate 40%. Year 1: €4,000. Year 2: 40% of the remaining €6,000 = €2,400. And so on.",
    cloze: [
      {
        text: "Under declining balance, the rate is applied to the ___ at the start of the period.",
        answer: "carrying amount",
        accepted: ["book value", "net book value"],
        hint: "Not to the original cost.",
      },
      {
        text: "The double-declining rate is ___ divided by the useful life.",
        answer: "2",
        accepted: ["two"],
        hint: "It is twice the straight-line rate.",
      },
    ],
    mc: [
      {
        question: "Cost €20,000, useful life 5 years, double-declining balance. What is the year-2 charge?",
        options: ["€4,800", "€8,000", "€4,000", "€3,200"],
        correctIndex: 0,
        explanation:
          "Rate is 2 ÷ 5 = 40%. Year 1: 40% × 20,000 = 8,000, leaving 12,000. Year 2: 40% × 12,000 = 4,800.",
      },
    ],
    trueFalse: [
      {
        statement: "Under declining balance, residual value is subtracted from cost before applying the rate.",
        isTrue: false,
        explanation: "It is not subtracted. The rate hits the full carrying amount — but depreciation stops once the carrying amount reaches residual value.",
      },
    ],
  }),

  memoRule({
    id: "dep6",
    setId: "depreciation",
    category: "Methods",
    title: "Units of production method",
    statement:
      "The units of production method charges depreciation in proportion to actual output: depreciable amount × (units this period ÷ total expected units).",
    explanation:
      "Ties the expense directly to use, so a machine idle all year is charged nothing. That makes it the most faithful method for assets whose wear depends on usage rather than time — production machinery, vehicles measured in kilometres, aircraft measured in flight hours. Its drawback is that it needs a reliable estimate of total lifetime output.",
    formulaTex: "\\text{Charge} = (\\text{Cost} - \\text{Residual}) \\times \\frac{\\text{Units this period}}{\\text{Total expected units}}",
    facts: [
      { label: "Driver", value: "Actual output or usage, not time", accepted: ["output", "usage", "units produced"] },
      { label: "Charge in an idle period", value: "Zero", accepted: ["0", "nil", "none"] },
      { label: "Best suited to", value: "Assets whose wear depends on use" },
    ],
    example:
      "Machine cost €100,000, residual €10,000, expected output 90,000 units. Produce 12,000 units this year → 90,000 × (12,000/90,000) = €12,000.",
    cloze: [
      {
        text: "Under units of production, an asset that produced nothing this period is charged ___ depreciation.",
        answer: "zero",
        accepted: ["0", "no", "nil"],
        hint: "The charge follows output exactly.",
      },
    ],
    trueFalse: [
      {
        statement: "The units of production method still charges depreciation in a period when the machine was idle.",
        isTrue: false,
        explanation: "The charge is proportional to output, so zero output means zero depreciation.",
      },
    ],
  }),

  memoRule({
    id: "dep7",
    setId: "depreciation",
    category: "Methods",
    title: "Sum-of-the-years'-digits",
    statement:
      "Sum-of-the-years'-digits is an accelerated method: multiply the depreciable amount by a fraction whose numerator is the remaining life and whose denominator is the sum of the digits of the useful life.",
    explanation:
      "A smoother acceleration than declining balance, and unlike declining balance it does subtract residual value up front. The denominator can be computed directly as n(n+1)/2 rather than adding the digits one by one.",
    formulaTex: "\\text{Charge}_t = (\\text{Cost}-\\text{Residual}) \\times \\frac{n - t + 1}{n(n+1)/2}",
    facts: [
      { label: "Denominator", value: "n(n+1)/2", accepted: ["n(n+1)/2", "sum of the digits"] },
      { label: "Numerator", value: "Remaining useful life at the start of the period", accepted: ["remaining life"] },
      { label: "Residual value", value: "Subtracted first, unlike declining balance", accepted: ["subtracted", "deducted"] },
    ],
    example:
      "Useful life 5 years → denominator 5+4+3+2+1 = 15. Year 1 takes 5/15, year 2 takes 4/15, and so on.",
    cloze: [
      {
        text: "For a 5-year useful life, the sum-of-the-years'-digits denominator is ___.",
        answer: "15",
        hint: "5 + 4 + 3 + 2 + 1, or n(n+1)/2.",
      },
    ],
    mc: [
      {
        question: "Depreciable amount €60,000, useful life 4 years, sum-of-the-years'-digits. What is the year-1 charge?",
        options: ["€24,000", "€15,000", "€6,000", "€30,000"],
        correctIndex: 0,
        explanation: "Denominator is 4+3+2+1 = 10. Year 1 takes 4/10 × 60,000 = 24,000.",
      },
    ],
  }),

  memoRule({
    id: "dep8",
    setId: "depreciation",
    category: "Recognition",
    title: "When depreciation starts and stops",
    statement:
      "Depreciation begins when the asset is available for use — in the location and condition management intended — and stops at the earlier of the date it is classified as held for sale and the date it is derecognised.",
    explanation:
      "The trigger is availability, not actual use. A machine installed and ready but sitting idle is still depreciated. Equally, depreciation does not pause when an asset becomes temporarily idle or is taken out of active use — it only stops on held-for-sale classification or disposal.",
    facts: [
      { label: "Starts when", value: "The asset is available for use", accepted: ["available for use", "ready for use"] },
      { label: "Stops at the earlier of", value: "Held-for-sale classification, or derecognition", accepted: ["held for sale or derecognition"] },
      { label: "During idle periods", value: "Depreciation continues", accepted: ["continues", "does not stop"] },
    ],
    example:
      "A machine delivered and installed in March but not switched on until June is depreciated from March — it was available for use then.",
    cloze: [
      {
        text: "Depreciation begins when the asset is ___ for use, not when it is first actually used.",
        answer: "available",
        accepted: ["ready"],
        hint: "In the location and condition management intended.",
      },
    ],
    trueFalse: [
      {
        statement: "Depreciation is suspended while an asset is temporarily idle.",
        isTrue: false,
        explanation: "It continues. Only held-for-sale classification or derecognition stops it (though a usage-based method may give a zero charge).",
      },
    ],
    order: [
      {
        prompt: "Put the life of a depreciable asset in order.",
        steps: [
          "Asset is acquired and costs are capitalised",
          "Asset becomes available for use — depreciation begins",
          "Depreciation is charged each period over the useful life",
          "Asset is classified as held for sale or disposed of — depreciation stops",
          "Carrying amount is derecognised and gain or loss on disposal is recorded",
        ],
      },
    ],
  }),

  memoRule({
    id: "dep9",
    setId: "depreciation",
    category: "Recognition",
    title: "Land is not depreciated",
    statement: "Land has an indefinite useful life and is not depreciated. Buildings on it are, and the two must be accounted for separately.",
    explanation:
      "Land does not wear out, so there is no cost to allocate. The practical consequence is that a single purchase price for land and buildings has to be split between them — only the building portion is depreciable. The exceptions are land whose value is consumed, such as a quarry or landfill site, which is depleted rather than depreciated.",
    facts: [
      { label: "Land", value: "Not depreciated — indefinite useful life", accepted: ["not depreciated", "no depreciation"] },
      { label: "Buildings", value: "Depreciated, separately from the land" },
      { label: "Exception", value: "Land consumed by use (quarries, landfill) is depleted", accepted: ["quarries", "landfill", "depletion"] },
    ],
    example:
      "A €900,000 property is split €300,000 land / €600,000 building. Only the €600,000 is depreciated.",
    cloze: [
      { text: "Land is not depreciated because it has an ___ useful life.", answer: "indefinite", hint: "It does not wear out." },
    ],
    trueFalse: [
      {
        statement: "When land and a building are bought together for a single price, the whole amount is depreciated.",
        isTrue: false,
        explanation: "The price must be allocated between land and building; only the building portion is depreciable.",
      },
    ],
  }),

  memoRule({
    id: "dep10",
    setId: "depreciation",
    category: "Recognition",
    title: "Component depreciation",
    statement:
      "Each part of an asset with a cost significant relative to the total and a different useful life must be depreciated separately.",
    explanation:
      "Also called componentisation. An aircraft is not one asset with one life — the airframe, the engines and the interior wear out on completely different schedules, and averaging them would misstate the expense in every period. IFRS makes this mandatory rather than optional, which is a common difference from local GAAPs.",
    facts: [
      { label: "Condition", value: "Significant cost AND a different useful life", accepted: ["significant cost and different useful life"] },
      { label: "Under IFRS", value: "Mandatory, not optional", accepted: ["mandatory", "required"] },
      { label: "Typical example", value: "Aircraft: airframe, engines and interior depreciated separately" },
    ],
    example:
      "A building's roof with a 20-year life is depreciated separately from the structure with a 50-year life.",
    cloze: [
      {
        text: "A component is depreciated separately if its cost is significant and its ___ differs from the rest of the asset.",
        answer: "useful life",
        hint: "Both conditions have to hold.",
      },
    ],
    mc: [
      {
        question: "Which pair must be depreciated as separate components?",
        options: [
          "An aircraft's engines (10 years) and its airframe (25 years)",
          "Two identical machines bought on the same day",
          "A laptop and its pre-installed operating system",
          "A building and the land it stands on",
        ],
        correctIndex: 0,
        explanation:
          "Componentisation applies within one asset where a significant part has a different life. Land and buildings are separate assets, not components.",
      },
    ],
  }),

  memoRule({
    id: "dep11",
    setId: "depreciation",
    category: "Changes and adjustments",
    title: "Reviewing estimates",
    statement:
      "Useful life, residual value and the depreciation method are reviewed at least at each financial year-end. Any change is a change in accounting estimate, applied prospectively — never by restating prior periods.",
    explanation:
      "This is the rule most often got wrong, because the instinct is to correct history. You do not. The remaining carrying amount is simply spread over the revised remaining life from the date of the change onwards. Prior-year figures stay exactly as reported.",
    facts: [
      { label: "Review frequency", value: "At least at each financial year-end", accepted: ["annually", "each year end", "every year"] },
      { label: "Type of change", value: "Change in accounting estimate", accepted: ["estimate", "accounting estimate"] },
      { label: "Applied", value: "Prospectively — no restatement", accepted: ["prospectively", "going forward"] },
      { label: "What gets spread", value: "The remaining carrying amount over the revised remaining life" },
    ],
    example:
      "Asset cost €100,000, 10-year life, straight-line. After 4 years (carrying amount €60,000) the remaining life is revised to 3 years → €20,000 per year from now on. Years 1–4 are untouched.",
    cloze: [
      {
        text: "A change in useful life is a change in accounting estimate and is applied ___.",
        answer: "prospectively",
        accepted: ["prospective"],
        hint: "Forward only — prior periods are not restated.",
      },
      {
        text: "Useful life and residual value must be reviewed at least at each financial ___.",
        answer: "year-end",
        accepted: ["year end", "yearend", "year"],
        hint: "Once a year, minimum.",
      },
    ],
    mc: [
      {
        question:
          "An asset with cost €80,000 and a 10-year life has been depreciated for 4 years straight-line. The remaining life is now revised to 2 years. What is the new annual charge?",
        options: ["€24,000", "€8,000", "€40,000", "€16,000"],
        correctIndex: 0,
        explanation:
          "Accumulated depreciation is 4 × 8,000 = 32,000, so the carrying amount is 48,000. Spread over the revised remaining 2 years gives 24,000 a year. Prior years are not touched.",
      },
    ],
    trueFalse: [
      {
        statement: "When the useful life of an asset is revised, prior-year financial statements must be restated.",
        isTrue: false,
        explanation: "It is a change in estimate, applied prospectively. Restatement is for errors and changes in accounting policy, not estimates.",
      },
    ],
    order: [
      {
        prompt: "Put the steps for revising a useful life in order.",
        steps: [
          "Determine the carrying amount at the date of the change",
          "Deduct the revised residual value",
          "Divide by the revised remaining useful life",
          "Apply the new charge from the current period onwards",
        ],
      },
    ],
  }),

  memoRule({
    id: "dep12",
    setId: "depreciation",
    category: "Changes and adjustments",
    title: "Depreciation vs impairment",
    statement:
      "Depreciation is the planned allocation of cost over time; impairment is an unplanned write-down when the recoverable amount falls below the carrying amount. Both can apply to the same asset.",
    explanation:
      "They answer different questions. Depreciation is scheduled and indifferent to what happens in the market. Impairment is a test, triggered by indicators, comparing carrying amount against recoverable amount — the higher of fair value less costs to sell and value in use. After an impairment, depreciation continues on the new, lower carrying amount over the remaining life.",
    facts: [
      { label: "Depreciation", value: "Planned, systematic, over the useful life" },
      { label: "Impairment", value: "Unplanned write-down to recoverable amount" },
      { label: "Recoverable amount", value: "Higher of fair value less costs to sell, and value in use", accepted: ["higher of FVLCS and value in use"] },
      { label: "After an impairment", value: "Depreciate the new carrying amount over the remaining life" },
    ],
    example:
      "A machine with a €40,000 carrying amount whose recoverable amount drops to €25,000 is impaired by €15,000; future depreciation is then based on the €25,000.",
    cloze: [
      {
        text: "Recoverable amount is the higher of fair value less costs to sell and ___.",
        answer: "value in use",
        hint: "The present value of the cash flows the asset will generate.",
      },
    ],
    trueFalse: [
      {
        statement: "Once an asset has been impaired, depreciation stops.",
        isTrue: false,
        explanation: "Depreciation continues, based on the reduced carrying amount spread over the remaining useful life.",
      },
    ],
  }),

  memoRule({
    id: "dep13",
    setId: "depreciation",
    category: "Presentation",
    title: "Accumulated depreciation and carrying amount",
    statement:
      "Accumulated depreciation is a contra-asset account holding all depreciation charged to date. Carrying amount = cost − accumulated depreciation − accumulated impairment.",
    explanation:
      "The original cost stays on the books untouched; the contra account carries the wear. Presenting them separately preserves information a single net figure would destroy — the ratio of accumulated depreciation to cost tells a reader roughly how old and how used-up the asset base is.",
    formulaTex: "\\text{Carrying amount} = \\text{Cost} - \\text{Accumulated depreciation} - \\text{Accumulated impairment}",
    facts: [
      { label: "Account type", value: "Contra-asset", accepted: ["contra asset", "contra-asset account"] },
      { label: "Carrying amount", value: "Cost − accumulated depreciation − accumulated impairment" },
      { label: "Also called", value: "Net book value", accepted: ["NBV", "book value"] },
      { label: "Journal entry", value: "Dr Depreciation expense, Cr Accumulated depreciation", accepted: ["debit depreciation expense credit accumulated depreciation"] },
    ],
    example: "Cost €50,000 with €30,000 accumulated depreciation → carrying amount €20,000.",
    cloze: [
      {
        text: "Accumulated depreciation is a ___ account, presented as a deduction from the asset.",
        answer: "contra-asset",
        accepted: ["contra asset", "contra"],
        hint: "It carries a credit balance against an asset.",
      },
      {
        text: "The depreciation journal entry debits depreciation expense and credits ___.",
        answer: "accumulated depreciation",
        hint: "Never the asset account itself.",
      },
    ],
    mc: [
      {
        question: "Which entry records the annual depreciation charge?",
        options: [
          "Dr Depreciation expense, Cr Accumulated depreciation",
          "Dr Accumulated depreciation, Cr Depreciation expense",
          "Dr Depreciation expense, Cr Cash",
          "Dr Asset, Cr Depreciation expense",
        ],
        correctIndex: 0,
        explanation:
          "Expense is debited and the contra-asset credited. No cash is involved, and the asset account keeps its original cost.",
      },
    ],
  }),

  memoRule({
    id: "dep14",
    setId: "depreciation",
    category: "Presentation",
    title: "Disposal of a depreciable asset",
    statement:
      "On disposal, gain or loss = proceeds − carrying amount at the date of disposal. Depreciation must be charged up to that date first.",
    explanation:
      "The step people skip is the part-year depreciation before the disposal is recorded — omit it and both the carrying amount and the gain are wrong. On derecognition the asset's cost and its accumulated depreciation both leave the books, and the difference against proceeds falls to profit or loss.",
    formulaTex: "\\text{Gain/loss} = \\text{Proceeds} - \\text{Carrying amount}",
    facts: [
      { label: "Formula", value: "Proceeds − carrying amount at disposal" },
      { label: "First step", value: "Charge depreciation up to the disposal date", accepted: ["depreciate to the date of disposal"] },
      { label: "On derecognition", value: "Remove both cost and accumulated depreciation" },
      { label: "Gain or loss goes to", value: "Profit or loss", accepted: ["income statement", "P&L"] },
    ],
    example:
      "Carrying amount at disposal €12,000, sold for €15,000 → gain of €3,000. Sold for €9,000 → loss of €3,000.",
    cloze: [
      {
        text: "Gain or loss on disposal = proceeds − ___ at the date of disposal.",
        answer: "carrying amount",
        accepted: ["book value", "net book value"],
        hint: "Not original cost.",
      },
    ],
    order: [
      {
        prompt: "Put the disposal steps in order.",
        steps: [
          "Charge depreciation up to the date of disposal",
          "Determine the carrying amount at that date",
          "Compare proceeds with the carrying amount",
          "Remove cost and accumulated depreciation from the books",
          "Record the resulting gain or loss in profit or loss",
        ],
      },
    ],
    mc: [
      {
        question: "An asset with cost €40,000 and accumulated depreciation €28,000 is sold for €10,000. What is the result?",
        options: ["Loss of €2,000", "Gain of €10,000", "Loss of €30,000", "Gain of €2,000"],
        correctIndex: 0,
        explanation: "Carrying amount is 40,000 − 28,000 = 12,000. Proceeds of 10,000 are 2,000 below it, so a loss of 2,000.",
      },
    ],
  }),

  memoRule({
    id: "dep15",
    setId: "depreciation",
    category: "Related concepts",
    title: "Depreciation, amortisation and depletion",
    statement:
      "The same allocation idea has three names: depreciation for tangible assets, amortisation for intangible assets, and depletion for natural resources.",
    explanation:
      "Only the asset class differs. One further distinction matters: intangibles with an indefinite useful life — goodwill being the obvious case — are not amortised at all, and are instead tested for impairment annually.",
    facts: [
      { label: "Tangible assets", value: "Depreciation" },
      { label: "Intangible assets", value: "Amortisation" },
      { label: "Natural resources", value: "Depletion" },
      { label: "Indefinite-life intangibles", value: "Not amortised — tested for impairment annually", accepted: ["not amortised", "impairment tested"] },
    ],
    example: "A patent is amortised, a delivery van is depreciated, an oil field is depleted, and goodwill is neither — it is impairment-tested.",
    cloze: [
      { text: "The allocation of an intangible asset's cost is called ___.", answer: "amortisation", accepted: ["amortization"], hint: "Not depreciation." },
      { text: "The allocation of a natural resource's cost is called ___.", answer: "depletion", hint: "Mines, oil fields, quarries." },
    ],
    mc: [
      {
        question: "How is goodwill treated?",
        options: [
          "Not amortised; tested for impairment at least annually",
          "Amortised over 10 years",
          "Depreciated over its useful life",
          "Depleted as it is consumed",
        ],
        correctIndex: 0,
        explanation: "Goodwill has an indefinite useful life under IFRS, so it is not amortised. It is subject to an annual impairment test instead.",
      },
    ],
    trueFalse: [
      {
        statement: "All intangible assets are amortised over their useful lives.",
        isTrue: false,
        explanation: "Only those with a finite useful life. Indefinite-life intangibles, including goodwill, are impairment-tested instead.",
      },
    ],
  }),

  memoRule({
    id: "dep16",
    setId: "depreciation",
    category: "Related concepts",
    title: "Book vs tax depreciation",
    statement:
      "Financial reporting and tax law compute depreciation on different rules, and the resulting timing difference gives rise to deferred tax.",
    explanation:
      "Accounting depreciation follows the asset's actual pattern of use; tax depreciation follows whatever the tax code prescribes, which is often accelerated to encourage investment. Since both eventually deduct the same total cost, the difference is purely one of timing — and a temporary difference is exactly what deferred tax exists to account for. Faster tax depreciation early on produces a deferred tax liability.",
    facts: [
      { label: "Book depreciation", value: "Follows the asset's actual pattern of use" },
      { label: "Tax depreciation", value: "Follows the tax code, often accelerated", accepted: ["accelerated", "per tax law"] },
      { label: "Nature of the difference", value: "Temporary — timing only", accepted: ["temporary", "timing difference"] },
      { label: "Faster tax depreciation creates", value: "A deferred tax liability", accepted: ["deferred tax liability", "DTL"] },
    ],
    example:
      "A machine depreciated straight-line over 10 years for reporting but written off over 5 for tax gives lower taxable profit early on and a deferred tax liability.",
    cloze: [
      {
        text: "The gap between book and tax depreciation is a ___ difference, which is why it creates deferred tax.",
        answer: "temporary",
        accepted: ["timing"],
        hint: "Both methods deduct the same total cost eventually.",
      },
    ],
    trueFalse: [
      {
        statement: "Book and tax depreciation must use the same method and useful life.",
        isTrue: false,
        explanation: "They are computed independently. The difference is temporary and is accounted for through deferred tax.",
      },
    ],
  }),
];
