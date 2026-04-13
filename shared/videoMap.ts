/**
 * Shared mapping of book recommendations to their corresponding YouTube videos.
 * Used by the Media page (frontend) and consultation report generator (backend).
 */

export interface RecommendationVideo {
  youtubeId: string;
  title: string;
}

/**
 * Maps book recommendation IDs (1-17) to their YouTube videos.
 * Recommendation numbers correspond to BOOK_RECOMMENDATIONS in consultKnowledge.ts:
 *  1: Whole Food Plant-Based Lifestyle
 *  2: Water — Quality and Quantity
 *  3: Melatonin & Sleep
 *  4: Glycine
 *  5: Five Seeds of Life
 *  6: Vitamin B12 & Vitamin D3
 *  7: Gut Health & Microbiome (no video yet)
 *  8: Six Japanese Movements
 *  9: Breathing & Bhramari Pranayama
 * 10: PEMF & Earthing
 * 11: Meditation
 * 12: Time in Nature
 * 13: Relationships
 * 14: Second Income Stream
 * 15: Environment & Toxin Reduction
 * 16: Methylene Blue & Photobiomodulation
 * 17: Redox Signalling (no video yet)
 */
export const RECOMMENDATION_VIDEOS: Record<number, RecommendationVideo[]> = {
  1: [
    { youtubeId: "wb7L3t0ejdI", title: "Whole Food Plant-Based Diet & Health" },
  ],
  2: [
    { youtubeId: "VRzjoIgHNb0", title: "Water & Hydration — Quality, Purity & Health" },
  ],
  3: [
    { youtubeId: "tcwVfUAqWiY", title: "Melatonin — Sleep, Repair & Longevity" },
  ],
  4: [
    { youtubeId: "o2Kc1Iaow40", title: "Glycine — The Underappreciated Amino Acid" },
  ],
  5: [
    { youtubeId: "YckoR3hLL9E", title: "The Five Seeds of Life" },
  ],
  6: [
    { youtubeId: "wY4vEBilWN4", title: "Vitamin B12 — Why It Matters & How to Supplement" },
    { youtubeId: "qiR4yBymtwY", title: "Vitamin D3 — Dr. Michael Holick" },
    { youtubeId: "iotnggfP9Yk", title: "Vitamin D — The Sunshine Vitamin & Your Health" },
    { youtubeId: "uxWARJ4s95Y", title: "Vitamin D3 — Part 2" },
  ],
  // 7: Gut Health — no video yet
  8: [
    { youtubeId: "qu3ixTQmpl0", title: "The Six Movements — Japanese Exercise for Longevity" },
  ],
  9: [
    { youtubeId: "8vN08IuParo", title: "Bhramari Pranayama — Bee Breath for Nitric Oxide & Calm" },
  ],
  10: [
    { youtubeId: "byinppKR9LY", title: "PEMF Therapy — Pulsed Electromagnetic Field & Redox Signalling" },
  ],
  11: [
    { youtubeId: "wXsxwIJnUJk", title: "Meditation — Neuroscience, Cortisol & Emotional Resilience" },
  ],
  12: [
    { youtubeId: "UHv3SCUioQU", title: "Time in Nature — Forest Bathing, Sunlight & Healing" },
  ],
  13: [
    { youtubeId: "rgQvqi6aYD8", title: "Repairing Relationships — Social Connection & Longevity" },
  ],
  14: [
    { youtubeId: "eD0N8wXjNSs", title: "Second Income Stream — Financial Stress & Health" },
  ],
  15: [
    { youtubeId: "foBnfBX4YKQ", title: "Your Environment — Air Quality, Toxins & Healing Spaces" },
  ],
  16: [
    { youtubeId: "KvASX2yp0zU", title: "Methylene Blue — Mitochondrial Medicine & Photobiomodulation" },
  ],
  // 17: Redox Signalling — no video yet
};

/**
 * Get video links formatted as markdown for a set of recommendation IDs.
 * Used by the report generator to append relevant videos to each recommendation.
 */
/**
 * Recommendation ID to title mapping for video context.
 */
const REC_TITLES: Record<number, string> = {
  1: "Whole Food Plant-Based Lifestyle",
  2: "Water — Quality and Quantity",
  3: "Melatonin & Sleep",
  4: "Glycine",
  5: "Five Seeds of Life",
  6: "Vitamin B12 & Vitamin D3",
  7: "Gut Health & Microbiome",
  8: "Six Japanese Movements",
  9: "Breathing & Bhramari Pranayama",
  10: "PEMF & Earthing",
  11: "Meditation",
  12: "Time in Nature",
  13: "Relationships",
  14: "Second Income Stream",
  15: "Environment & Toxin Reduction",
  16: "Methylene Blue & Photobiomodulation",
  17: "Redox Signalling",
};

export function getVideoLinksMarkdown(recommendationIds: number[]): string {
  const lines: string[] = [];
  for (const id of recommendationIds) {
    const videos = RECOMMENDATION_VIDEOS[id];
    if (videos && videos.length > 0) {
      const recTitle = REC_TITLES[id] || `Recommendation ${id}`;
      lines.push(`**${recTitle}:**`);
      for (const v of videos) {
        lines.push(`  - [${v.title}](https://www.youtube.com/watch?v=${v.youtubeId})`);
      }
    }
  }
  return lines.length > 0 ? lines.join("\n") : "";
}
