# Jämförelse: Ursprungsplan vs. Slutlig App

Den största skillnaden är ett fundamentalt arkitekturval: projektet gick från en **RAG-modell (Retrieval-Augmented Generation)** till en **direktgenereringsmodell**. Detta var ett medvetet val som ledde till en enklare, mer kreativ och mer robust applikation.

---

## 1. Kärnlogik för Receptgenerering

### Ursprungsplan (RAG-modell)
1. `/api/search`: Användaren skickar in ingredienser.  
2. Servern söker i en statisk JSON-fil (`recipes_seed.json`) för att hitta ett existerande basrecept som matchar.  
3. `/api/generate`: Detta basrecept skickas sedan till AI:n för att bli "omskrivet" med en persona-twist.  

*__Nackdel:__* AI:n agerade bara som en "stylist". Kreativiteten var begränsad till innehållet i `recipes_seed.json`. Varje input som “pasta, tomat” skulle alltid utgå från samma grundrecept.

### Slutlig App (Direktgenerering)
1. `/api/generate`: Användaren skickar in ingredienser.  
2. Servern skickar ingredienserna direkt till Gemini och ber den skapa ett helt nytt, komplett recept från grunden.  

*__Förbättring:__* AI:n blir den centrala kreativa motorn. Varje genererat recept är unikt och anpassat, vilket gör upplevelsen mycket mer dynamisk och rolig. Arkitekturen blev också enklare då hela `/api/search`-steget och beroendet till `recipes_seed.json` kunde tas bort.

---

## 2. AI-implementation och Användarupplevelse (UX)

### Ursprungsplan
- Ett enkelt API-anrop som returnerar ett färdigt JSON-objekt.  
- Användaren hade fått vänta 5–7 sekunder på ett komplett svar utan att se vad som hände.  
- Risk för ogiltig JSON från AI:n, vilket skulle kräva komplex felhantering och fallbacks.

### Slutlig App
- **Streaming (SSE):** Svaret strömmas till klienten i realtid. Användaren får omedelbar feedback via en progressbar och ser personan nästan direkt.  
- **Garanterad JSON (responseSchema):** En mer avancerad API-funktion säkerställer att AI:n alltid returnerar korrekt format. Det gör appen extremt robust.  
- **Parallell bildladdning:** Appen börjar ladda matbilden medan receptet genereras, vilket minskar väntetiden.  

*__Förbättring:__* Den slutliga appen är snabbare, mer interaktiv och betydligt mer tillförlitlig än vad den ursprungliga planen hade resulterat i.

---

## 3. Datasäkerhet och Kvalitet

### Ursprungsplan
- Förlitade sig på att AI:n skulle följa instruktioner om dieter/allergier vid omskrivning.  
- Enkelt “retry” vid fel.

### Slutlig App
- **"Trust but Verify"-princip:** Ett extra lager av deterministisk validering. Efter att AI:n genererat receptet dubbelkollar koden att inga allergener finns med, och korrigerar även AI:ns diet-taggar vid behov (t.ex. tar bort “veg” om receptet innehåller kyckling).  

*__Förbättring:__* Detta hybrid-system (AI:s kreativitet + regelbaserad säkerhet) visar en mogen förståelse för LLM:ers svagheter och skapar en mycket säkrare och mer pålitlig applikation.

---

## Sammanfattning

| Funktion | Ursprungsplan | Slutlig App (Förbättring) |
|----------|---------------|---------------------------|
| AI-Metod | RAG (sök & skriv om) | Direktgenerering (skapa från grunden) |
| Kreativitet | Låg (begränsad av seed-data) | Hög (unika recept varje gång) |
| Arkitektur | Komplex (två API-steg, seed-fil) | Enkel (ett API-steg, ingen seed-fil) |
| Användarupplevelse | Långsam (vänta på fullt svar) | Snabb & interaktiv (streaming, progressbar) |
| Robusthet | Sårbar för felformaterad JSON | Hög (garanterad JSON via responseSchema) |
| Säkerhet | Grundläggande (litar på AI:n) | Hög (post-AI validering & korrigering) |

Genom att frångå den ursprungliga planen har projektet gått från en relativt enkel **“AI-stylist”** till en avancerad, kreativ och robust **“AI-kock”** — ett betydligt bättre exempel på potentialen i moderna LLM:er.
