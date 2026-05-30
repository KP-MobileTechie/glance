import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { defaultState } from '@/lib/store/types';
import { BentoGrid } from './BentoGrid';

describe('BentoGrid', () => {
  it('renders one tile per widget instance', () => {
    render(<BentoGrid state={defaultState()} onChange={() => {}} onLayoutChange={() => {}} />);
    // Each registry title appears as a tile label
    expect(screen.getByText(/today's focus/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add bookmark/i })).toBeInTheDocument();
  });
});
