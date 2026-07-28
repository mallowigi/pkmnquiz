# AI Agent Instructions for pkmnquiz

This document provides essential context and patterns to help AI agents be productive in this Vue 3 / Vite codebase.

## 🏗 System Architecture & State Management

- **Vue 3 Composition API**: Use `<script setup lang="ts">` exclusively. Avoid Options API and `defineComponent` wrapping unless strictly necessary.
- **Pinia Setup Stores**: Stores in `src/stores/` use the Setup pattern with a single `reactive` object state (e.g., `const state = reactive({...})`) rather than grouping multiple `ref`s.
- **Pinia Auto-Save Plugin**: Game state saves automatically through a custom plugin (`src/stores/piniaStorePlugin.ts`) that listens to store mutations and fires `useSavedData().autoSave`. You rarely need to handle save logic manually unless you're introducing a new store and need to ensure it's not excluded.
- **Store HMR Boilerplate**: Always include the HMR acceptance boilerplate at the very bottom of every new store:
  ```typescript
  if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useYourStore, import.meta.hot));
  }
  ```

## 🔌 Data & Code Splitting

- **Dynamic Data Loading**: Heavy JSON datasets (like Pokémon species/namings in `src/data/*.json`) are loaded dynamically at runtime via `await import('@/data/...json')` (see `usePkmnStore.ts`). DO NOT import these large files at the top level of stores or components if it can be avoided, to keep initial bundle sizes small.

## 🗺 Component Conventions & Communication

- **Centralized Dialogs**: Do not embed dialog/modal UI into random components. Dialog state is managed globally via `useDialogs.ts` and rendered centrally in `src/components/dialogs/Dialogs.vue`. To open a dialog, use `setDialog('dialogName', callback)`.
- **CSS Theming**: Use CSS variables (e.g., `var(--text)`, `var(--primary)`) defined globally in `App.vue` for all styling. Dark mode swaps styles globally by toggling a `.dark` class on the `<main>` element; avoid hardcoding dark-mode hex codes in individual components.
- **Import Paths**:
  - ALWAYS use the path alias `@/` for imports within `src`.
  - ALWAYS include `.vue` extensions for Vue component imports (e.g. `import GameHeader from '@/components/header/GameHeader.vue'`).

## 🛠 Developer Workflows

- **Node Engine**: Requires Node `^20.19.0` or `>=22.12.0`.
- **Scripts**:
  - Use `npm run dev` to start the Vite dev server with Hot Module Replacement.
  - Use `npm run build` to run `vue-tsc` type-checking before Vite build. No explicit test runner is configured.

## 🧩 Common Patterns

- **Reusable Translation Keys**: For any text that appears in multiple places (e.g., "Start Game", "Next"), define a translation key in `src/locales` and use it consistently across components rather than nest it. For example, if you have a "Reset" text, use it as `{{ $t('reset') }}` everywhere instead of hardcoding "Reset" in multiple components.
- **Consistent Naming**: Use consistent naming conventions for components, variables, and functions. For example, use `camelCase` for variables and functions, and `PascalCase` for components.
- **Error Handling**: Always handle errors gracefully and provide meaningful error messages to users. Use try-catch blocks to catch and handle errors, and log errors to the console for debugging purposes.

## 📚 Documentation

- **Component Documentation**: Document each component with a brief description, props, and usage examples. Use JSDoc-style comments for Vue components.
- **Code Comments**: Write clear and concise comments to explain complex logic or non-obvious code paths. Avoid excessive commenting; code should be self-explanatory.
- **Version Control**: Use Git for version control. Follow a branching strategy (e.g., feature branches) and use meaningful commit messages.
- **Code Formatting**: Use consistent code formatting with tools like Prettier. Configure Prettier to enforce your team's coding style and integrate it with your editor for automatic formatting on save.
- **Code Review**: Conduct regular code reviews to ensure code quality, consistency, and adherence to coding standards. Use tools like Code Climate or SonarQube for automated code review and analysis.

## 🌐 Localization & Internationalization

Maintain localized JSON files in `src/locales/`. For detailed instructions, scripts, and workflows, refer to the **localization** skill.
