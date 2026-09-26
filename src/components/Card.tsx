interface CardProps {
  title: string;
  description: string;
  tag: string;
  onClick?: () => void;
}

export function Card({ title, description, tag, onClick }: CardProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-indigo-500 transition-all duration-300 shadow-lg" onClick={onClick}>
      <span className="inline-block text-xs font-semibold tracking-wider text-indigo-400 uppercase bg-indigo-500/10 px-2.5 py-1 rounded-full mb-3">
        {tag}
      </span>
      <h3 className="from-red-400 via-amber-300 to-red-400 tracking-wide notranslate text-transparent bg-clip-text bg-gradient-to-r font-serif font-extrabold text-2xl md:text-4xl">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}