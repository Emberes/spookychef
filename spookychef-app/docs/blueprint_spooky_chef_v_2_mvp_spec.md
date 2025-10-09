# Blueprint – SpookyChef (v2, MVP‑spec)

**Status:** Godkänd riktning • PG‑16 • “recept only” för tysta personas  
**Deadline:** 20 okt 23:59  
**Repo:** _lägg till länk_  

---

## 1) Sammanfattning & Scope
SpookyChef är en Next.js‑webbapp där användaren matar in ingredienser och får **ett recept** tillbaka i stilen av en **slumpad skräckfilms‑inspirerad persona** (≈20 i poolen). Fokus på **humor > gore**, **PG‑16**, och **recept i JSON** (validerat) – inga scenanvisningar ens för “tysta” personas.

**Kärnflöde (MVP):**
1) Start ny chatt ⇒ **slumpa persona** (sparas i session).  
2) Användaren anger ingredienser (+ eventuell diet/allergi).  
3) Backend tar fram **1 kandidat** via baslinje‑sök (och ev. embeddings‑index).  
4) LLM persona‑ifierar kandidaten ⇒ **JSON‑recept** (tid, svårighet, ingredienser, steg, kalorier, protein, diet‑taggar, personaLines).  
5) UI visar receptet (+ knapp **Generera om**).  
6) (Valfritt) generera **matbild** i trygg fotostil.

---

## 2) MVP – tydlig definition
**Måste‑ha (DoD)**
- Next.js (TS) + Tailwind + shadcn UI‑skelett (Dark mode).
- **Random persona per chatt** (pool ≥8 i MVP; växer till ~20).  
  - Fält `displayName`, `imdbUrl`, `quotePolicy: "paraphrase_only"`, guardrails PG‑16.
  - **Tysta personas:** skriver **endast recept** (inga scenanvisningar).  
- **Input**: ingredienslista (+ frivilligt diet/allergi).  
- **/api/search**: normalisering + **regelbas** (viktad Jaccard); returnera **1 kandidat**.  
- **/api/generate**: systemprompt + persona‑prompt ⇒ **JSON‑recept** (Zod‑validerat).  
- **Allergi/diet‑filter** körs deterministiskt **efter** LLM och blockerar otillåtna ingredienser.  
- **IMDb‑länk** visas i UI för vald persona.  
- **README/plan/reflektioner** dokumenterade.

**Bör‑ha (om tid)**
- Enkel **bildgenerering** per recept (fotostil, cache per recept‑ID).  
- **Embeddings‑index** (JSON i repo, in‑memory cosine) som förbättrar kandidatvalet.

**Ej i MVP (framtida)**
- Inloggning/konto, favoriter, inköpslista.  
- Riktig vektor‑DB (pgvector/Supabase).  
- Avancerad närings‑API.

**Mätbara acceptanskriterier**
- 90% av frågorna returnerar **valid JSON** vid första försöket.  
- Allergi/diet‑regler stoppar tydliga överträdelser (manuellt testat).  
- “Generera om” ger nytt svar utan att tappa persona.

---

## 3) Personas & IP/etik
- **Pool (~20)**: Pennywise‑, Sweeney‑, Ghostface‑, Chucky‑, Freddy‑, Myers‑(tyst), Jason‑(tyst), Beetlejuice‑inspirerade m.fl.  
- **PG‑16 guardrails:** ingen grafisk våldsskildring; **inga** referenser till kroppsliga rekvisita; humor > gore.  
- **Citatpolicy:** moderna figurer = `quotePolicy: paraphrase_only` (inga direkta citat).  
- **IMDb‑länkar** i `personas_pool.json`; UI visar “Om denna persona → IMDb”.

---

## 4) UX & UI
- **Inmatning:** ingredienser (chips eller text med kommatecken), diet/allergier (chips).  
- **Resultatkort:** titel, tid, svårighet, diet‑taggar, kcal/protein, lista ingredienser, steg, (personaLines).  
- **Åtgärder:** Generera om • Kopiera recept • (Valfritt) Generera bild.  
- **Tomtillstånd:** tips om exempel (“pasta, tomat, vitlök”).  
- **Tillgänglighet:** god kontrast, fullt tangentbordsstöd, aria‑labels.

---

## 5) Data & filstruktur
- `data/recipes_seed.json` – mini‑korpus (klar).  
- `data/ingredient_aliases.json` – alias (klar).  
- `data/personas_pool.json` – persona‑metadata inkl. `imdbUrl`, `quotePolicy`.  
- (Valfritt) `data/recipes_index.json` – embeddings‑index (JSON) för in‑memory cosine.

**Typer (kort):**
- `Recipe{id,title,ingredients[],tags[],timeMinutes,difficulty,baseNutrition}`  
- `Persona{id,displayName,imdbUrl,quotePolicy,voice,guardrails}`

---

## 6) Backend & AI‑flöde
**/api/search**
- Normalisera ingredienser (alias).  
- Regelbas: viktad Jaccard mot receptens ingredienser.  
- (Valfritt) Blanda in **cosine** från `recipes_index.json` om index finns.  
- Filtrera hårt på diet/allergi.

**/api/generate**
- Systemprompt (PG‑16, parodi/inspirerad, **recept only**, inga citat).  
- Persona‑prompt (inkl. `displayName`, guardrails, diet/allergi, kandidat‑JSON).  
- Anropa LLM (Gemini/adapter) → **JSON‑recept**.  
- Validera med Zod; fallback: visa baslinje‑kandidaten.

**Bild‑API (valfritt)**
- Generera trygg fotoprompt från receptet; cacha per recept‑ID.

---

## 7) Arkitektur & stack
- **Frontend:** Next.js (TS), Tailwind, shadcn/ui, Dark theme.  
- **API:** Next.js API Routes med server‑side nycklar.  
- **Data:** lokala JSON‑filer i repo.  
- **Hosting:** Vercel.  
- **Observability:** enklare loggning (promptversion, svarstid, valideringsfel).

---

## 8) Test & kvalitet
- **Enhet:** normalisering, allergi/diet‑filter, Jaccard.  
- **Golden prompts:** 8–10 scenarier (med/utan diet/allergi).  
- **Manuellt QA:** JSON‑validitet, felmeddelanden, “Generera om”.

---

## 9) Risker & mitigering
- **Hallucinationer:** kandidat från korpus + strikta prompts + Zod + fallback.  
- **IP‑risk:** parodi/inspirerad; inga direkta citat; IMDb‑länkar för kontext.  
- **Latens/kostnad:** kort kontext, caching, ev. streaming.

---

## 10) Milstolpar & tidplan fram till 20 okt
**Dagens datum:** 7 okt

**v.41**  
- **8 okt (tis):** UI‑skelett (input, resultatkort), persona‑pool (≥8), `/api/search` (baslinje), seed‑data på plats.  
- **9 okt (ons):** `/api/generate` + systemprompt + persona‑prompt, Zod‑validering, “recept only” bekräftat för tysta personas.  
- **10 okt (tors):** diet/allergi‑filter (deterministiskt), kopiera‑recept, IMDb‑länk i UI.  
- **11 okt (fre):** styling/polish (dark theme), skelett‑loading, felhantering.

**v.42**  
- **13 okt (mån):** (Valfritt) embeddings‑index (build‑script + JSON); blanda in cosine i söket.  
- **14 okt (tis):** Bild‑API (valfritt), cache per recept‑ID.  
- **15 okt (ons):** Golden prompts (8–10), loggning/metrics, QA‑runda 1.  
- **16 okt (tors):** Fixar från QA; README + Reflektioner uppdateras.  
- **17 okt (fre):** Demo‑rep, finputsning.

**Slutspurt**  
- **19 okt (sön):** Frysa nya features, sista QA, screenshots/GIFs.  
- **20 okt (mån):** Inlämning senast 23:59 (repo + canvas + instruktioner).

---

## 11) To‑do – checklista
**Data**
- [ ] Lägg in `recipes_seed.json` i projektet  
- [ ] Lägg in `ingredient_aliases.json`  
- [ ] Skapa `personas_pool.json` (≥8 i MVP, med `imdbUrl`, `quotePolicy`)  
- [ ] (Valfritt) Skapa `recipes_index.json` med embeddings

**Backend**
- [ ] `/api/search` – normalisering + Jaccard + diet/allergi‑filter  
- [ ] (Valfritt) blanda in cosine om index finns  
- [ ] `/api/generate` – systemprompt + persona‑prompt + LLM‑anrop  
- [ ] Zod‑validering + fallback

**Frontend**
- [ ] Input (chips/text) + diet/allergi‑chips  
- [ ] Resultatkort (titel, tid, svårighet, kcal/protein, taggar, ingredienser, steg)  
- [ ] **IMDb‑länk** i persona‑header  
- [ ] “Generera om” + “Kopiera recept”  
- [ ] Dark theme + skelett‑loading + felstates

**Bild (valfritt)**
- [ ] Prompt‑builder (fotostil, inga skräckprops)  
- [ ] Caching per recept‑ID

**Kvalitet & dokumentation**
- [ ] Enhetstester: normalisering, filter, Jaccard  
- [ ] Golden prompts (8–10)  
- [ ] README (körning, arkitektur, reflektion)  
- [ ] Reflektioner.md (IP/etik, varför parodi, guardrails)

**Demo/Release**
- [ ] QA‑lista av buggar åtgärdad  
- [ ] Skärmdumpar/GIFs  
- [ ] Inlämning (repo + canvas + instruktioner)

---

## 12) Stretch (efter MVP)
- Konto/favoriter/inköpslista, bättre näringsberäkning, riktig vektor‑DB, fler personas, A/B‑test av ton.

