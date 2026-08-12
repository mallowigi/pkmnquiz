---
sessionId: session-260812-210506-h1n9
---

# Requirements

### Overview & Goals
Make the leaderboard loading-to-loaded handoff feel smooth in `src/components/start/leaderboards/Leaderboards.vue` without the table snapping to a new height when the fetched row count differs from the skeleton row count.

### In Scope
- Improve the transition between `SkeletonTable.vue` and `LeaderboardTable.vue`.
- Keep the solution local to the leaderboard UI so it works for both callers:
  - `src/components/dialogs/leaderboards/LeaderboardBrowser.vue` (`limit=10`)
  - `src/components/dialogs/leaderboards/LeaderboardMyRecords.vue` (`limit=3`)
- Preserve the current async loading flow based on `Suspense` and top-level `await`.

### Out of Scope
- Changing Firebase query behavior in `src/composables/useLeaderboards.ts`.
- Adding new global animation infrastructure.
- Reworking the leaderboard filters or dialog structure.

### Acceptance Criteria
- Loading no longer collapses/expands abruptly when the real result count is smaller than the skeleton count.
- Empty-state rendering (`no records`) transitions smoothly from loading as well.
- The behavior remains compatible with the existing `MorphTransition`/`Suspense` composition and keyed leaderboard refreshes in `LeaderboardBrowser.vue`.

# Technical Design

### Current Implementation
- `src/components/start/leaderboards/Leaderboards.vue` wraps `Suspense` in `MorphTransition` and swaps `SkeletonTable` fallback for `LeaderboardTable`.
- `src/components/start/leaderboards/SkeletonTable.vue` renders `props.limit ?? 3` placeholder rows, so its height is fixed by the requested limit rather than by the eventual result size.
- `src/components/start/leaderboards/LeaderboardTable.vue` fetches data with top-level `await getLeaderboardsAsync(props)` and then renders either:
  - a `.table-container > .leaderboard-table` with `topTrainers.length` rows, or
  - a separate `.no-records` block.
- `src/components/common/transitions/MorphTransition.vue` currently animates `all`, which fades/blurs the swap but does not intentionally manage container height.

### Best-Practice Direction
For table skeletons, the most reliable pattern is usually:
1. keep the outer shell stable,
2. animate opacity/content swaps inside that shell,
3. animate the shell height separately when loaded content is shorter/taller.

That avoids the common jarring effect of forcing the skeleton to exactly predict final row count, while still letting the container resize smoothly.

### Proposed Changes
- Treat `Leaderboards.vue` as the orchestration shell for layout animation.
- Introduce a dedicated inner wrapper around the fallback/default content whose block size can be measured and animated.
- Keep `SkeletonTable.vue` as an approximate layout placeholder, but stop depending on matching its row count to the final data count for smoothness.
- Refine `MorphTransition.vue` usage or local leaderboard styles so content swap animation focuses on `opacity`/`filter`/`transform`, while height interpolation is handled by the leaderboard shell.
- Ensure the `LeaderboardTable.vue` empty state participates in the same shell sizing logic, so loading -> empty also feels deliberate rather than collapsing suddenly.

### Current Implementation Slice
- Start with Delivery Step 1 only: implement the stable animated shell in `src/components/start/leaderboards/Leaderboards.vue`.
- Defer row-alignment tweaks in `SkeletonTable.vue`, root-wrapper normalization in `LeaderboardTable.vue`, and any `MorphTransition.vue` tuning until the shell behavior is in place and can be evaluated.

### Component Map
- `Leaderboards.vue`: owns the transition shell and any measured height / wrapper state needed for smooth resizing.
- `SkeletonTable.vue`: remains presentational; may be adjusted to better mirror table spacing, but should not own transition orchestration.
- `LeaderboardTable.vue`: remains the async content renderer; may need a stable root wrapper/class so the parent shell can measure it consistently.
- `MorphTransition.vue`: likely unchanged structurally, but its animation contract should be considered when tuning the leaderboard swap.

### File Impact
- `src/components/start/leaderboards/Leaderboards.vue`
  - Add a stable animated shell around the suspense content.
  - Coordinate smooth height changes during fallback/default swaps.
- `src/components/start/leaderboards/LeaderboardTable.vue`
  - Preserve a measurable root for both table and empty states.
- `src/components/start/leaderboards/SkeletonTable.vue`
  - Keep placeholder layout aligned with the real table spacing; optionally reduce visual mismatch in row sizing.
- `src/components/common/transitions/MorphTransition.vue`
  - Reuse as-is if sufficient, or minimally tune only if the leaderboard shell still conflicts with `transition: all`.

### Risks
- Animating `height` directly can be brittle if applied on the same node as the content fade swap; the plan should keep content transition and container-size transition separated.
- `KeepAlive` + `Suspense` means the solution should avoid relying on mount timing that only works on first render.
- The browser view re-keys `Leaderboards` on filter changes, so the shell logic must behave well on repeated pending/resolved cycles.

# Testing

### Validation Approach
- Verify visually in both leaderboard consumers that the table shell no longer jumps when data resolves.
- Check both large-limit and small-limit cases because the feature is used with `10` rows in `LeaderboardBrowser.vue` and `3` rows in `LeaderboardMyRecords.vue`.

### Key Scenarios
- Loading skeleton -> full results where returned rows are fewer than `props.limit`.
- Loading skeleton -> full results where returned rows equal `props.limit`.
- Loading skeleton -> empty `no records` state.
- Filter changes in `LeaderboardBrowser.vue` that re-trigger the keyed `Leaderboards` instance.

### Edge Cases
- Very short result sets (`0` or `1` row).
- Rapid filter switching while async requests are resolving.
- Mobile-width overflow in `.table-container` while the shell height animates.

# Delivery Steps

###   Step 1: Add a stable animated shell around leaderboard loading and resolved states
The leaderboard container resizes smoothly instead of snapping when `Suspense` swaps the fallback and resolved content.

- Update `src/components/start/leaderboards/Leaderboards.vue` to own a measurable wrapper around the `SkeletonTable`/`LeaderboardTable` content.
- Separate container-size animation from the existing content morph so the shell interpolates height while the inner content fades/blurs.
- Keep the current `Suspense`-based async flow intact so callers do not need API changes.
- Use this as the first implementation slice before deciding whether follow-up adjustments are needed in `LeaderboardTable.vue`, `SkeletonTable.vue`, or `MorphTransition.vue`.

###   Step 2: Align the loaded and loading leaderboard roots for consistent measurement
Both skeleton and resolved leaderboard states expose predictable dimensions to the parent shell.

- Adjust `src/components/start/leaderboards/LeaderboardTable.vue` so the table state and `.no-records` state share a stable measurable root.
- Tweak `src/components/start/leaderboards/SkeletonTable.vue` only as needed to better match the real table row spacing and reduce perceived mismatch.
- Review whether `src/components/common/transitions/MorphTransition.vue` needs a minimal tuning to avoid conflicting with the new shell-based height animation.

###   Step 3: Validate the transition in both leaderboard contexts and state variations
The smooth transition works for browse and personal leaderboards, including empty and short-result cases.

- Verify the behavior in `src/components/dialogs/leaderboards/LeaderboardBrowser.vue` with its keyed filter changes and `limit=10` usage.
- Verify the behavior in `src/components/dialogs/leaderboards/LeaderboardMyRecords.vue` with `limit=3`.
- Check loading-to-results, loading-to-empty, and short-result cases to ensure the shell animation feels intentional and not delayed or flickery.