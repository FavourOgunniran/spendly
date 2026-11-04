import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  isDestructive = true,
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      size="sm"
      showCloseButton={true}
      icon={
        <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-[#2e181e] text-[#f87171] flex items-center justify-center border border-rose-200/40 dark:border-rose-500/10">
          <AlertTriangle className="w-4 h-4 stroke-[2.2]" />
        </div>
      }
      title={title}
    >
      <div className="space-y-4 pt-1">
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
          {message}
        </p>

        {/* Action buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-center gap-2.5 pt-2 border-t border-slate-100 dark:border-[#22242d]">
          <Button
            type="button"
            variant="secondary"
            className="w-full sm:flex-1"
            disabled={isLoading}
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={isDestructive ? 'danger' : 'primary'}
            className="w-full sm:flex-1"
            isLoading={isLoading}
            onClick={onConfirm}
            leftIcon={isDestructive ? <Trash2 className="w-3.5 h-3.5" /> : undefined}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
