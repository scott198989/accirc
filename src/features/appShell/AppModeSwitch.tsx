import type { AppMode } from './appShell'

interface AppModeSwitchProps {
  mode: AppMode
  onModeChange: (mode: AppMode) => void
}

export default function AppModeSwitch({ mode, onModeChange }: AppModeSwitchProps) {
  return (
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
  )
}
