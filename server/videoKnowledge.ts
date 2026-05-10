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

Critical protocol: The body obtains its minerals most effectively from whole plant foods — not from water. A whole food plant-based diet naturally provides all the electrolytes and trace minerals the body needs, so there is no requirement to add minerals back into distilled water. Never drink distilled water from plastic jugs due to chemical leaching risk.

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
  {
    recommendationId: 6,
    recommendationTitle: "Vitamin B12 & Vitamin D",
    insights: `VIDEO INSIGHTS FOR RECOMMENDATION 6: VITAMIN B12 & VITAMIN D

Source Video A: "Vitamin B12 — Why It Matters & How to Supplement"
Vitamin B12 is the single most critical supplement for anyone following a plant-based diet. Unlike most nutrients abundant in whole plant foods, B12 is produced by soil bacteria and is no longer reliably available in modern food systems. The consequences of deficiency are severe: irreversible neurological damage, megaloblastic anaemia, cognitive decline, elevated homocysteine (a major cardiovascular risk factor), and increased cancer risk.

Why the Current RDA is Outdated: The official RDA for B12 was established based on the minimum needed to prevent overt deficiency symptoms. Newer research indicates optimal health requires significantly higher intake. Blood tests showing "normal" B12 levels can be misleading — standard serum B12 tests measure both active and inactive forms. More accurate markers are Methylmalonic Acid (MMA) and Holotranscobalamin (active B12).

Supplementation Protocol:
- Cyanocobalamin (most studied and stable) or Methylcobalamin are both effective
- Daily supplementation: 250–500 mcg per day
- Weekly supplementation: 2,000–2,500 mcg once per week (passive diffusion at high doses)
- Do not rely on B12-fortified foods alone — amounts are inconsistent
- Sublingual forms improve absorption for older adults whose intrinsic factor declines with age
- Key insight: Even vegetarians and vegans who "feel fine" should supplement proactively — neurological damage from B12 deficiency can be silent for years before symptoms appear
- Studies show vegetarians and vegans have better overall health markers than omnivores, but this advantage is significantly reduced in those who are B12-deficient

Source Video B: "Vitamin D3 — Dr. Michael Holick (Pioneer of Vitamin D Research)"
This video features an in-depth interview with Dr. Michael Holick, the scientist who identified the major circulating and active forms of Vitamin D. Dr. Holick is one of the world's foremost authorities on Vitamin D research.

Optimal Blood Levels: The Endocrine Society defines sufficiency as at least 30 ng/mL, but Dr. Holick recommends optimal blood levels of 40 to 60 ng/mL (up to 100 ng/mL is considered perfectly safe).

Daily Recommendation: 5,000–10,000 IU of Vitamin D3. Dr. Holick personally takes 8,000 IU/day. For a normal-weight person, taking 100 IU of Vitamin D raises the blood level by approximately 1 ng/mL. Obese individuals (BMI > 30) need 2 to 3 times more Vitamin D than normal-weight individuals to achieve the same blood levels.

Key Research Findings:
- VITAL Study: Taking 2,000 IU/day for five years resulted in a 25% reduction in cancer mortality and a 22% reduction in autoimmune disorders. For normal-weight individuals, it reduced cancer incidence by 24%.
- Pregnancy: Maintaining blood levels around 40 ng/mL is associated with a 60% reduced risk of premature birth. A study of 250 pregnant women showed improved odds of successful vaginal delivery when mothers were Vitamin D sufficient.
- Type 1 Diabetes: A 1960s Finnish study showed infants given 2,000 IU daily had an 88% reduced risk of developing Type 1 Diabetes. When authorities later lowered the dose to 400 IU, diabetes rates increased dramatically.
- Multiple Sclerosis: Living at higher latitudes increases MS risk by 100% due to lack of sun exposure. A Harvard study showed women taking the highest amounts of Vitamin D had approximately 40% reduced risk of MS.
- COVID-19: A study of approximately 200,000 blood samples showed that Vitamin D deficient individuals had a much higher risk of contracting and dying from COVID-19. Risk reduction improved significantly at 34 ng/mL and continued to improve up to 60 ng/mL.
- Gene Expression: A study giving healthy adults 600, 4,000, or 10,000 IU/day for six months showed a dose-dependent response. The 10,000 IU dose altered over 1,200 genes controlling apoptosis, immune function, metabolic activity, and antioxidants.

On Cofactors: Dr. Holick states that Vitamin K2, while important for bone health, is not strictly necessary alongside Vitamin D — pushing back against claims that high-dose D3 without K2 causes arterial calcium buildup. He notes there is no evidence for this unless toxic levels of Vitamin D are reached. Magnesium is required to metabolise Vitamin D but is typically adequate from a healthy diet.

Toxicity: Vitamin D toxicity is incredibly rare. Studies giving patients 50,000 IU every two weeks for years showed no toxicity.

Resources: Dr. Holick helped develop the free app "D Minder" (dminder.info), which calculates Vitamin D production from sun exposure based on location, time, skin type, and weight. His book "The Vitamin D Solution" provides comprehensive guidance.

Source Video C: "Vitamin D — The Sunshine Vitamin & Your Health"
Vitamin D deficiency affects an estimated 1 billion people globally. Despite being called a "vitamin," Vitamin D is actually a prohormone — a precursor to a powerful steroid hormone that regulates over 2,000 genes and influences virtually every system in the body.

Why Deficiency is So Common: Modern indoor lifestyles severely limit sun exposure. Sunscreen blocks UVB rays needed for Vitamin D synthesis. People living above 35° latitude cannot produce adequate Vitamin D from sunlight for 4–6 months of the year. Darker skin requires significantly more sun exposure. Obesity sequesters Vitamin D in fat tissue.

Health Impacts of Deficiency: Weakened immune function, increased cancer risk (particularly colon, breast, and prostate), depression, cognitive decline and dementia risk, osteoporosis, cardiovascular disease, and type 2 diabetes.

Optimal Blood Levels: Standard laboratory reference ranges (20–50 ng/mL) reflect the minimum to prevent rickets, not optimal health. Research suggests optimal levels are 60–80 ng/mL (150–200 nmol/L).

Supplementation Protocol:
- Test first: Get a 25-hydroxyvitamin D blood test to establish baseline
- Daily recommendation: 5,000–10,000 IU of Vitamin D3 (cholecalciferol)
- Essential co-factors: Always take with Vitamin K2 (MK-7 form, 100–200 mcg) to direct calcium to bones rather than arteries, and Magnesium (which activates Vitamin D)
- Retest after 3 months to confirm levels have reached optimal range
- Take with a meal containing fat for best absorption (fat-soluble vitamin)

Source Video D: "Vitamin D3 — Part 2 (Advanced Protocols)"
Vitamin D3 from sun or supplements must be converted twice — first in the liver (to 25-hydroxyvitamin D), then in the kidneys and other tissues (to the active hormone). This conversion requires adequate Magnesium at every step. Without sufficient Magnesium, supplementing with Vitamin D will not produce the desired health benefits.

Critical Co-factor Network:
- Magnesium: Required for both conversion steps. Deficiency is extremely common (estimated 50–80% of the population). Supplement with 300–400 mg of Magnesium Glycinate or Malate daily.
- Vitamin K2 (MK-7): Activates proteins that direct calcium to bones and teeth, preventing arterial calcification. Essential when supplementing D3 at higher doses.
- Boron: Trace mineral that extends the half-life of Vitamin D in the body. Found in nuts, seeds, and legumes — well-supplied by a WFPB diet.
- Zinc: Supports the immune functions of Vitamin D. Found in pumpkin seeds, hemp seeds, and legumes.

Toxicity Concerns: Vitamin D toxicity from supplementation is rare and requires sustained very high doses (typically >40,000 IU daily for months). Sun exposure never causes Vitamin D toxicity as the body self-regulates production. The key safety measure is regular blood testing to stay within the 60–80 ng/mL optimal range.`,
  },
  {
    recommendationId: 7,
    recommendationTitle: "The Six Movements",
    insights: `VIDEO INSIGHTS FOR RECOMMENDATION 7: THE SIX MOVEMENTS

Source Video: "The Six Movements — Japanese Exercise for Longevity"
This video draws on the movement practices of Japan's oldest and most active citizens — particularly the supercentenarians of Okinawa — to identify six simple daily movements that collectively preserve physical independence, brain health, and longevity. The key insight is that it is not vigorous exercise but consistent, gentle daily movement that distinguishes those who remain active and independent into their 90s and beyond.

The Six Movements:

1. Sampo (Slow Mindful Walking): 20–30 minutes of slow, deliberate walking daily. Unlike brisk exercise walking, Sampo emphasises awareness of each step, breath, and surroundings. Research shows it reduces cortisol, improves mood, enhances creativity, and maintains cardiovascular health. The slower pace activates the parasympathetic nervous system and reduces stress hormones.

2. Radio Taiso (Gentle Full-Body Warm-Up): A 10-minute sequence of gentle joint rotations, arm swings, trunk twists, and light stretches. Practised daily by millions of Japanese people of all ages. Improves circulation, joint mobility, and coordination. Particularly valuable first thing in the morning.

3. Deep Squat (Resting Squat): Spending time in a full deep squat position (heels on floor) for 5–10 minutes daily. This natural resting position maintains hip mobility, ankle flexibility, and pelvic floor health. Loss of the ability to squat deeply is a strong predictor of mortality risk in older adults.

4. Single-Leg Standing (Balance Training): Standing on one leg for 30–60 seconds per side, repeated several times daily. Balance is one of the strongest predictors of longevity — inability to stand on one leg for 10 seconds is associated with a near-doubling of mortality risk. Can be practised while brushing teeth or waiting for the kettle.

5. Floor Sitting Transitions (Get Down, Get Up): Practising sitting down to the floor and rising back up without using hands. Known as the Sitting-Rising Test (SRT), this is a powerful predictor of all-cause mortality. Each point scored on the SRT is associated with a 21% reduction in mortality risk. Maintains hip mobility, core strength, and functional independence.

6. Towel Twist (Grip and Upper Body Rotation): Holding a towel at both ends and twisting it in opposite directions while rotating the torso. Maintains grip strength (a key longevity biomarker), shoulder mobility, and spinal rotation. Grip strength is inversely associated with cardiovascular disease, cognitive decline, and all-cause mortality.

Why These Six Work: They address the four key physical capacities that predict healthy ageing: balance, flexibility, functional strength, and cardiovascular health. They require no equipment, no gym membership, and can be completed in under 30 minutes daily. The Japanese philosophy is that movement should be woven into daily life, not treated as a separate workout.`,
  },
  {
    recommendationId: 10,
    recommendationTitle: "Meditation",
    insights: `VIDEO INSIGHTS FOR RECOMMENDATION 10: MEDITATION

Source Video: "Meditation — Neuroscience, Cortisol & Emotional Resilience"
Regular meditation produces measurable, structural changes in the brain — not just temporary relaxation. These changes have profound implications for stress resilience, cognitive performance, emotional regulation, and longevity.

Structural Brain Changes from Regular Meditation:
- Increased grey matter density in the prefrontal cortex (decision-making, impulse control, planning)
- Enlarged hippocampus (memory formation and emotional regulation) — meditation reverses hippocampal shrinkage caused by chronic stress
- Reduced amygdala volume (the brain's fear and threat-detection centre) — meditators show less reactive fear responses
- Thicker insula (interoception — awareness of internal body states) — meditators are better at detecting subtle physical signals
- Slower brain ageing: Long-term meditators show significantly less age-related cortical thinning

Cortisol and the Stress Response: Chronic stress elevates cortisol, which damages the hippocampus, suppresses immune function, promotes inflammation, accelerates cellular ageing (telomere shortening), and drives weight gain (particularly abdominal fat). Regular meditation is one of the most effective evidence-based interventions for reducing chronic cortisol levels.

Cognitive and Emotional Benefits:
- Improved attention span and focus (even 8 weeks of practice shows measurable improvement)
- Enhanced working memory and reduced mind-wandering
- Increased empathy and compassion
- Reduced emotional reactivity — meditators respond rather than react
- Improved pain tolerance (meditation changes how the brain processes pain signals)

Practical Starting Protocol:
- Begin with just 5–10 minutes daily — consistency matters more than duration
- Breath-focused meditation (following the breath, gently returning attention when the mind wanders) is the most researched and accessible form
- Body scan meditation is particularly effective for stress reduction
- Loving-kindness (Metta) meditation specifically increases compassion and social connection
- The goal is not to stop thinking but to observe thoughts without attachment

Research Highlights: An 8-week Mindfulness-Based Stress Reduction (MBSR) programme produced measurable increases in grey matter density in the hippocampus and reductions in amygdala volume. Harvard studies show meditators' brains age 7 years more slowly than non-meditators.`,
  },
  {
    recommendationId: 11,
    recommendationTitle: "Time in Nature",
    insights: `VIDEO INSIGHTS FOR RECOMMENDATION 11: TIME IN NATURE

Source Video: "Time in Nature — Forest Bathing, Sunlight & Healing"
Spending time in natural environments produces profound healing effects — from forest bathing (Shinrin-yoku) to morning sunlight exposure — through measurable biological mechanisms.

Forest Bathing (Shinrin-yoku): Developed in Japan in the 1980s as a public health initiative, forest bathing involves slow, mindful immersion in a forest environment — not hiking or exercise, but simply being present among trees. Research demonstrates:
- Significant reductions in cortisol, adrenaline, and noradrenaline
- Lowered blood pressure and heart rate
- Enhanced Natural Killer (NK) cell activity (immune cells that target cancer cells and viruses) — effects lasting up to 30 days after a 3-day forest immersion
- Reduced inflammatory markers
- Improved mood, reduced anxiety and depression scores

The Phytoncide Effect: Trees emit volatile organic compounds called phytoncides (particularly alpha-pinene and limonene) as a natural defence against insects and pathogens. When humans inhale these compounds, they trigger increases in NK cell activity and anti-cancer proteins. This is a key mechanism behind the immune-boosting effects of forest environments.

Sunlight Beyond Vitamin D: Morning sunlight exposure (within the first hour of waking) has effects beyond Vitamin D synthesis:
- Sets the circadian clock — morning light signals to the brain that it is daytime, improving sleep quality that night
- Stimulates serotonin production (the precursor to melatonin)
- Triggers the release of nitric oxide from skin, improving vascular health
- Infrared light from the sun penetrates tissue and stimulates mitochondrial function (photobiomodulation)

Practical Protocol:
- Minimum effective dose: 5 minutes in nature significantly improves mood and self-esteem
- Optimal: 20–30 minutes of morning sunlight (before 10am) with skin exposure
- Forest bathing: 2 hours in a natural environment provides measurable NK cell benefits
- Barefoot contact with the earth (grounding/earthing) reduces inflammatory markers and improves sleep
- Even urban green spaces provide measurable benefits — the key is natural elements (trees, water, soil)

Research: A meta-analysis of 10 studies found that outdoor exercise in natural environments produced significantly greater improvements in mood and self-esteem than indoor exercise. Hospital patients with window views of trees recover faster and require less pain medication than those with views of walls.`,
  },
  {
    recommendationId: 12,
    recommendationTitle: "Repairing Relationships",
    insights: `VIDEO INSIGHTS FOR RECOMMENDATION 12: REPAIRING RELATIONSHIPS

Source Video: "Repairing Relationships — Social Connection & Longevity"
This video focuses on the psychological concept of "rupture and repair" in interpersonal relationships — the idea that conflict and disconnection are inevitable, but the ability to repair those ruptures is what determines relationship health and longevity.

Key Insights on Relationship Health:
- All relationships experience ruptures (moments of disconnection, conflict, misattunement)
- The quality of a relationship is not determined by the absence of conflict but by the capacity to repair after conflict
- Emotional maturity involves the ability to acknowledge one's role in a rupture, take responsibility, and initiate repair
- Unrepaired ruptures accumulate and erode trust, intimacy, and connection over time
- The repair process itself — when done well — can actually deepen a relationship beyond its pre-rupture state

The Repair Process:
1. Recognise that a rupture has occurred (awareness)
2. Take responsibility for your part without defensiveness
3. Express genuine empathy for the other person's experience
4. Make a concrete repair attempt (apology, changed behaviour, renewed connection)
5. Allow time for the repair to be received and integrated

Connection to Health and Longevity: The Harvard Study of Adult Development (the longest-running study on happiness and health) found that the quality of close relationships is the single strongest predictor of health and happiness in later life — more than wealth, fame, or even physical health metrics. Loneliness and social isolation are as damaging to health as smoking 15 cigarettes per day.`,
  },
  {
    recommendationId: 13,
    recommendationTitle: "Second Income Stream",
    insights: `VIDEO INSIGHTS FOR RECOMMENDATION 13: SECOND INCOME STREAM

Source Video: "Second Income Stream — Financial Stress & Health"
Financial stress is one of the most pervasive and damaging forms of chronic stress in modern life. Its health consequences include elevated cortisol and chronic inflammation, disrupted sleep (financial worry is a leading cause of insomnia), increased cardiovascular disease risk, suppressed immune function, and reduced ability to invest in healthy food, exercise, and preventive healthcare.

Three Strategies for Creating a Second Income Stream:
1. Monetise existing skills and knowledge: Identify expertise you already have (professional skills, hobbies, life experience) and create a service or product around it — consulting, coaching, teaching, writing, or creating digital content.
2. Create passive income assets: Develop assets that generate income without ongoing active work — digital products (ebooks, courses, templates), rental income, dividend-paying investments, or royalties.
3. Leverage the sharing economy: Use existing assets (home, car, equipment, time) to generate income through platforms that match supply with demand.

The Wellness Connection: Financial security is not separate from health — it is a foundational pillar of it. Reducing financial stress directly reduces cortisol, improves sleep, and frees cognitive and emotional resources for health-promoting behaviours. The goal is not wealth accumulation but financial resilience — having enough buffer that unexpected expenses do not create a health crisis.`,
  },
  {
    recommendationId: 14,
    recommendationTitle: "Your Environment",
    insights: `VIDEO INSIGHTS FOR RECOMMENDATION 14: YOUR ENVIRONMENT

Source Video: "Your Environment — Air Quality, Toxins & Healing Spaces"
Our bodies are in constant biochemical dialogue with the spaces we inhabit. Environmental factors that affect health include air quality (indoor air is often 2–5 times more polluted than outdoor air), light quality and quantity (artificial light disrupts circadian rhythms), electromagnetic field exposure, noise levels (chronic noise exposure elevates cortisol and blood pressure), clutter and visual complexity (increase cognitive load and stress), and temperature (affects sleep quality, metabolic rate, and immune function).

Workspace Optimisation:
- Stand-up desks reduce the health risks of prolonged sitting (associated with increased mortality independent of exercise habits)
- Natural light in workspaces improves mood, alertness, and sleep quality
- Plants in workspaces reduce stress, improve air quality, and increase productivity
- Separating work and rest spaces is critical — working from the bedroom activates the stress response in spaces meant for recovery

Bedroom as a Healing Space:
- Keep the bedroom exclusively for sleep and intimacy — no work, no screens
- Optimal temperature: 16–19°C (60–67°F) for deep sleep
- Total darkness: Use blackout curtains and cover all LED indicator lights
- Silence or white noise: Eliminate noise disruptions
- Remove electronic devices: Phones and tablets emit blue light and electromagnetic fields that disrupt melatonin production

Indoor Air Quality:
- Open windows daily for ventilation, even briefly
- Use HEPA air purifiers in bedrooms and main living areas
- Avoid synthetic fragrances (candles, air fresheners, fabric softeners) — contain volatile organic compounds (VOCs) that are endocrine disruptors
- Choose low-VOC paints and furnishings
- Houseplants (particularly spider plants, peace lilies, and snake plants) filter indoor air pollutants`,
  },
  {
    recommendationId: 15,
    recommendationTitle: "Methylene Blue & Photobiomodulation",
    insights: `VIDEO INSIGHTS FOR RECOMMENDATION 15: METHYLENE BLUE & PHOTOBIOMODULATION

Source Video: "Methylene Blue — Mitochondrial Medicine & Photobiomodulation"
Methylene Blue (MB) is a synthetic compound with over 130 years of medical history — it was the first fully synthetic drug used in medicine. It is experiencing a renaissance in longevity and mitochondrial medicine research due to its unique ability to act as an electron carrier in the mitochondrial respiratory chain.

Mechanism of Action: Mitochondria produce ATP (cellular energy) through the electron transport chain. As we age, this chain becomes less efficient — electrons "leak" and create damaging free radicals. Methylene Blue can accept and donate electrons, acting as an auxiliary electron carrier that bypasses damaged segments of the chain. This increases ATP production efficiency, reduces free radical generation, protects mitochondria from oxidative damage, and improves cellular energy availability.

Evidence-Based Benefits:
- Cognitive enhancement: Improves memory consolidation, attention, and processing speed. Clinical trials show improvements in Alzheimer's disease markers.
- Neuroprotection: Protects neurons from oxidative stress and mitochondrial dysfunction — relevant for Parkinson's, Alzheimer's, and traumatic brain injury.
- Antimicrobial: Historical use as an antimalarial; active against certain bacteria, viruses, and fungi.
- Antidepressant effects: Inhibits MAO (monoamine oxidase) and increases serotonin and dopamine availability.

Synergy with Red Light and Sunlight (Photobiomodulation): Methylene Blue has a unique synergy with red and near-infrared light. When MB is present in tissues and red/NIR light is applied, the photochemical reaction dramatically amplifies ATP production — far beyond what either intervention achieves alone.

Dosing Protocol:
- Pharmaceutical-grade (USP) Methylene Blue only — never industrial or laboratory grade
- Low-dose protocol: 0.5–4 mg/kg body weight
- Typical starting dose: 10–20 mg per day
- Take in the morning (stimulating effect may interfere with sleep if taken late)
- Expect blue-green urine and potentially blue-tinged tongue — this is normal and harmless

Critical Contraindications:
- CRITICAL: Do NOT combine with SSRIs, SNRIs, MAOIs, or other serotonergic medications — risk of potentially fatal serotonin syndrome
- G6PD deficiency: Contraindicated
- Pregnancy: Avoid
- Always consult a healthcare provider before use, particularly if on any medications`,
  },
  {
    recommendationId: 18,
    recommendationTitle: "Appendix A: Diet Comparison — Keto, Carnivore, Mediterranean, Paleo, Vegan vs WFPB",
    insights: `VIDEO INSIGHTS FOR APPENDIX A: DIET COMPARISON

Source Video A: "What Humans Are Designed To Eat (According To Science)"
For 90% of our 25-million-year evolutionary history, humans consumed over 95% plants. True carnivores (lions, wolves) possess biological mechanisms to handle dietary cholesterol and saturated fat — humans lack these entirely. Palaeolithic humans had a life expectancy of approximately 25 years and did not live long enough to develop chronic diseases. Meat consumption was a survival strategy, not a blueprint for longevity.

Key evidence: Epidemiological data from 20th-century populations on near-exclusive plant-based diets showed virtually no coronary artery disease, hypertension, stroke, diabetes, or common cancers. The WFPB diet is the ONLY diet scientifically proven to not only halt but reverse heart disease — demonstrated by Pritikin, Ornish, and Esselstyn.

Critical distinction: WFPB is not the same as general veganism. Health benefits are derived from unprocessed plant foods, not processed vegan junk food.

Key references: Turner & Thompson (Nutrition Reviews), Eaton & Konner (NEJM 1985 & 2010), Milton (Am J Clin Nutr 2000), Jenkins et al. (Comp Biochem Physiol 2003), Roberts (Am J Cardiology 1990), Esselstyn et al. (J Family Practice 2014).

Source Video B: "The Ketogenic Diet: Is It Healthy? (What the Science Says)"
Keto's primary weaknesses: Requires over 37,500 calories/day to meet essential vitamin/mineral needs on some popular plans. Documented clinical complications include scurvy and selenium deficiency causing sudden cardiac death in children. Eliminates prebiotics, fibre, and resistant starches — gut microbiome changes detectable within 24 hours. Saturated fat reaching the colon induces weight gain, leaky gut, and inflammation.

Mortality data: Low-carbohydrate animal-based diets are linked to increased all-cause mortality and 50% higher cardiovascular disease risk (Harvard cohort and ARIC cohort studies, Lancet Public Health). Impairs artery function and blunts beneficial cholesterol effects of weight loss.

In contrast: Plant-based low-carbohydrate approaches (whole vegetables, nuts, whole grains) are associated with LOWER mortality — the opposite of animal-based keto.

Key references: Calton (JISSN), Hall/NuSI study (Cell Metabolism), Noto et al. PLOS ONE meta-analysis, Seidelmann et al. Lancet Public Health, Harvard ARIC cohort.

Source Video C: "The Ketogenic Diet is a Scam"
The NuSI study (funded by low-carb advocates Gary Taubes and Peter Attia to PROVE keto superiority) instead falsified the carbohydrate-insulin model. In 17 overweight men in metabolic wards: keto produced 3.5 lbs weight loss in 7 days — but actual body fat loss rate SLOWED by more than half. The loss was water weight and lean muscle mass. Body began breaking down its own protein when deprived of glucose.

Crossfit study: 8% shrinkage in leg muscle thickness on keto diet. High-carbohydrate diet produced steadier and faster actual body fat loss despite less dramatic scale weight changes.

Conclusion: The carbohydrate-insulin model of obesity has been experimentally falsified by its own proponents' research. High-carbohydrate whole food diets (like WFPB) are superior for actual fat loss and muscle retention.

Key researchers: Kevin Hall (NIH), Gary Taubes, Gerald Reaven, John Farquhar.

Source Video D: "Mediterranean Diet vs. Whole Food Plant-Based Diet for Heart Disease"
Mediterranean diet evidence: Lyon Diet Heart Study (~600 patients) — reduced annual cardiac event rate from ~4% to ~1%. Significant improvement, but patients continued to experience new cardiac events. Disease slowed, not stopped or reversed.

WFPB evidence: Esselstyn Cleveland Clinic case series (198 patients with advanced CVD): Among 177 adherent patients — recurrent cardiac event rate less than 0.6%. Among 21 non-adherent patients — 62% experienced adverse events. This is disease REVERSAL, not merely slowing.

Dr. Dean Ornish quote: "A Mediterranean diet is an improvement over what most people eat, but a whole-food, plant-based diet is superior."

Key distinction for AI consultations: When clients ask about Mediterranean diet, acknowledge its genuine benefits while clearly explaining it cannot reverse established disease. WFPB is the only evidence-based approach for disease reversal.

Key references: Sofi et al. (Am J Clin Nutr 2010), de Lorgeril Lyon Diet Heart Study (Circulation 1999), Esselstyn et al. (J Family Practice 2014), Ornish et al. (Lancet 1990, JAMA 1998).

Source Video E: "Is a Plant-Based Diet Always Healthy? (The Unhealthy Vegan)"
Critical distinction for all consultations: A vegan diet ≠ a WFPB diet. This is one of the most important clarifications to make with clients.

Harvard study (PLOS Medicine, 3 large prospective cohorts): Healthy plant foods (whole grains, fruits, vegetables, nuts, legumes) — reduced Type 2 Diabetes risk by nearly HALF. Unhealthy plant foods (fruit juices, sweetened beverages, refined grains, potatoes, sweets) — INCREASED Type 2 Diabetes risk, even though technically vegan.

Junk food veganism (processed vegan products, refined oils, fake meats, white bread, chips, soft drinks) offers NO meaningful health advantage and can be actively harmful — performing worse than a general mixed diet.

Motivation matters: Health-motivated vegans make consistently healthier food choices than ethics-motivated vegans (Appetite journal research).

Key message for AI consultations: When clients say they "eat vegan" or "plant-based," always probe for food quality. The health benefits are EXCLUSIVELY tied to whole, unprocessed plant foods. "Big changes beget big results" — rapid improvements from strict WFPB provide strong motivation to continue.

Key references: Satija et al. PLOS Medicine (Harvard, 3 cohorts), Prevención con Dieta Mediterránea (PREDIMED) study, Diabetes Educator journal, Appetite journal studies on vegan lifestyle behaviours.`,
  },
  {
    recommendationId: 1,
    recommendationTitle: "Whole Food Plant-Based Lifestyle (Dr. Ellsworth Wareham)",
    insights: `VIDEO INSIGHTS: DR. ELLSWORTH WAREHAM — 98-YEAR-OLD VEGAN HEART SURGEON

Source Video: "Dr. Ellsworth Wareham — 98 years old vegan" (YouTube: FX58PyQwrcI)

Dr. Ellsworth Wareham was a cardiothoracic surgeon who practiced until age 95 and followed a vegan diet for approximately half his life. His personal experience and clinical observations provide compelling evidence for the WFPB approach to cardiovascular health.

Key clinical insights:
- Cholesterol is identified as the chief problem in developing coronary artery disease
- If total cholesterol is kept under 140 mg/dL, heart attacks are "very, very seldom" — Dr. Wareham's own cholesterol was 117 mg/dL
- Exercise alone cannot significantly lower cholesterol if the diet is high in saturated animal fats
- The easiest and most effective way to lower cholesterol is through a low-fat vegan diet
- A low-fat vegan diet can not only prevent but also arrest and reverse existing coronary artery disease
- Animal proteins (such as casein in milk) also raise cholesterol, not just animal fats

Taste adaptation: Food preferences are learned behaviours. When a person changes their diet and gradually reduces salt, taste buds adapt within a few months, allowing them to enjoy healthy plant-based foods. The Wall Street Journal noted that "all tastes are acquired except for breast milk."

Public health: Widespread adoption of healthy dietary habits could drastically reduce the incidence of coronary disease, which is primarily a disease of developed countries.

Key references: Dr. T. Colin Campbell (Cornell University) on animal proteins and cholesterol, Dr. Dean Ornish (San Francisco) and Dr. Caldwell Esselstyn (Cleveland Clinic) — the only doctors who have clinically demonstrated that coronary artery disease can be arrested and reversed using a low-fat vegan diet. Dr. Esselstyn's position: coronary artery disease "does not need to exist, and if it does, it doesn't need to progress."`,
  },
  {
    recommendationId: 1,
    recommendationTitle: "Whole Food Plant-Based Lifestyle (Dr. John Scharffenberg)",
    insights: `VIDEO INSIGHTS: DR. JOHN SCHARFFENBERG — 100-YEAR-OLD DOCTOR'S 7 RISK FACTORS

Source Video: "100 Year-Old Nutrition Professor: 7 Keys to Longevity" (YouTube: RGy3jhiPqD0)

Dr. John Scharffenberg is a 100-year-old preventive medicine doctor and nutritionist who has been a vegetarian his entire life. He advocates for lifestyle changes as the primary method for preventing disease and extending lifespan.

The 7 Risk Factors for Cardiovascular Disease:
1. Tobacco — Do not smoke. Known cause of death and disease.
2. Alcohol — Consume zero alcohol. No safe level exists. Any amount increases risk of dying. Alcohol is a risk factor for breast cancer in women. Major study by Max Griswold (University of Washington), funded by Bill Gates and published in The Lancet, concluded the safe amount of alcohol is zero.
3. Inactivity — Exercise every day. An obese person who exercises daily will live longer than a normal-weight person who does not exercise. Importance increases during mid-life (ages 40–70).
4. Overweight — Maintain healthy weight, but prioritise exercise even if overweight. Being overweight increases risk of dying from almost every known disease.
5. Sugar — Reduce sugar intake. Too much sugar increases heart attack risk.
6. Meat — Avoid meat. The optimum diet is a vegetarian diet.
7. Saturated Fat — Limit to no more than 5–6% of total calories. This essentially requires a vegetarian diet.

Key health claims:
- The optimum diet is vegetarian — agreed upon by WHO, American Heart Association, and European Cardiology Society
- In 2015, medical scientists advised the US government that the optimum diet is vegetarian, but agriculture lobby altered the recommendation to include "lean meat"
- Living the right lifestyle can lower heart attack risk by 80%, stroke risk by 80%, and diabetes risk by 88% without any pills
- Critique of statins: For 93% of people taking statins, the pills did not extend their lives by a single day. Only 7% with severe heart disease gained approximately 8 months
- Doctors should prescribe lifestyle changes (like an hour of exercise daily) rather than immediately turning to pills

Key references: Max Griswold study (The Lancet), American Heart Association (5–6% saturated fat guideline), World Health Organization, European Cardiology Society.`,
  },
  {
    recommendationId: 99,
    recommendationTitle: "Cold Showers — Evidence-Based Wellness Practice",
    insights: `SUPPLEMENTARY KNOWLEDGE: THE SCIENCE OF COLD SHOWERS

This is an additional wellness practice that can be recommended to most healthy adults as a simple, free, evidence-based daily habit.

1. IMMUNE RESILIENCE (The Dutch Cold Shower Trial)
A landmark 2016 randomised controlled trial (Buijze et al., PLOS ONE) enrolled 3,018 participants. Those who ended their warm shower with 30-90 seconds of cold water reported a 29% reduction in sickness absence from work. Important caveat: they got sick at the same rate as the control group, but their symptoms were less severe — similar to the effect of regular exercise on illness. 30 seconds produced the same benefit as 90 seconds. 91% of participants chose to continue the practice after the trial ended.

2. NEUROCHEMISTRY — ALERTNESS AND MOOD
Cold water activates the sympathetic nervous system, triggering release of norepinephrine and endorphins. Research shows cold water immersion at 14°C for one hour increased plasma norepinephrine by 530% and dopamine by 250% (Srámek et al., European Journal of Applied Physiology, 2000). Even brief cold exposure produces meaningful increases within 2 minutes. Norepinephrine is a key neurotransmitter for attention, focus, and mood regulation — the same molecule targeted by SNRI antidepressants. A 2008 hypothesis paper (Shevchuk, Medical Hypotheses) proposed that adapted cold showers could help treat depression symptoms through the massive activation of cold receptors in the skin. NOTE: Cold showers should NOT replace professional mental health treatment — they may be a useful adjunct.

3. MUSCLE RECOVERY
Cold water causes vasoconstriction, reducing localised inflammation and Delayed Onset Muscle Soreness (DOMS). A meta-analysis (Leeder et al., British Journal of Sports Medicine, 2012) confirmed cold water immersion alleviates DOMS symptoms. IMPORTANT CAVEAT: If the goal is building muscle size (hypertrophy), cold water immediately after resistance training may be counterproductive — it suppresses the inflammatory signalling needed for muscle growth (Roberts et al., Journal of Physiology, 2015; Petersen & Fyfe, European Journal of Sport Science, 2024). Recommendation: avoid cold exposure for several hours after strength training if building muscle is the goal.

4. BROWN FAT ACTIVATION
Cold exposure activates brown adipose tissue, which burns calories to generate heat. Research confirms adults retain metabolically active brown fat that can be activated by cold (Cypess et al., NEJM, 2009). Cold acclimation increases brown fat activity and non-shivering thermogenesis (van der Lans et al., Journal of Clinical Investigation, 2013). However, the calorie-burning effect of a brief daily cold shower is negligible — it will NOT cause meaningful weight loss. The more interesting benefit is improved insulin sensitivity and glucose metabolism.

5. SKIN AND HAIR
Hot water strips natural oils (sebum) from skin and hair, causing dryness and irritation. Cold water preserves these protective oils. Cold water also temporarily reduces skin redness and facial puffiness through vasoconstriction.

WHO SHOULD AVOID COLD SHOWERS:
- Cardiovascular disease, heart attack history, stroke, or arrhythmia (cold shock can trigger dangerous cardiac events)
- Raynaud's syndrome
- Compromised thermoregulation (advanced age, severe malnutrition, certain neurological conditions)
- Pregnant women should consult their healthcare provider first
The cold shock response causes sudden increases in heart rate and blood pressure. Research has documented cardiac arrhythmias from cold water submersion even in healthy volunteers through "autonomic conflict" (Shattock & Tipton, Journal of Physiology, 2012).

PRACTICAL PROTOCOL ("Scottish Shower"):
- Take a normal warm shower
- At the very end, turn water to cold (below 15°C / 60°F) for 30-60 seconds
- Focus on slow, deep breaths to override the initial cold shock response
- 30 seconds is sufficient — the Dutch trial showed no additional benefit from longer durations
- Most people find it becomes enjoyable within a week

WHEN TO RECOMMEND:
This practice is suitable for most healthy adults and can be recommended as part of a holistic wellness routine. It costs nothing, requires no equipment, and takes less than a minute. It pairs well with other recommendations — particularly stress management, sleep quality, and immune resilience. Always ask about cardiovascular conditions before recommending.

VIDEO RESOURCES:
Video 1 (youtubeId: xTVMGyJ8cZU): "Cold Showers — Hormesis, Inflammation & Cognitive Benefits" — Explores the science of hormesis (low-dose stress creating beneficial adaptations). Covers 7 key benefits: decreased muscle/joint pain, faster recovery, reduced inflammation, increased cognitive function, improved mood, enhanced metabolism. Explains norepinephrine increases of 200–300%, antioxidant network boosts including glutathione, increased mitochondrial density, and strengthened T-cell immune response. Practical advice: start with 30 seconds to 1 minute, use contrast therapy (alternating hot and cold).

Video 2 (youtubeId: may_PlDfNRE): "Dr. Jin Sung — The Science Behind Cold Showers: 5 Evidence-Based Benefits" — Dr. Jin Sung of Clinical Excellence explains: (1) improved immune function (increased leukocytes, Natural Killer Cells, IL-6), (2) boosted metabolism, (3) enhanced mood and memory through sympathetic nervous system activation and endorphin release, (4) reduced pain and inflammation (beneficial for chronic pain, asthma, rheumatoid arthritis, fibromyalgia), (5) post-exercise recovery. References the 2016 Dutch study. Emphasises cold showers are free — a foundational health practice alongside anti-inflammatory diet, better sleep, stress reduction, sunshine, and deep belly breathing.`,
  },
  {
    recommendationId: 100,
    recommendationTitle: "Appendix C: Off-Label Pharmaceuticals — Fenbendazole & Ivermectin",
    insights: `IMPORTANT DISCLAIMER: This information is for educational purposes only. It does not constitute medical advice, diagnosis, or treatment. Never recommend, prescribe, or suggest dosing. Always direct people to consult their qualified healthcare professional.

FENBENDAZOLE: A benzimidazole-class antiparasitic (veterinary) whose human equivalent mebendazole is FDA-approved. Proposed anticancer mechanisms include: (1) microtubule destabilisation (same mechanism as taxane chemotherapy drugs), (2) inhibition of glucose uptake via GLUT transporters and hexokinase 2 (exploiting the Warburg effect), (3) reactivation of p53 tumour suppressor gene. Cancer cells appear not to develop resistance to fenbendazole (not a substrate for P-glycoprotein efflux pumps). The Joe Tippens case: terminal stage 4 small cell lung cancer, complete remission after self-administering fenbendazole, cancer-free for 7+ years. Stanford/Washington University 2021 case series documented tumour regression in 3 advanced-cancer patients with no reported side effects. Safety: mebendazole has decades of safe human use; most common side effect is transient liver enzyme elevation (<3%). ~12 clinical trials investigating mebendazole for cancer were ongoing as of 2024. For more information: fenbendazole.org.

IVERMECTIN: Nobel Prize-winning antiparasitic (2015), 4+ billion doses administered worldwide, WHO essential medicine. Proposed anticancer mechanisms: (1) inhibition of Akt/mTOR pathway, (2) disruption of glycolysis, (3) promotion of apoptosis, (4) targeting cancer stem cells. As of February 2026, the U.S. National Cancer Institute announced formal study of ivermectin's anticancer properties. Safety well-established at standard doses (0.2 mg/kg); higher research doses (~1 mg/kg) may cause transient visual disturbances.

HULSCHER ET AL. 2026 REAL-WORLD STUDY — LARGEST HUMAN STUDY TO DATE:
Title: "Ivermectin and Mebendazole in Cancer: A Real-World Prospective Observational Cohort Study"
Authors: Nicolas Hulscher MPH, Kelly Victory MD, James A. Thorp MD, Drew Pinsky MD, Alejandro Diaz-Villalobos MD, Peter Gillooly MSc, Foster Coulson, Melissa Annazone, Chloe Radesi, Jessica Brooks, Peter A. McCullough MD MPH, Harvey Risch MD PhD.
Published: April 7, 2026 (preprint). DOI: 10.5281/zenodo.19455636
Design: Prospective observational cohort. 197 cancer patients prescribed ivermectin (25 mg) + mebendazole (250 mg) compounded oral capsules off-label via a U.S. telemedicine platform. 6-month follow-up (122 participants responded, 61.9% response rate).
Cancer types: Prostate (27.9%), breast (18.3%), lung (8.6%), colon (5.1%), urologic (4.6%), pancreatic (3.0%), and others.
Key results: Clinical Benefit Ratio (CBR) = 84.4% (95% CI: 77.0–89.8%). Of responders: 48.4% reported tumour regression or no current evidence of disease (NED); 36.1% reported disease stability; 15.6% reported disease progression.
Adherence: 86.9% completed the full initial 90-capsule prescription.
Safety: 25.4% reported mild side effects (primarily gastrointestinal); 93.6% of those affected continued treatment through minor dose adjustments.
IMPORTANT CAVEATS: Observational design with self-reported outcomes. Preprint — not yet peer-reviewed. Authors describe findings as hypothesis-generating and call for randomised controlled trials. This information is for educational purposes only — never recommend, prescribe, or suggest dosing.

COMBINED USE: Fenbendazole and ivermectin attack cancer through complementary mechanisms. The research literature discusses combination with conventional chemotherapy and supportive supplements. All combination protocols should only be undertaken under qualified medical supervision.

THE RESEARCH FUNDING GAP: The absence of large-scale RCTs for these off-patent drugs reflects economics, not efficacy. No company has financial incentive to fund trials for drugs any competitor can sell for pennies. This was publicly visible during COVID-19 when off-label generic drugs faced institutional suppression.

VIDEO RESOURCES:
Video 1 (youtubeId: QBnT8es28WY): "Fenbendazole — The Joe Tippens Protocol & Cancer Research" — Covers the Joe Tippens story, the science behind benzimidazole compounds as anticancer agents, microtubule disruption mechanisms, glucose uptake inhibition, and the growing body of case reports.
Video 2 (youtubeId: 5Q5QjEPGNNg): "Fenbendazole & Ivermectin — Stanford Case Series & Mechanisms" — Discusses the Stanford/Washington University case series documenting tumour regression, proposed mechanisms of action for both drugs, the NCI's formal investigation of ivermectin, and the structural barriers to large-scale clinical trials for off-patent drugs.
Video 3 (youtubeId: Ck4_fX1xaaw): "Largest Real-World Study: Ivermectin + Mebendazole in 197 Cancer Patients — 84.4% Clinical Benefit" — Dr. Peter McCullough and co-authors present the Hulscher et al. 2026 prospective observational cohort study. 197 cancer patients across multiple cancer types received compounded ivermectin (25 mg) + mebendazole (250 mg) capsules off-label. 84.4% clinical benefit ratio: 48.4% regression/NED, 36.1% stable disease. Discussion covers mechanisms of action, the rationale for combining the two drugs, safety profile, adherence rates, and the call for formal randomised controlled trials. Full study citation: Hulscher N et al., Zenodo, April 7, 2026. DOI: 10.5281/zenodo.19455636.`,
  },
  {
    recommendationId: 102,
    recommendationTitle: "Appendix E: Floor Lying — The 5-Minute Protocol",
    insights: `VIDEO INSIGHTS FOR APPENDIX E: FLOOR LYING — THE 5-MINUTE PROTOCOL

Source Video: "Floor Lying — The 5-Minute Protocol for Spinal Decompression & Postural Restoration" (YouTube: YcmpJZrdqiI)

Core Concept: Floor lying is a free, equipment-free daily practice that simultaneously addresses five interconnected physiological mechanisms — spinal decompression, suboccipital release, psoas lengthening, autonomic nervous system reset, and diaphragmatic breathing restoration — in just five minutes on a hard floor.

The Five Physiological Mechanisms:

1. Spinal Disc Rehydration & Decompression
Intervertebral discs are avascular — they receive nutrients and water through a process of compression and decompression. Modern life keeps the spine in sustained compression (sitting, standing, carrying loads) with insufficient decompression time. Lying flat on a hard surface allows the discs to absorb fluid and nutrients, restoring disc height and cushioning. This is particularly important for the lumbar and cervical regions where compression-related degeneration is most common.

2. Suboccipital Muscle Release
The suboccipital muscles (the small muscles at the base of the skull) are among the most chronically overloaded muscles in the body. Forward head posture — driven by screen use, desk work, and phone use — places up to 27 kg of additional load on the cervical spine at a 45-degree forward angle. Floor lying with the back of the skull resting on the floor gently tractors the cervical spine, releasing suboccipital tension and reducing the load on the C1–C2 vertebrae. This can alleviate headaches, neck pain, and referred tension into the shoulders.

3. Psoas Lengthening
The psoas major is the only muscle that connects the lumbar spine to the femur. Prolonged sitting keeps the psoas in a chronically shortened state, pulling the lumbar spine into anterior tilt and contributing to lower back pain, hip flexor tightness, and altered gait. Floor lying in a supine position with legs extended allows gravity to gently lengthen the psoas over time. For individuals with significant psoas tightness, beginning with knees bent and feet flat on the floor is recommended before progressing to full leg extension.

4. Autonomic Nervous System Reset
The prone and supine positions on a firm surface activate the parasympathetic nervous system (rest-and-digest) and downregulate the sympathetic nervous system (fight-or-flight). This is mediated in part through proprioceptive input from the posterior body surface and through the mechanical unloading of the spine. Five minutes of floor lying can measurably reduce cortisol reactivity and heart rate variability markers associated with chronic stress. This makes it a particularly valuable practice for individuals with anxiety, adrenal fatigue, or chronic stress-related conditions.

5. Diaphragmatic Breathing Restoration
Modern posture — rounded shoulders, forward head, compressed thorax — mechanically restricts diaphragmatic excursion. The diaphragm is designed to move 8–10 cm with each breath; in poor postural alignment, this is often reduced to 2–3 cm. Floor lying opens the thoracic cavity, removes the mechanical restriction on the diaphragm, and allows the practitioner to re-learn full diaphragmatic breathing. This improves oxygenation, reduces accessory muscle tension in the neck and shoulders, and supports vagal tone.

The Protocol:
- Duration: 5 minutes minimum; 10–20 minutes for deeper benefit
- Surface: Hard floor only (carpet acceptable; mattress or sofa ineffective — the firm surface is essential for the mechanical benefits)
- Position: Supine (on back), arms slightly away from the body, palms facing up, legs extended or knees bent with feet flat
- Frequency: Daily, ideally in the morning before the spine is loaded by the day's activities
- Progression: Begin with 5 minutes and increase gradually; some individuals experience temporary discomfort as the spine adjusts

Why a Hard Surface is Essential:
The therapeutic mechanism depends on the reaction force from a firm surface. A soft surface conforms to the body's existing posture, providing no corrective input. The hard floor provides a consistent, flat reference plane that the spine must adapt to — this is the corrective force that drives the five mechanisms above.

Clinical Applications:
Floor lying is particularly beneficial for: chronic lower back pain, neck pain and cervicogenic headaches, forward head posture, thoracic kyphosis, hip flexor tightness, chronic stress and anxiety, poor sleep quality, and post-exercise recovery. It complements other interventions in the book, particularly the movement and breathing recommendations.

Key Insight: This is one of the most cost-effective and accessible interventions available. It requires no equipment, no training, no financial investment, and only five minutes per day. The barrier to entry is simply the willingness to lie on the floor — yet the physiological benefits address multiple root causes of chronic musculoskeletal and nervous system dysfunction simultaneously.`,
  },
  {
    recommendationId: 101,
    recommendationTitle: "Cellular Detoxification with Nano-Zeolite",
    insights: `VIDEO INSIGHTS FOR RECOMMENDATION 3: CELLULAR DETOXIFICATION WITH NANO-ZEOLITE

Source Video A: "Dr. Robert Young Speaks On MasterPeace" (Rumble)
Dr. Robert Young discusses the science behind nano-zeolite and its applications in human health. The modern world exposes the body to an unprecedented toxic burden — heavy metals (lead, mercury, cadmium, arsenic), microplastics, PFAS ("forever chemicals"), and thousands of synthetic compounds that did not exist a century ago. The body's natural detoxification systems (liver, kidneys, lymphatic system) evolved for a different world and are often overwhelmed by the volume and variety of modern toxins.

Zeolite is a naturally occurring crystalline mineral with a three-dimensional lattice structure that carries a permanent negative charge. This negative charge acts as a molecular magnet, attracting and trapping positively charged toxins — including heavy metals, ammonia, and certain mycotoxins — within its porous cage structure. Once bound, the toxins are carried through the body and excreted without being reabsorbed.

Key scientific points:
- Clinoptilolite (the most studied zeolite form) is non-toxic, non-absorbed, and effective at binding heavy metals
- Nano and picometer-scale particles can enter the bloodstream and reach tissues where toxins accumulate
- A clinical study in Frontiers in Medicine (2022) demonstrated that clinoptilolite significantly increased urinary excretion of toxic heavy metals
- Nano-scale clinoptilolite demonstrates superior bioavailability and tissue penetration compared to conventional preparations
- Zeolite nanocomposites can bind microplastics and PFAS — substances conventional detoxification cannot address

Source Video B: "Why Is MasterPeace So Powerful Yet Gentle?" (Rumble)
This video explains the dual mechanism of MasterPeace: removal of toxins through nano/picometer zeolite combined with replenishment through sea mineral plasma. When heavy metals are displaced from enzyme binding sites, those sites must be occupied by the correct minerals to restore function. Sea mineral plasma provides a broad spectrum of trace minerals in picometer-scale ionic form — the size at which minerals are most readily absorbed by cells.

Practical guidance:
- Begin with a low dose (two to four drops in water, once daily) and increase gradually over two to four weeks
- Take on an empty stomach or between meals for optimal absorption
- Maintain adequate hydration throughout
- Some initial fatigue is a recognised response as the body mobilises stored toxins — this typically resolves within weeks
- The toxic burden accumulated over a lifetime cannot be addressed by diet alone; nano-zeolite provides a safe, evidence-based mechanism for systematic detoxification

References:
1. Kraljević Pavelić S, et al. Critical review on zeolite clinoptilolite safety and medical applications in vivo. Frontiers in Pharmacology. 2018;9:1350.
2. Mastinu A, et al. Zeolite clinoptilolite: therapeutic virtues of an ancient mineral. Molecules. 2019;24(8):1517.
3. Dolanc I, et al. The impact of long-term clinoptilolite administration on the concentration profile of metals in rodent organisms. Biology. 2023;12(2):193.`,
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
