"use client";

import { useState, useEffect } from "react";
import { ModalForm } from "@/components/admin/ModalForm";

type Card = {
  id: string;
  question: string;
  answer: string;
  lessonSource: string;
};

export function AdminFlashcardsClient() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [form, setForm] = useState({ question: "", answer: "", lessonSource: "" });

  const load = () => {
    setLoading(true);
    setError(null);
    fetch("/api/admin/flashcards")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setCards(data.cards ?? []);
      })
      .catch(() => setError("Failed to load flashcards"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openEdit = (card: Card) => {
    setSelectedCard(card);
    setForm({ question: card.question, answer: card.answer, lessonSource: card.lessonSource });
    setEditOpen(true);
  };

  const saveEdit = () => {
    if (!selectedCard) return;
    fetch("/api/admin/flashcards", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: selectedCard.id,
        question: form.question,
        answer: form.answer,
        lessonSource: form.lessonSource,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else {
          setError(null);
          setEditOpen(false);
          setSelectedCard(null);
          load();
        }
      });
  };

  const saveCreate = () => {
    fetch("/api/admin/flashcards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: form.question,
        answer: form.answer,
        lessonSource: form.lessonSource || undefined,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else {
          setError(null);
          setCreateOpen(false);
          setForm({ question: "", answer: "", lessonSource: "" });
          load();
        }
      });
  };

  const deleteCard = (id: string) => {
    if (!confirm("Delete this flashcard?")) return;
    fetch("/api/admin/flashcards", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else load();
      });
  };

  if (loading && cards.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8">
        <p className="text-slate-500">Loading flashcards...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Create new flashcard
        </button>
      </div>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="space-y-3">
        {cards.map((card) => (
          <div
            key={card.id}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium text-slate-900">{card.question}</p>
              <p className="mt-1 text-sm text-slate-600">{card.answer}</p>
              <p className="mt-1 text-xs text-slate-500">Source: {card.lessonSource}</p>
            </div>
            <div className="ml-4 flex gap-2">
              <button
                type="button"
                onClick={() => openEdit(card)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => deleteCard(card.id)}
                className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {cards.length === 0 && (
          <p className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-500">
            No flashcards yet. Create one to get started.
          </p>
        )}
      </div>

      <ModalForm
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit flashcard"
        footer={
          <>
            <button type="button" onClick={() => setEditOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="button" onClick={saveEdit} className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">Save</button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Question</label>
            <input type="text" value={form.question} onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Answer</label>
            <textarea value={form.answer} onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))} rows={3} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Lesson source</label>
            <input type="text" value={form.lessonSource} onChange={(e) => setForm((f) => ({ ...f, lessonSource: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
        </div>
      </ModalForm>

      <ModalForm
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create flashcard"
        footer={
          <>
            <button type="button" onClick={() => setCreateOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="button" onClick={saveCreate} className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">Create</button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Question</label>
            <input type="text" value={form.question} onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Answer</label>
            <textarea value={form.answer} onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))} rows={3} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Lesson source</label>
            <input type="text" value={form.lessonSource} onChange={(e) => setForm((f) => ({ ...f, lessonSource: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
        </div>
      </ModalForm>
    </>
  );
}
