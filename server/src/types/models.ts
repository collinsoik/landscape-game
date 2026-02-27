export interface Room {
  id: number;
  room_code: string;
  name: string;
  status: 'open' | 'closed';
  created_at: string;
}

export interface Submission {
  id: number;
  room_code: string;
  player_name: string;
  placements_json: string;
  stars_json: string;
  submitted_at: string;
}

export interface Vote {
  id: number;
  room_code: string;
  voter_name: string;
  most_beautiful_id: number | null;
  most_eco_friendly_id: number | null;
  most_creative_id: number | null;
  voted_at: string;
}
