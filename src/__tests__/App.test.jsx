import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App.jsx';

// Test scenario described by the user:
// """
// Productos: 1 Mouse, 1 Teclado, 1 Monitor
// Premium: true
// Cupón: PROMO10
// Región: CR
//
// Total esperado: $198.06
// """

test('Productos: 1 Mouse, 1 Teclado, 1 Monitor; Premium true; PROMO10; CR => $198.06', async () => {
  render(<App />);

  // Wait for products to render (fetchProducts is async)
  await screen.findByText(/Mouse/);
  await screen.findByText(/Teclado/);
  await screen.findByText(/Monitor/);

  // Helper to click the "Agregar" button for a given product name
  const clickAddFor = (name) => {
    const node = screen.getByText(new RegExp(name));
    // product is rendered inside a div that contains the button
    const container = node.closest('div');
    const btn = container && container.querySelector('button');
    if (!btn) throw new Error(`No agregar button found for product ${name}`);
    fireEvent.click(btn);
  };

  // Add 1 of each product
  clickAddFor('Mouse');
  clickAddFor('Teclado');
  clickAddFor('Monitor');

  // Ensure premium is enabled (component default is true but be explicit)
  const premiumCheckbox = screen.getByLabelText(/Usuario Premium/i);
  if (!premiumCheckbox.checked) fireEvent.click(premiumCheckbox);

  // There are two <select> elements: first is Cupón, second is Región
  const selects = screen.getAllByRole('combobox');
  expect(selects.length).toBeGreaterThanOrEqual(2);

  const couponSelect = selects[0];
  const regionSelect = selects[1];

  // Select PROMO10 and CR
  fireEvent.change(couponSelect, { target: { value: 'PROMO10' } });
  fireEvent.change(regionSelect, { target: { value: 'CR' } });

  // Wait for total to update and assert expected value
  await waitFor(() => {
    const totalEl = screen.getByText(/Total:/i);
    expect(totalEl).toHaveTextContent('$198.06');
  });
});
