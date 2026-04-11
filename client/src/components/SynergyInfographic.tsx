import { useState } from "react";

const JOHN_IMAGE_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663488485220/2Y96gvwURj9QkkDN4hXary/john-vitality-figure-oMLxksqD8w2Rg7VEuS5mdr.webp";

interface Recommendation {
  id: number;
  label: string;
  shortLabel: string;
  icon: string;
  color: string;
  description: string;
  synergy: string;
}

const recommendations: Recommendation[] = [
  {
    id: 1,
    label: "Whole Food Plant-Based Diet",
    shortLabel: "WFPB Diet",
    icon: "🥦",
    color: "#4CAF50",
    description:
      "A diet centred on unprocessed fruits, vegetables, whole grains, legumes, nuts, and seeds — the only diet proven to reverse heart disease.",
    synergy:
      "Provides the nutritional foundation that amplifies every other recommendation. Seeds, glycine, B12, and hydration all build on this base.",
  },
  {
    id: 2,
    label: "Water & Hydration",
    shortLabel: "Water",
    icon: "💧",
    color: "#2196F3",
    description:
      "Pure, distilled water for optimal cellular hydration — supporting detoxification, nutrient transport, and every metabolic process.",
    synergy:
      "Hydration enhances nutrient absorption from WFPB foods, supports melatonin production during sleep, and improves exercise performance.",
  },
  {
    id: 3,
    label: "Sleep & Melatonin",
    shortLabel: "Sleep",
    icon: "🌙",
    color: "#673AB7",
    description:
      "Quality sleep and melatonin optimisation — managing light exposure, supporting DNA repair, and cancer protection.",
    synergy:
      "Sleep repairs the body from daily movement, meditation calms the mind for deeper sleep, and WFPB foods provide tryptophan for melatonin synthesis.",
  },
  {
    id: 4,
    label: "Glycine",
    shortLabel: "Glycine",
    icon: "🧬",
    color: "#FF9800",
    description:
      "The underappreciated amino acid — 8-10g daily for inflammation regulation, collagen synthesis, and cellular repair.",
    synergy:
      "Works with sleep for overnight repair, supports the connective tissue stressed by the Six Movements, and vegans naturally have the highest levels.",
  },
  {
    id: 5,
    label: "Five Seeds of Life",
    shortLabel: "5 Seeds",
    icon: "🌱",
    color: "#8BC34A",
    description:
      "Flax, chia, hemp, pumpkin, and black sesame seeds — providing essential fatty acids, minerals, and nerve-supporting nutrients.",
    synergy:
      "Seeds complement the WFPB diet with concentrated omega-3s and zinc, support brain health for meditation, and provide magnesium for sleep.",
  },
  {
    id: 6,
    label: "Vitamin B12 & D",
    shortLabel: "B12 & D",
    icon: "☀️",
    color: "#FFC107",
    description:
      "Essential supplementation — B12 for nerve function and D3 with co-factors (K2, magnesium, boron) for immune and bone health. Adequate sunshine is also vital as a natural source of vitamin D and overall wellbeing.",
    synergy:
      "B12 supports the nervous system for meditation and breathing. Vitamin D works with sunlight from nature exposure and enhances immune function alongside WFPB nutrition.",
  },
  {
    id: 7,
    label: "Six Movements",
    shortLabel: "Movement",
    icon: "🏃",
    color: "#E91E63",
    description:
      "Japanese-inspired daily exercises — Sampo walking, Radio Taiso, deep squats, single-leg standing, floor transitions, and towel twist.",
    synergy:
      "Movement improves circulation for nutrient delivery, deepens sleep quality, reduces stress alongside meditation, and strengthens the body for time in nature.",
  },
  {
    id: 8,
    label: "Breathing",
    shortLabel: "Breathing",
    icon: "🌬️",
    color: "#00BCD4",
    description:
      "Conscious breathing techniques — nasal breathing, Bhramari Pranayama for nitric oxide production and parasympathetic activation.",
    synergy:
      "Breathing enhances meditation depth, improves oxygen delivery during movement, supports sleep onset, and activates the body's natural healing response.",
  },
  {
    id: 9,
    label: "PEMF & Earthing",
    shortLabel: "PEMF",
    icon: "⚡",
    color: "#9C27B0",
    description:
      "Pulsed electromagnetic field therapy and earthing — reconnecting with the Earth's Schumann resonance for cellular repair and redox signalling.",
    synergy:
      "PEMF enhances cellular energy production, supports sleep cycles, amplifies the benefits of movement, and works synergistically with methylene blue for mitochondrial health.",
  },
  {
    id: 10,
    label: "Meditation",
    shortLabel: "Meditation",
    icon: "🧘",
    color: "#3F51B5",
    description:
      "Daily meditation practice — increasing grey matter, reducing cortisol, building emotional resilience, and slowing brain ageing.",
    synergy:
      "Meditation calms the mind for better sleep, deepens breathing practice, reduces stress that damages relationships, and enhances the body's response to all other interventions.",
  },
  {
    id: 11,
    label: "Time in Nature",
    shortLabel: "Nature",
    icon: "🌳",
    color: "#009688",
    description:
      "Forest bathing (Shinrin-yoku), morning sunlight, and phytoncide exposure — activating NK cells and resetting circadian rhythms.",
    synergy:
      "Nature provides vitamin D from sunlight, grounding/earthing benefits, enhances meditation outdoors, and phytoncides boost the immune system alongside WFPB nutrition.",
  },
  {
    id: 12,
    label: "Repairing Relationships",
    shortLabel: "Relationships",
    icon: "❤️",
    color: "#F44336",
    description:
      "The Harvard longevity study's key finding — social connection is the strongest predictor of health and longevity. Rupture and repair builds resilience.",
    synergy:
      "Strong relationships reduce cortisol (improving sleep and meditation), provide motivation for lifestyle changes, and the Harvard study shows they matter more than diet or exercise alone.",
  },
  {
    id: 13,
    label: "Second Income Stream",
    shortLabel: "Income",
    icon: "💰",
    color: "#795548",
    description:
      "Financial stress is a major health destroyer — building a second income stream reduces chronic stress and provides security for wellness investments.",
    synergy:
      "Financial security reduces cortisol and anxiety, enabling better sleep, deeper meditation, and the freedom to invest in quality food, supplements, and healing practices.",
  },
  {
    id: 14,
    label: "Your Environment",
    shortLabel: "Environment",
    icon: "🏠",
    color: "#607D8B",
    description:
      "Optimising your healing space — bedroom environment, indoor air quality, reducing toxin exposure, and creating spaces that support recovery.",
    synergy:
      "A clean environment supports sleep quality, reduces toxic load on the body (enhancing WFPB benefits), and creates the calm space needed for meditation and breathing practice.",
  },
  {
    id: 15,
    label: "Methylene Blue",
    shortLabel: "Methylene Blue",
    icon: "🔬",
    color: "#1565C0",
    description:
      "Mitochondrial medicine — enhancing cellular energy production, supporting brain health, with red light synergy. Critical contraindications apply.",
    synergy:
      "Methylene blue boosts mitochondrial function amplified by PEMF therapy, supports the energy demands of movement and meditation, and works with red light from sunlight exposure in nature.",
  },
];

export default function SynergyInfographic() {
  const [activeRec, setActiveRec] = useState<Recommendation | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  // Arrange 15 items in an ellipse around the centre
  const centerX = 50; // percentage
  const centerY = 50;
  const radiusX = 42;
  const radiusY = 42;

  const getPosition = (index: number, total: number) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    return {
      x: centerX + radiusX * Math.cos(angle),
      y: centerY + radiusY * Math.sin(angle),
    };
  };

  return (
    <div className="my-12 px-4">
      <h2
        className="text-2xl md:text-3xl font-bold text-center mb-3"
        style={{ color: "#2E7D32" }}
      >
        The 15 Pillars of Wellness — Working Together
      </h2>
      <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto text-sm md:text-base">
        Each recommendation strengthens the others. Hover over (or tap) any
        pillar to see how it connects synergistically with the rest.
      </p>

      <div
        className="relative mx-auto"
        style={{ width: "100%", maxWidth: "800px", aspectRatio: "1 / 1" }}
      >
        {/* SVG connection lines */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
        >
          {recommendations.map((rec, i) => {
            const pos = getPosition(i, recommendations.length);
            return (
              <line
                key={rec.id}
                x1={centerX}
                y1={centerY}
                x2={pos.x}
                y2={pos.y}
                stroke={
                  activeRec?.id === rec.id ? rec.color : "rgba(0,0,0,0.08)"
                }
                strokeWidth={activeRec?.id === rec.id ? 0.4 : 0.15}
                strokeDasharray={activeRec?.id === rec.id ? "none" : "0.8 0.4"}
                style={{
                  transition: "all 0.3s ease",
                }}
              />
            );
          })}
          {/* Synergy arcs between adjacent recommendations */}
          {activeRec &&
            recommendations.map((rec, i) => {
              if (rec.id === activeRec.id) return null;
              const pos1 = getPosition(
                recommendations.findIndex((r) => r.id === activeRec.id),
                recommendations.length
              );
              const pos2 = getPosition(i, recommendations.length);
              return (
                <line
                  key={`synergy-${rec.id}`}
                  x1={pos1.x}
                  y1={pos1.y}
                  x2={pos2.x}
                  y2={pos2.y}
                  stroke={activeRec.color}
                  strokeWidth={0.12}
                  opacity={0.25}
                  strokeDasharray="0.5 0.3"
                />
              );
            })}
        </svg>

        {/* Centre figure - John */}
        <div
          className="absolute flex flex-col items-center justify-center"
          style={{
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: "22%",
            height: "22%",
          }}
        >
          <div
            className="rounded-full overflow-hidden shadow-lg border-4"
            style={{
              borderColor: activeRec ? activeRec.color : "#4CAF50",
              transition: "border-color 0.3s ease",
              width: "100%",
              height: "100%",
            }}
          >
            <img
              src={JOHN_IMAGE_URL}
              alt="John — The Wellness Journey"
              className="w-full h-full object-cover object-top"
            />
          </div>
          <span
            className="text-xs md:text-sm font-semibold mt-1"
            style={{ color: "#2E7D32" }}
          >
            John
          </span>
        </div>

        {/* Recommendation nodes */}
        {recommendations.map((rec, i) => {
          const pos = getPosition(i, recommendations.length);
          const isActive = activeRec?.id === rec.id;
          return (
            <div
              key={rec.id}
              className="absolute flex flex-col items-center cursor-pointer group"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: "translate(-50%, -50%)",
                zIndex: isActive ? 20 : 10,
              }}
              onMouseEnter={(e) => {
                setActiveRec(rec);
                const rect = (
                  e.currentTarget.closest(
                    "[style*='aspect-ratio']"
                  ) as HTMLElement
                )?.getBoundingClientRect();
                if (rect) {
                  setTooltipPos({
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top,
                  });
                }
              }}
              onMouseLeave={() => setActiveRec(null)}
              onClick={() => setActiveRec(isActive ? null : rec)}
            >
              <div
                className="rounded-full flex items-center justify-center shadow-md transition-all duration-300"
                style={{
                  width: isActive ? "48px" : "38px",
                  height: isActive ? "48px" : "38px",
                  backgroundColor: isActive ? rec.color : "white",
                  border: `2px solid ${rec.color}`,
                  fontSize: isActive ? "22px" : "18px",
                }}
              >
                {rec.icon}
              </div>
              <span
                className="text-center font-medium leading-tight mt-1 transition-all duration-300"
                style={{
                  fontSize: isActive ? "11px" : "9px",
                  color: isActive ? rec.color : "#555",
                  maxWidth: "80px",
                  fontWeight: isActive ? 700 : 500,
                }}
              >
                {rec.shortLabel}
              </span>
            </div>
          );
        })}

        {/* Tooltip popup */}
        {activeRec && (
          <div
            className="absolute z-30 pointer-events-none"
            style={{
              left: `${tooltipPos.x}px`,
              top: `${tooltipPos.y - 10}px`,
              transform: "translate(-50%, -100%)",
              maxWidth: "280px",
              minWidth: "220px",
            }}
          >
            <div
              className="rounded-xl shadow-xl p-4 border-l-4"
              style={{
                backgroundColor: "white",
                borderLeftColor: activeRec.color,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{activeRec.icon}</span>
                <h4
                  className="font-bold text-sm"
                  style={{ color: activeRec.color }}
                >
                  {activeRec.label}
                </h4>
              </div>
              <p className="text-xs text-gray-700 mb-2 leading-relaxed">
                {activeRec.description}
              </p>
              <div
                className="text-xs font-semibold mb-1"
                style={{ color: activeRec.color }}
              >
                Synergy:
              </div>
              <p className="text-xs text-gray-600 leading-relaxed italic">
                {activeRec.synergy}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Mobile: show active recommendation below the graphic */}
      {activeRec && (
        <div
          className="md:hidden mt-4 rounded-xl shadow-lg p-4 border-l-4 mx-auto max-w-sm"
          style={{
            backgroundColor: "white",
            borderLeftColor: activeRec.color,
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{activeRec.icon}</span>
            <h4
              className="font-bold text-sm"
              style={{ color: activeRec.color }}
            >
              {activeRec.label}
            </h4>
          </div>
          <p className="text-xs text-gray-700 mb-2 leading-relaxed">
            {activeRec.description}
          </p>
          <div
            className="text-xs font-semibold mb-1"
            style={{ color: activeRec.color }}
          >
            Synergy:
          </div>
          <p className="text-xs text-gray-600 leading-relaxed italic">
            {activeRec.synergy}
          </p>
        </div>
      )}

      <p className="text-center text-gray-400 text-xs mt-6">
        Tap or hover over each pillar to explore the synergistic connections
      </p>
    </div>
  );
}
