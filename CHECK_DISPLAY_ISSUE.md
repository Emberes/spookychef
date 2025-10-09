# 🔍 Felsökning - Instruktioner Visas Inte

## Möjliga Problem

### 1. Data returneras inte från API
**Kontrollera:** Öppna Developer Tools (F12) → Network → Generera recept → Klicka på `/api/generate` → Kolla Response

**Vad att leta efter:**
```json
{
  "steps": [
    "Koka vattnet...",
    "Tillsätt pasta..."
  ]
}
```

Om `steps` är tom array `[]` eller saknas → API-problem
Om `steps` finns med text → Frontend-problem

### 2. Frontend renderar inte steps
**Kontrollera:** Öppna Developer Tools (F12) → Console

Lägg till i `components/RecipeCard.tsx` (rad 44, efter `return (`):
```tsx
{console.log('Recipe steps:', recipe.steps)}
```

### 3. CSS döljer instruktionerna
**Kontrollera:** Developer Tools → Elements → Hitta "Instruktioner" section

Leta efter `display: none` eller `visibility: hidden`

## Snabb Fix att Testa

Lägg till detta i `components/RecipeCard.tsx` precis innan `{/* Instructions */}`:

```tsx
{/* DEBUG */}
<div className="p-4 bg-yellow-100 border border-yellow-500">
  <p>DEBUG: Steps count: {recipe.steps?.length || 0}</p>
  {recipe.steps?.map((s, i) => (
    <p key={i}>Step {i + 1}: {s.substring(0, 50)}</p>
  ))}
</div>
```

Detta kommer visa om steps finns i data eller inte.

## Vad Jag Behöver Veta

För att hjälpa dig vidare, berätta:

1. **Ser du ingredienserna?** (Om ja → data fungerar delvis)
2. **Ser du rubriken "Instruktioner"?** (Om ja → rendering fungerar)
3. **Ser du siffrorna (1, 2, 3...)?** (Om ja → loop fungerar men text saknas)
4. **Eller ser du ingen "Instruktioner"-sektion alls?**

## Temporär Workaround

Om API:t returnerar steps men de inte visas, testa detta i `RecipeCard.tsx`:

Byt ut rad 122-129 mot:

```tsx
{recipe.steps && recipe.steps.length > 0 ? (
  recipe.steps.map((step, idx) => (
    <li key={idx} className="flex gap-3">
      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
        {idx + 1}
      </span>
      <span className="pt-0.5">{step}</span>
    </li>
  ))
) : (
  <li>Inga instruktioner tillgängliga</li>
)}
```

Detta kommer visa "Inga instruktioner tillgängliga" om steps är tom.
