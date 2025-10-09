# SpookyChef - Installation & Setup Guide

## ⚠️ Viktigt! Installation av Tailwind CSS

Det finns ett känt problem med npm som inte installerar `tailwindcss` korrekt från package.json på vissa system. Följ dessa steg för att installera projektet:

### Steg 1: Installera grundläggande dependencies
```bash
npm install
```

### Steg 2: Installera Tailwind CSS manuellt
```bash
npm install tailwindcss@3.4.1 postcss@8.4.35 autoprefixer@10.4.17 --force
```

Eller använd denna alternativa metod:
```bash
# Ta bort node_modules och package-lock.json
rm -rf node_modules package-lock.json

# Installera allt på en gång med force
npm install next@14 react@18 react-dom@18 typescript @types/node @types/react @types/react-dom @google/generative-ai zod clsx tailwind-merge class-variance-authority lucide-react eslint eslint-config-next tailwindcss@3.4.1 postcss@8.4.35 autoprefixer@10.4.17 --force
```

### Steg 3: Verifiera installation
```bash
ls node_modules/tailwindcss
```
Du ska se massa filer som `CHANGELOG.md`, `LICENSE`, `lib/`, etc.

### Steg 4: Kopiera miljövariabler
```bash
cp .env.local.example .env.local
```

Redigera `.env.local` och lägg till din Gemini API-nyckel:
```
GEMINI_API_KEY=din_api_nyckel_här
```

### Steg 5: Kör projektet
```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

## 🔧 Om Tailwind inte installeras

Om `tailwindcss` fortfarande inte finns i `node_modules` efter installation, kan du:

1. **Använd yarn istället för npm:**
```bash
yarn install
yarn add -D tailwindcss@3.4.1 postcss@8.4.35 autoprefixer@10.4.17
```

2. **Eller installera från tarball:**
```bash
npm pack tailwindcss@3.4.1
tar -xzf tailwindcss-3.4.1.tgz
mkdir -p node_modules/tailwindcss
cp -r package/* node_modules/tailwindcss/
rm -rf package tailwindcss-3.4.1.tgz
```

3. **Eller använd pnpm:**
```bash
pnpm install
pnpm add -D tailwindcss@3.4.1
```

## 📚 Projektstruktur

Alla filer är färdiga:
- ✅ API routes (`/api/search`, `/api/generate`)
- ✅ Frontend components (RecipeForm, RecipeCard)
- ✅ Data files (recipes, personas, aliases)
- ✅ Type schemas och validering
- ✅ Normalisering och filter-logik
- ✅ Dark theme styling

## 🎯 Snabbtest

Efter installation, testa att allt fungerar:

```bash
# Kör dev server
npm run dev

# Öppna http://localhost:3000
# Testa med: "pasta, tomat, vitlök" + diet: "veg"
```

## ❓ Felsökning

### "Cannot find module 'tailwindcss'"
Kör: `npm install tailwindcss@3.4.1 --force`

### "Failed to compile"
Kontrollera att `tailwindcss`, `postcss`, och `autoprefixer` finns i node_modules

### "GEMINI_API_KEY not configured"
Skapa `.env.local` och lägg till din API-nyckel

## 🚀 Deploy till Vercel

```bash
# Push till GitHub
git add .
git commit -m "Initial commit"
git push

# I Vercel:
# 1. Importera GitHub repo
# 2. Lägg till env variable: GEMINI_API_KEY
# 3. Deploy
```

Vercel kommer automatiskt installera dependencies korrekt.
