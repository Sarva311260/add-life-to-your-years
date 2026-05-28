# Add Life to Your Years — Local Video Worker

This script runs on your local computer (Mac or Windows) and handles YouTube video uploads. It picks up jobs you queue from the admin panel, encodes the MP4 with ffmpeg, and uploads to YouTube — no timeouts, no cloud limits.

---

## One-Time Setup

### Step 1 — Install Node.js (if not already installed)
Download from https://nodejs.org (choose the LTS version) and install it.

**Mac:** Open Terminal and verify:
```
node --version
```
**Windows:** Open Command Prompt (search "cmd" in Start menu) and verify:
```
node --version
```
You should see something like `v20.x.x`.

---

### Step 2 — Install ffmpeg

#### On Mac
Open Terminal and run:
```
brew install ffmpeg
```
(If you don't have Homebrew: https://brew.sh — or download ffmpeg from https://ffmpeg.org/download.html)

Verify:
```
ffmpeg -version
```

#### On Windows
1. Go to https://www.gyan.dev/ffmpeg/builds/
2. Download **ffmpeg-release-essentials.zip**
3. Unzip it to `C:\ffmpeg`
4. Add ffmpeg to your PATH:
   - Press the Windows key and search **"Environment Variables"**
   - Click **"Edit the system environment variables"**
   - Click **"Environment Variables"**
   - Under **System Variables**, find **"Path"** → click **Edit** → click **New**
   - Type `C:\ffmpeg\bin` → click OK on all windows
5. Open a **new** Command Prompt window and verify:
```
ffmpeg -version
```

> **Note:** You only need the core ffmpeg binary. You do not need to download all the optional codec packs.

---

### Step 3 — Set up the worker

#### Option A — From the GitHub repository (recommended)
The worker files are in the `worker/` folder of the `add-life-to-your-years` GitHub repository (github.com/Sarva311260/add-life-to-your-years).

Clone or download the repository, then navigate to the `worker/` folder.

#### Option B — Download the zip directly
Download the worker zip from the admin panel or from the link provided separately.

Right-click the zip → Extract All → extract to your Desktop.

---

### Step 4 — Install worker dependencies

**Mac:** Open Terminal and run:
```
cd /path/to/worker/folder
npm install
```

**Windows:** Open Command Prompt and run:
```
cd %USERPROFILE%\Desktop\worker
npm install
```

---

## Running the Worker

Every time you want to upload videos to YouTube, open Terminal (Mac) or Command Prompt (Windows) and run:

```
node video-worker.mjs
```

Leave the window open. You should see:
```
🎬 Video worker started. Polling every 30 seconds...
```

The worker will:
- Check for new jobs every 30 seconds (you'll see dots: `....`)
- When you click "Upload to YouTube" in the admin panel, it picks up the job automatically
- Encodes the MP4 with ffmpeg (takes 1–3 minutes depending on audio length)
- Uploads to YouTube (takes 1–5 minutes depending on file size)
- Shows `✅ Done!` with the YouTube URL when complete

Press **Ctrl+C** to stop the worker.

---

## How to Use

1. Start the worker (see above)
2. Go to https://addlifetoyouryears.org/pemf-admin
3. Log in and go to the **Blog Posts** tab
4. Find a post with audio generated (green audio icon)
5. Click **"Upload to YouTube"**
6. Watch the Terminal/Command Prompt — the worker will pick it up within 30 seconds

The admin panel will show a progress bar and "Published to YouTube!" when done.

---

## Troubleshooting

**"Cannot reach addlifetoyouryears.org"**
→ Check your internet connection

**"No YouTube tokens found"**
→ Go to the admin panel → Blog Posts → click "Connect YouTube" and authorise

**"ffmpeg not found"**
→ Mac: `brew install ffmpeg`
→ Windows: Make sure `C:\ffmpeg\bin` is in your PATH (see Step 2 above) and open a **new** Command Prompt window after adding it

**"Upload failed: 403"**
→ Your YouTube OAuth token may have expired. Go to admin panel → Connect YouTube again.

---

## Notes

- The worker only runs while your computer is on and the Terminal/Command Prompt window is open
- You can close and reopen the window anytime — pending jobs will be picked up when you restart
- The worker is safe to run multiple times (it won't double-upload)
- You do not need to keep the worker running all the time — only run it when you want to upload videos
