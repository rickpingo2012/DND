'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useSession } from "../src/lib/auth-client"

import { Card } from '../src/components/Card'
import { useNotification } from '../src/contexts/NotificationContext'

export default function HomePage() {
  const router = useRouter()
  const { showNotification } = useNotification()
  const { data: session } = useSession()
  
  const handleCardClick = (target: string) => {
    if (!session) {
      showNotification("You are not logged.")
      router.push("/account/login")
    } else {
      router.push(target)
    }
  }
  
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col items-center justify-center p-4 md:p-12">
      
      <div className="max-w-4xl w-full bg-slate-900/80 backdrop-blur-md border border-amber-600/30 rounded-2xl p-6 md:p-12 shadow-2xl shadow-red-950/40">
        
        <div className="text-center space-y-4 mb-8">
          <span className="text-xs uppercase tracking-widest font-semibold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            Tabletop RPG System
          </span>
          <h1 className="font-serif font-black text-4xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-400 to-red-500 tracking-wide notranslate">
            Dungeons & Dragons
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto rounded-full" />
        </div>
        
        <p className="text-lg md:text-xl text-slate-300 text-center leading-relaxed font-light mb-10 max-w-2xl mx-auto">
          Dungeons & Dragons (D&D) is the world's most iconic tabletop role-playing game — a journey of action, strategy, comedy, and unforgettable storytelling.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-5 hover:border-amber-500/40 transition-colors">
            <h3 className="font-serif text-amber-400 font-bold text-lg mb-2">The Dungeon Master</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Leads the adventure, defines the world, sets the rules, controls monsters, and creates challenges for the party to overcome.
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-5 hover:border-amber-500/40 transition-colors">
            <h3 className="font-serif text-amber-400 font-bold text-lg mb-2">The Players</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Create unique heroes with distinct powers, form strategies, and shape the story through their choices and dice rolls.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col mt-20 gap-8">
        <Card
          tag="Books"
          title="D&D BOOKS (PDF)"
          description="Read the D&D books, recommended for Masters. You can read the books while you are playing."
          onClick={() => handleCardClick("/books")}
          />
        
        <Card
          tag="Character"
          title="Create character"
          description="Make your character sheet. Choise the status, class, race and more!"
          onClick={() => handleCardClick("/character")}
          />

        <Card
          tag="Join"
          title="Join in party"
          description="Join in a party as player. You can play with your friend or with random peoples. You will play as player"
          onClick={() => handleCardClick("/party/join")}
          />

        <Card
          tag="Create"
          title="Play as Master"
          description="Create a party, send the party link or share the code of party. You will play as master"
          onClick={() => handleCardClick("/party/create")}
          />
      </div>
    </main>
  )
}
