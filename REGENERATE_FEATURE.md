# ✨ "Generera om" Feature - Uppdaterad

## Vad har ändrats?

"Generera om"-knappen tar nu **ett nytt recept** från sökningen istället för att bara rensa skärmen.

## Hur det fungerar nu:

### 1. Initial sökning
När användaren söker efter recept:
- `/api/search` returnerar **top 10 kandidat-recept** baserat på Jaccard-matchning
- Första receptet används direkt
- Alla 10 kandidater sparas i frontend state

### 2. Generera om
När användaren klickar "Generera om":
- **Nästa recept** från de 10 kandidaterna används (cyklar runt)
- Samma persona behålls för hela chatten
- Nya recept genereras direkt utan ny sökning
- Snabbare respons (ingen sökning behövs)

## Användarupplevelse:

**Före:**
1. Söker efter "pasta, tomat, vitlök"
2. Får recept från Ghostface
3. Klickar "Generera om"
4. ~~Skärmen rensas, måste söka igen~~

**Efter:**
1. Söker efter "pasta, tomat, vitlök" → får 10 matchande recept
2. Ser recept #1 från Ghostface
3. Klickar "Generera om" → får recept #2 från Ghostface
4. Klickar igen → får recept #3 från Ghostface
5. ...osv (cyklar igenom alla 10)

## Fördelar:

✅ **Snabbare** - Ingen ny sökning behövs  
✅ **Mer variation** - Användare ser fler olika recept  
✅ **Bättre UX** - Ingen frustrerad "tillbaka och sök igen"-känsla  
✅ **Behåller kontext** - Samma ingredienser, diet, allergier  
✅ **Samma persona** - Konsekvent upplevelse i chatten  

## Teknisk implementation:

### Frontend State (app/page.tsx):
```typescript
const [searchCriteria, setSearchCriteria] = useState<{
  ingredients: string[];
  diet: string[];
  allergies: string[];
} | null>(null);
const [allCandidates, setAllCandidates] = useState<any[]>([]);
const [currentCandidateIndex, setCurrentCandidateIndex] = useState(0);
```

### API Response (app/api/search/route.ts):
```typescript
return NextResponse.json({
  candidate,           // Top kandidat (används direkt)
  candidatesTried,    // IDs för loggning
  allCandidates,      // Top 10 för regenerering
});
```

### Regeneration Logic:
```typescript
const handleRegenerate = async () => {
  // Cykla till nästa kandidat
  const nextIndex = (currentCandidateIndex + 1) % allCandidates.length;
  const nextCandidate = allCandidates[nextIndex];
  
  // Generera nytt recept med samma persona
  // ...
};
```

## Edge Cases:

- Om bara 1 kandidat hittas → återanvänder samma recept (men med ny AI-generering = lite olika)
- Om sökningen misslyckas → felmeddelande visas
- Persona förblir densamma för hela chatt-sessionen

## Resultat:

Användare kan nu enkelt utforska flera recept-alternativ utan att behöva söka om! 🎃✨
