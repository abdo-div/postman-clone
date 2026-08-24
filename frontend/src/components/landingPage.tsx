import React, { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  Activity,
  BookOpen,
  Braces,
  Check,
  ChevronDown,
  ChevronRight,
  CircleCheckBig,
  Clock,
  Code,
  FlaskConical,
  Folder,
  FolderOpen,
  Globe,
  Layers,
  PenTool,
  Plus,
  Rocket,
  Send,
  SquareActivity,
  SquareCheck,
  SquareTerminal,
  Terminal,
  Users,
} from "lucide-react";

interface LandingPageProps {
  onGetStarted?: () => void;
}

const V = ({ children }: { children: ReactNode }) => (
  <span className="text-violet-neon">{children}</span>
);
const E = ({ children }: { children: ReactNode }) => (
  <span className="text-emerald-400">{children}</span>
);
const C = ({ children }: { children: ReactNode }) => (
  <span className="text-cyan-electric">{children}</span>
);
const O = ({ children }: { children: ReactNode }) => (
  <span className="text-orange-400">{children}</span>
);

const Line = ({ children }: { children?: ReactNode }) => (
  <span className="block whitespace-pre">{children === undefined ? "\u00A0" : children}</span>
);

const Gutter = ({ lines }: { lines: number[] }) => (
  <div className="w-4 shrink-0 select-none text-right text-outline">
    {lines.map((n) => (
      <span key={n} className="block">
        {n}
      </span>
    ))}
  </div>
);

const GithubIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
  </svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = ["Product", "Features", "API Testing", "Runner", "OpenAPI"];

  const features = [
    {
      icon: Send,
      title: "API Client",
      desc: "Powerful request/response builder with multi-protocol support.",
      accent: "cyan",
    },
    {
      icon: FlaskConical,
      title: "API Testing",
      desc: "Automated JavaScript assertions and diagnostic results.",
      accent: "violet",
    },
    {
      icon: Layers,
      title: "Collections",
      desc: "Organized hierarchical workspace for teams.",
      accent: "cyan",
    },
    {
      icon: Globe,
      title: "Environments",
      desc: "Dynamic variable management across infrastructure stages.",
      accent: "violet",
    },
    {
      icon: Terminal,
      title: "Mock Servers",
      desc: "Design and test APIs before implementation.",
      accent: "cyan",
    },
    {
      icon: BookOpen,
      title: "Documentation",
      desc: "Auto-generated, interactive API documentation.",
      accent: "violet",
    },
    {
      icon: Activity,
      title: "Monitors",
      desc: "Scheduled collection runs to ensure uptime.",
      accent: "cyan",
    },
    {
      icon: Users,
      title: "Public Network",
      desc: "Share and discover public APIs.",
      accent: "violet",
    },
  ];

  const lifecycle = [
    { icon: PenTool, title: "Design", desc: "OpenAPI specs and mock servers" },
    { icon: Terminal, title: "Build", desc: "Powerful request client and debugging", active: true },
    { icon: SquareCheck, title: "Test", desc: "Automated test suites and CI integration" },
    { icon: Rocket, title: "Deploy", desc: "Publish docs and manage versions" },
    { icon: SquareActivity, title: "Monitor", desc: "Scheduled runs and performance tracking" },
  ];

  return (
    <div className="landing relative min-h-screen grid-bg-fine overflow-x-hidden bg-obsidian font-sans text-on-surface selection:bg-cyan-electric selection:text-obsidian">
      {/* Sticky Glass Nav */}
      <nav
        id="navbar"
        className={`glass-nav fixed top-0 z-50 flex h-16 w-full items-center justify-between px-6 ${
          scrolled ? "scrolled" : ""
        }`}
      >
        <div className="flex items-center gap-8">
          <a className="group flex items-center gap-2" href="#">
            <SquareTerminal className="h-5 w-5 text-cyan-electric" />
            <span className="font-display text-lg font-bold text-on-surface transition-colors group-hover:text-cyan-electric">
              API Workbench
            </span>
          </a>
          <div className="hidden items-center gap-6 lg:flex">
            {navLinks.map((link) => (
              <a
                key={link}
                href="#"
                className="text-sm font-medium text-on-surface-variant transition-colors hover:text-on-surface"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-5">
          <a
            href="#"
            className="hidden text-sm font-medium text-on-surface-variant transition-colors hover:text-on-surface md:flex"
          >
            GitHub
          </a>
          <button
            onClick={onGetStarted}
            className="hidden cursor-pointer text-sm font-medium text-on-surface-variant transition-colors hover:text-on-surface md:flex"
          >
            Sign In
          </button>
          <button
            onClick={onGetStarted}
            className="cursor-pointer rounded-md bg-cyan-electric px-5 py-2.5 text-xs font-bold tracking-wider text-obsidian shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all hover:bg-[#08c9ea]"
          >
            GET STARTED
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center overflow-hidden border-b border-outline px-6 pt-32 pb-24">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-surface-container via-obsidian to-obsidian opacity-80"></div>
        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center text-center">
          <div className="mb-10 inline-flex items-center gap-2 rounded-full border border-outline bg-surface-variant/50 px-4 py-1.5 backdrop-blur-sm">
            <div className="h-2 w-2 animate-pulse rounded-full bg-cyan-electric shadow-[0_0_8px_#06b6d4]"></div>
            <span className="font-mono text-xs font-semibold tracking-widest uppercase text-cyan-electric">
              API Engine Online
            </span>
          </div>
          <h1 className="font-display mb-6 max-w-4xl text-5xl leading-[1.1] font-extrabold tracking-tight text-on-surface md:text-7xl">
            Build, Test &amp; Automate <br />
            <span className="text-gradient">Your APIs.</span>
          </h1>
          <p className="mb-14 max-w-2xl text-lg leading-relaxed font-medium text-on-surface-variant">
            One powerful workspace for API development, automated testing, collections,
            environments, and real-time execution. Designed for high-performance engineering teams.
          </p>

          {/* Emerging Product Mockup */}
          <div className="cyber-glow mb-12 flex aspect-[16/10] max-h-[720px] w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-outline bg-surface-container shadow-2xl">
            {/* Top Bar */}
            <div className="flex h-10 items-center gap-4 border-b border-outline bg-obsidian px-4">
              <div className="flex gap-2">
                <div className="h-3 w-3 rounded-full bg-outline"></div>
                <div className="h-3 w-3 rounded-full bg-outline"></div>
                <div className="h-3 w-3 rounded-full bg-outline"></div>
              </div>
              {/* Tabs */}
              <div className="mt-2 flex h-full gap-1">
                <div className="relative flex items-center gap-2 rounded-t-md border-t border-r border-l border-outline bg-surface-container px-4 py-2 font-mono text-xs text-on-surface">
                  <span className="font-bold text-method-get-text">GET</span> Users
                  <div className="absolute bottom-0 left-0 h-[1px] w-full bg-cyan-electric"></div>
                </div>
                <div className="flex cursor-pointer items-center gap-2 rounded-t-md px-4 py-2 font-mono text-xs text-on-surface-variant transition-colors hover:bg-surface-variant/50">
                  <span className="font-bold text-method-post-text">POST</span> Login
                </div>
              </div>
            </div>
            <div className="flex min-h-0 flex-1 overflow-hidden">
              {/* Sidebar */}
              <div className="flex w-64 shrink-0 flex-col border-r border-outline bg-obsidian p-3">
                <div className="mb-4 flex items-center justify-between px-2">
                  <span className="text-[10px] font-bold tracking-wider text-on-surface-variant">
                    COLLECTIONS
                  </span>
                  <Plus className="h-3 w-3 cursor-pointer text-on-surface-variant hover:text-on-surface" />
                </div>
                {/* Nested Collections Tree */}
                <div className="flex flex-col gap-1 font-mono text-xs text-on-surface-variant">
                  {/* Auth */}
                  <div className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-surface-variant/50">
                    <ChevronRight className="h-3 w-3" />
                    <Folder className="h-3.5 w-3.5" />
                    Auth
                  </div>
                  {/* Users (Expanded) */}
                  <div className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-on-surface hover:bg-surface-variant/50">
                    <ChevronDown className="h-3 w-3" />
                    <FolderOpen className="h-3.5 w-3.5 text-cyan-electric" />
                    Users
                  </div>
                  <div className="ml-5 flex flex-col gap-0.5 border-l border-outline py-1 pl-2">
                    <div className="-ml-[9px] flex items-center gap-2 rounded border-l-2 border-cyan-electric bg-surface-variant px-2 py-1 pl-[9px] text-on-surface">
                      <span className="text-[10px] font-bold text-method-get-text">GET</span> List
                      Users
                    </div>
                    <div className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-surface-variant/30">
                      <span className="text-[10px] font-bold text-method-post-text">POST</span>{" "}
                      Create User
                    </div>
                    <div className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-surface-variant/30">
                      <span className="text-[10px] font-bold text-method-put-text">PUT</span> Update
                      User
                    </div>
                    <div className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-surface-variant/30">
                      <span className="text-[10px] font-bold text-method-del-text">DEL</span> Delete
                      User
                    </div>
                  </div>
                  {/* Orders */}
                  <div className="mt-1 flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-surface-variant/50">
                    <ChevronRight className="h-3 w-3" />
                    <Folder className="h-3.5 w-3.5" />
                    Orders
                  </div>
                </div>
              </div>
              {/* Main Editor Area */}
              <div className="flex min-w-0 flex-1 flex-col bg-surface-container">
                {/* Precise Request Bar */}
                <div className="border-b border-outline p-4">
                  <div className="flex gap-2">
                    <div className="flex flex-1 overflow-hidden rounded-md border border-outline bg-obsidian font-mono text-sm transition-all focus-within:border-cyan-electric focus-within:ring-1 focus-within:ring-cyan-electric/50">
                      <div className="flex min-w-[80px] cursor-pointer items-center justify-between gap-1 border-r border-outline bg-surface-variant px-3 py-2 font-bold text-method-get-text">
                        GET <ChevronDown className="h-3 w-3 text-on-surface-variant" />
                      </div>
                      <input
                        className="w-full flex-1 border-none bg-transparent px-3 py-2 text-on-surface outline-none"
                        spellCheck={false}
                        type="text"
                        readOnly
                        value="https://api.example.com/v1/users"
                      />
                      <div className="flex items-center border-l border-outline bg-surface-variant/30 px-3 py-2 text-xs text-on-surface-variant">
                        {"{{prod_env}}"}
                      </div>
                    </div>
                    <button className="flex items-center gap-2 rounded-md bg-cyan-electric px-6 py-2 text-xs font-bold tracking-widest text-obsidian shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-colors hover:bg-[#08c9ea]">
                      SEND <Send className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                {/* Lower Split Pane (Request/Response) */}
                <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
                  {/* Request Config (Left) */}
                  <div className="flex min-w-0 flex-1 flex-col border-b border-outline lg:border-r lg:border-b-0">
                    <div className="flex gap-6 border-b border-outline bg-obsidian px-4 pt-3">
                      <div className="cursor-pointer pb-2 text-xs font-medium text-on-surface-variant hover:text-on-surface">
                        Params <span className="ml-1 text-[10px] text-outline">(2)</span>
                      </div>
                      <div className="cursor-pointer pb-2 text-xs font-medium text-on-surface-variant hover:text-on-surface">
                        Headers <span className="ml-1 text-[10px] text-outline">(6)</span>
                      </div>
                      <div className="relative border-b-2 border-cyan-electric pb-2 text-xs font-medium text-on-surface">
                        Tests
                      </div>
                    </div>
                    <div className="flex flex-1 gap-4 overflow-auto bg-obsidian p-4 font-mono text-xs leading-relaxed">
                      <Gutter lines={[1, 2, 3, 4, 5, 6]} />
                      <div className="text-on-surface-variant">
                        <Line>
                          <V>pm.test</V>(<E>"Status code is 200"</E>, <C>function</C> {"{"}
                        </Line>
                        <Line>
                          {"    "}
                          <V>pm.response.to.have.status</V>(<O>200</O>);
                        </Line>
                        <Line>{"});"}</Line>
                        <Line />
                        <Line>
                          <V>pm.test</V>(<E>"Response has valid user array"</E>, <C>function</C>{" "}
                          {"{"}
                        </Line>
                        <Line>
                          {"    "}
                          <C>const</C> jsonData = <V>pm.response.json</V>();
                        </Line>
                        <Line>{"    ..."}</Line>
                      </div>
                    </div>
                  </div>
                  {/* Response Config (Right) */}
                  <div className="relative flex min-w-0 flex-1 flex-col bg-surface-container">
                    <div className="flex items-center justify-between border-b border-outline bg-obsidian px-4 py-2">
                      <div className="flex gap-4">
                        <div className="border-b-2 border-cyan-electric pb-1 text-xs font-medium text-on-surface">
                          Body
                        </div>
                        <div className="cursor-pointer pb-1 text-xs font-medium text-on-surface-variant hover:text-on-surface">
                          Headers
                        </div>
                      </div>
                      <div className="flex items-center gap-3 font-mono text-xs">
                        <span className="flex items-center gap-1 font-bold text-emerald-400">
                          <CircleCheckBig className="h-3 w-3" /> 200 OK
                        </span>
                        <span className="flex items-center gap-1 text-on-surface-variant">
                          <Clock className="h-3 w-3" /> 142ms
                        </span>
                        <span className="flex items-center gap-1 text-on-surface-variant">
                          <Braces className="h-3 w-3" /> 1.2KB
                        </span>
                      </div>
                    </div>
                    <div className="flex min-h-0 flex-1 flex-col">
                      {/* JSON Syntax Highlighting */}
                      <div className="flex flex-1 gap-4 overflow-auto p-4 font-mono text-xs leading-relaxed">
                        <Gutter lines={[1, 2, 3, 4, 5, 6, 7, 8, 9]} />
                        <div>
                          <Line>
                            <C>{"{"}</C>
                          </Line>
                          <Line>
                            {"  "}
                            <V>"data"</V>: <C>[</C>
                          </Line>
                          <Line>
                            {"    "}
                            <C>{"{"}</C>
                          </Line>
                          <Line>
                            {"      "}
                            <V>"id"</V>: <E>"usr_9x8f7"</E>,
                          </Line>
                          <Line>
                            {"      "}
                            <V>"name"</V>: <E>"Jane Doe"</E>,
                          </Line>
                          <Line>
                            {"      "}
                            <V>"role"</V>: <E>"admin"</E>,
                          </Line>
                          <Line>
                            {"      "}
                            <V>"status"</V>: <E>"active"</E>
                          </Line>
                          <Line>
                            {"    "}
                            <C>{"}"}</C>
                          </Line>
                          <Line>
                            {"  "}
                            <C>]</C>
                          </Line>
                          <Line>
                            <C>{"}"}</C>
                          </Line>
                        </div>
                      </div>
                      {/* Diagnostic Panel (Tests Passed) */}
                      <div className="h-24 overflow-auto border-t border-outline bg-obsidian p-2">
                        <div className="mb-2 px-2 text-[10px] font-bold tracking-wider text-on-surface-variant">
                          TEST RESULTS (2/2)
                        </div>
                        <div className="flex flex-col gap-1 font-mono text-xs">
                          <div className="flex items-center gap-2 rounded bg-emerald-400/10 px-2 py-1 text-emerald-400">
                            <Check className="h-3 w-3" /> Status code is 200
                          </div>
                          <div className="flex items-center gap-2 rounded bg-emerald-400/10 px-2 py-1 text-emerald-400">
                            <Check className="h-3 w-3" /> Response has valid user array
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview Grid */}
      <section className="relative z-10 border-b border-outline bg-obsidian px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="font-display mb-4 text-3xl font-bold text-on-surface md:text-4xl">
              Everything you need to build APIs
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-on-surface-variant">
              Comprehensive tooling for the entire API lifecycle in one unified platform.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const isCyan = feature.accent === "cyan";
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className={`group rounded-xl border border-outline bg-surface-container p-6 transition-colors ${
                    isCyan ? "hover:border-cyan-electric/50" : "hover:border-violet-neon/50"
                  }`}
                >
                  <div
                    className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-surface-variant transition-colors ${
                      isCyan
                        ? "text-cyan-electric group-hover:bg-cyan-electric/10"
                        : "text-violet-neon group-hover:bg-violet-neon/10"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display mb-2 text-lg font-bold text-on-surface">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-on-surface-variant">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Deep Dive: API Testing */}
      <section className="relative z-10 border-b border-outline bg-surface-container/30 px-6 py-24">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-16 lg:flex-row">
          <div className="flex-1">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-neon/20 bg-violet-neon/10 px-3 py-1 text-xs font-bold tracking-wider text-violet-neon">
              <Code className="h-3 w-3" /> AUTOMATED TESTING
            </div>
            <h2 className="font-display mb-6 text-3xl font-bold text-on-surface md:text-4xl">
              Write powerful test suites in JavaScript
            </h2>
            <p className="mb-8 text-lg leading-relaxed text-on-surface-variant">
              Ensure your APIs perform exactly as expected. Write simple tests to verify status
              codes, response times, and exact data structures. Chain requests together to mirror
              complex user workflows.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-on-surface-variant">
                <CircleCheckBig className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                <span>Pre-request scripts for dynamic setup and auth</span>
              </li>
              <li className="flex items-start gap-3 text-on-surface-variant">
                <CircleCheckBig className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                <span>Robust assertion library included natively</span>
              </li>
              <li className="flex items-start gap-3 text-on-surface-variant">
                <CircleCheckBig className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                <span>Extract variables to pass between requests</span>
              </li>
            </ul>
          </div>
          <div className="w-full flex-1">
            <div className="relative overflow-hidden rounded-xl border border-outline bg-obsidian shadow-2xl">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-violet-neon/5 to-transparent"></div>
              <div className="flex h-8 items-center border-b border-outline bg-surface-variant/30 px-4">
                <span className="font-mono text-xs text-on-surface-variant">tests.js</span>
              </div>
              <div className="overflow-x-auto p-4 font-mono text-sm leading-relaxed">
                <div className="text-on-surface-variant">
                  <Line>
                    <V>pm.test</V>(<E>"Successful response"</E>, () <C>=&gt;</C> {"{"}
                  </Line>
                  <Line>
                    {"    "}
                    <V>pm.response.to.have.status</V>(<O>200</O>);
                  </Line>
                  <Line>{"});"}</Line>
                  <Line />
                  <Line>
                    <V>pm.test</V>(<E>"Response time is acceptable"</E>, () <C>=&gt;</C> {"{"}
                  </Line>
                  <Line>
                    {"    "}
                    <V>pm.expect</V>(<V>pm.response</V>.responseTime).<C>to.be.below</C>(
                    <O>200</O>);
                  </Line>
                  <Line>{"});"}</Line>
                  <Line />
                  <Line>
                    <V>pm.test</V>(<E>"Extract auth token"</E>, () <C>=&gt;</C> {"{"}
                  </Line>
                  <Line>
                    {"    "}
                    <C>let</C> jsonData = <V>pm.response.json</V>();
                  </Line>
                  <Line>
                    {"    "}
                    <V>pm.environment.set</V>(<E>"token"</E>, jsonData.token);
                  </Line>
                  <Line>{"});"}</Line>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* API Lifecycle Timeline */}
      <section className="relative z-10 overflow-hidden border-b border-outline bg-obsidian px-6 py-24">
        <div className="relative mx-auto max-w-7xl text-center">
          <h2 className="font-display mb-16 text-3xl font-bold text-on-surface md:text-4xl">
            Built for the whole API Lifecycle
          </h2>
          <div className="relative flex flex-col items-center justify-between gap-8 before:absolute before:top-8 before:right-12 before:left-12 before:hidden before:h-0.5 before:-z-10 before:bg-outline md:flex-row md:items-start md:gap-4 md:before:block">
            {lifecycle.map((step, idx) => {
              const Icon = step.icon;
              const hoverAccent =
                idx % 2 === 0
                  ? "hover:border-cyan-electric hover:text-cyan-electric"
                  : "hover:border-violet-neon hover:text-violet-neon";
              return (
                <div key={step.title} className="z-10 flex flex-1 flex-col items-center">
                  <div
                    className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 bg-obsidian transition-colors ${
                      step.active
                        ? "border-cyan-electric text-cyan-electric shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                        : `border-outline bg-surface-container text-on-surface-variant ${hoverAccent}`
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <h4 className="font-display mb-2 font-bold text-on-surface">{step.title}</h4>
                  <p className="px-4 text-sm text-on-surface-variant">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-outline bg-surface-container px-6 pt-16 pb-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
            <div className="col-span-2 lg:col-span-1">
              <a className="mb-6 flex items-center gap-2" href="#">
                <SquareTerminal className="h-5 w-5 text-cyan-electric" />
                <span className="font-display text-lg font-bold text-on-surface">API Workbench</span>
              </a>
              <p className="mb-6 text-sm text-on-surface-variant">
                The comprehensive platform for API development, testing, and automation.
              </p>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="text-on-surface-variant transition-colors hover:text-cyan-electric"
                >
                  <GithubIcon className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="text-on-surface-variant transition-colors hover:text-cyan-electric"
                >
                  <TwitterIcon className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="text-on-surface-variant transition-colors hover:text-cyan-electric"
                >
                  <LinkedinIcon className="h-5 w-5" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="mb-4 font-bold text-on-surface">Product</h4>
              <ul className="space-y-3 text-sm text-on-surface-variant">
                {["API Client", "CLI", "Mock Servers", "Monitors", "API Desktop"].map((item) => (
                  <li key={item}>
                    <a className="transition-colors hover:text-on-surface" href="#">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-bold text-on-surface">Resources</h4>
              <ul className="space-y-3 text-sm text-on-surface-variant">
                {["Documentation", "Release Notes", "API Reference", "GitHub"].map((item) => (
                  <li key={item}>
                    <a className="transition-colors hover:text-on-surface" href="#">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-bold text-on-surface">Company</h4>
              <ul className="space-y-3 text-sm text-on-surface-variant">
                {["About", "Careers", "Contact", "Privacy", "Terms"].map((item) => (
                  <li key={item}>
                    <a className="transition-colors hover:text-on-surface" href="#">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between gap-4 border-t border-outline pt-8 md:flex-row">
            <p className="text-sm text-on-surface-variant">
              © 2024 API Workbench Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-sm text-on-surface-variant">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              Systems Operational
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
