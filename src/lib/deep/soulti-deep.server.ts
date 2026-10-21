/** SERVER ONLY — SoulTI deep mirror (soulti-deep-mirror) paid copy. */
import { getSoultiPersonalityBySlug } from '@/lib/soulti/personalities';
import {
  getCrossReadingsForCode,
  getRepairForCode,
  getSoulLetterForCode,
  type AxisCrossReading,
  type RepairPrescription,
  type SoulLetter,
} from '@/lib/soulti/deep-report';

export type SoultiDeepPayload = {
  crossReadings: AxisCrossReading[];
  repair: RepairPrescription | null;
  soulLetter: SoulLetter | null;
};

export function buildSoultiDeepPayload(slug: string): SoultiDeepPayload | null {
  const p = getSoultiPersonalityBySlug(slug);
  if (!p) return null;
  return {
    crossReadings: getCrossReadingsForCode(p.code),
    repair: getRepairForCode(p.code) ?? null,
    soulLetter: getSoulLetterForCode(p.code) ?? null,
  };
}
