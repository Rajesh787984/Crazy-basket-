export type Theme = 'light' | 'dark' | 'system';

export interface ThemeSettings {
  defaultTheme: Theme;
  allowUserOverride: boolean;
}
