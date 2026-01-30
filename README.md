# MyItemz

Mobile-first, dark-mode web app to manage items you own and want to sell. Built with React (Vite), TypeScript, and Tailwind. Data is stored in the browser’s **localStorage** (no backend).

## Features

- **Items**: Add, edit, delete items with name, price, category, currency (USD/ILS/EUR), and “want to sell” flag
- **Wizard**: Step-by-step item creation (name → category → price & currency → want to sell)
- **Categories**: Manage categories with name, color, and icon
- **Insights**: Total value, sellable value, per-category breakdown; filters (category, for sale, price range, search)
- **UI**: Dark mode, mobile-first, bottom nav, FAB, toasts, modals

## Prerequisites

- Node.js 18+
- Git

## Local development

```bash
npm install
npm run dev
```

App runs at `http://localhost:5173`.

## Build

```bash
npm run build
```

Output is in `dist/`.

## Deploy to GitHub Pages

### Option 1: GitHub Actions (recommended)

1. **Enable GitHub Pages** in your repo:
   - Go to **Settings → Pages**
   - Under **Build and deployment**, set **Source** to **Deploy from a branch**
   - Set **Branch** to `gh-pages` (not `main`) and folder to **/ (root)**, then Save
   - **Important:** The site must be served from the `gh-pages` branch (where the workflow pushes the built app). If you use `main`, the browser will load the source `index.html` and get 404s for `/src/main.tsx`.
   - (The first workflow run will create the `gh-pages` branch.)

2. **Push to deploy**:
   - Push to the `main` branch (or run **Deploy to GitHub Pages** manually from the **Actions** tab).
   - The workflow builds the app with the correct base path and pushes the result to the `gh-pages` branch.

3. **Your site** will be at:
   - `https://<username>.github.io/my-itemz/`  
     Example: if your GitHub username is `johndoe`, the app is at `https://johndoe.github.io/my-itemz/`.

### Option 2: Deploy from your machine (npm scripts)

1. **Enable GitHub Pages** (same as above): **Settings → Pages** → **Deploy from a branch** → branch **`gh-pages`**.

2. **Build for GitHub Pages** (base path `/my-itemz/`):

   ```bash
   npm run build:pages
   ```

3. **Build and deploy in one step** (pushes `dist/` to the `gh-pages` branch):
   ```bash
   npm run deploy
   ```
   Requires the `gh-pages` package (already in devDependencies). The first run may prompt for GitHub auth.

No API or environment variables are required; everything runs in the browser with localStorage.

## Project structure

```
src/
  components/   # BottomNav, FAB, Toast, Modal, Card
  pages/        # Home, AddItemWizard, ItemDetail, CategoryManagement, Statistics, Insights
  hooks/        # useItems, useCategories, useStats, useInsightsStats
  services/     # dataService (localStorage)
  utils/        # currency formatting
  types/
.github/
  workflows/
    deploy.yml  # GitHub Actions deploy to Pages
```

## License

MIT
