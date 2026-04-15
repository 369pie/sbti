/**
 * CPTI Server-Side Module
 *
 * Public API for server-side CPTI operations.
 * Import from '@/lib/cpti/server' in API routes and server components.
 */

export {
  // Core functions
  calculateCptiResult,
  matchRelationship,
  buildPairs,
  normalizeCptiScore,
  scoreUser,
  computeMatchResult,

  // Lookup helpers
  getPersonality,
  getRelationship,
  getAllRelationshipSlugs,
  getAllPersonalitySlugs,
} from './scoring-service';

export type {
  // Core types
  Answer,
  ScoreableQuestion,
  CptiDimensionScore,
  CptiTestResult,
  DimensionPair,
  RelationshipResult,
  CptiPersonalityType,
  CptiRelationshipType,

  // Composite types
  UserAnswers,
  UserProfile,
  MatchResult,
} from './scoring-service';
