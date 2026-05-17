import { useState, useEffect, useRef } from "react";
import SEO from "@/components/SEO";
import SiteNav from "@/components/SiteNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  Leaf,
  Play,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Mic,
  Video,
  BookOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

interface VideoItem {
  youtubeId?: string;
  rumbleUrl?: string;
  title: string;
  description?: string;
  recipe?: {
    title: string;
    prepNote?: string;
    ingredients: { section: string; items: string[] }[];
    instructions: { section: string; steps: string[] }[];
    tip?: string;
  };
}

interface RecommendationSection {
  id: string;
  number: number;
  title: string;
  description: string;
  videos: VideoItem[];
  color: string;
}

interface PodcastItem {
  title: string;
  host: string;
  description: string;
  url?: string;
  comingSoon?: boolean;
}

interface StandaloneVideo {
  youtubeId?: string;
  rumbleUrl?: string;
  title: string;
  description?: string;
  category?: string;
}

interface HealthFactorSubcategory {
  id: string;
  title: string;
  videos: VideoItem[];
}

interface HealthFactorSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  subcategories: HealthFactorSubcategory[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const RECOMMENDATIONS: RecommendationSection[] = [
  {
    id: "rec-1",
    number: 1,
    title: "Whole Food Plant-Based Diet",
    description:
      "The foundation of cellular health — how a whole food plant-based diet reduces inflammation, supports the microbiome, and reverses chronic disease.",
    color: "bg-green-100 text-green-800 border-green-200",
    videos: [
      {
        youtubeId: "wb7L3t0ejdI",
        title: "Whole Food Plant-Based Diet & Health",
        description:
          "An in-depth look at how plant-based nutrition supports long-term vitality.",
      },
      {
        youtubeId: "ztIZoaKTeqk",
        title: "Whole Food Plant-Based Living",
        description:
          "Practical insights into adopting a whole food plant-based lifestyle for lasting health and vitality.",
      },
    ],
  },
  {
    id: "rec-2",
    number: 2,
    title: "Water & Hydration",
    description:
      "Why the quality and quantity of water you drink matters more than most people realise — and how to optimise your hydration.",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    videos: [
      {
        youtubeId: "VRzjoIgHNb0",
        title: "Water & Hydration — Quality, Purity & Health",
        description:
          "Why the water you drink matters — contaminants, filtration methods, and how to optimise your hydration.",
      },
      {
        youtubeId: "KcYV0Wjx_2k",
        title: "Water & Hydration — The Science of Staying Hydrated",
        description:
          "A deeper look at water and hydration — why proper hydration is essential for cellular health and how to get it right.",
      },
    ],
  },
  {
    id: "rec-3",
    number: 3,
    title: "Cellular Detoxification with Nano-Zeolite",
    description:
      "Nano-zeolite provides a safe, evidence-based mechanism for reducing heavy metal load, binding microplastics, and supporting the body's natural detoxification pathways.",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    videos: [
      {
        rumbleUrl: "https://rumble.com/embed/v6zz56g/",
        title: "Dr. Robert Young Speaks On MasterPeace",
        description:
          "A compilation of Dr. Robert Young discussing MasterPeace nano-zeolite and its applications in human health.",
      },
      {
        rumbleUrl: "https://rumble.com/embed/v75is4o/",
        title: "Why Is MasterPeace So Powerful Yet Gentle?",
        description:
          "How MasterPeace nano/picometer zeolite works to attract and bind toxins while nourishing the body with sea mineral plasma.",
      },
    ],
  },
  {
    id: "rec-4",
    number: 4,
    title: "Redox Signalling & ASEA",
    description:
      "Redox signalling molecules are the body's most fundamental cellular messengers. ASEA REDOX is the only supplement in the world that contains stabilised, bioactive redox signalling molecules — identical to those produced naturally within your cells.",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    videos: [
      {
        youtubeId: "kgu__VlGOYA",
        title: "The Science Behind ASEA Redox Signaling Molecules",
        description:
          "An in-depth look at the science behind ASEA redox signalling molecules and how they support cellular health, gene expression, and vitality.",
      },
      {
        youtubeId: "3bBRuRmB_uI",
        title: "The Science Behind ASEA REDOX — Hunter Dean, VP Manufacturing",
        description:
          "ASEA's VP of manufacturing and operations explains the science behind the ASEA REDOX technology and how stabilised redox molecules are produced.",
      },
    ],
  },
  {
    id: "rec-5",
    number: 5,
    title: "Sleep & Melatonin",
    description:
      "Sleep is the body's most powerful repair mechanism. Learn how to optimise your sleep architecture and the role of melatonin.",
    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
    videos: [
      {
        youtubeId: "tcwVfUAqWiY",
        title: "Melatonin — Sleep, Repair & Longevity",
        description:
          "The science of melatonin: why it matters far beyond sleep and how to optimise your levels naturally.",
      },
    ],
  },
  {
    id: "rec-6",
    number: 6,
    title: "Glycine",
    description:
      "The underappreciated amino acid that supports collagen synthesis, sleep quality, and metabolic health.",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    videos: [
      {
        youtubeId: "o2Kc1Iaow40",
        title: "Glycine — The Underappreciated Amino Acid",
        description:
          "How glycine supports collagen synthesis, sleep quality, and metabolic health.",
      },
    ],
  },
  {
    id: "rec-7",
    number: 7,
    title: "Five Seeds of Life",
    description:
      "Five powerhouse seeds — flax, chia, hemp, pumpkin, and sesame — and why they should be part of your daily nutrition.",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    videos: [
      {
        youtubeId: "YckoR3hLL9E",
        title: "The Five Seeds of Life",
        description:
          "Why flax, chia, hemp, pumpkin, and sesame seeds are among the most nutrient-dense foods you can eat daily.",
      },
    ],
  },
  {
    id: "rec-8",
    number: 8,
    title: "Gut Health & Microbiome",
    description:
      "The gut microbiome is the foundation of immunity, mood, and longevity. Supporting it with spermidine, probiotics, and prebiotic-rich foods activates autophagy and restores the microbial ecosystem depleted by modern life.",
    color: "bg-lime-100 text-lime-800 border-lime-200",
    videos: [
      {
        youtubeId: "xqtxzcI0maE",
        title: "How to Cultivate a Healthy Gut Microbiome with Food",
        description:
          "Dr. Michael Greger explains how to cultivate a healthy gut microbiome through food choices — the foundation of long-term health and vitality.",
      },
      {
        youtubeId: "A-0hBPTUvms",
        title: "The 4 Gut Bacteria That Keep You Young — Dr. William Li",
        description:
          "Dr. William Li reveals the four key gut bacteria associated with longevity and how to support them through diet and lifestyle.",
      },
    ],
  },
  {
    id: "rec-9",
    number: 9,
    title: "Vitamin B12 & Vitamin D",
    description:
      "Two critical nutrients that are widely deficient — why they matter and how to supplement intelligently.",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    videos: [
      {
        youtubeId: "wY4vEBilWN4",
        title: "Vitamin B12 — Why It Matters & How to Supplement",
        description:
          "The critical role of B12 in nerve function, energy, and DNA synthesis — and how to ensure you’re getting enough.",
      },
      {
        youtubeId: "iotnggfP9Yk",
        title: "Vitamin D — The Sunshine Vitamin & Your Health",
        description:
          "Why Vitamin D deficiency is epidemic, its role in immunity and bone health, and how to supplement correctly.",
      },
      {
        youtubeId: "uxWARJ4s95Y",
        title: "Vitamin D3 — Part 2",
        description:
          "Further insights into Vitamin D3 — its broader roles in health, optimal levels, and practical supplementation guidance.",
      },
    ],
  },
  {
    id: "rec-10",
    number: 10,
    title: "Six Movements",
    description:
      "The six fundamental movement patterns every body needs — and how to build them into your daily life regardless of fitness level.",
    color: "bg-red-100 text-red-800 border-red-200",
    videos: [
      {
        youtubeId: "qu3ixTQmpl0",
        title: "The Six Movements — Japanese Exercise for Longevity",
        description:
          "The six fundamental movement patterns every body needs — and how to build them into your daily life regardless of fitness level.",
      },
    ],
  },
  {
    id: "rec-11",
    number: 11,
    title: "Breathing",
    description:
      "Breathing is the only autonomic function we can consciously control. Learn how nasal breathing and breath work transform health.",
    color: "bg-teal-100 text-teal-800 border-teal-200",
    videos: [
      {
        youtubeId: "8vN08IuParo",
        title: "Bhramari Pranayama — Bee Breath for Nitric Oxide & Calm",
        description:
          "Step-by-step guide to Bhramari (Bee Breath) — how humming breathing boosts nitric oxide, calms the nervous system, and supports healing.",
      },
      {
        youtubeId: "QVoGbaq8xos",
        title: "Breathing — The Power of Conscious Breath",
        description:
          "How conscious breathing techniques transform health — from nasal breathing to advanced breath work practices.",
      },
    ],
  },
  {
    id: "rec-12",
    number: 12,
    title: "PEMF & Earthing",
    description:
      "Pulsed Electromagnetic Field therapy and grounding — how reconnecting with the Earth's electromagnetic field supports redox signalling and recovery.",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    videos: [
      {
        youtubeId: "byinppKR9LY",
        title: "PEMF Therapy — Pulsed Electromagnetic Field & Redox Signalling",
        description:
          "How PEMF therapy works at the cellular level to support redox signalling, recovery, and overall vitality.",
      },
      {
        youtubeId: "LKOli-nNALM",
        title: "PEMF & Earthing — Reconnecting with the Earth's Field",
        description:
          "Exploring the science of PEMF therapy and earthing — how reconnecting with the Earth's electromagnetic field supports healing and recovery.",
      },
    ],
  },
  {
    id: "rec-13",
    number: 13,
    title: "Meditation",
    description:
      "The neuroscience of meditation — how regular practice reshapes the brain, reduces cortisol, and builds emotional resilience.",
    color: "bg-violet-100 text-violet-800 border-violet-200",
    videos: [
      {
        youtubeId: "wXsxwIJnUJk",
        title: "Meditation — Neuroscience, Cortisol & Emotional Resilience",
        description:
          "How regular meditation reshapes the brain, reduces cortisol, and builds lasting emotional resilience.",
      },
    ],
  },
  {
    id: "rec-14",
    number: 14,
    title: "Time in Nature",
    description:
      "Why spending time in natural environments is a measurable health intervention — from forest bathing to sunlight exposure.",
    color: "bg-lime-100 text-lime-800 border-lime-200",
    videos: [
      {
        youtubeId: "UHv3SCUioQU",
        title: "Time in Nature — Forest Bathing, Sunlight & Healing",
        description:
          "The science behind why spending time in natural environments is one of the most powerful health interventions available.",
      },
    ],
  },
  {
    id: "rec-15",
    number: 15,
    title: "Repairing Relationships",
    description:
      "Social connection is a primary determinant of longevity. Practical strategies for deepening relationships and reducing isolation.",
    color: "bg-pink-100 text-pink-800 border-pink-200",
    videos: [
      {
        youtubeId: "rgQvqi6aYD8",
        title: "Repairing Relationships — Social Connection & Longevity",
        description:
          "Why social connection is a primary determinant of longevity and practical strategies for deepening relationships.",
      },
    ],
  },
  {
    id: "rec-16",
    number: 16,
    title: "Second Income Stream",
    description:
      "Financial stress is a major driver of chronic disease. Building a second income stream reduces allostatic load and creates security.",
    color: "bg-amber-100 text-amber-800 border-amber-200",
    videos: [
      {
        youtubeId: "eD0N8wXjNSs",
        title: "Second Income Stream — Financial Stress & Health",
        description:
          "How financial stress drives chronic disease and why building a second income stream is a genuine health intervention.",
      },
    ],
  },
  {
    id: "rec-17",
    number: 17,
    title: "Your Environment",
    description:
      "How your home and work environment shapes your health — from air quality and toxin reduction to light and sound.",
    color: "bg-cyan-100 text-cyan-800 border-cyan-200",
    videos: [
      {
        youtubeId: "foBnfBX4YKQ",
        title: "Your Environment — Air Quality, Toxins & Healing Spaces",
        description:
          "How your home and work environment shapes your health — from air quality and toxin reduction to light and sound.",
      },
    ],
  },
  {
    id: "rec-18",
    number: 18,
    title: "Methylene Blue & Photobiomodulation",
    description:
      "Emerging therapies at the frontier of mitochondrial medicine — the science behind methylene blue and red/near-infrared light therapy.",
    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
    videos: [
      {
        youtubeId: "KvASX2yp0zU",
        title: "Methylene Blue — Mitochondrial Medicine & Photobiomodulation",
        description:
          "The science behind methylene blue and red/near-infrared light therapy at the frontier of mitochondrial medicine.",
      },
    ],
  },
  {
    id: "rec-appendix-diet",
    number: 0,
    title: "Navigating the Diet Landscape",
    description:
      "What does the evidence actually say about how humans are designed to eat? A rigorous comparison of the major dietary approaches — ketogenic, Mediterranean, and whole food plant-based — and what the science shows about each.",
    color: "bg-lime-100 text-lime-800 border-lime-200",
    videos: [
      {
        youtubeId: "Weg9GUnH24E",
        title: "What Humans Are Designed to Eat",
        description:
          "An evidence-based look at human dietary evolution and what the research says about our optimal diet.",
      },
      {
        youtubeId: "nEjuZsP8o7g",
        title: "The Ketogenic Diet — Is It Healthy?",
        description:
          "A balanced scientific review of the ketogenic diet — what the evidence supports and what it does not.",
      },
      {
        youtubeId: "MJVSD0hggZE",
        title: "The Ketogenic Diet is a Scam",
        description:
          "A critical examination of the claims made for the ketogenic diet against the peer-reviewed evidence.",
      },
      {
        youtubeId: "uVGpTLMN6w4",
        title: "Mediterranean Diet vs Whole Food Plant-Based",
        description:
          "A direct comparison of the two most evidence-backed dietary patterns for cardiovascular health and longevity.",
      },
      {
        youtubeId: "dpyz-AumCUk",
        title: "Is a Plant-Based Diet Always Healthy?",
        description:
          "The critical difference between vegan and whole food plant-based diets — why the distinction matters for health outcomes.",
      },
    ],
  },
  {
    id: "appendix-cold-showers",
    number: 0,
    title: "Cold Showers",
    description:
      "The science behind ending your shower with 30–60 seconds of cold water. The landmark Dutch RCT (3,018 participants) showed a 29% reduction in sickness absence — and 91% of participants chose to continue after the trial.",
    color: "bg-cyan-100 text-cyan-800 border-cyan-200",
    videos: [
      {
        youtubeId: "xTVMGyJ8cZU",
        title: "Cold Showers — Hormesis, Inflammation & Cognitive Benefits",
        description:
          "The science of hormesis, norepinephrine release, immune function, and mood benefits from cold water exposure. Covers the Dutch RCT and practical protocol.",
      },
      {
        youtubeId: "may_PlDfNRE",
        title: "The Science Behind Cold Showers — 5 Evidence-Based Benefits",
        description:
          "Dr. Jin Sung presents five evidence-based benefits of cold showers including inflammation reduction, metabolic health, and cognitive performance.",
      },
    ],
  },
  {
    id: "appendix-off-label",
    number: 0,
    title: "Off-Label Pharmaceuticals",
    description:
      "Fenbendazole and ivermectin — two antiparasitic drugs being studied for anticancer activity. The Joe Tippens story, the Stanford case series, and the landmark 2026 Hulscher et al. study showing 84.4% clinical benefit ratio in 197 cancer patients.",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    videos: [
      {
        youtubeId: "QBnT8es28WY",
        title: "Fenbendazole — The Joe Tippens Protocol & Cancer Research",
        description:
          "The story of Joe Tippens, whose terminal stage 4 lung cancer went into complete remission after self-administering fenbendazole. Covers the proposed anticancer mechanisms and the Stanford case series.",
      },
      {
        youtubeId: "5Q5QjEPGNNg",
        title: "Fenbendazole & Ivermectin — Stanford Case Series & Mechanisms",
        description:
          "The Stanford case series and proposed mechanisms of fenbendazole and ivermectin against cancer cells — microtubule disruption, glucose uptake inhibition, and p53 reactivation.",
      },
      {
        youtubeId: "Ck4_fX1xaaw",
        title: "Largest Real-World Study: Ivermectin + Mebendazole in 197 Cancer Patients — 84.4% Clinical Benefit",
        description:
          "The Hulscher et al. 2026 study of 197 cancer patients treated with ivermectin and mebendazole: 35.2% tumour regression, 26.2% stable disease, 23.0% improved quality of life — 84.4% overall clinical benefit ratio.",
      },
    ],
  },
  {
    id: "appendix-brazil-nuts",
    number: 0,
    title: "Brazil Nuts & Selenium",
    description:
      "One of the most remarkable nutritional findings in recent research — four Brazil nuts once a month and their extraordinary effects on cholesterol, inflammation, and selenium status.",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    videos: [
      {
        youtubeId: "yMy_R6tlAGA",
        title: "Four Brazil Nuts Once a Month — The Cholesterol Study",
        description:
          "Dr. Michael Greger presents the 2013 clinical study showing a single serving of four Brazil nuts reduced LDL cholesterol by nearly 20 points within nine hours — with the effect persisting for 30 days. Covers selenium, thyroid health, immune function, and safe dosing.",
      },
    ],
  },
  {
    id: "appendix-floor-lying",
    number: 0,
    title: "Floor Lying — The 5-Minute Protocol",
    description:
      "A free, equipment-free daily practice that simultaneously decompresses the spine, lengthens the psoas, releases suboccipital tension, resets the autonomic nervous system, and restores diaphragmatic breathing — in just five minutes on a hard floor.",
    color: "bg-sky-100 text-sky-800 border-sky-200",
    videos: [
      {
        youtubeId: "YcmpJZrdqiI",
        title: "Floor Lying — The 5-Minute Protocol for Spinal Decompression & Postural Restoration",
        description:
          "Covers the five physiological mechanisms of floor lying: spinal disc rehydration, suboccipital muscle release, psoas lengthening, autonomic nervous system reset, and diaphragmatic breathing restoration. Includes the step-by-step protocol and the science of why a hard surface is essential.",
      },
    ],
  },
  {
    id: "appendix-gut-brain",
    number: 0,
    title: "The Fiber That Calms You",
    description:
      "The gut manufactures more neurotransmitters than the brain itself. This appendix explores the gut-brain axis — how specific gut bacteria synthesise GABA, how prebiotic fibre and butyrate maintain the intestinal barrier, and why extra virgin olive oil is not recommended despite its polyphenol content due to its endothelial-impairing effects.",
    color: "bg-green-100 text-green-800 border-green-200",
    videos: [
      {
        youtubeId: "Hywi0rDLtJA",
        title: "The Fiber That Calms You — Feeding Your Gut to Heal Your Mind",
        description:
          "Covers the gut-brain axis, GABA production by Lactobacillus and Bifidobacterium, the vagus nerve as a communication highway, the critical difference between prebiotics and probiotics, butyrate and intestinal barrier integrity, leaky gut and neuroinflammation, polyphenols, and the practical dietary protocol for rebuilding your gut microbiome.",
      },
    ],
  },
  {
    id: "appendix-blackstrap-molasses",
    number: 0,
    title: "Blackstrap Molasses — Nature's Mineral Chest",
    description:
      "Blackstrap molasses is the mineral-dense syrup left after sugar is refined from sugarcane. This appendix covers its remarkable nutrient profile (iron, magnesium, potassium, calcium, manganese), its use for iron deficiency and energy, and its specific role in stabilising blood sugar overnight to prevent the cortisol-driven awakenings that disrupt deep sleep.",
    color: "bg-amber-100 text-amber-800 border-amber-200",
    videos: [
      {
        youtubeId: "IqRo8gGbFuo",
        title: "Blackstrap Molasses — Dr. Eric Berg",
        description:
          "Dr. Eric Berg covers the nutritional profile of blackstrap molasses, its role in replenishing iron and other essential minerals, and why it is one of the most overlooked whole-food supplements available.",
      },
      {
        youtubeId: "dtSeM5mb41o",
        title: "Blackstrap Molasses for Sleep and Blood Sugar",
        description:
           "Covers the link between nocturnal hypoglycaemia and 2–3 AM awakenings, how molasses provides slow-burning fuel to prevent cortisol-driven sleep disruption, and the practical sleep protocol including the warm mineral milk and ginger molasses tea recipes.",
      },
    ],
  },
  {
    id: "appendix-coherence-breathing",
    number: 0,
    title: "Coherence Breathing — The 10-Second Cycle That Rewires Your Nervous System",
    description:
      "Coherence Breathing (5-second inhale / 5-second exhale at 6 breaths per minute) is one of the most evidence-backed practices for increasing HRV, strengthening vagal tone, lowering blood pressure, protecting telomeres, and improving deep sleep. This appendix explains the baroreflex resonance mechanism and the precise protocol for daily practice.",
    color: "bg-sky-100 text-sky-800 border-sky-200",
    videos: [
      {
        youtubeId: "vCf2GWI4dfw",
        title: "Coherence Breathing — The 10-Second Cycle That Rewires Your Nervous System",
        description:
          "Covers the science of baroreflex resonance, vagal tone, HRV as a longevity biomarker, telomere protection via cortisol reduction, glymphatic brain detoxification during deep sleep, and the precise 5-second inhale / 5-second exhale protocol with morning and evening timing guidance.",
      },
    ],
  },
  {
    id: "appendix-lavender-oil",
    number: 0,
    title: "Lavender Oil — Nature's Answer to Anxiety",
    description:
      "Oral Silexan (pharmaceutical-grade lavender oil, 80 mg/day) has been shown in randomised controlled trials to be as effective as lorazepam (a benzodiazepine) for Generalised Anxiety Disorder — without dependence, tolerance, or withdrawal. This appendix covers the amygdala anxiety mechanism, how linalool and linalyl acetate modulate GABA-A receptors and reduce amygdala hyperactivity, the landmark Woelk & Schläfke (2010) trial, and the practical 80 mg/day protocol.",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    videos: [
      {
        youtubeId: "q3kXbYMgBnE",
        title: "Lavender Oil — Nature's Answer to Anxiety",
        description:
          "Dr. Eric Berg explains how Silexan (oral lavender oil) compares to benzodiazepines for anxiety, the GABA mechanism, the clinical trial evidence, and why the pharmaceutical-grade extract is essential for therapeutic effect.",
      },
    ],
  },
];
const PODCASTS: PodcastItem[] = [
  {
    title: "Podcast episodes coming soon",
    host: "",
    description:
      "We are curating a selection of podcast episodes that explore the science behind the 18 Recommendations. Check back soon.",
    comingSoon: true,
  },
];

const STANDALONE_VIDEOS: StandaloneVideo[] = [];

const HEALTH_FACTOR_VIDEOS: HealthFactorSection[] = [
  {
    id: "hf-lifestyle",
    title: "Lifestyle Choices",
    description: "Diet, exercise, sleep, and hydration — the daily choices that shape your cellular health.",
    icon: "\u{1F331}",
    color: "bg-green-100 text-green-800 border-green-200",
    subcategories: [
      {
        id: "hf-lifestyle-wfpb",
        title: "Whole Food Plant-Based",
        videos: [
          {
            youtubeId: "FX58PyQwrcI",
            title: "Dr. Ellsworth Wareham — 98-Year-Old Vegan Heart Surgeon",
            description: "Dr. Wareham, a retired cardiothoracic surgeon who practiced until 95, shares how a low-fat vegan diet can arrest and reverse coronary artery disease. References Dr. T. Colin Campbell, Dr. Dean Ornish, and Dr. Caldwell Esselstyn.",
          },
          {
            youtubeId: "RGy3jhiPqD0",
            title: "Dr. John Scharffenberg — 100-Year-Old Doctor's 7 Risk Factors",
            description: "Dr. Scharffenberg, a 100-year-old preventive medicine doctor and lifelong vegetarian, explains the 7 risk factors for cardiovascular disease and why lifestyle changes can lower heart attack risk by 80%, stroke by 80%, and diabetes by 88%.",
          },
        ],
      },
      {
        id: "hf-lifestyle-recipes",
        title: "Recipes",
        videos: [
          {
            youtubeId: "VDMOFa8iRqo",
            title: "Dr. Greger's V12 Vegetable Blast \u2014 Daily Green Smoothie",
            description: "Dr. Michael Greger demonstrates his V12 Vegetable Blast recipe \u2014 a nutrient-dense daily smoothie packed with celery, carrot, bell pepper, scallion, beet, jalape\u00F1o, turmeric, kale, and parsley blended with tomato juice, black pepper, horseradish, and lemon. Includes a 5-day meal prep method for quick daily preparation.",
            recipe: {
              title: "V12 Vegetable Blast",
              prepNote: "Prep 5 bags on Sunday for the whole work week.",
              ingredients: [
                {
                  section: "Per bag (prep ahead)",
                  items: [
                    "1 stalk celery",
                    "1 carrot (unpeeled, scrape off bitter outer layer)",
                    "\u00BD red, orange, or yellow bell pepper",
                    "1 scallion (tips trimmed)",
                    "\u2155 of a small beet",
                    "\u2155 of a raw jalape\u00F1o (optional)",
                    "\u00BC inch fresh turmeric root",
                    "1 cup kale",
                    "1 cup curly parsley",
                  ],
                },
                {
                  section: "Added daily when blending",
                  items: [
                    "1 cup no-salt-added vegetable or tomato juice",
                    "1 cup ice cubes",
                    "\u215B tsp freshly ground black pepper",
                    "\u00BD tsp horseradish (prepared or freshly grated)",
                    "Juice of \u00BD lemon (zest optional)",
                  ],
                },
              ],
              instructions: [
                {
                  section: "Meal Prep (5 days)",
                  steps: [
                    "Wash all vegetables thoroughly.",
                    "Set out 5 reusable bags.",
                    "Into each bag, place: 1 stalk celery, 1 scraped carrot, \u00BD bell pepper, 1 scallion, \u2155 beet, \u2155 jalape\u00F1o, \u00BC inch turmeric.",
                    "Add 1 cup kale and 1 cup parsley to each bag.",
                    "Store all 5 bags in the refrigerator.",
                  ],
                },
                {
                  section: "Daily Blending",
                  steps: [
                    "Pour 1 cup vegetable/tomato juice into a high-speed blender.",
                    "Add 1 cup ice cubes, \u215B tsp black pepper, \u00BD tsp horseradish.",
                    "Squeeze in juice of \u00BD lemon (add zest if desired).",
                    "Empty one pre-prepared bag into the blender.",
                    "Blend on high until smooth.",
                  ],
                },
              ],
              tip: "Dr. Greger recommends drinking it while munching on walnuts, pumpkin seeds, or avocado to maximise absorption of fat-soluble nutrients.",
            },
          },
        ],
      },
      { id: "hf-lifestyle-water", title: "Water & Hydration", videos: [] },
      { id: "hf-lifestyle-sleep", title: "Sleep & Recovery", videos: [] },
      { id: "hf-lifestyle-exercise", title: "Exercise & Movement", videos: [] },
      {
        id: "hf-lifestyle-cold-showers",
        title: "Cold Showers",
        videos: [
          {
            youtubeId: "xTVMGyJ8cZU",
            title: "Cold Showers — Hormesis, Inflammation & Cognitive Benefits",
            description: "Explores the science of hormesis — how low-dose stress creates beneficial adaptations. Covers 7 key benefits including decreased pain, reduced inflammation, increased cognitive function, improved mood, and enhanced metabolism. Explains norepinephrine increases of 200–300%, antioxidant network boosts, and T-cell immune response.",
          },
          {
            youtubeId: "may_PlDfNRE",
            title: "Dr. Jin Sung — 5 Evidence-Based Benefits of Cold Showers",
            description: "Dr. Jin Sung explains the five main evidence-based benefits: improved immune function, boosted metabolism, enhanced mood and memory, reduced pain and inflammation, and post-exercise recovery. References the 2016 Dutch study of 3,018 adults showing a 29% reduction in sick days from just 30 seconds daily.",
          },
        ],
      },
    ],
  },
  {
    id: "hf-environmental",
    title: "Environmental Factors",
    description: "Toxins, air quality, water quality, and how your surroundings impact your health.",
    icon: "\u{1F30D}",
    color: "bg-cyan-100 text-cyan-800 border-cyan-200",
    subcategories: [
      { id: "hf-env-toxins", title: "Toxins & Chemicals", videos: [] },
      { id: "hf-env-air", title: "Air Quality", videos: [] },
      { id: "hf-env-healing-space", title: "Healing Spaces", videos: [] },
    ],
  },
  {
    id: "hf-genetic",
    title: "Genetic Predisposition",
    description: "Family history, epigenetics, and how lifestyle can switch genes on and off.",
    icon: "\u{1F9EC}",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    subcategories: [
      { id: "hf-gen-epigenetics", title: "Epigenetics & Gene Expression", videos: [] },
      { id: "hf-gen-family", title: "Family History & Prevention", videos: [] },
    ],
  },
  {
    id: "hf-structural",
    title: "Structural Barriers",
    description: "Healthcare access, income, education, and systemic factors that affect health outcomes.",
    icon: "\u{1F3DB}",
    color: "bg-amber-100 text-amber-800 border-amber-200",
    subcategories: [
      { id: "hf-struct-access", title: "Healthcare Access", videos: [] },
      { id: "hf-struct-financial", title: "Financial Wellbeing", videos: [] },
    ],
  },
  {
    id: "hf-stress",
    title: "Stress & Emotional Health",
    description: "Chronic stress, trauma, coping mechanisms, and emotional resilience.",
    icon: "\u{1F9D8}",
    color: "bg-rose-100 text-rose-800 border-rose-200",
    subcategories: [
      { id: "hf-stress-chronic", title: "Chronic Stress", videos: [] },
      { id: "hf-stress-meditation", title: "Meditation & Mindfulness", videos: [] },
      { id: "hf-stress-breathing", title: "Breathwork", videos: [] },
    ],
  },
  {
    id: "hf-purpose",
    title: "Purpose & Meaning",
    description: "Direction, goals, fulfilment, and the health impact of living with purpose.",
    icon: "\u{1F3AF}",
    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
    subcategories: [
      { id: "hf-purpose-direction", title: "Finding Purpose", videos: [] },
      { id: "hf-purpose-goals", title: "Goals & Fulfilment", videos: [] },
    ],
  },
  {
    id: "hf-relationships",
    title: "Relationships & Social Connection",
    description: "Support networks, community, belonging, and the #1 predictor of longevity.",
    icon: "\u{1F91D}",
    color: "bg-pink-100 text-pink-800 border-pink-200",
    subcategories: [
      { id: "hf-rel-social", title: "Social Connection", videos: [] },
      { id: "hf-rel-community", title: "Community & Belonging", videos: [] },
    ],
  },
  {
    id: "hf-physical",
    title: "Physical Trauma",
    description: "Injuries, dental health, implants, and physical conditions that affect overall wellbeing.",
    icon: "\u{1FA7A}",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    subcategories: [
      { id: "hf-phys-injuries", title: "Injuries & Recovery", videos: [] },
      { id: "hf-phys-dental", title: "Dental Health", videos: [] },
    ],
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function VideoEmbed({ video }: { video: VideoItem }) {
  return (
    <div className="space-y-3">
      <div
        className="relative w-full rounded-xl overflow-hidden shadow-md bg-black"
        style={{ paddingBottom: "56.25%" }}
      >
        <iframe
          className="absolute inset-0 w-full h-full"
          src={video.youtubeId ? `https://www.youtube.com/embed/${video.youtubeId}` : video.rumbleUrl || ""}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-foreground text-sm">{video.title}</p>
          {video.description && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {video.description}
            </p>
          )}
        </div>
        <a
          href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0"
        >
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="w-3 h-3" />
            YouTube
          </Button>
        </a>
      </div>
      {/* Recipe card (if present) */}
      {video.recipe && (
        <div className="mt-3 rounded-lg border border-green-200 bg-green-50/50 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-green-700" />
            <h5 className="font-semibold text-green-900 text-sm">{video.recipe.title}</h5>
          </div>
          {video.recipe.prepNote && (
            <p className="text-xs text-green-700 italic">{video.recipe.prepNote}</p>
          )}
          {video.recipe.ingredients.map((group) => (
            <div key={group.section}>
              <p className="text-xs font-semibold text-green-800 mb-1">{group.section}</p>
              <ul className="list-disc list-inside space-y-0.5">
                {group.items.map((item, i) => (
                  <li key={i} className="text-xs text-foreground/80">{item}</li>
                ))}
              </ul>
            </div>
          ))}
          {video.recipe.instructions.map((group) => (
            <div key={group.section}>
              <p className="text-xs font-semibold text-green-800 mb-1">{group.section}</p>
              <ol className="list-decimal list-inside space-y-0.5">
                {group.steps.map((step, i) => (
                  <li key={i} className="text-xs text-foreground/80">{step}</li>
                ))}
              </ol>
            </div>
          ))}
          {video.recipe.tip && (
            <p className="text-xs text-green-700 border-t border-green-200 pt-2 mt-2">
              <span className="font-semibold">Tip:</span> {video.recipe.tip}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function RecommendationCard({
  rec,
  forceExpanded,
  onPlayModal,
}: {
  rec: RecommendationSection;
  forceExpanded?: boolean;
  onPlayModal?: () => void;
}) {
  const [expanded, setExpanded] = useState(
    forceExpanded || rec.videos.length > 0
  );
  const hasVideos = rec.videos.length > 0;
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (forceExpanded && cardRef.current) {
      setTimeout(() => {
        cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 400);
    }
  }, [forceExpanded]);

  return (
    <motion.div
      ref={cardRef}
      id={rec.id}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <Card
        className={`border ${
          hasVideos ? "border-green-300 shadow-md" : "border-border/50"
        } overflow-hidden`}
      >
        <div
          className="w-full text-left cursor-pointer select-none"
          onClick={() => setExpanded(!expanded)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setExpanded(!expanded); }}
        >
          <CardContent className="p-5 flex items-center gap-4">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm ${rec.color}`}
            >
              {rec.number === 0
                ? (rec.title.match(/Appendix ([A-E])/)?.[1] ?? "")
                : rec.number}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-foreground">{rec.title}</h3>
                {hasVideos ? (
                  <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                    <Play className="w-2.5 h-2.5 mr-1" />
                    {rec.videos.length} video{rec.videos.length > 1 ? "s" : ""}
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-xs text-muted-foreground"
                  >
                    Coming Soon
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                {rec.description}
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              {hasVideos && onPlayModal && (
                <button
                  onClick={(e) => { e.stopPropagation(); onPlayModal(); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-medium transition-colors"
                >
                  <Play className="w-3 h-3" />
                  Watch
                </button>
              )}
              <span className="text-muted-foreground">
              {expanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
              </span>
            </div>
          </CardContent>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 border-t border-border/40 pt-4">
                {hasVideos ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {rec.videos.map((v) => (
                      <VideoEmbed key={v.youtubeId} video={v} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 py-4 text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <Play className="w-5 h-5 opacity-40 shrink-0" />
                      <p className="text-sm">
                        Videos for this recommendation are coming soon. Check
                        back regularly for new content.
                      </p>
                    </div>
                    <Link href={`/book/read#${rec.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 text-xs w-fit"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        Read {rec.number === 0 ? rec.title.match(/Appendix [A-E]/)?.[0] ?? "Appendix" : `Recommendation ${rec.number}`} in the Book
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

// ─── Tab types ────────────────────────────────────────────────────────────────

type Tab = "recommendations" | "podcasts" | "videos";

// ─── Video Modal ─────────────────────────────────────────────────────────────

function VideoModal({
  rec,
  onClose,
}: {
  rec: RecommendationSection;
  onClose: () => void;
}) {
  const [activeVideoIdx, setActiveVideoIdx] = useState(0);
  const activeVideo = rec.videos[activeVideoIdx];

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative w-full max-w-3xl bg-card rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/40 shrink-0">
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${rec.color}`}
              >
                {rec.number === 0
                  ? (rec.title.match(/Appendix ([A-E])/)?.[1] ?? "")
                  : rec.number}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{rec.number === 0 ? rec.title.match(/Appendix [A-E]/)?.[0] ?? "Appendix" : `Recommendation ${rec.number}`}</p>
                <h3 className="font-semibold text-foreground text-sm">{rec.title}</h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Video Tab Menu — shown when multiple videos exist */}
          {rec.videos.length > 1 && (
            <div className="flex gap-1 px-5 pt-3 pb-1 border-b border-border/30 overflow-x-auto shrink-0">
              {rec.videos.map((v, idx) => (
                <button
                  key={v.youtubeId}
                  onClick={() => setActiveVideoIdx(idx)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    activeVideoIdx === idx
                      ? "bg-green-100 text-green-800"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <Play className="w-3 h-3" />
                  {v.title.length > 40 ? v.title.substring(0, 40) + "…" : v.title}
                </button>
              ))}
            </div>
          )}

          {/* Active Video */}
          <div className="p-5 space-y-3 overflow-y-auto">
            <div
              className="relative w-full rounded-xl overflow-hidden shadow-md bg-black"
              style={{ paddingBottom: "56.25%" }}
            >
              <iframe
                key={activeVideo.youtubeId || activeVideo.rumbleUrl}
                className="absolute inset-0 w-full h-full"
                src={activeVideo.youtubeId ? `https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=1` : activeVideo.rumbleUrl || ""}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            <p className="font-medium text-foreground text-sm">{activeVideo.title}</p>
            {activeVideo.description && (
              <p className="text-xs text-muted-foreground">{activeVideo.description}</p>
            )}

            {/* Video counter */}
            {rec.videos.length > 1 && (
              <p className="text-xs text-muted-foreground pt-1">
                Video {activeVideoIdx + 1} of {rec.videos.length}
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Health Factor Card ──────────────────────────────────────────────────────────────────────

function HealthFactorCard({ factor, videoCount }: { factor: HealthFactorSection; videoCount: number }) {
  const [expanded, setExpanded] = useState(videoCount > 0);

  return (
    <motion.div
      id={factor.id}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <Card className={`border overflow-hidden ${videoCount > 0 ? 'border-green-300 shadow-md' : 'border-border/50'}`}>
        {/* Factor Header */}
        <div
          className="w-full text-left cursor-pointer select-none"
          onClick={() => setExpanded(!expanded)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setExpanded(!expanded); }}
        >
          <CardContent className="p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-xl ${factor.color}`}>
              {factor.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-foreground text-lg">{factor.title}</h3>
                {videoCount > 0 ? (
                  <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                    <Play className="w-2.5 h-2.5 mr-1" />
                    {videoCount} video{videoCount > 1 ? 's' : ''}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    Coming Soon
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{factor.description}</p>
            </div>
            <span className="shrink-0 text-muted-foreground">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </span>
          </CardContent>
        </div>

        {/* Expanded: Subcategories */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 border-t border-border/40 pt-4 space-y-5">
                {factor.subcategories.map((sub) => (
                  <div key={sub.id} id={sub.id}>
                    <div className="flex items-center gap-2 mb-3">
                      <Leaf className="w-4 h-4 text-green-600" />
                      <h4 className="font-medium text-foreground text-sm">{sub.title}</h4>
                      {sub.videos.length > 0 && (
                        <span className="text-xs text-muted-foreground">({sub.videos.length} video{sub.videos.length > 1 ? 's' : ''})</span>
                      )}
                    </div>
                    {sub.videos.length > 0 ? (
                      <div className="grid md:grid-cols-2 gap-6 ml-6">
                        {sub.videos.map((v) => (
                          <VideoEmbed key={v.youtubeId} video={v} />
                        ))}
                      </div>
                    ) : (
                      <div className="ml-6 flex items-center gap-2 text-muted-foreground text-xs py-2">
                        <Video className="w-3.5 h-3.5 opacity-40" />
                        <span>Videos coming soon</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────────────────

export default function Media() {
  const [activeTab, setActiveTab] = useState<Tab>("recommendations");
  const [modalRec, setModalRec] = useState<RecommendationSection | null>(null);
  const [openedViaHash, setOpenedViaHash] = useState(false);
  const [returnTo, setReturnTo] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    const params = new URLSearchParams(window.location.search);
    const from = params.get("from");
    if (hash && (hash.startsWith("rec-") || hash.startsWith("appendix-"))) {
      const matched = RECOMMENDATIONS.find((r) => r.id === hash);
      if (matched && matched.videos.length > 0) {
        setActiveTab("recommendations");
        setOpenedViaHash(true);
        // If opened from the book reader, remember to go back there on close
        // The scroll position is saved in sessionStorage by the book reader before navigating
        if (from === "reader") setReturnTo("/book/read");
        setTimeout(() => setModalRec(matched), 300);
      }
    }
  }, []);

  const handleCloseModal = () => {
    setModalRec(null);
    if (returnTo) {
      // Opened from the book reader via ?from=reader — navigate back to it
      window.location.href = returnTo;
    } else if (openedViaHash) {
      // Opened via hash link (e.g. direct URL) — go back in browser history
      window.history.back();
    } else {
      // Opened from the Watch button on this page — just clear hash and stay
      window.history.replaceState(null, "", window.location.pathname);
    }
  };

  const totalVideos = RECOMMENDATIONS.reduce(
    (sum, r) => sum + r.videos.length,
    0
  );

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    {
      id: "recommendations",
      label: "Recommendations",
      icon: <BookOpen className="w-4 h-4" />,
      count: 18,
    },
    {
      id: "podcasts",
      label: "Podcasts",
      icon: <Mic className="w-4 h-4" />,
    },
    {
      id: "videos",
      label: "Videos",
      icon: <Video className="w-4 h-4" />,
      count: HEALTH_FACTOR_VIDEOS.reduce((sum, hf) => sum + hf.subcategories.reduce((s, sc) => s + sc.videos.length, 0), 0) || undefined,
    },
  ];

  return (
    <>
    <SEO
      title="Media Library — Videos & Supplementary Guides"
      description="Watch evidence-based wellness videos and explore supplementary guides on nutrition, sleep, mental health, movement and more."
      canonicalPath="/media"
      keywords="wellness videos, health education, supplementary guides, nutrition, sleep, mental health"
    />
    <div className="min-h-screen bg-background">
      <SiteNav />
      {/* Hero */}
      <section className="py-16 bg-gradient-to-b from-green-50/60 to-white">
        <div className="container text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium mb-6">
              <Play className="w-4 h-4" />
              Media Library
            </span>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
              Learn, Watch &amp; Explore
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg mb-6">
              Videos, podcasts, and resources grouped by each of the 18
              Recommendations from the book. All free — no subscriptions.
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Play className="w-4 h-4 text-green-600" />
                <strong className="text-foreground">{totalVideos}</strong>{" "}
                video{totalVideos !== 1 ? "s" : ""} available
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-green-600" />
                <strong className="text-foreground">{RECOMMENDATIONS.length}</strong>{" "}
                section{RECOMMENDATIONS.length !== 1 ? "s" : ""}
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="container max-w-4xl">
          <div className="flex gap-1 py-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-green-100 text-green-800"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.count !== undefined && (
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                      activeTab === tab.id
                        ? "bg-green-200 text-green-800"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <section className="py-12">
        <div className="container max-w-4xl">
          <AnimatePresence mode="wait">
            {/* ── Recommendations Tab ── */}
            {activeTab === "recommendations" && (
              <motion.div
                key="recommendations"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-foreground">
                      The 18 Recommendations
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Videos linked directly from the book — one section per
                      recommendation.
                    </p>
                  </div>
                  <Link href="/book/read">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 text-xs"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      Read the Book
                    </Button>
                  </Link>
                </div>
                <div className="space-y-4">
                  {RECOMMENDATIONS.map((rec) => (
                    <RecommendationCard
                      key={rec.id}
                      rec={rec}
                      onPlayModal={rec.videos.length > 0 ? () => setModalRec(rec) : undefined}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Podcasts Tab ── */}
            {activeTab === "podcasts" && (
              <motion.div
                key="podcasts"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <div className="mb-8">
                  <h2 className="font-serif text-2xl font-bold text-foreground">
                    Podcasts
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Curated podcast episodes exploring the science behind the
                    recommendations.
                  </p>
                </div>
                <div className="space-y-4">
                  {PODCASTS.map((podcast, i) =>
                    podcast.comingSoon ? (
                      <Card key={i} className="border-dashed border-border/60">
                        <CardContent className="p-8 flex flex-col items-center text-center gap-4">
                          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                            <Mic className="w-6 h-6 text-muted-foreground opacity-50" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground mb-1">
                              Podcast Episodes Coming Soon
                            </h3>
                            <p className="text-sm text-muted-foreground max-w-md">
                              We are curating a selection of podcast episodes
                              that explore the science behind the 18
                              Recommendations. Check back soon.
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className="text-xs text-muted-foreground"
                          >
                            Coming Soon
                          </Badge>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card key={i}>
                        <CardContent className="p-5">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                              <Mic className="w-4 h-4 text-green-700" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-foreground">
                                {podcast.title}
                              </h3>
                              {podcast.host && (
                                <p className="text-xs text-muted-foreground mb-1">
                                  {podcast.host}
                                </p>
                              )}
                              <p className="text-sm text-muted-foreground">
                                {podcast.description}
                              </p>
                              {podcast.url && (
                                <a
                                  href={podcast.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-2 inline-flex"
                                >
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1 text-xs"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    Listen
                                  </Button>
                                </a>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  )}
                </div>
              </motion.div>
            )}

            {/* ── Videos Tab (8 Health Factors) ── */}
            {activeTab === "videos" && (
              <motion.div
                key="videos"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <div className="mb-8">
                  <h2 className="font-serif text-2xl font-bold text-foreground">
                    Videos by Health Factor
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Interviews, lectures, and documentaries organised by the 8 health factors that shape your wellbeing.
                  </p>
                </div>

                <div className="space-y-6">
                  {HEALTH_FACTOR_VIDEOS.map((factor) => {
                    const factorVideoCount = factor.subcategories.reduce((s, sc) => s + sc.videos.length, 0);
                    return (
                      <HealthFactorCard key={factor.id} factor={factor} videoCount={factorVideoCount} />
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-foreground text-white/70 mt-16">
        <div className="container text-center text-sm">
          <p>
            &copy; {new Date().getFullYear()} Add Life to Your Years. All
            rights reserved.
          </p>
        </div>
      </footer>

      {/* Video Modal */}
      {modalRec && (
        <VideoModal rec={modalRec} onClose={handleCloseModal} />
      )}
    </div>
    </>
  );
}
