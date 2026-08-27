"use client";

import { motion } from "motion/react";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import {
  getCategories,
  upsertCategory,
  createCustomCategory,
  deleteCustomCategory,
  type CategoryWithSpending,
} from "@/src/modules/categories";
import { Button, useToast } from "@/components/ui";
import { listContainerVariants } from "@/lib/ui/motion";
import { CategoryCard } from "./category-card";
import { InlineForm } from "./inline-form";
import { MessageBanner } from "./message-banner";
import type { CategoriesViewProps } from "./types";

export { type CategoriesViewProps } from "./types";

export function CategoriesView({ currency = "INR" }: CategoriesViewProps) {
  const { toast } = useToast();
  const [categories, setCategories] = useState<CategoryWithSpending[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<CategoryWithSpending | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [creating, setCreating] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const result = await getCategories();
    if (result.status === "success") {
      setCategories(result.data);
    } else {
      setMessage(result.message);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleEdit = async () => {
    if (!editing || !editLabel.trim()) return;
    const result = await upsertCategory(editing.categoryId, { label: editLabel.trim() });
    if (result.status === "success") {
      setEditing(null);
      load();
      toast({ description: "Category renamed.", tone: "success" });
    } else {
      setMessage(result.message);
    }
  };

  const handleCreate = async () => {
    if (!newLabel.trim()) return;
    const result = await createCustomCategory(newLabel.trim());
    if (result.status === "success") {
      setCreating(false);
      setNewLabel("");
      load();
      toast({ description: "Category created.", tone: "success" });
    } else {
      setMessage(result.message);
    }
  };

  const handleDelete = async (cat: CategoryWithSpending) => {
    const result = await deleteCustomCategory(cat.categoryId);
    if (result.status === "success") {
      load();
      toast({ description: "Category deleted.", tone: "success" });
    } else {
      setMessage(result.message);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="h-32 animate-pulse rounded-xl bg-card/50" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-display-xl font-bold text-foreground">Categories</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage spending categories</p>
        </div>
        <Button icon={<Plus size={16} />} label="Add" onClick={() => setCreating(true)} />
      </header>

      {message && <MessageBanner message={message} onDismiss={() => setMessage(null)} />}

      {creating && (
        <InlineForm
          value={newLabel}
          onChange={setNewLabel}
          onSave={handleCreate}
          onCancel={() => { setCreating(false); setNewLabel(""); }}
          saveLabel="Create"
          placeholder="Category name"
        />
      )}

      {editing && (
        <InlineForm
          value={editLabel}
          onChange={setEditLabel}
          onSave={handleEdit}
          onCancel={() => setEditing(null)}
          saveLabel="Save"
          placeholder="New label"
        />
      )}

      <motion.div
        variants={listContainerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {categories.map(cat => (
          <CategoryCard
            key={cat.categoryId}
            category={cat}
            currency={currency}
            onEdit={cat => { setEditing(cat); setEditLabel(cat.label); }}
            onDelete={handleDelete}
          />
        ))}
      </motion.div>
    </div>
  );
}
