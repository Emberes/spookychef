# TODO – SpookyChef (MVP)

**Deadline:** 20 okt, 23:59  
**Scope:** Recept-chatt i Next.js. Slumpad persona per ny chatt (~20 i poolen). PG‑16. _Recept only_ (även för tysta personas). Parodi/inspirerad ton, inga direkta citat/catchphrases. IMDb‑länk i UI.

---

## ✅ MVP – måste vara med

- Random **persona per chatt** (pool ≥8 i MVP, väx till ~20)
- Input för **ingredienser** (+ valfritt diet/allergier)
- `/api/search` (baslinje) ⇒ **1 kandidat**
- `/api/generate` (LLM) ⇒ **JSON‑recept** (validerat med Zod)
- Deterministiskt **diet/allergi‑filter** efter LLM
- UI: resultatkort med **titel, tid, svårighet, kcal/protein, taggar, ingredienser, steg, personaLines**
- **IMDb‑länk** i persona‑header
- “**Generera om**” och “**Kopiera recept**”
- README.project.md + docs (blueprint v2, plan v2, reflektioner)

---

## A) Repo & setup

- [x] Initiera Next.js (TS, Tailwind, app router, alias `@/*`)
- [x] Skapa **README.project.md** (körinstruktioner, länkar till docs)
- [x] Skapa `docs/` och lägg in: **blueprint‑v2.md**, **plan‑gemini‑v2.md**, **reflektioner.md**
- [x] `.env.local.example` (GEMINI_API_KEY)
- [x] `.gitignore` (node_modules, .env\*, .next, .vercel)
- [x] ESLint/Prettier bas

**DoD:** repo klonas och `npm run dev` startar utan fel.

---

## B) Data & normalisering

- [x] Lägg `src/data/recipes_seed.json` (seed‑korpus)
- [x] Lägg `src/data/ingredient_aliases.json`
- [x] Lägg `src/data/personas_pool.json` (≥8; `displayName`, `imdbUrl`, `quotePolicy` = `paraphrase_only`)
- [x] Implementera `src/lib/normalize.ts` (alias‑matchning, lowercase, trim)
- [x] Enhetstest: alias för minst 10 vanliga varianter (paprika, lök, bönor, grädde …)

**DoD:** normalisering returnerar förväntade kanoniska namn för testfallen.

---

## C) Persona‑motor (PG‑16 + recept only)

- [x] Slumpa persona **per ny chatt** och spara i session
- [-] Enforce `quotePolicy=paraphrase_only` (ingen direkt‑citat)
- [-] **Tysta personas**: _ingen_ scenanvisning, **endast recept**
- [x] UI: visa `displayName` + **IMDb‑länk**

**DoD:** persona följer reglerna; tyst persona skriver bara recept; IMDb‑länk fungerar.

---

## D) Sök (baslinje) – `/api/search`

- [x] POST `{ ingredients[], diet[], allergies[] }`
- [x] Normalisera ingredienser
- [x] **Viktad Jaccard** mot receptens ingrediens‑set
- [x] Filtrera strikt på diet/allergi
- [x] Returnera **1 kandidat** + lista över testade id:n (logg)
- [x] Använd persona-preferenser för att påverka sökresultaten

**DoD:** för kända inputs (t.ex. pasta+tomat) returneras rimlig kandidat; filter blockerar otillåtna.

---

## E) (Valfritt) Embeddings‑index utan DB

- [ ] Build‑script → `src/data/recipes_index.json` (text per recept → embeddings → vektorer)
- [ ] In‑memory **cosine** i `/api/search` om index finns (blanda med Jaccard)
- [ ] Feature‑flag för att slå av/på

**DoD:** top‑K från cosine förbättrar valet på testfall.

---

## F) LLM‑generering – `/api/generate`

- [x] `SYSTEM_PROMPT`: PG‑16, **parodi/inspirerad**, **recept only**, inga citat
- [x] Persona‑prompt: persona‑metadata, constraints, kandidat‑JSON, diet/allergier
- [x] Modellanrop (Gemini/adapter)
- [x] **Zod‑validering** (titel, tid, svårighet, dietTags, kcal/protein, ingredients[], steps[], personaLines[])
- [x] **Retry (1x)** vid ogiltig JSON (“JSON only, follow schema”)
- [x] **Fallback**: visa baslinje‑kandidaten utan persona
- [x] **Efterkontroll**: blockera otillåtna ingredienser trots modellens svar
- [x] Enkel “**svartlista**” för kända catchphrases (skydd mot citat)

**DoD:** ≥90% valid JSON på golden prompts; inga scenanvisningar; inga direkta citat.

---

## G) UI & UX

- [x] Input: chips/kommatext + diet/allergi‑chips
- [x] Resultatkort: titel • tid • svårighet • diet‑taggar • kcal/protein • ingredienser • steg • (personaLines)
- [x] Knappar: **Generera om**, **Kopiera recept**
- [x] Loading‑skelett + felstates
- [x] Dark theme (enligt palett i blueprint)
- [x] Tillgänglighet: aria, tabb‑ordning, fokusmarkering

**DoD:** flödet input → resultat fungerar; A11y grundkrav uppfyllda.

---

## H) (Valfritt) Bildgenerering

- [ ] `buildFoodImagePrompt()` (fotostil, inga skräckprops)
- [ ] Bild‑API‑integration + **cache** per recept‑ID
- [ ] UI: visa bild / fallback‑placeholder

**DoD:** bild visas för minst 3 recept; prompt ger realistisk matbild.

---

## I) Testning & kvalitet

- [ ] Enhet: normalize, diet/allergi‑filter, Jaccard
- [ ] **Golden prompts (8–10)**: veg/vegan/glutenfri, allergi: nötter, tom pantry, felstavningar
- [ ] Enkel load‑test (10–20 lokala anrop) för svarstid
- [ ] Loggning: prompt‑version, modell, tokens (om möjligt), svarstid, valideringsfel
- [ ] Manuell QA‑lista → GitHub issues

**DoD:** enhetstester gröna; golden prompts ger valid JSON; metrik loggas.

---

## J) Dokumentation

- [ ] **README.project.md** (körning, env, endpoints, arkitektur)
- [ ] Uppdatera **docs/** (blueprint v2, plan v2, reflektioner)
- [ ] Screenshots/GIFs (happy path + felstate)
- [ ] Known limitations + Future work

**DoD:** ny utvecklare kan starta projektet på 5 min med README.

---

## K) Deploy & inlämning

- [ ] Vercel‑projekt + env‑variabler
- [ ] Testa produktion: sök → generera recept → (valfritt) bild
- [ ] Tagga release (t.ex. `v1.0.0-mvp`)
- [ ] Slut‑QA & inlämning (repo‑länk + docs)

**DoD:** Vercel‑build OK; demo‑länk fungerar; deadline möts.

---

## Milestones & tidslinje (till 20 okt)

**v.41**

- **8 okt (tis):** A Repo/setup · B Data/normalize · C Persona‑motor (random + IMDb)
- **9 okt (ons):** D `/api/search` (baslinje) · G UI‑skelett (input + resultatkort)
- **10 okt (tors):** F `/api/generate` (prompt + Zod + retry + fallback) · C “recept only” enforcement
- **11 okt (fre):** G Felstates + Dark theme polish · I Enhetstester (normalize/filter/Jaccard)

**v.42**

- **14 okt (mån):** I Golden prompts (8–10) · Logging/metrik · QA‑runda 1
- **15 okt (tis):** (Valfritt) E Embeddings‑index + cosine‑blend
- **16 okt (ons):** (Valfritt) H Bild‑API + cache · UI‑knapp “Kopiera recept”
- **17 okt (tors):** J Dokumentation (README.project + docs) · Screens/GIFs
- **18–19 okt (lör–sön):** K Deploy till Vercel · Slut‑QA · Frys features
- **20 okt (mån):** Inlämning före 23:59

---

## Acceptanskriterier (DoD, projekt)

- 90% av frågorna ger **valid JSON** i första försöket
- Diet/allergi‑filter blockerar överträdelser (manuellt testat)
- “Generera om” ger nytt recept utan att tappa persona
- README.project.md + docs är komplett; ny dev kan starta på 5 min

---

## Förklaring: `src/data/recipes_seed.json` (seed‑korpus) – är det semantisk sökning?

**Kort svar:** Själva **filen** är bara **data** (en liten samling recept i JSON). Den är **inte** semantisk sökning i sig.  
**Hur den används:**

1. **Baslinje utan AI:** vi matchar användarens ingredienser mot receptens ingredienslistor med en **regelbas** (t.ex. viktad Jaccard). Det är **inte semantiskt** – det är överlapp av ord/ingredienser.
2. **Semantisk sökning (valfritt):** om vi **beräknar embeddings** för varje recept (vid build) och sparar i en extra fil `recipes_index.json`, kan vi göra **cosine‑likhet** mellan användarens ingrediens‑embedding och receptens embeddings = **semantisk** närme‑sökning. Då blir söket mer “förståelse‑baserat” (synonymer, närliggande begrepp) än ren ordöverensstämmelse.

**Sammanfattning:**

- `recipes_seed.json` = **källa** för recept (struktur + innehåll).
- **Baslinje** (utan embeddings) = inte semantiskt.
- **Med embeddings** (`recipes_index.json`) = **semantisk sökning** (in‑memory, ingen extern DB krävs i MVP).
