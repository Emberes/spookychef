# IMDb Links Update

## Changes Made

### 1. Persona Data Structure
Added `movieImdbUrl` field to all personas in `data/personas_pool.json`:
- `imdbUrl` → Character's IMDb page
- `movieImdbUrl` → Movie's IMDb page

### 2. RecipeCard Component
Updated `components/RecipeCard.tsx`:
- The origin text (e.g., "Scream (1996)") is now clickable and links to the movie's IMDb page
- The big "IMDb" button links to the character's IMDb page

## Example
For Ghostface:
- Origin text "Scream (1996)" → https://www.imdb.com/title/tt0117571/ (movie)
- IMDb button → https://www.imdb.com/character/ch0001497/ (character)

## Technical Details
- Added `movieImdbUrl?: string` to the persona interface in RecipeCard
- Made origin text a clickable link with hover effect when `movieImdbUrl` is available
- Falls back to plain text if `movieImdbUrl` is not present (backward compatibility)
