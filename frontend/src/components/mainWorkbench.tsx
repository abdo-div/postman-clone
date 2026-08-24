import React, { useState } from 'react';

interface HeaderItem {
  id: string;
  enabled: boolean;
  key: string;
  value: string;
  description: string;
}

export const MainWorkbench: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'listUsers' | 'login'>('listUsers');
  const [selectedConfigTab, setSelectedConfigTab] = useState<'Params' | 'Headers' | 'Body' | 'Auth' | 'Tests'>('Headers');
  
  // Dynamic headers table state
  const [headers, setHeaders] = useState<HeaderItem[]>([
    { id: '1', enabled: true, key: 'Content-Type', value: 'application/json', description: '' },
    { id: '2', enabled: true, key: 'Authorization', value: 'Bearer {{token}}', description: 'Auth token from env' },
    { id: '3', enabled: true, key: 'Accept', value: 'application/json', description: '' },
    { id: '4', enabled: true, key: 'X-Trace-Id', value: '{{$guid}}', description: '' },
    { id: '5', enabled: false, key: 'Cache-Control', value: 'no-cache', description: '' },
  ]);

  const [newHeader, setNewHeader] = useState({ key: '', value: '', description: '' });

  const handleHeaderChange = (id: string, field: keyof HeaderItem, val: any) => {
    setHeaders(prev => prev.map(h => h.id === id ? { ...h, [field]: val } : h));
  };

  const handleDeleteHeader = (id: string) => {
    setHeaders(prev => prev.filter(h => h.id !== id));
  };

  const handleAddHeader = () => {
    if (newHeader.key.trim() || newHeader.value.trim()) {
      setHeaders(prev => [
        ...prev,
        { id: Date.now().toString(), enabled: true, ...newHeader }
      ]);
      setNewHeader({ key: '', value: '', description: '' });
    }
  };

  return (
    <div className="bg-[#0c1324] text-[#dce1fb] font-sans h-screen w-screen overflow-hidden flex flex-col selection:bg-[#06b6d4] selection:text-[#00424f]">
      {/* Top Navigation Bar */}
      <nav className="bg-[#151b2d] text-[#4cd7f6] border-b border-[#3d494c] flex justify-between items-center w-full px-4 h-12 z-50 shrink-0">
        <div className="flex items-center gap-4">
          <div className="text-[18px] font-bold text-[#4cd7f6] flex items-center gap-2">
            <span className="material-symbols-outlined text-xl">api</span>
            API Workbench
          </div>

          <div className="hidden md:flex items-center gap-2 ml-4 border-l border-[#3d494c] pl-4">
            <div className="flex items-center gap-1 bg-[#070d1f] px-2 py-1 rounded border border-[#3d494c] hover:border-[#4cd7f6] transition-colors cursor-pointer text-[#bcc9cd]">
              <span className="material-symbols-outlined text-[16px]">workspaces</span>
              <span className="text-xs">Main Workspace (Owner)</span>
              <span className="material-symbols-outlined text-[16px]">arrow_drop_down</span>
            </div>
            <div className="flex items-center gap-1 bg-[#070d1f] px-2 py-1 rounded border border-[#3d494c] hover:border-[#4cd7f6] transition-colors cursor-pointer text-[#bcc9cd]">
              <span className="material-symbols-outlined text-[16px]">public</span>
              <span className="text-xs">Production (Active)</span>
              <span className="material-symbols-outlined text-[16px]">arrow_drop_down</span>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-end h-full">
          <a className="text-[#4cd7f6] border-b-2 border-[#4cd7f6] pb-1 px-4 flex items-center h-full pt-1 hover:bg-[#2e3447] transition-colors" href="#">Workspaces</a>
          <a className="text-[#bcc9cd] px-4 flex items-center h-full hover:bg-[#2e3447] transition-colors border-b-2 border-transparent" href="#">Environments</a>
          <a className="text-[#bcc9cd] px-4 flex items-center h-full hover:bg-[#2e3447] transition-colors border-b-2 border-transparent" href="#">History</a>
        </div>

        <div className="flex items-center gap-2">
          <button className="bg-[#191f31] text-[#4cd7f6] border border-[#3d494c] hover:bg-[#2e3447] transition-colors px-3 py-1 rounded text-xs flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">download</span> Import
          </button>
          <button className="bg-[#4cd7f6] text-[#003640] hover:opacity-90 transition-opacity px-3 py-1 rounded text-xs font-bold flex items-center gap-1 shadow-sm">
            <span className="material-symbols-outlined text-[16px]">play_arrow</span> Run Collection
          </button>
          <div className="flex items-center gap-1 ml-2 border-l border-[#3d494c] pl-2">
            <button className="text-[#bcc9cd] hover:text-[#4cd7f6] transition-colors p-1 rounded hover:bg-[#2e3447]"><span className="material-symbols-outlined text-[20px]">settings</span></button>
            <button className="text-[#bcc9cd] hover:text-[#4cd7f6] transition-colors p-1 rounded hover:bg-[#2e3447]"><span className="material-symbols-outlined text-[20px]">help</span></button>
            <button className="text-[#bcc9cd] hover:text-[#4cd7f6] transition-colors p-1 rounded hover:bg-[#2e3447] relative">
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#ffb4ab] rounded-full"></span>
            </button>
          </div>
          <div className="ml-2 w-7 h-7 rounded-full bg-[#571bc1] flex items-center justify-center border border-[#3d494c] cursor-pointer overflow-hidden text-xs font-bold text-white">
            AH
          </div>
        </div>
      </nav>

      {/* Main Workspace Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="bg-[#070d1f] text-[#4cd7f6] h-full w-64 border-r border-[#3d494c] flex flex-col shrink-0 z-40 relative">
          <div className="p-4 border-b border-[#3d494c] shrink-0 flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#2e3447] flex items-center justify-center border border-[#3d494c] shrink-0 text-cyan-400 font-bold">
              W
            </div>
            <div className="overflow-hidden flex-1">
              <div className="text-sm font-semibold text-[#4cd7f6] truncate leading-tight">Main Workspace</div>
              <div className="text-[11px] text-[#bcc9cd] truncate capitalize">Developer Team</div>
            </div>
          </div>

          <div className="flex flex-col gap-1 p-2 shrink-0 border-b border-[#3d494c] text-xs">
            <button className="bg-[#571bc1] text-[#c4abff] rounded-lg px-3 py-2 flex items-center gap-3 w-full text-left font-medium">
              <span className="material-symbols-outlined text-[18px]">folder</span> Collections
            </button>
            <button className="text-[#bcc9cd] px-3 py-2 flex items-center gap-3 w-full text-left hover:bg-[#191f31] rounded-lg transition-colors">
              <span className="material-symbols-outlined text-[18px]">settings_input_component</span> Environments
            </button>
            <button className="text-[#bcc9cd] px-3 py-2 flex items-center gap-3 w-full text-left hover:bg-[#191f31] rounded-lg transition-colors">
              <span className="material-symbols-outlined text-[18px]">history</span> History
            </button>
            <button className="text-[#bcc9cd] px-3 py-2 flex items-center gap-3 w-full text-left hover:bg-[#191f31] rounded-lg transition-colors">
              <span className="material-symbols-outlined text-[18px]">dns</span> Mock Servers
            </button>
          </div>

          {/* Collections Tree */}
          <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1 text-xs">
            <div className="relative mb-2">
              <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-[16px] text-[#bcc9cd]">search</span>
              <input 
                className="w-full bg-[#191f31] border border-[#3d494c] rounded pl-8 pr-2 py-1 text-[#dce1fb] focus:border-[#4cd7f6] focus:outline-none text-xs" 
                placeholder="Filter collections..." 
                type="text"
              />
            </div>

            <div className="flex flex-col gap-0.5">
              {/* Folder: Auth */}
              <div className="group">
                <div className="flex items-center gap-1.5 px-2 py-1 hover:bg-[#191f31] rounded cursor-pointer text-[#dce1fb]">
                  <span className="material-symbols-outlined text-[16px] text-[#bcc9cd]">keyboard_arrow_down</span>
                  <span className="material-symbols-outlined text-[16px] text-[#bcc9cd]">folder</span>
                  <span className="flex-1 truncate">Auth</span>
                </div>
                <div className="pl-6 flex flex-col gap-0.5 mt-0.5">
                  <div 
                    onClick={() => setActiveTab('login')}
                    className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer ${activeTab === 'login' ? 'bg-[#2e3447] text-white font-semibold' : 'hover:bg-[#191f31] text-[#bcc9cd]'}`}
                  >
                    <span className="font-mono text-[10px] font-bold text-[#d0bcff] bg-[#d0bcff]/10 px-1 rounded w-[38px] text-center shrink-0">POST</span>
                    <span className="truncate">Login</span>
                  </div>
                </div>
              </div>

              {/* Folder: Users */}
              <div className="group mt-1">
                <div className="flex items-center gap-1.5 px-2 py-1 hover:bg-[#191f31] rounded cursor-pointer text-[#dce1fb]">
                  <span className="material-symbols-outlined text-[16px] text-[#bcc9cd]">keyboard_arrow_down</span>
                  <span className="material-symbols-outlined text-[16px] text-[#bcc9cd]">folder</span>
                  <span className="flex-1 truncate">Users</span>
                </div>
                <div className="pl-6 flex flex-col gap-0.5 mt-0.5">
                  <div 
                    onClick={() => setActiveTab('listUsers')}
                    className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer ${activeTab === 'listUsers' ? 'bg-[#2e3447] text-white font-semibold' : 'hover:bg-[#191f31] text-[#bcc9cd]'}`}
                  >
                    <span className="font-mono text-[10px] font-bold text-[#4cd7f6] bg-[#4cd7f6]/10 px-1 rounded w-[38px] text-center shrink-0">GET</span>
                    <span className="truncate">List Users</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-2 border-t border-[#3d494c] shrink-0 flex flex-col gap-2">
            <button className="bg-[#191f31] border border-[#3d494c] text-[#dce1fb] text-xs py-1.5 px-3 rounded hover:border-[#4cd7f6] hover:text-[#4cd7f6] transition-colors flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[18px]">add</span> New Collection
            </button>
          </div>
        </aside>

        {/* Main Editor Canvas */}
        <main className="flex-1 flex flex-col bg-[#0c1324] overflow-hidden min-w-0">
          {/* Tabs Header */}
          <div className="flex items-end h-[36px] bg-[#070d1f] shrink-0 overflow-x-auto border-b border-[#3d494c]">
            <div 
              onClick={() => setActiveTab('listUsers')}
              className={`h-full px-4 flex items-center gap-2 min-w-[140px] cursor-pointer relative border-r border-[#3d494c] ${activeTab === 'listUsers' ? 'bg-[#151b2d] border-t-2 border-[#4cd7f6]' : 'bg-[#070d1f] text-[#bcc9cd]'}`}
            >
              <span className="font-mono text-[10px] font-bold text-[#4cd7f6]">GET</span>
              <span className="text-xs font-medium truncate pr-4">List Users</span>
            </div>
            <div 
              onClick={() => setActiveTab('login')}
              className={`h-full px-4 flex items-center gap-2 min-w-[140px] cursor-pointer relative border-r border-[#3d494c] ${activeTab === 'login' ? 'bg-[#151b2d] border-t-2 border-[#4cd7f6]' : 'bg-[#070d1f] text-[#bcc9cd]'}`}
            >
              <span className="font-mono text-[10px] font-bold text-[#d0bcff]">POST</span>
              <span className="text-xs font-medium truncate pr-4">Login</span>
            </div>
          </div>

          {/* Request Bar */}
          <div className="p-2 bg-[#151b2d] border-b border-[#3d494c] flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1 bg-[#191f31] px-3 py-1.5 rounded border border-[#3d494c] cursor-pointer text-xs font-bold text-[#4cd7f6] h-[34px]">
              {activeTab === 'listUsers' ? 'GET' : 'POST'}
              <span className="material-symbols-outlined text-[16px] text-[#bcc9cd]">arrow_drop_down</span>
            </div>
            <div className="flex-1 flex items-center bg-[#0c1324] border border-[#3d494c] rounded h-[34px] focus-within:border-[#4cd7f6] overflow-hidden">
              <div className="pl-3 pr-2 text-[#bcc9cd] font-mono text-xs opacity-60">https://</div>
              <input 
                className="flex-1 bg-transparent border-none text-[#dce1fb] font-mono text-xs focus:outline-none" 
                defaultValue={activeTab === 'listUsers' ? 'api.example.com/v1/users' : 'api.example.com/v1/auth/login'} 
                type="text"
              />
            </div>
            <button className="bg-[#4cd7f6] text-[#003640] text-xs font-bold px-6 rounded h-[34px] hover:opacity-90 transition-opacity flex items-center gap-1 shrink-0">
              SEND <span className="material-symbols-outlined text-[16px]">send</span>
            </button>
          </div>

          {/* Workspace Panes */}
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* TOP PANE: Request Config */}
            <div className="flex flex-col flex-1 overflow-hidden bg-[#151b2d]">
              <div className="flex items-center border-b border-[#3d494c] px-2 shrink-0 pt-1 text-xs">
                {(['Params', 'Headers', 'Body', 'Auth', 'Tests'] as const).map((tab) => (
                  <button 
                    key={tab}
                    onClick={() => setSelectedConfigTab(tab)}
                    className={`px-4 py-2 font-medium border-b-2 transition-colors ${selectedConfigTab === tab ? 'text-[#4cd7f6] border-[#4cd7f6]' : 'text-[#bcc9cd] border-transparent hover:text-white'}`}
                  >
                    {tab} {tab === 'Headers' && <span className="bg-[#2e3447] text-white px-1.5 rounded-full text-[10px] ml-1">{headers.length}</span>}
                  </button>
                ))}
              </div>

              {/* Headers Spreadsheet Table */}
              <div className="flex-1 overflow-auto p-3">
                <table className="w-full text-left border-collapse border border-[#3d494c] bg-[#0c1324]">
                  <thead>
                    <tr className="bg-[#191f31] text-xs text-[#bcc9cd]">
                      <th className="w-8 border border-[#3d494c] text-center"></th>
                      <th className="border border-[#3d494c] py-1.5 px-2 font-mono">Key</th>
                      <th className="border border-[#3d494c] py-1.5 px-2 font-mono">Value</th>
                      <th className="border border-[#3d494c] py-1.5 px-2 font-mono">Description</th>
                      <th className="w-8 border border-[#3d494c] text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="font-mono text-xs">
                    {headers.map((row) => (
                      <tr key={row.id} className="hover:bg-[#2e3447]/50 group">
                        <td className="border border-[#3d494c] text-center align-middle">
                          <input 
                            type="checkbox" 
                            checked={row.enabled}
                            onChange={(e) => handleHeaderChange(row.id, 'enabled', e.target.checked)}
                            className="rounded border-[#3d494c] bg-[#070d1f] text-[#4cd7f6] focus:ring-0 w-3 h-3"
                          />
                        </td>
                        <td className="border border-[#3d494c] p-0">
                          <input 
                            className={`w-full bg-transparent border-none px-2 py-1 focus:outline-none ${!row.enabled && 'opacity-40'}`} 
                            value={row.key} 
                            onChange={(e) => handleHeaderChange(row.id, 'key', e.target.value)}
                          />
                        </td>
                        <td className="border border-[#3d494c] p-0">
                          <input 
                            className={`w-full bg-transparent border-none px-2 py-1 focus:outline-none text-[#adc6ff] ${!row.enabled && 'opacity-40'}`} 
                            value={row.value} 
                            onChange={(e) => handleHeaderChange(row.id, 'value', e.target.value)}
                          />
                        </td>
                        <td className="border border-[#3d494c] p-0">
                          <input 
                            className={`w-full bg-transparent border-none px-2 py-1 focus:outline-none text-[#bcc9cd] ${!row.enabled && 'opacity-40'}`} 
                            value={row.description} 
                            placeholder="Description"
                            onChange={(e) => handleHeaderChange(row.id, 'description', e.target.value)}
                          />
                        </td>
                        <td className="border border-[#3d494c] text-center align-middle opacity-0 group-hover:opacity-100">
                          <span 
                            onClick={() => handleDeleteHeader(row.id)}
                            className="material-symbols-outlined text-[16px] text-[#bcc9cd] hover:text-[#ffb4ab] cursor-pointer"
                          >
                            delete
                          </span>
                        </td>
                      </tr>
                    ))}
                    {/* Input Row for New Header */}
                    <tr>
                      <td className="border border-[#3d494c]"></td>
                      <td className="border border-[#3d494c] p-0">
                        <input 
                          className="w-full bg-transparent border-none px-2 py-1 focus:outline-none text-[#bcc9cd]" 
                          placeholder="Key" 
                          value={newHeader.key}
                          onChange={(e) => setNewHeader({ ...newHeader, key: e.target.value })}
                          onBlur={handleAddHeader}
                        />
                      </td>
                      <td className="border border-[#3d494c] p-0">
                        <input 
                          className="w-full bg-transparent border-none px-2 py-1 focus:outline-none text-[#bcc9cd]" 
                          placeholder="Value" 
                          value={newHeader.value}
                          onChange={(e) => setNewHeader({ ...newHeader, value: e.target.value })}
                          onBlur={handleAddHeader}
                        />
                      </td>
                      <td className="border border-[#3d494c] p-0">
                        <input 
                          className="w-full bg-transparent border-none px-2 py-1 focus:outline-none text-[#bcc9cd]" 
                          placeholder="Description" 
                          value={newHeader.description}
                          onChange={(e) => setNewHeader({ ...newHeader, description: e.target.value })}
                          onBlur={handleAddHeader}
                        />
                      </td>
                      <td className="border border-[#3d494c]"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Resizer Divider */}
            <div className="h-[2px] bg-[#3d494c] w-full cursor-row-resize hover:bg-[#4cd7f6] shrink-0"></div>

            {/* BOTTOM PANE: Response Inspector */}
            <div className="flex flex-col flex-1 overflow-hidden bg-[#191f31]">
              <div className="flex items-center justify-between border-b border-[#3d494c] px-4 py-2 shrink-0 bg-[#070d1f]">
                <div className="flex items-center gap-4">
                  <h3 className="text-sm font-semibold text-[#dce1fb]">Response</h3>
                  <div className="flex items-center gap-3 font-mono text-xs">
                    <span className="text-[#4cd7f6] font-bold">200 OK</span>
                    <span className="text-[#bcc9cd] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">timer</span> 142ms
                    </span>
                    <span className="text-[#bcc9cd] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">sd_storage</span> 1.2KB
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-[#bcc9cd] hover:text-white p-1 rounded hover:bg-[#191f31]"><span className="material-symbols-outlined text-[18px]">content_copy</span></button>
                  <button className="text-[#bcc9cd] hover:text-white p-1 rounded hover:bg-[#191f31]"><span className="material-symbols-outlined text-[18px]">search</span></button>
                </div>
              </div>

              {/* JSON Response Preview */}
              <div className="flex-1 overflow-auto p-4 bg-[#0c1324] font-mono text-xs leading-relaxed">
                <div><span className="text-[#bcc9cd]">&#123;</span></div>
                <div className="pl-4"><span className="text-[#4cd7f6]">"status"</span>: <span className="text-[#adc6ff]">"success"</span>,</div>
                <div className="pl-4"><span className="text-[#4cd7f6]">"data"</span>: <span className="text-[#bcc9cd]">[</span></div>
                <div className="pl-8"><span className="text-[#bcc9cd]">&#123;</span></div>
                <div className="pl-12"><span className="text-[#4cd7f6]">"id"</span>: <span className="text-[#d0bcff]">101</span>,</div>
                <div className="pl-12"><span className="text-[#4cd7f6]">"name"</span>: <span className="text-[#adc6ff]">"Abdulrahman"</span>,</div>
                <div className="pl-12"><span className="text-[#4cd7f6]">"role"</span>: <span className="text-[#adc6ff]">"Lead Engineer"</span></div>
                <div className="pl-8"><span className="text-[#bcc9cd]">Key</span>&#125;</div>
                <div className="pl-4"><span className="text-[#bcc9cd]">]</span></div>
                <div><span className="text-[#bcc9cd]">&#125;</span></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};