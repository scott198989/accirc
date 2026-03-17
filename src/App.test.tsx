import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the offline deterministic solver shell', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { name: /AC Circuits Formula Selector and Solver/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Chapter 10, 11, and 13-17 workflows live now/i),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Solve from variables/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('tab', { name: /Textbook labels/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('tab', { name: /Series circuit from diagram/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('tab', { name: /Series-parallel network/i }),
    ).toBeInTheDocument()
  })

  it('lets textbook label mode split a problem into separate parts', () => {
    render(<App />)

    fireEvent.click(screen.getAllByRole('button', { name: /Add part/i })[0])

    expect(screen.getByRole('tab', { name: /Part B/i })).toBeInTheDocument()
    expect(screen.getByText(/Part B stays separate from every other part/i)).toBeInTheDocument()
  })

  it('shows light, dark, and system theme controls', () => {
    render(<App />)

    const themeTabs = within(screen.getAllByRole('tablist', { name: /Theme mode/i })[0])

    expect(themeTabs.getByRole('tab', { name: /Light/i })).toBeInTheDocument()
    expect(themeTabs.getByRole('tab', { name: /Dark/i })).toBeInTheDocument()
    expect(themeTabs.getByRole('tab', { name: /System/i })).toBeInTheDocument()
  })

  it('orders chapter-goal options by chapter and includes the Chapter 17 handoff', () => {
    render(<App />)

    const workflowTabs = within(screen.getAllByRole('tablist', { name: /Guided workflow/i })[0])
    fireEvent.click(workflowTabs.getByRole('tab', { name: /Chapter math goal/i }))

    const select = screen.getAllByLabelText(/Question goal/i)[0] as HTMLSelectElement
    const optionLabels = Array.from(select.options).map((option) => option.textContent ?? '')

    expect(optionLabels.indexOf('Find total capacitance of capacitors in parallel')).toBeGreaterThan(-1)
    expect(optionLabels.indexOf('Find RL time constant from inductance and resistance')).toBeGreaterThan(
      optionLabels.indexOf('Find total capacitance of capacitors in parallel'),
    )
    expect(optionLabels.indexOf('Find period from frequency')).toBeGreaterThan(
      optionLabels.indexOf('Find RL time constant from inductance and resistance'),
    )
    expect(optionLabels).toContain('Open the Chapter 17 builder for total impedance')
    expect(optionLabels).toContain('Open the Chapter 17 builder for source current')
    expect(optionLabels).toContain('Open the Chapter 17 builder for real power')
  })
})
