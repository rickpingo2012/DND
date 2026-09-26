interface NotificationProps {
  message: string;
}

export function Notification({ message }: NotificationProps) {
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      
      {/* Toast Notification Card */}
      <div className="pointer-events-auto relative overflow-hidden bg-neutral-900/95 backdrop-blur-md border border-amber-500/40 rounded-xl p-4 shadow-xl shadow-black/60 animate-bounce-once">
        
        {/* Glow indicator on the side */}
        <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 via-red-500 to-amber-600" />

        <div className="flex items-start gap-3 pl-2">
          {/* Icon Container */}
          <div className="flex-shrink-0 p-2 bg-neutral-950 border border-amber-500/30 rounded-lg text-amber-400">
            {/* Bell / Alert Icon */}
            <svg
              className="w-5 h-5 text-amber-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </div>

          {/* Message Content */}
          <div className="flex-1 min-w-0 pr-2">
            <h4 className="text-sm font-bold tracking-wide uppercase text-amber-300">
              System Notification
            </h4>
            <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
              {message}
            </p>
          </div>

          {/* Close Button Visual */}
          <button
            type="button"
            className="flex-shrink-0 text-neutral-500 hover:text-red-400 transition-colors p-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Animated Progress Bar (Timer indicator) */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-800">
          <div className="h-full bg-gradient-to-r from-amber-500 via-red-500 to-amber-500 w-full animate-[shrink_4s_linear_forwards]" />
        </div>

      </div>

    </div>
  );
}
