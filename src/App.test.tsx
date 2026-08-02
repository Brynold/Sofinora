import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the Sofinora calculator directory', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /make every money decision/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /explore calculators/i })).toBeInTheDocument();
});
