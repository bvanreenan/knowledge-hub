# Beverly's Knowledge Hub — Setup Guide

## What You're Building

A personal portfolio + blog site that:
- Displays your professional profile, expertise, and contact info
- Has a "Thought Lab" blog powered by Firebase (posts persist for all visitors)
- Has a password-protected admin panel for publishing/deleting posts
- Deploys on Vercel with your own URL

---

## PART 1: Set Up Firebase (Your Database)

### Step 1: Create a Firebase Project

1. Go to **https://console.firebase.google.com**
2. Click **"Create a project"** (or "Add project")
3. Name it something like `beverly-knowledge-hub`
4. You can **disable** Google Analytics (not needed) → Click **Create Project**
5. Wait for it to finish, then click **Continue**

### Step 2: Add a Web App

1. On the project overview page, click the **web icon** `</>` (it says "Add app")
2. Give it a nickname: `knowledge-hub-web`
3. **Check** the box for "Also set up Firebase Hosting" → select your project
4. Click **Register app**
5. You'll see a code block with your Firebase config. It looks like this:

```
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "beverly-knowledge-hub.firebaseapp.com",
  projectId: "beverly-knowledge-hub",
  storageBucket: "beverly-knowledge-hub.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

6. **COPY THESE VALUES** — you'll need them in Part 3. You can also find them later under Project Settings (gear icon) → General → Your Apps.
7. Click through the remaining setup steps (you can skip them — we're using Vercel, not Firebase Hosting).

### Step 3: Enable Anonymous Authentication

1. In the Firebase console sidebar, click **Build → Authentication**
2. Click **Get started**
3. Go to the **Sign-in method** tab
4. Click **Anonymous**
5. **Enable** it → Click **Save**

This lets visitors read your blog without creating accounts.

### Step 4: Create Firestore Database

1. In the sidebar, click **Build → Firestore Database**
2. Click **Create database**
3. Choose a location close to you (e.g., `us-central1` for Utah)
4. Start in **production mode** → Click **Create**

### Step 5: Set Firestore Security Rules

1. In Firestore, click the **Rules** tab
2. **Replace** ALL the existing rules with this:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Anyone can read posts
    match /posts/{postId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

3. Click **Publish**

> **Note:** These rules let any authenticated user (including anonymous) read AND write posts. This is fine for a personal site. If you want to restrict writing to only yourself later, we can tighten these rules — just ask!

---

## PART 2: Push Code to GitHub

Since PowerShell is disabled on your computer, you'll use GitHub's web interface.

### Step 1: Create a New Repository

1. Go to **https://github.com** and sign in
2. Click the **+** icon (top right) → **New repository**
3. Name it `knowledge-hub` (or whatever you like)
4. Set it to **Public** (Vercel free tier requires public repos)
5. **DO NOT** initialize with README, .gitignore, or license
6. Click **Create repository**

### Step 2: Upload Your Project Files

1. On your new empty repo page, click **"uploading an existing file"** link
2. You'll need to upload the project files. Drag the entire folder contents into the upload area.

**The files you need to upload are:**

```
index.html
package.json
vite.config.js
tailwind.config.js
postcss.config.js
.gitignore
src/
  main.jsx
  index.css
  firebase.js
  App.jsx
```

> **Important:** GitHub's web upload doesn't support folders directly. You have two options:
>
> **Option A (Recommended):** Use **GitHub Desktop** (a GUI app, no PowerShell needed):
>   1. Download from https://desktop.github.com
>   2. Sign in with your GitHub account
>   3. Clone your new repo
>   4. Copy all project files into the cloned folder
>   5. Commit and push
>
> **Option B:** Upload files one at a time via the web:
>   1. Upload the root files first (index.html, package.json, etc.)
>   2. Click "Add file" → "Create new file"
>   3. Type `src/main.jsx` as the filename (typing the `/` creates the folder)
>   4. Paste the file contents
>   5. Repeat for `src/index.css`, `src/firebase.js`, `src/App.jsx`

---

## PART 3: Deploy on Vercel

### Step 1: Connect GitHub to Vercel

1. Go to **https://vercel.com** and sign in (use "Continue with GitHub")
2. Click **"Add New..."** → **Project**
3. Find and click **Import** next to your `knowledge-hub` repository

### Step 2: Configure the Project

1. **Framework Preset:** Vercel should auto-detect "Vite" — if not, select it
2. **Root Directory:** Leave as `/` (default)
3. **Build Command:** `npm run build` (should be auto-filled)
4. **Output Directory:** `dist` (should be auto-filled)

### Step 3: Add Environment Variables

This is the critical step — you're connecting Firebase to your site.

1. Expand **"Environment Variables"**
2. Add each of the following, one at a time. The **Key** goes in the left box, the **Value** (from your Firebase config in Part 1, Step 2) goes in the right box:

| Key | Value (example — use YOUR values) |
|-----|-----------------------------------|
| `VITE_FIREBASE_API_KEY` | `AIzaSy...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `beverly-knowledge-hub.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `beverly-knowledge-hub` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `beverly-knowledge-hub.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `123456789` |
| `VITE_FIREBASE_APP_ID` | `1:123456789:web:abc123` |

3. Click **Deploy**

### Step 4: Wait for Build

Vercel will install dependencies, build your site, and deploy it. This takes 1-2 minutes. When it's done, you'll see a celebration screen with your live URL!

Your site will be at something like: `https://knowledge-hub-yourusername.vercel.app`

---

## PART 4: Using Your Site

### Logging in as Admin

1. Visit your live site
2. Scroll to the footer
3. Click the **"Admin"** link (it's faint — by design)
4. Enter the password: `bev2026`
5. You'll see "Admin Active" and a "New Analysis" button appears on the blog page

### Publishing a Post

1. Log in as admin (above)
2. Go to **The Thought Lab** tab
3. Click **"+ New Analysis"**
4. Fill in the fields and click **"Publish to Thought Lab"**
5. Your post appears immediately for all visitors!

### Deleting a Post

1. While logged in as admin, a red delete button appears on each post card
2. Click it and confirm

### Changing the Admin Password

1. In `src/App.jsx`, find this line near the top:
   ```
   const ADMIN_PASSWORD = "bev2026";
   ```
2. Change `"bev2026"` to your desired password
3. Commit the change to GitHub — Vercel will auto-redeploy

---

## Optional: Custom Domain

If you want a custom domain like `beverlyvanreenan.com`:

1. Purchase a domain (Namecheap, Google Domains, Cloudflare, etc.)
2. In Vercel, go to your project → **Settings → Domains**
3. Add your domain and follow the DNS instructions

---

## Troubleshooting

**"Firebase error" in the console:**
- Double-check all 6 environment variables in Vercel match your Firebase config exactly
- Make sure Authentication → Anonymous sign-in is **enabled**
- Make sure Firestore rules are published

**Blog shows "Loading..." forever:**
- Check that Firestore Database was created
- Verify the security rules were published

**Posts won't save:**
- Check Firestore rules allow `write` for authenticated users
- Check browser console (F12) for specific error messages

**Build fails on Vercel:**
- Check the build log for the specific error
- Make sure all files are uploaded correctly (especially the `src/` folder structure)

**Need to redeploy:**
- Any push to your GitHub repo automatically triggers a new Vercel deployment
