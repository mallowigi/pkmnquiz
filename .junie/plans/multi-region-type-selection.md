---
sessionId: session-260803-063806-2262
---

# Requirements

### Overview & Goals
Allow users to select multiple regions (Generations) or multiple Pokémon types for a single game session. Currently, the app only supports selecting a single region or a single type.

### Scope
- **In Scope**:
    - Update `useCurrentGen` and `useCurrentType` stores to store arrays of selections.
    - Update Pokémon filtering logic to include all Pokémon matching any of the selected regions/types.
    - Update the Start Screen UI to allow toggling multiple selections and starting the game with a dedicated button.
    - Ensure saved games and profile statistics correctly handle multiple selections.
- **Out of Scope**:
    - Mixing regions and types in the same game (e.g., Kanto + Fire type).
    - Changing other game modes like "Mega" or "Special" to support multiple sub-selections (unless they already use boxes/types).

### Functional Requirements
- Users can click multiple regions in the Region Selection screen.
- Users can click multiple types in the Type Selection screen.
- A "Start Quiz" button appears once at least one selection is made.
- The game includes all Pokémon that belong to any of the selected regions/types.
- The game title/mode name reflects all selected items (e.g., "Kanto, Johto").
- Completing a game increments the finished game count for all selected regions/types in the user profile.


# Technical Design

### Current Implementation
- `useCurrentGen` stores a single `Gen | null`.
- `useCurrentType` stores a single `Type | null`.
- `usePokemons` filters Pokémon based on these single values.
- `GenChooser.vue` and `TypeChooser.vue` immediately start the game upon clicking a single item.

### Key Decisions
- **State Structure**: Change `gen` and `currentType` to `gens: Gen[]` and `types: Type[]` respectively to support zero or more selections.
- **UI Interaction**: Use a "Toggle and Start" pattern. Clicking an item toggles its presence in the selection array. A "Start" button initiates the game.
- **Filtering Logic**: Use `OR` logic for multiple selections. A Pokémon is included if it matches *any* of the selected regions (in Gen mode) or *any* of the selected types (in Types mode).

### Proposed Changes

#### Stores
- **`useCurrentGen.ts`**:
    - State: `gens: Gen[]`
    - Actions: `toggleGen(gen: Gen)`, `setGens(gens: Gen[])`, `clearGens()`
    - Getters: `getCurrentGens()` (returns `GenerationInfo[]`)
- **`useCurrentType.ts`**:
    - State: `types: Type[]`
    - Actions: `toggleType(type: Type)`, `setTypes(types: Type[])`, `clearTypes()`
    - Getters: `getCurrentTypes()` (returns `TypeInfo[]`)

#### Logic
- **`usePokemons.ts`**:
    - `getCurrentGenPokemon()`: Map over `getCurrentGens()` and merge their Pokémon maps.
    - `getCurrentTypePokemon()`: Map over `getCurrentTypes()` and merge their Pokémon maps.
    - `isPokemonInCurrentGameMode()`: Update `case 'gen'` and `case 'types'` to use `.some()` or `.includes()` against the selection arrays.

#### UI
- **`GenChooser.vue`**:
    - Add `active` class to selected gen cells (white outline).
    - Add a `RoundedButton` for "Start Quiz" in the top row.
- **`TypeChooser.vue`**:
    - Add `active` class to selected type buttons.
    - Add a `RoundedButton` for "Start Quiz" in the bottom row (column 3).

### File Structure
- `src/stores/useCurrentGen.ts` (Modified)
- `src/stores/useCurrentType.ts` (Modified)
- `src/stores/usePokemons.ts` (Modified)
- `src/stores/useProfile.ts` (Modified)
- `src/composables/useQuiz.ts` (Modified)
- `src/composables/useSavedData.ts` (Modified)
- `src/components/start/genSelection/GenChooser.vue` (Modified)
- `src/components/start/genSelection/TypeChooser.vue` (Modified)
- `src/types.ts` (Modified)


# Testing

### Validation Approach
- Verify that clicking multiple regions highlights all of them.
- Verify that the "Start Quiz" button only appears when at least one region/type is selected.
- Verify that the resulting quiz contains Pokémon from all selected regions/types.
- Verify that the game header shows the correct list of regions/types.
- Verify that saving and reloading a game with multiple selections works correctly.
- Verify that finishing a multi-region game increments statistics for all selected regions.

### Key Scenarios
1.  **Multi-Region Quiz**: Select Gen 1 and Gen 2 -> Start -> Check if both Kanto and Johto Pokémon are present.
2.  **Multi-Type Quiz**: Select Fire and Water -> Start -> Check if both Fire and Water Pokémon are present.
3.  **Persistence**: Start a multi-region quiz -> Refresh page -> Check if the quiz resumes with the same regions.
4.  **Profile Stats**: Finish a Gen 1 + Gen 2 quiz -> Check profile stats to see if both Gen 1 and Gen 2 counts increased.


# Delivery Steps

###   Step 1: Update stores for multi-selection support
Update `useCurrentGen` and `useCurrentType` stores to support multiple selections.
- Change `gen` and `currentType` state to arrays (`gens` and `types`).
- Add `toggleGen` and `toggleType` actions.
- Update getters to handle multiple items.
- Update `SaveData` and `Profile` types to match the new state structure.


###   Step 2: Adapt Pokémon filtering logic for multiple regions/types
Modify `usePokemons.ts` to filter Pokémon based on multiple regions or types.
- Update `getCurrentGenPokemon` and `getCurrentTypePokemon` to aggregate results from all selected items.
- Update `isPokemonInCurrentGameMode` to check if a Pokémon belongs to any of the selected regions or types.
- Update `getRandomPokemon` and other helper functions to work with multiple selections.


###   Step 3: Update composables and persistence logic
Update `useQuiz` and `useSavedData` to handle the new multi-selection state.
- Update `useQuiz.ts` to start games with multiple selected items.
- Modify `getGameModeName` to display all selected regions/types.
- Update `useSavedData.ts` to correctly serialize and deserialize the new array-based state.
- Update `useProfile.ts` to increment finished game counters for all involved regions/types.


###   Step 4: Implement multi-selection UI and Start buttons
Implement multi-selection UI in `GenChooser.vue` and `TypeChooser.vue`.
- Change click behavior to toggle selection instead of starting the game immediately.
- Add a "Start Quiz" button that appears when at least one item is selected.
- Add visual indicators (active state/borders) for selected regions and types.
- Ensure the layout remains consistent across mobile and desktop views.
