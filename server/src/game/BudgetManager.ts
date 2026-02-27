// In-memory budget tracking per team per round

interface BudgetState {
  total: number;
  spent: number;
  refundRate: number; // 0.0 to 1.0
}

// Key: `${sessionId}:${teamId}:${round}`
const budgets = new Map<string, BudgetState>();

function key(sessionId: string, teamId: string, round: number): string {
  return `${sessionId}:${teamId}:${round}`;
}

export function initBudget(sessionId: string, teamId: string, round: number, total: number, refundRate: number = 1.0): void {
  budgets.set(key(sessionId, teamId, round), { total, spent: 0, refundRate });
}

export function spendBudget(sessionId: string, teamId: string, round: number, cost: number): boolean {
  const k = key(sessionId, teamId, round);
  const state = budgets.get(k);
  if (!state) return true; // No budget tracking = unlimited (Free Play / backward compat)
  if (state.total === 0) return true; // 0 = unlimited budget
  if (state.spent + cost > state.total) return false;
  state.spent += cost;
  return true;
}

export function refundBudget(sessionId: string, teamId: string, round: number, cost: number): number {
  const k = key(sessionId, teamId, round);
  const state = budgets.get(k);
  if (!state) return 0;
  const refund = Math.round(cost * state.refundRate);
  state.spent = Math.max(0, state.spent - refund);
  return refund;
}

export function getRemaining(sessionId: string, teamId: string, round: number): number {
  const k = key(sessionId, teamId, round);
  const state = budgets.get(k);
  if (!state) return -1; // -1 = no budget (unlimited)
  if (state.total === 0) return -1;
  return state.total - state.spent;
}

export function getTotal(sessionId: string, teamId: string, round: number): number {
  const k = key(sessionId, teamId, round);
  const state = budgets.get(k);
  if (!state) return -1;
  return state.total;
}

export function reduceBudget(sessionId: string, teamId: string, round: number, factor: number): void {
  const k = key(sessionId, teamId, round);
  const state = budgets.get(k);
  if (!state || state.total === 0) return;
  const remaining = state.total - state.spent;
  const reduction = Math.floor(remaining * (1 - factor));
  state.spent += reduction;
}

export function addBudget(sessionId: string, teamId: string, round: number, amount: number): void {
  const k = key(sessionId, teamId, round);
  const state = budgets.get(k);
  if (!state) return;
  // Reduce spent to effectively add budget
  state.spent = Math.max(0, state.spent - amount);
}

export function clearSessionBudgets(sessionId: string): void {
  for (const k of budgets.keys()) {
    if (k.startsWith(`${sessionId}:`)) {
      budgets.delete(k);
    }
  }
}
