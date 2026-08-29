import { useEffect, useState } from 'react';
import { fetchHome, fetchChannels, type LiveStream, type HomeData, type Movie } from './api/backend';
import { Sidebar, type ViewType } from './components/Sidebar';
import { HomeView } from './views/HomeView';
import { ChannelsGrid } from './views/ChannelsGrid';
import { MoviesGrid } from './views/MoviesGrid';

export type AppView = 
  | { type: 'home' } 
  | { type: 'channels' }
  | { type: 'category'; title: string; categoryFilter: string | undefined; isSeries: boolean; initialMovies: Movie[] };

function App() {
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [channels, setChannels] = useState<LiveStream[]>([]);
  const [currentView, setCurrentView] = useState<AppView>({ type: 'home' });

  useEffect(() => {
    fetchHome().then(setHomeData);
    fetchChannels().then(setChannels);
  }, []);

  const handleSidebarChange = (view: ViewType) => {
    if (view === 'channels') setCurrentView({ type: 'channels' });
    else setCurrentView({ type: 'home' });
  };

  return (
    <div className="flex h-full bg-[#0A0A0A] text-white overflow-hidden font-sans">
      <Sidebar 
        currentView={currentView.type === 'channels' ? 'channels' : 'home'} 
        onViewChange={handleSidebarChange} 
      />

      <main className="flex-1 relative overflow-hidden">
        <div className={`absolute inset-0 overflow-y-auto hide-scrollbar ${currentView.type === 'home' ? 'block' : 'hidden'}`}>
          <HomeView
            homeData={homeData}
            channels={channels}
            onViewAllChannels={() => setCurrentView({ type: 'channels' })}
            onViewCategory={(title, categoryFilter, isSeries, initialMovies) => setCurrentView({ type: 'category', title, categoryFilter, isSeries, initialMovies })}
          />
        </div>
        <div className={`absolute inset-0 overflow-y-auto hide-scrollbar ${currentView.type === 'channels' ? 'block' : 'hidden'}`}>
          <ChannelsGrid
            channels={channels}
            onBack={() => setCurrentView({ type: 'home' })}
          />
        </div>
        <div className={`absolute inset-0 overflow-y-auto hide-scrollbar ${currentView.type === 'category' ? 'block' : 'hidden'}`}>
          {currentView.type === 'category' && (
            <MoviesGrid
              title={currentView.title}
              categoryFilter={currentView.categoryFilter}
              isSeries={currentView.isSeries}
              initialMovies={currentView.initialMovies}
              onBack={() => setCurrentView({ type: 'home' })}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
