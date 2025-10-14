# SpookyChef — Projekt README

En Next.js-webbapp som genererar **kompletta recept från scratch** baserat på dina ingredienser — presenterat av en slumpad **skräckfilms-inspirerad persona**. Fokus på **humor > gore**, **PG-16**, och AI-driven kreativitet.

## ⚙️ Projektöversikt

Vår app använder **Google Gemini API** som **LLM** för att generera kompletta recept i strikt JSON, i en PG-16, parodi-/inspirerad persona-stil.

Projektet är byggt **“AI-first”**: vi har använt **GitHub Copilot CLI** för koden, ChatGPT för planering och struktur (inkl. promptdesign) och **Gemini API** för själva receptgenereringen, med målet att minimera handskriven kod.

Vi använder ingen **RAG/embeddings** i denna version, eftersom vi vill generera nya recept på förfrågan utifrån användarens aktuella ingredienser (i stället för att återanvända förlagor). Bildgenerering kompletteras via **Pollinations.AI.**

## 🧠 Projektreflektioner (Godkänt)

### Vilken ny AI-teknik/bibliotek identifierade ni och hur tillämpade ni det?

Vi identifierade **Google Gemini API (2.5-flash-lite)** som ny teknik och använder det för att generera recept **on-the-fly** utifrån användarens ingredienser, diet och allergier i en **PG-16, parodi-/inspirerad persona-stil**. Flödet bygger på _systemInstruction_ + _responseSchema_ för strikt **JSON**, **Zod-validering** (1 retry + fallback) och **streaming**, samt en efterkontroll som stoppar allergener. Som komplement genererar **Pollinations.AI** matbilder från en prompt baserad på det slutliga receptet.

### Motivering av val av AI-teknik/bibliotek

Vi valde **Google Gemini API** för **snabb och kostnadseffektiv** generering med **bra stöd för strukturerad utdata** och **streaming** som passar vår realtids-UX. **Dessutom valde vi Gemini på lärarens rekommendation och för att det kan användas utan kostnader i vår kontext, vilket gjorde det möjligt att testa och iterera genom hela kursen.** Med **tydliga regler i prompten** (PG-16, parodi-ton, inga direkta citat, _endast recept_), **Zod-validering** och allergen-efterkontroll får vi stabila JSON-svar. Vi avstod **RAG/embeddings** eftersom vi vill **skapa nya recept på plats** utifrån användarens aktuella ingredienser. **Pollinations.AI** valdes för att det är enkelt att integrera **utan API-nyckel** och kan bytas ut fristående från LLM-flödet.

### Varför behövdes AI-komponenten? Kunde det lösts utan AI?

AI behövdes för att **skapa nya, kompletta recept i realtid** med rimliga mängder, tider, steg och **persona-anpassad ton** från fria ingredienslistor och valda dieter/allergier—något som är svårt att nå med hårdkodade regler. Utan AI hade vi behövt ett **stort, manuellt kuraterat receptlager**, avancerad sök/regel-logik (synonymer, substitutioner, matchningsnivåer) och **textmallar** som fylls i automatiskt, vilket blir **stelare, mer underhållstungt och mindre dynamiskt**.

## 🏅 Projektreflektioner (Väl Godkänt)

### Tillämpning av AI-komponenten

Vi använder Google Gemini API med ett flöde som ger strikt JSON via responseSchema, validerar med Zod och strömmar svaret för en följsam realtidsupplevelse. Vid behov hanteras fel med en enkel retry och Markdown-sanitering, och under genereringen skickas en tidig bild-URL så att Pollinations.ai-bilden kan laddas parallellt. Efter AI-svaret kör vi deterministiska diet- och allergifilter och justerar felaktiga dietTags, samtidigt som vi håller oss till PG-16 och en parodi-/inspirerad persona-stil utan direkta citat. Sammantaget visar detta att vi inte bara anropar en LLM, utan applicerar den kontrollerat och robust.

### Avgörande om varför AI är lämpligt

Vi har medvetet valt bort RAG/embeddings eftersom målet är att skapa nya recept on-the-fly utifrån användarens aktuella ingredienser, snarare än att återanvända förlagor. Direkt generering med Gemini passar projektets kreativa och persona-drivna mål, förenklar arkitekturen och gör MVP:n snabbare att bygga och iterera på. Detta visar ett moget omdöme kring när AI är rätt verktyg och hur det ska tillämpas i just den här kontexten.

## 🎃 Snabbstart

```bash
# Installera beroenden
npm install

# Skapa .env och lägg till din Gemini API-nyckel
cp .env.example .env
# Redigera .env:
# GEMINI_API_KEY=din_gemini_api_nyckel

# Starta dev-server
npm run dev
```

Öppna [http://localhost:3000](http://localhost:3000)

## 📋 Stack

- **Next.js 14** (TypeScript, App Router)
- **Tailwind CSS** (Dark mode)
- **Gemini AI** (2.5-flash-lite) - Receptgenerering med systemInstruction + responseSchema
- **Pollinations.ai** - Bildgenerering
- **Zod** - Schema-validering
- **Lucide React** - Ikoner

## 🗂️ Projektstruktur

```
spookychef/
├── app/
│   ├── api/
│   │   └── generate/route.ts      # LLM-generering med streaming
│   ├── layout.tsx
│   ├── page.tsx                   # Huvudsida
│   └── globals.css
├── components/
│   ├── RecipeForm.tsx             # Input-formulär
│   ├── RecipeCard.tsx             # Receptvisning
│   └── RecipeLoadingSkeleton.tsx  # Loading state
├── lib/
│   ├── schema.ts                  # Zod schemas
│   ├── normalize.ts               # Ingrediens-normalisering
│   ├── filters.ts                 # Diet/allergi-filter
│   └── utils.ts                   # Utility-funktioner
├── data/
│   ├── ingredient_aliases.json    # Ingrediens-alias (17 viktiga)
│   └── personas_pool_iconic.json  # 31 personas med IMDb-länkar
├── docs/                          # Projektdokumentation
│   ├── blueprint_spooky_chef_v_2_mvp_spec.md
│   ├── plan.md
│   ├── TODO-SpookyChef.md
│   └── development-logs/          # Utvecklingslogg
├── .env.example                   # Mall för environment variables
├── package.json
└── README.project.md
```

## 🔑 Miljövariabler

Skapa `.env` baserat på `.env.example`:

```bash
cp .env.example .env
```

Lägg till din Gemini API-nyckel:

```
GEMINI_API_KEY=din_gemini_api_nyckel_här
```

**Viktigt:** `.env` är i .gitignore och committas aldrig!

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
3. **LLM-generering** - Gemini skapar komplett recept från scratch med streaming
4. **Validering** - responseSchema + Zod + deterministiska diet/allergi-filter
5. **Bildgenerering** - Pollinations.ai genererar matbild parallellt med recept
6. **UI** - Visa recept med IMDb-länk, bild, och persona-info

### AI/LLM-implementationer

- **systemInstruction** - Cachad system-kontext (~50% snabbare, 20-30% färre tokens)
- **responseSchema** - Garanterad JSON-struktur (~100% valid output)
- **Streaming** - Real-time chunks med progressbar och aktivitetsmeddelanden
- **Tidig bildURL** - Skickas under streaming för parallell laddning (~2s snabbare)
- **Post-AI validering** - Deterministiska filter korrigerar felaktiga dietTags
- **Retry-logik** - Upp till 2 försök vid fel, markdown-sanitering som säkerhetsnät

### Personas (31 st i poolen)

- Klassiska: Ghostface, Pennywise, Freddy, Chucky, Michael Myers, Jason, etc.
- Whimsical: Beetlejuice, Jack Skellington, Wednesday Addams, Coraline
- Public domain: Dracula, Frankenstein's Monster
- **Tysta personas** får trailer-style voiceovers istället för quotes

### Säkerhetsfunktioner

- **PG-16 guardrails** - Ingen grafisk våld eller kroppsliga referenser
- **Parodi/inspirerad ton** - Inga direkta citat (quotePolicy: paraphrase_only)
- **Diet/allergi-validering** - AI-output korrigeras mot faktiska ingredienser
- **Markdown-sanitering** - Hanterar Gemini streaming edge cases

## 🧪 API-kontrakt

### POST `/api/generate`

**Body:**

```json
{
  "userIngredients": ["pasta", "tomat", "vitlök"],
  "chatId": "abc123",
  "diet": ["veg"],
  "allergies": []
}
```

**Response:** Server-Sent Events (SSE) stream

```
data: {"persona": {"id": "ghostface", "displayName": "Ghostface", ...}}
data: {"chunk": "{\"personaId\":"}
data: {"chunk": "\"ghostface\",\"title\":\"..."}
data: {"imageUrl": "https://image.pollinations.ai/..."}
...
data: {"done": true, "recipe": {...}}
```

**Färdigt recept:**

```json
{
  "personaId": "ghostface",
  "title": "Meta-tomatpasta",
  "imagePrompt": "Pasta dish with tomatoes...",
  "timeMinutes": 20,
  "difficulty": "lätt",
  "dietTags": ["veg"],
  "nutrition": { "kcal": 620, "protein_g": 18 },
  "ingredients": [...],
  "steps": [...],
  "personaLines": ["..."],
  "imageUrl": "https://image.pollinations.ai/...",
  "persona": {
    "id": "ghostface",
    "displayName": "Ghostface",
    "imdbUrl": "https://www.imdb.com/..."
  }
}
```

## 📚 Dokumentation

Se `docs/` för detaljerad dokumentation:

- `blueprint_spooky_chef_v_2_mvp_spec.md` - Original MVP-specifikation
- `plan.md` - AI/LLM implementation plan
- `TODO-SpookyChef.md` - Utvecklings-checklista
- `reflektioner_kring_projektet_spooky_chef.md` - Design-reflektioner
- `development-logs/` - Utvecklingslogg och changelogs

## 🚀 Implementerat

### Kärnfunktioner

- ✅ Next.js 14 med TypeScript, Tailwind, App Router
- ✅ Random persona per chatt (31 personas)
- ✅ Ingrediens-input med diet/allergi-val
- ✅ Direkt LLM-generering (ingen RAG/embeddings - recept skapas från scratch)
- ✅ Gemini AI med systemInstruction + responseSchema
- ✅ Streaming med progressbar och dynamiska meddelanden
- ✅ Automatisk bildgenerering med Pollinations.ai
- ✅ IMDb-länkar i persona-cards
- ✅ "Generera om" och "Kopiera recept"-funktioner
- ✅ Dark theme med RecipeLoadingSkeleton
- ✅ Fullständig dokumentation med detaljerade kommentarer

### Data

- ✅ 17 viktiga ingrediens-alias (optimerat från 88 - endast kritiska för allergi/diet)
- ✅ 31 personas med profilbilder, IMDb-länkar, unique voices

### AI/LLM Optimeringar

- ✅ systemInstruction för caching (~50% snabbare)
- ✅ responseSchema för garanterad JSON (~100% valid)
- ✅ Streaming för progressiv UX
- ✅ Tidig bildURL för parallell laddning (~2s snabbare)
- ✅ Post-AI validering med deterministiska filter
- ✅ Retry-logik med markdown-sanitering
- ✅ Token-optimering (prompt utan onödig "none" text)

### Säkerhet & Kvalitet

- ✅ PG-16 guardrails i systemInstruction
- ✅ Parodi/inspirerad ton (inga direkta citat)
- ✅ Tysta personas får trailer voiceovers
- ✅ Automatisk korrigering av felaktiga dietTags
- ✅ Allergi/diet-filter som säkerhetsnät

## 🎯 Exempel-användning

1. Öppna appen
2. Ange ingredienser: "pasta, tomat, vitlök"
3. Välj diet: "veg"
4. Klicka "Generera recept"
5. Få ett recept från en slumpad persona (t.ex. Ghostface)
6. Se IMDb-länk, kopiera recept, eller generera om

## 📄 Licens

Skolprojekt (ej kommersiellt bruk). Alla tredjepartsnamn/figurer används i **parodi/inspirationssyfte** utan direkta citat.

## 👥 Skapare

Projekt för Chas Academy - Utbildning i webbutveckling

Kristoffer Larsson - [Github](https://github.com/Kristoffer-L)

Cristian Pencheff - [Github](https://github.com/cribepencheff)

Elin Suvinen - [Github](https://github.com/Emberes)

Fares Elloumi - [Github](https://github.com/Fares-elloumi)

---
