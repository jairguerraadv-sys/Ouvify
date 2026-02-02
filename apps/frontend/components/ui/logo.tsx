import React from 'react';
import {
	Logo,
	LogoHeaderMobile,
	type LogoSize,
} from '@/components/brand/Logo';

export * from '@/components/brand/Logo';
export { default } from '@/components/brand/Logo';

/** Alias mantido por compatibilidade (mobile header). */
export const LogoMobile = LogoHeaderMobile;

/** Alias mantido por compatibilidade (logo decorativo/não clicável). */
export const LogoStatic = ({ size = 'md' }: { size?: LogoSize }) => (
	<Logo size={size} href={null} />
);
