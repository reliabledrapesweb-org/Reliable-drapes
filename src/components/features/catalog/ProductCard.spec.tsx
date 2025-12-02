import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductCard } from './ProductCard';

// Mock framer-motion to simplify testing animations
vi.mock('framer-motion', () => ({
  motion: {
    article: ({ children, ...props }: any) => <article {...props}>{children}</article>,
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h3: ({ children, ...props }: any) => <h3 {...props}>{children}</h3>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

describe('ProductCard', () => {
  const defaultProps = {
    title: 'Premium Curtains',
    subtitle: 'Elegant fabric collection',
    imageSrc: '/test-image.jpg',
  };

  test('renders product title', () => {
    render(<ProductCard {...defaultProps} />);
    expect(screen.getByText('Premium Curtains')).toBeInTheDocument();
  });

  test('renders product subtitle', () => {
    render(<ProductCard {...defaultProps} />);
    expect(screen.getByText('Elegant fabric collection')).toBeInTheDocument();
  });

  test('renders product image with correct alt text', () => {
    render(<ProductCard {...defaultProps} />);
    const img = screen.getByAltText('Premium Curtains');
    expect(img).toBeInTheDocument();
  });

  test('displays discount badge when badge is discount', () => {
    render(
      <ProductCard {...defaultProps} badge="discount" discountValue="-25%" />
    );
    expect(screen.getByText('-25%')).toBeInTheDocument();
  });

  test('displays new badge when badge is new', () => {
    render(
      <ProductCard {...defaultProps} badge="new" />
    );
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  test('uses custom discount value', () => {
    render(
      <ProductCard
        {...defaultProps}
        badge="discount"
        discountValue="-50%"
      />
    );
    expect(screen.getByText('-50%')).toBeInTheDocument();
  });

  test('does not render badge when badge is null', () => {
    render(<ProductCard {...defaultProps} badge={null} />);
    const badgeContainer = screen.queryByText(/new|-\d+%/);
    expect(badgeContainer).not.toBeInTheDocument();
  });

  test('renders with default badge value when not specified', () => {
    render(
      <ProductCard {...defaultProps} badge="discount" />
    );
    expect(screen.getByText('-30%')).toBeInTheDocument();
  });

  test('applies correct image dimensions', () => {
    render(<ProductCard {...defaultProps} />);
    const img = screen.getByAltText('Premium Curtains');
    expect(img).toHaveAttribute('width', '500');
    expect(img).toHaveAttribute('height', '500');
  });

  test('applies lazy loading to image', () => {
    render(<ProductCard {...defaultProps} />);
    const img = screen.getByAltText('Premium Curtains');
    expect(img).toHaveAttribute('loading', 'lazy');
  });

  test('renders all text content correctly', () => {
    render(
      <ProductCard
        {...defaultProps}
        title="Velvet Drapes"
        subtitle="Luxurious finish"
      />
    );
    expect(screen.getByText('Velvet Drapes')).toBeInTheDocument();
    expect(screen.getByText('Luxurious finish')).toBeInTheDocument();
  });
});
