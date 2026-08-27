import { useEffect, useState } from 'react';
import { fetchHome, fetchChannels, type Movie, type LiveStream } from './api/backend';
import { Sidebar, type ViewType } from './components/Sidebar';
import { HomeView } from './views/HomeView';
import { ChannelsGrid } from './views/ChannelsGrid';

function App() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [channels, setChannels] = useState<LiveStream[]>([]);
  const [currentView, setCurrentView] = useState<ViewType>('home');

  useEffect(() => {
    fetchHome().then(data => {
      // Flatten the categories so HomeView's groupBy can recreate them, 
      // or we can change HomeView to accept the categorized data directly.
      // For now, flatten it so HomeView works without changes:
      const allMixed = [
        ...data.popular_movies, 
        ...data.popular_series, 
        ...data.animes, 
        ...data.doramas
      ];
      setMovies(allMixed);
    });
    fetchChannels().then(setChannels);
  }, []);

  return (
    <div className="flex h-full bg-[#0A0A0A] text-white overflow-hidden font-sans">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />

      <main className="flex-1 relative overflow-y-auto hide-scrollbar">
        {currentView === 'home' ? (
          <HomeView
            movies={movies}
            channels={channels}
            onViewAllChannels={() => setCurrentView('channels')}
          />
        ) : (
          <ChannelsGrid
            channels={channels}
            onBack={() => setCurrentView('home')}
          />
        )}
      </main>
    </div>
  );
}

export default App;
