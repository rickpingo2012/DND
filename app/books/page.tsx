'use client'

import { useState } from 'react'
import { Card2 } from '../../src/components/Card2'

interface Book {
  id: string;
  title: string;
  tag: string;
  description: string;
  pdfUrl: string;
}

const DND_BOOKS: Book[] = [
  {
    id: '1',
    title: "Player's Handbook",
    tag: "Core Rulebook",
    description: "The essential reference for every Dungeons & Dragons roleplayer. Contains rules for character creation, spells, equipment, and combat.",
    pdfUrl: "/pdf/dd-5e-players-handbook.pdf"
  },
  {
    id: '2',
    title: "Master's Guide",
    tag: "Core Rulebook",
    description: "Weave legendary stories with hundreds of tools, world-building advice, magic items, and secret tables for the ultimate DM.",
    pdfUrl: "/pdf/Master-guide-D&D-5e.pdf"
  },
  {
    id: '3',
    title: "Monster Manual",
    tag: "Bestiary",
    description: "A horde of classic D&D creatures, including dragons, giants, mind flayers, and beholders, ready to challenge player characters.",
    pdfUrl: "/pdf/monsters-manual-d&d-5e.pdf"
  }
]

export default function BooksPage() {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  return (
    <div className="min-h-screen bg-neutral-950 text-amber-50 selection:bg-amber-500 selection:text-neutral-950 p-6 md:p-12 relative">
      
      {/* Ambient background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-red-950/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-1/4 w-[500px] h-[500px] bg-amber-900/15 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <header className="mb-12 border-b border-neutral-800 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500">
              Arcane Library
            </h1>
            <p className="text-neutral-400 mt-2 text-sm md:text-base max-w-xl">
              Access the official rulebooks, bestiaries, and guides online directly in your browser or download them for offline reference.
            </p>
          </div>
          <span className="text-xs uppercase tracking-widest text-red-500 font-semibold border border-red-500/30 bg-red-950/40 px-3 py-1.5 rounded-md">
            5th Edition Archives
          </span>
        </header>

        {/* Books Grid using Card Component */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DND_BOOKS.map((book) => (
            <Card2
              key={book.id}
              title={book.title}
              tag={book.tag}
              description={book.description}
              onClick={() => setSelectedBook(book)}
            />
          ))}
        </div>

      </div>

      {/* PDF Reader Modal View */}
      {selectedBook !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-neutral-950/90 backdrop-blur-lg">
          <div className="relative w-full max-w-6xl h-[90vh] bg-neutral-900 border border-amber-500/40 rounded-2xl shadow-2xl shadow-black flex flex-col overflow-hidden pointer-events-none">
            
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between p-4 px-6 bg-neutral-950 border-b border-neutral-800">
              <div>
                <h2 className="text-lg md:text-xl font-bold uppercase tracking-wide text-amber-400">
                  {selectedBook.title}
                </h2>
                <span className="text-xs text-neutral-400 uppercase tracking-wider">
                  {selectedBook.tag}
                </span>
              </div>

              {/* Actions: Download & Close */}
              <div className="flex items-center gap-3">
                <a
                  href={selectedBook.pdfUrl}
                  download
                  className="flex items-center gap-2 text-xs uppercase font-bold tracking-wider px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-neutral-950 rounded-lg shadow-md transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download PDF
                </a>

                <button
                  onClick={() => setSelectedBook(null)}
                  className="p-2 text-neutral-400 hover:text-red-400 transition-colors rounded-lg bg-neutral-900 border border-neutral-800"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* In-Browser PDF Reader Body */}
            <div className="flex-1 bg-neutral-950 w-full h-full relative">
              <iframe
                src={`${selectedBook.pdfUrl}#toolbar=0`}
                className="w-full h-full border-none"
                title={selectedBook.title}
                target="_blank"
              />
            </div>

          </div>
        </div>
      )}

    </div>
  );
}