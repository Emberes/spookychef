# 🎃 SpookyChef - Snabbstart

## 1️⃣ Installera dependencies

```bash
npm install
```

## 2️⃣ Fixa Tailwind CSS (om det behövs)

Kör detta kommando om `npm run build` klagar på att den inte hittar tailwindcss:

```bash
npm install tailwindcss@3.4.1 postcss@8.4.35 autoprefixer@10.4.17 --force
```

## 3️⃣ Skapa .env.local

```bash
cp .env.local.example .env.local
```

Redigera `.env.local` och lägg till din Gemini API-nyckel:
```
GEMINI_API_KEY=din_api_nyckel_här
```

**Få en API-nyckel:**
- Gå till https://makersuite.google.com/app/apikey
- Skapa en ny API-nyckel
- Kopiera och klistra in i .env.local

## 4️⃣ Kör projektet

```bash
npm run dev
```

Öppna http://localhost:3000

## 5️⃣ Testa!

1. Skriv ingredienser: `pasta, tomat, vitlök`
2. Välj diet: `veg`
3. Klicka "Generera recept"
4. Få ett recept från en random horror-persona! 🎃

## 📝 Exempel på input

**Enkelt:**
- Ingredienser: `pasta, tomat, vitlök`
- Diet: veg

**Mer avancerat:**
- Ingredienser: `kyckling, ris, curry, kokosmjölk`
- Diet: glutenfri
- Allergier: nötter

**Vegan:**
- Ingredienser: `kikärtor, spenat, tomat`
- Diet: vegan

## 🐛 Problem?

### "Cannot find module 'tailwindcss'"
```bash
npm install tailwindcss@3.4.1 --force
```

### "GEMINI_API_KEY not configured"
Kolla att `.env.local` finns och innehåller din API-nyckel

### Fortfarande problem?
Se `INSTALLATION.md` för alternativa lösningar

## 🚀 Deploy till Vercel (rekommenderat!)

1. Push till GitHub
2. Gå till vercel.com
3. Importera ditt repo
4. Lägg till environment variable: `GEMINI_API_KEY`
5. Deploy!

Vercel installerar Tailwind korrekt automatiskt.

---

**Har du frågor?** Läs `README.project.md` eller `PROJEKTSTATUS.md`
