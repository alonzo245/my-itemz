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
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`.

## Build

```bash
cd frontend
npm run build
```

Output is in `frontend/dist/`.

## Deploy to GitHub Pages

### Option 1: GitHub Actions (recommended)

1. **Enable GitHub Pages** in your repo:
   - Go to **Settings → Pages**
   - Under **Build and deployment**, set **Source** to **GitHub Actions**

2. **Push the workflow** (already in this repo):
   - `.github/workflows/deploy.yml` builds the frontend with the correct base path and deploys to GitHub Pages.
   - Push to the `main` branch (or run the workflow manually from the **Actions** tab).

3. **Your site** will be at:
   - `https://<username>.github.io/<repo-name>/`  
     Example: if the repo is `my-stuff`, the app is at `https://username.github.io/my-stuff/`.

### Option 2: Manual build and deploy

1. **Set the base path** for your repo (required for project sites):

   ```bash
   cd frontend
   BASE_PATH=/YOUR_REPO_NAME/ npm run build
   ```

   Example: `BASE_PATH=/my-stuff/ npm run build`

2. **Deploy the `frontend/dist/` folder**:
   - Use the **gh-pages** package: `npx gh-pages -d frontend/dist`
   - Or push `dist` contents to a `gh-pages` branch.
   - In **Settings → Pages**, set source to the `gh-pages` branch (or the branch/folder you use).

No API or environment variables are required; everything runs in the browser with localStorage.

## Project structure

```
frontend/
  src/
    components/   # BottomNav, FAB, Toast, Modal, Card
    pages/        # Home, AddItemWizard, ItemDetail, CategoryManagement, Statistics, Insights
    hooks/        # useItems, useCategories, useStats, useInsightsStats
    services/     # dataService (localStorage)
    utils/        # currency formatting
    types/
.github/
  workflows/
    deploy.yml    # GitHub Actions deploy to Pages
```

## License

MIT
