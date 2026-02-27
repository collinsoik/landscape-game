// Re-export socket event types for frontend use
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

export type {
  Session,
  Player,
  Team,
  Placement,
  ZoneConfig,
  ZoneRect,
  ScoreBreakdown,
  ElementDefinition,
  ElementCategory,
  MissionType,
  MissionObjective,
  StarThresholds,
  MissionEventData,
  StarDetail,
  MidMissionEventConfig,
  StarCondition,
  ObjectiveCondition,
} from '@/server/src/types/models';
