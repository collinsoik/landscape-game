export interface LocalPlacement {
  id: string;
  elementType: string;
  x: number;
  y: number;
  width: number;
  height: number;
  round: number;
}

export interface RoundResult {
  round: number;
  stars: number;
  placements: LocalPlacement[];
}

export interface SubmissionPayload {
  playerName: string;
  placements: LocalPlacement[];
  stars: { round: number; stars: number }[];
}

export interface GalleryEntry {
  id: number;
  playerName: string;
  placements: LocalPlacement[];
  stars: { round: number; stars: number }[];
  submittedAt: string;
}
