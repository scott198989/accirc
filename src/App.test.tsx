import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the quiz-focused deterministic solver shell', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { name: /CH 15 and 16 AC Quiz Math Solver/i }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Math questions only/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Solve quiz goal/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('tab', { name: /Quiz math goal/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('tab', { name: /Series circuit from diagram/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('tab', { name: /Mixed series-parallel network/i }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('tab', { name: /Textbook labels/i })).not.toBeInTheDocument()
    expect(
      screen.queryByRole('tab', { name: /Parallel circuit from diagram/i }),
    ).not.toBeInTheDocument()

    const questionGoalSelect = screen.getAllByLabelText(/Question goal/i)[0]
    expect(questionGoalSelect.innerHTML).not.toMatch(/Chapter 10|Chapter 11|Chapter 13|Chapter 14|Chapter 17/i)
  })

  it('shows the quiz figure quick loads', () => {
    render(<App />)

    expect(screen.getAllByRole('button', { name: /Figure 15.2/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: /Figure 15.6/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: /Figure 15.3/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: /Question 18 mixed network/i }).length).toBeGreaterThan(0)
  })

  it('shows light, dark, and system theme controls', () => {
    render(<App />)

    const themeTabs = within(screen.getAllByRole('tablist', { name: /Theme mode/i })[0])

    expect(themeTabs.getByRole('tab', { name: /Light/i })).toBeInTheDocument()
    expect(themeTabs.getByRole('tab', { name: /Dark/i })).toBeInTheDocument()
    expect(themeTabs.getByRole('tab', { name: /System/i })).toBeInTheDocument()
  })

  it('limits question-goal options to the quiz math families', () => {
    render(<App />)

    const workflowTabs = within(screen.getAllByRole('tablist', { name: /Guided workflow/i })[0])
    fireEvent.click(workflowTabs.getByRole('tab', { name: /Quiz math goal/i }))

    const select = screen.getAllByLabelText(/Question goal/i)[0] as HTMLSelectElement
    const optionLabels = Array.from(select.options).map((option) => option.textContent ?? '')

    expect(optionLabels).toContain('Find inductive reactance from frequency and inductance')
    expect(optionLabels).toContain('Find rectangular impedance from power, voltage, and power factor')
    expect(optionLabels).toContain('Find equivalent parallel resistance from series R and XL')
    expect(optionLabels).toContain('Find capacitive susceptance from frequency and capacitance')
    expect(optionLabels).not.toContain('Find total capacitance of capacitors in parallel')
    expect(optionLabels).not.toContain('Write a current phasor as a sinusoidal current expression')
  })
})
