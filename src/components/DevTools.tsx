import { useState } from 'react';
import { Settings, RefreshCw, Trash2, Terminal, FolderOpen, Database, AlertOctagon, X } from 'lucide-react';

export function DevTools() {
  const [isOpen, setIsOpen] = useState(false);
  
  // States for toggles (persisted in localStorage)
  const [hlsDebug, setHlsDebug] = useState(() => localStorage.getItem('DEV_hls_debug') === 'true');
  const [mockData, setMockData] = useState(() => localStorage.getItem('DEV_mock_data') === 'true');
  const [forceErrors, setForceErrors] = useState(() => localStorage.getItem('DEV_force_errors') === 'true');

  const toggleHlsDebug = () => {
    const newVal = !hlsDebug;
    setHlsDebug(newVal);
    localStorage.setItem('DEV_hls_debug', String(newVal));
  };

  const toggleMockData = () => {
    const newVal = !mockData;
    setMockData(newVal);
    localStorage.setItem('DEV_mock_data', String(newVal));
  };

  const toggleForceErrors = () => {
    const newVal = !forceErrors;
    setForceErrors(newVal);
    localStorage.setItem('DEV_force_errors', String(newVal));
  };

  const reloadApp = () => {
    window.location.reload();
  };

  const clearAppState = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  const openAppData = async () => {
    try {
      const { appDataDir } = await import('@tauri-apps/api/path');
      const { open } = await import('@tauri-apps/plugin-shell');
      const dir = await appDataDir();
      await open(dir);
    } catch (error) {
      console.error('Failed to open App Data Dir:', error);
      alert('Could not open App Data Directory. Make sure @tauri-apps/api and @tauri-apps/plugin-shell are properly configured.');
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex flex-col items-center gap-1.5 text-gray-500 hover:text-white transition-colors"
        title="Developer Tools"
      >
        <Settings size={22} />
        <span className="text-[10px] font-medium">Dev</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-96 p-6 shadow-2xl relative">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Settings className="text-purple-500" />
              Developer Tools
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={reloadApp}
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 p-3 rounded-xl text-sm text-gray-200 transition-colors"
                >
                  <RefreshCw size={16} />
                  Reload App
                </button>
                <button 
                  onClick={clearAppState}
                  className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 p-3 rounded-xl text-sm transition-colors"
                >
                  <Trash2 size={16} />
                  Clear State
                </button>
                <button 
                  onClick={openAppData}
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 p-3 rounded-xl text-sm text-gray-200 transition-colors col-span-2"
                >
                  <FolderOpen size={16} />
                  Open App Data Directory
                </button>
              </div>

              <div className="border-t border-white/5 pt-4 space-y-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Toggles (Require Reload)</h3>
                
                <label className="flex items-center justify-between p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <Terminal size={18} className="text-blue-400" />
                    <span className="text-sm text-gray-200">HLS.js Debug Logging</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={hlsDebug} 
                    onChange={toggleHlsDebug}
                    className="accent-purple-500 w-4 h-4 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <Database size={18} className="text-green-400" />
                    <span className="text-sm text-gray-200">Use Mock Data</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={mockData} 
                    onChange={toggleMockData}
                    className="accent-purple-500 w-4 h-4 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <AlertOctagon size={18} className="text-yellow-400" />
                    <span className="text-sm text-gray-200">Force Error States</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={forceErrors} 
                    onChange={toggleForceErrors}
                    className="accent-purple-500 w-4 h-4 cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
