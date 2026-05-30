export interface ThemeColors {
  bg: string;
  surface: string;
  text: string;
  muted: string;
  accent: string;
  accentGlow: string;
  border: string;
}

export interface Theme {
  id: string;
  name: string;
  isBuiltIn?: boolean;
  colors: ThemeColors;
  font: string;
  mono: string;
  radius: string;
}
