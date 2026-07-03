import { type ReactNode } from 'react';

interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: ReactNode;
  onClose?: () => void;
}

const alertIcons = {
  info: 'ℹ️',
  success: '✓',
  warning: '⚠️',
  error: '✕',
};

export default function Alert({
  variant = 'info',
  title,
  children,
  onClose,
}: AlertProps) {
  return (
    <div className={`alert alert-${variant}`} role="alert">
      <div className="flex-shrink-0 text-lg">
        {alertIcons[variant]}
      </div>
      <div className="flex-1">
        {title && <h4 className="font-semibold text-body-sm mb-1">{title}</h4>}
        <p className="text-body-sm opacity-90">{children}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 ml-2 text-lg hover:opacity-70 transition-opacity"
          aria-label="Close alert"
        >
          ✕
        </button>
      )}
    </div>
  );
}
