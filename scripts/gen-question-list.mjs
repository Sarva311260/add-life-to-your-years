// Run with: node --loader tsx/esm scripts/gen-question-list.mjs
// Or: npx tsx scripts/gen-question-list.mjs
import { createRequire } from 'module';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Read the questionnaire file as text and parse manually
import { readFileSync } from 'fs';

const questPath = join(__dirname, '../shared/questionnaire.ts');
const content = readFileSync(questPath, 'utf-8');

// Write output to a markdown file
let md = `# Complete Self-Evaluation Question List\n\n`;
md += `**Instructions:** Review each question below. For questions where users should be able to select MORE THAN ONE answer, mark them with ✅ MULTI-SELECT in the "Action" column.\n\n`;
md += `---\n\n`;

// Parse categories manually from the TypeScript source
// Extract category names
const catMatches = content.match(/name:\s*"([^"]+)"/g) || [];
const catNames = catMatches.map(m => m.match(/"([^"]+)"/)?.[1]).filter(Boolean);

// Extract all questions with their IDs and text
const questionMatches = content.matchAll(/id:\s*"([^"]+)",\s*\n\s*text:\s*"([^"]+)"/g);

let catIndex = 0;
let qNum = 0;
const categories = [
  'Lifestyle & Daily Habits',
  'Environmental Factors', 
  'Genetic & Epigenetic Factors',
  'Structural & Physical Health',
  'Stress & Emotional Wellbeing',
  'Purpose & Meaning',
  'Relationships & Social Health',
  'Physical Trauma & Injury History'
];

// Better approach: read the file and extract structured data
const lines = content.split('\n');
let currentCat = '';
let inCategory = false;
let inQuestion = false;
let currentQ = { id: '', text: '', type: '', options: [] };
let output = [];
let currentCatName = '';
let catCount = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  
  // Detect category start
  if (line.includes('name:') && !line.includes('firstName') && !line.includes('label')) {
    const nameMatch = line.match(/name:\s*"([^"]+)"/);
    if (nameMatch && categories.some(c => c === nameMatch[1])) {
      currentCatName = nameMatch[1];
      catCount++;
    }
  }
  
  // Detect question id
  if (line.match(/^id:\s*"[a-z]/) && !line.includes('health_') && currentCatName) {
    const idMatch = line.match(/id:\s*"([^"]+)"/);
    if (idMatch) currentQ.id = idMatch[1];
  }
  
  // Detect question text
  if (line.match(/^text:\s*"/) && currentQ.id) {
    const textMatch = line.match(/text:\s*"([^"]+)"/);
    if (textMatch) currentQ.text = textMatch[1];
  }
  
  // Detect type
  if (line.match(/^type:\s*"/) && currentQ.id) {
    const typeMatch = line.match(/type:\s*"([^"]+)"/);
    if (typeMatch) {
      currentQ.type = typeMatch[1];
      currentQ.options = [];
    }
  }
  
  // Detect options
  if (line.match(/^\{ value:/) && currentQ.id) {
    const optMatch = line.match(/value:\s*([\d.]+),\s*label:\s*"([^"]+)"/);
    if (optMatch) {
      currentQ.options.push({ value: optMatch[1], label: optMatch[2] });
    }
  }
  
  // End of question (when we hit next id or end of questions block)
  if (currentQ.id && currentQ.text && currentQ.type && 
      (line.match(/^\},/) || line.match(/^\},$/) ) && 
      i > 0 && lines[i-1].trim().match(/^\},?$|^isFlag|^weight|^description|^flagTrigger/)) {
    if (currentQ.text) {
      output.push({ cat: currentCatName, ...currentQ });
      currentQ = { id: '', text: '', type: '', options: [] };
    }
  }
}

// Write the markdown
writeFileSync('/home/ubuntu/full-question-list.md', 
  `# Complete Self-Evaluation Question List\n\nPlease review each question. Mark any question where users should be able to select **more than one answer** by noting it.\n\nCurrent type legend:\n- **choice** = custom options listed\n- **scale** = Very Poor / Poor / Fair / Good / Excellent  \n- **frequency** = Never / Occasionally / Sometimes / Often / Always\n- **yesno** = Yes / No\n\n---\n\n` +
  output.map((q, i) => 
    `### Q${i+1}. ${q.text}\n**Category:** ${q.cat} | **ID:** \`${q.id}\` | **Type:** ${q.type}\n\n` +
    (q.options.length > 0 ? `**Options:**\n${q.options.map(o => `- ${o.label} (score: ${o.value})`).join('\n')}\n` : '') +
    `\n**Action:** [ ] Single select (current) | [ ] MULTI-SELECT\n\n---\n`
  ).join('\n')
);

console.log(`Generated ${output.length} questions`);
