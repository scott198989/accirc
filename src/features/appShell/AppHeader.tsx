import {
  guidedSamples,
  seriesParallelSamples,
  type ThemeMode,
} from './appShell'

interface AppHeaderProps {
  resolvedTheme: 'light' | 'dark'
  themeMode: ThemeMode
  onLoadGuidedSample: (sampleId: string) => void
  onLoadSeriesParallelSample: (sampleId: string) => void
  onThemeChange: (themeMode: ThemeMode) => void
}

export default function AppHeader({
  resolvedTheme,
  themeMode,
  onLoadGuidedSample,
  onLoadSeriesParallelSample,
  onThemeChange,
}: AppHeaderProps) {
  return (
    <header className="hero">
      <div className="hero__copy">
        <p className="eyebrow">Offline. Deterministic. Fast-solve first.</p>
        <h1>CH 15, 16, and 17 AC Quiz Math Solver</h1>
        <p className="hero__lede">
          Enter the known values, choose what the question wants, and let the app infer the
          formula path. It only asks for topology or branch context when the numbers alone do not
          uniquely determine the solve.
        </p>
        <div className="hero__stats">
          <span>Knowns in, answer out</span>
          <span>Topology asked only when needed</span>
          <span>Series, parallel, and mixed-network support</span>
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
          Fast Solve stays first. Manual Override below still keeps the exact formula view,
          diagram-driven builders, and mixed-network tools available when the direct solve needs a
          nudge.
        </p>
      </aside>
    </header>
  )
}
