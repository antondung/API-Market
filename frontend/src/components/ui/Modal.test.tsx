import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Modal } from './Modal';

describe('Modal - Accessibility & Focus Trap', () => {
  it('renders with full ARIA dialog attributes using unique IDs', () => {
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
    const titleId = dialog.getAttribute('aria-labelledby');
    const descId = dialog.getAttribute('aria-describedby');
    expect(titleId).toBeTruthy();
    expect(descId).toBeTruthy();
    expect(document.getElementById(titleId!)?.textContent).toBe('Accessible Modal Title');
    expect(document.getElementById(descId!)?.textContent).toBe('Detailed dialog explanation');
  });

  it('generates non-colliding ARIA IDs for multiple modals', () => {
    render(
      <div>
        <Modal isOpen={true} onClose={vi.fn()} title="Modal One">
          <div>Content 1</div>
        </Modal>
        <Modal isOpen={true} onClose={vi.fn()} title="Modal Two">
          <div>Content 2</div>
        </Modal>
      </div>
    );

    const dialogs = screen.getAllByRole('dialog');
    expect(dialogs.length).toBe(2);
    const id1 = dialogs[0].getAttribute('aria-labelledby');
    const id2 = dialogs[1].getAttribute('aria-labelledby');
    expect(id1).toBeTruthy();
    expect(id2).toBeTruthy();
    expect(id1).not.toBe(id2);
  });

  it('preserves and restores exact prior body overflow style', async () => {
    document.body.style.overflow = 'scroll';

    const { unmount } = render(
      <Modal isOpen={true} onClose={vi.fn()} title="Overflow Test Modal">
        <div>Content</div>
      </Modal>
    );

    expect(document.body.style.overflow).toBe('hidden');

    unmount();
    expect(document.body.style.overflow).toBe('scroll');
    document.body.style.overflow = '';
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
