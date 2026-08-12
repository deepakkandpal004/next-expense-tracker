"use client";

import { useEffect, useState } from "react";
import { getSettings, updateSettings, type UserSettings } from "@/app/actions/updateSettings";
import { Button, useToast } from "@/components/ui";
import { CurrencyField } from "./currency-field";
import { MessageBanner, type SettingsMessage } from "./message-banner";
import { ProfileForm } from "./profile-form";

export function SettingsView() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [message, setMessage] = useState<SettingsMessage | null>(null);

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
    if (saving) return;
    setSaving(true);
    setMessage(null);
    const result = await updateSettings({ name, currency });
    if (result.status === "success") {
      setSettings(result.data);
      setCurrency(result.data.currency);
      toast({ description: result.message, tone: "success" });
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
        <MessageBanner message={message} onDismiss={() => setMessage(null)} />
      )}

      <ProfileForm name={name} email={settings?.email ?? ""} onNameChange={setName} />

      <CurrencyField value={currency} onChange={setCurrency} />

      <div className="flex justify-end">
        <Button label="Save" onClick={handleSave} loading={saving} />
      </div>
    </div>
  );
}