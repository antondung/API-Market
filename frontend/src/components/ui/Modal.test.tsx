import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Modal } from './Modal';

describe('Modal - Accessibility & Focus Trap', () => {
  it('renders with full ARIA dialog attributes', () => {
    render(
      <Modal
        isOpen={true}
        onClose={vi.fn()}
        title="Accessible Modal Title"
        description="Detailed dialog explanation"
      >
        <button type="button">Action Inside</button>
      </Modal>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeDefined();
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.getAttribute('aria-labelledby')).toBe('modal-title');
    expect(dialog.getAttribute('aria-describedby')).toBe('modal-description');
    expect(screen.getByText('Accessible Modal Title')).toBeDefined();
    expect(screen.getByText('Detailed dialog explanation')).toBeDefined();
  });

  it('triggers onClose when Escape key is pressed', () => {
    const handleClose = vi.fn();
    render(
      <Modal
        isOpen={true}
        onClose={handleClose}
        title="Escape Test Modal"
      >
        <p>Modal content</p>
      </Modal>
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('traps focus using Tab and Shift+Tab cycling', async () => {
    render(
      <Modal
        isOpen={true}
        onClose={vi.fn()}
        title="Focus Trap Modal"
      >
        <button type="button" id="btn-1">First Button</button>
        <button type="button" id="btn-2">Second Button</button>
      </Modal>
    );

    // Initial interactive element is focused or close button
    const closeBtn = screen.getByRole('button', { name: 'Đóng hộp thoại' });
    const btn2 = screen.getByRole('button', { name: 'Second Button' });

    // Focus last interactive button
    btn2.focus();
    expect(document.activeElement).toBe(btn2);

    // Press Tab on last element -> wraps to close button (first interactive in dialog header)
    fireEvent.keyDown(window, { key: 'Tab' });
    expect(document.activeElement).toBe(closeBtn);

    // Press Shift+Tab on first element -> wraps to last button (btn2)
    fireEvent.keyDown(window, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(btn2);
  });

  it('restores focus to trigger button upon modal close', async () => {
    const TestComponent = () => {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <div>
          <button
            type="button"
            id="trigger-btn"
            onClick={() => setIsOpen(true)}
          >
            Open Modal
          </button>
          <Modal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            title="Focus Restore Modal"
          >
            <button type="button" onClick={() => setIsOpen(false)}>
              Close from inside
            </button>
          </Modal>
        </div>
      );
    };

    render(<TestComponent />);

    const triggerBtn = screen.getByRole('button', { name: 'Open Modal' });
    triggerBtn.focus();
    expect(document.activeElement).toBe(triggerBtn);

    // Open modal
    fireEvent.click(triggerBtn);
    expect(screen.getByRole('dialog')).toBeDefined();

    // Close modal via inside button
    const insideCloseBtn = screen.getByRole('button', { name: 'Close from inside' });
    fireEvent.click(insideCloseBtn);

    // Modal is unmounted and trigger receives restored focus
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
      expect(document.activeElement).toBe(triggerBtn);
    });
  });
});
