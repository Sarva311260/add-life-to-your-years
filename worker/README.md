# Add Life to Your Years — Local Video Worker

This script runs on your Mac and handles YouTube video uploads. It picks up jobs you queue from the admin panel, encodes the MP4 with ffmpeg, and uploads to YouTube — no timeouts, no cloud limits.

---

## One-Time Setup

### Step 1 — Install Node.js (if not already installed)
Download from https://nodejs.org (choose the LTS version) and install it.

Verify: open Terminal and run:
```
node --version
```
You should see something like `v20.x.x`.

### Step 2 — Install ffmpeg
Open Terminal and run:
```
brew install ffmpeg
```
(If you don't have Homebrew: https://brew.sh — or download ffmpeg from https://ffmpeg.org/download.html)

Verify:
```
ffmpeg -version
```

### Step 3 — Install worker dependencies
In Terminal, navigate to this folder and run:
```
cd /path/to/this/folder
npm install
```

---

## Running the Worker

Every time you want to upload videos to YouTube, open Terminal and run:

```
cd /path/to/this/folder
node video-worker.mjs
```

Leave the Terminal window open. The worker will:
- Check for new jobs every 30 seconds (you'll see dots: `....`)
- When you click "Upload to YouTube" in the admin panel, it picks up the job automatically
- Encodes the MP4 with ffmpeg (takes 1-3 minutes depending on audio length)
- Uploads to YouTube (takes 1-5 minutes depending on file size)
- Shows `✅ Done!` with the YouTube URL when complete

Press **Ctrl+C** to stop the worker.

---

## How to Use

1. Start the worker (see above)
2. Go to https://addlifetoyouryears.org/pemf-admin
3. Log in and go to the **Blog Posts** tab
4. Find a post with audio generated (green audio icon)
5. Click **"Upload to YouTube"**
6. Watch the Terminal — the worker will pick it up within 30 seconds

The admin panel will show a progress bar and "Published to YouTube!" when done.

---

## Troubleshooting

**"Cannot reach addlifetoyouryears.org"**
→ Check your internet connection

**"No YouTube tokens found"**
→ Go to the admin panel → Blog Posts → click "Connect YouTube" and authorise

**"ffmpeg not found"**
→ Install ffmpeg: `brew install ffmpeg`

**"Upload failed: 403"**
→ Your YouTube OAuth token may have expired. Go to admin panel → Connect YouTube again.

---

## Notes

- The worker only runs while your computer is on and the Terminal is open
- You can close and reopen the Terminal anytime — pending jobs will be picked up when you restart
- The worker is safe to run multiple times (it won't double-upload)
