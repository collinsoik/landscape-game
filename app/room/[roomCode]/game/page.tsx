'use client';

import { useEffect, useCallback, use, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useGameStore } from '@/store';
import CanvasArea from '@/components/game/CanvasArea';
import ElementSidebar from '@/components/sidebar/ElementSidebar';
import GoalBanner from '@/components/game/GoalBanner';
import LiveScorePanel from '@/components/game/LiveScorePanel';
import RoundTransition from '@/components/game/RoundTransition';
import MissionBriefing from '@/components/game/MissionBriefing';
import MissionDebrief from '@/components/game/MissionDebrief';
import MissionEventOverlay from '@/components/game/MissionEventOverlay';
import TutorialOverlay, {
  hasTutorialBeenSeen,
  markTutorialSeen,
} from '@/components/game/tutorial/TutorialOverlay';

interface GamePageProps {
  params: Promise<{ roomCode: string }>;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function GamePage({ params }: GamePageProps) {
  const { roomCode } = use(params);
  const router = useRouter();
  const { connect, emit } = useWebSocket();

  const status = useGameStore((s) => s.room.status);
  const currentRound = useGameStore((s) => s.room.currentRound);
  const totalRounds = useGameStore((s) => s.room.totalRounds);
  const timeRemaining = useGameStore((s) => s.room.roundTimeRemaining);
  const paused = useGameStore((s) => s.room.paused);
  const roundDuration = useGameStore((s) => s.room.roundDuration);
  const areaLabel = useGameStore((s) => s.room.areaLabel);
  const canvasWidth = useGameStore((s) => s.room.canvasWidth);
  const canvasHeight = useGameStore((s) => s.room.canvasHeight);
  const satelliteImagePath = useGameStore((s) => s.room.satelliteImagePath);
  const teams = useGameStore((s) => s.teams);
  const playerId = useGameStore((s) => s.playerId);
  const error = useGameStore((s) => s.error);
  const placements = useGameStore((s) => s.placements);
  const selectedElementType = useGameStore((s) => s.selectedElementType);
  const selectElement = useGameStore((s) => s.selectElement);
  const zoneConfig = useGameStore((s) => s.zoneConfig);
  const myZoneIndex = useGameStore((s) => s.myZoneIndex);
  const connected = useGameStore((s) => s.connected);
  const budget = useGameStore((s) => s.room.budget);
  const actions = useGameStore((s) => s.room.actions);
  const refundRate = useGameStore((s) => s.room.refundRate);
  const availableCategories = useGameStore((s) => s.room.availableCategories);
  const goals = useGameStore((s) => s.room.goals);
  const scores = useGameStore((s) => s.scores);

  // Mission state
  const missionType = useGameStore((s) => s.room.missionType);
  const missionTitle = useGameStore((s) => s.room.missionTitle);
  const missionNarrative = useGameStore((s) => s.room.missionNarrative);
  const missionEcoLesson = useGameStore((s) => s.room.missionEcoLesson);
  const objectives = useGameStore((s) => s.room.objectives);
  const starThresholds = useGameStore((s) => s.room.starThresholds);
  const missionStars = useGameStore((s) => s.room.missionStars);
  const starDetails = useGameStore((s) => s.room.starDetails);
  const objectivesCompleted = useGameStore((s) => s.room.objectivesCompleted);
  const activeMissionEvent = useGameStore((s) => s.room.activeMissionEvent);
  const totalMissions = useGameStore((s) => s.room.totalMissions);
  const isBehind = useGameStore((s) => s.room.isBehind);
  const retrying = useGameStore((s) => s.room.retrying);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPlacementId, setSelectedPlacementId] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [helpSeen, setHelpSeen] = useState(true);
  const [showRoundTransition, setShowRoundTransition] = useState(false);
  const [showMissionBriefing, setShowMissionBriefing] = useState(false);
  const [showMissionDebrief, setShowMissionDebrief] = useState(false);
  const prevRoundRef = useRef(0);
  const prevCategoriesRef = useRef<string[] | null>(null);

  const isMission = !!missionType;
  const isWaitingForTeacher = paused && roundDuration !== null && timeRemaining === roundDuration;

  // Show tutorial on first visit (after mount to avoid SSR mismatch)
  useEffect(() => {
    const seen = hasTutorialBeenSeen();
    setHelpSeen(seen);
    if (!seen) {
      setShowTutorial(true);
    }
  }, []);

  // Auto-open tutorial when in "waiting for teacher" state
  useEffect(() => {
    if (isWaitingForTeacher) {
      setShowTutorial(true);
    }
  }, [isWaitingForTeacher]);

  const handleCloseTutorial = useCallback(() => {
    setShowTutorial(false);
    setHelpSeen(true);
    markTutorialSeen();
  }, []);

  const handleDismissTransition = useCallback(() => {
    setShowRoundTransition(false);
  }, []);

  // Show mission briefing or round transition when round changes
  useEffect(() => {
    if (currentRound > 0 && currentRound !== prevRoundRef.current) {
      if (isMission) {
        setShowMissionBriefing(true);
        setShowMissionDebrief(false);
      } else if (currentRound > 1) {
        setShowRoundTransition(true);
      }
    }
    prevRoundRef.current = currentRound;
  }, [currentRound, isMission]);

  // Show mission debrief when round ends (judging state) with mission data
  useEffect(() => {
    if (status === 'judging' && isMission && missionStars !== null) {
      setShowMissionDebrief(true);
    }
  }, [status, isMission, missionStars]);

  // Track previous categories for unlock detection
  useEffect(() => {
    if (availableCategories) {
      prevCategoriesRef.current = availableCategories;
    }
  }, [availableCategories]);

  // Find my team
  const myTeam = teams.find((t) =>
    t.players.some((p) => p.id === playerId)
  );

  // Get my team's current scores
  const myTeamScores = myTeam ? scores[myTeam.team.id] : null;

  // Compute zone data from store
  const zones = zoneConfig?.zones ?? [];
  const playerZone = myZoneIndex != null ? zones[myZoneIndex] ?? null : null;
  const teamColor = myTeam?.team.color ?? '#888888';

  useEffect(() => {
    connect();
  }, [connect]);

  // Rejoin room after socket (re)connects.
  useEffect(() => {
    if (!connected || !playerId) return;

    emit('room:rejoin', { roomCode, playerId }, (res) => {
      if (res.success && res.state) {
        const store = useGameStore.getState();
        store.setRoomState({
          sessionName: res.state.session.name,
          status: res.state.session.status,
          currentRound: res.state.session.currentRound,
          totalRounds: res.state.session.totalRounds,
          canvasWidth: res.state.session.canvasWidth,
          canvasHeight: res.state.session.canvasHeight,
          satelliteImagePath: res.state.session.satelliteImagePath,
          roundTimeRemaining: res.state.roundTimeRemaining ?? null,
          paused: res.state.paused ?? false,
          scenarioId: res.state.session.scenarioId ?? null,
          budget: res.state.budget ?? null,
          actions: res.state.actions ?? null,
          refundRate: res.state.refundRate ?? null,
          availableCategories: res.state.availableCategories ?? null,
          goals: res.state.goals ?? null,
        });
        store.setPlayers(res.state.players);
        store.setTeams(res.state.teams);
        store.setPlacements(res.state.placements);

        // Find my zone config
        for (const tw of res.state.teams) {
          const myPlayer = tw.players.find((p) => p.id === playerId);
          if (myPlayer) {
            store.setZoneConfig(tw.zoneConfig);
            store.setMyZoneIndex(myPlayer.zoneIndex);
            break;
          }
        }
      }
    });
  }, [connected, playerId, roomCode, emit]);

  useEffect(() => {
    if (status === 'finished') {
      router.push(`/room/${roomCode}/results`);
    }
  }, [status, roomCode, router]);

  // Action limit check (needs to be before handlers that reference it)
  const hasActions = actions !== null && actions.limit > 0;
  const outOfActions = hasActions && actions.remaining === 0;

  // Socket emitter handlers – blocked while timer is paused or out of actions
  const handlePlaceElement = useCallback((elementType: string, x: number, y: number) => {
    if (paused || outOfActions) return;
    emit('element:place', { elementType, x, y });
  }, [emit, paused, outOfActions]);

  const handleMovePlacement = useCallback((placementId: string, x: number, y: number) => {
    if (paused || outOfActions) return;
    emit('element:move', { placementId, x, y });
  }, [emit, paused, outOfActions]);

  const handleRemovePlacement = useCallback((placementId: string) => {
    if (paused || outOfActions) return;
    emit('element:remove', { placementId });
    setSelectedPlacementId(null);
  }, [emit, paused, outOfActions]);

  const handleSelectPlacement = useCallback((id: string | null) => {
    setSelectedPlacementId(id);
    if (id) selectElement(null);
  }, [selectElement]);

  const handleClearSelection = useCallback(() => {
    setSelectedPlacementId(null);
    selectElement(null);
  }, [selectElement]);

  const handleSelectElement = useCallback((type: string) => {
    selectElement(type);
    setSelectedPlacementId(null);
  }, [selectElement]);

  // Delete key removes selected placement
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedPlacementId) {
        e.preventDefault();
        handleRemovePlacement(selectedPlacementId);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedPlacementId, handleRemovePlacement]);

  // Budget display helpers
  const hasBudget = budget !== null && budget.total > 0;
  const budgetPercent = hasBudget ? budget.remaining / budget.total : 1;
  const budgetColor = budgetPercent > 0.5 ? '#2ecc71' : budgetPercent > 0 ? '#f39c12' : '#e74c3c';

  // Action display helpers
  const actionsPercent = hasActions ? actions!.remaining / actions!.limit : 1;
  const actionsColor = actionsPercent > 0.5 ? '#3498db' : actionsPercent > 0 ? '#f39c12' : '#e74c3c';

  // Timer urgency
  const isTimerUrgent = timeRemaining !== null && timeRemaining <= 15 && timeRemaining > 0;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Top HUD bar */}
      <div
        className="flex items-center justify-between px-4 py-2 flex-shrink-0"
        style={{
          background: '#0d1f0d',
          boxShadow: '0 2px 0 #1a3a1a, 0 3px 0 rgba(0,0,0,0.3)',
        }}
      >
        <div className="flex items-center gap-2 md:gap-4">
          {/* Mission type badge */}
          {missionType && (
            <span
              className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
              style={{
                color: getMissionTypeColor(missionType),
                background: `${getMissionTypeColor(missionType)}20`,
                border: `1px solid ${getMissionTypeColor(missionType)}40`,
              }}
            >
              {missionType}
            </span>
          )}
          <span className="text-xs font-bold uppercase tracking-wider text-[#8bba6a]">
            {missionTitle
              ? `Mission ${currentRound}/${totalMissions || totalRounds}`
              : `Round ${currentRound}/${totalRounds}`}
          </span>
          {!missionTitle && areaLabel && (
            <span className="text-xs text-[#6a9a4a] hidden sm:inline">{areaLabel}</span>
          )}
          {hasBudget && (
            <span
              className="text-sm font-bold font-mono px-3 py-1 flex items-center gap-1.5 rounded"
              style={{
                color: budgetColor,
                background: `${budgetColor}20`,
                border: `1px solid ${budgetColor}40`,
              }}
            >
              <span style={{ fontSize: '16px', lineHeight: 1, color: '#f39c12' }}>&#9679;</span>
              <span className="text-base">{budget.remaining}</span>
              <span className="text-[10px] opacity-60">/ {budget.total}</span>
            </span>
          )}
          {hasActions && (
            <span
              className="text-sm font-bold font-mono px-3 py-1 flex items-center gap-1.5 rounded"
              style={{
                color: actionsColor,
                background: `${actionsColor}20`,
                border: `1px solid ${actionsColor}40`,
              }}
            >
              <span style={{ fontSize: '14px', lineHeight: 1 }}>&#9889;</span>
              <span className="text-base">{actions.remaining}</span>
              <span className="text-[10px] opacity-60">/ {actions.limit} acts</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          {paused && (
            <span className="text-xs font-bold uppercase text-[#f39c12] animate-pulse">
              {roundDuration !== null && timeRemaining === roundDuration
                ? 'EXPLORE THE TUTORIAL! TIMER STARTS WHEN YOUR TEACHER IS READY'
                : 'Paused'}
            </span>
          )}
          {timeRemaining !== null && (
            <span
              className={[
                'font-mono text-lg font-bold',
                isTimerUrgent
                  ? 'text-[#c0392b] animate-pulse'
                  : timeRemaining <= 60
                    ? 'text-[#f39c12]'
                    : 'text-[#8bba6a]',
              ].join(' ')}
            >
              {formatTime(timeRemaining)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {myTeam && (
            <span
              className="text-xs font-bold uppercase px-2 py-1"
              style={{
                color: myTeam.team.color,
                background: `${myTeam.team.color}22`,
                boxShadow: `inset 1px 1px 0 ${myTeam.team.color}33`,
              }}
            >
              {myTeam.team.name}
            </span>
          )}
          <span className="text-xs text-[#4a6a3a] font-mono hidden sm:inline">{roomCode}</span>
          <button
            onClick={() => setShowTutorial(true)}
            className={[
              'flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer transition-all',
              helpSeen
                ? 'bg-[#2d5a27] text-[#8bba6a] hover:bg-[#3a7a34] hover:text-[#d4e8c2]'
                : 'bg-[#3a7a34] text-[#d4e8c2] animate-pulse',
            ].join(' ')}
            style={{
              boxShadow: helpSeen
                ? 'inset -1px -1px 0 rgba(0,0,0,0.3), inset 1px 1px 0 rgba(255,255,255,0.1)'
                : '0 0 8px rgba(139, 186, 106, 0.5), inset -1px -1px 0 rgba(0,0,0,0.3), inset 1px 1px 0 rgba(255,255,255,0.15)',
            }}
            title="Open tutorial"
            aria-label="Open tutorial"
          >
            <span>?</span>
            <span>Tutorial</span>
          </button>
        </div>
      </div>

      {/* Goal banner / Objective tracker */}
      {(goals && goals.length > 0) || (objectives && objectives.length > 0) ? (
        <GoalBanner
          goals={goals ?? []}
          currentScores={myTeamScores?.total ?? null}
          objectives={objectives}
          objectivesCompleted={objectivesCompleted}
          missionType={missionType}
        />
      ) : null}

      {isBehind && (
        <div className="px-4 py-1.5 text-xs font-bold text-center animate-pulse"
          style={{ background: '#2a0f0f', borderBottom: '1px solid #c0392b', color: '#e74c3c' }}
        >
          Your team is behind the class &mdash; complete this mission to catch up!
        </div>
      )}

      {error && (
        <div className="bg-[#2a0f0f] border-b border-[#c0392b] px-4 py-1 text-xs text-[#c0392b]">
          {error}
        </div>
      )}

      {/* Main game area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile sidebar toggle */}
        <button
          className="md:hidden fixed bottom-4 right-4 z-50 bg-[#1a3a1a] text-[#8bba6a] p-3 rounded-full shadow-lg cursor-pointer"
          onClick={() => setSidebarOpen((o) => !o)}
          aria-label={sidebarOpen ? 'Close element palette' : 'Open element palette'}
        >
          {sidebarOpen ? '\u2716' : '\u2630'}
        </button>

        {/* Mobile overlay backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar - collapsible on mobile, fixed on desktop */}
        <div
          className={[
            'flex-shrink-0 overflow-y-auto transition-transform duration-200',
            'fixed inset-y-0 left-0 z-40 w-[280px]',
            'md:relative md:translate-x-0 md:w-[280px]',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          ].join(' ')}
          style={{
            background: '#0d1f0d',
            boxShadow: 'inset -2px 0 0 #1a3a1a',
          }}
        >
          <ElementSidebar
            selectedElementType={selectedElementType}
            onSelectElement={handleSelectElement}
            disabled={paused || outOfActions}
            availableCategories={availableCategories}
            budgetRemaining={budget?.remaining ?? -1}
          />
        </div>

        {/* Canvas area */}
        <CanvasArea
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          satelliteImagePath={satelliteImagePath}
          zones={zones}
          teamColor={teamColor}
          currentZoneIndex={myZoneIndex}
          playerZone={playerZone}
          currentPlayerId={playerId ?? ''}
          placements={placements}
          selectedElementType={selectedElementType}
          selectedPlacementId={selectedPlacementId}
          onSelectPlacement={handleSelectPlacement}
          onMovePlacement={handleMovePlacement}
          onPlaceElement={handlePlaceElement}
          onClearSelection={handleClearSelection}
        />

        {/* Live score panel */}
        <LiveScorePanel scores={myTeamScores ?? null} placements={placements} />
      </div>

      {/* Mission Event Overlay */}
      <MissionEventOverlay event={activeMissionEvent} />

      {/* Mission Briefing */}
      {showMissionBriefing && missionType && missionTitle && missionNarrative && starThresholds && (
        <MissionBriefing
          show={showMissionBriefing}
          missionType={missionType}
          missionTitle={missionTitle}
          missionNarrative={missionNarrative}
          objectives={objectives}
          starThresholds={starThresholds}
          budget={budget?.total}
          actionLimit={actions?.limit}
          duration={roundDuration ?? 90}
          availableCategories={availableCategories ?? undefined}
          round={currentRound}
          totalMissions={totalMissions || totalRounds}
          retrying={retrying}
          onReady={() => setShowMissionBriefing(false)}
        />
      )}

      {/* Mission Debrief */}
      {showMissionDebrief && missionTitle && (
        <MissionDebrief
          show={showMissionDebrief}
          missionTitle={missionTitle}
          scores={myTeamScores ?? null}
          objectives={objectives}
          objectivesCompleted={objectivesCompleted}
          stars={missionStars ?? 0}
          starDetails={starDetails}
          ecoLesson={missionEcoLesson}
          round={currentRound}
          totalMissions={totalMissions || totalRounds}
          onNext={() => setShowMissionDebrief(false)}
        />
      )}

      {/* Round transition interstitial (legacy, for non-mission rounds) */}
      {!isMission && (
        <RoundTransition
          show={showRoundTransition}
          round={currentRound}
          totalRounds={totalRounds}
          scores={myTeamScores ?? null}
          budget={budget?.total}
          actionLimit={actions?.limit}
          refundRate={refundRate ?? undefined}
          goals={goals ?? undefined}
          newCategories={availableCategories ?? undefined}
          previousCategories={prevCategoriesRef.current ?? undefined}
          onDismiss={handleDismissTransition}
        />
      )}

      {/* Tutorial overlay */}
      <TutorialOverlay open={showTutorial} onClose={handleCloseTutorial} compact={isWaitingForTeacher} />
    </div>
  );
}

function getMissionTypeColor(type: string): string {
  switch (type) {
    case 'build': return '#2ecc71';
    case 'fix': return '#f39c12';
    case 'survive': return '#e74c3c';
    case 'discover': return '#3498db';
    case 'race': return '#9b59b6';
    case 'restore': return '#1abc9c';
    default: return '#8bba6a';
  }
}
