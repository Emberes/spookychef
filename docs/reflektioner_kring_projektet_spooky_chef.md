# Reflektioner kring projektet – SpookyChef

## Bakgrund och mål
Vårt mål är att bygga en rolig men användbar recept‑chatt: användaren anger ingredienser, får ett recept i **halloween‑inspirerad** ton från en slumpad persona (PG‑16, humor > gore), utan att tappa fokus på **korrekta recept** och **diet-/allergihänsyn**.

## Val av lösning (översikt)
- **LLM‑persona**: Parodi/inspirerad röst för varje karaktär (t.ex. Pennywise‑inspirerad, Ghostface‑inspirerad).
- **Sök före generering (RAG‑light)**: Vi tar fram 1–5 kandidat‑recept från en liten JSON‑korpus och låter LLM persona‑ifiera toppvalet. (För MVP kan vi köra utan embeddings‑DB, bara JSON + enkel likhet.)
- **Validering & robusthet**: LLM returnerar **strikt JSON** som valideras med Zod. Allergi/diet kontrolleras deterministiskt efter modellens svar. Fallback till en **regelbaserad** baslinje.
- **Tysta personas** (t.ex. Myers/Jason‑inspirerad): **Inga scenanvisningar**. De “skriver” helt enkelt ett vanligt recept.

---

## Problemet: direkta citat och “trademarkade” catchphrases
**Observation:** Många ikoniska skräckfigurer förknippas med igenkännbara repliker och fraser. Det är lockande att använda dem rakt av för att förstärka igenkänningen i chatten.

**Utmaning:** Direkta citat och “trademarkade” uttryck från **moderna, upphovsrättsskyddade** verk kan innebära IP‑risk (upphovsrätt/varumärke), även i utbildningssammanhang. Även om projektet inte säljs, vill vi hålla en **säker och etiskt hållbar** praxis som också fungerar om koden visas offentligt (GitHub, demo, portfolio).

**Konsekvens:** Om vi tillåter direkta citat riskerar vi att:
- skapa beroenden till skyddat material,
- hamna i gråzon vid delning/demos,
- behöva särskild hantering för varje replik (källor, licenser),
- spä på modellens tendens att “läcka” kända fraser som den inte bör reproducera ordagrant.

---

## Vår lösning: parodi/inspirerad ton + kontrollerad metadata
1) **Parafras i stället för citat**  
   Vi låter personan tala i en **parodi-/inspirerad** röst och undviker ordagranna repliker. Det ger samma känsla utan IP‑risk.

2) **`quotePolicy` per persona**  
   Varje persona har en `quotePolicy`:
   - `paraphrase_only` (standard för moderna figurer) → **inga** direkta citat; bara parafraser/stilmarkörer.
   - `public_domain_ok` (för figurer vars ursprungstexter är i public domain) → citat **endast** om de kommer från PD‑källan (inte moderna filmer).

3) **IMDb‑länk istället för citat**  
   I UI visar vi en **diskret länk** till filmens **IMDb‑sida** så användaren förstår referensen utan att vi återger skyddade repliker. (Ex.: *Om denna persona → IMDb*.)

4) **Guardrails i prompten**  
   Systeminstruktionerna förbjuder direkta citat/varumärken, grafiska detaljer och all form av “kroppsliga rekvisita”. Output ska vara **recept i JSON** (ingen scen, inget manus) + valfria korta, **egna** persona‑rader.

5) **Tekniska spärrar**  
   - Zod‑validering av JSON.  
   - Efterkontroll som filtrerar kända “svarta listan”‑fraser (om vi märker att modellen försöker citera).  
   - Loggar för att se om modellen bröt mot policyn (för förbättring).

---

## Alternativ vi övervägde
- **Direkta citat med flagg “endast skolbruk”**: Avfärdades. Det minskar inte IP‑risken om koden sprids, och ger dålig vana.
- **En ren public‑domain‑persona‑pool**: Möjligt. Förlorar igenkänning hos vissa användare, men ökar juridisk trygghet. Kan vara ett “läge” vi växlar till vid publik demo.
- **Ta bort persona‑rader helt**: Minskar charm, men maximalt säkert. Vi valde behålla korta, egna rader (parafraser) för “ton”.

---

## Lärdomar (kopplat till VG‑krav)
- **Tekniskt medvetna trade‑offs**: Vi visar att vi kan resonera om IP, etik och säkerhet i designen (parodi‑ton, `quotePolicy`, guardrails, validering).  
- **Metodiskt tänk**: Baslinje utan AI + (valfritt) embeddings‑sök före LLM visar *varför* AI behövs och hur vi begränsar hallucinationer.  
- **Kvalitet först**: JSON‑schema, allergi/diet‑regler, samt fallback förbättrar robusthet.

---

## Fortsatt arbete
- **Persona‑pool (~20)**: Finjustera stilar, fyll på metadata (`imdbUrl`, `quotePolicy`).  
- **Public‑domain‑läge**: Lägg till separata PD‑personas med säkra citat från ursprungstexter.  
- **Embeddings‑index** (frivilligt i MVP): Generera en JSON‑indexfil i build‑steg; kan senare bytas till vektor‑DB (pgvector/Supabase).  
- **Mätning**: A/B‑testa personas, logga svarstid/kostnad, spåra JSON‑valideringsfel.  
- **Etik by design**: Fortsätt utvärdera ton, humor, och undvik trivialisering av våld.  
- **Funktioner framåt**: Konto/favoriter/inköpslista, bättre näringsberäkning, förbättrad bildgenerering.

