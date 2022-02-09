import React from 'react';
import { render, screen } from '@testing-library/react';
import WelcomePage from './pages/WelcomePage';

test('renders learn react link', () => {
  render(<WelcomePage />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
