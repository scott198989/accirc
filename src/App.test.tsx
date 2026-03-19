import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the quiz-focused deterministic solver shell', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { name: /CH 15, 16, and 17 AC Quiz Math Solver/i }),
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
    expect(
      screen.getByRole('tab', { name: /Parallel circuit from diagram/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Textbook labels/i })).toBeInTheDocument()
  }, 15000)

  it('shows the quiz figure quick loads', () => {
    render(<App />)

    expect(screen.getAllByRole('button', { name: /Figure 15.2/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: /Figure 15.6/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: /Figure 15.3/i }).length).toBeGreaterThan(0)
    expect(
      screen.getAllByRole('button', { name: /Question 18 resistor \|\| coil/i }).length,
    ).toBeGreaterThan(0)
    expect(
      screen.getAllByRole('button', { name: /Chapter 17 Problem 1 source current/i }).length,
    ).toBeGreaterThan(0)
  })

  it('renders the committed reference library summary', () => {
    render(<App />)

    expect(
      screen.getAllByRole('heading', { name: /Homework and screenshot reference library/i }).length,
    ).toBeGreaterThan(0)
    expect(screen.getAllByText(/5 canonical sources/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/3 homework files/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/48 canonical quiz screenshots/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/59 study-guide screenshots/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Quiz 15-16/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Quiz 17/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/Study guide only/i)).toBeInTheDocument()
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

    const select = screen.getAllByLabelText(/Best match for the question/i)[0] as HTMLSelectElement
    const optionLabels = Array.from(select.options).map((option) => option.textContent ?? '')

    expect(optionLabels).toContain('Question asks for XL from frequency and inductance')
    expect(optionLabels).toContain('Question asks for capacitor C from XC and frequency')
    expect(optionLabels).toContain('Find total series RL impedance from resistance and XL')
    expect(optionLabels).toContain('Find total series impedance from resistance, XL, and XC')
    expect(optionLabels).toContain('Question gives P, V, and pf and asks for Z')
    expect(optionLabels).toContain('Question gives i(t) and asks for the current phasor')
    expect(optionLabels).toContain('Question asks for one branch voltage from E, Zbranch, and Ztotal')
    expect(optionLabels).toContain('Question gives G, BL, and BC and asks for YT')
    expect(optionLabels).toContain('Question asks for ZT of a resistor in parallel with a coil')
    expect(optionLabels).toContain('Question asks for BC from frequency and C')
    expect(optionLabels).not.toContain('Find total capacitance of capacitors in parallel')
  })

  it('shows the formula path for the selected quiz goal', () => {
    render(<App />)

    const select = screen.getAllByLabelText(/Best match for the question/i)[0] as HTMLSelectElement
    fireEvent.change(select, { target: { value: 'series-impedance-from-r-xl-xc' } })

    expect(screen.getAllByText(/^Behind-the-scenes formula path$/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/X = XL - XC/i)).toBeInTheDocument()
    expect(screen.getByText(/Z = R \+ j\(XL - XC\)/i)).toBeInTheDocument()
    expect(screen.getByText(/\|Z\| = sqrt\(R\^2 \+ X\^2\)/i)).toBeInTheDocument()
  })

  it('lets the user add an extra known in quiz math goal mode', () => {
    render(<App />)

    fireEvent.click(screen.getAllByRole('button', { name: /Add known/i })[0])

    expect(screen.getByText(/Known quantity/i)).toBeInTheDocument()
  })

  it('offers wording-based quick picks for common quiz asks', () => {
    render(<App />)

    const quickPick = screen.getByRole('button', {
      name: /question gives XL and f and wants the inductor value L/i,
    })

    fireEvent.click(quickPick)

    expect(screen.getByText(/This goal solves for:/i)).toBeInTheDocument()
    expect(screen.getByText(/L \(Inductance\)/i)).toBeInTheDocument()
  })

  it('uses known-oriented labels in the series diagram workflow', () => {
    render(<App />)

    const workflowTabs = within(screen.getAllByRole('tablist', { name: /Guided workflow/i })[0])
    fireEvent.click(workflowTabs.getByRole('tab', { name: /Series circuit from diagram/i }))

    expect(screen.getByRole('button', { name: /Add component known/i })).toBeInTheDocument()
    expect(screen.getByText(/Known frequency if needed/i)).toBeInTheDocument()
    expect(screen.getByText(/Known source voltage if needed/i)).toBeInTheDocument()
  }, 15000)

  it('shows the Chapter 16 parallel builder and source-current phasor input', () => {
    render(<App />)

    const workflowTabs = within(screen.getAllByRole('tablist', { name: /Guided workflow/i })[0])
    fireEvent.click(workflowTabs.getByRole('tab', { name: /Parallel circuit from diagram/i }))

    expect(screen.getByRole('button', { name: /Add component known/i })).toBeInTheDocument()
    expect(screen.getByText(/Known source current phasor if needed/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Solve parallel circuit/i })).toBeInTheDocument()
  })

  it('shows the textbook-label workflow', () => {
    render(<App />)

    const workflowTabs = within(screen.getAllByRole('tablist', { name: /Guided workflow/i })[0])
    fireEvent.click(workflowTabs.getByRole('tab', { name: /Textbook labels/i }))

    expect(screen.getByText(/Problem topology/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Add symbol known/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Solve textbook labels/i })).toBeInTheDocument()
  })

  it('exposes the mixed-network branch target goals and selector', () => {
    render(<App />)

    const workflowTabs = within(screen.getAllByRole('tablist', { name: /Guided workflow/i })[0])
    fireEvent.click(workflowTabs.getByRole('tab', { name: /Mixed series-parallel network/i }))

    const select = screen.getAllByLabelText(/Question goal/i)[0] as HTMLSelectElement
    const optionLabels = Array.from(select.options).map((option) => option.textContent ?? '')

    expect(optionLabels).toContain('Total impedance of a mixed series-parallel network')
    expect(optionLabels).toContain('Source current of a mixed series-parallel network')
    expect(optionLabels).toContain('Real power of a mixed series-parallel network')
    expect(optionLabels).toContain('Voltage at a selected branch or reduced block')
    expect(optionLabels).toContain('Current through a selected branch or reduced block')

    fireEvent.change(select, { target: { value: 'series-parallel-branch-voltage' } })

    expect(screen.getByLabelText(/Branch or reduced block target/i)).toBeInTheDocument()
  })

  it('shows the new equivalent-series parallel goals', () => {
    render(<App />)

    const workflowTabs = within(screen.getAllByRole('tablist', { name: /Guided workflow/i })[0])
    fireEvent.click(workflowTabs.getByRole('tab', { name: /Parallel circuit from diagram/i }))

    const select = screen.getAllByLabelText(/Question goal/i)[0] as HTMLSelectElement
    const optionLabels = Array.from(select.options).map((option) => option.textContent ?? '')

    expect(optionLabels).toContain('Equivalent series resistance of a parallel circuit')
    expect(optionLabels).toContain('Equivalent series reactance of a parallel circuit')
  })
})
