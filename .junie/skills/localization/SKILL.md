---
name: localization
description: Maintain and synchronize localized JSON files in src/locales.
---

# Localization Skill

Use this skill when adding new text to the application, renaming translation keys, or ensuring that all supported languages are up to date.

## Source of Truth
`src/locales/en.json` is the source of truth. All other locale files must stay synchronized with its keys and structure.

## Localization Workflow

1.  **Update English**: Add or modify keys in `src/locales/en.json`.
2.  **Sync Locales**: Run `npm run locales:sync` to propagate the changes to all other `.json` files in `src/locales/`.
3.  **Translate**: Identify missing translations and translate them. You can use Junie to do this by asking: "Translate the missing keys in the locale files."
4.  **Audit**: Run `npm run locales:audit` to ensure all keys are present and translated.

## Scripts

- `npm run locales:check`: Identifies missing or extra keys across all languages compared to English.
- `npm run locales:sync`: Synchronizes keys from `en.json` to all other locales (adds missing, removes extra).
- `npm run locales:audit`: Checks for missing keys and potential untranslated strings.

## Guidelines

- **Placeholders**: Ensure that placeholders like `{name}`, `{numFound}`, `{elapsed}`, `{score}`, and `{url}` are preserved exactly as they are in all translations.
- **Sorting**: Keep the JSON structure sorted alphabetically. The `locales:sync` script handles this automatically.
- **Consistency**: Use the same tone and style as existing translations in the target language.

## Code Patterns

When using translations in Vue components:
```html
<template>
  <div>{{ $t('header.title') }}</div>
</template>
```

When using translations in TypeScript/JavaScript:
```typescript
import i18n from '@/plugins/i18n';
const message = i18n.global.t('header.title');
```

## Checklist

- [ ] Keys in `en.json` are added/updated.
- [ ] `npm run locales:sync` has been executed.
- [ ] New keys have been translated in all supported languages.
- [ ] Placeholders are correctly preserved.
- [ ] `npm run locales:audit` passes with no issues.
