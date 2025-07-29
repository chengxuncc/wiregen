import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders WireGen heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/WireGen/i);
  expect(headingElement).toBeInTheDocument();
});
