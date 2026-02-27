'use client';

interface CampaignChapterInfo {
  id: string;
  name: string;
  unlockStars: number;
  missions: {
    id: string;
    title: string;
    missionType: string;
    durationSeconds: number;
    budget: number;
    actionLimit: number;
  }[];
}

interface CampaignMapProps {
  campaignName: string;
  chapters: CampaignChapterInfo[];
  totalStars: number;
  missionStars: Record<string, number>; // missionId -> stars earned
  currentMission: number; // 1-indexed
  onSelectMission: (missionIndex: number) => void;
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

export default function CampaignMap({
  campaignName,
  chapters,
  totalStars,
  missionStars,
  currentMission,
  onSelectMission,
}: CampaignMapProps) {
  let missionIndex = 0;

  return (
    <div
      className="fixed inset-0 z-[85] flex flex-col items-center overflow-y-auto py-8 px-4"
      style={{ background: 'rgba(13, 31, 13, 0.98)' }}
    >
      {/* Header */}
      <div className="text-center mb-6">
        <h1
          className="text-2xl font-bold text-[#8bba6a] mb-1"
          style={{ textShadow: '2px 2px 0 #1a3a1a' }}
        >
          {campaignName}
        </h1>
        <div className="flex items-center justify-center gap-2 text-sm">
          <span className="text-[#f39c12] text-lg">{'\u2605'}</span>
          <span className="text-[#f39c12] font-bold">{totalStars}</span>
          <span className="text-[#6a9a4a]">stars earned</span>
        </div>
      </div>

      {/* Chapters */}
      <div className="w-full max-w-2xl flex flex-col gap-6">
        {chapters.map((chapter) => {
          const locked = totalStars < chapter.unlockStars;

          return (
            <div key={chapter.id}>
              {/* Chapter header */}
              <div className="flex items-center gap-3 mb-3">
                <h2 className={`text-sm font-bold uppercase tracking-wider ${locked ? 'text-[#4a6a3a]' : 'text-[#8bba6a]'}`}>
                  {chapter.name}
                </h2>
                {locked && (
                  <span className="text-xs text-[#6a9a4a] px-2 py-0.5 rounded bg-[#1a3a1a]">
                    {'\u{1F512}'} {chapter.unlockStars} stars to unlock
                  </span>
                )}
                {!locked && chapter.unlockStars > 0 && (
                  <span className="text-xs text-[#2ecc71] px-2 py-0.5 rounded bg-[#0d2a0d]">
                    Unlocked
                  </span>
                )}
              </div>

              {/* Mission cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {chapter.missions.map((mission) => {
                  missionIndex++;
                  const thisMissionIndex = missionIndex;
                  const stars = missionStars[mission.id] ?? 0;
                  const isCurrent = thisMissionIndex === currentMission;
                  const typeColor = getMissionTypeColor(mission.missionType);

                  return (
                    <button
                      key={mission.id}
                      onClick={() => !locked && onSelectMission(thisMissionIndex)}
                      disabled={locked}
                      className={`
                        p-3 rounded text-left transition-all cursor-pointer
                        ${locked ? 'opacity-40 cursor-not-allowed' : 'hover:scale-105'}
                        ${isCurrent ? 'ring-2 ring-[#8bba6a]' : ''}
                      `}
                      style={{
                        background: locked ? '#0d1f0d' : '#1a3a1a',
                        border: `1px solid ${isCurrent ? '#8bba6a' : '#2d5a27'}`,
                      }}
                    >
                      {/* Mission number + type badge */}
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-[#6a9a4a]">#{thisMissionIndex}</span>
                        <span
                          className="text-[11px] font-bold uppercase px-1.5 rounded"
                          style={{ color: typeColor, background: `${typeColor}20` }}
                        >
                          {mission.missionType}
                        </span>
                      </div>

                      {/* Title */}
                      <div className="text-sm font-bold text-[#d4e8c2] mb-1.5 leading-tight">
                        {mission.title}
                      </div>

                      {/* Constraints */}
                      <div className="flex items-center gap-2 text-xs text-[#6a9a4a] mb-2">
                        <span>{mission.durationSeconds}s</span>
                        {mission.budget > 0 && <span>{mission.budget}c</span>}
                        {mission.actionLimit > 0 && <span>{mission.actionLimit}a</span>}
                      </div>

                      {/* Stars */}
                      <div className="flex gap-0.5">
                        {[1, 2, 3].map((n) => (
                          <span
                            key={n}
                            className="text-xs"
                            style={{ color: n <= stars ? '#f39c12' : '#2d5a27' }}
                          >
                            {'\u2605'}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
