import { Home, Tv, Radio, Search, User, Play, Info, Flame } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="flex items-center justify-between px-8 py-4">
        {/* Left - Navigation links */}
        <div className="flex items-center bg-surface/50 rounded-full px-2 py-2 gap-2 border border-white/5 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
          <button className="flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-full font-medium shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            <Home size={18} />
            <span>Inicio</span>
          </button>
          
          <button className="flex items-center gap-2 text-gray-400 hover:text-white px-6 py-2.5 rounded-full font-medium transition-colors">
            <Tv size={18} />
            <span>TV ao Vivo</span>
          </button>

          <button className="flex items-center gap-2 text-gray-400 hover:text-white px-6 py-2.5 rounded-full font-medium transition-colors">
            <Radio size={18} />
            <span>Eventos ao Vivo</span>
            <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ml-1">Ao Vivo</span>
          </button>
        </div>

        {/* Right - Search & Profile */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-gray-400 bg-surface/50 px-6 py-2.5 rounded-full border border-white/5">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Buscar..." 
              className="bg-transparent border-none outline-none text-sm w-32 placeholder:text-gray-500 text-white"
            />
          </div>
          <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors pr-4">
            <User size={18} />
            <span className="font-medium">Visitante</span>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="px-16 pt-12 pb-24 relative">
        {/* Background Gradient (simulating the red glow from the screenshot) */}
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="flex items-start justify-between max-w-7xl mx-auto">
          {/* Left Content */}
          <div className="max-w-2xl mt-16">
            <div className="flex items-center gap-3 mb-6">
              <span className="flex items-center gap-1.5 bg-primary/20 text-primary border border-primary/30 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-[0_0_15px_rgba(255,42,66,0.3)]">
                <Flame size={14} className="fill-primary" /> LANÇAMENTO DE CINEMA
              </span>
              <span className="bg-surface border border-white/10 text-gray-300 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide">
                AVENTURA, AÇÃO, DRAMA
              </span>
            </div>

            <h1 className="text-6xl font-black text-white leading-[1.1] mb-6 tracking-tight">
              A MORTE DE ROBIN<br />HOOD [Brazuca]
            </h1>

            <div className="flex items-center gap-4 text-sm font-medium text-gray-400 mb-6">
              <span className="flex items-center text-yellow-500 font-bold">
                <span className="mr-1">★</span> 6.6 IMDb
              </span>
              <span>•</span>
              <span>2026</span>
              <span>•</span>
              <span className="bg-white/10 text-white px-2 py-0.5 rounded text-xs">4K ULTRA HD</span>
              <span>•</span>
              <span className="bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded text-xs">DUAL ÁUDIO</span>
            </div>

            <p className="text-gray-400 text-sm leading-relaxed mb-10 max-w-xl">
              Atormentado pelas cicatrizes de uma vida marcada pelo crime, Robin Hood sobrevive por 
              pouco àquela que acreditava ser sua batalha final. Gravemente ferido, ele é encontrado por 
              uma mulher misteriosa que o recolhe das sombras e passa a cuidar de seus ferimentos. Com o...
            </p>

            <div className="flex items-center gap-4">
              <button className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-8 py-3.5 rounded-full font-bold shadow-[0_0_25px_rgba(255,42,66,0.4)] transition-all transform hover:scale-105">
                <Play size={20} className="fill-white" />
                Assistir Agora
              </button>
              <button className="flex items-center justify-center gap-2 bg-surface hover:bg-surface/80 border border-white/10 text-white px-8 py-3.5 rounded-full font-bold transition-all">
                <Info size={20} />
                Ver Detalhes
              </button>
            </div>
          </div>

          {/* Right Poster Placeholder */}
          <div className="mr-12 relative group mt-8">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="w-[340px] h-[520px] bg-[#0f0f14] border border-white/5 rounded-3xl shadow-2xl relative z-10 overflow-hidden">
               {/* This is where the movie poster image goes */}
            </div>
          </div>
        </div>

        {/* Categories Row */}
        <div className="max-w-7xl mx-auto mt-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-6 bg-white rounded-full" />
            <h2 className="text-xl font-bold text-white">Filmes de Cinema & Lançamentos</h2>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
            {/* Placeholder cards */}
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="min-w-[160px] h-[240px] bg-surface border border-white/5 rounded-2xl relative group cursor-pointer hover:border-white/20 transition-all">
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                  4K
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
