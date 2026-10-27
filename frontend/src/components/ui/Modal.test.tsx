import React, { useState } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Modal, resetModalStackForTesting, getModalStack } from './Modal';

describe('Modal - Accessibility & Focus Trap', () => {
  beforeEach(() => {
    resetModalStackForTesting();
  });
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

  it('only intercepts Escape on the topmost modal in nested/concurrent dialogs (LIFO)', () => {
    const handleClose1 = vi.fn();
    const handleClose2 = vi.fn();

    const { rerender } = render(
      <div>
        <Modal isOpen={true} onClose={handleClose1} title="Modal One">
          <p>Modal 1 content</p>
        </Modal>
      </div>
    );

    expect(getModalStack().length).toBe(1);

    // Open second modal on top
    rerender(
      <div>
        <Modal isOpen={true} onClose={handleClose1} title="Modal One">
          <p>Modal 1 content</p>
        </Modal>
        <Modal isOpen={true} onClose={handleClose2} title="Modal Two">
          <p>Modal 2 content</p>
        </Modal>
      </div>
    );

    expect(getModalStack().length).toBe(2);

    // Press Escape -> only topmost (Modal 2) should receive onClose
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose2).toHaveBeenCalledTimes(1);
    expect(handleClose1).toHaveBeenCalledTimes(0);
  });

  it('isolates focus trap to topmost modal without interference from lower modal', () => {
    render(
      <div>
        <Modal isOpen={true} onClose={vi.fn()} title="Parent Modal">
          <button type="button" id="parent-btn-1">Parent Btn 1</button>
          <button type="button" id="parent-btn-2">Parent Btn 2</button>
        </Modal>
        <Modal isOpen={true} onClose={vi.fn()} title="Child Modal Topmost">
          <button type="button" id="child-btn-1">Child Btn 1</button>
          <button type="button" id="child-btn-2">Child Btn 2</button>
        </Modal>
      </div>
    );

    const childBtn2 = screen.getByRole('button', { name: 'Child Btn 2' });
    const closeButtons = screen.getAllByRole('button', { name: 'Đóng hộp thoại' });
    const childCloseBtn = closeButtons[1]; // second modal close button

    childBtn2.focus();
    expect(document.activeElement).toBe(childBtn2);

    // Tab on last element of child modal wraps to child close button, NOT parent buttons
    fireEvent.keyDown(window, { key: 'Tab' });
    expect(document.activeElement).toBe(childCloseBtn);
  });

  it('preserves initial body overflow when modals close out of order', () => {
    document.body.style.overflow = 'auto';

    const ParentChildContainer = ({ showParent, showChild }: { showParent: boolean; showChild: boolean }) => (
      <div>
        {showParent && (
          <Modal isOpen={true} onClose={vi.fn()} title="Parent">
            <div>Parent Content</div>
          </Modal>
        )}
        {showChild && (
          <Modal isOpen={true} onClose={vi.fn()} title="Child">
            <div>Child Content</div>
          </Modal>
        )}
      </div>
    );

    const { rerender } = render(<ParentChildContainer showParent={true} showChild={false} />);
    expect(document.body.style.overflow).toBe('hidden');

    // Child opens
    rerender(<ParentChildContainer showParent={true} showChild={true} />);
    expect(document.body.style.overflow).toBe('hidden');
    expect(getModalStack().length).toBe(2);

    // Parent closes first (out of order!)
    rerender(<ParentChildContainer showParent={false} showChild={true} />);
    expect(document.body.style.overflow).toBe('hidden');
    expect(getModalStack().length).toBe(1);

    // Child closes last
    rerender(<ParentChildContainer showParent={false} showChild={false} />);
    expect(getModalStack().length).toBe(0);
    expect(document.body.style.overflow).toBe('auto');

    document.body.style.overflow = '';
  });
});
