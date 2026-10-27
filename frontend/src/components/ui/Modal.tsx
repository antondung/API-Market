import React, { useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
}

// Internal LIFO Modal Stack Manager to coordinate topmost modal interactions
/* oxlint-disable react/only-export-components */
let modalStack: string[] = [];
let initialBodyOverflow = '';

export function isTopmostModal(id: string): boolean {
  return modalStack.length > 0 && modalStack[modalStack.length - 1] === id;
}

export function getModalStack(): readonly string[] {
  return modalStack;
}

export function resetModalStackForTesting(): void {
  modalStack = [];
  initialBodyOverflow = '';
  document.body.style.overflow = '';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'lg'
}) => {
  const shouldReduceMotion = useReducedMotion();
  const rawId = useId();
  const cleanId = rawId.replace(/:/g, '');
  const titleId = `modal-title-${cleanId}`;
  const descriptionId = `modal-description-${cleanId}`;

  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  // Keep onClose callback ref fresh without re-triggering effects
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (isOpen) {
      previousActiveElementRef.current = document.activeElement as HTMLElement | null;

      // Register into modal stack (push to top of LIFO stack)
      modalStack.push(cleanId);

      // Lock body overflow only on first modal opening (0 -> 1 transition)
      if (modalStack.length === 1) {
        initialBodyOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
      }

      const handleKeyDown = (e: KeyboardEvent) => {
        // Enforce strict topmost-only processing
        if (!isTopmostModal(cleanId)) {
          return;
        }

        if (e.key === 'Escape') {
          e.stopPropagation();
          e.stopImmediatePropagation();
          e.preventDefault();
          onCloseRef.current();
          return;
        }

        if (e.key === 'Tab') {
          const container = modalContainerRef.current;
          if (!container) return;

          const focusableElements = container.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          const focusable = Array.from(focusableElements).filter(
            el => !el.hasAttribute('disabled')
          );

          if (focusable.length === 0) {
            e.preventDefault();
            return;
          }

          const first = focusable[0];
          const last = focusable[focusable.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === first || !container.contains(document.activeElement)) {
              e.preventDefault();
              last.focus();
            }
          } else {
            if (document.activeElement === last || !container.contains(document.activeElement)) {
              e.preventDefault();
              first.focus();
            }
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);

      // Focus first interactive element or close button for topmost modal
      const timer = setTimeout(() => {
        if (!isTopmostModal(cleanId)) return;
        const container = modalContainerRef.current;
        if (container) {
          const focusable = container.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          const firstInteractive = Array.from(focusable).find(
            el => !el.hasAttribute('disabled')
          );
          if (firstInteractive) {
            firstInteractive.focus();
          } else {
            closeButtonRef.current?.focus();
          }
        }
      }, 50);

      return () => {
        clearTimeout(timer);
        // Remove this modal from stack
        const idx = modalStack.indexOf(cleanId);
        if (idx !== -1) {
          modalStack.splice(idx, 1);
        }

        // Restore body overflow only when all modals have closed (1 -> 0 transition)
        if (modalStack.length === 0) {
          document.body.style.overflow = initialBodyOverflow;
          initialBodyOverflow = '';
        }

        window.removeEventListener('keydown', handleKeyDown);
        if (
          previousActiveElementRef.current &&
          typeof previousActiveElementRef.current.focus === 'function' &&
          document.body.contains(previousActiveElementRef.current)
        ) {
          previousActiveElementRef.current.focus();
        }
      };
    }
  }, [isOpen, cleanId]);

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) onCloseRef.current();
          }}
        >
          <motion.div
            ref={modalContainerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
            className={`w-full ${maxWidthClasses[maxWidth]} bg-surface-container-lowest border border-outline-variant/40 rounded-2xl shadow-2xl overflow-hidden`}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30 bg-surface-container-low">
              <div>
                <h3 id={titleId} className="text-headline-sm font-headline-sm text-on-surface">{title}</h3>
                {description && <p id={descriptionId} className="text-body-sm text-on-surface-variant mt-0.5">{description}</p>}
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                aria-label="Đóng hộp thoại"
                onClick={() => onCloseRef.current()}
                className="w-11 h-11 rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-surface-container-highest transition-colors cursor-pointer touch-manipulation"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
