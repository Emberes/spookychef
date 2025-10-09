# 🎬 Film/Serie-Information för Personas

## Vad har lagts till?

Under varje persona-namn visas nu vilken film eller serie karaktären är känd från.

## Exempel på visning:

```
Recept från
━━━━━━━━━━
Ghostface
Scream (1996)
                [IMDb →]
```

## Implementation

### 1. Data (personas_pool.json)
Lagt till `origin` fält för alla 55 personas:

```json
{
  "id": "ghostface",
  "displayName": "Ghostface",
  "imdbUrl": "https://www.imdb.com/title/tt0117571/",
  "origin": "Scream (1996)",
  ...
}
```

### 2. UI (RecipeCard.tsx)
Uppdaterat persona-header för att visa origin:

```tsx
<h2 className="text-2xl font-bold text-primary">
  {persona.displayName}
</h2>
{persona.origin && (
  <p className="text-sm text-muted-foreground mt-1 italic">
    {persona.origin}
  </p>
)}
```

### 3. TypeScript
Uppdaterat interface:

```typescript
persona: {
  id: string;
  displayName: string;
  imdbUrl: string;
  origin?: string;  // ← Nytt fält
}
```

## Alla 55 Personas med Film-info

### Klassiska Slashers:
- **Ghostface** - Scream (1996)
- **Michael Myers** - Halloween (1978)
- **Jason Voorhees** - Friday the 13th (1980)
- **Freddy Krueger** - A Nightmare on Elm Street (1984)
- **Chucky** - Child's Play (1988)
- **Leatherface** - The Texas Chain Saw Massacre (1974)
- **Pinhead** - Hellraiser (1987)

### Psychological Horror:
- **Norman Bates** - Psycho (1960)
- **Jack Torrance** - The Shining (1980)
- **Hannibal Lecter** - The Silence of the Lambs (1991)
- **Jigsaw** - Saw (2004)
- **Carrie White** - Carrie (1976)

### Supernatural/Ghost:
- **Samara Morgan** - The Ring (2002)
- **Sadako Yamamura** - Ring (1998)
- **Kayako Saeki** - Ju-On: The Grudge (2002)
- **The Babadook** - The Babadook (2014)
- **Candyman** - Candyman (1992)
- **Pazuzu** - The Exorcist (1973)

### Gothic/Classic Horror:
- **Count Dracula** - Dracula (1931)
- **Frankenstein's Monster** - Frankenstein (1931)
- **Sweeney Todd** - Sweeney Todd (2007)

### Whimsical/Family Horror:
- **Jack Skellington** - The Nightmare Before Christmas (1993)
- **Sally** - The Nightmare Before Christmas (1993)
- **Oogie Boogie** - The Nightmare Before Christmas (1993)
- **Coraline Jones** - Coraline (2009)
- **Other Mother** - Coraline (2009)
- **Edward Scissorhands** - Edward Scissorhands (1990)
- **Corpse Bride (Emily)** - Corpse Bride (2005)

### Cult/Campy:
- **Beetlejuice** - Beetlejuice (1988)
- **Ash Williams** - Evil Dead (1981)
- **Elvira** - Elvira: Mistress of the Dark (1988)
- **The Sanderson Sisters** - Hocus Pocus (1993)
- **Billy Butcherson** - Hocus Pocus (1993)
- **Sam** - Trick 'r Treat (2007)

### Modern Horror:
- **Art the Clown** - Terrifier (2016)
- **Jennifer Check** - Jennifer's Body (2009)
- **Esther** - Orphan (2009)
- **Annabelle** - The Conjuring (2013)
- **Valak (The Nun)** - The Nun (2018)

### Rob Zombie Universe:
- **Captain Spaulding** - House of 1000 Corpses (2003)
- **Baby Firefly** - House of 1000 Corpses (2003)
- **Otis Driftwood** - House of 1000 Corpses (2003)

### Addams Family:
- **Morticia Addams** - The Addams Family (1991)
- **Gomez Addams** - The Addams Family (1991)
- **Wednesday Addams** - The Addams Family (1991)

### Indie/Cult Horror:
- **Herbert West** - Re-Animator (1985)
- **Victor Crowley** - Hatchet (2006)
- **Leslie Vernon** - Behind the Mask (2006)
- **The Tall Man** - Phantasm (1979)
- **Chromeskull** - Laid to Rest (2009)

### Other:
- **Angela Baker** - Sleepaway Camp (1983)
- **Pyramid Head** - Silent Hill (2006)
- **Toshio Saeki** - Ju-On: The Grudge (2002)
- **Tiffany Valentine** - Bride of Chucky (1998)

## Användarupplevelse

**Före:**
```
Recept från
Ghostface
```

**Efter:**
```
Recept från
Ghostface
Scream (1996)
```

**Fördel:**
- ✅ Användare vet direkt vilken film det är
- ✅ Bättre kontext för dem som inte känner igen namnet
- ✅ Nostalgi för fans som känner igen filmen
- ✅ Länk till IMDb för mer info

## Design

- **Storlek:** Liten text (text-sm)
- **Färg:** Muted foreground (diskret)
- **Stil:** Italic (kursiv) för att skilja från huvudnamnet
- **Placering:** Direkt under persona-namnet

## Resultat

Nu får användare omedelbar kontext för varje karaktär de möter, vilket förbättrar upplevelsen och gör det mer engagerande! 🎬🎃
