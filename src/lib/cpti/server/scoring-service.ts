/**
 * CPTI Server-Side Scoring Service
 *
 * Wraps the pure scoring/matching logic for use in API routes.
 * All computation happens server-side — no browser dependencies.
 */

import {
  calculateCptiResult,
  normalizeCptiScore,
  type Answer,
  type ScoreableQuestion,
  type CptiDimensionScore,
  type CptiTestResult,
} from '../scoring';

import {
  matchRelationship,
  buildPairs,
  type DimensionPair,
  type RelationshipResult,
} from '../relationship-matching';

import {
  getCptiPersonalityBySlug,
  getAllCptiSlugs,
  type CptiPersonalityType,
} from '../personalities';

import { CPTI_QUESTIONS } from '../questions';
import { CPTI_RELATIONSHIP_TYPES, type CptiRelationshipType } from '../relationships';

// ─── Re-exports ────────────────────────────────────────────────────────────

export { calculateCptiResult, matchRelationship, buildPairs, normalizeCptiScore };
export type {
  Answer,
  ScoreableQuestion,
  CptiDimensionScore,
  CptiTestResult,
  DimensionPair,
  RelationshipResult,
  CptiPersonalityType,
  CptiRelationshipType,
};

// ─── Types ─────────────────────────────────────────────────────────────────

export interface UserAnswers {
  answers: Record<number, Answer>;
}

export interface UserProfile {
  personality: CptiPersonalityType;
  dimensions: CptiDimensionScore[];
}

export interface MatchResult {
  initiatorProfile: UserProfile;
  participantProfile: UserProfile;
  relationship: CptiRelationshipType;
  compatibility: number;
  pairs: DimensionPair[];
}

export interface SnapshotProfileInput {
  personalitySlug: string;
  dimensionScores: CptiDimensionScore[];
}

// ─── Service Functions ─────────────────────────────────────────────────────

/**
 * Score a single user's answers into a CPTI profile.
 */
export function scoreUser(rawAnswers: Record<number, Answer>): UserProfile {
  const answersMap = new Map<number, Answer>();
  for (const [id, value] of Object.entries(rawAnswers)) {
    answersMap.set(Number(id), value);
  }

  const result = calculateCptiResult(answersMap, CPTI_QUESTIONS);

  return {
    personality: result.personality,
    dimensions: result.dimensions,
  };
}

/**
 * Compute a full match result between two users.
 * This is the main server-side function that replaces frontend-only matching.
 */
export function computeMatchResult(
  initiatorAnswers: Record<number, Answer>,
  participantAnswers: Record<number, Answer>,
): MatchResult {
  const initiatorProfile = scoreUser(initiatorAnswers);
  const participantProfile = scoreUser(participantAnswers);

  return computeMatchFromProfiles(initiatorProfile, participantProfile);
}

export function profileFromSnapshot(snapshot: SnapshotProfileInput): UserProfile | null {
  const personality = getCptiPersonalityBySlug(snapshot.personalitySlug);
  if (!personality) {
    return null;
  }

  return {
    personality,
    dimensions: snapshot.dimensionScores,
  };
}

export function computeMatchFromProfiles(
  initiatorProfile: UserProfile,
  participantProfile: UserProfile,
): MatchResult {

  const relationshipResult = matchRelationship(
    initiatorProfile.dimensions,
    participantProfile.dimensions,
  );

  return {
    initiatorProfile,
    participantProfile,
    relationship: relationshipResult.relationship,
    compatibility: relationshipResult.compatibility,
    pairs: relationshipResult.pairs,
  };
}

/**
 * Look up a personality type by slug.
 */
export function getPersonality(slug: string): CptiPersonalityType | undefined {
  return getCptiPersonalityBySlug(slug);
}

/**
 * Look up a relationship type by slug.
 */
export function getRelationship(slug: string): CptiRelationshipType | undefined {
  return CPTI_RELATIONSHIP_TYPES.find(r => r.slug === slug);
}

/**
 * Get all available relationship slugs.
 */
export function getAllRelationshipSlugs(): string[] {
  return CPTI_RELATIONSHIP_TYPES.map(r => r.slug);
}

/**
 * Get all available personality slugs.
 */
export function getAllPersonalitySlugs(): string[] {
  return getAllCptiSlugs();
}
