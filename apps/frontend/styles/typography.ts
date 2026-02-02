/**
 * Sistema de Tipografia - Ouvify
 * Escalas, pesos e line-heights
 */

import { typography } from './design-tokens';

export { typography };
export type { FontSize, FontWeight } from './design-tokens';

// Classes CSS utilitárias para headings
export const headingStyles = {
	h1: 'font-heading text-5xl font-bold text-text-primary tracking-tight',
	h2: 'font-heading text-4xl font-bold text-text-primary tracking-tight',
	h3: 'font-heading text-3xl font-semibold text-text-primary',
	h4: 'font-heading text-2xl font-semibold text-text-primary',
	h5: 'font-heading text-xl font-semibold text-text-primary',
	h6: 'font-heading text-lg font-semibold text-text-primary',
} as const;

// Classes para textos
export const textStyles = {
	body: 'font-sans text-base text-text-primary leading-normal',
	bodySecondary: 'font-sans text-base text-text-secondary leading-normal',
	small: 'font-sans text-sm text-text-secondary leading-snug',
	caption: 'font-sans text-xs text-text-tertiary leading-tight',
	label: 'font-sans text-sm font-medium text-text-primary leading-snug',
	link: 'font-sans text-base text-text-link hover:text-text-linkHover underline-offset-4 hover:underline',
} as const;
