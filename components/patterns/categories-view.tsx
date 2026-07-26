"use client";

import { motion } from "motion/react";
import { Layers, Edit3, Plus, Trash2, X, Check, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import {
  getCategories,
  upsertCategory,
  createCustomCategory,
  deleteCustomCategory,
  type CategoryWithSpending,
} from "@/app/actions/manageCategories";
import { formatCurrency } from "@/lib/formatters/locale";
import { Button } from "@/components/ui";
import { listContainerVariants, listItemVariants } from "@/lib/ui/motion";

interface CategoryCardProps {
  category: CategoryWithSpending;
  currency: string;
  onEdit: (cat: CategoryWithSpending) => void;
  onDelete: (cat: CategoryWithSpending) => void;
}

function CategoryCard({ category, currency, onEdit, onDelete }: CategoryCardProps) {
  return (
    <motion.div variants={listItemVariants} className="rounded-xl border border-border/50 bg-surface p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Layers size={18} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{category.label}</h3>
            <p className="text-xs text-muted-foreground">{category.categoryId}{category.isCustom ? " (custom)" : ""}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button icon={<Edit3 size={14} />} intent="ghost" label="Edit" onClick={() => onEdit(category)} />
          {category.isCustom && (
            <Button icon={<Trash2 size={14} />} intent="ghost" label="Delete" onClick={() => onDelete(category)} />
          )}
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-lg bg-muted/50 p-2">
          <p className="text-muted-foreground">Spent</p>
          <p className="mt-0.5 font-semibold text-foreground">
            {formatCurrency({ minorValue: category.spendingMinor, currency })}
          </p>
        </div>
        <div className="rounded-lg bg-muted/50 p-2">
          <p className="text-muted-foreground">Transactions</p>
          <p className="mt-0.5 font-semibold text-foreground">{category.transactionCount}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function CategoriesView({ currency = "INR" }: { currency?: string }) {
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
      setMessage("Category renamed.");
      setEditing(null);
      load();
    } else {
      setMessage(result.message);
    }
  };

  const handleCreate = async () => {
    if (!newLabel.trim()) return;
    const result = await createCustomCategory(newLabel.trim());
    if (result.status === "success") {
      setMessage("Category created.");
      setCreating(false);
      setNewLabel("");
      load();
    } else {
      setMessage(result.message);
    }
  };

  const handleDelete = async (cat: CategoryWithSpending) => {
    const result = await deleteCustomCategory(cat.categoryId);
    if (result.status === "success") {
      setMessage("Category deleted.");
      load();
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

      {message && (
        <div className="flex items-center gap-2 rounded-lg bg-info/10 px-3 py-2 text-xs text-info">
          <AlertTriangle size={14} />
          <span>{message}</span>
          <button onClick={() => setMessage(null)} className="ml-auto text-info/60 hover:text-info">
            <X size={14} />
          </button>
        </div>
      )}

      {creating && (
        <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-surface p-3">
          <input
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            placeholder="Category name"
            className="flex-1 rounded-lg border border-border/50 bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            onKeyDown={e => e.key === "Enter" && handleCreate()}
          />
          <Button label="Create" onClick={handleCreate} />
          <Button intent="ghost" label="Cancel" onClick={() => { setCreating(false); setNewLabel(""); }} />
        </div>
      )}

      {editing && (
        <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-surface p-3">
          <input
            value={editLabel}
            onChange={e => setEditLabel(e.target.value)}
            placeholder="New label"
            className="flex-1 rounded-lg border border-border/50 bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            onKeyDown={e => e.key === "Enter" && handleEdit()}
          />
          <Button icon={<Check size={14} />} label="Save" onClick={handleEdit} />
          <Button intent="ghost" label="Cancel" onClick={() => setEditing(null)} />
        </div>
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
