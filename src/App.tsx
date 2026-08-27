import { useEffect, useState } from 'react';
import { fetchHome, fetchChannels, type LiveStream, type HomeData } from './api/backend';
import { Sidebar, type ViewType } from './components/Sidebar';
import { HomeView } from './views/HomeView';
import { ChannelsGrid } from './views/ChannelsGrid';

function App() {
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [channels, setChannels] = useState<LiveStream[]>([]);
  const [currentView, setCurrentView] = useState<ViewType>('home');

  useEffect(() => {
    fetchHome().then(setHomeData);
    fetchChannels().then(setChannels);
  }, []);

  return (
    <div className="flex h-full bg-[#0A0A0A] text-white overflow-hidden font-sans">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />

      <main className="flex-1 relative overflow-y-auto hide-scrollbar">
        {currentView === 'home' ? (
          <HomeView
            homeData={homeData}
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
