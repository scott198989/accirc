import { referenceLibrary } from '../../data/referenceLibrary'

function formatBytes(sizeBytes: number) {
  if (sizeBytes >= 1024 * 1024) {
    return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`
  }

  if (sizeBytes >= 1024) {
    return `${Math.round(sizeBytes / 1024)} KB`
  }

  return `${sizeBytes} bytes`
}

export default function ReferenceLibraryPanel() {
  return (
    <section className="reference-library" aria-labelledby="reference-library-title">
      <div className="reference-library__header">
        <div>
          <p className="eyebrow">Source Library</p>
          <h2 id="reference-library-title">Homework and screenshot reference library</h2>
          <p className="reference-library__lede">
            The uploaded study materials are committed in this repo so they stay available from
            GitHub, on both of your machines, and inside this app.
          </p>
        </div>

        <div className="reference-library__stats" aria-label="Reference library stats">
          <span>{referenceLibrary.stats.uniqueCanonicalFiles} canonical files</span>
          <span>{referenceLibrary.stats.documentCount} homework documents</span>
          <span>{referenceLibrary.stats.screenshotCount} screenshots</span>
          <span>{referenceLibrary.stats.duplicateFilesRemoved} exact duplicates removed</span>
        </div>
      </div>

      <div className="reference-library__grid">
        <section className="card">
          <div className="card__header">
            <div>
              <p className="eyebrow">Homework Files</p>
              <h2>Committed originals</h2>
            </div>
          </div>

          <div className="list-stack">
            {referenceLibrary.documents.map((document) => (
              <article className="detail-card reference-card" key={document.id}>
                <div className="detail-card__header">
                  <div>
                    <p className="detail-card__eyebrow">{document.kind.toUpperCase()}</p>
                    <h3>{document.title}</h3>
                  </div>
                  <a
                    className="ghost-button"
                    href={document.publicPath}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Open file
                  </a>
                </div>

                <p className="reference-card__meta">
                  Stored as the original binary source file. Size: {formatBytes(document.sizeBytes)}.
                </p>

                {'pageCount' in document && document.pageCount ? (
                  <p className="reference-card__meta">
                    {document.pageCount} page(s).{' '}
                    {document.machineReadableText
                      ? 'Machine-readable PDF text is available.'
                      : 'This PDF is image-based in the current environment.'}
                  </p>
                ) : null}

                {'paragraphCount' in document && document.paragraphCount ? (
                  <>
                    <p className="reference-card__meta">
                      {document.paragraphCount} extracted paragraphs were preserved in the manifest.
                    </p>
                    <ul className="reference-outline">
                      {document.outline.slice(0, 8).map((line, index) => (
                        <li key={`${document.id}-${index}`}>{line}</li>
                      ))}
                    </ul>
                  </>
                ) : null}

                {'note' in document && document.note ? <p className="reference-card__meta">{document.note}</p> : null}
              </article>
            ))}
          </div>
        </section>

        <section className="card">
          <div className="card__header">
            <div>
              <p className="eyebrow">Screenshot Sets</p>
              <h2>Canonical image collections</h2>
            </div>
          </div>

          <div className="list-stack">
            {referenceLibrary.screenshotCollections.map((collection) => (
              <article className="detail-card reference-card" key={collection.id}>
                <div className="detail-card__header">
                  <div>
                    <p className="detail-card__eyebrow">Screenshot set</p>
                    <h3>{collection.title}</h3>
                  </div>
                  <strong>{collection.itemCount} files</strong>
                </div>

                <p>{collection.description}</p>

                {collection.duplicateSourceFolders.length > 0 && (
                  <p className="reference-card__meta">
                    Exact duplicates from {collection.duplicateSourceFolders.join(', ')} were
                    collapsed into this canonical set.
                  </p>
                )}

                <div className="reference-preview-grid">
                  {collection.previewImagePaths.map((path) => (
                    <a href={path} key={path} rel="noreferrer" target="_blank">
                      <img
                        alt={`${collection.title} preview`}
                        className="reference-preview"
                        loading="lazy"
                        src={path}
                      />
                    </a>
                  ))}
                </div>

                <details className="reference-details">
                  <summary>Browse filenames</summary>
                  <ul className="reference-link-list">
                    {collection.items.map((item) => (
                      <li key={item.id}>
                        <a href={item.publicPath} rel="noreferrer" target="_blank">
                          {item.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </details>
              </article>
            ))}
          </div>
        </section>
      </div>

      <div className="reference-library__footer">
        <p>
          Imported from <strong>{referenceLibrary.sourceArchiveName}</strong> on{' '}
          {referenceLibrary.importedAt}. Git tracks the canonical files, and the generated manifest
          preserves the original zip paths plus the duplicate relationships.
        </p>
      </div>
    </section>
  )
}
