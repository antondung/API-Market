import * as AlertDialog from "@radix-ui/react-alert-dialog";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { t, useLanguage } from "../i18n";

export function Button({
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  useLanguage();
  return (
    <button {...props} className={twMerge("hub-button", className)}>
      {t(children)}
    </button>
  );
}
export function Confirm({
  title,
  description,
  open,
  onClose,
  onConfirm,
}: {
  title: string;
  description: string;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  useLanguage();
  return (
    <AlertDialog.Root open={open} onOpenChange={(value) => !value && onClose()}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="modal-overlay" />
        <AlertDialog.Content className="modal-content">
          <AlertDialog.Title className="text-headline-md">
            {t(title)}
          </AlertDialog.Title>
          <AlertDialog.Description className="my-5 text-on-surface-variant">
            {t(description)}
          </AlertDialog.Description>
          <div className="flex justify-end gap-3">
            <AlertDialog.Cancel asChild>
              <Button>{t("Cancel")}</Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button className="danger" onClick={onConfirm}>
                {t("Sign out")}
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
      {children}
    </label>
  );
}
export function Panel({ children }: { children: ReactNode }) {
  return <div className="hub-panel">{children}</div>;
}
