# 🇸🇪 Svenska Instruktioner - Uppdaterad

## Problem
AI:n genererade recept på engelska istället för svenska.

## Lösning
Uppdaterade båda prompterna med tydliga instruktioner om att ALLT ska vara på svenska.

## Ändringar

### System Prompt (buildSystemPrompt):
```
CRITICAL - OUTPUT LANGUAGE:
- ALL recipe content (title, steps, personaLines) MUST be in SWEDISH (Svenska)
- Write as if you're speaking Swedish while maintaining your character
- Only ingredient names and technical terms can be in English if needed
```

**Exempel på svenska (tillagda):**
- Normal: "Koka pasta i saltat vatten"
- Ghostface: "Koka vattnet - men är det pastan som verkligen dör här?"
- Wednesday: "Koka vatten. Titta på hur den långsamt förgås."
- Beetlejuice: "SHOWTIME! Koka vattnet! BAM!"
- Hannibal: "För exakt 2L vatten till kraftig kokning."

### User Prompt (buildUserPrompt):
```
CRITICAL: ALL TEXT MUST BE IN SWEDISH (Svenska)!

1. **Title** (PÅ SVENSKA): Rewrite title...
   - Example: Ghostface → "Vad Är Din Favorit-Scary-Pasta?"
   - Example: Dracula → "Midnattens Blodröda Tomatbisque"
   - Example: Wednesday → "Existentiell Pasta-ångest"

3. **Steps** (PÅ SVENSKA): Write cooking instructions...
   EXAMPLES (IN SWEDISH):
   - Ghostface: "Koka vattnet - men är det verkligen pastan som dör här?"
   - Wednesday: "Koka vatten. Tillsätt pasta. Titta på hur den långsamt förgås."
   
4. **PersonaLines** (PÅ SVENSKA): Add lines...
   - Example Ghostface: "Gillar du skrämmande pasta?"
   - Example Wednesday: "Jag föredrar min pasta mörk som min själ."
```

## Resultat

### Före (engelska):
```json
{
  "title": "What's Your Favorite Scary Pasta?",
  "steps": [
    "Boil the water - or is it the pasta that's really dying?",
    "Add tomatoes. Chop chop!"
  ],
  "personaLines": [
    "Do you like scary pasta?"
  ]
}
```

### Efter (svenska):
```json
{
  "title": "Vad Är Din Favorit-Scary-Pasta?",
  "steps": [
    "Koka vattnet - men är det pastan som verkligen dör här?",
    "Tillsätt tomater. Chop chop!"
  ],
  "personaLines": [
    "Gillar du skrämmande pasta?"
  ]
}
```

## Exempel per Persona (Svenska)

### Ghostface:
- **Titel**: "Vad Är Din Favorit-Scary-Pasta?"
- **Steg**: "Koka vattnet - men är det pastan som dör här? Tillsätt salt som tårar."
- **PersonaLines**: "Gillar du skrämmande pasta? Vad är din favorit?"

### Wednesday Addams:
- **Titel**: "Existentiell Pasta-ångest"
- **Steg**: "Koka vatten. Släpp ner pastan. Titta på hur den långsamt förgås i hettan."
- **PersonaLines**: "Jag föredrar min pasta mörk som min själ."

### Beetlejuice:
- **Titel**: "Beetlejuice Beetlejuice Beetlejuice Pasta!"
- **Steg**: "SHOWTIME! Koka vattnet! Släng i pastan! BAM! Salta upp det!"
- **PersonaLines**: "Det är SHOWTIME i köket!"

### Dracula:
- **Titel**: "Midnattens Blodröda Tomatbisque"
- **Steg**: "För vattnet till kokning vid midnattstimmen. Salta med århundradens precision."
- **PersonaLines**: "Jag har perfektionerat detta recept i århundraden."

### Hannibal Lecter:
- **Titel**: "Pappardelle al Pomodoro med Raffinerad Elegans"
- **Steg**: "För exakt 2 liter vatten till kraftig kokning. Krydda med fleur de sel."
- **PersonaLines**: "Precisionen är av yttersta vikt, min vän."

## Språkregler

✅ **Allt på svenska:**
- Titel
- Steg-för-steg instruktioner
- PersonaLines
- Difficulty ("lätt", "medel", "svår")
- DietTags (svenska om möjligt)

⚠️ **Undantag (kan vara engelska):**
- Ingrediensnamn (t.ex. "pasta", "curry")
- Tekniska termer (t.ex. "al dente", "fleur de sel")
- Persona-specifika engelska uttryck (t.ex. Ash Williams: "groovy", "boom")

## Sammanfattning

Nu genererar AI:n **alla** recept på svenska medan den behåller varje personas unika röst och personlighet! 🇸🇪🎃
