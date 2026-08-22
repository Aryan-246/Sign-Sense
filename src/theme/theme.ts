/**
 * Minimal, centralized design tokens. Dark theme (see app.json userInterfaceStyle).
 * Kept intentionally small — the priority for this milestone is BLE/data correctness,
 * not visual polish.
 */
export const colors = {
  background: '#0B1020',
  surface: '#151C2E',
  surfaceAlt: '#1E2740',
  primary: '#4C8DFF',
  primaryDim: '#26406E',
  text: '#F2F5FF',
  textDim: '#93A0BF',
  success: '#3CCB7F',
  warning: '#F5B54B',
  danger: '#FF5C6C',
  border: '#26304B',
} as const;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;

export const radius = { sm: 8, md: 12, lg: 20, pill: 999 } as const;

export const font = {
  h1: 30,
  h2: 22,
  h3: 18,
  body: 15,
  small: 13,
} as const;
