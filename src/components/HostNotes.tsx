'use client';

import React, { useState, useEffect } from 'react';

interface HostNotesProps {
  roomCode: string;
};

export function HostNotes({ roomCode }: HostNotesProps) {
  const storageKey = `dm-notes-${roomCode}`;
  const [notes, setNotes] = useState('');
  const [savedStatus, setSavedStatus] = useState<'saved' | 'saving'>('saved');
  
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved !== null) {
      setNotes(saved);
    }
  }, [storageKey]);
  
  useEffect(() => {
    setSavedStatus('saving');
    const timer = setTimeout(() => {
      localStorage.setItem(storageKey, notes);
      setSavedStatus('saved');
    }, 400);

    return () => clearTimeout(timer);
  }, [notes, storageKey]);

  const handleClear = () => {
    if (!notes.trim()) return;
    setNotes('');
    localStorage.removeItem(storageKey);
  };

  return (
    <section className="bg-[#11131c] border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <h2 className="text-xs uppercase tracking-widest font-bold text-amber-500">
            DM Private Notes
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-500">
            {savedStatus === 'saving' ? 'Saving...' : 'Saved locally'}
          </span>
          {notes.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-slate-400 hover:text-red-400 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>
      
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Write secret NPC names, monster HP, plot twists, or trap DCs..."
        rows={6}
        className="w-full bg-[#090a0f] border border-slate-800 rounded-xl p-3.5 text-sm text-slate-200 placeholder-slate-500 leading-relaxed resize-y focus:outline-none focus:border-amber-500/50 scrollbar-thin scrollbar-thumb-slate-800"
      />
      
      <div className="flex justify-between items-center text-[11px] text-slate-500 px-1">
        <span>Visible only to the host</span>
        <span>{notes.length} chars</span>
      </div>
    </section>
  );
}
