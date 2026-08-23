import React from "react";

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="relative min-h-screen bg-[#020617] text-[#dce1fb] font-sans overflow-x-hidden">
      {/* 1. Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#0f172a]/70 backdrop-blur-md h-16 flex items-center justify-between px-6 border-b border-slate-800">
        <div className="flex items-center gap-8">
          <a className="flex items-center gap-2" href="#">
            <span className="material-symbols-outlined text-cyan-400">
              terminal
            </span>
            <span className="font-semibold text-lg text-white">
              API Workbench
            </span>
          </a>
          <div className="hidden lg:flex items-center gap-6 text-sm text-slate-400">
            <a className="hover:text-cyan-400 transition-colors" href="#">
              Product
            </a>
            <a className="hover:text-cyan-400 transition-colors" href="#">
              Features
            </a>
            <a className="hover:text-cyan-400 transition-colors" href="#">
              API Testing
            </a>
            <a className="hover:text-cyan-400 transition-colors" href="#">
              Runner
            </a>
            <a className="hover:text-cyan-400 transition-colors" href="#">
              OpenAPI
            </a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={onGetStarted}
            className="hidden md:flex text-sm text-slate-400 hover:text-white transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={onGetStarted}
            className="bg-cyan-500 text-[#020617] font-bold text-xs px-4 py-2 rounded hover:bg-cyan-400 transition-colors tracking-wider"
          >
            GET STARTED
          </button>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-full px-3 py-1 mb-8">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
          <span className="font-mono text-xs text-cyan-400 tracking-wider">
            API ENGINE ONLINE
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 max-w-4xl tracking-tight leading-tight">
          Build, Test & Automate <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">
            Your APIs.
          </span>
        </h1>

        <p className="text-base md:text-lg text-slate-400 max-w-2xl mb-12 leading-relaxed">
          One powerful workspace for API development, automated testing,
          collections, environments, and real-time execution. Designed for
          high-performance engineering teams.
        </p>

        {/* Hero Visual Mockup */}
        <div className="relative w-full max-w-5xl aspect-[16/9] rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-2xl mt-4">
          {/* Window Bar */}
          <div className="h-8 border-b border-slate-800 flex items-center px-4 gap-2 bg-[#070d1f]">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            <div className="ml-4 flex gap-2">
              <div className="bg-slate-800 px-3 py-0.5 rounded text-xs font-mono text-slate-400 border border-slate-700">
                POST /api/v1/users
              </div>
            </div>
          </div>

          {/* IDE Content */}
          <div className="flex h-[calc(100%-32px)] text-left">
            {/* Sidebar */}
            <div className="w-64 border-r border-slate-800 bg-slate-900 p-3 flex flex-col gap-1">
              <div className="text-[10px] font-bold tracking-wider text-slate-500 px-2 py-1">
                COLLECTIONS
              </div>
              <div className="flex items-center gap-2 px-2 py-1.5 bg-slate-800/80 rounded text-slate-200 text-xs">
                <span className="material-symbols-outlined text-sm text-slate-400">
                  folder
                </span>{" "}
                User Management
              </div>
              <div className="pl-6 flex flex-col gap-1 mt-1 text-xs font-mono">
                <div className="flex items-center gap-2 px-2 py-1 text-slate-400 hover:text-white">
                  <span className="text-emerald-400 bg-emerald-400/10 px-1 rounded text-[10px]">
                    GET
                  </span>{" "}
                  List Users
                </div>
                <div className="flex items-center gap-2 px-2 py-1 text-cyan-400 bg-slate-800 rounded border-l-2 border-cyan-400">
                  <span className="text-amber-400 bg-amber-400/10 px-1 rounded text-[10px]">
                    POST
                  </span>{" "}
                  Create User
                </div>
              </div>
            </div>

            {/* Main Editor */}
            <div className="flex-1 flex flex-col">
              <div className="h-1/2 border-b border-slate-800 p-4">
                <div className="flex gap-2 mb-4">
                  <div className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs font-mono flex items-center gap-2 w-full">
                    <span className="text-amber-400 font-bold">POST</span>
                    <span className="text-slate-200">
                      {"{{base_url}}/api/v1/users"}
                    </span>
                  </div>
                  <button
                    onClick={onGetStarted}
                    className="bg-cyan-500 text-[#020617] px-6 rounded text-xs font-bold hover:bg-cyan-400"
                  >
                    SEND
                  </button>
                </div>

                <div className="flex gap-4 border-b border-slate-800 text-xs text-slate-400 mb-3 pb-1">
                  <span>Params</span>
                  <span>Headers</span>
                  <span className="text-cyan-400 border-b-2 border-cyan-400 pb-1">
                    Body
                  </span>
                  <span>Tests</span>
                </div>

                <div className="font-mono text-xs text-slate-400 space-y-1">
                  <div>
                    <span className="text-amber-400">&#123;</span>
                  </div>
                  <div className="pl-4">
                    <span className="text-cyan-400">"name"</span>:{" "}
                    <span className="text-emerald-400">"Abdulrahman"</span>,
                  </div>
                  <div className="pl-4">
                    <span className="text-cyan-400">"role"</span>:{" "}
                    <span className="text-emerald-400">"admin"</span>
                  </div>
                  <div>
                    <span className="text-amber-400">&#125;</span>
                  </div>
                </div>
              </div>

              {/* Response Panel */}
              <div className="h-1/2 bg-[#070d1f] p-4 relative font-mono text-xs">
                <div className="absolute top-4 right-4 flex gap-3 text-slate-400">
                  <span className="text-emerald-400">201 Created</span>
                  <span>124 ms</span>
                  <span>412 B</span>
                </div>
                <div className="text-[10px] font-bold tracking-wider text-slate-500 mb-2">
                  RESPONSE
                </div>
                <div className="text-slate-400 space-y-1">
                  <div>
                    <span className="text-amber-400">&#123;</span>
                  </div>
                  <div className="pl-4">
                    <span className="text-cyan-400">"id"</span>:{" "}
                    <span className="text-emerald-400">"usr_9x8f7"</span>,
                  </div>
                  <div className="pl-4">
                    <span className="text-cyan-400">"status"</span>:{" "}
                    <span className="text-emerald-400">"active"</span>
                  </div>
                  <div>
                    <span className="text-amber-400">&#125;</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Tech Stack Tags */}
      <section className="py-12 border-y border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-4 text-xs font-mono text-slate-400">
          {[
            "HTTP/REST",
            "GraphQL",
            "WebSocket",
            "OpenAPI 3.0",
            "JavaScript Testing",
            "Environments",
          ].map((tag) => (
            <span
              key={tag}
              className="px-4 py-2 border border-slate-800 rounded-full bg-slate-900"
            >
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-cyan-400">
                terminal
              </span>
              <span className="font-bold text-white">API Workbench</span>
            </div>
            <p className="text-xs text-slate-400">
              High-performance API tooling for modern engineering teams.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-300 mb-3 tracking-wider">
              PRODUCT
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a className="hover:text-cyan-400" href="#">
                  Features
                </a>
              </li>
              <li>
                <a className="hover:text-cyan-400" href="#">
                  Download
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-300 mb-3 tracking-wider">
              RESOURCES
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a className="hover:text-cyan-400" href="#">
                  Documentation
                </a>
              </li>
              <li>
                <a className="hover:text-cyan-400" href="#">
                  API Reference
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-300 mb-3 tracking-wider">
              COMPANY
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a className="hover:text-cyan-400" href="#">
                  About
                </a>
              </li>
              <li>
                <a className="hover:text-cyan-400" href="#">
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};
