// Re-export shared types for frontend use
// This avoids deep imports into server/src/types/

export type {
  Session,
  Player,
  Team,
  ZoneRect,
  ZoneConfig,
  Placement,
  AutoScore,
  JudgeScore,
  Round,
  ElementDefinition,
  ElementCategory,
  ElementProperties,
  InteractionRule,
  EcosystemPattern,
  ScoreBreakdown,
  MissionType,
  MissionObjective,
  StarThresholds,
  MissionEventData,
  StarDetail,
  StarCondition,
  ObjectiveCondition,
  ScoreCategory,
} from '@/server/src/types/models';

export type {
  ClientToServerEvents,
  ServerToClientEvents,
  JoinResponse,
  RejoinResponse,
  RoomStateData,
  TeamWithPlayers,
  PlaceElementData,
  MoveElementData,
  RoundStartData,
  FinalScoreData,
} from '@/server/src/types/events';
