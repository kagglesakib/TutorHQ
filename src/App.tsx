/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Boxes,
  Check,
  ChevronRight,
  Code2,
  Copy,
  ExternalLink,
  Layers,
  Layout,
  Plus,
  Search,
  Sliders,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

interface Blueprint {
  id: string;
  title: string;
  category: string;
  complexity: string;
  description: string;
  recommendedStack: string;
  promptExample: string;
  features: string[];
}

const BLUEPRINTS: Blueprint[] = [
  {
    id: 'saas-dashboard',
    title: 'Enterprise Analytics & Metrics Hub',
    category: 'SaaS & Analytics',
    complexity: 'Moderate',
    description: 'High-density operational dashboard featuring revenue telemetry, real-time cohort tracking, and tabular reporting.',
    recommendedStack: 'React · Tailwind CSS · Motion',
    promptExample: 'Build a SaaS financial analytics dashboard with monthly recurring revenue charts, user cohort retention, and an exportable transactions table.',
    features: ['Real-time cohort telemetry', 'Multi-currency conversion', 'Tabular financial ledger', 'CSV / JSON export'],
  },
  {
    id: 'simulation-lab',
    title: 'Interactive Physics & Optics Simulation',
    category: 'Education & Science',
    complexity: 'Advanced',
    description: 'Canvas-based exploratory lab modeling ray optics, refractive indices, and interactive wave interference patterns.',
    recommendedStack: 'HTML5 Canvas · React · Web Audio',
    promptExample: 'Create an interactive physics simulation of light refraction and dispersion through prisms with adjustable incidence angles and wavelengths.',
    features: ['Real-time ray tracing on 2D canvas', 'Wavelength slider controls', 'Spectral color mapping', 'Preset experiments'],
  },
  {
    id: 'editorial-commerce',
    title: 'Curated Artisan Design Showcase',
    category: 'E-Commerce & Retail',
    complexity: 'Moderate',
    description: 'Minimalist editorial storefront spotlighting bespoke architectural furniture, lookbooks, and an instant checkout cart.',
    recommendedStack: 'React · Context State · Responsive Grid',
    promptExample: 'Build a luxury Scandinavian furniture store with interactive lookbook hotspot exploration, size selector, and shopping bag.',
    features: ['Lookbook image hot-spotting', 'Dynamic product filter matrix', 'Interactive cart drawer', 'Material finish switcher'],
  },
  {
    id: 'kanban-workspace',
    title: 'Collaborative Sprint & Task Planner',
    category: 'Productivity & Tools',
    complexity: 'Beginner-Friendly',
    description: 'Agile team management board with drag-and-drop swimlanes, milestone trackers, and priority sorting.',
    recommendedStack: 'React State · LocalStorage Persistence',
    promptExample: 'Build a full-featured Kanban project management app with customizable columns, priority tags, search filters, and task checklists.',
    features: ['Multi-column task workflows', 'Filter by assignee and status', 'Markdown task notes', 'Activity audit log'],
  },
  {
    id: 'creative-audio',
    title: 'Synthesizer & Sequencer Studio',
    category: 'Creative & Audio',
    complexity: 'Advanced',
    description: 'In-browser step sequencer and subtractive synth powered by the Web Audio API with oscillators, filters, and drum pads.',
    recommendedStack: 'Web Audio API · React Hooks',
    promptExample: 'Create a 16-step drum sequencer and synthesizer with BPM tempo controls, waveform selector, low-pass filter, and audio recording.',
    features: ['16-step matrix sequencer', 'Dual-oscillator synth engine', 'BPM tap tempo and swing', 'Pattern export to WAV'],
  },
  {
    id: 'portfolio-case-study',
    title: 'Architectural & Studio Portfolio',
    category: 'Portfolio & Editorial',
    complexity: 'Beginner-Friendly',
    description: 'Typography-first spatial portfolio for design studios, architects, and creative directors with project deep-dives.',
    recommendedStack: 'React · Framer Motion · Tailwind',
    promptExample: 'Build an architectural design portfolio with full-bleed editorial imagery, project blueprints, client testimonials, and inquiry form.',
    features: ['Editorial typographic layout', 'Full-screen gallery lightbox', 'Project specification drawer', 'Interactive contact modal'],
  },
];

const CATEGORIES = ['All Blueprints', 'SaaS & Analytics', 'Education & Science', 'E-Commerce & Retail', 'Productivity & Tools', 'Creative & Audio'];

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All Blueprints');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeBlueprint, setActiveBlueprint] = useState<Blueprint>(BLUEPRINTS[0]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'preview' | 'prompt'>('overview');

  // Mini interactive demo states for live preview
  const [demoMetricPeriod, setDemoMetricPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [demoSimAngle, setDemoSimAngle] = useState<number>(45);
  const [demoTasks, setDemoTasks] = useState([
    { id: 1, title: 'Refactor auth state machine', status: 'In Progress', priority: 'High' },
    { id: 2, title: 'Implement tabular export', status: 'Done', priority: 'Medium' },
    { id: 3, title: 'Calibrate canvas viewport transform', status: 'Backlog', priority: 'Low' },
  ]);

  const filteredBlueprints = BLUEPRINTS.filter((bp) => {
    const matchesCategory = selectedCategory === 'All Blueprints' || bp.category === selectedCategory;
    const matchesSearch =
      bp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bp.features.some((f) => f.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleCopyPrompt = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFB] text-slate-900 flex flex-col font-sans antialiased selection:bg-slate-900 selection:text-white">
      {/* Top Bar adhering strictly to Top Bar Contract */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200/80 px-6 py-3.5 flex items-center justify-between">
        {/* Zone 1: Single element brand wordmark */}
        <a href="/" className="text-base font-semibold tracking-tight text-slate-900">
          Creative Studio
        </a>

        {/* Zone 2: Navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm text-slate-600">
          <button
            onClick={() => setActiveTab('overview')}
            className={`transition-colors text-left hover:text-slate-900 ${activeTab === 'overview' ? 'text-slate-950 font-medium' : ''}`}
          >
            Blueprints
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`transition-colors text-left hover:text-slate-900 ${activeTab === 'preview' ? 'text-slate-950 font-medium' : ''}`}
          >
            Live Sandbox
          </button>
          <button
            onClick={() => setActiveTab('prompt')}
            className={`transition-colors text-left hover:text-slate-900 ${activeTab === 'prompt' ? 'text-slate-950 font-medium' : ''}`}
          >
            Prompt Builder
          </button>
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setActiveTab('prompt');
              setCustomPrompt('Create an application that ');
            }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Describe New App</span>
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Editorial Hero Frame */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-8 shadow-xs">
              <div className="max-w-2xl space-y-3">
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Engineering & Prototype Workspace
                </div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950 leading-tight">
                  What would you like to build?
                </h1>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Tell me your concept or select one of the battle-tested blueprints below. Whether you need a high-density SaaS console, an interactive science simulation, or a curated digital commerce experience, I am ready to implement it.
                </p>
              </div>

              {/* Quick Input Box */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="e.g. Build an audio spectrum analyzer with parametric EQ sliders and live mic input..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && customPrompt.trim()) {
                        setActiveTab('prompt');
                      }
                    }}
                  />
                </div>
                <button
                  onClick={() => {
                    if (customPrompt.trim()) {
                      setActiveTab('prompt');
                    } else {
                      setCustomPrompt('Build a real-time data dashboard with customizable chart widgets and dark mode.');
                      setActiveTab('prompt');
                    }
                  }}
                  className="px-5 py-2.5 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <span>Build Specification</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Filter and Blueprint Gallery Section */}
            <div className="space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Category Segmented Control */}
                <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-200/50 rounded-lg border border-slate-200/60 max-w-full">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                        selectedCategory === cat
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Search */}
                <div className="relative w-full md:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search templates & features..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              {/* Blueprints Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredBlueprints.map((bp) => (
                  <div
                    key={bp.id}
                    className="group bg-white border border-slate-200/90 rounded-xl p-5 hover:border-slate-300 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Zero-Pill Unboxed Metadata with typographic separators */}
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{bp.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>{bp.complexity}</span>
                      </div>

                      <h3 className="text-base font-semibold text-slate-900 group-hover:text-slate-950 transition-colors">
                        {bp.title}
                      </h3>

                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                        {bp.description}
                      </p>

                      <div className="pt-2 border-t border-slate-100 space-y-1.5">
                        <span className="text-[11px] font-medium text-slate-400">Key Features:</span>
                        <ul className="text-xs text-slate-600 space-y-1">
                          {bp.features.slice(0, 3).map((feat, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          setActiveBlueprint(bp);
                          setActiveTab('preview');
                        }}
                        className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-md transition-colors"
                      >
                        Inspect Prototype
                      </button>
                      <button
                        onClick={() => handleCopyPrompt(bp.promptExample, bp.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                        title="Copy prompt to clipboard"
                      >
                        {copiedId === bp.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-500" />
                            <span>Copy Prompt</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Live Interactive Sandbox Preview */}
        {activeTab === 'preview' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>Interactive Prototype</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeBlueprint.category}</span>
                </div>
                <h2 className="text-2xl font-semibold text-slate-900 mt-1">{activeBlueprint.title}</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
                >
                  Change Blueprint
                </button>
                <button
                  onClick={() => handleCopyPrompt(activeBlueprint.promptExample, 'active-preview')}
                  className="px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5"
                >
                  {copiedId === 'active-preview' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'active-preview' ? 'Copied Prompt' : 'Use This Blueprint'}</span>
                </button>
              </div>
            </div>

            {/* Sandbox Canvas / Interactive Workspace */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
              {/* Dynamic Interactive Demo based on selected blueprint */}
              {activeBlueprint.id === 'saas-dashboard' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">Financial Velocity & Operations</h4>
                      <p className="text-xs text-slate-500">Live calculating ledger telemetry</p>
                    </div>
                    <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-md">
                      {(['7d', '30d', '90d'] as const).map((period) => (
                        <button
                          key={period}
                          onClick={() => setDemoMetricPeriod(period)}
                          className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                            demoMetricPeriod === period ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                          }`}
                        >
                          {period.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* High Density Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-50/70 border border-slate-200/70 rounded-lg">
                      <div className="text-xs text-slate-500">Net Recurring Revenue</div>
                      <div className="text-2xl font-semibold text-slate-900 tabular-nums mt-1">
                        {demoMetricPeriod === '7d' ? '$18,420' : demoMetricPeriod === '30d' ? '$84,310' : '$249,800'}
                      </div>
                      <div className="text-xs text-emerald-600 mt-1 font-medium">+14.2% vs previous period</div>
                    </div>
                    <div className="p-4 bg-slate-50/70 border border-slate-200/70 rounded-lg">
                      <div className="text-xs text-slate-500">Active Customer Accounts</div>
                      <div className="text-2xl font-semibold text-slate-900 tabular-nums mt-1">
                        {demoMetricPeriod === '7d' ? '1,248' : demoMetricPeriod === '30d' ? '4,892' : '12,410'}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">98.4% retention rate</div>
                    </div>
                    <div className="p-4 bg-slate-50/70 border border-slate-200/70 rounded-lg">
                      <div className="text-xs text-slate-500">Average Contract Value</div>
                      <div className="text-2xl font-semibold text-slate-900 tabular-nums mt-1">$1,680</div>
                      <div className="text-xs text-emerald-600 mt-1 font-medium">+5.1% enterprise expansion</div>
                    </div>
                  </div>

                  {/* Tabular Data View with Tabular Figures */}
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-200 text-xs font-semibold text-slate-700">
                      Recent Ledger Invariants
                    </div>
                    <table className="w-full text-xs text-left">
                      <thead className="bg-white border-b border-slate-100 text-slate-400 font-medium">
                        <tr>
                          <th className="px-4 py-2.5">Transaction ID</th>
                          <th className="px-4 py-2.5">Organization</th>
                          <th className="px-4 py-2.5">Status</th>
                          <th className="px-4 py-2.5 text-right">Amount (USD)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-600">
                        <tr>
                          <td className="px-4 py-3 font-mono text-slate-500">TX-89104</td>
                          <td className="px-4 py-3 font-medium text-slate-900">Meridian Systems</td>
                          <td className="px-4 py-3 text-emerald-700">Settled</td>
                          <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-900">$4,800.00</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-mono text-slate-500">TX-89105</td>
                          <td className="px-4 py-3 font-medium text-slate-900">Kinetics Lab EU</td>
                          <td className="px-4 py-3 text-emerald-700">Settled</td>
                          <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-900">$2,450.00</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-mono text-slate-500">TX-89106</td>
                          <td className="px-4 py-3 font-medium text-slate-900">Vanguard Robotics</td>
                          <td className="px-4 py-3 text-amber-700">Processing</td>
                          <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-900">$12,000.00</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeBlueprint.id === 'simulation-lab' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">Optical Refraction Laboratory</h4>
                      <p className="text-xs text-slate-500">Ray deflection according to Snell's law: n₁ sin(θ₁) = n₂ sin(θ₂)</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-xs text-slate-600 flex items-center gap-2">
                        <span>Incident Angle:</span>
                        <span className="font-mono tabular-nums font-semibold text-slate-900">{demoSimAngle}°</span>
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="85"
                        value={demoSimAngle}
                        onChange={(e) => setDemoSimAngle(Number(e.target.value))}
                        className="w-32 accent-slate-900 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Refraction Visual Canvas */}
                  <div className="relative h-64 bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center p-4">
                    <svg className="w-full h-full" viewBox="0 0 600 240">
                      {/* Boundary line */}
                      <line x1="0" y1="120" x2="600" y2="120" stroke="#334155" strokeWidth="1.5" strokeDasharray="4 4" />
                      <text x="20" y="40" fill="#94A3B8" fontSize="11" fontFamily="sans-serif">Medium 1: Air (n₁ = 1.000)</text>
                      <text x="20" y="200" fill="#94A3B8" fontSize="11" fontFamily="sans-serif">Medium 2: Crown Glass (n₂ = 1.520)</text>

                      {/* Incident ray */}
                      {(() => {
                        const rad1 = (demoSimAngle * Math.PI) / 180;
                        const x1 = 300 - Math.tan(rad1) * 100;
                        const rad2 = Math.asin(Math.sin(rad1) / 1.52);
                        const x2 = 300 + Math.tan(rad2) * 100;
                        return (
                          <>
                            {/* Incident Ray */}
                            <line x1={x1} y1="20" x2="300" y2="120" stroke="#F59E0B" strokeWidth="2.5" />
                            {/* Refracted Ray */}
                            <line x1="300" y1="120" x2={x2} y2="220" stroke="#38BDF8" strokeWidth="2.5" />
                            {/* Normal line */}
                            <line x1="300" y1="20" x2="300" y2="220" stroke="#475569" strokeWidth="1" strokeDasharray="2 2" />
                            {/* Target Point */}
                            <circle cx="300" cy="120" r="3" fill="#FFFFFF" />
                          </>
                        );
                      })()}
                    </svg>
                  </div>
                </div>
              )}

              {activeBlueprint.id !== 'saas-dashboard' && activeBlueprint.id !== 'simulation-lab' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-lg">
                    <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2">
                      Blueprint Specification
                    </h4>
                    <p className="text-sm text-slate-700 leading-relaxed mb-4">{activeBlueprint.description}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                      <div>
                        <span className="font-semibold text-slate-900 block mb-1">Architecture Features:</span>
                        <ul className="space-y-1">
                          {activeBlueprint.features.map((f, i) => (
                            <li key={i} className="flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-slate-700" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900 block mb-1">Recommended Tech:</span>
                        <p className="font-mono text-slate-600">{activeBlueprint.recommendedStack}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Ready to generate prompt block */}
              <div className="p-4 bg-slate-900 text-white rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs text-slate-400 font-medium">Ready to build this application?</div>
                  <div className="text-sm font-medium">Copy the blueprint prompt and send it in our chat.</div>
                </div>
                <button
                  onClick={() => handleCopyPrompt(activeBlueprint.promptExample, 'ready-btn')}
                  className="px-4 py-2 bg-white text-slate-900 hover:bg-slate-100 rounded-md text-xs font-semibold transition-colors inline-flex items-center gap-2 whitespace-nowrap"
                >
                  {copiedId === 'ready-btn' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'ready-btn' ? 'Copied to Clipboard' : 'Copy Full Specification'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Prompt Builder tab */}
        {activeTab === 'prompt' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Prompt Architect</div>
              <h2 className="text-2xl font-semibold text-slate-900 mt-1">Compose Your Application Request</h2>
              <p className="text-xs text-slate-600 mt-1">
                Customize the specifications below and send them directly to me in the prompt box to begin generating your custom app.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Application Prompt & Constraints
                </label>
                <textarea
                  rows={5}
                  value={customPrompt || activeBlueprint.promptExample}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="w-full p-3.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all"
                />
              </div>

              <div>
                <span className="block text-xs font-medium text-slate-700 mb-2">Preset Quick Actions</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Include Dark/Light Theme toggle',
                    'Add LocalStorage state persistence',
                    'Integrate interactive chart visualizations',
                    'Add sample mock dataset with search & filter',
                    'Responsive mobile-first navigation',
                  ].map((modifier, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        const current = customPrompt || activeBlueprint.promptExample;
                        if (!current.includes(modifier)) {
                          setCustomPrompt(`${current.trim()} ${modifier}.`);
                        }
                      }}
                      className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                    >
                      + {modifier}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setCustomPrompt('')}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Clear text
                </button>
                <button
                  onClick={() => handleCopyPrompt(customPrompt || activeBlueprint.promptExample, 'composer-copy')}
                  className="px-4 py-2 bg-slate-900 text-white rounded-md text-xs font-medium hover:bg-slate-800 transition-colors inline-flex items-center gap-2"
                >
                  {copiedId === 'composer-copy' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'composer-copy' ? 'Copied Prompt' : 'Copy to Clipboard'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Quiet, clean footer adhering strictly to Anti-Slop section 1B */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white px-6 py-5 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>Creative Studio · Ready for user prompts</span>
          <div className="flex items-center gap-4 text-slate-600">
            <button onClick={() => setActiveTab('overview')} className="hover:text-slate-900 transition-colors">
              Blueprints
            </button>
            <button onClick={() => setActiveTab('preview')} className="hover:text-slate-900 transition-colors">
              Live Sandbox
            </button>
            <button onClick={() => setActiveTab('prompt')} className="hover:text-slate-900 transition-colors">
              Composer
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
