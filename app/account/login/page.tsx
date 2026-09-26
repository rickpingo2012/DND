import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full bg-neutral-950 text-amber-50 flex items-center justify-center p-4 selection:bg-amber-500 selection:text-neutral-950">
      {/* Background glow effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-red-900/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-600/15 rounded-full blur-3xl" />
      </div>

      {/* Main Container Card */}
      <div className="relative w-full max-w-md bg-neutral-900/80 backdrop-blur-md border border-amber-500/30 rounded-2xl p-8 shadow-2xl shadow-amber-950/20">
        
        {/* Subtle Top Red Accent Line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-red-600 via-amber-500 to-red-600 rounded-b-full shadow-sm shadow-red-500/50" />

        {/* Header */}
        <div className="text-center mb-8 mt-2">
          <h1 className="text-3xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 uppercase">
            Login Account
          </h1>
          <p className="text-sm text-neutral-400 mt-2">
            Enter your credentials to access your account
          </p>
        </div>

        {/* Form Visual Elements */}
        <div className="space-y-5">
          
          {/* Nickname Field */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-amber-400/90 mb-1.5">
              Nickname
            </label>
            <input
              type="text"
              placeholder="ShadowWalker"
              className="w-full px-4 py-3 bg-neutral-950/70 border border-neutral-800 rounded-lg text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200"
            />
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-amber-400/90">
                Password
              </label>
              <a
                href="#"
                className="text-xs text-neutral-400 hover:text-amber-400 transition-colors"
              >
                Forgot?
              </a>
            </div>
            <input
              type="password"
              placeholder="••••••••••••"
              className="w-full px-4 py-3 bg-neutral-950/70 border border-neutral-800 rounded-lg text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200"
            />
          </div>

          {/* Submit Button */}
          <button
            type="button"
            className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-neutral-950 font-bold uppercase tracking-wider rounded-lg shadow-lg shadow-amber-900/30 border border-amber-400/50 hover:shadow-amber-500/20 active:scale-[0.99] transition-all duration-200 cursor-pointer"
          >
            Sign In
          </button>
        </div>

        {/* Footer / Link to Register */}
        <div className="mt-8 text-center text-sm text-neutral-400">
          Don't have an account?{' '}
          <Link
            href="/account/signup"
            className="text-red-500 hover:text-red-400 font-semibold underline underline-offset-4 decoration-red-500/50 hover:decoration-red-400 transition-colors"
          >
            Create One
          </Link>
        </div>

      </div>
    </div>
  );
}
