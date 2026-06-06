# Session Notes — Add Life to Your Years

> **How to use this file:** At the start of each new session, read this file to restore full context. At the end of each session, update the "Last Session" section with a summary of what was done.

---

## Project Overview

- **Live site:** https://addlifetoyouryears.org
- **App path on sandbox:** /home/ubuntu/wellness-coach-app
- **Owner:** Sarva Keller (Sarvadarshi Dasa), Wellness Coach & Author
- **Tech stack:** React 19, Tailwind 4, tRPC 11, Express 4, Drizzle ORM, MySQL/TiDB, Stripe, ElevenLabs
- **Design:** Dark green theme (#0a1f0a background), gold accents, Playfair Display + Inter fonts
- **GitHub backup:** https://github.com/Sarva311260/add-life-to-your-years (private)
- **GitHub account:** Sarva311260
- **Working Task name:** "WORKING TASK — Add Life to Your Years (Live Site)"

---

## Key Architecture Notes

- All live site work must be done from this Task — the database, Stripe keys, deployment pipeline, and all environment variables are connected here only
- The Add Life to Your Years Project folder in Manus is for organisation only — it does not have the web app connected
- After every checkpoint, push to GitHub: `cd /home/ubuntu/wellness-coach-app && git push github main`
- Publishing workflow: always follow `/home/ubuntu/skills/wellness-content-publisher/SKILL.md`

---

## Supplementary Guides Published (A–K)

| Guide | Topic | Blog Slug | Date |
|---|---|---|---|
| A | Navigating the Diet Landscape | navigating-diet-landscape | Jan 2024 |
| B | The Science of Cold Showers | science-of-cold-showers | Feb 2024 |
| C | Off-Label Pharmaceuticals | off-label-pharmaceuticals | Feb 2024 |
| D | Brazil Nuts and Selenium | brazil-nuts-selenium | Mar 2024 |
| E | The Floor as Medicine | floor-as-medicine | Mar 2024 |
| F | The Fiber That Calms You | fiber-that-calms-you | Apr 2024 |
| G | Blackstrap Molasses | blackstrap-molasses | Apr 2024 |
| H | Coherence Breathing | coherence-breathing | May 2024 |
| I | Lavender Oil | lavender-oil | May 2024 |
| J | Mitochondrial Health | mitochondrial-health-five-strategies | May 2026 |
| K | Gallbladder Health | gallbladder-health-five-step-protocol | 7 Apr 2026 |

**Next guide:** Supplementary Guide L

---

## Key Content Decisions & Standing Rules

- **Fats:** Always recommend whole-food-based essential fatty acids (avocado, nuts, seeds, olives) — never pressed oils including olive oil
- **Curcumin note:** Curcumin upregulates 15-PGDH in some contexts — important nuance for cartilage regeneration advice
- All blog posts use `video_ids` field in format: `[{"youtubeId": "...", "title": "..."}]`

---

## Video Worker (Local YouTube Upload Tool)

- A Node.js worker script runs on Sarva's son's Windows PC
- It polls the site every 30 seconds, picks up posts queued for YouTube upload, encodes audio + images to MP4 using ffmpeg locally, then uploads to YouTube
- Setup instructions: `/home/ubuntu/wellness-coach-app/worker/README.md` (covers both Mac and Windows)
- Status: Set up but not fully tested — ffmpeg download was interrupted. Son knows what to do.
- Admin panel for triggering uploads: https://addlifetoyouryears.org/pemf-admin → Blog Posts tab → "Upload to YouTube"

---

## Support Tickets Open

- **Missing source code issue:** Ticket submitted to Manus support. Root cause: Manus GitHub export created empty repository. Fixed by direct git push on 6 Jun 2026. Manus support also asked to migrate web app from Task to Project folder (Option 2).
- **Bhakti Hub:** Same issue — source code is in a Task, not the Project folder. Need to identify which Task has the live code.

---

## Last Session — 6 June 2026

**What was done:**
1. Published Supplementary Guide K — Gallbladder Health (YouTube: 6dwMEBE3G_4)
   - Blog post dated 7 April 2026
   - Fixed video not showing: updated `video_ids` field to correct JSON format `[{"youtubeId":"6dwMEBE3G_4","title":"..."}]`
   - Updated blog post content: qualified "healthy fat" to mean whole-food-based fats only (not pressed oils including olive oil); updated "very low-fat diets" trigger to clarify the issue is avoiding whole-food fats
   - Added appendix-k to MEDIA_VIDEO_MAP in BlogPost.tsx
2. Set up Add Life to Your Years as a Manus Project folder
3. Added wellness-content-publisher skill to Project folder
4. Created GitHub account (Sarva311260) and pushed full source code to GitHub for first time
5. Made both GitHub repositories (add-life-to-your-years, bhakti-hub) private
6. Updated worker/README.md with Windows setup instructions
7. Researched 15-PGDH and cartilage regeneration (Stanford study + plant-based alternatives) — PDF saved at /tmp/15pgdh_cartilage_research.pdf
8. Created this session-notes.md and workflow-rules.md in references/
