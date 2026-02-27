// In-memory action limit tracking per team per round

interface ActionState {
  limit: number; // 0 = unlimited
  used: number;
}

// Key: `${sessionId}:${teamId}:${round}`
const actions = new Map<string, ActionState>();

function key(sessionId: string, teamId: string, round: number): string {
  return `${sessionId}:${teamId}:${round}`;
}

export function initActions(sessionId: string, teamId: string, round: number, limit: number): void {
  actions.set(key(sessionId, teamId, round), { limit, used: 0 });
}

export function useAction(sessionId: string, teamId: string, round: number): boolean {
  const k = key(sessionId, teamId, round);
  const state = actions.get(k);
  if (!state) return true; // No tracking = unlimited
  if (state.limit === 0) return true; // 0 = unlimited
  if (state.used >= state.limit) return false;
  state.used++;
  return true;
}

export function getActionsRemaining(sessionId: string, teamId: string, round: number): number {
  const k = key(sessionId, teamId, round);
  const state = actions.get(k);
  if (!state) return -1; // -1 = unlimited
  if (state.limit === 0) return -1;
  return state.limit - state.used;
}

export function getActionLimit(sessionId: string, teamId: string, round: number): number {
  const k = key(sessionId, teamId, round);
  const state = actions.get(k);
  if (!state) return -1;
  if (state.limit === 0) return -1;
  return state.limit;
}

export function clearSessionActions(sessionId: string): void {
  for (const k of actions.keys()) {
    if (k.startsWith(`${sessionId}:`)) {
      actions.delete(k);
    }
  }
}
