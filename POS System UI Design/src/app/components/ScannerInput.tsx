import { useState, useRef, useEffect } from "react";
import { ScanLine, X } from "lucide-react";

interface Props {
  onScan: (code: string) => void;
}

export function ScannerInput({ onScan }: Props) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && value.trim()) {
      onScan(value.trim());
      setValue("");
    }
  }

  function handleClear() {
    setValue("");
    inputRef.current?.focus();
  }

  return (
    <div className="relative flex items-center gap-2">
      <div className="relative flex-1">
        <ScanLine
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        />
        <input
          ref={inputRef}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Scan barcode / QR code…"
          className="w-full pl-9 pr-9 py-3 rounded-xl bg-card border border-border focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
        />
        {value && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
