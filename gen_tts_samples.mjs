import { writeFileSync } from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
require('dotenv').config();

const apiKey = process.env.OPENAI_API_KEY;
const ttsUrl = 'https://api.openai.com/v1/audio/speech';

console.log('Using OpenAI TTS API');
console.log('Key length:', apiKey?.length);

const sampleText = `Welcome to the Add Life to Your Years Wellness Files.

Your mitochondria are not just the powerhouses of the cell — they are the master regulators of how you age, how you feel, and how resilient your body is under stress. When mitochondrial function declines, so does everything else: energy, mental clarity, immune strength, and the ability to recover from illness or injury.

The good news is that mitochondrial health is highly responsive to lifestyle. Dr. William Li, one of the world's leading researchers in regenerative medicine, has identified five evidence-based strategies that can measurably restore mitochondrial function — and the science behind each one is both compelling and actionable.`;

const voices = ['alloy', 'nova', 'shimmer'];

for (const voice of voices) {
  console.log(`\nGenerating voice: ${voice}...`);
  
  const resp = await fetch(ttsUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'tts-1',
      input: sampleText,
      voice: voice,
      response_format: 'mp3'
    })
  });

  console.log(`  Status: ${resp.status} ${resp.statusText}`);

  if (resp.ok) {
    const buffer = Buffer.from(await resp.arrayBuffer());
    const outPath = `/home/ubuntu/tts_sample_${voice}.mp3`;
    writeFileSync(outPath, buffer);
    console.log(`  ✓ Saved: ${outPath} (${buffer.length} bytes)`);
  } else {
    const text = await resp.text();
    console.log(`  ✗ Error: ${text.substring(0, 300)}`);
  }
}

console.log('\nDone.');
