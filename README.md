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
   - Set **Branch** to `gh-pages` and folder to **/ (root)**, then Save
   - (The first workflow run will create the `gh-pages` branch.)

2. **Push to deploy**:
   - Push to the `main` branch (or run **Deploy to GitHub Pages** manually from the **Actions** tab).
   - The workflow builds the app with the correct base path and pushes the result to the `gh-pages` branch.

3. **Your site** will be at:
   - `https://<username>.github.io/my-itemz/`  
     Example: if your GitHub username is `johndoe`, the app is at `https://johndoe.github.io/my-itemz/`.

### Option 2: Manual build and deploy

1. **Set the base path** for your repo (required for project sites):

   ```bash
   BASE_PATH=/my-itemz/ npm run build
   ```

2. **Deploy the `dist/` folder**:
   - Use the **gh-pages** package: `npx gh-pages -d dist`
   - In **Settings → Pages**, set source to the `gh-pages` branch.

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
