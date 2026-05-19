type CheckboxProps = {
  checked: boolean;
  onChange: () => void;
  label: string;
};

export function Checkbox({
  checked,
  onChange,
  label,
}: CheckboxProps) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-800 p-4 hover:bg-zinc-900/50">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 accent-white"
      />

      <span className="text-sm text-zinc-200">
        {label}
      </span>
    </label>
  );
}