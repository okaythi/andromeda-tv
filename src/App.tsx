import { Home, Compass, Users, User, Search, Mic, Bell, Play, Plus, Eye } from 'lucide-react';

function App() {
  return (
    <div className="flex h-screen bg-[#0A0A0A] text-white overflow-hidden font-sans">
      
      {/* Sidebar */}
      <aside className="w-24 flex flex-col items-center py-8 bg-[#0A0A0A] z-20 border-r border-white/5">
        {/* Logo */}
        <div className="mb-12">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-red-500 rounded-xl flex items-center justify-center transform rotate-45">
            <Play size={20} className="text-white -rotate-45 ml-1" fill="currentColor" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-8 w-full px-4">
          <button className="flex flex-col items-center gap-1.5 text-white bg-white/10 py-3 rounded-2xl">
            <Home size={22} />
            <span className="text-[10px] font-medium">Home</span>
          </button>
          <button className="flex flex-col items-center gap-1.5 text-gray-500 hover:text-white transition-colors">
            <Compass size={22} />
            <span className="text-[10px] font-medium">Discover</span>
          </button>
          <button className="flex flex-col items-center gap-1.5 text-gray-500 hover:text-white transition-colors">
            <Users size={22} />
            <span className="text-[10px] font-medium">Social</span>
          </button>
          <button className="flex flex-col items-center gap-1.5 text-gray-500 hover:text-white transition-colors mt-auto">
            <User size={22} />
            <span className="text-[10px] font-medium">Profile</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto hide-scrollbar">
        
        {/* Hero Background Image */}
        <div className="absolute top-0 left-0 w-full h-[70vh] z-0">
          <img 
            src="https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=2072&auto=format&fit=crop" 
            alt="Hero Background" 
            className="w-full h-full object-cover"
          />
          {/* Gradient Overlays for smooth blending */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
        </div>

        {/* Top Bar (Search & Notifications) */}
        <header className="relative z-10 flex justify-between items-center px-12 py-8">
          <h1 className="text-2xl font-bold tracking-tight">Andromeda TV</h1>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 w-80">
              <input 
                type="text" 
                placeholder="Search" 
                className="bg-transparent border-none outline-none text-sm w-full placeholder:text-gray-400 text-white"
              />
              <Mic size={16} className="text-gray-400 mx-2 cursor-pointer hover:text-white" />
              <Search size={16} className="text-gray-400 cursor-pointer hover:text-white" />
            </div>
            <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-colors">
              <Bell size={18} />
            </button>
          </div>
        </header>

        {/* Hero Content */}
        <div className="relative z-10 px-12 pt-12 pb-16 max-w-2xl">
          <h2 className="text-6xl font-bold mb-4 tracking-tight">Orbiting Sounds</h2>
          <p className="text-gray-300 text-sm leading-relaxed mb-8 max-w-lg">
            A gripping sci-fi series about a lone astronaut and market the description of the sound dramas and can control them and could vint them sometimes.
          </p>
          
          <div className="flex items-center gap-4">
            <button className="flex items-center justify-center gap-2 bg-white hover:bg-gray-200 text-black px-8 py-3 rounded-xl font-semibold transition-colors">
              <Play size={18} fill="currentColor" />
              Play
            </button>
            <button className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white px-8 py-3 rounded-xl font-semibold transition-colors">
              <Plus size={18} />
              Add to Watchlist
            </button>
          </div>
        </div>

        {/* Content Rows */}
        <div className="relative z-10 px-12 pb-24 space-y-12 bg-gradient-to-b from-transparent to-[#0A0A0A]">
          
          {/* Trending Live Streams */}
          <section>
            <h3 className="text-xl font-semibold mb-4">Trending Live Streams</h3>
            <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 -mx-12 px-12">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="min-w-[280px] group cursor-pointer">
                  <div className="w-full h-[160px] rounded-2xl overflow-hidden relative mb-3">
                    <img 
                      src={`https://images.unsplash.com/photo-1541873676-a18131494184?q=80&w=600&auto=format&fit=crop&sig=${i}`} 
                      alt="Thumbnail" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Live Badge */}
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      LIVE
                    </div>
                    {/* Viewers */}
                    <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-medium px-2 py-1 rounded flex items-center gap-1">
                      <Eye size={12} />
                      19.3K
                    </div>
                  </div>
                  <h4 className="font-medium text-sm text-white group-hover:text-red-400 transition-colors">Orbiting Sounds</h4>
                  <p className="text-xs text-gray-500 mt-1">Homan Under</p>
                </div>
              ))}
            </div>
          </section>

          {/* Bottom Grid: Curated & Community */}
          <div className="grid grid-cols-3 gap-8">
            <section className="col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Curated For You</h3>
              </div>
              <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="min-w-[200px] h-[120px] rounded-2xl overflow-hidden relative cursor-pointer group">
                    <img 
                      src={`https://images.unsplash.com/photo-1618172193622-ae2d025f4032?q=80&w=400&auto=format&fit=crop&sig=${i+10}`} 
                      alt="Curated" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ))}
              </div>
            </section>
            
            <section className="col-span-1">
              <h3 className="text-xl font-semibold mb-4">Community Events</h3>
              <div className="w-full h-[120px] rounded-2xl overflow-hidden relative cursor-pointer group">
                <img 
                  src="https://images.unsplash.com/photo-1470229722913-7c092bba85f1?q=80&w=400&auto=format&fit=crop" 
                  alt="Events" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
                  <h4 className="font-medium text-sm text-white">Community Events</h4>
                  <p className="text-xs text-gray-400 mt-1">Jan. 8 - 18, 2024</p>
                </div>
              </div>
            </section>
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;
