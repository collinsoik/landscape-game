'use client';

import { useState } from 'react';
import PixelButton from '@/components/shared/PixelButton';
import PixelCard from '@/components/shared/PixelCard';
import PixelInput from '@/components/shared/PixelInput';
import { GAME_DEFAULTS } from '@/config/game-defaults';
import { SCENARIOS, CAMPAIGNS } from '@/config/scenarios';
import type { Scenario, CampaignInfo } from '@/config/scenarios';

interface CreateRoomResponse {
  roomCode: string;
  adminToken: string;
  judgeToken: string;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: '#2ecc71',
  intermediate: '#f39c12',
  advanced: '#e74c3c',
};

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'Great for first-timers',
  intermediate: 'Some experience helps',
  advanced: 'For experienced players',
};

// Illustrative banner configs for each scenario
const SCENARIO_BANNERS: Record<string, { gradient: string; icon: string; features: string[] }> = {
  neighborhood_park: {
    gradient: 'from-[#2d5a27] to-[#1a4a1a]',
    icon: '🌳',
    features: ['Progressive difficulty', 'Learn basics step-by-step', 'Flowers → Trees → Full landscape'],
  },
  invasive_takeover: {
    gradient: 'from-[#5a3a27] to-[#3a2a1a]',
    icon: '🌿',
    features: ['Remove invasive species', 'Restore ecosystems', 'Defend & rebuild'],
  },
  budget_crunch: {
    gradient: 'from-[#5a5027] to-[#3a3a1a]',
    icon: '💰',
    features: ['Tight budget constraints', 'Every coin counts', 'Optimize your design'],
  },
  restore_wetland: {
    gradient: 'from-[#274a5a] to-[#1a3a4a]',
    icon: '💧',
    features: ['Start from a pond', 'Build a wetland ecosystem', 'Achieve ecosystem patterns'],
  },
  free_play: {
    gradient: 'from-[#3a275a] to-[#2a1a4a]',
    icon: '🎨',
    features: ['No budget limits', 'All elements unlocked', 'Creative sandbox mode'],
  },
};

const CAMPAIGN_BANNERS: Record<string, { gradient: string; icon: string; features: string[] }> = {
  greenfield_park: {
    gradient: 'from-[#1a5a3a] to-[#0d3a2a]',
    icon: '🏞️',
    features: ['12 puzzle missions', 'Star ratings & objectives', 'Mid-mission events'],
  },
  invasive_takeover_campaign: {
    gradient: 'from-[#5a2a1a] to-[#3a1a0d]',
    icon: '🪖',
    features: ['6 intense missions', 'Remove & defend', 'Survive invasive waves'],
  },
};

const CUSTOM_BANNER = {
  gradient: 'from-[#3a3a3a] to-[#2a2a2a]',
  icon: '⚙️',
  features: ['Set your own rounds', 'Choose duration', 'Full control'],
};

export default function AdminCreatePage() {
  const [step, setStep] = useState<'select' | 'configure'>('select');
  const [sessionName, setSessionName] = useState('');
  const [totalRounds, setTotalRounds] = useState(GAME_DEFAULTS.round.defaultCount);
  const [roundDuration, setRoundDuration] = useState(GAME_DEFAULTS.round.defaultDuration);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignInfo | null>(null);
  const [isCustom, setIsCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<CreateRoomResponse | null>(null);
  const [showAdminToken, setShowAdminToken] = useState(false);
  const [showJudgeToken, setShowJudgeToken] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // Fallback: do nothing, the text is still visible
    }
  };

  const handleSelectScenario = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setSelectedCampaign(null);
    setIsCustom(false);
    setTotalRounds(scenario.totalRounds);
    setStep('configure');
  };

  const handleSelectCampaign = (campaign: CampaignInfo) => {
    setSelectedCampaign(campaign);
    setSelectedScenario(null);
    setIsCustom(false);
    setTotalRounds(campaign.totalMissions);
    setStep('configure');
  };

  const handleSelectCustom = () => {
    setSelectedScenario(null);
    setSelectedCampaign(null);
    setIsCustom(true);
    setTotalRounds(GAME_DEFAULTS.round.defaultCount);
    setStep('configure');
  };

  const handleBack = () => {
    setStep('select');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: sessionName.trim() || 'Landscape Game',
          totalRounds: selectedCampaign ? selectedCampaign.totalMissions : totalRounds,
          roundDuration,
          scenarioId: selectedCampaign?.id || selectedScenario?.id || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to create room');
      }

      const data = await res.json();
      const roomCode = data.session?.roomCode ?? data.roomCode;
      setResult({
        roomCode,
        adminToken: data.adminToken,
        judgeToken: data.judgeToken,
      });

      // Store admin token for later use
      sessionStorage.setItem(`admin_${roomCode}`, data.adminToken);
      sessionStorage.setItem(`judge_${roomCode}`, data.judgeToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // ─── Result Screen ───
  if (result) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 md:p-10">
        <PixelCard title="Room Created!" glow className="w-full max-w-lg">
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-sm text-[#6a9a4a] uppercase font-bold tracking-wide">Room Code</p>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-4xl font-bold font-mono text-[#8bba6a] tracking-widest">
                  {result.roomCode}
                </p>
                <button
                  onClick={() => copyToClipboard(result.roomCode, 'room')}
                  className="text-[#6a9a4a] hover:text-[#8bba6a] text-sm cursor-pointer px-2 py-1 bg-[#0d1f0d] rounded"
                >
                  {copiedField === 'room' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-sm text-[#6a9a4a] mt-2">
                Share this code with your students so they can join.
              </p>
            </div>

            <div>
              <p className="text-sm text-[#6a9a4a] uppercase font-bold tracking-wide">Admin Token</p>
              <div className="flex items-center gap-2 bg-[#0d1f0d] px-3 py-2 mt-1 rounded">
                <p className="text-sm font-mono text-[#d4e8c2] break-all flex-1">
                  {showAdminToken ? result.adminToken : '\u2022'.repeat(20)}
                </p>
                <button
                  onClick={() => setShowAdminToken((v) => !v)}
                  className="text-[#6a9a4a] hover:text-[#8bba6a] text-sm flex-shrink-0 cursor-pointer"
                >
                  {showAdminToken ? 'Hide' : 'Show'}
                </button>
                <button
                  onClick={() => copyToClipboard(result.adminToken, 'admin')}
                  className="text-[#6a9a4a] hover:text-[#8bba6a] text-sm flex-shrink-0 cursor-pointer"
                >
                  {copiedField === 'admin' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div>
              <p className="text-sm text-[#6a9a4a] uppercase font-bold tracking-wide">Judge Token</p>
              <div className="flex items-center gap-2 bg-[#0d1f0d] px-3 py-2 mt-1 rounded">
                <p className="text-sm font-mono text-[#d4e8c2] break-all flex-1">
                  {showJudgeToken ? result.judgeToken : '\u2022'.repeat(20)}
                </p>
                <button
                  onClick={() => setShowJudgeToken((v) => !v)}
                  className="text-[#6a9a4a] hover:text-[#8bba6a] text-sm flex-shrink-0 cursor-pointer"
                >
                  {showJudgeToken ? 'Hide' : 'Show'}
                </button>
                <button
                  onClick={() => copyToClipboard(result.judgeToken, 'judge')}
                  className="text-[#6a9a4a] hover:text-[#8bba6a] text-sm flex-shrink-0 cursor-pointer"
                >
                  {copiedField === 'judge' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {(selectedScenario || selectedCampaign) && (
              <div className="text-base text-[#6a9a4a]">
                {selectedCampaign ? 'Campaign' : 'Scenario'}:{' '}
                <span className="text-[#8bba6a] font-bold">
                  {selectedCampaign?.name || selectedScenario?.name}
                </span>
              </div>
            )}

            <div className="flex flex-col gap-3 mt-2">
              <PixelButton
                variant="primary"
                size="lg"
                onClick={() =>
                  (window.location.href = `/admin/${result.roomCode}`)
                }
              >
                Go to Dashboard
              </PixelButton>
              <PixelButton
                variant="secondary"
                size="md"
                onClick={() => {
                  setResult(null);
                  setSelectedCampaign(null);
                  setSelectedScenario(null);
                  setStep('select');
                }}
              >
                Create Another
              </PixelButton>
            </div>
          </div>
        </PixelCard>
      </div>
    );
  }

  // ─── Step 2: Configure Session ───
  if (step === 'configure') {
    const banner = selectedCampaign
      ? CAMPAIGN_BANNERS[selectedCampaign.id]
      : selectedScenario
        ? SCENARIO_BANNERS[selectedScenario.id]
        : CUSTOM_BANNER;

    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 md:p-10">
        {/* Selected mode summary */}
        <div className={`w-full max-w-lg rounded-lg bg-gradient-to-br ${banner?.gradient || CUSTOM_BANNER.gradient} p-5 mb-6`}>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{banner?.icon || '⚙️'}</span>
            <div>
              <h2 className="text-xl font-bold text-[#e8f5e0]">
                {selectedCampaign?.name || selectedScenario?.name || 'Custom Game'}
              </h2>
              {(selectedScenario || selectedCampaign) && (
                <span
                  className="text-sm uppercase font-bold px-2 py-0.5 rounded inline-block mt-1"
                  style={{
                    color: DIFFICULTY_COLORS[(selectedCampaign?.difficulty || selectedScenario?.difficulty)!],
                    backgroundColor: `${DIFFICULTY_COLORS[(selectedCampaign?.difficulty || selectedScenario?.difficulty)!]}22`,
                  }}
                >
                  {selectedCampaign?.difficulty || selectedScenario?.difficulty}
                </span>
              )}
            </div>
          </div>
          <p className="text-base text-[#c4ddb4]">
            {selectedCampaign?.description || selectedScenario?.description || 'Configure rounds and duration manually.'}
          </p>
        </div>

        <PixelCard title="Session Settings" className="w-full max-w-lg">
          <form onSubmit={handleCreate} className="flex flex-col gap-5">
            <PixelInput
              label="Session Name"
              placeholder="e.g. Biology 101"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              maxLength={50}
              className="!text-base !py-3"
            />

            {isCustom && (
              <div className="flex gap-4">
                <div className="flex-1">
                  <PixelInput
                    label="Rounds"
                    type="number"
                    min={1}
                    max={10}
                    value={totalRounds}
                    onChange={(e) => setTotalRounds(Number(e.target.value))}
                    className="!text-base !py-3"
                  />
                </div>
                <div className="flex-1">
                  <PixelInput
                    label="Duration (sec)"
                    type="number"
                    min={GAME_DEFAULTS.round.minDuration}
                    max={GAME_DEFAULTS.round.maxDuration}
                    step={60}
                    value={roundDuration}
                    onChange={(e) => setRoundDuration(Number(e.target.value))}
                    className="!text-base !py-3"
                  />
                </div>
              </div>
            )}

            {selectedCampaign && (
              <div className="text-base text-[#6a9a4a] bg-[#0d1f0d] p-4 rounded">
                <span className="font-bold text-[#f39c12] text-lg">{selectedCampaign.name}</span>
                <span className="text-[#6a9a4a]">{' \u2014 '}{selectedCampaign.totalMissions} missions</span>
                {selectedCampaign.chapters.map((ch, i) => (
                  <div key={i} className="mt-2 text-sm text-[#6a9a4a]">
                    <span className="font-bold text-[#8bba6a]">{ch.name}:</span>{' '}
                    {ch.missionCount} missions
                    {ch.unlockStars > 0 && (
                      <span className="text-[#f39c12] ml-1">({ch.unlockStars} stars to unlock)</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {selectedScenario && (
              <div className="text-base text-[#6a9a4a] bg-[#0d1f0d] p-4 rounded">
                <span className="font-bold text-[#8bba6a] text-lg">{selectedScenario.name}</span>
                <span className="text-[#6a9a4a]">{' \u2014 '}{selectedScenario.totalRounds} rounds</span>
                {selectedScenario.rounds.map((r, i) => (
                  <div key={i} className="mt-2 text-sm text-[#6a9a4a]">
                    <span className="font-bold text-[#8bba6a]">Round {i + 1}:</span>{' '}
                    {r.label} ({Math.floor(r.durationSeconds / 60)} min{r.budget > 0 ? `, ${r.budget} coins` : ', unlimited budget'})
                  </div>
                ))}
              </div>
            )}

            {error && <p className="text-base text-[#c0392b]">{error}</p>}

            <div className="flex gap-3">
              <PixelButton
                type="button"
                variant="secondary"
                size="lg"
                onClick={handleBack}
                className="flex-1"
              >
                Back
              </PixelButton>
              <PixelButton type="submit" variant="primary" size="lg" disabled={loading} className="flex-[2]">
                {loading ? 'Creating...' : 'Create Room'}
              </PixelButton>
            </div>
          </form>
        </PixelCard>

        <p className="mt-8 text-sm text-[#4a6a3a]">
          <a href="/" className="text-[#8bba6a] underline hover:text-[#a8d880]">
            Back to Home
          </a>
        </p>
      </div>
    );
  }

  // ─── Step 1: Full-Screen Scenario Selection ───
  return (
    <div className="flex min-h-screen flex-col p-6 md:p-10">
      <div className="text-center mb-8">
        <h1
          className="text-3xl md:text-4xl font-bold uppercase tracking-widest text-[#8bba6a] mb-3"
          style={{ textShadow: '2px 2px 0 #1a3a1a' }}
        >
          Create a Game Room
        </h1>
        <p className="text-lg text-[#6a9a4a]">
          Choose a game mode for your class
        </p>
      </div>

      {/* Campaign Banners */}
      <div className="w-full max-w-6xl mx-auto mb-3">
        <h2 className="text-lg font-bold text-[#f39c12] uppercase tracking-wider mb-3" style={{ textShadow: '1px 1px 0 #1a1a00' }}>
          Mission Campaigns
        </h2>
        <p className="text-sm text-[#6a9a4a] mb-4">Short puzzle missions with objectives, star ratings, and dramatic events</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-6xl mx-auto w-full mb-8">
        {CAMPAIGNS.map((c) => {
          const banner = CAMPAIGN_BANNERS[c.id] || CUSTOM_BANNER;
          return (
            <button
              key={c.id}
              onClick={() => handleSelectCampaign(c)}
              className={`text-left rounded-lg overflow-hidden bg-gradient-to-br ${banner.gradient} transition-all duration-200 cursor-pointer hover:scale-[1.02] hover:shadow-[0_0_24px_rgba(243,156,18,0.3)] flex flex-col ring-1 ring-[#f39c1233]`}
            >
              <div className="p-5 pb-3 flex items-start gap-4">
                <span className="text-5xl leading-none">{banner.icon}</span>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl md:text-2xl font-bold text-[#e8f5e0] leading-tight">
                    {c.name}
                  </h2>
                  <span
                    className="inline-block text-sm uppercase font-bold px-2.5 py-1 rounded mt-2"
                    style={{
                      color: DIFFICULTY_COLORS[c.difficulty],
                      backgroundColor: `${DIFFICULTY_COLORS[c.difficulty]}22`,
                    }}
                  >
                    {c.difficulty}
                  </span>
                </div>
              </div>

              <div className="px-5 pb-3">
                <p className="text-base text-[#c4ddb4] leading-relaxed">{c.description}</p>
              </div>

              <div className="px-5 pb-4 flex-1">
                <ul className="space-y-1.5">
                  {banner.features.map((f, i) => (
                    <li key={i} className="text-sm text-[#a4c894] flex items-center gap-2">
                      <span className="text-[#f39c12] text-xs">&#9733;</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="px-5 py-3 bg-black/20 flex items-center justify-between">
                <span className="text-sm text-[#f39c12] font-bold">
                  {c.totalMissions} missions &middot; {c.chapters.length} chapters
                </span>
                <span className="text-sm text-[#6a9a4a]">
                  {DIFFICULTY_LABELS[c.difficulty]}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Classic Scenarios */}
      <div className="w-full max-w-6xl mx-auto mb-3">
        <h2 className="text-lg font-bold text-[#8bba6a] uppercase tracking-wider mb-3" style={{ textShadow: '1px 1px 0 #1a3a1a' }}>
          Classic Scenarios
        </h2>
        <p className="text-sm text-[#6a9a4a] mb-4">Longer open-ended rounds with broad goals</p>
      </div>
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 max-w-6xl mx-auto w-full">
        {SCENARIOS.map((s) => {
          const banner = SCENARIO_BANNERS[s.id] || CUSTOM_BANNER;
          return (
            <button
              key={s.id}
              onClick={() => handleSelectScenario(s)}
              className={`text-left rounded-lg overflow-hidden bg-gradient-to-br ${banner.gradient} transition-all duration-200 cursor-pointer hover:scale-[1.02] hover:shadow-[0_0_24px_rgba(139,186,106,0.3)] flex flex-col`}
            >
              {/* Banner header with icon */}
              <div className="p-5 pb-3 flex items-start gap-4">
                <span className="text-5xl leading-none">{banner.icon}</span>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl md:text-2xl font-bold text-[#e8f5e0] leading-tight">
                    {s.name}
                  </h2>
                  <span
                    className="inline-block text-sm uppercase font-bold px-2.5 py-1 rounded mt-2"
                    style={{
                      color: DIFFICULTY_COLORS[s.difficulty],
                      backgroundColor: `${DIFFICULTY_COLORS[s.difficulty]}22`,
                    }}
                  >
                    {s.difficulty}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="px-5 pb-3">
                <p className="text-base text-[#c4ddb4] leading-relaxed">
                  {s.description}
                </p>
              </div>

              {/* Feature bullets */}
              <div className="px-5 pb-4 flex-1">
                <ul className="space-y-1.5">
                  {banner.features.map((f, i) => (
                    <li key={i} className="text-sm text-[#a4c894] flex items-center gap-2">
                      <span className="text-[#8bba6a] text-xs">&#9654;</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Footer info bar */}
              <div className="px-5 py-3 bg-black/20 flex items-center justify-between">
                <span className="text-sm text-[#8bba6a] font-bold">
                  {s.totalRounds} round{s.totalRounds !== 1 ? 's' : ''}
                </span>
                <span className="text-sm text-[#6a9a4a]">
                  {DIFFICULTY_LABELS[s.difficulty]}
                </span>
              </div>
            </button>
          );
        })}

        {/* Custom option */}
        <button
          onClick={handleSelectCustom}
          className={`text-left rounded-lg overflow-hidden bg-gradient-to-br ${CUSTOM_BANNER.gradient} transition-all duration-200 cursor-pointer hover:scale-[1.02] hover:shadow-[0_0_24px_rgba(139,186,106,0.3)] flex flex-col`}
        >
          <div className="p-5 pb-3 flex items-start gap-4">
            <span className="text-5xl leading-none">{CUSTOM_BANNER.icon}</span>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl md:text-2xl font-bold text-[#e8f5e0] leading-tight">
                Custom Game
              </h2>
              <span className="inline-block text-sm uppercase font-bold px-2.5 py-1 rounded mt-2 text-[#aaa] bg-[#ffffff11]">
                Flexible
              </span>
            </div>
          </div>

          <div className="px-5 pb-3">
            <p className="text-base text-[#c4ddb4] leading-relaxed">
              Configure rounds and duration manually. Great for custom lesson plans.
            </p>
          </div>

          <div className="px-5 pb-4 flex-1">
            <ul className="space-y-1.5">
              {CUSTOM_BANNER.features.map((f, i) => (
                <li key={i} className="text-sm text-[#a4c894] flex items-center gap-2">
                  <span className="text-[#8bba6a] text-xs">&#9654;</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="px-5 py-3 bg-black/20 flex items-center justify-between">
            <span className="text-sm text-[#8bba6a] font-bold">
              You decide
            </span>
            <span className="text-sm text-[#6a9a4a]">
              Full teacher control
            </span>
          </div>
        </button>
      </div>

      <p className="text-center mt-8 text-base text-[#4a6a3a]">
        <a href="/" className="text-[#8bba6a] underline hover:text-[#a8d880]">
          Back to Home
        </a>
      </p>
    </div>
  );
}
