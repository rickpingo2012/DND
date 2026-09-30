interface CardProps {
  title: string;
  description: string;
  tag: string;
  onClick?: () => void;
}

export function Card2({ title, description, tag, onClick }: CardProps) {
  return (
    <button
      onClick={onClick}
      className="bg-neutral-900/80 backdrop-blur-md border border-amber-500/30 hover:border-amber-400 rounded-xl p-6 transition-all duration-300 shadow-xl shadow-black/40 hover:shadow-amber-500/10 hover:-translate-y-1 cursor-pointer group relative overflow-hidden"
    >
      {/* Indicator line accent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <span className="inline-block text-xs font-semibold tracking-wider text-amber-400 uppercase bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full mb-3">
        {tag}
      </span>
      
      <h3 className="tracking-wide notranslate text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 font-serif font-extrabold text-2xl md:text-3xl mb-2">
        {title}
      </h3>
      
      <p className="text-neutral-400 text-sm leading-relaxed">
        {description}
      </p>

      <div className="mt-4 flex items-center text-xs font-bold uppercase tracking-wider text-red-400 group-hover:text-red-300 transition-colors">
        Read Book &rarr;
      </div>
    </button>
  );
}