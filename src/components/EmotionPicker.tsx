import React from 'react';

interface EmotionPickerProps {
  value: number;
  onChange: (value: number) => void;
}

const emotionEmojis = ['😢', '😔', '😐', '🙂', '😊', '😄', '🤩'];
const emotionLabels = ['很糟糕', '不太好', '一般', '还不错', '很好', '很开心', '超级棒'];

export const EmotionPicker: React.FC<EmotionPickerProps> = ({ value, onChange }) => {
  const handleClick = (index: number) => {
    const newValue = index / 6;
    onChange(newValue);
  };

  const currentIndex = Math.round(value * 6);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          当前心情
        </span>
        <span className="text-lg font-medium" style={{ color: 'var(--primary)' }}>
          {emotionLabels[currentIndex]}
        </span>
      </div>

      <div className="flex justify-between items-center p-4 rounded-xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
        {emotionEmojis.map((emoji, index) => (
          <button
            key={index}
            onClick={() => handleClick(index)}
            className={`text-3xl transition-all duration-300 ${
              index === currentIndex ? 'scale-125' : 'scale-100 opacity-50'
            } hover:scale-110`}
            title={emotionLabels[index]}
          >
            {emoji}
          </button>
        ))}
      </div>

      <div className="relative">
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, var(--danger) 0%, var(--warning) 50%, var(--success) 100%)`,
          }}
        />
        <style>{`
          input[type="range"]::-webkit-slider-thumb {
            appearance: none;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: white;
            border: 3px solid var(--primary);
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
          }
          input[type="range"]::-moz-range-thumb {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: white;
            border: 3px solid var(--primary);
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
          }
        `}</style>
      </div>

      <div className="flex justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
        <span>低落</span>
        <span>平静</span>
        <span>愉悦</span>
      </div>
    </div>
  );
};
