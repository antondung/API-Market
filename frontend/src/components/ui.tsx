import { t, useLanguage } from "../i18n";
import * as Dialog from "@radix-ui/react-dialog";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import type { ReactNode, ButtonHTMLAttributes } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function Button({
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  useLanguage();
  return (
    <button {...props} className={twMerge(clsx("hub-button", className))}>
      {t(children)}
    </button>
  );
}
export function Modal({
  title,
  children,
  open,
  onClose,
}: {
  title: string;
  children: ReactNode;
  open: boolean;
  onClose: () => void;
}) {
  useLanguage();
  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content className="modal-content">
          <Dialog.Title className="text-headline-md font-headline-md">
            {t(title)}
          </Dialog.Title>
          <Dialog.Description className="text-body-sm text-on-surface-variant mt-2">
            {t(
              "Demo workspace \u00B7 changes are stored only in this browser.",
            )}
          </Dialog.Description>
          <Dialog.Close className="modal-close" aria-label={t("Close dialog")}>
            {t("\u00D7")}
          </Dialog.Close>
          {t(children)}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
export function Confirm({
  title,
  description,
  open,
  onClose,
  onConfirm,
  children,
  disabled = false,
}: {
  title: string;
  description: string;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  children?: ReactNode;
  disabled?: boolean;
}) {
  useLanguage();
  return (
    <AlertDialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="modal-overlay" />
        <AlertDialog.Content className="modal-content">
          <AlertDialog.Title className="text-headline-md">
            {t(title)}
          </AlertDialog.Title>
          <AlertDialog.Description className="my-5 text-on-surface-variant">
            {t(description)}
          </AlertDialog.Description>
          {children}
          <div className="flex justify-end gap-3">
            <AlertDialog.Cancel asChild>
              <Button onClick={onClose}>{t("Cancel")}</Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button
                className="danger"
                disabled={disabled}
                onClick={onConfirm}
              >
                {t("Confirm")}
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  useLanguage();
  return (
    <label className="hub-field">
      <span>{t(label)}</span>
      {t(children)}
    </label>
  );
}
export function Panel({ children }: { children: ReactNode }) {
  useLanguage();
  return <div className="hub-panel">{t(children)}</div>;
}
