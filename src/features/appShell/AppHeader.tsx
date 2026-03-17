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
          <p className="eyebrow">Offline. Deterministic. Quiz-focused.</p>
          <h1>CH 15 and 16 AC Quiz Math Solver</h1>
          <p className="hero__lede">
            This build is intentionally narrowed to the math-only problem types shown in the
            Chapter 15 and 16 quiz screenshots. It keeps the solve path deterministic while
            hiding the theory-only and out-of-scope workflows.
          </p>
          <div className="hero__stats">
            <span>Math questions only</span>
            <span>Series and mixed-network solves</span>
            <span>Phasor and impedance conversions</span>
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

          <p className="panel__label">Quiz figure quick loads</p>
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
            Theory prompts, true-false items, and the legacy extra workflows are intentionally
            excluded here. This shell only exposes the math families needed by the quiz
            screenshots.
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
