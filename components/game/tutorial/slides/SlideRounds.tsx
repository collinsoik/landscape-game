import TutorialSlide from '../TutorialSlide';

export default function SlideRounds() {
  return (
    <TutorialSlide
      title="4 Rounds of Building"
      body="Each round focuses on a different category: Trees, Flowers, Shrubs, then Objects. Place elements on the canvas to build your landscape one layer at a time."
      tip="Elements from previous rounds stay on your canvas but can't be moved."
      illustration={
        <div className="flex gap-6 items-end">
          {['Trees', 'Flowers', 'Shrubs', 'Objects'].map((cat, i) => (
            <div key={cat} className="flex flex-col items-center gap-2">
              <div
                className="w-16 h-16 rounded flex items-center justify-center text-2xl"
                style={{ background: '#1a3a1a', border: '2px solid #2d5a27' }}
              >
                {['\uD83C\uDF33', '\uD83C\uDF3B', '\uD83C\uDF3F', '\uD83C\uDFE0'][i]}
              </div>
              <span className="text-xs text-[#8bba6a] font-bold">Round {i + 1}</span>
              <span className="text-xs text-[#6a9a4a]">{cat}</span>
            </div>
          ))}
        </div>
      }
    />
  );
}
