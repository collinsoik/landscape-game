import type { Server } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents } from '../types/events';
import type { MidMissionEventConfig, Placement, ZoneConfig, MissionEventData } from '../types/models';
import type { MissionConfig } from '../config/scenarios';
import { getDb } from '../db/connection';
import { getElement } from '../scoring/ElementCatalog';
import { getPlacementsForTeam, getTeamsInSession } from './RoomManager';
import { reduceBudget, addBudget, getRemaining, getTotal } from './BudgetManager';
import { findWithinRadius, centroid } from '../scoring/NeighborDetector';
import { v4 as uuidv4 } from 'uuid';

type AppServer = Server<ClientToServerEvents, ServerToClientEvents>;

interface FiredEvent {
  eventType: string;
  firedAt: number;
}

/**
 * Manages mid-mission events for a single mission instance.
 * Created when a mission starts, destroyed when it ends.
 */
export class MissionEventManager {
  private sessionId: string;
  private round: number;
  private events: MidMissionEventConfig[];
  private missionDuration: number;
  private io: AppServer;
  private firedEvents: FiredEvent[] = [];
  private destroyed = false;

  constructor(
    io: AppServer,
    sessionId: string,
    round: number,
    missionConfig: MissionConfig
  ) {
    this.io = io;
    this.sessionId = sessionId;
    this.round = round;
    this.events = missionConfig.midMissionEvents ?? [];
    this.missionDuration = missionConfig.durationSeconds;
  }

  /**
   * Called every second by the round timer tick.
   * @param remaining - seconds remaining in the mission
   */
  onTick(remaining: number): void {
    if (this.destroyed) return;

    const elapsed = this.missionDuration - remaining;

    for (const event of this.events) {
      if (event.triggerType !== 'time') continue;
      if (event.triggerTime === undefined) continue;

      // Check if this event should fire at this elapsed time
      const alreadyFired = this.firedEvents.some(
        (f) => f.eventType === event.eventType && f.firedAt === event.triggerTime
      );
      if (alreadyFired) continue;

      if (elapsed >= event.triggerTime) {
        this.fireEvent(event);
        this.firedEvents.push({ eventType: event.eventType, firedAt: event.triggerTime });
      }
    }
  }

  /**
   * Called after score updates to check condition-based triggers.
   */
  onScoreUpdate(synergiesCount: number, budgetSpent: number, totalBudget: number): void {
    if (this.destroyed) return;

    for (const event of this.events) {
      if (event.triggerType !== 'condition') continue;
      if (!event.triggerCondition) continue;

      const alreadyFired = this.firedEvents.some(
        (f) => f.eventType === event.eventType
      );
      if (alreadyFired) continue;

      let shouldFire = false;
      switch (event.triggerCondition) {
        case 'first_synergy':
          shouldFire = synergiesCount >= 1;
          break;
        case 'half_budget_spent':
          shouldFire = totalBudget > 0 && budgetSpent >= totalBudget / 2;
          break;
      }

      if (shouldFire) {
        this.fireEvent(event);
        this.firedEvents.push({ eventType: event.eventType, firedAt: 0 });
      }
    }
  }

  destroy(): void {
    this.destroyed = true;
  }

  private fireEvent(event: MidMissionEventConfig): void {
    const teams = getTeamsInSession(this.sessionId);

    for (const team of teams) {
      const placements = getPlacementsForTeam(team.id, this.round);
      let eventData: MissionEventData;

      switch (event.eventType) {
        case 'drought':
          eventData = this.handleDrought(team.id, placements);
          break;
        case 'invasive_spawn':
          eventData = this.handleInvasiveSpawn(team.id, placements);
          break;
        case 'budget_cut':
          eventData = this.handleBudgetCut(team.id);
          break;
        case 'wind_storm':
          eventData = this.handleWindStorm(team.id, placements);
          break;
        case 'pollinator_boost':
          eventData = this.handlePollinatorBoost(team.id);
          break;
        default:
          continue;
      }

      this.io.to(`session:${this.sessionId}`).emit('mission:event', eventData);
    }
  }

  private handleDrought(teamId: string, placements: Placement[]): MissionEventData {
    const db = getDb();
    const affectedIds: string[] = [];

    // Find water features for proximity check
    const waterFeatures = placements.filter((p) => {
      const def = getElement(p.elementType);
      return def?.category === 'water_features';
    });

    for (const p of placements) {
      const def = getElement(p.elementType);
      if (!def || def.properties.waterRequirement !== 'high') continue;

      // Check if near a water feature (within 100px)
      const nearWater = waterFeatures.some((wf) => {
        const dx = (p.x + p.width / 2) - (wf.x + wf.width / 2);
        const dy = (p.y + p.height / 2) - (wf.y + wf.height / 2);
        return Math.sqrt(dx * dx + dy * dy) <= 100;
      });

      if (!nearWater) {
        // Remove this placement
        db.prepare('DELETE FROM placements WHERE id = ?').run(p.id);
        affectedIds.push(p.id);
        this.io.to(`session:${this.sessionId}`).emit('element:removed', { placementId: p.id });
      }
    }

    return {
      eventType: 'drought',
      title: 'DROUGHT!',
      message: affectedIds.length > 0
        ? `Water-hungry plants without nearby water sources have wilted! ${affectedIds.length} plant(s) lost.`
        : 'A drought strikes! Luckily, all your water-hungry plants are near water sources.',
      affectedPlacements: affectedIds,
      severity: 'danger',
    };
  }

  private handleInvasiveSpawn(teamId: string, placements: Placement[]): MissionEventData {
    const db = getDb();
    const affectedIds: string[] = [];

    if (placements.length === 0) {
      return {
        eventType: 'invasive_spawn',
        title: 'INVASIVE ALERT!',
        message: 'Invasive species appeared, but there was nothing to invade!',
        affectedPlacements: [],
        severity: 'warning',
      };
    }

    // Find highest-scoring cluster center
    const center = centroid(placements);

    // Spawn 1-2 invasives near the center
    const invasiveTypes = ['invasive_vine', 'invasive_grass'];
    const count = 1 + Math.floor(Math.random() * 2); // 1 or 2

    for (let i = 0; i < count; i++) {
      const invasiveType = invasiveTypes[Math.floor(Math.random() * invasiveTypes.length)];
      const elDef = getElement(invasiveType);
      if (!elDef) continue;

      const offsetX = (Math.random() - 0.5) * 150;
      const offsetY = (Math.random() - 0.5) * 150;
      const x = Math.max(0, Math.min(1100, center.x + offsetX));
      const y = Math.max(0, Math.min(700, center.y + offsetY));

      const placementId = uuidv4();
      db.prepare(`
        INSERT INTO placements (id, session_id, team_id, player_id, round, element_type, x, y, width, height, zone_index, is_pre_placed)
        VALUES (?, ?, ?, '__event__', ?, ?, ?, ?, ?, ?, 0, 1)
      `).run(placementId, this.sessionId, teamId, this.round, invasiveType, x, y, elDef.width, elDef.height);

      const placement: Placement = {
        id: placementId,
        sessionId: this.sessionId,
        teamId,
        playerId: '__event__',
        round: this.round,
        elementType: invasiveType,
        x, y,
        width: elDef.width,
        height: elDef.height,
        zoneIndex: 0,
        placedAt: new Date().toISOString(),
        isPrePlaced: true,
      };

      affectedIds.push(placementId);
      this.io.to(`session:${this.sessionId}`).emit('element:placed', { placement });
    }

    return {
      eventType: 'invasive_spawn',
      title: 'INVASIVE ALERT!',
      message: `${count} invasive species appeared near your best plants! Remove them before they spread!`,
      affectedPlacements: affectedIds,
      severity: 'danger',
    };
  }

  private handleBudgetCut(teamId: string): MissionEventData {
    reduceBudget(this.sessionId, teamId, this.round, 0.5);

    const remaining = getRemaining(this.sessionId, teamId, this.round);
    const total = getTotal(this.sessionId, teamId, this.round);
    if (remaining >= 0) {
      this.io.to(`team:${teamId}`).emit('budget:update', { teamId, remaining, total });
    }

    return {
      eventType: 'budget_cut',
      title: 'BUDGET CUT!',
      message: 'Your remaining budget has been halved! Make every coin count.',
      affectedPlacements: [],
      severity: 'warning',
    };
  }

  private handleWindStorm(teamId: string, placements: Placement[]): MissionEventData {
    const db = getDb();
    const affectedIds: string[] = [];

    const trees = placements.filter((p) => {
      const def = getElement(p.elementType);
      return def?.category === 'trees';
    });

    for (const tree of trees) {
      const dx = (Math.random() - 0.5) * 2 * 80; // -80 to +80
      const dy = (Math.random() - 0.5) * 2 * 60; // -60 to +60
      const newX = Math.max(0, Math.min(1100, tree.x + dx));
      const newY = Math.max(0, Math.min(700, tree.y + dy));

      db.prepare('UPDATE placements SET x = ?, y = ? WHERE id = ?').run(newX, newY, tree.id);
      affectedIds.push(tree.id);
      this.io.to(`session:${this.sessionId}`).emit('element:moved', {
        placementId: tree.id,
        x: newX,
        y: newY,
      });
    }

    return {
      eventType: 'wind_storm',
      title: 'WIND STORM!',
      message: trees.length > 0
        ? `Strong winds displaced ${trees.length} tree(s)! Check their new positions.`
        : 'A wind storm blew through, but there were no trees to move!',
      affectedPlacements: affectedIds,
      severity: 'warning',
    };
  }

  private handlePollinatorBoost(teamId: string): MissionEventData {
    addBudget(this.sessionId, teamId, this.round, 1);

    const remaining = getRemaining(this.sessionId, teamId, this.round);
    const total = getTotal(this.sessionId, teamId, this.round);
    if (remaining >= 0) {
      this.io.to(`team:${teamId}`).emit('budget:update', { teamId, remaining, total });
    }

    return {
      eventType: 'pollinator_boost',
      title: 'POLLINATOR BOOST!',
      message: 'Pollinators are thriving! You earned 1 bonus coin.',
      affectedPlacements: [],
      severity: 'info',
    };
  }
}
