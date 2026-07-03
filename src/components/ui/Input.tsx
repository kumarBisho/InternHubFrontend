import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, required, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className={`label ${required ? 'label-required' : ''}`}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`input ${error ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : ''} ${className}`}
          aria-invalid={!!error}
          {...props}
        />
        {error && (
          <p className="mt-2 text-body-sm text-error-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-body-sm text-neutral-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextareaProps extends InputHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, required, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className={`label ${required ? 'label-required' : ''}`}>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`textarea ${error ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : ''} ${className}`}
          aria-invalid={!!error}
          {...props}
        />
        {error && (
          <p className="mt-2 text-body-sm text-error-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-body-sm text-neutral-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

interface SelectProps extends InputHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  options: Array<{ value: string; label: string }>;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, required, options, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className={`label ${required ? 'label-required' : ''}`}>
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`select ${error ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : ''} ${className}`}
          aria-invalid={!!error}
          {...props}
        >
          <option value="">Select an option...</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-2 text-body-sm text-error-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-body-sm text-neutral-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Input, Textarea, Select };
export default Input;
