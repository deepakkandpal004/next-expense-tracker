"use client";

import { motion } from "motion/react";
import { User, DollarSign, AlertTriangle, CheckCircle2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { getSettings, updateSettings, type UserSettings } from "@/app/actions/updateSettings";
import { Button } from "@/components/ui";
import { listItemVariants } from "@/lib/ui/motion";

const CURRENCIES = [
  { code: "INR", label: "Indian Rupee (₹)" },
  { code: "USD", label: "US Dollar ($)" },
  { code: "EUR", label: "Euro (€)" },
  { code: "GBP", label: "British Pound (£)" },
  { code: "JPY", label: "Japanese Yen (¥)" },
  { code: "CAD", label: "Canadian Dollar (C$)" },
  { code: "AUD", label: "Australian Dollar (A$)" },
  { code: "SGD", label: "Singapore Dollar (S$)" },
  { code: "CHF", label: "Swiss Franc (Fr)" },
  { code: "CNY", label: "Chinese Yuan (¥)" },
];

export function SettingsView() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    getSettings().then(r => {
      if (r.status === "success") {
        setSettings(r.data);
        setName(r.data.name);
        setCurrency(r.data.currency);
      } else {
        setMessage({ type: "error", text: r.message });
      }
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    const result = await updateSettings({ name, currency });
    if (result.status === "success") {
      setSettings(result.data);
      setMessage({ type: "success", text: "Settings saved." });
    } else {
      setMessage({ type: "error", text: result.message });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-card/50" />
        <div className="h-48 animate-pulse rounded-xl bg-card/50" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl grid gap-8">
      <header>
        <h1 className="text-display-xl font-bold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account and preferences</p>
      </header>

      {message && (
        <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${
          message.type === "success" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
        }`}>
          {message.type === "success" ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="ml-auto opacity-60 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      )}

      <motion.div variants={listItemVariants} className="rounded-xl border border-border/50 bg-surface p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <User size={18} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Profile</h2>
            <p className="text-xs text-muted-foreground">Your name and email</p>
          </div>
        </div>
        <div className="grid gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border/50 bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Email</label>
            <input
              value={settings?.email ?? ""}
              disabled
              className="mt-1 w-full rounded-lg border border-border/50 bg-muted/50 px-3 py-2 text-sm text-muted-foreground outline-none cursor-not-allowed"
            />
            <p className="mt-1 text-[10px] text-muted-foreground">Email cannot be changed.</p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={listItemVariants} className="rounded-xl border border-border/50 bg-surface p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <DollarSign size={18} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Currency</h2>
            <p className="text-xs text-muted-foreground">Preferred currency for amounts</p>
          </div>
        </div>
        <select
          value={currency}
          onChange={e => setCurrency(e.target.value)}
          className="w-full rounded-lg border border-border/50 bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
        >
          {CURRENCIES.map(c => (
            <option key={c.code} value={c.code}>{c.label}</option>
          ))}
        </select>
      </motion.div>

      <div className="flex justify-end">
        <Button label="Save" onClick={handleSave} loading={saving} />
      </div>
    </div>
  );
}
