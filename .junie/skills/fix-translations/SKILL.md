---
name: fix-translations
description: Automatically identifies and fixes missing or outdated translations across all supported languages. Use this skill when you need to synchronize locales with English, translate missing strings, or resolve audit issues in the localization files.
---

# Fix Translations

This skill provides a structured workflow for maintaining and repairing translations in the `pkmnquiz` project, leveraging existing npm scripts and AI-powered translation.

## Overview

Maintaining multiple languages requires ensuring that all keys present in English (`en.json`) are accurately translated in all other locale files. This skill automates the detection of missing keys and provides a clear path for translating them using AI while preserving technical constraints like placeholders and JSON structure.

## Workflow

Follow these steps to ensure all translations are up to date and consistent.

### 1. Synchronize Locales
Run the sync script to propagate keys from `en.json` (the source of truth) to all other locale files.
```bash
npm run locales:sync
```
This script will:
- Add missing keys to other locales, prefixed with `__MISSING_TRANSLATION__:`.
- Remove extra keys that no longer exist in `en.json`.
- Sort all JSON files alphabetically for consistency and better diffing.

### 2. Identify Missing Translations
Scan the locale files for the `__MISSING_TRANSLATION__` marker.
You can use the helper script provided in this skill to list all missing translations across all files:
```bash
node .junie/skills/fix-translations/scripts/list_missing.js
```
Or use `grep` to see which files need attention:
```bash
grep -r "__MISSING_TRANSLATION__" src/locales/*.json
```

### 3. Translate Missing Keys
For each file containing missing translations:
1.  Read the file content.
2.  Extract the English source text from the marker (e.g., `"key": "__MISSING_TRANSLATION__:Start Game"`).
3.  Translate the text into the target language, preserving any placeholders like `{name}`, `{numFound}`, `{score}`, etc.
4.  Replace the entire marked string with the translation.

**Agent Action:** You can perform this step by reading the JSON file and applying the translations. If there are many keys, you may want to process them in batches or ask for the specific language to be updated.

### 4. Audit and Verify
After applying translations, run the audit script to catch any remaining issues, such as missing "Mega" terms or other project-specific requirements.
```bash
npm run locales:audit
```
If the audit reports issues (e.g., `- some.key [OUTDATED (Mega)]: "..." should be based on "..."`), fix them by updating the corresponding values in the locale files.

## Guidelines

- **Placeholders**: Never translate or modify placeholders within curly braces: `{score}`, `{name}`, `{elapsed}`, `{url}`, etc.
- **Source of Truth**: Always treat `src/locales/en.json` as the definitive list of keys.
- **Context**: If a translation is ambiguous, check how the key is used in the codebase or look at surrounding keys in `en.json` for context.
- **Consistency**: Maintain the tone and style of existing translations in the target language.
- **No Manual Edits to JSON Structure**: Always ensure the JSON remains valid. Prefer using automated tools or script-based replacements if many keys are involved.
