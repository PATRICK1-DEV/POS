import { Store, User, Percent, MapPin } from "lucide-react";
import { VAT_RATE } from "./pos-data";

const SETTINGS = [
  { label: "Jina la Duka", value: "Duka la Amina", icon: Store },
  { label: "Mahali", value: "Dar es Salaam, Tanzania", icon: MapPin },
  { label: "Cashier", value: "Amina Mwangi", icon: User },
  { label: "Kiwango cha VAT", value: `${Math.round(VAT_RATE * 100)}%`, icon: Percent },
];

export function SettingsView() {
  return (
    <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
      <div className="max-w-xl space-y-3 pb-4">
        {SETTINGS.map(s => (
          <div key={s.label} className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
              <s.icon size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-foreground" style={{ fontWeight: 600 }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
