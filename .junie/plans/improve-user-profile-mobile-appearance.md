---
sessionId: session-260815-161445-122u
---

# Requirements

### Overview & Goals
The goal of this task is to make the application's overlays (dialogs, pause menu, etc.) scrollable when their content exceeds the available screen height. This is particularly important for mobile devices where screen real estate is limited and content like the user profile might not fit entirely within the viewport.

### Scope
- **In Scope**:
    - Update the `Overlay.vue` component to support full-overlay scrolling.
    - Ensure all dialogs and overlays using the `Overlay` component benefit from this change.
    - Specifically fix the `PauseOverlay.vue` which currently blocks scrolling.
- **Out of Scope**:
    - Changing components that do not use the `Overlay` base component (e.g., `Help.vue`, `Credits.vue`).
    - Redesigning the layout of individual dialogs beyond ensuring they can scroll.

### User Stories
- As a mobile user, I want to be able to scroll down the user profile dialog so that I can see all my stats and the sign-out button even on small screens.

### Functional Requirements
- Overlays must allow vertical scrolling if the content is taller than the screen.
- The entire overlay (including background) should scroll, ensuring the dialog remains centered when it fits but is accessible when it doesn't.
- Prevent the "top-clipping" issue where the top of a centered dialog becomes unreachable when it overflows the viewport.

# Technical Design

### Current Implementation
- **Overlay.vue**: Uses a fixed `100dvh` container with `overflow: hidden` on mobile. The inner `overlay-wrapper` uses `height: 100%` and flex centering (`align-items: center`), which causes content clipping when it exceeds the viewport height.
- **PauseOverlay.vue**: Explicitly sets `overflow: hidden` on its `.prompt` container, preventing any internal scrolling.
- **Centered Content**: The combination of `height: 100%` and `align-items: center` makes the top and bottom of overflowing content unreachable.

### Key Decisions
- **Full Overlay Scroll**: The entire overlay will become the scroll container. This is simpler to implement and ensures that even the background can scroll, providing a consistent experience for long dialogs.
- **Flexbox & Margin Auto**: Use `min-height: 100%` on the wrapper and `margin: auto` on the dialog content (`.prompt`) to ensure perfect centering when content fits, and natural flow/scrolling when it doesn't.

### Proposed Changes
- **Overlay.vue**:
    - Remove `overflow: hidden` from `.overlay` mobile styles.
    - Set `overflow-y: auto` on `.overlay` to enable scrolling.
    - Change `.overlay-wrapper` from `height: 100%` to `min-height: 100%` and `height: auto`.
    - Add `margin: auto` to `:deep(.prompt)` to handle centering and prevent top-clipping.
- **PauseOverlay.vue**:
    - Remove `overflow: hidden` from `.prompt`.

### File Structure
The following files will be modified:
- `src/components/common/Overlay.vue`
- `src/components/background/PauseOverlay.vue`

# Delivery Steps

### ✓ Step 1: Optimize UserProfileDialog layout and avatar size
The profile dialog will have reduced gaps and a smaller avatar when viewed on mobile devices.

- Update `src/components/dialogs/UserProfileDialog.vue` to include `.mobile &` styles for `.profile-dialog` and `.profile-avatar`.
- Reduce the `gap` in `.profile-dialog` from 20px to 12px on mobile.
- Adjust the avatar size to 80px (from 100px) on mobile.
- Reduce the bottom margin of the avatar and the profile name.

### ✓ Step 2: Adjust font sizes in ProfileStats grid
The 2x2 stats grid will have optimized font sizes to prevent text wrapping or overflow on narrow screens.

- Update `src/components/dialogs/userProfile/ProfileStats.vue` with mobile-specific styles.
- Reduce `stat-label` font-size to 10px-12px on mobile.
- Reduce `stat-value` font-size to 18px-20px on mobile.
- Ensure the `RoundedBox` components within the grid handle the reduced space gracefully.

### ✓ Step 3: Refine ProfileDetailedStats and StatGrid responsive behavior
The detailed stats breakdown and grid will be more compact and flexible on mobile.

- Update `src/components/dialogs/userProfile/ProfileDetailedStats.vue` to reduce `margin-top` and `tab-btn` padding on mobile.
- Update `src/components/dialogs/userProfile/ProfileStatGrid.vue` to change the `minmax` width of grid items from 120px to 90px-100px on mobile.
- Ensure the breakdown title and tabs are well-aligned on small screens.

### ✓ Step 4: Enable full-overlay scrolling in Overlay.vue
The main overlay component will support scrolling when content exceeds the viewport height.

- Update `src/components/common/Overlay.vue`.
- Set `overflow-y: auto` on `.overlay` and remove `overflow: hidden` from mobile styles.
- Change `.overlay-wrapper` to use `min-height: 100%` and `height: auto`.
- Apply `margin: auto` to `:deep(.prompt)` to ensure centering and prevent top-clipping.

### ✓ Step 5: Fix scroll blocking in PauseOverlay.vue
The pause menu will allow scrolling if its content somehow exceeds the screen height.

- Update `src/components/background/PauseOverlay.vue`.
- Remove `overflow: hidden` from the `.prompt` class.