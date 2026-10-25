// Colour palette shared by every screen (matches the mockups).
export const C = {
  bg: '#FFF7EE',
  card: '#FFFFFF',
  ink: '#1E1B3A',
  ink2: '#3E3A5C',
  muted: '#5A5770',
  line: '#ECE6DA',
  violet: '#5B2EBF',
  violetDark: '#3D1D86',
  violetTint: '#EFE9FC',
  magenta: '#D6246E',
  magentaDark: '#A01452',
  magentaTint: '#FCE7F0',
  marigold: '#F59E0B',
  marigoldTint: '#FEF3D7',
  gold: '#FBC54A',
  teal: '#0E9F8E',
  tealDark: '#0B6E63',
  tealTint: '#DDF5F1',
  blue: '#2563EB',
  blueDark: '#1D4FC4',
  blueTint: '#E3EDFD',
  coral: '#F97352',
  coralTint: '#FFE9E2',
  green: '#16A34A',
  greenDark: '#11612F',
  greenTint: '#DFF5E6',
  red: '#B42318',
  redTint: '#FBE4E4',
};

// Rotating bright colours for tiles: [solid, tint, text-on-solid, text-on-tint]
export const PALETTE: [string, string, string, string][] = [
  [C.magenta, C.magentaTint, '#FFFFFF', '#B3165A'],
  [C.marigold, C.marigoldTint, C.ink, '#8A5300'],
  [C.teal, C.tealTint, C.ink, C.tealDark],
  [C.blue, C.blueTint, '#FFFFFF', C.blueDark],
  [C.violet, C.violetTint, '#FFFFFF', C.violet],
  [C.coral, C.coralTint, C.ink, '#B23A1C'],
  [C.green, C.greenTint, C.ink, C.greenDark],
];

export const pal = (i: number) => PALETTE[((i % PALETTE.length) + PALETTE.length) % PALETTE.length];
