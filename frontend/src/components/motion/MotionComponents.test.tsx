import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PageReveal } from './PageReveal';
import { AnimatedCard } from './AnimatedCard';
import { AnimatedCounter } from './AnimatedCounter';
import { AnimatedTabs } from './AnimatedTabs';

describe('Motion Components Suite', () => {
  it('renders PageReveal with children and custom className', () => {
    render(
      <PageReveal className="test-reveal-class">
        <div>Page Content</div>
      </PageReveal>
    );
    expect(screen.getByText('Page Content')).toBeDefined();
  });

  it('renders AnimatedCard with children and handles hoverLift', () => {
    render(
      <AnimatedCard hoverLift={true} className="test-card">
        <div>Card Inner Content</div>
      </AnimatedCard>
    );
    expect(screen.getByText('Card Inner Content')).toBeDefined();
  });

  it('renders AnimatedCounter with numeric value', () => {
    render(
      <AnimatedCounter value={100} />
    );
    expect(screen.getByText('100')).toBeDefined();
  });

  it('renders AnimatedTabs and triggers onChange with tab id', () => {
    const onChange = vi.fn();
    render(
      <AnimatedTabs
        tabs={[
          { id: 'tab1', label: 'Tab 1', icon: 'info' },
          { id: 'tab2', label: 'Tab 2', count: 5 },
        ]}
        activeTab="tab1"
        onChange={onChange}
      />
    );

    const tab1Btn = screen.getByRole('button', { name: /Tab 1/i });
    const tab2Btn = screen.getByRole('button', { name: /Tab 2/i });

    expect(tab1Btn.getAttribute('aria-pressed')).toBe('true');
    expect(tab2Btn.getAttribute('aria-pressed')).toBe('false');

    fireEvent.click(tab2Btn);
    expect(onChange).toHaveBeenCalledWith('tab2');
  });
});
