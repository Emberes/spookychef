# SpookyChef — README (projekt)

En Next.js‑webbapp som föreslår **ett recept** utifrån vad du har hemma — presenterat av en slumpad **skräckfilms‑inspirerad persona**. Fokus på **humor > gore**, **PG‑16**, och **recept only** (även för “tysta” personas).

> **Obs:** Lärarens README ligger i repo‑root som `README.md`. Den här filen är **vår projekt‑README** (föreslår namn `README.project.md`).

---

## Innehåll
- [Snabbstart](#snabbstart)
- [Stack](#stack)
- [Mappstruktur](#mappstruktur)
- [Miljövariabler](#miljövariabler)
- [Köra lokalt](#köra-lokalt)
- [API‑kontrakt](#api-kontrakt)
- [Personas & IP/etik](#personas--ipetik)
- [Datafiler](#datafiler)
- [Valfritt: Embeddings-index](#valfritt-embeddings-index)
- [Test & kvalitet](#test--kvalitet)
- [Deploy (Vercel)](#deploy-vercel)
- [Dokumentation](#dokumentation)

---

## Snabbstart
```bash
# Klona repo
git clone <repo-url> spookychef && cd spookychef

# Installera beroenden
npm install   # eller: pnpm install / yarn

# Kopiera env-exempel
cp .env.local.example .env.local
# Fyll i:
# GEMINI_API_KEY=...
# IMAGE_API_KEY=...   # valfritt om du kör bild-API

# Starta dev-server
npm run dev
```

Öppna http://localhost:3000

---

## Stack
- **Next.js** (TypeScript, App Router)
- **Tailwind CSS** + **shadcn/ui**
- **LLM**: Gemini (adapterbar så andra LLM:er kan kopplas på)
- **In-memory data** (JSON‑filer i repo), valfritt **embeddings-index** i JSON
- Deploy: **Vercel**

---

## Mappstruktur
```
spookychef/
├─ README.md                  # Lärarens README (i root)
├─ README.project.md          # Denna fil (vårt README)
├─ docs/
│  ├─ blueprint-v2.md
│  ├─ plan-gemini-v2.md
│  └─ reflektioner.md
├─ src/
│  ├─ data/
│  │  ├─ recipes_seed.json
│  │  ├─ ingredient_aliases.json
│  │  └─ personas_pool.json
│  ├─ ai/
│  │  ├─ systemPrompt.ts
│  │  ├─ schema.ts
│  │  └─ imagePrompt.ts
│  ├─ lib/
│  │  ├─ normalize.ts
│  │  └─ similarity.ts
│  └─ app/api/
│     ├─ search/route.ts
│     └─ generate/route.ts
├─ public/
├─ .env.local.example
├─ package.json
└─ tsconfig.json
```

---

## Miljövariabler
Skapa `.env.local` baserat på `.env.local.example`:
```
GEMINI_API_KEY=        # krävs för /api/generate
IMAGE_API_KEY=         # valfritt, om bild-API används
```

> **Viktigt:** Checka aldrig in riktiga nycklar.

---

## Köra lokalt
```bash
npm run dev     # startar på http://localhost:3000
npm run build   # produktionsbuild
npm run start   # kör builden lokalt
npm run lint    # lint
npm test        # om tester lagts till
```

---

## API‑kontrakt

### POST `/api/search`
**Body**
```json
{
  "ingredients": ["pasta", "tomat", "vitlök"],
  "diet": ["veg"],
  "allergies": []
}
```
**Svar**
```json
{
  "candidate": { "...": "recipe from seed" },
  "candidatesTried": ["id1","id2","id3"]
}
```
**Beskrivning**  
- Normaliserar ingredienser via alias.  
- Baslinje: **viktad Jaccard** mellan input‑ingredienser och receptens ingredienslistor.  
- Filtrerar bort recept som bryter mot `diet`/`allergies`.  
- Returnerar **1 kandidat** från seed‑korpusen.

### POST `/api/generate`
**Body**
```json
{
  "candidate": { "id":"...", "title":"...", "ingredients":[...] },
  "chatId": "abc123",
  "diet": ["veg"],
  "allergies": []
}
```
**Svar (RecipeResponse)**  
```json
{
  "personaId": "ghostface",
  "title": "Meta‑tomatpasta",
  "timeMinutes": 20,
  "difficulty": "lätt",
  "dietTags": ["veg"],
  "nutrition": { "kcal": 620, "protein_g": 18 },
  "ingredients": [
    { "name":"pasta","qty":250,"unit":"g" },
    { "name":"tomat","qty":3,"unit":"st" },
    { "name":"vitlök","qty":2,"unit":"klyfta" }
  ],
  "steps": [
    "Koka pastan al dente.",
    "Fräs vitlök i olivolja, tillsätt tomat.",
    "Vänd i pastan; salta/peppra."
  ],
  "personaLines": ["Regel #1: smaka av."]
}
```
**Beskrivning**  
- Använder **systemprompt** (PG‑16, parodi/inspirerad, **recept only**, inga direkta citat).  
- Persona väljs **slumpmässigt per ny chatt** (sparas i session).  
- Svar **valideras** med Zod; vid fel görs **1 retry** (”JSON only”). Misslyckas det → fallback till baslinje‑receptet utan persona‑twist.  
- Efterkontroll: diet/allergi‑regel **efter** modellen (failsafe).

**Schema (Zod‑ekvivalent)**
```ts
type RecipeResponse = {
  personaId: string;
  title: string;
  timeMinutes: number;          // > 0
  difficulty: "lätt" | "medel" | "svår";
  dietTags: string[];
  nutrition: { kcal: number; protein_g: number };
  ingredients: { name: string; qty: number|string; unit: string }[];
  steps: string[];
  personaLines: string[];       // max 5 korta rader
};
```

---

## Personas & IP/etik
- **PG‑16:** ingen grafisk våldsskildring, inga kroppsliga rekvisita/kannibalism.
- **Parodi/inspirerad ton**: **inga direkta citat/catchphrases** för moderna figurer (`quotePolicy: "paraphrase_only"`).  
- **Tysta personas** (t.ex. Myers‑inspirerad): **ingen scenanvisning**; skriver bara recept.  
- **IMDb‑länk** i UI från `personas_pool.json` (ex. “Om denna persona → IMDb”).

> För citatläge: använd **public‑domain‑personas** i separat pool och sätt `quotePolicy: "public_domain_ok"` (ej del av MVP).

---

## Datafiler
- `src/data/recipes_seed.json` — mini‑korpus med recept (id, title, ingredients[], tags[], timeMinutes, difficulty, baseNutrition).  
- `src/data/ingredient_aliases.json` — alias för normalisering (”krossade tomater” ≈ ”passerade tomater” etc.).  
- `src/data/personas_pool.json` — persona‑metadata: `displayName`, `imdbUrl`, `quotePolicy`, guardrails.

> **Tips:** håll ingrediensnamn i **singular + lowercase**, och fyll på aliaslistan när ni märker variationer i input.

---

## Valfritt: Embeddings-index
För mer träffsäker sökning:
1. Build‑script som embed:ar en kort text per recept.  
2. Spara vektorer i `src/data/recipes_index.json`.  
3. I `/api/search`: blanda **cosine** (semantisk närhet) med Jaccard (exakt överlapp).  
4. Ingen extern DB krävs för MVP — index kan laddas i minnet.

---

## Test & kvalitet
- **Enhetstester:** normalize, diet/allergi‑filter, Jaccard.  
- **Golden prompts (8–10):** typfall (veg/vegan/glutenfri, allergi: nötter, felstavningar, tom pantry).  
- **Målsiffror:** ≥90% valid JSON i första försöket; fallback fungerar; latens ok i dev.  
- **Loggning:** promptversion, svarstid, valideringsfel (utan PII).

---

## Deploy (Vercel)
1. Skapa nytt projekt i Vercel, peka på repo:t.  
2. Lägg **Environment Variables**: `GEMINI_API_KEY` (+ `IMAGE_API_KEY` om bild).  
3. Deploya. Testa flödet: input → sök → LLM → recept → (bild).

---

## Dokumentation
- **Blueprint:** `docs/blueprint-v2.md` (MVP, arkitektur, tidsplan, checklista)  
- **Plan (Gemini):** `docs/plan-gemini-v2.md` (filnamnet är plan.md, inte plan-gemini-v2.md)
- **Reflektioner:** `docs/reflektioner.md` (filnamnet är reflektioner_kring_projektet_spooky_chef.md)

---

**License:** Skolprojekt (ej kommersiellt bruk). Alla tredjepartsnamn/figurer används i **parodi/inspirationssyfte** utan direkta citat.
