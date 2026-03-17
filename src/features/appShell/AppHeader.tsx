import { formulaCount, formulaFamilies } from '../../core'
import {
  guidedSamples,
  seriesParallelSamples,
  type AppMode,
  type ThemeMode,
} from './appShell'

interface AppHeaderProps {
  mode: AppMode
  resolvedTheme: 'light' | 'dark'
  themeMode: ThemeMode
  onLoadGuidedSample: (sampleId: string) => void
  onLoadSeriesParallelSample: (sampleId: string) => void
  onModeChange: (mode: AppMode) => void
  onThemeChange: (themeMode: ThemeMode) => void
}

export default function AppHeader({
  mode,
  resolvedTheme,
  themeMode,
  onLoadGuidedSample,
  onLoadSeriesParallelSample,
  onModeChange,
  onThemeChange,
}: AppHeaderProps) {
  return (
    <>
      <header className="hero">
        <div className="hero__copy">
          <p className="eyebrow">Offline. Deterministic. Transparent.</p>
          <h1>AC Circuits Formula Selector and Solver</h1>
          <p className="hero__lede">
            Guided mode now lets the user solve from chapter goals, from the exact variable
            labels printed in the book, or from circuit diagrams, all while keeping the solve
            path deterministic and transparent.
          </p>
          <div className="hero__stats">
            <span>{formulaFamilies.length} formula families</span>
            <span>{formulaCount} solve variants</span>
            <span>Chapter 10, 11, and 13-17 workflows live now</span>
            <span>No network needed at runtime</span>
          </div>
        </div>

        <aside className="hero__panel">
          <div className="theme-switch">
            <div>
              <p className="panel__label">Theme</p>
              <p className="theme-switch__status">
                {themeMode === 'system'
                  ? `Following system (${resolvedTheme})`
                  : `${resolvedTheme.charAt(0).toUpperCase()}${resolvedTheme.slice(1)} mode`}
              </p>
            </div>

            <div className="theme-switch__controls" role="tablist" aria-label="Theme mode">
              {(['light', 'dark', 'system'] as ThemeMode[]).map((option) => (
                <button
                  key={option}
                  className={
                    themeMode === option ? 'theme-switch__button is-active' : 'theme-switch__button'
                  }
                  onClick={() => onThemeChange(option)}
                  role="tab"
                  type="button"
                >
                  {option === 'system'
                    ? 'System'
                    : `${option.charAt(0).toUpperCase()}${option.slice(1)}`}
                </button>
              ))}
            </div>
          </div>

          <p className="panel__label">Textbook quick loads</p>
          <div className="sample-list">
            {guidedSamples.map((sample) => (
              <button
                key={sample.id}
                className="sample-button"
                onClick={() => onLoadGuidedSample(sample.id)}
                type="button"
              >
                {sample.title}
              </button>
            ))}
            {seriesParallelSamples.map((sample) => (
              <button
                key={sample.id}
                className="sample-button"
                onClick={() => onLoadSeriesParallelSample(sample.id)}
                type="button"
              >
                {sample.title}
              </button>
            ))}
          </div>
          <p className="panel__note">
            The current guided shell now covers Chapters 10, 11, and 13-17. Chapter 12
            magnetic-circuit workflows are still intentionally skipped for now, but the
            Chapter 17 series-parallel reduction builder is now live.
          </p>
        </aside>
      </header>

      <div className="mode-switch" role="tablist" aria-label="App mode">
        <button
          className={mode === 'guided' ? 'mode-switch__button is-active' : 'mode-switch__button'}
          onClick={() => onModeChange('guided')}
          role="tab"
          type="button"
        >
          Guided mode
        </button>
        <button
          className={mode === 'formula' ? 'mode-switch__button is-active' : 'mode-switch__button'}
          onClick={() => onModeChange('formula')}
          role="tab"
          type="button"
        >
          Formula mode
        </button>
      </div>
    </>
  )
}
