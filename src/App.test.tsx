import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders WireGuard Config Manager heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/WireGuard Config Manager/i);
  expect(headingElement).toBeInTheDocument();
});
