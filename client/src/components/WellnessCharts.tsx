import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface CategoryScore {
  id: string;
  name: string;
  score: number;
  color: string;
}

interface WellnessChartsProps {
  overallScore: number;
  categoryScores: CategoryScore[];
  bmi?: number | null;
}

/** Short labels for the radar chart */
const SHORT_LABELS: Record<string, string> = {
  lifestyle: "Lifestyle",
  environmental: "Environment",
  genetic: "Genetics",
  structural: "Structural",
  stress: "Stress",
  purpose: "Purpose",
  relationships: "Relationships",
  physical_trauma: "Physical",
};

function getScoreColor(score: number): string {
  if (score >= 80) return "#22c55e"; // green
  if (score >= 60) return "#84cc16"; // lime
  if (score >= 40) return "#f59e0b"; // amber
  if (score >= 20) return "#f97316"; // orange
  return "#ef4444"; // red
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  if (score >= 20) return "Needs Work";
  return "Critical";
}

/** SVG-based radar chart — no external dependencies */
function RadarChart({ scores }: { scores: CategoryScore[] }) {
  const size = 300;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = 115;
  const levels = 5;

  const points = useMemo(() => {
    const n = scores.length;
    return scores.map((s, i) => {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      const r = (s.score / 100) * maxR;
      return {
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
        labelX: cx + (maxR + 22) * Math.cos(angle),
        labelY: cy + (maxR + 22) * Math.sin(angle),
        score: s,
        angle,
      };
    });
  }, [scores]);

  const polygon = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[320px] mx-auto">
      {/* Grid rings */}
      {Array.from({ length: levels }, (_, i) => {
        const r = ((i + 1) / levels) * maxR;
        const n = scores.length;
        const ringPoints = Array.from({ length: n }, (_, j) => {
          const angle = (Math.PI * 2 * j) / n - Math.PI / 2;
          return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
        }).join(" ");
        return (
          <polygon
            key={i}
            points={ringPoints}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="0.8"
          />
        );
      })}

      {/* Axis lines */}
      {points.map((p, i) => (
        <line
          key={i}
          x1={cx}
          y1={cy}
          x2={cx + maxR * Math.cos(p.angle)}
          y2={cy + maxR * Math.sin(p.angle)}
          stroke="#e5e7eb"
          strokeWidth="0.5"
        />
      ))}

      {/* Data polygon */}
      <polygon
        points={polygon}
        fill="rgba(76, 175, 80, 0.15)"
        stroke="#4CAF50"
        strokeWidth="2"
      />

      {/* Data points */}
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="4"
          fill={getScoreColor(p.score.score)}
          stroke="white"
          strokeWidth="1.5"
        />
      ))}

      {/* Labels */}
      {points.map((p, i) => (
        <text
          key={i}
          x={p.labelX}
          y={p.labelY}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-foreground"
          fontSize="9"
          fontWeight="500"
        >
          {SHORT_LABELS[p.score.id] || p.score.name.split(" ")[0]}
        </text>
      ))}

      {/* Percentage labels on grid */}
      {[20, 40, 60, 80, 100].map((pct, i) => (
        <text
          key={i}
          x={cx + 2}
          y={cy - ((i + 1) / levels) * maxR + 3}
          fontSize="7"
          className="fill-muted-foreground"
          textAnchor="start"
        >
          {pct}%
        </text>
      ))}
    </svg>
  );
}

/** Horizontal bar chart for category scores */
function BarChart({ scores }: { scores: CategoryScore[] }) {
  // Sort by score descending for visual impact
  const sorted = useMemo(
    () => [...scores].sort((a, b) => b.score - a.score),
    [scores]
  );

  return (
    <div className="space-y-3">
      {sorted.map((cat) => (
        <div key={cat.id}>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-foreground">{cat.name}</span>
            <span
              className="font-semibold"
              style={{ color: getScoreColor(cat.score) }}
            >
              {cat.score}%
            </span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${cat.score}%`,
                backgroundColor: getScoreColor(cat.score),
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Overall score gauge */
function ScoreGauge({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;
  const color = getScoreColor(score);

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 120 120" className="w-32 h-32">
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="8"
        />
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 60 60)"
          className="transition-all duration-1000"
        />
        <text
          x="60"
          y="55"
          textAnchor="middle"
          className="fill-foreground"
          fontSize="28"
          fontWeight="700"
        >
          {score}
        </text>
        <text
          x="60"
          y="72"
          textAnchor="middle"
          className="fill-muted-foreground"
          fontSize="10"
        >
          out of 100
        </text>
      </svg>
      <span
        className="text-sm font-semibold mt-1"
        style={{ color }}
      >
        {getScoreLabel(score)}
      </span>
    </div>
  );
}

export default function WellnessCharts({
  overallScore,
  categoryScores,
  bmi,
}: WellnessChartsProps) {
  // Find strongest and weakest areas
  const sorted = [...categoryScores].sort((a, b) => b.score - a.score);
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];

  return (
    <div className="report-charts space-y-6 mb-8">
      {/* Overall Score + Quick Stats */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-serif text-lg font-semibold text-center mb-4">
            Your Wellness Snapshot
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Overall gauge */}
            <div className="flex justify-center">
              <ScoreGauge score={overallScore} />
            </div>

            {/* Quick stats */}
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getScoreColor(strongest?.score ?? 0) }}
                />
                <span className="text-muted-foreground">Strongest:</span>
                <span className="font-medium">{strongest?.name}</span>
                <span className="font-semibold" style={{ color: getScoreColor(strongest?.score ?? 0) }}>
                  {strongest?.score}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getScoreColor(weakest?.score ?? 0) }}
                />
                <span className="text-muted-foreground">Focus area:</span>
                <span className="font-medium">{weakest?.name}</span>
                <span className="font-semibold" style={{ color: getScoreColor(weakest?.score ?? 0) }}>
                  {weakest?.score}%
                </span>
              </div>
              {bmi && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-muted-foreground">BMI:</span>
                  <span className="font-semibold">{bmi.toFixed(1)}</span>
                  <span className="text-muted-foreground text-xs">
                    ({bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese"})
                  </span>
                </div>
              )}
            </div>

            {/* Radar chart */}
            <div>
              <RadarChart scores={categoryScores} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed bar chart */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-serif text-lg font-semibold mb-4">
            Category Breakdown
          </h3>
          <BarChart scores={categoryScores} />
          <p className="text-xs text-muted-foreground mt-4 text-center">
            Scores are based on your self-evaluation responses across 8 wellness dimensions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
