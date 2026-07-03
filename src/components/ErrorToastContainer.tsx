import React, { useEffect } from "react";
import { useError, type AppError } from "../context/ErrorContext";

/**
 * ErrorToast Component
 * Displays individual error toast notifications
 */
const ErrorToast: React.FC<{ error: AppError; onClose: () => void }> = ({ error, onClose }) => {
  useEffect(() => {
    if (error.autoClose && error.duration) {
      const timer = setTimeout(onClose, error.duration);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [error, onClose]);

  const bgColor = {
    error: "bg-red-500",
    warning: "bg-yellow-500",
    info: "bg-blue-500",
    success: "bg-green-500",
  }[error.type];

  const icon = {
    error: "❌",
    warning: "⚠️",
    info: "ℹ️",
    success: "✅",
  }[error.type];

  return (
    <div
      className={`${bgColor} text-white rounded-lg shadow-lg p-4 mb-2 animate-fade-in flex items-start gap-3 max-w-md`}
    >
      <span className="text-xl flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm">{error.title}</h4>
        <p className="text-sm opacity-90 mt-1 break-words">{error.message}</p>
        {error.action && (
          <button
            onClick={error.action.onClick}
            className="cursor-pointer text-xs mt-2 underline hover:opacity-80 transition-opacity"
          >
            {error.action.label}
          </button>
        )}
      </div>
      {error.dismissible && (
        <button
          onClick={onClose}
          className="cursor-pointer flex-shrink-0 text-lg opacity-75 hover:opacity-100 transition-opacity"
        >
          ✕
        </button>
      )}
    </div>
  );
};

/**
 * ErrorToastContainer Component
 * Displays all error toasts
 */
const ErrorToastContainer: React.FC = () => {
  const { errors, removeError } = useError();

  if (errors.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-h-96 overflow-y-auto">
      {errors.map((error) => (
        <ErrorToast key={error.id} error={error} onClose={() => removeError(error.id)} />
      ))}
    </div>
  );
};

export default ErrorToastContainer;
