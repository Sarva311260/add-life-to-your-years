/**
 * Condition Knowledge Base
 * ========================
 * This file contains Sarva Keller's condition-specific wellness coaching knowledge.
 * Each condition follows a 4-point structure:
 *   1. Overview/Definition
 *   2. Common Symptoms/Signs
 *   3. Common Triggers/Root Causes
 *   4. Wellness Coaching Interventions (Nutrition, Movement, Stress, Sleep)
 *
 * TO EDIT: Update the text within each condition's fields below.
 * The AI consultation will automatically use the updated content.
 */

export interface ConditionKnowledge {
  id: string;
  label: string;
  overview: string;
  symptoms: string;
  triggers: string;
  interventions: {
    nutrition: string;
    movement: string;
    stress: string;
    sleep: string;
  };
}

export const CONDITION_KNOWLEDGE: ConditionKnowledge[] = [
  {
    id: "sleep",
    label: "Sleep Issues",
    overview:
      "Difficulty falling asleep, staying asleep, or achieving deep, restorative sleep, leading to a lack of energy, poor recovery, and daytime fatigue.",
    symptoms:
      "Taking longer than 30 minutes to fall asleep, frequent nighttime waking, waking up feeling unrefreshed, brain fog, and reliance on caffeine to get through the day.",
    triggers:
      "High stress/cortisol levels in the evening, late-night screen time (blue light exposure), irregular sleep schedules, heavy late-night meals, or magnesium deficiency.",
    interventions: {
      nutrition:
        "Focus on a WFPB dinner rich in complex carbohydrates (like sweet potatoes or quinoa) to naturally support serotonin production. Stop eating 3 hours before bed. Supplements: Magnesium Glycinate and Glycine 1–2 hours before bed to promote central nervous system relaxation. A low dose of Melatonin can be utilised to help reset the circadian rhythm.",
      movement:
        "Engage in daily physical activity, ideally outdoors in the morning to get sunlight exposure, which helps set the body's natural sleep-wake cycle.",
      stress:
        "Implement a digital sunset (turn off screens an hour before bed) and practice deep breathing or meditation to lower evening cortisol.",
      sleep:
        "Keep the bedroom cool, completely dark, and quiet. Maintain a consistent bedtime and wake time, even on weekends.",
    },
  },
  {
    id: "gut_health",
    label: "Gut Health",
    overview:
      "An imbalance in the gut microbiome or impairment of the digestive tract, which can hinder nutrient absorption, immune function, and overall systemic health.",
    symptoms:
      "Bloating, gas, irregular bowel movements (constipation or diarrhea), IBS symptoms, acid reflux, and food sensitivities.",
    triggers:
      "Lack of dietary fiber, consumption of highly processed foods, chronic stress, eating too quickly, or previous use of antibiotics.",
    interventions: {
      nutrition:
        "Adopt a diverse WFPB diet rich in prebiotic fibers (onions, garlic, legumes, oats) to feed good bacteria. Chew food thoroughly to aid mechanical digestion. Supplements: A Whole food probiotic to repopulate healthy bacteria. Mycelium can be used to support the gut-immune axis, and Zeolite may be utilised for gentle detoxification of the GI tract.",
      movement:
        "A light 10 to 15-minute walk after meals to stimulate digestion and balance post-meal blood sugar.",
      stress:
        "Practice mindful eating. Take 3 deep breaths before a meal to shift the body into a 'rest and digest' (parasympathetic) state.",
      sleep:
        "Prioritize deep sleep, as the gut lining undergoes critical repair during the night.",
    },
  },
  {
    id: "joint_pain",
    label: "Joint Pain",
    overview:
      "Inflammation, stiffness, or degradation within the joints, impacting mobility, flexibility, and overall quality of life.",
    symptoms:
      "Aching joints, morning stiffness, swelling, reduced range of motion, and chronic pain during movement (such as arthritis).",
    triggers:
      "Systemic inflammation, lack of movement, wear and tear, dehydration, or a diet high in pro-inflammatory processed foods.",
    interventions: {
      nutrition:
        "Emphasize a highly anti-inflammatory WFPB diet rich in antioxidants and Omega-3s (chia seeds, flax seeds, walnuts, berries, and dark leafy greens). Supplements: Vitamin C (Sodium Ascorbate) for collagen synthesis and tissue repair, Chelated Zinc to modulate inflammation, and Magnesium Glycinate to relax the muscles surrounding the affected joints.",
      movement:
        "Engage in low-impact, joint-lubricating movements like swimming, cycling, yoga, or dynamic stretching to maintain range of motion without excess impact.",
      stress:
        "Chronic stress increases inflammatory markers; incorporate daily breathwork or meditation to keep systemic inflammation low.",
      sleep:
        "Allow for adequate rest days between intense physical activities to ensure joint tissues can recover fully.",
    },
  },
  {
    id: "fatigue",
    label: "Fatigue & Low Energy",
    overview:
      "A persistent state of chronic tiredness, lethargy, or lack of vitality that does not easily resolve with rest.",
    symptoms:
      "Mid-afternoon energy crashes, brain fog, waking up exhausted, lack of motivation, and physical heaviness.",
    triggers:
      "Mitochondrial dysfunction, poor sleep quality, sedentary lifestyle, chronic stress, or nutrient deficiencies (such as low iron absorption).",
    interventions: {
      nutrition:
        "Eat a nutrient-dense WFPB diet to provide a steady release of energy without blood sugar spikes. Pair iron-rich greens with Vitamin C foods (like citrus or bell peppers) to boost absorption. Supplements: Methylene Blue to directly support mitochondrial energy production, Mycelium for adaptogenic vitality support, and Vitamin C (Sodium Ascorbate) to combat oxidative stress.",
      movement:
        "Avoid remaining sedentary for long periods; use 'movement snacks' (5 mins of stretching/walking every few hours) to boost circulation and oxygenate the brain.",
      stress:
        "Audit daily tasks to identify and reduce emotional or mental 'energy vampires.'",
      sleep:
        "Ensure 7–9 hours of high-quality sleep, avoiding late-night habits that disrupt sleep architecture.",
    },
  },
  {
    id: "stress",
    label: "Stress & Anxiety",
    overview:
      "An overactive nervous system response to mental, emotional, or physical pressures, leading to a state of chronic overwhelm or 'fight or flight.'",
    symptoms:
      "Racing thoughts, elevated heart rate, shallow chest breathing, irritability, muscle tension, and burnout.",
    triggers:
      "Work/life imbalances, excessive screen time and news consumption, poor sleep, and blood sugar dysregulation.",
    interventions: {
      nutrition:
        "Maintain stable blood sugar through a balanced WFPB diet (which prevents cortisol/adrenaline spikes associated with sugar crashes). Minimize or eliminate caffeine. Supplements: Magnesium Glycinate to calm the nervous system, alongside Taurine and Glycine to support GABA (a calming neurotransmitter) production in the brain.",
      movement:
        "Focus on grounding exercises. Nature walks (green space exposure) have a proven calming effect on the nervous system.",
      stress:
        "Implement daily structured relaxation, such as box breathing, meditation, or journaling to process racing thoughts.",
      sleep:
        "Create a strict evening wind-down routine to transition the brain from active problem-solving to rest.",
    },
  },
  {
    id: "skin",
    label: "Skin Problems",
    overview:
      "Dermatological conditions that often serve as a mirror reflecting internal systemic issues like inflammation, toxicity, or gut dysbiosis.",
    symptoms:
      "Acne, eczema, psoriasis patches, chronic redness, dry or dull skin, and premature ageing.",
    triggers:
      "Environmental toxins, poor digestion/gut health, chronic stress, dehydration, and diets high in processed sugars or oils.",
    interventions: {
      nutrition:
        "Hydrate optimally and eat a colourful, antioxidant-rich WFPB diet to protect skin at a cellular level. Supplements: Zeolite to assist the body in detoxifying heavy metals and internal toxins, Vitamin C (Sodium Ascorbate) for natural collagen production, Chelated Zinc for skin healing and controlling inflammation, and a Whole food probiotic to clear up the 'gut-skin axis.'",
      movement:
        "Regular cardiovascular exercise to induce sweating, which helps flush impurities from the pores and increases blood flow to the skin.",
      stress:
        "Cortisol directly impacts sebum (oil) production; use stress-reduction techniques to prevent stress-induced breakouts or eczema flare-ups.",
      sleep:
        "Prioritize 'beauty sleep' — the deepest phases of sleep are when the body releases human growth hormone (HGH) to repair and regenerate skin cells.",
    },
  },
  {
    id: "weight",
    label: "Weight Management",
    overview:
      "Challenges related to achieving or maintaining a healthy body composition and optimal metabolic function.",
    symptoms:
      "Stubborn weight gain (especially around the midsection), difficulty losing weight, metabolic sluggishness, or constant cravings.",
    triggers:
      "High consumption of calorie-dense/nutrient-poor foods, insulin resistance, chronic stress (high cortisol stores belly fat), and sedentary habits.",
    interventions: {
      nutrition:
        "Focus on caloric density utilising a WFPB diet. Eat high-water, high-fiber foods (vegetables, fruits, intact grains, and legumes) until satiated, which naturally regulates weight without extreme restriction. Supplements: Taurine to support cellular metabolism and insulin sensitivity, and a Whole food probiotic to cultivate a gut microbiome associated with a lean body mass.",
      movement:
        "Incorporate a mix of resistance training (to build metabolically active muscle tissue) and daily cardiovascular activity (like brisk walking).",
      stress:
        "Manage stress to lower cortisol, which in turn reduces cravings for highly processed, sugary foods.",
      sleep:
        "Inadequate sleep disrupts hunger hormones (increasing ghrelin and decreasing leptin). Ensure proper sleep to regulate appetite.",
    },
  },
  {
    id: "heart",
    label: "Heart & Cardiovascular",
    overview:
      "Conditions or risks affecting the efficiency and health of the heart muscle and the vast network of blood vessels.",
    symptoms:
      "Elevated blood pressure, poor circulation (cold hands/feet), high cholesterol markers, and shortness of breath during mild exertion.",
    triggers:
      "Diets high in saturated fats and cholesterol (typical of animal products), chronic stress, smoking, and physical inactivity.",
    interventions: {
      nutrition:
        "A strict, low-fat WFPB diet is highly protective, as it contains zero dietary cholesterol and is rich in endothelial-protecting nitrates (found in leafy greens and beets) to naturally lower blood pressure. Supplements: Taurine to support healthy heart contractility and blood flow, Magnesium Glycinate to help relax blood vessels and manage blood pressure, and Vitamin C (Sodium Ascorbate) to protect arterial walls from oxidative damage.",
      movement:
        "Engage in consistent 'Zone 2' cardiovascular training (like light jogging, cycling, or brisk walking) to strengthen the heart muscle and improve vascular elasticity.",
      stress:
        "Chronic stress directly constricts blood vessels. Practice deep breathing exercises to lower acute blood pressure.",
      sleep:
        "Ensure adequate rest to support Heart Rate Variability (HRV), a key metric of cardiovascular health and nervous system recovery.",
    },
  },
  {
    id: "diabetes",
    label: "Diabetes & Blood Sugar",
    overview:
      "An impairment in the body's ability to regulate blood glucose levels, most commonly driven by insulin resistance, where cells fail to respond effectively to insulin.",
    symptoms:
      "Frequent urination, excessive thirst, chronic fatigue, brain fog after meals, slow-healing wounds, and neuropathy (tingling in hands or feet).",
    triggers:
      "Diets high in saturated fats (which cause a build-up of intramyocellular lipids that block insulin signalling), refined carbohydrates, sedentary behaviour, and poor sleep.",
    interventions: {
      nutrition:
        "Implement a low-fat, high-fiber WFPB diet. Removing dietary fats (especially from animal products) allows muscle cells to clear out lipid blockages, restoring insulin sensitivity. Focus on intact grains, legumes, and greens. Supplements: Taurine to support cellular glucose metabolism and insulin sensitivity, and Magnesium Glycinate, as magnesium is often depleted in individuals with blood sugar dysregulation.",
      movement:
        "Take a 15-minute brisk walk immediately after meals. Muscle contractions absorb glucose directly from the bloodstream, independent of insulin.",
      stress:
        "High stress releases cortisol, which signals the liver to dump glucose into the blood. Practice deep breathing to blunt cortisol spikes.",
      sleep:
        "Just one night of poor sleep can cause acute insulin resistance the next day. Prioritize 7–9 hours of restful sleep to maintain metabolic homeostasis.",
    },
  },
  {
    id: "autoimmune",
    label: "Autoimmune Conditions",
    overview:
      "A state where the immune system becomes confused and hyperactive, mistakenly attacking the body's own healthy tissues, joints, or organs.",
    symptoms:
      "Chronic systemic inflammation, joint pain, extreme fatigue, skin rashes, digestive issues, and symptom 'flare-ups.'",
    triggers:
      "Intestinal permeability ('leaky gut'), molecular mimicry (foreign proteins resembling human tissue), environmental toxins, chronic emotional stress, and viral triggers.",
    interventions: {
      nutrition:
        "Strictly avoid all animal products and dairy, as these contain foreign proteins that can trigger immune hyper-reactivity. Focus on a highly anti-inflammatory, antioxidant-rich WFPB diet. Supplements: A Whole food probiotic to address gut permeability (where 70% of the immune system resides), Mycelium to smartly modulate (rather than overstimulate) the immune response, and Vitamin C (Sodium Ascorbate) to clear free radicals and quench inflammation.",
      movement:
        "During flare-ups, prioritize gentle movement like stretching or yoga to keep the lymphatic system flowing without exhausting the body.",
      stress:
        "The nervous and immune systems are intimately linked. Vagus nerve stimulation (via humming, cold exposure on the face, or deep breathing) helps calm immune reactivity.",
      sleep:
        "Deep sleep is non-negotiable for calming autoimmunity. Use Magnesium Glycinate to ensure the nervous system is relaxed enough to enter restorative deep sleep phases.",
    },
  },
  {
    id: "cancer",
    label: "Cancer Support",
    overview:
      "Supporting the body's biological 'terrain' to optimise immune surveillance, prevent abnormal cell growth, and aid recovery alongside primary care.",
    symptoms:
      "Unexplained weight loss, severe fatigue, localised pain, and immune suppression (often secondary to conventional treatments).",
    triggers:
      "High toxic burden, chronic inflammation, high oxidative stress, carcinogen exposure (like processed meats), and a compromised immune system.",
    interventions: {
      nutrition:
        "Adopt a WFPB diet rich in 'anti-angiogenic' foods (cruciferous vegetables, berries, garlic, and onions) that naturally starve abnormal cells by preventing them from growing new blood vessels. Supplements: Vitamin C (Sodium Ascorbate) for powerful antioxidant protection, Mycelium to support Natural Killer (NK) cell activity, Zeolite to safely bind and excrete heavy metals/toxins, and Methylene Blue to support optimal mitochondrial respiration (healthy cells use oxygen, whereas abnormal cells rely on fermentation).",
      movement:
        "Daily, moderate aerobic activity. Abnormal cells thrive in a hypoxic (low oxygen) environment; exercise oxygenates tissues and flushes the lymphatic system.",
      stress:
        "Psycho-neuro-immunology shows that unresolved trauma and chronic distress suppress immunity. Incorporate daily meditation or grounding practices to support emotional healing.",
      sleep:
        "Consider Melatonin supplementation at night — not just for sleep, but because it acts as a powerful systemic antioxidant and regulates the circadian rhythms essential for cellular repair.",
    },
  },
  {
    id: "mental_health",
    label: "Mental Health",
    overview:
      "Conditions affecting mood, cognitive function, and emotional resilience, highly linked to neuroinflammation and gut dysbiosis.",
    symptoms:
      "Persistent depression, chronic anxiety, lack of motivation, brain fog, memory issues, and emotional volatility.",
    triggers:
      "Gut microbiome imbalances (where most neurotransmitters are made), systemic inflammation crossing the blood-brain barrier, nutrient deficiencies, and chronic psychosocial stress.",
    interventions: {
      nutrition:
        "Eat a WFPB diet rich in whole-plant Omega-3s (walnuts, flax, chia) to reduce neuroinflammation, and complex carbohydrates to provide a steady stream of glucose to the brain. Supplements: A Whole food probiotic to optimise the gut-brain axis (supporting natural serotonin/dopamine production), Methylene Blue for cognitive enhancement and neuroprotection, and Glycine alongside Magnesium Glycinate to calm the central nervous system.",
      movement:
        "Regular aerobic exercise naturally boosts Brain-Derived Neurotrophic Factor (BDNF), which promotes the growth of new neural pathways and acts as a natural antidepressant.",
      stress:
        "Somatic grounding practices and spending time in nature to process trapped emotional stress and lower adrenaline.",
      sleep:
        "Sleep is when the brain's 'glymphatic system' turns on to physically wash away metabolic waste and plaque. Prioritize 8 hours of uninterrupted rest.",
    },
  },
  {
    id: "hormonal",
    label: "Hormonal Imbalance",
    overview:
      "Dysregulation of the body's chemical messengers (such as oestrogen, progesterone, thyroid hormones, or cortisol), causing systemic disruptions.",
    symptoms:
      "Hot flashes, irregular menstrual cycles, unexplained weight gain, extreme fatigue, hair thinning, mood swings, and low libido.",
    triggers:
      "Endocrine-disrupting chemicals (xenoestrogens found in plastics and animal products), chronic stress ('cortisol steal'), and a sluggish digestive tract failing to excrete old hormones.",
    interventions: {
      nutrition:
        "A high-fiber WFPB diet is crucial; fiber binds to excess circulating hormones (like oestrogen) in the gut and pulls them out of the body. Include whole-soy foods (edamame, tempeh) for phytoestrogens that safely balance receptors. Supplements: Chelated Zinc to support the conversion of inactive thyroid hormone (T4) to active (T3), and a Whole food probiotic to support the 'estrobolome' (the gut bacteria responsible for metabolising oestrogens).",
      movement:
        "Resistance training improves hormone receptor sensitivity, helping the body utilise the hormones it produces more efficiently.",
      stress:
        "The body makes cortisol out of the same raw materials as sex hormones. Managing stress prevents the body from sacrificing sex hormone production just to keep up with stress demands.",
      sleep:
        "Ensure a completely dark sleeping environment to maximise natural Melatonin production, which acts as the master conductor for all other hormonal rhythms.",
    },
  },
  {
    id: "respiratory",
    label: "Respiratory Issues",
    overview:
      "Conditions affecting the airways and lungs, leading to impaired oxygen exchange, chronic inflammation, or hyper-reactivity (like asthma or allergies).",
    symptoms:
      "Wheezing, shortness of breath, chronic cough, excessive mucus production, and frequent sinus congestion.",
    triggers:
      "Consumption of highly inflammatory, mucus-forming foods (primarily dairy), environmental allergens, poor indoor air quality, and weak immune defence in the mucosal lining.",
    interventions: {
      nutrition:
        "Strictly eliminate all dairy products, which are notorious for stimulating excess mucus production in the respiratory tract. Focus on a WFPB diet high in water-rich, antioxidant-dense fruits. Supplements: Vitamin C (Sodium Ascorbate), which acts as a powerful natural antihistamine and supports lung tissue integrity, Chelated Zinc for immune defence in the respiratory tract, and Mycelium to calm allergic hyper-reactivity.",
      movement:
        "Cardiovascular exercise performed in clean-air environments to gradually improve lung capacity and strengthen the diaphragm.",
      stress:
        "Practice nasal breathing only. Over-breathing or mouth-breathing causes airway constriction. Techniques like Buteyko breathing can reduce asthma and allergy symptoms.",
      sleep:
        "Elevate the head slightly if congested, and utilise a high-quality HEPA air purifier in the bedroom to reduce the overnight toxic load on the lungs.",
    },
  },
  {
    id: "other",
    label: "Other Condition (General / Undiagnosed)",
    overview:
      "A catch-all framework for addressing general malaise, undiagnosed symptoms, or foundational health optimisation by relying on the body's innate self-healing capacity.",
    symptoms:
      "Vague aches and pains, slight fatigue, digestive unease, dull skin, or simply feeling 'off' without a specific medical diagnosis.",
    triggers:
      "The cumulative burden of the Standard American Diet (SAD), environmental toxic load, chronic low-grade stress, and a disconnect from natural human rhythms (lack of sunlight, nature, and movement).",
    interventions: {
      nutrition:
        "Transition strictly to a baseline WFPB diet to immediately stop incoming inflammatory insults and flood the cells with micronutrients. Supplements: Establish a core foundational protocol using Vitamin C (Sodium Ascorbate) for cellular health, a Whole food probiotic to rebuild the gut microbiome, and Zeolite for a gentle, systemic detox of accumulated environmental toxins.",
      movement:
        "Establish a daily movement habit — start with simply walking 30 minutes a day to stimulate lymphatic flow, which is the body's primary waste-removal system.",
      stress:
        "Adopt a daily mindfulness practice, such as gratitude journaling or 10 minutes of meditation, to shift the nervous system out of chronic 'fight or flight' and into 'rest and repair.'",
      sleep:
        "Establish a strict sleep hygiene protocol (cool room, digital sunset, consistent schedule) to allow the body the time and energy required to assess and repair itself overnight.",
    },
  },
];

/**
 * Get the knowledge entry for a specific condition ID.
 */
export function getConditionKnowledge(conditionId: string): ConditionKnowledge | undefined {
  return CONDITION_KNOWLEDGE.find((c) => c.id === conditionId);
}

/**
 * Format condition knowledge into a readable string for the AI system prompt.
 */
export function formatConditionKnowledge(conditionId: string): string {
  const knowledge = getConditionKnowledge(conditionId);
  if (!knowledge) return "";

  return `
CONDITION: ${knowledge.label}
Overview: ${knowledge.overview}
Common Symptoms: ${knowledge.symptoms}
Root Causes/Triggers: ${knowledge.triggers}
Wellness Interventions:
- Nutrition & Supplementation: ${knowledge.interventions.nutrition}
- Movement & Exercise: ${knowledge.interventions.movement}
- Stress Management: ${knowledge.interventions.stress}
- Sleep & Recovery: ${knowledge.interventions.sleep}
`.trim();
}

/**
 * Format multiple conditions for the AI system prompt.
 */
export function formatMultipleConditions(conditionIds: string[]): string {
  return conditionIds
    .map((id) => formatConditionKnowledge(id))
    .filter(Boolean)
    .join("\n\n---\n\n");
}
