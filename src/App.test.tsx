import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the new fast-solve-first home flow', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { name: /CH 15, 16, and 17 AC Quiz Math Solver/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /Tell the app what you have and what you need/i }),
    ).toBeInTheDocument()
    expect(screen.getByText(/What I Have/i)).toBeInTheDocument()
    expect(screen.getByText(/What I Need/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Open Manual Override/i })).toBeInTheDocument()

    expect(screen.queryByRole('tab', { name: /Quiz math goal/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('tab', { name: /Series circuit from diagram/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('tab', { name: /Formula mode/i })).not.toBeInTheDocument()
  })

  it('solves a simple direct resistance problem from voltage and current', () => {
    render(<App />)

    const initialValueInputs = screen.getAllByLabelText(/Value/i)
    fireEvent.change(initialValueInputs[0], { target: { value: '4' } })
    fireEvent.click(screen.getByRole('button', { name: /Add known/i }))

    const quantitySelects = screen.getAllByLabelText(/Quantity/i)
    fireEvent.change(quantitySelects[1], { target: { value: 'current' } })

    const valueInputs = screen.getAllByLabelText(/Value/i)
    fireEvent.change(valueInputs[1], { target: { value: '2' } })

    fireEvent.click(screen.getByRole('button', { name: /^Solve$/i }))

    expect(screen.getByText(/Resistance:/i)).toBeInTheDocument()
    expect(screen.getAllByText(/2 Ohm/i).length).toBeGreaterThan(0)
  })

  it('asks for circuit shape when the same knowns could fit series or parallel current', () => {
    render(<App />)

    const quantitySelects = screen.getAllByLabelText(/Quantity/i)
    const valueInputs = screen.getAllByLabelText(/Value/i)
    const targetSelect = screen.getByLabelText(/Question target/i)

    fireEvent.change(quantitySelects[0], { target: { value: 'voltage' } })
    fireEvent.change(valueInputs[0], { target: { value: '120' } })

    fireEvent.click(screen.getByRole('button', { name: /Add known/i }))
    fireEvent.click(screen.getByRole('button', { name: /Add known/i }))

    const refreshedQuantitySelects = screen.getAllByLabelText(/Quantity/i)
    const refreshedValueInputs = screen.getAllByLabelText(/Value/i)

    fireEvent.change(refreshedQuantitySelects[1], { target: { value: 'resistance' } })
    fireEvent.change(refreshedValueInputs[1], { target: { value: '30' } })
    fireEvent.change(refreshedQuantitySelects[2], { target: { value: 'inductive-reactance' } })
    fireEvent.change(refreshedValueInputs[2], { target: { value: '40' } })
    fireEvent.change(targetSelect, { target: { value: 'current' } })

    expect(screen.getByText(/Ambiguity detected/i)).toBeInTheDocument()
    expect(
      screen.getByText(/I need the circuit shape before I can choose the correct reduction path/i),
    ).toBeInTheDocument()
    expect(screen.getByText(/Optional Context/i)).toBeInTheDocument()
  })

  it('keeps the old builders inside Manual Override', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /Open Manual Override/i }))

    const overrideTabs = within(screen.getByRole('tablist', { name: /Manual override mode/i }))
    expect(overrideTabs.getByRole('tab', { name: /Builder tools/i })).toBeInTheDocument()
    expect(overrideTabs.getByRole('tab', { name: /Exact formula path/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Quiz math goal/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Mixed series-parallel network/i })).toBeInTheDocument()
  })

  it('still renders the committed reference library', () => {
    render(<App />)

    expect(
      screen.getAllByRole('heading', { name: /Homework and screenshot reference library/i }).length,
    ).toBeGreaterThan(0)
    expect(screen.getAllByText(/5 canonical sources/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/3 homework files/i).length).toBeGreaterThan(0)
  })
})
