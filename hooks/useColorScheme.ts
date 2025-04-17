import { useColorScheme as _useColorScheme } from 'react-native';

/**
 * Siempre retorna 'light' o 'dark' (nunca null).
 */
export function useColorScheme(): 'light' | 'dark' {
  const scheme = _useColorScheme();
  return scheme === 'dark' ? 'dark' : 'light';
}
