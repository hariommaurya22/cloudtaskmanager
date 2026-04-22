# CloudTask Manager

A cloud-based task management web application built as a college mini project to demonstrate key cloud computing concepts using a modern tech stack deployed on Netlify.

## What it does

- **Authentication** — sign up and log in with email/password (stored in browser localStorage)
- **Task Management** — create, edit, delete, and mark tasks as complete
- **Priority Levels** — tag tasks as Low, Medium, or High priority
- **Filtering** — view All, Pending, or Completed tasks
- **Dashboard Stats** — live count of total, completed, and pending tasks
- **Cloud Concepts Panel** — explains IaaS, PaaS, DBaaS, and SECaaS directly in the UI

## Cloud Concepts Mapped

| Concept | Implementation |
|---------|---------------|
| **IaaS** | Netlify provides servers, CDN, and networking infrastructure |
| **PaaS** | Netlify auto-builds and deploys from source — no server config needed |
| **DBaaS** | `localStorage` simulates a managed cloud database (Firebase / Netlify Blobs in production) |
| **SECaaS** | Auth system simulated locally; Netlify Identity in production |
| **Storage as a Service** | Static assets served from Netlify's global CDN |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | TanStack Start (React 19 + Vite 7) |
| Routing | TanStack Router v1 (file-based) |
| Styling | Tailwind CSS 4 |
| Icons | Lucide React |
| Language | TypeScript 5.7 (strict) |
| Deployment | Netlify |

## Project Structure

```
src/
  routes/
    __root.tsx       # Root layout (title, global styles)
    index.tsx        # Task dashboard (protected)
    login.tsx        # Login / signup page
  styles.css         # Global Tailwind styles

public/
  standalone/
    index.html       # Standalone HTML reference version
    style.css        # Standalone CSS
    script.js        # Standalone JavaScript
```

The `public/standalone/` folder contains a self-contained HTML/CSS/JS version of the same app — useful for beginners or as a Netlify drag-and-drop deploy.

## Running Locally

```bash
npm install
npm run dev        # starts dev server on http://localhost:3000
```

### Netlify CLI (recommended)

```bash
npm install -g netlify-cli
netlify dev        # starts on http://localhost:8888 with full Netlify feature emulation
```

## Deploying to Netlify

### Option A — Netlify UI (drag-and-drop the standalone version)

1. Go to [app.netlify.com](https://app.netlify.com) → **Add new site** → **Deploy manually**
2. Drag the `public/standalone/` folder onto the deploy area
3. Done — your site is live in seconds

### Option B — Git-connected deploy (full TanStack Start app)

1. Push this repo to GitHub/GitLab
2. In Netlify: **Add new site** → **Import from Git**
3. Build command: `npm run build`
4. Publish directory: `dist/client`
5. Click **Deploy site**

Netlify auto-detects the `netlify.toml` configuration in the repo.

### Option C — Netlify CLI

```bash
netlify login
netlify init       # link to a Netlify site
netlify deploy --prod
```

## Notes for Presentation

- Open the app, sign up with any email/password, then add a few tasks.
- Show the filter tabs (All / Pending / Completed) and the priority badges.
- Scroll to the **Cloud Computing Concepts** panel at the bottom of the dashboard and walk through each concept.
- Open DevTools → Application → Local Storage to show DBaaS simulation in action.
