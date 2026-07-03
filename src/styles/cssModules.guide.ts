/**
 * CSS Modules Guide
 * 
 * Use CSS Modules for component-scoped styling when:
 * - You need strict scoping to prevent style conflicts
 * - You're building a reusable component library
 * - You want automatic class name generation
 * - You need more control than Tailwind provides
 * 
 * File naming: ComponentName.module.css or ComponentName.module.scss
 */

/**
 * EXAMPLE: Button.module.css
 * Usage in component:
 * 
 * import styles from './Button.module.css';
 * 
 * export function Button({ variant = 'primary', children }) {
 *   return (
 *     <button className={`${styles.button} ${styles[variant]}`}>
 *       {children}
 *     </button>
 *   );
 * }
 */

/**
 * CSS Modules Best Practices:
 * 
 * 1. NAMING CONVENTIONS:
 *    - Use camelCase for class selectors: .primaryButton not .primary-button
 *    - Name the root class after the component: .card, .button, .modal
 *    - Use BEM-like patterns: .card__header, .card__body, .card__footer
 * 
 * 2. SCOPING:
 *    - CSS Modules automatically scope styles to the component
 *    - Avoid global selectors (no body, html, or tag selectors)
 *    - Use :global() for intentional global styles
 * 
 * 3. COMPOSITION:
 *    - Use `composes` to inherit styles from other classes
 *    - Can compose from global stylesheets with `composes ... from global`
 * 
 * 4. STATE MANAGEMENT:
 *    - Handle active/disabled/hover states in CSS
 *    - Use data-attributes when logic is complex
 * 
 * 5. RESPONSIVE DESIGN:
 *    - Use media queries directly in CSS Modules
 *    - Keep responsive logic close to the component
 * 
 * 6. VARIABLES:
 *    - Use CSS custom properties instead of SCSS/LESS variables
 *    - Import theme tokens from theme.tokens.ts
 */

/**
 * EXAMPLE: Card.module.css
 */
export const cardModuleExample = `
.card {
  background-color: var(--color-background, white);
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: box-shadow 250ms ease;
}

.card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Nested structure using BEM */
.card__header {
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--color-divider);
  padding-bottom: 1rem;
}

.card__title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.card__body {
  margin: 1rem 0;
}

.card__footer {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-divider);
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

/* Variants using classes */
.elevated {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.interactive {
  cursor: pointer;
  transition: transform 250ms ease, box-shadow 250ms ease;
}

.interactive:hover {
  transform: translateY(-2px);
}

/* Responsive design */
@media (max-width: 768px) {
  .card {
    padding: 1rem;
  }
  
  .card__footer {
    flex-direction: column;
  }
}

/* Dark mode with CSS variables */
:root.dark .card {
  background-color: var(--color-surface);
  border-color: var(--color-border);
}

/* Using :global() for intentional global styles */
:global(.dark) .card {
  background-color: #1f2937;
}
`;

/**
 * EXAMPLE: Button.module.css with composition
 */
export const buttonModuleExample = `
/* Base button styles */
.button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 250ms ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  outline: none;
}

.button:focus {
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.button:active {
  transform: scale(0.98);
}

/* Variants */
.primary {
  background-color: var(--color-primary);
  color: white;
}

.primary:hover {
  background-color: #1d4ed8;
  box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);
}

.secondary {
  background-color: var(--color-primary-100);
  color: var(--color-primary-700);
}

.secondary:hover {
  background-color: #bdd9ff;
}

.danger {
  background-color: var(--color-error);
  color: white;
}

.danger:hover {
  background-color: #dc2626;
}

/* Sizes */
.small {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.large {
  padding: 1rem 2rem;
  font-size: 1.125rem;
}

/* States */
.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.full {
  width: 100%;
}

.loading {
  opacity: 0.7;
  pointer-events: none;
}

.loading::after {
  content: '';
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
`;

/**
 * EXAMPLE: Input.module.css
 */
export const inputModuleExample = `
.inputWrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-primary);
}

.required::after {
  content: '*';
  color: var(--color-error);
  margin-left: 0.25rem;
}

.input {
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 250ms ease, box-shadow 250ms ease;
  background-color: var(--color-background);
  color: var(--color-text-primary);
}

.input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

.input:disabled {
  background-color: var(--color-divider);
  color: var(--color-text-disabled);
  cursor: not-allowed;
}

.input::placeholder {
  color: var(--color-text-tertiary);
}

/* Error state */
.input[aria-invalid="true"] {
  border-color: var(--color-error);
}

.input[aria-invalid="true"]:focus {
  box-shadow: 0 0 0 3px var(--color-error-light);
}

.hint {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.error {
  font-size: 0.75rem;
  color: var(--color-error);
}

/* Sizes */
.small {
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
}

.large {
  padding: 1rem 1.25rem;
  font-size: 1.125rem;
}
`;

/**
 * EXAMPLE: React Component using CSS Modules
 * 
 * import styles from './Card.module.css';
 * 
 * export interface CardProps {
 *   title?: string;
 *   children: React.ReactNode;
 *   elevated?: boolean;
 *   interactive?: boolean;
 *   className?: string;
 * }
 * 
 * export function Card({
 *   title,
 *   children,
 *   elevated = false,
 *   interactive = false,
 *   className = '',
 * }: CardProps) {
 *   const cardClassName = [
 *     styles.card,
 *     elevated && styles.elevated,
 *     interactive && styles.interactive,
 *     className,
 *   ]
 *     .filter(Boolean)
 *     .join(' ');
 * 
 *   return (
 *     <div className={cardClassName}>
 *       {title && (
 *         <div className={styles.card__header}>
 *           <h2 className={styles.card__title}>{title}</h2>
 *         </div>
 *       )}
 *       <div className={styles.card__body}>
 *         {children}
 *       </div>
 *     </div>
 *   );
 * }
 */

/**
 * INTEGRATION WITH TAILWIND:
 * 
 * You can combine CSS Modules with Tailwind for the best of both worlds:
 * 
 * export function Button({ variant = 'primary', className = '' }) {
 *   return (
 *     <button
 *       className={cn(
 *         styles.button,
 *         styles[variant],
 *         'px-4 py-2 rounded-lg font-semibold',
 *         className
 *       )}
 *     >
 *       Click me
 *     </button>
 *   );
 * }
 * 
 * Use Tailwind for:
 * - Utility-first rapid development
 * - Common layouts (flexbox, grid, spacing)
 * - Responsive utilities
 * 
 * Use CSS Modules for:
 * - Component-specific complex styles
 * - Strict style scoping
 * - Reusable component libraries
 * - Animation keyframes
 * - Complex selectors
 */

/**
 * PERFORMANCE TIPS:
 * 
 * 1. Tree-shake unused styles with PurgeCSS/UnusedCSS
 * 2. Use CSS variables instead of inline styles
 * 3. Combine with CSS-in-JS for dynamic styling
 * 4. Use CSS Grid/Flexbox for layouts
 * 5. Leverage modern CSS features (Grid, Subgrid, Container Queries)
 * 
 * Modern CSS Modules features:
 * - Local scope by default (no conflicts)
 * - Composition with `composes`
 * - :global() for intentional globals
 * - Auto-prefix vendor properties
 */

export default {
  cardModuleExample,
  buttonModuleExample,
  inputModuleExample,
};
