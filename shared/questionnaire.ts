export type QuestionType = "scale" | "yesno" | "choice" | "frequency";

export interface Demographics {
  firstName?: string;
  gender: "male" | "female";
  age: number;
  heightUnit: "metric" | "imperial";
  heightCm?: number;
  heightFt?: number;
  heightIn?: number;
  weightUnit: "metric" | "imperial";
  weightKg?: number;
  weightLbs?: number;
}

export function calculateBMI(demographics: Demographics): number | null {
  let heightM: number;
  let weightKg: number;

  if (demographics.heightUnit === "metric") {
    if (!demographics.heightCm || demographics.heightCm <= 0) return null;
    heightM = demographics.heightCm / 100;
  } else {
    if (demographics.heightFt === undefined || demographics.heightFt <= 0) return null;
    const inches = (demographics.heightFt * 12) + (demographics.heightIn || 0);
    heightM = inches * 0.0254;
  }

  if (demographics.weightUnit === "metric") {
    if (!demographics.weightKg || demographics.weightKg <= 0) return null;
    weightKg = demographics.weightKg;
  } else {
    if (!demographics.weightLbs || demographics.weightLbs <= 0) return null;
    weightKg = demographics.weightLbs * 0.453592;
  }

  const bmi = weightKg / (heightM * heightM);
  return Math.round(bmi * 10) / 10;
}

export function getBMICategory(bmi: number): { label: string; score: number } {
  if (bmi < 16) return { label: "Severely Underweight", score: 1 };
  if (bmi < 18.5) return { label: "Underweight", score: 3 };
  if (bmi < 25) return { label: "Healthy Weight", score: 5 };
  if (bmi < 30) return { label: "Overweight", score: 3 };
  if (bmi < 35) return { label: "Obese (Class I)", score: 2 };
  return { label: "Obese (Class II+)", score: 1 };
}

export interface ChoiceOption {
  value: number;
  label: string;
}

export interface Question {
  id: string;
  text: string;
  description?: string;
  type: "choice" | "scale" | "frequency" | "yesno";
  options?: ChoiceOption[];
  isFlag?: boolean;
  flagTriggerValues?: number[];
  /** Scoring weight multiplier. Defaults to 1.0 if not specified. Higher = more impact on category score. */
  weight?: number;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  questions: Question[];
}

export const SCALE_OPTIONS: ChoiceOption[] = [
  { value: 1, label: "Very Poor" },
  { value: 2, label: "Poor" },
  { value: 3, label: "Fair" },
  { value: 4, label: "Good" },
  { value: 5, label: "Excellent" },
];

export const FREQUENCY_OPTIONS: ChoiceOption[] = [
  { value: 1, label: "Never / Rarely" },
  { value: 2, label: "Occasionally" },
  { value: 3, label: "Sometimes" },
  { value: 4, label: "Often" },
  { value: 5, label: "Always / Daily" },
];

export const YESNO_OPTIONS: ChoiceOption[] = [
  { value: 5, label: "Yes" },
  { value: 1, label: "No" },
];

export function getOptionsForQuestion(question: Question): ChoiceOption[] {
  if (question.options) return question.options;
  switch (question.type) {
    case "scale": return SCALE_OPTIONS;
    case "frequency": return FREQUENCY_OPTIONS;
    case "yesno": return YESNO_OPTIONS;
    case "choice": return SCALE_OPTIONS;
    default: return SCALE_OPTIONS;
  }
}

export const CATEGORIES: Category[] = [
  {
    id: "lifestyle",
    name: "Lifestyle Choices",
    description: "Diet (whole food plant-based, low fat), physical activity, sleep, substance use, and daily habits that shape your health trajectory.",
    icon: "Heart",
    color: "#4CAF50",
    questions: [
      {
        id: "lifestyle_1",
        text: "How closely does your diet align with a whole food plant-based, low fat approach?",
        description: "Emphasis on fruits, vegetables, whole grains, legumes, nuts, and seeds with no processed foods, oils, and no animal products.",
        type: "choice",
        options: [
          { value: 1, label: "Standard diet with mostly processed and animal-based foods" },
          { value: 2, label: "Occasionally include plant-based meals" },
          { value: 3, label: "About half my meals are whole food plant-based" },
          { value: 4, label: "Mostly whole food plant-based with occasional exceptions" },
          { value: 5, label: "Fully whole food plant-based, low fat" },
        ],
      },
      {
        id: "lifestyle_water_intake",
        text: "How much water do you drink on a daily basis?",
        description: "Adequate hydration is essential for every bodily function.",
        type: "choice",
        options: [
          { value: 1, label: "Hardly drinking water" },
          { value: 2, label: "2–4 glasses per day" },
          { value: 3, label: "4–6 glasses per day" },
          { value: 5, label: "8 glasses or more if I need" },
        ],
      },
      {
        id: "lifestyle_water_type",
        text: "What water do you drink?",
        description: "The quality and source of your drinking water matters for long-term health.",
        type: "choice",
        options: [
          { value: 1, label: "Town water" },
          { value: 2, label: "Rain water" },
          { value: 3, label: "Bore or well water" },
          { value: 4, label: "Bottled water" },
          { value: 5, label: "Distilled or reverse osmosis water" },
        ],
      },
      {
        id: "lifestyle_raw_food",
        text: "What percentage of your daily food intake is raw?",
        description: "Raw foods retain more enzymes and nutrients. The ideal is around 75%.",
        type: "choice",
        options: [
          { value: 1, label: "I seldom eat raw" },
          { value: 2, label: "Less than 50%" },
          { value: 5, label: "50–75% (ideal balance)" },
          { value: 4, label: "100%" },
        ],
      },
      {
        id: "lifestyle_2",
        text: "How many days per week do you engage in at least 30 minutes of moderate physical activity?",
        description: "Walking, cycling, swimming, gym workouts, or active hobbies.",
        type: "choice",
        options: [
          { value: 1, label: "0 days \u2014 sedentary lifestyle" },
          { value: 2, label: "1\u20132 days per week" },
          { value: 3, label: "3\u20134 days per week" },
          { value: 4, label: "5\u20136 days per week" },
          { value: 5, label: "Every day (7 days)" },
        ],
      },
      {
        id: "lifestyle_3",
        text: "How would you rate your sleep quality and consistency?",
        description: "Falling asleep easily, staying asleep, waking refreshed, consistent schedule.",
        type: "choice",
        options: [
          { value: 1, label: "Very poor \u2014 frequent insomnia, irregular schedule, always tired" },
          { value: 2, label: "Poor \u2014 often struggle to sleep or feel unrested" },
          { value: 3, label: "Fair \u2014 some good nights, some bad nights" },
          { value: 4, label: "Good \u2014 usually sleep well with minor issues" },
          { value: 5, label: "Excellent \u2014 consistent 7\u20139 hours, wake refreshed" },
        ],
      },
      {
        id: "lifestyle_4a",
        text: "How would you describe your tobacco use?",
        description: "Tobacco use includes cigarettes, cigars, pipes, vaping, and chewing tobacco.",
        type: "choice",
        weight: 2.0,
        options: [
          { value: 1, label: "Heavy daily smoker or tobacco user" },
          { value: 2, label: "Regular smoker or tobacco user" },
          { value: 3, label: "Occasional or social smoker" },
          { value: 4, label: "Former smoker — successfully quit" },
          { value: 5, label: "Never used tobacco" },
        ],
      },
      {
        id: "lifestyle_4b",
        text: "How would you describe your alcohol consumption?",
        description: "Consider all types of alcoholic beverages including beer, wine, and spirits.",
        type: "choice",
        weight: 1.8,
        options: [
          { value: 1, label: "Heavy daily drinker" },
          { value: 2, label: "Regular drinker — several times a week" },
          { value: 3, label: "Occasional or social drinker" },
          { value: 4, label: "Rarely drink — a few times a year" },
          { value: 5, label: "Never consume alcohol" },
        ],
      },
      {
        id: "lifestyle_4c",
        text: "How would you describe your caffeine consumption?",
        description: "Caffeine is found in coffee, tea, energy drinks, and some soft drinks.",
        type: "choice",
        options: [
          { value: 1, label: "Heavy daily caffeine use (5+ cups or energy drinks)" },
          { value: 2, label: "Moderate to high daily use (3–4 cups)" },
          { value: 3, label: "Moderate use (1–2 cups daily)" },
          { value: 4, label: "Minimal use — occasional only" },
          { value: 5, label: "No caffeine or only herbal teas" },
        ],
      },
      {
        id: "lifestyle_fried_food",
        text: "Do you consume deep fried food?",
        description: "Deep fried foods contain harmful trans fats and advanced glycation end products that accelerate ageing and disease.",
        type: "choice",
        options: [
          { value: 5, label: "Never" },
          { value: 4, label: "Rarely" },
          { value: 2, label: "Sometimes" },
          { value: 1, label: "Often" },
        ],
      },
      {
        id: "lifestyle_sweets",
        text: "How often do you eat sweets like cakes, pies, etc.?",
        description: "Excess refined sugar contributes to inflammation, weight gain, and chronic disease.",
        type: "choice",
        options: [
          { value: 5, label: "Never" },
          { value: 4, label: "Rarely" },
          { value: 2, label: "Sometimes" },
          { value: 1, label: "Often" },
        ],
      },
      {
        id: "lifestyle_soft_drinks",
        text: "How often do you consume soft drinks or cordials?",
        description: "Sugary beverages are a major source of empty calories and contribute to metabolic issues.",
        type: "choice",
        options: [
          { value: 5, label: "Never" },
          { value: 4, label: "Rarely" },
          { value: 2, label: "Sometimes" },
          { value: 1, label: "Often" },
        ],
      },
      {
        id: "lifestyle_5",
        text: "How consistent are your daily health routines (meals, hydration, movement breaks)?",
        description: "Regular meal times, adequate water intake, breaks from sitting.",
        type: "choice",
        options: [
          { value: 1, label: "No routine \u2014 meals and habits are irregular" },
          { value: 2, label: "Trying but rarely consistent" },
          { value: 3, label: "Somewhat consistent \u2014 good on some days" },
          { value: 4, label: "Mostly consistent with occasional lapses" },
          { value: 5, label: "Very consistent daily routines" },
        ],
      },
    ],
  },
  {
    id: "environmental",
    name: "Environmental & Structural Conditions",
    description: "Housing, air quality, water safety, neighbourhood design, and systemic barriers that shape your health options.",
    icon: "Building2",
    color: "#2196F3",
    questions: [
      {
        id: "env_1",
        text: "How safe and healthy is your living environment?",
        description: "Air quality, water safety, noise levels, mould, toxin exposure.",
        type: "choice",
        options: [
          { value: 1, label: "Significant concerns \u2014 poor air, water, or safety issues" },
          { value: 2, label: "Several issues that affect my health" },
          { value: 3, label: "Acceptable \u2014 some minor concerns" },
          { value: 4, label: "Good \u2014 mostly safe and healthy" },
          { value: 5, label: "Excellent \u2014 clean, safe, and well-maintained" },
        ],
      },
      {
        id: "env_2",
        text: "How accessible are healthy food options in your area?",
        description: "Proximity to grocery stores, farmers markets, affordable fresh produce.",
        type: "choice",
        options: [
          { value: 1, label: "Very limited \u2014 no nearby stores with fresh produce" },
          { value: 2, label: "Limited \u2014 have to travel far for healthy options" },
          { value: 3, label: "Moderate \u2014 some options available but not ideal" },
          { value: 4, label: "Good \u2014 several nearby stores with fresh produce" },
          { value: 5, label: "Excellent \u2014 abundant healthy food options nearby" },
        ],
      },
      {
        id: "env_3",
        text: "How walkable and active-friendly is your neighbourhood?",
        description: "Sidewalks, parks, bike lanes, safe streets for outdoor activity.",
        type: "choice",
        options: [
          { value: 1, label: "Not walkable \u2014 no sidewalks, parks, or safe areas" },
          { value: 2, label: "Limited \u2014 few options for outdoor activity" },
          { value: 3, label: "Moderate \u2014 some parks or paths available" },
          { value: 4, label: "Good \u2014 walkable with parks and bike lanes" },
          { value: 5, label: "Excellent \u2014 very active-friendly with many options" },
        ],
      },
      {
        id: "env_4",
        text: "How well does your work environment support your health?",
        description: "Ergonomics, breaks, air quality, stress management support.",
        type: "choice",
        options: [
          { value: 1, label: "Harmful \u2014 poor ergonomics, no breaks, high stress" },
          { value: 2, label: "Unsupportive \u2014 limited health considerations" },
          { value: 3, label: "Neutral \u2014 basic provisions but nothing proactive" },
          { value: 4, label: "Supportive \u2014 good ergonomics, regular breaks encouraged" },
          { value: 5, label: "Very supportive \u2014 wellness programs, flexible schedule" },
        ],
      },
      {
        id: "env_5",
        text: "How accessible is quality healthcare in your area?",
        description: "Proximity, affordability, wait times, culturally competent providers.",
        type: "choice",
        options: [
          { value: 1, label: "Very poor access \u2014 long waits, expensive, far away" },
          { value: 2, label: "Limited access \u2014 significant barriers" },
          { value: 3, label: "Moderate \u2014 available but with some barriers" },
          { value: 4, label: "Good \u2014 accessible and reasonably affordable" },
          { value: 5, label: "Excellent \u2014 readily available, affordable, quality care" },
        ],
      },
    ],
  },
  {
    id: "genetic",
    name: "Genetic & Epigenetic Factors",
    description: "Family health history, inherited predispositions, and how lifestyle choices influence gene expression.",
    icon: "Dna",
    color: "#FF9800",
    questions: [
      {
        id: "gen_1",
        text: "How aware are you of your family health history?",
        description: "Knowledge of conditions like heart disease, diabetes, cancer in your family.",
        type: "choice",
        options: [
          { value: 1, label: "Not aware at all" },
          { value: 2, label: "Know very little" },
          { value: 3, label: "Know some basics" },
          { value: 4, label: "Fairly well informed" },
          { value: 5, label: "Very well informed \u2014 detailed knowledge" },
        ],
      },
      {
        id: "gen_2",
        text: "How proactively do you manage known genetic risk factors?",
        description: "Screening, preventive measures, lifestyle adjustments for known risks.",
        type: "choice",
        options: [
          { value: 1, label: "Not at all \u2014 unaware or ignoring risks" },
          { value: 2, label: "Rarely \u2014 know about risks but take little action" },
          { value: 3, label: "Somewhat \u2014 take some preventive steps" },
          { value: 4, label: "Actively \u2014 regular screening and lifestyle adjustments" },
          { value: 5, label: "Very proactively \u2014 comprehensive prevention plan" },
        ],
      },
      {
        id: "gen_3",
        text: "How well do you understand the role of epigenetics in your health?",
        description: "Awareness that lifestyle can influence gene expression.",
        type: "choice",
        options: [
          { value: 1, label: "Never heard of epigenetics" },
          { value: 2, label: "Heard of it but don't understand it" },
          { value: 3, label: "Basic understanding" },
          { value: 4, label: "Good understanding \u2014 know lifestyle affects gene expression" },
          { value: 5, label: "Strong understanding \u2014 actively apply this knowledge" },
        ],
      },
      {
        id: "gen_4",
        text: "How regularly do you get preventive health screenings?",
        description: "Blood work, cancer screenings, cardiovascular checks appropriate for your age.",
        type: "choice",
        options: [
          { value: 1, label: "Never or very rarely" },
          { value: 2, label: "Only when something feels wrong" },
          { value: 3, label: "Occasionally \u2014 every few years" },
          { value: 4, label: "Regularly \u2014 annual check-ups" },
          { value: 5, label: "Very regularly — proactive and thorough" },
          { value: 6, label: "My preventative health screening is a very healthy lifestyle" },
        ],
      },
      {
        id: "gen_5",
        text: "How confident are you in your ability to positively influence your genetic expression?",
        description: "Belief that diet, exercise, stress management can affect gene activity.",
        type: "choice",
        options: [
          { value: 1, label: "Not confident \u2014 genes determine everything" },
          { value: 2, label: "Slightly \u2014 maybe some influence" },
          { value: 3, label: "Moderately \u2014 believe lifestyle has some impact" },
          { value: 4, label: "Confident \u2014 lifestyle significantly affects gene expression" },
          { value: 5, label: "Very confident \u2014 actively working to optimise gene expression" },
        ],
      },
      {
        id: "gen_6",
        text: "Do you have a personal or family history of heart disease, cardiac events, or circulatory problems?",
        description: "Including heart attacks, angina, stroke, high blood pressure, atherosclerosis, or other cardiovascular conditions.",
        type: "choice",
        isFlag: true,
        flagTriggerValues: [1, 2, 3],
        options: [
          { value: 1, label: "Yes \u2014 personal history of cardiac events or heart disease" },
          { value: 2, label: "Yes \u2014 significant family history (parents or siblings)" },
          { value: 3, label: "Yes \u2014 both personal and family history" },
          { value: 4, label: "Minor or distant family history only" },
          { value: 5, label: "No known history of heart disease or circulatory problems" },
        ],
      },
      {
        id: "gen_7",
        text: "Considering your family history, how do your current lifestyle choices support your health?",
        description: "Healthy lifestyle choices can positively influence genetic predispositions.",
        type: "choice",
        options: [
          { value: 1, label: "Family history of health issues and I have not made lifestyle changes" },
          { value: 2, label: "Family history and I am just starting to make healthier choices" },
          { value: 3, label: "Family history but I make some healthy lifestyle choices" },
          { value: 4, label: "Family history but my lifestyle with healthy choices supports health, wellness and vitality" },
          { value: 5, label: "No significant family history and I maintain a healthy lifestyle" },
        ],
      },
    ],
  },
  {
    id: "structural",
    name: "Structural & Systemic Barriers",
    description: "Income, housing stability, healthcare access, digital access, and policy-level forces that constrain choices.",
    icon: "Shield",
    color: "#4CAF50",
    questions: [
      {
        id: "struct_1",
        text: "How stable is your financial situation regarding health expenses?",
        description: "Ability to afford medications, healthy food, gym memberships, healthcare.",
        type: "choice",
        options: [
          { value: 1, label: "Very unstable \u2014 cannot afford basic health needs" },
          { value: 2, label: "Struggling \u2014 frequently have to choose between health and other expenses" },
          { value: 3, label: "Managing \u2014 can cover basics but not extras" },
          { value: 4, label: "Comfortable \u2014 can afford most health-related expenses" },
          { value: 5, label: "Very stable \u2014 health expenses are not a concern" },
        ],
      },
      {
        id: "struct_2",
        text: "How secure is your housing situation?",
        description: "Stable, safe, affordable housing without threat of displacement.",
        type: "choice",
        options: [
          { value: 1, label: "Very insecure \u2014 at risk of losing housing" },
          { value: 2, label: "Insecure \u2014 housing is a constant worry" },
          { value: 3, label: "Somewhat secure \u2014 stable for now but uncertain long-term" },
          { value: 4, label: "Secure \u2014 stable and affordable" },
          { value: 5, label: "Very secure \u2014 long-term stable housing" },
        ],
      },
      {
        id: "struct_3",
        text: "How well does your work schedule allow for healthy habits?",
        description: "Time for cooking, exercise, sleep, and recovery.",
        type: "choice",
        options: [
          { value: 1, label: "Not at all \u2014 no time for healthy habits" },
          { value: 2, label: "Barely \u2014 very limited time" },
          { value: 3, label: "Somewhat \u2014 can fit in some healthy habits" },
          { value: 4, label: "Well \u2014 reasonable time for health activities" },
          { value: 5, label: "Very well \u2014 flexible schedule supports healthy living" },
        ],
      },
      {
        id: "struct_4",
        text: "How accessible are mental health services to you?",
        description: "Affordability, availability, cultural competence of providers.",
        type: "choice",
        options: [
          { value: 1, label: "Not accessible \u2014 no affordable or available services" },
          { value: 2, label: "Very limited \u2014 long waits or high cost" },
          { value: 3, label: "Somewhat accessible \u2014 available but with barriers" },
          { value: 4, label: "Accessible \u2014 can get help when needed" },
          { value: 5, label: "Very accessible \u2014 readily available and affordable" },
        ],
      },
      {
        id: "struct_5",
        text: "How supported do you feel by community resources and services?",
        description: "Libraries, community centres, support groups, local programs.",
        type: "choice",
        options: [
          { value: 1, label: "Not supported \u2014 no community resources available" },
          { value: 2, label: "Minimally \u2014 few resources and hard to access" },
          { value: 3, label: "Somewhat \u2014 some resources available" },
          { value: 4, label: "Well supported \u2014 good community resources" },
          { value: 5, label: "Very well supported \u2014 excellent community services" },
        ],
      },
    ],
  },
  {
    id: "stress",
    name: "Stress Levels",
    description: "Workload, financial pressure, caregiving demands, and how chronic stress erodes sleep, metabolism, and resilience.",
    icon: "Brain",
    color: "#2196F3",
    questions: [
      {
        id: "stress_1",
        text: "How would you rate your current overall stress level?",
        description: "Consider work, finances, relationships, health concerns.",
        type: "choice",
        options: [
          { value: 1, label: "Extremely high \u2014 feeling overwhelmed constantly" },
          { value: 2, label: "High \u2014 frequently stressed and struggling to cope" },
          { value: 3, label: "Moderate \u2014 manageable but noticeable" },
          { value: 4, label: "Low \u2014 generally calm with occasional stress" },
          { value: 5, label: "Very low \u2014 rarely feel stressed" },
        ],
      },
      {
        id: "stress_2",
        text: "How effectively do you manage daily stressors?",
        description: "Coping strategies, boundaries, recovery practices.",
        type: "choice",
        options: [
          { value: 1, label: "Not effectively \u2014 stress controls my life" },
          { value: 2, label: "Poorly \u2014 often feel overwhelmed" },
          { value: 3, label: "Moderately \u2014 cope but could improve" },
          { value: 4, label: "Well \u2014 have good coping strategies" },
          { value: 5, label: "Very effectively \u2014 strong stress management skills" },
        ],
      },
      {
        id: "stress_3",
        text: "How often does stress interfere with your sleep?",
        description: "Racing thoughts, difficulty falling asleep, waking due to worry.",
        type: "choice",
        options: [
          { value: 1, label: "Almost every night" },
          { value: 2, label: "Several times a week" },
          { value: 3, label: "Occasionally" },
          { value: 4, label: "Rarely" },
          { value: 5, label: "Never — I sleep peacefully" },
        ],
      },
      {
        id: "stress_4",
        text: "How well do you maintain work-life boundaries?",
        description: "Disconnecting from work, protecting personal time, avoiding burnout.",
        type: "choice",
        options: [
          { value: 1, label: "No boundaries \u2014 work dominates everything" },
          { value: 2, label: "Weak boundaries \u2014 frequently work outside hours" },
          { value: 3, label: "Some boundaries \u2014 trying but inconsistent" },
          { value: 4, label: "Good boundaries \u2014 mostly disconnect after work" },
          { value: 5, label: "Strong boundaries \u2014 clear separation of work and personal life" },
        ],
      },
      {
        id: "stress_5",
        text: "How often do you practise intentional stress-relief activities?",
        description: "Meditation, deep breathing, nature walks, journaling, hobbies.",
        type: "choice",
        options: [
          { value: 1, label: "Never" },
          { value: 2, label: "Rarely — a few times a year" },
          { value: 3, label: "Sometimes — a few times a month" },
          { value: 4, label: "Often — several times a week" },
          { value: 5, label: "Daily — it's part of my routine" },
        ],
      },
    ],
  },
  {
    id: "purpose",
    name: "Purpose & Direction",
    description: "Sense of meaning, values alignment, goal clarity, and how lack of direction scatters energy and stalls growth.",
    icon: "Compass",
    color: "#FF9800",
    questions: [
      {
        id: "purpose_1",
        text: "How clear is your sense of purpose or life direction?",
        description: "Knowing what matters to you and why you get up each day.",
        type: "choice",
        options: [
          { value: 1, label: "No clear sense of purpose" },
          { value: 2, label: "Vague \u2014 searching for direction" },
          { value: 3, label: "Somewhat clear \u2014 have some idea" },
          { value: 4, label: "Clear \u2014 know what matters to me" },
          { value: 5, label: "Very clear \u2014 strong sense of purpose and direction" },
        ],
      },
      {
        id: "purpose_2",
        text: "How well do your daily activities align with your core values?",
        description: "Living in accordance with what you believe is important.",
        type: "choice",
        options: [
          { value: 1, label: "Not at all \u2014 daily life conflicts with my values" },
          { value: 2, label: "Rarely \u2014 mostly out of alignment" },
          { value: 3, label: "Sometimes \u2014 some alignment, some conflict" },
          { value: 4, label: "Mostly \u2014 daily life generally reflects my values" },
          { value: 5, label: "Fully \u2014 living in strong alignment with my values" },
        ],
      },
      {
        id: "purpose_3",
        text: "How motivated do you feel to pursue your health and wellness goals?",
        description: "Internal drive, not just external pressure.",
        type: "choice",
        options: [
          { value: 1, label: "Not motivated at all" },
          { value: 2, label: "Low motivation \u2014 hard to get started" },
          { value: 3, label: "Moderate \u2014 motivated some days" },
          { value: 4, label: "High \u2014 consistently motivated" },
          { value: 5, label: "Very high \u2014 deeply driven and committed" },
        ],
      },
      {
        id: "purpose_4",
        text: "How often do you set and work toward meaningful personal goals?",
        description: "Goal-setting, planning, and consistent follow-through.",
        type: "choice",
        options: [
          { value: 1, label: "Never — I don't set goals" },
          { value: 2, label: "Rarely — I set goals but rarely follow through" },
          { value: 3, label: "Sometimes — I set goals and occasionally achieve them" },
          { value: 4, label: "Often — I regularly set and work toward goals" },
          { value: 5, label: "Consistently — goal-setting is a core part of my life" },
        ],
      },
      {
        id: "purpose_5",
        text: "How connected do you feel to something larger than yourself?",
        description: "Community, spirituality, contribution, legacy.",
        type: "choice",
        options: [
          { value: 1, label: "Not connected \u2014 feel isolated and purposeless" },
          { value: 2, label: "Slightly \u2014 occasional sense of connection" },
          { value: 3, label: "Moderately \u2014 some sense of belonging" },
          { value: 4, label: "Connected \u2014 feel part of something meaningful" },
          { value: 5, label: "Deeply connected \u2014 strong sense of belonging and contribution" },
        ],
      },
    ],
  },
  {
    id: "relationships",
    name: "Relationships & Social Connection",
    description: "Quality of close ties, community belonging, loneliness, and how social support buffers stress and sustains change.",
    icon: "Users",
    color: "#4CAF50",
    questions: [
      {
        id: "rel_1",
        text: "How satisfied are you with the quality of your close relationships?",
        description: "Depth, trust, reciprocity with partners, family, close friends.",
        type: "choice",
        options: [
          { value: 1, label: "Very unsatisfied \u2014 lacking meaningful connections" },
          { value: 2, label: "Unsatisfied \u2014 relationships need significant work" },
          { value: 3, label: "Neutral \u2014 some good, some challenging" },
          { value: 4, label: "Satisfied \u2014 generally healthy and supportive" },
          { value: 5, label: "Very satisfied \u2014 deep, trusting, and fulfilling" },
        ],
      },
      {
        id: "rel_2",
        text: "How strong is your social support network?",
        description: "People you can rely on in times of need.",
        type: "choice",
        options: [
          { value: 1, label: "No support network \u2014 feel completely alone" },
          { value: 2, label: "Weak \u2014 very few people I can count on" },
          { value: 3, label: "Moderate \u2014 a few reliable people" },
          { value: 4, label: "Strong \u2014 several people I can rely on" },
          { value: 5, label: "Very strong \u2014 extensive and dependable network" },
        ],
      },
      {
        id: "rel_3",
        text: "How often do you engage in meaningful social interactions?",
        description: "Beyond transactional exchanges; genuine connection and vulnerability.",
        type: "choice",
        options: [
          { value: 1, label: "Never — I avoid social interaction" },
          { value: 2, label: "Rarely — a few times a year" },
          { value: 3, label: "Sometimes — a few times a month" },
          { value: 4, label: "Often — several times a week" },
          { value: 5, label: "Daily — meaningful connections are part of my life" },
        ],
      },
      {
        id: "rel_4",
        text: "How well do you maintain healthy boundaries in relationships?",
        description: "Saying no, protecting energy, avoiding toxic dynamics.",
        type: "choice",
        options: [
          { value: 1, label: "Very poorly \u2014 often taken advantage of or in toxic dynamics" },
          { value: 2, label: "Poorly \u2014 struggle to say no" },
          { value: 3, label: "Moderately \u2014 working on it but inconsistent" },
          { value: 4, label: "Well \u2014 generally maintain good boundaries" },
          { value: 5, label: "Very well \u2014 clear, healthy boundaries in all relationships" },
        ],
      },
      {
        id: "rel_5",
        text: "How connected do you feel to your broader community?",
        description: "Neighbourhood, workplace, faith groups, clubs, online communities.",
        type: "choice",
        options: [
          { value: 1, label: "Not connected \u2014 isolated from community" },
          { value: 2, label: "Slightly \u2014 minimal community involvement" },
          { value: 3, label: "Somewhat \u2014 participate occasionally" },
          { value: 4, label: "Connected \u2014 active in one or more communities" },
          { value: 5, label: "Very connected \u2014 deeply involved and valued" },
        ],
      },
    ],
  },
  {
    id: "physical_trauma",
    name: "Physical Trauma & Structural Differences",
    description: "Injuries, surgeries, congenital conditions, chronic pain, and how compensation patterns compound over time.",
    icon: "Activity",
    color: "#2196F3",
    questions: [
      {
        id: "trauma_1",
        text: "Do you currently experience chronic pain or physical discomfort?",
        description: "Ongoing pain, stiffness, or discomfort that affects daily life.",
        type: "choice",
        options: [
          { value: 1, label: "Yes \u2014 severe chronic pain that significantly limits daily life" },
          { value: 2, label: "Yes \u2014 moderate pain that frequently affects activities" },
          { value: 3, label: "Yes \u2014 mild pain that occasionally limits activities" },
          { value: 4, label: "Rarely \u2014 minor discomfort that is well managed" },
          { value: 5, label: "No \u2014 no chronic pain or discomfort" },
        ],
      },
      {
        id: "trauma_2",
        text: "Have you had significant injuries or surgeries, and how well have you recovered?",
        description: "Rehabilitation completion, residual limitations, compensation patterns.",
        type: "choice",
        options: [
          { value: 1, label: "Yes \u2014 major injuries/surgeries with poor recovery" },
          { value: 2, label: "Yes \u2014 still dealing with significant residual effects" },
          { value: 3, label: "Yes \u2014 partially recovered with some ongoing limitations" },
          { value: 4, label: "Yes \u2014 mostly recovered with minor residual effects" },
          { value: 5, label: "No significant injuries, or fully recovered" },
        ],
      },
      {
        id: "trauma_amalgam",
        text: "Do you have amalgam fillings or root canal treatments?",
        description: "Amalgam fillings contain mercury which may affect overall health. Root canal treatments can harbour bacteria.",
        type: "choice",
        options: [
          { value: 1, label: "Yes — both amalgam fillings and root canal treatments" },
          { value: 2, label: "Yes — amalgam fillings only" },
          { value: 3, label: "Yes — root canal treatments only" },
          { value: 4, label: "Had them but have since had them removed" },
          { value: 5, label: "No — no amalgam fillings or root canal treatments" },
        ],
      },
      {
        id: "trauma_implants",
        text: "Do you have any implants in your body?",
        description: "Medical implants (joint replacements, dental implants, plates, screws, etc.) and their impact on your wellbeing.",
        type: "choice",
        options: [
          { value: 1, label: "Yes — multiple implants that cause ongoing issues" },
          { value: 2, label: "Yes — implants with some discomfort or concerns" },
          { value: 3, label: "Yes — implants but no significant issues" },
          { value: 4, label: "Yes — minor implant with no issues" },
          { value: 5, label: "No — no implants" },
        ],
      },
      {
        id: "trauma_3",
        text: "How adapted is your environment to any physical limitations?",
        description: "Ergonomic setup, assistive tools, accessible spaces.",
        type: "choice",
        options: [
          { value: 1, label: "Not adapted at all \u2014 environment makes things harder" },
          { value: 2, label: "Minimally \u2014 some basic adaptations" },
          { value: 3, label: "Moderately \u2014 reasonable accommodations in place" },
          { value: 4, label: "Well adapted \u2014 good ergonomics and accessibility" },
          { value: 5, label: "Fully adapted, or no adaptations needed" },
        ],
      },
      {
        id: "trauma_4",
        text: "How consistently do you engage in appropriate physical rehabilitation or maintenance?",
        description: "Stretching, physiotherapy exercises, mobility work.",
        type: "choice",
        options: [
          { value: 1, label: "Never — I don't do any rehabilitation or maintenance" },
          { value: 2, label: "Rarely — only when in pain" },
          { value: 3, label: "Sometimes — inconsistent effort" },
          { value: 4, label: "Often — regular routine with occasional gaps" },
          { value: 5, label: "Consistently — it's a daily practice" },
        ],
      },
      {
        id: "trauma_5",
        text: "How confident are you in your body's ability to function and improve?",
        description: "Self-efficacy, body trust, willingness to challenge limitations safely.",
        type: "choice",
        options: [
          { value: 1, label: "Not confident \u2014 feel my body is failing me" },
          { value: 2, label: "Low confidence \u2014 doubt my body can improve" },
          { value: 3, label: "Moderate \u2014 believe some improvement is possible" },
          { value: 4, label: "Confident \u2014 trust my body's ability to heal and adapt" },
          { value: 5, label: "Very confident \u2014 strong belief in my body's potential" },
        ],
      },
    ],
  },
];

// ---- Health History (non-scored, conditional) ----

export interface HealthHistoryQuestion {
  id: string;
  text: string;
  description?: string;
  type: "choice" | "yesno";
  options: ChoiceOption[];
  /** Condition function: receives demographics + current health history responses, returns true if question should be shown */
  condition?: (demographics: Partial<Demographics>, responses: Record<string, number>) => boolean;
}

/**
 * These questions are NOT scored into the 8 wellness categories.
 * They provide critical health context for the AI consultation.
 * Answers are stored in the same responses record with "health_" prefix.
 */
export const HEALTH_HISTORY_QUESTIONS: HealthHistoryQuestion[] = [
  // ---- Female-specific: Menopause status (female, age > 40) ----
  {
    id: "health_menopause_status",
    text: "What is your current menopausal status?",
    description: "Menopause is a natural transition that can significantly affect overall health and wellbeing.",
    type: "choice",
    options: [
      { value: 1, label: "Pre-menopausal — I have not yet entered menopause" },
      { value: 2, label: "Peri-menopausal — I am currently experiencing menopausal changes" },
      { value: 3, label: "Post-menopausal — I have completed menopause" },
    ],
    condition: (d) => d.gender === "female" && (d.age ?? 0) > 40,
  },
  // Pre-menopausal: menses regularity
  {
    id: "health_menses_regularity",
    text: "Are your menstrual cycles regular and predictable?",
    description: "Regular cycles are generally a sign of balanced hormonal health.",
    type: "choice",
    options: [
      { value: 1, label: "Yes — my cycles are regular and predictable" },
      { value: 2, label: "No — my cycles are irregular or unpredictable" },
    ],
    condition: (d, r) => d.gender === "female" && (d.age ?? 0) > 40 && r["health_menopause_status"] === 1,
  },
  // Pre-menopausal: contraceptive pill
  {
    id: "health_contraceptive_pill",
    text: "Are you currently taking contraceptive pills?",
    description: "Hormonal contraceptives can influence nutrient absorption, mood, and metabolic health.",
    type: "choice",
    options: [
      { value: 1, label: "Yes" },
      { value: 2, label: "No" },
    ],
    condition: (d, r) => d.gender === "female" && (d.age ?? 0) > 40 && r["health_menopause_status"] === 1,
  },
  // Peri-menopausal: symptoms and severity
  {
    id: "health_menopause_symptoms",
    text: "Are you experiencing menopausal symptoms?",
    description: "Common symptoms include hot flushes, night sweats, mood changes, sleep disturbances, and joint pain.",
    type: "choice",
    options: [
      { value: 1, label: "No noticeable symptoms" },
      { value: 2, label: "Mild symptoms — occasional and manageable" },
      { value: 3, label: "Moderate symptoms — noticeable impact on daily life" },
      { value: 4, label: "Severe symptoms — significantly affecting quality of life" },
    ],
    condition: (d, r) => d.gender === "female" && (d.age ?? 0) > 40 && r["health_menopause_status"] === 2,
  },
  // Post-menopausal: symptoms resolved?
  {
    id: "health_postmenopause_symptoms",
    text: "Have your menopausal symptoms resolved?",
    description: "Some women continue to experience symptoms well after menopause has completed.",
    type: "choice",
    options: [
      { value: 1, label: "Yes — symptoms have fully resolved" },
      { value: 2, label: "Mostly — occasional mild symptoms remain" },
      { value: 3, label: "No — I still experience significant symptoms" },
    ],
    condition: (d, r) => d.gender === "female" && (d.age ?? 0) > 40 && r["health_menopause_status"] === 3,
  },
  // Female under 40: menses regularity
  {
    id: "health_menses_young",
    text: "Are your menstrual cycles regular and predictable?",
    description: "Regular cycles are generally a sign of balanced hormonal health.",
    type: "choice",
    options: [
      { value: 1, label: "Yes — my cycles are regular and predictable" },
      { value: 2, label: "No — my cycles are irregular or unpredictable" },
    ],
    condition: (d) => d.gender === "female" && (d.age ?? 0) <= 40,
  },
  // Female under 40: contraceptive pill
  {
    id: "health_contraceptive_young",
    text: "Are you currently taking contraceptive pills?",
    description: "Hormonal contraceptives can influence nutrient absorption, mood, and metabolic health.",
    type: "choice",
    options: [
      { value: 1, label: "Yes" },
      { value: 2, label: "No" },
    ],
    condition: (d) => d.gender === "female" && (d.age ?? 0) <= 40,
  },
  // ---- Male-specific: Nighttime urination (male, age > 40) ----
  {
    id: "health_night_urination",
    text: "Do you experience frequent nighttime urination?",
    description: "Waking multiple times at night to urinate (nocturia) can indicate prostate or metabolic health concerns.",
    type: "choice",
    options: [
      { value: 1, label: "No — I rarely wake at night to urinate" },
      { value: 2, label: "Occasionally — once per night" },
      { value: 3, label: "Frequently — 2 or more times per night" },
    ],
    condition: (d) => d.gender === "male" && (d.age ?? 0) > 40,
  },
  // ---- Universal questions ----
  {
    id: "health_covid_vaccination",
    text: "Did you receive any COVID-19 vaccinations?",
    description: "",
    type: "choice",
    options: [
      { value: 1, label: "Yes" },
      { value: 2, label: "No" },
    ],
  },
  {
    id: "health_covid_doses",
    text: "How many COVID-19 vaccine doses did you receive?",
    description: "",
    type: "choice",
    options: [
      { value: 1, label: "1 dose" },
      { value: 2, label: "2 doses" },
      { value: 3, label: "3 doses" },
      { value: 4, label: "4 doses" },
      { value: 5, label: "5 or more doses" },
    ],
    condition: (d, r) => r["health_covid_vaccination"] === 1,
  },
  {
    id: "health_antibiotics",
    text: "Have you taken any antibiotics in the last 5 years?",
    description: "Antibiotics can significantly disrupt the gut microbiome and affect long-term health.",
    type: "choice",
    options: [
      { value: 1, label: "Yes" },
      { value: 2, label: "No" },
    ],
  },
  {
    id: "health_antibiotics_count",
    text: "Approximately how many courses of antibiotics have you taken in the last 5 years?",
    description: "",
    type: "choice",
    options: [
      { value: 1, label: "1 course" },
      { value: 2, label: "2–3 courses" },
      { value: 3, label: "4–5 courses" },
      { value: 4, label: "More than 5 courses" },
    ],
    condition: (d, r) => r["health_antibiotics"] === 1,
  },
  {
    id: "health_meals_per_day",
    text: "How many main meals do you eat per day?",
    description: "Main meals typically include breakfast, lunch, and dinner.",
    type: "choice",
    options: [
      { value: 1, label: "1 meal" },
      { value: 2, label: "2 meals" },
      { value: 3, label: "3 meals" },
      { value: 4, label: "4 or more meals" },
    ],
  },
  {
    id: "health_bowel_movements",
    text: "How many bowel movements do you typically have per day?",
    description: "Regular bowel movements are an important indicator of digestive health and gut function.",
    type: "choice",
    options: [
      { value: 1, label: "Less than once a day" },
      { value: 2, label: "Once a day" },
      { value: 3, label: "Twice a day" },
      { value: 4, label: "3 or more times a day" },
    ],
  },
];

/**
 * Get the visible health history questions based on demographics and current responses.
 */
export function getVisibleHealthHistoryQuestions(
  demographics: Partial<Demographics>,
  responses: Record<string, number>
): HealthHistoryQuestion[] {
  return HEALTH_HISTORY_QUESTIONS.filter(
    (q) => !q.condition || q.condition(demographics, responses)
  );
}

/**
 * Format health history responses as a readable summary for the AI consultation.
 */
export function formatHealthHistorySummary(
  demographics: Partial<Demographics>,
  responses: Record<string, number>
): string {
  const visible = getVisibleHealthHistoryQuestions(demographics, responses);
  const lines: string[] = [];
  for (const q of visible) {
    const val = responses[q.id];
    if (val === undefined) continue;
    const opt = q.options.find((o) => o.value === val);
    lines.push(`${q.text} → ${opt?.label ?? String(val)}`);
  }
  return lines.length > 0 ? lines.join("\n") : "No health history data provided.";
}

export const SCORE_LABELS: Record<number, string> = {
  1: "Very Poor",
  2: "Poor",
  3: "Fair",
  4: "Good",
  5: "Excellent",
};

export function getCategoryById(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

export function calculateCategoryScore(scores: number[], weights?: number[], maxValues?: number[]): number {
  if (scores.length === 0) return 0;
  if (weights && weights.length === scores.length) {
    // Weighted average: sum(score * weight) / sum(maxScore * weight)
    let weightedSum = 0;
    let weightedMax = 0;
    for (let i = 0; i < scores.length; i++) {
      const maxVal = maxValues?.[i] ?? 5;
      weightedSum += Math.min(scores[i], maxVal) * weights[i];
      weightedMax += maxVal * weights[i];
    }
    return Math.round((weightedSum / weightedMax) * 100);
  }
  let totalScore = 0;
  let totalMax = 0;
  for (let i = 0; i < scores.length; i++) {
    const maxVal = maxValues?.[i] ?? 5;
    totalScore += Math.min(scores[i], maxVal);
    totalMax += maxVal;
  }
  return Math.round((totalScore / totalMax) * 100);
}

export function calculateOverallScore(categoryScores: Record<string, number>): number {
  const values = Object.values(categoryScores);
  if (values.length === 0) return 0;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

export function getScoreLevel(score: number): "low" | "medium" | "high" {
  if (score < 40) return "low";
  if (score < 70) return "medium";
  return "high";
}

export function getScoreLevelLabel(score: number): string {
  const level = getScoreLevel(score);
  if (level === "low") return "Needs Attention";
  if (level === "medium") return "Developing";
  return "Strong";
}

export function hasCardiacFlag(responses: Record<string, number>): boolean {
  const gen6Value = responses["gen_6"];
  if (gen6Value === undefined) return false;
  const gen6Question = CATEGORIES.find((c) => c.id === "genetic")?.questions.find((q) => q.id === "gen_6");
  if (!gen6Question?.flagTriggerValues) return false;
  return gen6Question.flagTriggerValues.includes(gen6Value);
}
