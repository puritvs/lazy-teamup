// components/TimeSelect.tsx

type Props = {
  value: string;
  onChange: (value: string) => void;
};

function splitTime(time: string) {
  const [hour = "00", minute = "00"] = time.split(":");

  return {
    hour,
    minute,
  };
}

function buildTime(hour: string, minute: string) {
  return `${hour}:${minute}`;
}

export function TimeSelect({ value, onChange }: Props) {
  const { hour, minute } = splitTime(value);

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
      <select
        value={hour}
        onChange={(e) => onChange(buildTime(e.target.value, minute))}
        className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none"
      >
        {Array.from({ length: 24 }, (_, index) => {
          const value = String(index).padStart(2, "0");

          return (
            <option key={value} value={value}>
              {value}
            </option>
          );
        })}
      </select>

      <span className="text-zinc-500">:</span>

      <select
        value={minute}
        onChange={(e) => onChange(buildTime(hour, e.target.value))}
        className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none"
      >
        {Array.from({ length: 60 }, (_, index) => {
          const value = String(index).padStart(2, "0");

          return (
            <option key={value} value={value}>
              {value}
            </option>
          );
        })}
      </select>
    </div>
  );
}
