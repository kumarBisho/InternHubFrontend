/**
 * CSS-in-JS Guide: Dynamic Styling with Emotion
 * 
 * This file demonstrates dynamic styling patterns using Emotion CSS-in-JS
 * for scenarios where Tailwind CSS class-based approach isn't sufficient.
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { colors, spacing, typography, shadows, borderRadius, transitions } from './theme.tokens';

// ============================================================================
// 1. BASIC EMOTION STYLED COMPONENTS
// ============================================================================

/**
 * Styled component example with theme tokens
 * Use for components that need dynamic styling based on props
 */
interface StyledButtonProps {
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export const StyledButton = styled.button<StyledButtonProps>`
  background-color: ${(props: StyledButtonProps) => 
    props.disabled ? colors.neutral[300] : 
    props.variant === 'secondary' ? colors.primary[100] : 
    colors.primary[500]
  };
  
  color: ${(props: StyledButtonProps) =>
    props.disabled ? colors.neutral[500] :
    props.variant === 'secondary' ? colors.primary[700] :
    '#ffffff'
  };
  
  padding: ${spacing[3]} ${spacing[6]};
  border-radius: ${borderRadius.md};
  border: none;
  font-weight: ${typography.fontWeight.semibold};
  cursor: ${(props: StyledButtonProps) => props.disabled ? 'not-allowed' : 'pointer'};
  
  transition: background-color ${transitions.base}, box-shadow ${transitions.base};
  
  &:hover:not(:disabled) {
    background-color: ${(props: StyledButtonProps) =>
      props.variant === 'secondary' ? colors.primary[200] :
      colors.primary[600]
    };
    box-shadow: ${shadows['elevation-2']};
  }
  
  &:focus {
    outline: none;
    box-shadow: ${shadows.focus};
  }
`;

// ============================================================================
// 2. CSS HELPER FUNCTIONS FOR COMMON PATTERNS
// ============================================================================

/**
 * Create a flexbox container with common settings
 */
export const flexbox = (direction = 'row', gap = spacing[4], align = 'center') => css`
  display: flex;
  flex-direction: ${direction};
  gap: ${gap};
  align-items: ${align};
  justify-content: ${direction === 'row' ? 'space-between' : 'flex-start'};
`;

/**
 * Create a grid layout
 */
export const grid = (cols = 3, gap = spacing[4]) => css`
  display: grid;
  grid-template-columns: repeat(${cols}, 1fr);
  gap: ${gap};
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(${Math.max(1, cols - 1)}, 1fr);
  }
`;

/**
 * Text truncation with ellipsis
 */
export const truncate = (lines = 1) => css`
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: ${lines};
  -webkit-box-orient: vertical;
`;

/**
 * Absolute centering
 */
export const center = css`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

/**
 * Create a card with shadow and padding
 */
export const card = (padding: string = spacing[6], hasBorder: boolean = true) => css`
  background-color: #ffffff;
  border-radius: ${borderRadius.lg};
  padding: ${padding};
  box-shadow: ${shadows.base};
  ${hasBorder ? `border: 1px solid ${colors.border};` : ''}
  
  transition: box-shadow ${transitions.base};
  
  &:hover {
    box-shadow: ${shadows.lg};
  }
`;

/**
 * Create responsive text sizes
 */
export const responsiveText = (mobile: string = typography.fontSize['body-md'], tablet: string = typography.fontSize['body-lg']) => css`
  font-size: ${mobile};
  
  @media (min-width: 768px) {
    font-size: ${tablet};
  }
`;

// ============================================================================
// 3. COMPONENT-SPECIFIC STYLED COMPONENTS
// ============================================================================

/**
 * Modal overlay with blur background
 */
export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  
  transition: opacity ${transitions.base};
`;

/**
 * Modal content card
 */
export const ModalContent = styled.div`
  ${card(spacing[6])}
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: ${borderRadius.lg};
  z-index: 51;
  
  @media (min-width: 640px) {
    max-width: 500px;
  }
`;

/**
 * Input field with focus styles
 */
export const StyledInput = styled.input`
  width: 100%;
  padding: ${spacing[3]} ${spacing[4]};
  border: 1px solid ${colors.border};
  border-radius: ${borderRadius.md};
  font-size: ${typography.fontSize['body-md']};
  font-family: ${typography.fontFamily.sans.join(', ')};
  
  transition: border-color ${transitions.base}, box-shadow ${transitions.base};
  
  &:focus {
    outline: none;
    border-color: ${colors.primary[500]};
    box-shadow: 0 0 0 3px ${colors.primary[100]};
  }
  
  &:disabled {
    background-color: ${colors.neutral[100]};
    color: ${colors.neutral[400]};
    cursor: not-allowed;
  }
`;

/**
 * Badge component
 */
interface StyledBadgeProps {
  variant?: 'primary' | 'success' | 'warning' | 'error';
}

export const StyledBadge = styled.span<StyledBadgeProps>`
  display: inline-flex;
  align-items: center;
  gap: ${spacing[2]};
  padding: ${spacing[1]} ${spacing[3]};
  border-radius: ${borderRadius.full};
  font-size: ${typography.fontSize['caption']};
  font-weight: ${typography.fontWeight.semibold};
  
  background-color: ${(props: StyledBadgeProps) => {
    switch (props.variant) {
      case 'success': return colors.success[100];
      case 'warning': return colors.warning[100];
      case 'error': return colors.error[100];
      default: return colors.primary[100];
    }
  }};
  
  color: ${(props: StyledBadgeProps) => {
    switch (props.variant) {
      case 'success': return colors.success[700];
      case 'warning': return colors.warning[700];
      case 'error': return colors.error[700];
      default: return colors.primary[700];
    }
  }};
`;

/**
 * Loading skeleton for data placeholder
 */
export const Skeleton = styled.div`
  background: linear-gradient(
    90deg,
    ${colors.neutral[200]} 25%,
    ${colors.neutral[100]} 50%,
    ${colors.neutral[200]} 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: ${borderRadius.md};
  
  @keyframes loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`;

// ============================================================================
// 4. RESPONSIVE UTILITIES
// ============================================================================

/**
 * Hide on mobile, show on desktop
 */
export const hideOnMobile = css`
  @media (max-width: 768px) {
    display: none !important;
  }
`;

/**
 * Show on mobile, hide on desktop
 */
export const showOnMobileOnly = css`
  @media (min-width: 769px) {
    display: none !important;
  }
`;

/**
 * Container query support for modern layouts
 */
export const containerResponsive = (name = 'main') => css`
  container-type: inline-size;
  container-name: ${name};
`;

// ============================================================================
// 5. ANIMATION UTILITIES
// ============================================================================

/**
 * Fade in animation
 */
export const fadeIn = css`
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  animation: fadeIn ${transitions.base} ease-in;
`;

/**
 * Slide up animation
 */
export const slideUp = css`
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  animation: slideUp ${transitions.base} ease-out;
`;

/**
 * Scale and fade animation (for modals)
 */
export const scaleFadeIn = css`
  @keyframes scaleFadeIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  animation: scaleFadeIn ${transitions.base} ease-in-out;
`;

// ============================================================================
// 6. THEME APPLICATION EXAMPLE
// ============================================================================

/**
 * Example: Building a complex component with CSS-in-JS
 */
interface CardProps {
  hoverable?: boolean;
  interactive?: boolean;
}

export const InteractiveCard = styled.div<CardProps>`
  ${card(spacing[6])}
  
  ${(props: CardProps) => props.hoverable && css`
    cursor: pointer;
    transition: transform ${transitions.base}, box-shadow ${transitions.base};
    
    &:hover {
      transform: translateY(-4px);
      box-shadow: ${shadows.lg};
    }
  `}
  
  ${(props: CardProps) => props.interactive && css`
    &:active {
      transform: translateY(-2px);
    }
  `}
`;

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * Example 1: Simple button with dynamic styling
 * 
 * <StyledButton variant="primary">Click me</StyledButton>
 * <StyledButton variant="secondary" disabled>Disabled</StyledButton>
 */

/**
 * Example 2: Flexbox layout
 * 
 * const Container = styled.div`
 *   ${flexbox('column', spacing[6])}
 * `;
 */

/**
 * Example 3: Modal dialog
 * 
 * <ModalOverlay>
 *   <ModalContent>
 *     <h1>Modal Title</h1>
 *     <p>Modal content here</p>
 *   </ModalContent>
 * </ModalOverlay>
 */

/**
 * Example 4: Responsive grid
 * 
 * const ProductGrid = styled.div`
 *   ${grid(4, spacing[4])}
 * `;
 */

/**
 * Example 5: Text truncation
 * 
 * const TruncatedText = styled.p`
 *   ${truncate(3)}
 *   max-width: 400px;
 * `;
 */

/**
 * Example 6: Using animation
 * 
 * const AnimatedCard = styled.div`
 *   ${card(spacing[6])}
 *   ${slideUp}
 * `;
 */

export default {
  flexbox,
  grid,
  truncate,
  center,
  card,
  responsiveText,
  hideOnMobile,
  showOnMobileOnly,
  containerResponsive,
  fadeIn,
  slideUp,
  scaleFadeIn,
  StyledButton,
  ModalOverlay,
  ModalContent,
  StyledInput,
  StyledBadge,
  Skeleton,
  InteractiveCard,
};
