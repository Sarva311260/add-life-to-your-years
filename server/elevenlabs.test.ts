import { describe, it, expect } from 'vitest';

describe('ElevenLabs API', () => {
  it('should connect to ElevenLabs and list voices', async () => {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    expect(apiKey, 'ELEVENLABS_API_KEY must be set').toBeTruthy();

    const resp = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': apiKey!,
      },
    });

    expect(resp.status).toBe(200);
    const data = await resp.json() as { voices: Array<{ voice_id: string; name: string }> };
    expect(data.voices).toBeDefined();
    expect(Array.isArray(data.voices)).toBe(true);
    console.log(`✓ Found ${data.voices.length} voices`);
    console.log('Available voices:', data.voices.slice(0, 5).map(v => `${v.name} (${v.voice_id})`).join(', '));
  });
});
