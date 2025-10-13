# SpookyChef — README

En Next.js-webbapp som föreslår ett recept baserat på vad du har hemma – presenterat av en slumpmässig skräckfilmsinspirerad persona. Fokus ligger på humor över skräck, en PG-16-ton, och att endast generera recept (även för "tysta" personas).

---

## Innehållsförteckning
- [Snabbstart](#snabbstart)
- [Teknisk Stack](#teknisk-stack)
- [Mappstruktur](#mappstruktur)
- [Miljövariabler](#miljövariabler)
- [Kör Lokalt](#kör-lokalt)
- [API-kontrakt](#api-kontrakt)
- [Kod-dokumentation](#kod-dokumentation)
- [Personas & IP/Etik](#personas--ipetik)
- [Datafiler](#datafiler)
- [Test & Kvalitet](#test--kvalitet)
- [Deploy (Vercel)](#deploy-vercel)
- [Licens](#licens)

---

## Snabbstart
```bash
# Klona repot
git clone <repo-url> spookychef && cd spookychef

# Installera beroenden
npm install

# Kopiera .env.local.example till .env.local
cp .env.local.example .env.local

# Lägg till din API-nyckel i .env.local
# GEMINI_API_KEY=...

# Starta utvecklingsservern
npm run dev
```

Öppna [http://localhost:3000](http://localhost:3000) i din webbläsare.

---

## Teknisk Stack
- **Next.js** (TypeScript, App Router)
- **React**
- **Tailwind CSS**
- **Gemini API** (för receptgenerering)
- **Zod** (för validering av data)
- **Vercel** (för hosting)

---

## Mappstruktur
```
spookychef/
├── app/
│   ├── api/
│   │   └── generate/
│   │       └── route.ts  # API-route för receptgenerering
│   ├── globals.css       # Globala CSS-regler
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Huvudsidan
├── components/
│   ├── RecipeForm.tsx    # Formulär för ingredienser
│   ├── RecipeCard.tsx    # Visar det genererade receptet
│   └── ProgressiveRecipeCard.tsx # Visar laddningsstatus
├── data/
│   ├── ingredient_aliases.json # Alias för ingredienser
│   ├── personas_pool_iconic.json # Lista över personas
│   └── recipes_seed.json # Grundrecept
├── lib/
│   ├── filters.ts        # Funktioner för filtrering
│   ├── normalize.ts      # Funktioner för normalisering
│   ├── schema.ts         # Zod-scheman för validering
│   └── utils.ts          # Hjälpfunktioner
├── public/
│   └── personas/         # Bilder för personas
├── .env.local.example    # Exempelfil för miljövariabler
├── package.json
└── tsconfig.json
```

---

## Miljövariabler
Skapa en `.env.local`-fil i roten av projektet och lägg till din Gemini API-nyckel:
```
GEMINI_API_KEY="DIN_API_NYCKEL"
```

---

## Kör Lokalt
- `npm run dev`: Startar utvecklingsservern på `http://localhost:3000`.
- `npm run build`: Bygger applikationen för produktion.
- `npm run start`: Startar en produktionsserver.
- `npm run lint`: Kör ESLint för att hitta och fixa problem i koden.

---

## API-kontrakt

### POST `/api/generate`
Denna API-route genererar ett recept baserat på användarens input.

**Body (förfrågan):**
```json
{
  "userIngredients": ["pasta", "tomat", "vitlök"],
  "chatId": "en-unik-chatt-id",
  "diet": ["veg"],
  "allergies": []
}
```

**Svar (streaming):**
API:et strömmar svaret. Först skickas persona-information, följt av receptdata i bitar, och avslutas med det kompletta receptobjektet.

**Exempel på komplett svarsobjekt:**
```json
{
  "personaId": "ghostface",
  "title": "En skrämmande god tomatpasta",
  "timeMinutes": 20,
  "difficulty": "lätt",
  "dietTags": ["veg"],
  "nutrition": { "kcal": 620, "protein_g": 18 },
  "ingredients": [
    { "name": "pasta", "qty": "250", "unit": "g" },
    { "name": "tomat", "qty": "3", "unit": "st" },
    { "name": "vitlök", "qty": "2", "unit": "klyfta" }
  ],
  "steps": [
    "Koka pastan enligt anvisningarna på förpackningen.",
    "Fräs vitlöken i olivolja tills den blir gyllenbrun.",
    "Blanda i tomaterna och låt det sjuda i några minuter."
  ],
  "personaLines": ["Vad är din favoritskräckfilm?"],
  "imageUrl": "en-url-till-en-genererad-bild"
}
```

---

## Kod-dokumentation

### `/app`
Här ligger applikationens huvudlogik, enligt Next.js App Router-strukturen.
- `layout.tsx`: Root-layouten som definierar den grundläggande HTML-strukturen.
- `page.tsx`: Huvudsidan som hanterar state för receptgenereringen, inklusive användarinput, laddningsstatus och felhantering.
- `globals.css`: Globala CSS-stilar.

### `/app/api`
Innehåller applikationens API-routes.
- `generate/route.ts`: Kärnan i applikationen. Hanterar receptgenerering genom att ta emot användarens preferenser, välja en slumpmässig persona, skapa en prompt för Gemini API, och strömma tillbaka svaret.

### `/components`
Innehåller React-komponenter.
- `RecipeForm.tsx`: Formuläret där användaren matar in ingredienser och väljer kost- och allergialternativ.
- `RecipeCard.tsx`: Komponent som visar det färdiga receptet, inklusive persona, ingredienser, instruktioner och en AI-genererad bild.
- `ProgressiveRecipeCard.tsx`: Visar en laddningsanimation och information om den valda personan medan receptet genereras.

### `/lib`
Innehåller hjälpfunktioner och scheman.
- `schema.ts`: Definierar Zod-scheman för att validera API-förfrågningar och svar.
- `filters.ts`: Funktioner för att filtrera recept baserat på kost och allergier.
- `normalize.ts`: Funktioner för att normalisera ingrediensnamn.
- `utils.ts`: Diverse hjälpfunktioner, t.ex. för att slå samman Tailwind CSS-klasser.

### `/data`
Innehåller applikationens data i JSON-format.
- `recipes_seed.json`: En samling grundrecept.
- `ingredient_aliases.json`: En lista med alias för ingredienser för att underlätta normalisering.
- `personas_pool_iconic.json`: En lista över de skräckpersonas som används för att generera recept.

---

## Personas & IP/Etik
- **PG-16:** Inget grafiskt våld eller kannibalism.
- **Parodi/Inspiration:** Inga direkta citat från moderna karaktärer.
- **Tysta Personas:** Karaktärer som Michael Myers skriver endast receptet, utan personliga kommentarer.
- **IMDb-länk:** Varje persona har en länk till sin film på IMDb.

---

## Datafiler
- `recipes_seed.json`: En samling grundrecept.
- `ingredient_aliases.json`: Alias för ingredienser.
- `personas_pool_iconic.json`: Metadata för varje persona.

---

## Test & Kvalitet
- **Enhetstester:** Tester för normalisering, filtrering och liknande funktioner.
- **Golden Prompts:** En uppsättning test-prompts för att säkerställa att vanliga scenarion (t.ex. allergier, specialkost) hanteras korrekt.
- **Loggning:** Loggning av prompts, svarstider och valideringsfel för att övervaka och förbättra kvaliteten.

---

## Deploy (Vercel)
1. Skapa ett nytt projekt i Vercel och koppla det till ditt GitHub-repo.
2. Lägg till `GEMINI_API_KEY` som en miljövariabel i Vercel.
3. Pusha till `main`-branchen för att deploya.

---

## Licens
Detta är ett skolprojekt och är inte avsett för kommersiellt bruk. Alla tredjepartsnamn och karaktärer används i parodi- och inspirationssyfte.