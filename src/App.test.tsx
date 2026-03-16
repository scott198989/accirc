import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the offline deterministic solver shell', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { name: /AC Circuits Formula Selector and Solver/i }),
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
  })

  it('lets textbook label mode split a problem into separate parts', () => {
    render(<App />)

    fireEvent.click(screen.getAllByRole('button', { name: /Add part/i })[0])

    expect(screen.getByRole('tab', { name: /Part B/i })).toBeInTheDocument()
    expect(screen.getByText(/Part B stays separate from every other part/i)).toBeInTheDocument()
  })
})
