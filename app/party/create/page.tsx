'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { generateRoomCode } from '../../../src/backend/room.ts'

export default function CreatePage() {
  const router = useRouter()

  useEffect(() => {
    let isMounted = true

    async function initRoom() {
      try {
        const res = await fetch('/api/party/create');
        const data = await res.json();
        if (isMounted && data.sucess) {
          router.push(data.url)
        }
      } catch (error) {
        console.error('Failed to generate room code:', error)
      }
    }

    initRoom()

    return () => {
      isMounted = false
    }
  }, [router])

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-200 font-sans flex flex-col items-center justify-center p-4">
      {/* Container do Card de Loading */}
      <div className="bg-[#11131c] border border-slate-800/80 rounded-2xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        
        {/* Efeito sutil de brilho de fundo */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Ícone de D20 / Carregamento Animado */}
        <div className="relative w-16 h-16 mb-6 flex items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-inner animate-pulse">
          <svg
            className="w-8 h-8 animate-spin"
            style={{ animationDuration: '3s' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M12 2l9 5v10l-9 5-9-5V7l9-5z"
            />
          </svg>
        </div>

        {/* Textos Temáticos */}
        <span className="text-xs uppercase tracking-widest font-semibold text-amber-500/80 mb-1">
          Tabletop RPG System
        </span>
        <h2 className="text-2xl font-bold font-serif text-amber-500 tracking-wide mb-2">
          Forging the Realm
        </h2>
        <p className="text-sm text-slate-400 leading-relaxed max-w-xs mb-6">
          Preparing your campaign session, generating secure room coordinates, and summoning the party...
        </p>

        {/* Barra de Progresso Estilizada */}
        <div className="w-full bg-[#090a0f] border border-slate-800 h-2 rounded-full overflow-hidden p-0.5">
          <div className="bg-gradient-to-r from-amber-600 via-amber-400 to-amber-500 h-full rounded-full animate-pulse w-3/4" />
        </div>

        <span className="text-[11px] text-slate-500 mt-4 tracking-wider uppercase">
          Please wait a moment
        </span>
      </div>
    </div>
  )
}
