'use client';

import TutorialSlide from '../TutorialSlide';

function BudgetIllustration() {
  const tiers = [
    { cost: 1, label: 'Small', examples: 'Grass, Flowers, Birdhouse', color: '#2ecc71' },
    { cost: 2, label: 'Medium', examples: 'Shrubs, Pine Tree, Compost', color: '#f39c12' },
    { cost: 3, label: 'Large', examples: 'Oak Tree, Pond, Rain Garden', color: '#e74c3c' },
  ];

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto">
      {/* Budget counter mock */}
      <div
        className="flex items-center gap-3 px-5 py-3"
        style={{
          background: '#0d1f0d',
          border: '2px solid #2d5a27',
          boxShadow: 'inset -2px -2px 0 rgba(0,0,0,0.3), inset 2px 2px 0 rgba(255,255,255,0.05)',
        }}
      >
        <span className="text-[#f39c12] text-2xl">&#9679;</span>
        <div>
          <div className="text-lg font-bold text-[#2ecc71] font-mono">12 / 18</div>
          <div className="text-xs text-[#6a9a4a] uppercase tracking-wider">Coins Remaining</div>
        </div>
      </div>

      {/* Price tiers */}
      <div className="flex gap-3 w-full">
        {tiers.map((tier) => (
          <div
            key={tier.cost}
            className="flex-1 p-3 text-center"
            style={{
              background: '#1a3a1a',
              border: `2px solid ${tier.color}44`,
              boxShadow: `inset -2px -2px 0 rgba(0,0,0,0.3)`,
            }}
          >
            <div className="flex justify-center gap-1 mb-1">
              {Array.from({ length: tier.cost }).map((_, i) => (
                <span key={i} className="text-[#f39c12]" style={{ fontSize: 14 }}>&#9679;</span>
              ))}
            </div>
            <div className="text-xs font-bold" style={{ color: tier.color }}>{tier.label}</div>
            <div className="text-[11px] text-[#6a9a4a] mt-1 leading-tight">{tier.examples}</div>
          </div>
        ))}
      </div>

      {/* Refund info */}
      <div className="flex gap-4 text-center w-full">
        <div className="flex-1 p-2" style={{ background: '#1a3a1a', border: '1px solid #2d5a2744' }}>
          <div className="text-xs text-[#2ecc71] font-bold mb-0.5">Remove Your Element</div>
          <div className="text-[11px] text-[#6a9a4a]">Partial refund (varies by round)</div>
        </div>
        <div className="flex-1 p-2" style={{ background: '#1a3a1a', border: '1px solid #c0392b44' }}>
          <div className="text-xs text-[#e74c3c] font-bold mb-0.5">Remove Invasive</div>
          <div className="text-[11px] text-[#6a9a4a]">Costs 1 coin</div>
        </div>
      </div>

      {/* Action limit info */}
      <div
        className="flex items-center gap-3 px-5 py-2 w-full"
        style={{
          background: '#0d1f0d',
          border: '2px solid #2d5a27',
          boxShadow: 'inset -2px -2px 0 rgba(0,0,0,0.3), inset 2px 2px 0 rgba(255,255,255,0.05)',
        }}
      >
        <span className="text-[#3498db] text-xl">&#9889;</span>
        <div>
          <div className="text-xs font-bold text-[#3498db]">Action Limit</div>
          <div className="text-[11px] text-[#6a9a4a]">Each place, move, or remove uses 1 action</div>
        </div>
      </div>
    </div>
  );
}

export default function SlideBudget() {
  return (
    <TutorialSlide
      title="Spend Wisely!"
      body="Each element costs coins. Bigger elements cost more. Removing your own elements gives a partial refund (varies by scenario), and removing invasive weeds costs 1 coin. Every place, move, and remove uses one action — plan carefully!"
      tip="Watch both your coin budget and action counter!"
      illustration={<BudgetIllustration />}
    />
  );
}
