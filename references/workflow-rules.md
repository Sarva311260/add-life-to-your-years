# Workflow Rules — Add Life to Your Years

## GitHub Backup Rule

**After every checkpoint, always push to GitHub.**

Run this command after every `webdev_save_checkpoint`:

```bash
cd /home/ubuntu/wellness-coach-app && git push github main
```

If the `github` remote is not set up, add it first:

```bash
git remote add github https://github.com/Sarva311260/add-life-to-your-years.git
```

GitHub repository: https://github.com/Sarva311260/add-life-to-your-years (private)
GitHub account: Sarva311260

---

## Working Task

All live site work for addlifetoyouryears.org is done from the **"WORKING TASK — Add Life to Your Years (Live Site)"** Task in Manus — NOT from the Project folder. The web app (`wellness-coach-app`), database, Stripe, and all environment variables are connected to this Task's sandbox only.

The **Add Life to Your Years Project folder** is used for:
- Persistent project instructions and memory
- Organising tasks
- Storing shared reference files and skills

---

## Publishing New Blog Posts

Always follow the wellness-content-publisher skill:
`/home/ubuntu/skills/wellness-content-publisher/SKILL.md`

Last published guide: **Supplementary Guide K — Gallbladder Health** (dated 7 April 2026)
Next guide will be: **Supplementary Guide L**

---

## Key Project Details

- **Live site:** https://addlifetoyouryears.org
- **App path:** /home/ubuntu/wellness-coach-app
- **Tech stack:** React 19, Tailwind 4, tRPC 11, Express 4, Drizzle ORM, MySQL/TiDB
- **Design:** Dark green theme (#0a1f0a), gold accents, Playfair Display + Inter fonts
- **Owner:** Sarva Keller (Sarvadarshi Dasa), Wellness Coach & Author
