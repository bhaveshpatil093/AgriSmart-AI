
import React from 'react';
import MHGovLogo from '../assets/MH-gov.png';
import KumbhathonLogo from '../assets/Kumbhathon.webp';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin }) => {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 h-20 flex justify-between items-center">
          <div className="flex items-center space-x-2 group cursor-pointer">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200 group-hover:rotate-12 transition-transform">
              <i data-lucide="sprout" className="w-6 h-6"></i>
            </div>
            <span className="font-black text-2xl text-emerald-950 tracking-tighter">AgriSmart <span className="text-emerald-500">Nashik</span></span>
          </div>
          <div className="hidden md:flex space-x-10 text-sm font-bold text-slate-500">
            <a href="#features" className="hover:text-emerald-600 transition-colors">Technology</a>
            <a href="#process" className="hover:text-emerald-600 transition-colors">How it Works</a>
            <a href="#impact" className="hover:text-emerald-600 transition-colors">Impact</a>
          </div>
          <div className="flex items-center space-x-6">
            <button onClick={onLogin} className="text-sm font-bold text-slate-600 hover:text-emerald-600 transition-colors">Sign In</button>
            <button
              onClick={onGetStarted}
              className="bg-emerald-600 text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-emerald-700 shadow-xl shadow-emerald-100 hover:shadow-emerald-200 active:scale-95 transition-all"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-24 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-50/50 via-white to-white -z-10"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-10">
            <div className="inline-flex items-center space-x-3 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 animate-fade-in">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-emerald-100"></div>
                ))}
              </div>
              <span className="text-xs font-bold text-slate-600 tracking-tight">Trusted by 12,000+ Nashik Farmers</span>
            </div>

            <h1 className="text-6xl lg:text-8xl font-black text-slate-950 leading-[0.9] tracking-tighter">
              The Future of <br />
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">Nashik's Farming.</span>
            </h1>

            <p className="text-xl text-slate-500 leading-relaxed max-w-xl font-medium">
              Empowering Nashik's farmers with Gemini 1.5 to predict climate shifts, diagnose disease in Grapes, Onions, & Tomatoes, and maximize yield.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={onGetStarted}
                className="bg-slate-950 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-emerald-950 transition-all shadow-2xl flex items-center justify-center group"
              >
                Launch Your Dashboard
                <i data-lucide="arrow-right" className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform"></i>
              </button>
              <button className="flex items-center justify-center space-x-3 px-8 py-5 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-colors border border-slate-100">
                <i data-lucide="play-circle" className="w-6 h-6 text-emerald-600"></i>
                <span>See Case Studies</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-8 border-t border-slate-100 pt-10">
              <div>
                <div className="text-3xl font-black text-slate-950">24%</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Yield Increase</div>
              </div>
              <div>
                <div className="text-3xl font-black text-slate-950">40+</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Crops Supported</div>
              </div>
              <div>
                <div className="text-3xl font-black text-slate-950">98%</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Scan Accuracy</div>
              </div>
            </div>
          </div>

          <div className="relative lg:ml-10">
            {/* Visual Decoration */}
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl"></div>

            <div className="relative bg-white p-4 rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-100 animate-float">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-transparent rounded-[40px] pointer-events-none"></div>
              <img
                src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=1000"
                alt="Smart Farming"
                className="rounded-[32px] w-full h-[580px] object-cover"
              />

              {/* Floating Dashboard Card */}
              <div className="absolute top-10 -right-12 bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-white/50 space-y-3 w-64 animate-float-slow">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-black text-slate-400 uppercase">Live Analysis</div>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
                </div>
                <div className="text-lg font-bold text-slate-800">Moisture Index</div>
                <div className="text-3xl font-black text-emerald-600">82.4%</div>
                <div className="flex gap-1 h-2">
                  {[40, 70, 90, 60, 80].map((h, i) => (
                    <div key={i} className="flex-1 bg-emerald-100 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{ height: `${h}%` }}></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating Alert Card */}
              <div className="absolute bottom-12 -left-12 bg-white p-5 rounded-2xl shadow-xl border border-slate-100 flex items-center space-x-4 animate-float">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                  <i data-lucide="zap" className="w-6 h-6"></i>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">AI Prediction</div>
                  <div className="text-sm font-black text-slate-800">Storm Warning: 48h</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <div className="py-12 border-y border-slate-100 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-8">Supported by District Administration & Global Standards</p>
          <div className="flex flex-wrap items-center justify-center gap-12 opacity-60 grayscale hover:grayscale-0 transition-all">
            <div className="flex items-center space-x-2 font-black text-xl">IMD India</div>
            <div className="flex items-center space-x-2 font-black text-xl">FAO Global</div>
            <div className="flex items-center space-x-2 font-black text-xl">CGIAR Labs</div>
            <div className="flex items-center space-x-2 font-black text-xl">Mandi Connect</div>
            <img src={MHGovLogo} alt="Government of Maharashtra" className="h-16 w-auto object-contain" />
            <img src={KumbhathonLogo} alt="Kumbhathon" className="h-16 w-auto object-contain" />
          </div>
        </div>
      </div>

      {/* How it Works - Process Section */}
      <section id="process" className="py-32 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-4xl lg:text-5xl font-black text-slate-950 tracking-tight">The Precision Journey</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg">Three steps to a more resilient, profitable harvest. Driven by Gemini's multi-modal understanding.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connection Lines (Desktop Only) */}
            <div className="hidden md:block absolute top-1/2 left-1/4 right-1/4 h-px border-t border-dashed border-emerald-200 -z-10"></div>

            {[
              { step: '01', title: 'Scan & Capture', desc: 'Use your smartphone to capture high-res images of your crops or soil samples.', icon: 'camera' },
              { step: '02', title: 'Gemini Analysis', desc: 'Our AI processes visuals and climate data to detect early signs of stress or disease.', icon: 'cpu' },
              { step: '03', title: 'Actionable Advice', desc: 'Receive spoken instructions on irrigation, fertilizer, and optimal harvest windows.', icon: 'check-circle' }
            ].map((s, i) => (
              <div key={i} className="relative group p-10 bg-slate-50 rounded-[32px] hover:bg-emerald-50 transition-colors">
                <div className="text-6xl font-black text-emerald-100 absolute top-6 right-8 group-hover:text-emerald-200 transition-colors">{s.step}</div>
                <div className="w-16 h-16 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-emerald-100">
                  <i data-lucide={s.icon} className="w-8 h-8"></i>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{s.title}</h3>
                <p className="text-slate-500 leading-relaxed font-medium">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="py-32 px-4 bg-slate-950 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px]"></div>

        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20">
            <div className="space-y-4">
              <div className="text-emerald-500 font-bold tracking-widest uppercase text-sm">Technology Stack</div>
              <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight">Built for the Modern <br /> Ag-Industrial Revolution.</h2>
            </div>
            <button className="text-white font-bold border-b-2 border-emerald-500 pb-2 hover:text-emerald-400 transition-colors">Explore All Capabilities</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Disease Detection', desc: 'Identify blight, rust, and pests with 98.7% computer vision accuracy.', icon: 'search' },
              { title: 'Market Pulse', desc: 'Live commodity pricing from 500+ Mandis across the subcontinent.', icon: 'bar-chart-3' },
              { title: 'Hyperlocal Weather', desc: 'Ward-level forecasts with precision irrigation timing advice.', icon: 'cloud-lightning' },
              { title: 'Voice Concierge', desc: 'Full multi-lingual support via high-fidelity text-to-speech.', icon: 'mic' },
            ].map((f, i) => (
              <div key={i} className="bg-white/5 border border-white/10 p-10 rounded-[32px] hover:bg-white/10 transition-all group">
                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <i data-lucide={f.icon} className="w-6 h-6"></i>
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-emerald-600 rounded-[48px] p-12 lg:p-24 text-center relative overflow-hidden shadow-[0_48px_100px_-20px_rgba(16,185,129,0.3)]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>

            <div className="relative z-10 space-y-8">
              <h2 className="text-4xl lg:text-6xl font-black text-white leading-tight">Ready to transform <br /> your harvest?</h2>
              <p className="text-emerald-50 text-xl font-medium max-w-xl mx-auto">Join the digital agriculture movement today. No complex setup required.</p>
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <button
                  onClick={onGetStarted}
                  className="bg-white text-emerald-600 px-12 py-5 rounded-2xl font-black text-lg hover:bg-emerald-50 transition-all shadow-xl active:scale-95"
                >
                  Create Your Free Account
                </button>
                <button className="bg-emerald-700 text-white px-12 py-5 rounded-2xl font-black text-lg hover:bg-emerald-800 transition-all border border-emerald-500/30">
                  Talk to an Expert
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-white border-t border-slate-100 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-sm">
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
                <i data-lucide="sprout" className="w-5 h-5"></i>
              </div>
              <span className="font-bold text-xl text-emerald-950 tracking-tighter">AgriSmart Nashik</span>
            </div>
            <p className="text-slate-400 font-medium leading-relaxed">Pioneering climate-smart agriculture through multi-modal artificial intelligence.</p>
            <div className="flex space-x-4">
              {['twitter', 'linkedin', 'github'].map(icon => (
                <div key={icon} className="w-10 h-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-600 transition-all cursor-pointer">
                  <i data-lucide={icon} className="w-5 h-5"></i>
                </div>
              ))}
            </div>
          </div>

          {[
            { title: 'Platform', links: ['Dashboard', 'Crop Analysis', 'Climate Insights', 'Market Trends'] },
            { title: 'Resources', links: ['Documentation', 'Research Papers', 'API Status', 'Community Forum'] },
            { title: 'Company', links: ['About Us', 'Sustainability', 'Partners', 'Contact'] },
          ].map((col, i) => (
            <div key={i} className="space-y-6">
              <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs">{col.title}</h4>
              <ul className="space-y-4">
                {col.links.map(link => (
                  <li key={link}><a href="#" className="text-slate-500 font-medium hover:text-emerald-600 transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 font-medium">
          <p>© 2024 AgriSmart AI Platform. A Next-Gen Agritech Initiative.</p>
          <div className="flex space-x-8">
            <a href="#" className="hover:text-emerald-600">Privacy Policy</a>
            <a href="#" className="hover:text-emerald-600">Terms</a>
            <a href="#" className="hover:text-emerald-600">Cookie Settings</a>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(1deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes float-slow {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(-1deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
