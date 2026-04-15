import type { CptiDimensionScore } from './scoring';

export type CptiClaimSource = 'self_test' | 'pair_flow' | 'stealth';

export interface ClaimResultPayload {
  personalitySlug: string;
  dimensionScores: CptiDimensionScore[];
  source: CptiClaimSource;
  clientMutationId?: string;
}

export interface ClaimRelationshipPayload {
  relationshipId: string;
  currentPersonalitySlug?: string;
  currentDimensionScores?: CptiDimensionScore[];
  currentSource?: CptiClaimSource;
  clientMutationId?: string;
}

export type CptiClaimRequest =
  | {
      type: 'result';
      data: ClaimResultPayload;
    }
  | {
      type: 'relationship';
      data: ClaimRelationshipPayload;
    };
