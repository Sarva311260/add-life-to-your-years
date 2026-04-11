/**
 * Video Knowledge Base
 * ====================
 * This file contains extracted insights from the curated video library
 * linked from Sarva Keller's book "Add Life to Your Years."
 *
 * Each entry corresponds to a book recommendation and contains
 * evidence-based knowledge extracted from the associated YouTube videos.
 *
 * All content has been filtered to align with the whole food plant-based (WFPB)
 * philosophy. Contradictory advice (animal products, dairy, fish, etc.) has been excluded.
 *
 * TO EDIT: Update the text within each entry's fields below.
 * The AI consultation will automatically use the updated content.
 */

export interface VideoKnowledgeEntry {
  recommendationId: number;
  recommendationTitle: string;
  insights: string;
}

export const VIDEO_KNOWLEDGE: VideoKnowledgeEntry[] = [
  {
    recommendationId: 1,
    recommendationTitle: "Whole Food Plant-Based Lifestyle",
    insights: `VIDEO INSIGHTS FOR RECOMMENDATION 1: WHOLE FOOD PLANT-BASED LIFESTYLE

Source Video A: "Whole Food Plant-Based Diet & Health"
The Standard American Diet is the leading cause of death and disability worldwide. A whole food plant-based diet provides the body with essential components to repair itself, offering high levels of antioxidants, fibre, and phytochemicals. Animal products — high in saturated fat and cholesterol — are associated with chronic inflammation and cancer promotion. Dr. T. Colin Campbell's research demonstrates a direct connection between animal protein consumption and cancer development.

The body possesses a remarkable capacity for healing and disease reversal when given the right nutritional environment:
- Heart disease can begin to reverse in as little as three weeks
- High blood pressure can be reduced within seven days
- Some individuals with type 2 diabetes have discontinued insulin within sixteen days of adopting a WFPB diet
- The diet is protective against Alzheimer's disease and obesity
- The BROAD study demonstrated effective weight loss without calorie counting

Key scientific references: The Global Burden of Disease Study, Nathan Pritikin's research, Dr. Caldwell Esselstyn's work on heart disease reversal, Dr. Dean Ornish's lifestyle medicine research, The China Study, and the Adventist Health Studies. NutritionFacts.org is recommended as a trustworthy information source.

Practical guidance: Dismiss the notion of "moderation" when it comes to unhealthy foods. Be cautious of the food industry's influence on dietary guidelines. Embrace personal accountability for one's health outcomes.

Source Video B: "Whole Food Plant-Based Living" (Loma Linda Blue Zone)
The Seventh-day Adventist community in Loma Linda, California is a recognised Blue Zone where residents live significantly longer. The Adventist Health Studies confirm that a plant-predominant diet is the most significant factor for longevity.

Three harmful biological pathways mitigated by a WFPB diet:
1. TMAO — produced from red meat, eggs, and dairy — drives atherosclerosis. Eliminated on a WFPB diet.
2. IGF-1 — stimulated by animal protein — linked to cancer growth. Reduced on plant protein.
3. mTOR pathway — activated by animal protein — accelerates cellular ageing. Downregulated on WFPB.

Three-tiered transition approach:
- Tier 1 (Weeks 1-4): Simple swaps — eat walnuts five times per week, replace red meat with beans three times per week, switch from dairy milk to soy milk.
- Tier 2 (After 4-6 weeks): Eliminate all red and processed meat, eat legumes daily, increase whole grains, restructure meal timing with the largest meal at lunch and a light, early dinner.
- Tier 3 (Full Adventist template): A completely plant-based diet with no meat, poultry, dairy, or eggs.

Additional protocols: Drink 5 or more glasses of water daily. For individuals over 65, consume at least 0.8g of plant protein per kilogram of body weight to prevent muscle loss. Avoid processed "fake meats" and be mindful of under-eating, as plant foods are less calorie-dense.`,
  },
  {
    recommendationId: 2,
    recommendationTitle: "Water — Quality and Quantity",
    insights: `VIDEO INSIGHTS FOR RECOMMENDATION 2: WATER — QUALITY AND QUANTITY

Source Video A: "Water & Hydration — Quality, Purity & Health"
Distilled water is pure H2O created by boiling water and collecting the condensed steam, mimicking the Earth's natural hydrologic cycle. This process removes pathogens, heavy metals, chemicals (fluoride, chlorine), pharmaceuticals, and volatile organic compounds.

Distilled water is described as "hungry water" due to its potent solvent and chelating properties, which allow it to pull unwanted substances out of the body. Key health benefits include:
- Removal of toxins and unwanted mineral deposits from joints, arteries, and eyes
- Potential alleviation of conditions like arthritis and cataracts
- Lower risk of kidney and gallstones
- During fasting, particularly valuable for flushing out toxins released by the body

Critical protocol: Always add minerals or electrolytes back into distilled water, or ensure consumption of a mineral-rich whole food plant-based diet to compensate. Never drink distilled water from plastic jugs due to chemical leaching risk.

Source Video B: "Water & Hydration — The Science of Staying Hydrated"
The EPA lists over 86,000 man-made chemicals, many of which end up in the water supply. Steam distillation is the most comprehensive and consistent purification method.

Four categories of water contaminants (all removed by distillation):
1. Biological: Bacteria, viruses, parasites
2. Organic: Petroleum products, pharmaceuticals, pesticides — particularly dangerous because human bodies are also carbon-based, allowing these toxins to bind easily
3. Inorganic: Heavy metals (lead, arsenic), nitrates
4. Radioactive: Radioactive elements and isotopes

Distillation vs. Reverse Osmosis (RO): While RO is a good filtration method, its effectiveness depends on water pressure, temperature, and membrane condition. As the membrane degrades, more contaminants pass through. Distillation provides more comprehensive purification.

Practical advice for distillers: Clean the boiling chamber regularly. Replace the post-carbon filter every 3-6 months. Ensure the distiller is made of 304 or 316 stainless steel. Avoid systems where purified water contacts plastic or reactive metals after distillation.

Fluoride in municipal water is a significant health concern. Some individuals may experience a Herxheimer reaction (temporary detox symptoms) when switching to highly purified water as the body flushes accumulated toxins.`,
  },
  {
    recommendationId: 3,
    recommendationTitle: "Melatonin & Sleep",
    insights: `VIDEO INSIGHTS FOR RECOMMENDATION 3: MELATONIN & SLEEP

Source: Interview with Dr. Russel Reiter, PhD — leading melatonin researcher

The Two Pools of Melatonin:
1. Pineal Melatonin (Systemic): Produced by the pineal gland, released into blood exclusively at night. Primary role is chronobiotic — regulating the sleep-wake cycle and circadian rhythms.
2. Cellular/Extra-Pineal Melatonin (Local): Produced by almost all other cells in the body, constantly throughout the day. Acts locally within cells to preserve energy production, scavenge free radicals in mitochondria, and ensure optimal cellular function.

Melatonin and Ageing:
- Levels decline significantly with age, with a precipitous drop after age 40
- This decline contributes to the ageing process and onset of age-related diseases
- Individuals in their 70s-80s who maintain good health often show preserved melatonin rhythm

Melatonin and Cancer:
- Inhibits cancer initiation and proliferation
- Prevents metastasis by stopping cancer cells from breaking through extracellular materials
- Reverses Warburg metabolism that cancer cells rely on for growth and spread

Light Management Protocol (most critical factor):
- Artificial light at night is the primary destroyer of pineal melatonin production
- Ensure total darkness in the sleeping environment
- If getting up at night, navigate without turning on lights
- Blue wavelengths from phones, TVs, and LED bulbs are particularly suppressive
- If evening screen use is unavoidable, use wrap-around red-tinted blue-blocking glasses

Dietary Sources of Melatonin:
- Nuts and seeds contain higher levels (plants concentrate protective antioxidants in seeds)
- Pistachios have some of the highest concentrations among plant foods
- Coffee beans contain melatonin but roasting destroys it

Supplementation Guidelines:
- Under 45: Generally not needed (natural production sufficient)
- Over 45-50: 3-5 mg nightly to counteract age-related decline
- Active health management: Up to 20-40 mg under professional guidance
- Look for USP (United States Pharmacopeia) certified supplements

Safety Profile: No known lethal dose. For context, aspirin kills approximately 10,000 people per year worldwide from gastric ulcers, while melatonin has no such toxicity.

Additional findings: Clinical trials show melatonin supplementation lessens severity of COVID-19 infections. Melatonin can mitigate severe side effects of certain chemotherapy drugs by protecting cardiac mitochondria.`,
  },
  {
    recommendationId: 4,
    recommendationTitle: "Glycine",
    insights: `VIDEO INSIGHTS FOR RECOMMENDATION 4: GLYCINE

Source: Interview with biochemist Dr. Joel Brind

Glycine as the Master Regulator of Inflammation:
Glycine's most critical yet overlooked role is as the body's primary "trigger lock" for the immune system. It controls the very first step in the inflammatory cascade, preventing the immune system from overreacting.

Mechanism of Action:
1. Macrophages (immune first responders) have glycine-gated chloride channels on their surface
2. When adequate glycine is present in blood, it binds to these receptors, opening the channels
3. This allows chloride ions to flow in, hyperpolarising the cell
4. This locks the "off switch" in place — minor insults won't trigger massive inflammatory response
5. The macrophage only activates for genuine threats like severe infection
6. When glycine-deficient, macrophages depolarise too easily, leading to chronic inflammation

Why Modern Diets Cause Glycine Deficiency:
- High methionine content in muscle meat actively depletes glycine stores
- The liver uses TWO molecules of glycine for every ONE molecule of methionine it clears
- Obesity shuts down one of the body's key glycine synthesis pathways

Important WFPB Finding: The EPIC Study (European Prospective Investigation into Cancer and Nutrition) measured actual blood levels and found that vegans had the HIGHEST blood levels of glycine, while heavy meat eaters had the LOWEST. A plant-based diet naturally supports glycine status. However, supplementation at therapeutic doses is still recommended for optimal anti-inflammatory benefits.

Conditions Linked to Glycine Deficiency:
- Chronic diseases (diabetes, obesity, cancer)
- Severe immune overreactions (cytokine storms)
- Everyday aches and pains, slow exercise recovery
- Joint pain, plantar fasciitis
- Allergic reactions and gout

Supplementation Protocol:
- Therapeutic dose: 8-10 grams of glycine per day
- Time to effect: Relief from aches and pains typically within 3 days
- Safety: Water-soluble amino acid, rapidly metabolised, extremely safe
- Upper tested dose: Up to 40 grams daily with no ill effects

Note on Magnesium Glycinate: While it is 86% glycine by weight, a typical dose only provides about 2 grams of glycine — far below the 8-10 grams recommended for systemic anti-inflammatory effects.

Acetaminophen (Paracetamol) Warning: This common pain reliever depletes the liver of glutathione. Because glycine is required to build glutathione, taking acetaminophen further drains glycine stores.`,
  },
  {
    recommendationId: 5,
    recommendationTitle: "Five Seeds of Life",
    insights: `VIDEO INSIGHTS FOR RECOMMENDATION 5: FIVE SEEDS OF LIFE

Source: "The Five Seeds of Life — Regenerative Power for Nerve Health"

Core Principle: Providing the body with targeted micronutrients from specific seeds can activate its natural healing capabilities, particularly for nerve health and overall vitality.

The Five Seeds and Their Specific Benefits:

1. Black Sesame Seeds (1 tablespoon daily):
   - Rich in Calcium, Magnesium, Zinc, and unique compounds called Sesamins
   - Support nerve firing and muscle contraction
   - Particularly effective in regenerating the myelin sheath
   - Critical for resolving symptoms like tingling and numbness

2. Ground Flaxseeds (1-2 tablespoons daily):
   - Rich in Lignans and Omega-3s (ALA)
   - Powerful supporter of the gut microbiome
   - A healthy gut reduces systemic inflammation, which calms the nervous system
   - CRITICAL: Always grind flaxseeds fresh before consumption — pre-ground versions oxidise and lose their benefits

3. Chia Seeds (1-2 tablespoons daily):
   - High soluble fibre content forms a gel that slows glucose absorption
   - Excellent for blood sugar stabilisation — vital for preventing nerve damage in diabetic neuropathy
   - Complete protein and rich in ALA (anti-inflammatory Omega-3)

4. Hemp Hearts (2-3 tablespoons daily):
   - Highly digestible, complete protein containing all 9 essential amino acids
   - Contains anti-inflammatory fats like GLA
   - Support muscle recovery, reduce fatigue
   - Provide readily available energy without causing digestive issues like bloating

5. Sunflower Seeds (1-2 tablespoons daily) & Pumpkin Seeds (up to 1/4 cup daily):
   - Sunflower seeds: Great source of Vitamin E, which protects nerve cell membranes from oxidative stress
   - Pumpkin seeds: Rich in Magnesium, Zinc, and Tryptophan (a precursor to Growth Hormone that aids nighttime repair and regeneration)

Practical Application: These seeds can be combined into a daily seed mix and added to smoothies, oatmeal, salads, or plant-based yoghurt. Consistency is key — daily consumption activates the body's natural healing capabilities over time.`,
  },
];

/**
 * Get video knowledge for a specific recommendation ID.
 */
export function getVideoKnowledge(recommendationId: number): VideoKnowledgeEntry | undefined {
  return VIDEO_KNOWLEDGE.find((v) => v.recommendationId === recommendationId);
}

/**
 * Format video knowledge for a specific recommendation into a string for the AI system prompt.
 */
export function formatVideoKnowledge(recommendationId: number): string {
  const knowledge = getVideoKnowledge(recommendationId);
  if (!knowledge) return "";
  return knowledge.insights;
}

/**
 * Format all available video knowledge into a single string for the AI system prompt.
 */
export function formatAllVideoKnowledge(): string {
  return VIDEO_KNOWLEDGE.map((v) => v.insights).join("\n\n---\n\n");
}

/**
 * Format video knowledge for specific recommendation IDs.
 */
export function formatVideoKnowledgeForRecommendations(recommendationIds: number[]): string {
  return recommendationIds
    .map((id) => formatVideoKnowledge(id))
    .filter(Boolean)
    .join("\n\n---\n\n");
}
