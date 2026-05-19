type SliderProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
};

export function Slider({
  value,
  onChange,
  min = 1,
  max = 10,
}: SliderProps) {
  return (
    <div className="space-y-2">
      <div className="text-sm text-zinc-400">
        Generate: {value} posts
      </div>

      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) =>
          onChange(Number(e.target.value))
        }
        className="w-full"
      />
    </div>
  );
}