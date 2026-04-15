export type XptiShareCardPresetId = 'xpti-core' | 'xpti-noir';

export interface XptiShareCardPreset {
  id: XptiShareCardPresetId;
  background: string;
  /** Deep background for layered panels */
  backgroundDeep: string;
  textStrong: string;
  textBody: string;
  textMuted: string;
  divider: string;
  headerTone: string;
  panelSurface: string;
  panelStrokeAlpha: number;
  dataSurface: string;
  ctaGradientFrom: string;
  ctaGradientTo: string;
  modalPrimary: string;
  /** Warm accent for decorative elements */
  warmGlow: string;
  /** Subtle shimmer color for highlights */
  shimmer: string;
}

const PRESETS: Record<XptiShareCardPresetId, XptiShareCardPreset> = {
  'xpti-core': {
    id: 'xpti-core',
    // Warm near-black with burgundy undertone — premium dark, not generic
    background: '#0A0508',
    backgroundDeep: '#060304',
    // Warm-tinted text hierarchy
    textStrong: '#FDF5F7',
    textBody: '#DBCED3',
    textMuted: '#9A858C',
    // Subtle warm divider
    divider: '#2D1A22',
    headerTone: '#EADAE0',
    // Elevated dark surface
    panelSurface: '#12090E',
    panelStrokeAlpha: 0.32,
    dataSurface: '#1A0E14',
    ctaGradientFrom: '#C2485E',
    ctaGradientTo: '#A3526E',
    modalPrimary: '#C2485E',
    // Warm gold glow for decorative elements
    warmGlow: '#D4A07A',
    shimmer: '#F5E6D8',
  },
  'xpti-noir': {
    id: 'xpti-noir',
    background: '#070408',
    backgroundDeep: '#040203',
    textStrong: '#F8F0F2',
    textBody: '#CFC0C5',
    textMuted: '#8B7A80',
    divider: '#241820',
    headerTone: '#D8C6CC',
    panelSurface: '#0F080C',
    panelStrokeAlpha: 0.28,
    dataSurface: '#160C12',
    ctaGradientFrom: '#B33C58',
    ctaGradientTo: '#8E3B5A',
    modalPrimary: '#B33C58',
    warmGlow: '#C89878',
    shimmer: '#F0DDD0',
  },
};

const SUBTHEME_TO_PRESET: Record<string, XptiShareCardPresetId> = {
  default: 'xpti-core',
  core: 'xpti-core',
  noir: 'xpti-noir',
};

export function resolveXptiShareCardPreset(options?: {
  presetId?: XptiShareCardPresetId;
  subTheme?: string;
}): XptiShareCardPreset {
  if (options?.presetId) return PRESETS[options.presetId];
  const mapped = options?.subTheme ? SUBTHEME_TO_PRESET[options.subTheme] : undefined;
  return PRESETS[mapped ?? 'xpti-core'];
}
