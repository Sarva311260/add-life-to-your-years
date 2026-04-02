import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useParams } from "wouter";
import {
  Leaf, ArrowLeft, ArrowRight, Heart, Building2, Dna, Shield, Brain,
  Compass, Users, Activity, BookOpen, ExternalLink, AlertTriangle, CheckCircle2, Share2,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const FACTOR_BOOK_CHAPTER: Record<string, string> = {
  lifestyle: "/book/read#part-two",
  environmental: "/book/read#chapter-5",
  genetic: "/book/read#part-one",
  structural: "/book/read#chapter-10",
  stress: "/book/read#chapter-10",
  purpose: "/book/read#chapter-14",
  relationships: "/book/read#chapter-12",
  physical_trauma: "/book/read#part-two",
};

interface FactorData {
  id: string;
  name: string;
  color: string;
  bgGradient: string;
  icon: React.ReactNode;
  heroIcon: React.ReactNode;
  intro: string;
  challengeAreas: { title: string; description: string }[];
  compounding: string;
  earlySignals: string[];
  whyItMatters: string;
}

const FACTOR_DATA: Record<string, FactorData> = {
  lifestyle: {
    id: "lifestyle",
    name: "Lifestyle Choices",
    color: "bg-green-100 text-green-700",
    bgGradient: "from-green-50/50 to-white",
    icon: <Heart className="w-6 h-6" />,
    heroIcon: <Heart className="w-10 h-10" />,
    intro: "Lifestyle is the largest contributor to both our challenges and our solutions — and it is the area we can influence most. It spans what and when we eat and drink, how much we consume, where we live and what we wear, when we go to sleep and for how long, how often we move, exercise, and get sunlight, and the quality of what we feed our minds.",
    challengeAreas: [
      { title: "Nutrition and Timing", description: "Irregular meals, eating processed foods or animal products, excess sugar or alcohol, and under-hydration can drive energy crashes, mood swings, cravings, and digestive upset. Skipping meals or late-night eating can disrupt sleep quality and appetite signals the next day." },
      { title: "Sleep and Recovery", description: "Inconsistent bedtimes, insufficient sleep, or light and noise disruption erode focus, immune resilience, and emotional regulation. Catch-up sleep on weekends often fails to fully offset chronic sleep debt." },
      { title: "Movement and Inactivity", description: "Long sedentary stretches reduce metabolic health, joint comfort, and stress tolerance. Overtraining without recovery can lead to fatigue, irritability, and higher injury risk." },
      { title: "Light, Nature, and Environment", description: "Minimal daylight exposure and excess evening screen light can disturb circadian rhythms. Uncomfortable temperatures, poor air quality, or cluttered spaces add low-grade stress." },
      { title: "Mental and Informational Diet", description: "Constant negative news, comparison, and doom-scrolling amplify anxiety and distractibility. Lack of restorative downtime blunts creativity and resilience." },
      { title: "Substances and Stimulants", description: "Heavy caffeine to push through fatigue and alcohol to switch off can create a cycle of lighter sleep and next-day crashes." },
    ],
    compounding: "One strain often triggers others — poor sleep leads to stronger cravings, which leads to a skipped workout, which leads to lower mood. Seasonality, life stage, and access constraints also shape what is realistically possible. Challenges are not only about willpower; they are often about circumstances.",
    earlySignals: [
      "Low or fluctuating energy, brain fog, morning grogginess",
      "Mood volatility, irritability, anxiety, or low motivation",
      "Frequent minor illnesses or slow recovery from workouts",
      "Digestive discomfort, bloating, irregularity",
      "Cravings, late-night snacking, or reliance on caffeine or alcohol",
      "Disrupted sleep or feeling unrefreshed after a full night in bed",
    ],
    whyItMatters: "Lifestyle patterns set the baseline for how we think, feel, and perform each day. When the baseline is strained, even good strategies elsewhere struggle to take hold. Small, sustainable adjustments that fit real-life constraints — not perfection — can make a significant difference.",
  },
  environmental: {
    id: "environmental",
    name: "Environmental Factors",
    color: "bg-blue-100 text-blue-700",
    bgGradient: "from-blue-50/50 to-white",
    icon: <Building2 className="w-6 h-6" />,
    heroIcon: <Building2 className="w-10 h-10" />,
    intro: "Environmental factors shape our baseline daily experience — the air we breathe, the water we drink, the spaces we inhabit, and the neighbourhoods we move through. They include indoor and outdoor conditions, the built and natural environment, safety and infrastructure, and occupational settings. While some aspects are outside individual control, many small, strategic changes can reduce strain.",
    challengeAreas: [
      { title: "Air Quality", description: "Indoor pollutants from cooking, heating, cleaning products, new furniture, and poor ventilation can drive headaches, fatigue, and brain fog. Outdoor pollutants exacerbate asthma, respiratory symptoms, and cardiovascular stress." },
      { title: "Water Quality", description: "Contaminants such as lead, PFAS, nitrates, and microbial pathogens, along with aging pipes, compromise safety and taste, sometimes reducing overall hydration." },
      { title: "Noise and Light Exposure", description: "Traffic, aircraft, and workplace noise disrupt sleep and elevate stress hormones. Insufficient daylight blunts circadian rhythm and mood, while excess evening light delays melatonin and fragments sleep." },
      { title: "Temperature and Humidity", description: "Overly hot or cold rooms impair sleep and cognition. High humidity fosters mould and dust mites; very low humidity causes dry eyes and skin and increases infection risk." },
      { title: "Chemicals and Consumer Products", description: "Frequent use of strong cleaners, air fresheners, pesticides, and fragranced products increases volatile organic compounds and irritants, especially in poorly ventilated spaces." },
      { title: "Built Environment and Access", description: "Limited sidewalks, bike lanes, or safe lighting reduce outdoor activity. Food deserts and heavy fast-food density constrain nutrition choices. Long or stressful commutes add time pressure and pollutant exposure." },
    ],
    compounding: "Multiple modest exposures add up — heat plus ozone plus noise plus poor sleep amplify strain even if any single factor seems minor. Lower-income and marginalised communities are disproportionately near highways or industrial sites, have older housing, and face limited access to safe parks or quality groceries.",
    earlySignals: [
      "Morning congestion, frequent sneezing, cough, or wheeze",
      "Headaches, burning or itchy eyes, throat irritation, or dizziness",
      "Musty smells, condensation on windows, or visible mould spots",
      "Poor or fragmented sleep due to noise, light, or temperature swings",
      "Daytime sleepiness or brain fog in enclosed rooms; feeling better outdoors",
      "Neck, back, or wrist pain tied to workstation setup",
    ],
    whyItMatters: "Your environment sets the background load on your body and mind — the stage on which every habit, choice, and effort plays out. When the stage is noisy, polluted, too bright, too hot, or unsafe, even strong lifestyle intentions struggle. Small, targeted environmental adjustments often yield outsized gains in sleep, energy, mood, focus, and respiratory health.",
  },
  genetic: {
    id: "genetic",
    name: "Genetic Make-up",
    color: "bg-orange-100 text-orange-700",
    bgGradient: "from-orange-50/50 to-white",
    icon: <Dna className="w-6 h-6" />,
    heroIcon: <Dna className="w-10 h-10" />,
    intro: "Your genetic make-up influences how your body is wired from the start — shaping tendencies in metabolism, immunity, hormones, brain chemistry, sleep, and response to foods, drugs, and environmental exposures. Unlike lifestyle, genes are not changeable, but their effects are highly modifiable.",
    challengeAreas: [
      { title: "Metabolism and Nutrient Handling", description: "Differences in appetite regulation, weight gain propensity, and insulin sensitivity can make body-weight management harder for some. Lipid transport variants can keep LDL cholesterol high despite good habits." },
      { title: "Detoxification and Stimulants", description: "Caffeine metabolism varies widely — slow metabolisers may get jitters, palpitations, or worse sleep at lower doses. Alcohol processing variants cause flushing and stronger adverse effects. Medication metabolism affects drug efficacy and side-effect risk." },
      { title: "Inflammation, Immunity, and Allergy", description: "Immune variants influence susceptibility to autoimmune conditions and severity of infections. Atopy runs in families — predisposition to eczema, allergic rhinitis, and asthma." },
      { title: "Hormones and Reproduction", description: "Genetic influences on androgen and estrogen signalling affect acne, hair loss, fibroids, endometriosis, or PCOS susceptibility. Variants can affect clotting tendency and pregnancy risks." },
      { title: "Neurobiology and Mental Health", description: "Temperament, stress reactivity, and risk for anxiety, depression, ADHD, bipolar disorder, and migraine are influenced by many small-effect variants. Pain sensitivity and habituation to stressors can be partly inherited." },
      { title: "Sleep and Circadian Rhythm", description: "Chronotype (night owl vs early bird), sleep need, and vulnerability to shift work have genetic components. Some are prone to delayed sleep phase or early waking regardless of discipline." },
    ],
    compounding: "Genes are not destiny. Most common conditions are polygenic — many small effects that interact with lifestyle and environment. Habits can dial risk up or down. Triggers like poor sleep, pollution, or ultra-processed diets can pull the trigger on genetic tendencies. Epigenetics shows that stress, nutrition, activity, sleep, and toxins can alter gene expression over time — often reversibly.",
    earlySignals: [
      "Strong family clustering of conditions, especially at younger ages",
      "Persistently high LDL cholesterol despite solid nutrition and activity",
      "Unusual reactions to standard medication doses or many side effects",
      "Jitters or insomnia with modest caffeine; flushing with small amounts of alcohol",
      "Clear lactose intolerance or marked reactions to gluten",
      "Distinct lifelong chronotype causing ongoing mismatch with schedules",
    ],
    whyItMatters: "Genetics sets your baseline sensitivities and how you respond to foods, stress, sleep loss, medications, and training. Knowing your tendencies helps you choose smarter defaults, personalise routines, and seek targeted support when needed — reducing self-blame and wasted effort.",
  },
  structural: {
    id: "structural",
    name: "Structural Conditions",
    color: "bg-green-100 text-green-700",
    bgGradient: "from-green-50/50 to-white",
    icon: <Shield className="w-6 h-6" />,
    heroIcon: <Shield className="w-10 h-10" />,
    intro: "Structural conditions are the systems, policies, institutions, and power dynamics that shape what is available, affordable, safe, legal, and culturally expected. They sit upstream of personal habits and environments — governing wages and benefits, housing, healthcare, transportation, education, and protections from harm. Many are outside individual control, but recognising them reduces self-blame and highlights realistic levers for change.",
    challengeAreas: [
      { title: "Economic Security and Labour", description: "Low or unstable wages, wage theft, lack of paid sick or family leave, unpredictable schedules, and benefit gaps create time poverty, stress, and skipped care. Gig work or misclassification limits access to insurance and retirement benefits." },
      { title: "Healthcare Access and Cost", description: "Insurance gaps, high deductibles, narrow networks, prior authorisations, and pharmacy shortages delay or block needed care. Language barriers, rural provider shortages, and bias in healthcare lead to misdiagnosis and undertreatment." },
      { title: "Housing Policy and Affordability", description: "High rents, eviction risk, overcrowding, and unstable leases disrupt sleep, nutrition, schooling, and medication routines. Redlining legacies and discriminatory lending reduce wealth and neighbourhood options." },
      { title: "Food System and Pricing", description: "Neighbourhoods saturated with fast food but limited fresh produce. Marketing of ultra-processed foods to children. Healthy options priced out of reach. Benefit timing and cliffs distort choices." },
      { title: "Transportation and Urban Design", description: "Long, unreliable, or unsafe commutes reduce sleep and activity time. Few sidewalks, bike lanes, poor lighting, and inaccessible transit limit safe movement and access to services." },
      { title: "Discrimination and Structural Bias", description: "Racism, sexism, ableism, ageism, homophobia, and transphobia produce pay gaps, violence risks, housing and hiring bias, and healthcare disparities. Historical trauma and medical mistrust reduce engagement with systems." },
    ],
    compounding: "When wages, housing, or transit are unstable, even strong personal habits struggle to stick. Multiple structural disadvantages stack — low wage plus caregiving plus unsafe housing — amplifying stress and limiting options. Administrative burdens, commuting, and juggling schedules drain bandwidth needed for planning, cooking, exercise, and sleep.",
    earlySignals: [
      "Knowing what to do but being blocked by cost, time, distance, safety, or rules",
      "Skipping medications or therapy due to copays, waitlists, or lack of leave",
      "Housing instability, overcrowding, eviction threats, or frequent moves",
      "Long or unreliable commutes; unsafe streets for walking or cycling",
      "Food insecurity or reliance on food banks despite working",
      "Repeated experiences of discrimination in healthcare, schools, or workplaces",
    ],
    whyItMatters: "Structural conditions define the feasible set of choices for individuals and families. Naming these forces shifts the frame from try harder to change the context, guiding realistic goal-setting and pointing to levers with the biggest payoff: rights and accommodations, benefits and community resources, employer policy changes, and collective advocacy.",
  },
  stress: {
    id: "stress",
    name: "Stress Levels",
    color: "bg-blue-100 text-blue-700",
    bgGradient: "from-blue-50/50 to-white",
    icon: <Brain className="w-6 h-6" />,
    heroIcon: <Brain className="w-10 h-10" />,
    intro: "Stress is the load on your mind and body from demands, uncertainty, and perceived threat. It includes acute spikes and chronic, low-grade pressure. Some stress can be motivating, but persistent, unbuffered stress strains sleep, metabolism, immunity, mood, and decision-making.",
    challengeAreas: [
      { title: "Workload, Pace, and Control", description: "High demands with low autonomy, unclear expectations, and constant interruptions increase errors, decision fatigue, and burnout. Always-on communication and blurred work-home boundaries prolong arousal." },
      { title: "Money, Housing, and Uncertainty", description: "Debt, unstable income, benefit cliffs, eviction risk, and big-ticket surprises keep the nervous system in threat-detection mode." },
      { title: "Caregiving and Relationships", description: "Parenting, elder care, illness in the family, and relationship conflict raise chronic vigilance. Lack of support or respite compounds strain. Compassion fatigue and vicarious trauma are common in helping roles." },
      { title: "Information Overload and Digital Pull", description: "News cycles, doomscrolling, group chats, and notifications drive micro-stressors and attention fragmentation. Late-evening screen use delays wind-down and sleep." },
      { title: "Perfectionism and Self-Criticism", description: "Rigid standards, fear of mistakes, imposter feelings, and moral injury amplify stress beyond the actual task." },
      { title: "Trauma and Chronic Threat", description: "Past trauma, discrimination, harassment, or unsafe settings heighten baseline vigilance. Seemingly small triggers can elicit strong reactions." },
    ],
    compounding: "Stress sensitivity varies by genetics, history, neurodiversity, hormones, and current health. Structural and environmental pressures amplify personal stress. Micro-stressors — small frictions, constant pings, clutter — cumulatively rival big life events. Tension spreads within households and teams; one person's regulation can help or hurt others.",
    earlySignals: [
      "Tight jaw or shoulders, headaches, chest tightness, or palpitations",
      "GI changes such as bloating, heartburn, or constipation",
      "Hard time falling asleep, 2-4 a.m. awakenings, or non-restorative sleep",
      "Racing thoughts, rumination, irritability, or indecision",
      "Increased caffeine, sugar, or alcohol; skipping meals or workouts",
      "Withdrawing from friends, avoiding messages, or doomscrolling",
    ],
    whyItMatters: "Chronic, unbuffered stress silently erodes sleep, judgement, metabolism, immunity, and relationships — undermining every other change you try to make. Reducing unnecessary load and improving recovery multiplies the impact of nutrition, movement, sleep, and medical care.",
  },
  purpose: {
    id: "purpose",
    name: "Purpose or Direction",
    color: "bg-orange-100 text-orange-700",
    bgGradient: "from-orange-50/50 to-white",
    icon: <Compass className="w-6 h-6" />,
    heroIcon: <Compass className="w-10 h-10" />,
    intro: "Purpose is the sense of meaning, direction, and contribution that organises your time and effort. It is not only a big life calling — it can be a mix of values, roles, curiosities, and people you care about. When purpose is unclear or missing, energy scatters, decisions stall, and short-term coping tends to replace long-term growth.",
    challengeAreas: [
      { title: "Motivation and Consistency", description: "Without a clear why, habits rely on willpower alone — leading to bursts of effort followed by long stalls. Goals feel arbitrary and minor setbacks quickly derail momentum." },
      { title: "Decision-Making and Planning", description: "Overthinking and analysis paralysis; too many options, no clear filter. Days fill with urgent-but-unimportant tasks and priorities reshuffle constantly." },
      { title: "Emotional Well-being", description: "Low-grade emptiness, cynicism, or boredom; a sense of drifting. Envy and fear of missing out increase as others' paths look more coherent than your own." },
      { title: "Health Behaviours", description: "Coping through food, alcohol, shopping, or scrolling. Difficulty sustaining routines that lack a felt purpose. Inconsistent adherence to treatment or training plans without a personally meaningful endpoint." },
      { title: "Relationships and Belonging", description: "Isolation or superficial ties. Weak boundaries lead to living by others' priorities. People-pleasing to fill the meaning gap, followed by resentment or withdrawal." },
      { title: "Life Transitions and Identity Shifts", description: "Graduation, immigration, parenthood, empty nest, retirement, layoffs, or illness can unsettle identity and direction. Loss and grief can erase previous anchors and make next steps unclear." },
    ],
    compounding: "Purpose is built, not found — it evolves through small bets, feedback, and reflection. Action often precedes clarity. Multiple sources of meaning can come from work, caregiving, learning, creativity, community, nature, or faith. Depression can flatten motivation; anxiety narrows options; ADHD complicates initiation and follow-through.",
    earlySignals: [
      "Frequent 'What's the point?' self-talk; feeling chronically unfulfilled despite being busy",
      "Starting many projects, finishing few; constant resets without accumulating progress",
      "Difficulty stating top 3 priorities for the next 6-12 months or why they matter",
      "Saying yes to everything or nothing; blurred boundaries and resentment",
      "Working hard but feeling directionless; no clear definition of success",
      "Inconsistent self-care and routines; plans collapse when motivation dips",
    ],
    whyItMatters: "Direction concentrates attention and energy, turning scattered effort into compounding progress. It makes trade-offs clearer, buffers stress, improves resilience, and adds satisfaction to everyday tasks. Without it, even strong habits feel fragile and results remain inconsistent.",
  },
  relationships: {
    id: "relationships",
    name: "Meaningful Relationships",
    color: "bg-green-100 text-green-700",
    bgGradient: "from-green-50/50 to-white",
    icon: <Users className="w-6 h-6" />,
    heroIcon: <Users className="w-10 h-10" />,
    intro: "Meaningful relationships are supportive, reciprocal connections that offer belonging, validation, and practical help. They include close ties such as partners, family, and best friends, and a web of strong and weak ties — neighbours, coworkers, community groups, faith circles, and mentors. When these are thin, distant, or conflict-ridden, stress rises and healthy routines are harder to sustain.",
    challengeAreas: [
      { title: "Mental and Emotional Health", description: "Loneliness heightens stress reactivity, rumination, and low mood. Anxiety about social situations can grow from lack of practice. Grief, conflict, or isolation without support prolongs recovery from setbacks." },
      { title: "Physical Health", description: "Sleep becomes lighter and more fragmented. Motivation for activity and nutrition wanes. Low-grade stress without social buffering can raise blood pressure and inflammation over time." },
      { title: "Daily Habits and Accountability", description: "Without social cues or shared routines — meals, walks, classes — healthy habits fade and screen time expands. No one to notice early warning signs or encourage care-seeking when symptoms appear." },
      { title: "Identity, Meaning, and Joy", description: "Milestones go unshared; accomplishments feel flat; purpose drifts without roles that matter to others. Less laughter, play, and awe — key sources of resilience — show up in daily life." },
      { title: "Digital Substitutes", description: "Heavy reliance on scrolling, influencers, or gaming for company can crowd out local, two-way bonds. Online spaces may help, but algorithmic feeds often amplify comparison and conflict." },
      { title: "Life Transitions and Mobility", description: "Moving, immigration, divorce, bereavement, new parenthood, job changes, and retirement can collapse existing networks. Shift work and irregular schedules make it hard to overlap with others' free time." },
    ],
    compounding: "A few dependable, reciprocal ties often buffer stress better than many superficial contacts. Chosen solitude can be restorative; loneliness is the gap between desired and actual connection. Isolation breeds avoidance; avoidance worsens skills and confidence; entering spaces then feels riskier. Toxic or one-sided ties can worsen health — pruning is as important as adding connections.",
    earlySignals: [
      "Realising there is no one you would comfortably call at 2 a.m. or list as an emergency contact",
      "Going weeks without a shared meal, in-person hangout, or voice call",
      "Feeling invisible in groups; leaving social events more drained than energised",
      "Mostly transactional interactions with little play, warmth, or vulnerability",
      "Increasing reliance on screens for company late at night",
      "Important dates pass unmarked — birthdays, holidays, milestones",
    ],
    whyItMatters: "Supportive relationships are the primary buffers against stress and the scaffolding for behaviour change. They improve resilience, health outcomes, and day-to-day satisfaction — and they make goals stick by adding accountability, joy, and shared identity. Without them, even well-designed plans falter under normal life stress.",
  },
  physical_trauma: {
    id: "physical_trauma",
    name: "Physical Conditions",
    color: "bg-blue-100 text-blue-700",
    bgGradient: "from-blue-50/50 to-white",
    icon: <Activity className="w-6 h-6" />,
    heroIcon: <Activity className="w-10 h-10" />,
    intro: "Physical trauma (injuries, surgeries, burns) and congenital or structural differences (present from birth or due to developmental variation) can change how you move, feel, breathe, sleep, and participate in daily life. Even when the initial event is past, secondary effects — pain, compensation patterns, deconditioning, and stigma — can compound over time.",
    challengeAreas: [
      { title: "Pain and Sensation", description: "Acute and chronic musculoskeletal pain, neuropathic pain, allodynia, and complex regional pain syndrome. Temperature and touch sensitivity changes after burns or nerve injury." },
      { title: "Mobility, Strength, and Coordination", description: "Reduced range of motion, weakness, spasticity, tremor, or instability. Altered gait and balance with higher fall risk. Need for assistive devices and adaptations." },
      { title: "Sleep and Breathing", description: "Position-related pain, new or worsened snoring or sleep apnoea after facial or airway injury, nasal obstruction. Nightmares or hyperarousal after traumatic events disrupt restorative sleep." },
      { title: "Neurologic and Cognition", description: "Concussion and TBI symptoms including headaches, dizziness, vestibular issues, light and noise sensitivity, slowed processing, and memory lapses." },
      { title: "Energy and Exertion Tolerance", description: "Post-exertional symptom exacerbation and fatigue. Boom-and-bust cycles. Need for pacing and graded return to activity." },
      { title: "Psychosocial and Identity", description: "Medical trauma or PTSD. Body image changes, visible differences, or amputation affecting confidence and social participation. Guilt about dependency and caregiver strain." },
    ],
    compounding: "Healing timelines vary — bone, tendon, ligament, and nerve heal on different clocks. Secondary problems can emerge months to years later. The nervous system can amplify pain even after tissues heal, requiring a different approach than push through it. Multidisciplinary care works best: PT, OT, pain management, mental health, sleep, and social work often need to coordinate.",
    earlySignals: [
      "Pain, numbness, tingling, or weakness persisting beyond 6-12 weeks after injury",
      "Joints giving way, frequent sprains, or difficulty with stairs and uneven ground",
      "Stiffness or limited range, scar tightness pulling posture, or contractures developing",
      "Headaches, dizziness, or visual disturbances after head or neck injury",
      "New snoring, gasping, or positional breathing limits after facial or chest trauma",
      "Crashes in energy after modest exertion; needing prolonged recovery to function",
    ],
    whyItMatters: "When physical trauma or structural differences are primary drivers, generic try harder advice fails — and risks setbacks. Recognising them reframes plans around function-first goals, pain control, smart pacing, targeted rehab, sleep and nutrition for healing, well-fitted equipment, and legal accommodations at work or school.",
  },
};

const FACTOR_ORDER = ["lifestyle", "environmental", "genetic", "structural", "stress", "purpose", "relationships", "physical_trauma"];

export default function FactorDetail() {
  const params = useParams<{ id: string }>();
  const factorId = params.id || "";
  const factor = FACTOR_DATA[factorId];

  if (!factor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Factor Not Found</h1>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentIndex = FACTOR_ORDER.indexOf(factorId);
  const prevFactor = currentIndex > 0 ? FACTOR_DATA[FACTOR_ORDER[currentIndex - 1]] : null;
  const nextFactor = currentIndex < FACTOR_ORDER.length - 1 ? FACTOR_DATA[FACTOR_ORDER[currentIndex + 1]] : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-primary" />
            <span className="font-serif font-semibold text-foreground">Add Life to Your Years</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => {
                const url = window.location.href;
                const title = `${factor.name} — Add Life to Your Years`;
                const text = `Learn about ${factor.name.toLowerCase()} and how it affects your health and wellbeing.`;
                if (navigator.share) {
                  navigator.share({ title, text, url }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(url).then(() => {
                    toast.success("Link copied to clipboard");
                  }).catch(() => {
                    toast.error("Could not copy link");
                  });
                }
              }}
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            <Link href="/#factors">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                All Factors
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className={`py-20 bg-gradient-to-b ${factor.bgGradient}`}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className={`w-20 h-20 rounded-2xl ${factor.color} flex items-center justify-center mx-auto mb-6`}>
              {factor.heroIcon}
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
              {factor.name}
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              {factor.intro}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Challenge Areas */}
      <section className="py-16">
        <div className="container max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">
              Where Challenges Commonly Arise
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {factor.challengeAreas.map((area, i) => (
                <motion.div
                  key={area.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <Card className="h-full border-border/60 hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-foreground mb-3">{area.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{area.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Compounding Effects */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-6 text-center">
              Compounding Effects
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed text-center">
              {factor.compounding}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Early Signals */}
      <section className="py-16">
        <div className="container max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 justify-center mb-8">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
                Early Warning Signs
              </h2>
            </div>
            <div className="space-y-3">
              {factor.earlySignals.map((signal, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="flex items-start gap-3 p-4 rounded-lg bg-orange-50/50 border border-orange-100/50"
                >
                  <CheckCircle2 className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground">{signal}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why It Matters */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-6">
              Why This Matters
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              {factor.whyItMatters}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Book CTA */}
      <section className="py-16">
        <div className="container max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-primary/20 bg-green-50/50">
              <CardContent className="p-8 text-center">
                <BookOpen className="w-10 h-10 text-primary mx-auto mb-4" />
                <h3 className="font-serif text-xl font-bold text-foreground mb-3">
                  Want to Learn More?
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  There is much more detail on {factor.name.toLowerCase()} and all 8 health factors in the{" "}
                  <strong>Add Life to Your Years</strong> book, including practical strategies and real-world examples.
                </p>
                <Link href={FACTOR_BOOK_CHAPTER[factorId] || "/book/read"}>
                  <Button className="gap-2">
                    <BookOpen className="w-4 h-4" />
                    Explore the Book
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Navigation between factors */}
      <section className="py-12 border-t border-border/50">
        <div className="container max-w-3xl">
          <div className="flex items-center justify-between">
            {prevFactor ? (
              <Link href={`/factor/${prevFactor.id}`}>
                <Button variant="ghost" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  {prevFactor.name}
                </Button>
              </Link>
            ) : <div />}
            {nextFactor ? (
              <Link href={`/factor/${nextFactor.id}`}>
                <Button variant="ghost" className="gap-2">
                  {nextFactor.name}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <Link href="/questionnaire">
                <Button className="gap-2">
                  Start Your Evaluation
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-foreground text-white/70">
        <div className="container text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Add Life to Your Years. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
