# 📋 Hur Instruktionerna Färgas av Karaktären

## Översikt

Varje steg i receptet skrivs **helt och hållet** i karaktärens röst och stil. Inte bara innehållet, utan språket, tonen och stilen anpassas.

## Samma Recept, Olika Personas

### Exempel: "Pasta med Tomatsås"

#### 🔪 Steg 1: "Koka pasta"

**Neutralt (utan persona):**
> Koka pastan i saltat vatten i 8-10 minuter tills al dente.

**Ghostface (meta, ifrågasättande):**
> Koka pastan - eller är det mordet på den perfekta texturen vi begår här? Tillsätt salt. Vad är din favorit-saltmängd? 8-10 minuter tills al dente... om du vågar.

**Freddy Krueger (nightmare puns):**
> Dröm om perfekt pasta medan vattnet kokar. One, two, Freddy's cooking for you... 8-10 minuter tills dina matlagningsmardrömmar blir verklighet. Al dente eller al death? Du väljer.

**Dracula (aristokratisk):**
> Beredt vattnet vid midnattstimmen. Tillsätt pasta med gammal-världens precision. Låt den koka i exakt 8 minuter under månskenet. Al dente, naturligtvis - jag har förfinat denna konst i århundraden.

**Wednesday Addams (deadpan, morbid):**
> Koka vattnet. Släpp ner pastan. Titta på hur den långsamt dör i hettan. 8-10 minuter av dödlig langsamhet. Al dente betyder "till tanden" på italienska. Hur deprimerande romantiskt.

**Beetlejuice (kaotisk showman):**
> IT'S SHOWTIME BABY! Får vi kokande vatten här! BOOM! Släng i pastan som en PROFFS! Salt? JA! Hur mycket? Ingen aning! 8-10 minuter av KAOS! Al dente? Al AWESOME!

**Ash Williams (groovy, tool references):**
> Alright, groovy. Get that water boiling like a boss. Throw the pasta in - boom, just like loading my boomstick. Salt it up. 8-10 minutes till it's al dente. Shop smart, cook smart.

**Hannibal Lecter (sofistikerad gourmet):**
> Bring precisely 2 liters of water to a vigorous boil. Add 15 grams of fleur de sel - precision is paramount. Immerse the pasta gently, as one would lower a fine cello into its case. 8 minutes precisely, monitored with a timer. Al dente, comme il faut.

**Jack Skellington (enthusiastisk):**
> What's this? What's this? There's boiling everywhere! What's this? The pasta goes in there! With salt and care and bubbling flair! Cook for 8-10 minutes with holiday cheer! Al dente's here!

**Carrie White (nervös, orolig):**
> Um... carefully bring the water to boil. Please don't let it overflow. Add the pasta slowly - I hope I don't mess this up. Salt? Is that too much? 8-10 minutes... I'll set three timers just in case. What if it burns?

**Morticia Addams (elegant macabre):**
> Gracefully heat the water to a rolling boil. Add pasta with poisonous... I mean, delicious elegance. A pinch of salt, dark as midnight. Allow it to cook for 8-10 minutes whilst the shadows dance. Al dente, darling.

#### 🍅 Steg 2: "Tillaga tomatsås"

**Neutralt:**
> Fräs vitlök i olivolja, tillsätt tomater och koka i 5 minuter.

**Ghostface:**
> Ring ring! Vem är där? Vitlök? Fräs den tills den skriker... jag menar sizzlar. Tomater? Chop chop! Eller är det slash slash? Koka i 5 minuter. Vad är din favorit scary-sås?

**Wednesday:**
> Fräs vitlök. Doften är nästan uthärdlig. Tillsätt tomater. Röda som blod men betydligt mindre intressant. Låt dem koka i sina egna juicer i 5 minuter. Poetiskt på ett dystert sätt.

**Beetlejuice:**
> GARLIC TIME! Fräs den! SIZZLE SIZZLE! Nu kommer tomaterna - SPLAT! BAM! POW! Rör om som en galen clown! 5 minuter av RENT KAOS i köket!

**Hannibal:**
> Gently sauté 3 cloves of garlic in extra virgin olive oil from Tuscany. When the aroma crescendos like a fine symphony, introduce San Marzano tomatoes. Simmer for precisely 5 minutes, reducing to a velvety consistency.

#### 🍽️ Steg 3: "Servera"

**Neutralt:**
> Blanda pastan med såsen och servera.

**Ghostface:**
> Final scene! Blanda pasta och sås - eller är det början på något ännu mer scary? Servera med... dramatisk paus... parmesan?

**Freddy:**
> Sweet dreams are made of this... Blanda pastan med din nightmare-sås. Servera innan du vaknar. One, two, Freddy's serving you!

**Wednesday:**
> Kombinera pastan med såsen. Observera hur de förenas i en dans av kulinarisk futility. Servera. Ät. Existera vidare.

**Beetlejuice:**
> GRAND FINALE! Mix it all together like a TORNADO! Servera på tallriken - PRESENTATION BABY! Ta ett foto! Post it! EAT IT! SHOWTIME!

**Hannibal:**
> Unite the pasta and sauce with the precision of a surgeon. Plate with architectural elegance. Garnish with fresh basil and aged Parmigiano-Reggiano. Serve at precisely 68°C.

## Teknisk Implementation

### System Prompt säger:
```
CRITICAL - EMBODY THE CHARACTER IN EVERY STEP:
- EVERY cooking step must be written in ${persona.displayName}'s voice
- Don't just list instructions - make them sound like the character is talking

EXAMPLES:
- Normal: "Boil water and add pasta"
- Ghostface: "Boil the water - but is it the pasta that's really dying?"
- Wednesday: "Boil water. Add pasta. Watch it slowly perish."
```

### User Prompt säger:
```
3. **Steps**: Write cooking instructions in the persona's voice

EXAMPLES for "Cook pasta in salted water":
- Ghostface: "Boil the water - or is it the pasta that's really dying?"
- Wednesday: "Boil water. Add pasta. Watch it slowly perish."
- Beetlejuice: "SHOWTIME! Throw that pasta in! BAM!"
[10+ konkreta exempel]

Write ALL steps in this character-specific style!
```

## Resultat

### Före förbättring:
```json
{
  "steps": [
    "Koka pastan i saltat vatten",
    "Fräs vitlök och tillsätt tomater",
    "Blanda och servera"
  ]
}
```

### Efter förbättring:
```json
{
  "personaId": "wednesday_addams",
  "steps": [
    "Koka vattnet. Släpp ner pastan. Titta på hur den långsamt dör i hettan. 8-10 minuter av dödlig precision.",
    "Fräs vitlök. Doften är nästan behaglig. Tillsätt tomater. Röda som blod men mindre intressanta. Koka i 5 minuter.",
    "Kombinera pastan med såsen. En dans av kulinarisk futility. Servera. Ät. Existera vidare i din betydelselöshet."
  ],
  "personaLines": [
    "I prefer my pasta like I prefer my outlook: dark.",
    "Mother says I should eat more. How tedious."
  ]
}
```

## Nyckelpunkter

✅ **VARJE steg** skrivs i karaktärens röst  
✅ **Konkreta exempel** i prompten visar AI:n hur  
✅ **Konsekvent ton** genom hela receptet  
✅ **Karaktärsspecifika ord och fraser** används  
✅ **Personlighet** genomsyrar instruktionerna  

## Sammanfattning

Instruktionerna är inte bara "steg att följa" - de är **karaktären som undervisar dig i matlagning**. Samma grundrecept blir en helt annan upplevelse beroende på vem som "lär ut" det! 🎃👨‍🍳
