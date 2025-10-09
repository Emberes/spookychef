# SpookyChef — Projekt README

En Next.js-webbapp som föreslår **ett recept** utifrån vad du har hemma — presenterat av en slumpad **skräckfilms-inspirerad persona**. Fokus på **humor > gore**, **PG-16**, och **recept only** (även för "tysta" personas).

## 🎃 Snabbstart

⚠️ **Viktigt:** På vissa system installeras inte Tailwind CSS automatiskt. Se `INSTALLATION.md` för detaljerade instruktioner.

```bash
# Installera beroenden
npm install

# Installera Tailwind CSS manuellt (om det behövs)
npm install tailwindcss@3.4.1 postcss@8.4.35 autoprefixer@10.4.17 --force

# Kopiera env-exempel och fyll i din Gemini API-nyckel
cp .env.local.example .env.local
# Redigera .env.local och lägg till:
# GEMINI_API_KEY=din_gemini_api_nyckel

# Starta dev-server
npm run dev
```

Öppna [http://localhost:3000](http://localhost:3000)

**Problem med installation?** Se `INSTALLATION.md` för alternativa metoder.

## 📋 Stack

- **Next.js 15** (TypeScript, App Router)
- **Tailwind CSS** (Dark mode)
- **Gemini AI** via `@google/generative-ai`
- **Zod** för schema-validering
- **Lucide React** för ikoner
- In-memory data (JSON-filer i repo)

## 🗂️ Projektstruktur

```
spookychef/
├── app/
│   ├── api/
│   │   ├── search/route.ts       # Söker kandidat-recept
│   │   └── generate/route.ts     # Genererar persona-recept
│   ├── layout.tsx
│   ├── page.tsx                  # Huvudsida
│   └── globals.css
├── components/
│   ├── RecipeForm.tsx            # Input-formulär
│   └── RecipeCard.tsx            # Receptvisning
├── lib/
│   ├── schema.ts                 # Zod schemas
│   ├── normalize.ts              # Ingrediens-normalisering
│   ├── filters.ts                # Diet/allergi-filter
│   └── utils.ts                  # Utility-funktioner
├── data/
│   ├── recipes_seed.json         # Recept-korpus
│   ├── ingredient_aliases.json   # Ingrediens-alias
│   └── personas_pool.json        # Persona-metadata
├── docs/                         # Projektdokumentation
├── .env.local.example
├── package.json
└── README.project.md
```

## 🔑 Miljövariabler

Skapa `.env.local` baserat på `.env.local.example`:

```
GEMINI_API_KEY=din_gemini_api_nyckel_här
IMAGE_API_KEY=valfritt_för_bildgenerering
```

**Viktigt:** Checka aldrig in riktiga API-nycklar!

## 🚀 Kommandon

```bash
npm run dev      # Starta dev-server på http://localhost:3000
npm run build    # Bygg för produktion
npm run start    # Kör produktions-build
npm run lint     # Kör ESLint
```

## 🎭 Funktioner

### Kärnflöde
1. **Random persona per chatt** - Väljs slumpmässigt vid start
2. **Ingrediens-input** - Användaren anger ingredienser, diet och allergier
3. **Sökning** - Viktad Jaccard-matchning mot recept-korpus
4. **LLM-generering** - Gemini skapar persona-anpassat recept
5. **Validering** - Zod validerar JSON, diet/allergi-filter körs
6. **UI** - Visa recept med IMDb-länk till persona

### Personas (12 st i poolen)
- Ghostface, Pennywise, Freddy Krueger, Chucky
- Michael Myers (tyst), Jason Voorhees (tyst)
- Beetlejuice, Jigsaw
- Hannibal Lecter, Sweeney Todd
- Dracula, Frankenstein's Monster (public domain)

### Säkerhetsfunktioner
- **PG-16 guardrails** - Ingen grafisk våld eller kroppsliga referenser
- **Parodi/inspirerad ton** - Inga direkta citat (quotePolicy: paraphrase_only)
- **Tysta personas** - Inga personaLines för Myers/Jason
- **Diet/allergi-filter** - Blockerar otillåtna ingredienser
- **Fallback** - Vid LLM-fel, visa baslinje-recept

## 🧪 API-kontrakt

### POST `/api/search`
**Body:**
```json
{
  "ingredients": ["pasta", "tomat", "vitlök"],
  "diet": ["veg"],
  "allergies": []
}
```

**Response:**
```json
{
  "candidate": { "id": "...", "title": "...", ... },
  "candidatesTried": ["id1", "id2", "id3"]
}
```

### POST `/api/generate`
**Body:**
```json
{
  "candidate": { "id": "...", ... },
  "chatId": "abc123",
  "diet": ["veg"],
  "allergies": []
}
```

**Response:**
```json
{
  "personaId": "ghostface",
  "title": "Meta-tomatpasta",
  "timeMinutes": 20,
  "difficulty": "lätt",
  "dietTags": ["veg"],
  "nutrition": { "kcal": 620, "protein_g": 18 },
  "ingredients": [...],
  "steps": [...],
  "personaLines": ["..."],
  "persona": {
    "id": "ghostface",
    "displayName": "Ghostface",
    "imdbUrl": "https://www.imdb.com/..."
  }
}
```

## 📚 Dokumentation

Se `docs/` för detaljerad dokumentation:
- `blueprint_spooky_chef_v_2_mvp_spec.md` - MVP-specifikation
- `plan.md` - Gemini AI-implementation
- `TODO-SpookyChef.md` - Utvecklings-checklista
- `reflektioner_kring_projektet_spooky_chef.md` - Design-reflektioner

## 🔄 Deploy (Vercel)

1. Skapa nytt projekt i Vercel
2. Koppla till GitHub-repo
3. Lägg till miljövariabler: `GEMINI_API_KEY`
4. Deploy!

Vercel detekterar automatiskt Next.js och kör `npm run build`.

## ✅ Uppfyllt från TODO

### MVP-krav
- ✅ Next.js med TypeScript, Tailwind, App Router
- ✅ Random persona per chatt (12 personas)
- ✅ Ingrediens-input med diet/allergi-val
- ✅ `/api/search` - Viktad Jaccard-matchning
- ✅ `/api/generate` - Gemini AI-integrering
- ✅ Zod-validering med retry-logik
- ✅ Deterministiskt diet/allergi-filter efter LLM
- ✅ IMDb-länk i persona-header
- ✅ "Generera om" och "Kopiera recept"-funktioner
- ✅ Dark theme med skelett-loading
- ✅ Fullständig dokumentation

### Data
- ✅ 1000 recept i seed-korpus (varierade kök, dietkrav, svårighetsgrader)
- ✅ 53 ingrediens-alias
- ✅ 55 personas (massiv variation från klassisk horror till whimsical)

### Säkerhet & etik
- ✅ PG-16 guardrails
- ✅ Parodi/inspirerad ton (inga direkta citat)
- ✅ Tysta personas (Myers, Jason) - inga personaLines
- ✅ Strikt diet/allergi-kontroll
- ✅ Fallback vid LLM-fel

## 🎯 Exempel-användning

1. Öppna appen
2. Ange ingredienser: "pasta, tomat, vitlök"
3. Välj diet: "veg"
4. Klicka "Generera recept"
5. Få ett recept från en slumpad persona (t.ex. Ghostface)
6. Se IMDb-länk, kopiera recept, eller generera om

## 🚧 Framtida förbättringar (ej i MVP)

- Embeddings-index för semantisk sökning
- Bildgenerering per recept
- Inloggning och favoriter
- Inköpslista-funktion
- Fler personas (20+)
- A/B-test av prompter
- Vektor-databas (pgvector/Supabase)

## 📄 Licens

Skolprojekt (ej kommersiellt bruk). Alla tredjepartsnamn/figurer används i **parodi/inspirationssyfte** utan direkta citat.

## 👥 Skapare

Projekt för Chas Academy - Utbildning i webbutveckling

---

**Deadline:** 20 oktober 2024, 23:59
**Status:** ✅ MVP Komplett
