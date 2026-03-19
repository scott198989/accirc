# Reference Library

## Canonical workspace

The maintained workspace is now:

- `C:\dev\accirc`

External OneDrive folders remain raw provenance only. They are not the maintained source of truth.

## Canonical source model

The repo now tracks six source groups in `src/data/referenceLibrary.ts`:

- `HW 15` (`hw-15`) - canonical Chapter 15 homework
- `HW 16` (`hw-16`) - canonical Chapter 16 homework
- `HW 17` (`hw-17`) - canonical Chapter 17 homework
- `Quiz 15-16` (`quiz-15-16`) - canonical combined quiz screenshot set
- `Quiz 17` (`quiz-17`) - canonical separate quiz screenshot set
- `Study guide` (`study-guide`) - supplemental screenshots only

Only the first five sources count toward formula-coverage scope.

## Repo locations

Committed assets now live under:

- `public/reference-library/sources/`
- `public/reference-library/extracted/`
- `src/data/referenceLibrary.ts`
- `src/data/questionCatalog.ts`

The old archive-shaped folders:

- `public/reference-library/homework/`
- `public/reference-library/screenshots/`

have been replaced by the source-centric layout above.

## Current totals

- `6` total source groups
- `5` canonical coverage sources
- `1` supplemental source
- `3` homework documents
- `48` canonical quiz screenshots
- `59` supplemental study-guide screenshots
- `110` total committed reference assets
- `5` extracted text artifacts

## Extracted artifacts

The import pipeline persists extraction outputs beside the canonical files:

- `public/reference-library/extracted/hw-15.json`
- `public/reference-library/extracted/hw-16.json`
- `public/reference-library/extracted/hw-17.json`
- `public/reference-library/extracted/quiz-15-16-ocr.json`
- `public/reference-library/extracted/quiz-17-manual.json`

These artifacts back the question catalog and make the cleanup auditable without reopening the raw files each time.

## Question catalog

`src/data/questionCatalog.ts` is now the canonical question index.

Each record keeps:

- one canonical source id
- chapter metadata
- question number and optional sub-part
- classification
- parsed prompt text
- canonical asset refs
- coverage status
- mapped solver mode
- mapped goal ids
- mapped formula ids
- a regression test mapping

This is the structure that prevents duplicate question copies from spreading through the app again.

## Re-import command

To rebuild the reference manifest from the current raw material roots:

```bash
python scripts/import_reference_library.py --project-root C:\dev\accirc
```

The script reads the current study materials and raw provenance folders that were hard-coded for this cleanup pass, then regenerates:

- canonical public assets
- extracted JSON artifacts
- `src/data/referenceLibrary.ts`
