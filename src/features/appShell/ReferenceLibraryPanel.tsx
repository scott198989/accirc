import { questionCatalogBySourceId } from '../../data/questionCatalog'
import { referenceLibrary, type ReferenceSource } from '../../data/referenceLibrary'

function formatBytes(sizeBytes: number) {
  if (sizeBytes >= 1024 * 1024) {
    return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`
  }

  if (sizeBytes >= 1024) {
    return `${Math.round(sizeBytes / 1024)} KB`
  }

  return `${sizeBytes} bytes`
}

function chapterLabel(chapters: readonly string[]) {
  return chapters.length === 1 ? `Chapter ${chapters[0]}` : `Chapters ${chapters.join(', ')}`
}

function sourceQuestionStats(sourceId: ReferenceSource['id']) {
  const entries = questionCatalogBySourceId[sourceId] ?? []
  return {
    total: entries.length,
    supported: entries.filter((entry) => entry.coverageStatus === 'supported').length,
    outOfScope: entries.filter((entry) => entry.coverageStatus === 'out-of-scope').length,
  }
}

function SourceCard({ source }: { source: ReferenceSource }) {
  const stats = sourceQuestionStats(source.id)

  return (
    <article className="detail-card reference-card">
      <div className="detail-card__header">
        <div>
          <p className="detail-card__eyebrow">
            {source.scope === 'canonical' ? 'Canonical source' : 'Supplemental source'}
          </p>
          <h3>{source.title}</h3>
        </div>
        <strong>{chapterLabel(source.chapters)}</strong>
      </div>

      <p>{source.description}</p>

      <p className="reference-card__meta">
        {source.kind === 'homework' ? 'Homework file set' : 'Screenshot set'} with {source.itemCount}{' '}
        committed asset{source.itemCount === 1 ? '' : 's'}.
      </p>

      {stats.total > 0 && (
        <p className="reference-card__meta">
          {stats.total} cataloged question record{stats.total === 1 ? '' : 's'}: {stats.supported}{' '}
          supported math item{stats.supported === 1 ? '' : 's'} and {stats.outOfScope} explicit
          out-of-scope prompt{stats.outOfScope === 1 ? '' : 's'}.
        </p>
      )}

      {source.note && <p className="reference-card__meta">{source.note}</p>}
      {'extractionNote' in source && source.extractionNote && (
        <p className="reference-card__meta">{source.extractionNote}</p>
      )}

      {source.previewImagePaths.length > 0 && (
        <div className="reference-preview-grid">
          {source.previewImagePaths.map((path) => (
            <a href={path} key={path} rel="noreferrer" target="_blank">
              <img
                alt={`${source.title} preview`}
                className="reference-preview"
                loading="lazy"
                src={path}
              />
            </a>
          ))}
        </div>
      )}

      <details className="reference-details">
        <summary>Browse committed assets</summary>
        <ul className="reference-link-list">
          {source.items.map((item) => (
            <li key={item.id}>
              <a href={item.publicPath} rel="noreferrer" target="_blank">
                {item.title}
              </a>{' '}
              <span className="reference-card__meta">({formatBytes(item.sizeBytes)})</span>
            </li>
          ))}
        </ul>
      </details>

      {source.extractionArtifacts.length > 0 && (
        <details className="reference-details">
          <summary>Open extracted text artifacts</summary>
          <ul className="reference-link-list">
            {source.extractionArtifacts.map((artifact) => (
              <li key={`${source.id}-${artifact.kind}-${artifact.publicPath}`}>
                <a href={artifact.publicPath} rel="noreferrer" target="_blank">
                  {artifact.kind.toUpperCase()} extraction
                </a>
              </li>
            ))}
          </ul>
        </details>
      )}

      {source.sourceProvenance.length > 0 && (
        <details className="reference-details">
          <summary>View source provenance</summary>
          <ul className="reference-link-list">
            {source.sourceProvenance.map((path) => (
              <li key={`${source.id}-${path}`}>{path}</li>
            ))}
          </ul>
        </details>
      )}
    </article>
  )
}

export default function ReferenceLibraryPanel() {
  const canonicalSources = referenceLibrary.sources.filter((source) => source.scope === 'canonical')
  const supplementalSources = referenceLibrary.sources.filter(
    (source) => source.scope === 'supplemental',
  )

  return (
    <section className="reference-library" aria-labelledby="reference-library-title">
      <div className="reference-library__header">
        <div>
          <p className="eyebrow">Source Library</p>
          <h2 id="reference-library-title">Homework and screenshot reference library</h2>
          <p className="reference-library__lede">
            `C:\dev\accirc` is now the canonical workspace. The app keeps one committed copy of
            each homework and quiz source, preserves provenance back to the raw exports, and ties
            the canonical sources to the question catalog.
          </p>
        </div>

        <div className="reference-library__stats" aria-label="Reference library stats">
          <span>{referenceLibrary.stats.canonicalSourceCount} canonical sources</span>
          <span>{referenceLibrary.stats.homeworkDocumentCount} homework files</span>
          <span>{referenceLibrary.stats.canonicalQuizImageCount} canonical quiz screenshots</span>
          <span>{referenceLibrary.stats.supplementalImageCount} study-guide screenshots</span>
        </div>
      </div>

      <div className="reference-library__grid">
        <section className="card">
          <div className="card__header">
            <div>
              <p className="eyebrow">Canonical Coverage Sources</p>
              <h2>Homework 15-17 and Quiz 15-16 / Quiz 17</h2>
            </div>
          </div>

          <div className="list-stack">
            {canonicalSources.map((source) => (
              <SourceCard key={source.id} source={source} />
            ))}
          </div>
        </section>

        <section className="card">
          <div className="card__header">
            <div>
              <p className="eyebrow">Supplemental References</p>
              <h2>Study guide only</h2>
            </div>
          </div>

          <div className="list-stack">
            {supplementalSources.map((source) => (
              <SourceCard key={source.id} source={source} />
            ))}
          </div>
        </section>
      </div>

      <div className="reference-library__footer">
        <p>
          Imported on {referenceLibrary.importedAt} into{' '}
          <strong>{referenceLibrary.canonicalWorkspace}</strong>. The manifest now tracks source
          groups, canonical-vs-supplemental scope, extracted text artifacts, and original file
          provenance instead of old archive folder names.
        </p>
      </div>
    </section>
  )
}
