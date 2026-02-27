import TutorialSlide from '../TutorialSlide';

export default function SlideStars() {
  return (
    <TutorialSlide
      title="Earn Stars"
      body="Each round has 3 star challenges. Earn stars by placing enough elements and using a variety of species. Try to earn all 12 stars across 4 rounds!"
      tip="You can see your star progress in the goal banner at the top."
      illustration={
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <span key={s} className="text-5xl" style={{ color: '#f39c12' }}>{'\u2605'}</span>
            ))}
          </div>
          <div className="text-sm text-[#d4e8c2] text-center max-w-xs space-y-1">
            <p><span className="text-[#f39c12]">{'\u2605'}</span> Place at least 1 element</p>
            <p><span className="text-[#f39c12]">{'\u2605\u2605'}</span> Place several elements</p>
            <p><span className="text-[#f39c12]">{'\u2605\u2605\u2605'}</span> Fill the cap with variety</p>
          </div>
        </div>
      }
    />
  );
}
