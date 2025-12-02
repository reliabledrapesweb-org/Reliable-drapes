import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from './SearchBar';

describe('SearchBar', () => {
  test('renders search input with placeholder', () => {
    render(<SearchBar value="" onChange={() => {}} />);
    const input = screen.getByPlaceholderText(/search/i);
    expect(input).toBeInTheDocument();
  });

  test('displays provided value in input', () => {
    render(<SearchBar value="test search" onChange={() => {}} />);
    const input = screen.getByDisplayValue('test search');
    expect(input).toBeInTheDocument();
  });

  test('calls onChange callback when user types', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<SearchBar value="" onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'drapes');

    expect(handleChange).toHaveBeenCalled();
  });

  test('calls onChange with correct value when user types', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<SearchBar value="" onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'c');

    expect(handleChange).toHaveBeenCalledWith('c');
  });

  test('clears search when clear button is clicked', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<SearchBar value="test" onChange={handleChange} />);

    const clearButton = screen.getByLabelText('Clear search');
    await user.click(clearButton);
    expect(handleChange).toHaveBeenCalledWith('');
  });

  test('only shows clear button when input has value', () => {
    const { rerender } = render(<SearchBar value="" onChange={() => {}} />);
    expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();

    rerender(<SearchBar value="search text" onChange={() => {}} />);
    expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
  });

  test('always shows search button regardless of input value', () => {
    render(<SearchBar value="" onChange={() => {}} />);
    expect(screen.getByLabelText('Search')).toBeInTheDocument();
  });

  test('handles empty string input', () => {
    render(<SearchBar value="" onChange={() => {}} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('');
  });
});
