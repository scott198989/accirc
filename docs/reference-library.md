# Reference Library

## Status

The uploaded archive `Homeworks and Screenshots.zip` has been imported into the repo as a
canonical reference library.

Committed locations:

- `public/reference-library/homework/`
- `public/reference-library/screenshots/`
- `src/data/referenceLibrary.ts`

## Imported totals

- Total files in the source archive: `126`
- Canonical files committed to the repo: `109`
- Homework documents: `2`
- Screenshots: `107`
- Exact duplicate files removed: `17`

## Canonical collections

### Homework

- `Scott Tuschl HW 15 A000834342.pdf`
- `Scott Tuschl ch 16 HW.docx`

### Screenshot sets

- `Test 2 study guide`: `59` canonical screenshots
- `test 2 no 2`: `25` screenshots
- `test 2 no 3`: `23` screenshots

## Duplicate cleanup

The duplicate cleanup was hash-based using SHA-256.

All `17` exact duplicate groups came from the overlap between:

- `Ch 15-16 screen shots`
- `Test 2 study guide`

The canonical copies were kept in `Test 2 study guide`, and the duplicate provenance was
preserved in `src/data/referenceLibrary.ts`.

## Parsing notes

- `*.png`, `*.pdf`, and `*.docx` are marked as binary in `.gitattributes` so Git pull/push does
  not attempt line-ending conversion or text diffs.
- The Chapter 16 `.docx` is machine-readable and its extracted outline is stored in the manifest.
- The Chapter 15 `.pdf` is preserved as the original file and is treated as image-based in the
  current environment.

## Re-import command

If a newer archive needs to replace this library, run:

```bash
python scripts/import_reference_library.py "C:\path\to\Homeworks and Screenshots.zip"
```
