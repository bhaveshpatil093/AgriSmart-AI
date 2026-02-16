
import React, { useState, useEffect } from 'react';
import { StoriesApi } from '../client_api/stories/service';
import { SuccessStory, StoryCategory } from '../types';

const SuccessStories: React.FC = () => {
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [activeCategory, setActiveCategory] = useState<StoryCategory | 'All'>('All');
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedStory, setSelectedStory] = useState<SuccessStory | null>(null);

  useEffect(() => {
    loadStories();
  }, [activeCategory]);

  useEffect(() => {
    const win = window as any;
    if (win.lucide) win.lucide.createIcons();
  }, [loading, stories, activeCategory, showSubmitModal, selectedStory]);

  const loadStories = async () => {
    setLoading(true);
    const cat = activeCategory === 'All' ? undefined : activeCategory;
    const res = await StoriesApi.getStories(cat);
    if (res.success) setStories(res.data || []);
    setLoading(false);
  };

  const categories: (StoryCategory | 'All')[] = ['All', 'Irrigation', 'Organic', 'Pest Mgmt', 'Market', 'Tech Adoption'];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-24 animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Harvest Heros</h1>
          <p className="text-slate-500 font-medium">Verified success stories and replicable farm blueprints</p>
        </div>
        <button 
          onClick={() => setShowSubmitModal(true)}
          className="bg-emerald-600 text-white px-8 py-3 rounded-[15px] font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95 flex items-center space-x-3"
        >
          <i data-lucide="award" className="w-5 h-5"></i>
          <span>Share My Impact</span>
        </button>
      </header>

      <div className="flex bg-slate-100 p-1 rounded-[15px] border border-slate-200 w-fit overflow-x-auto no-scrollbar">
         {categories.map((cat) => (
           <button 
             key={cat}
             onClick={() => setActiveCategory(cat)}
             className={`px-6 py-2.5 rounded-[15px] text-xs font-bold whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-emerald-600'}`}
           >
             {cat}
           </button>
         ))}
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
           <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Mining success data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {stories.map((story) => (
             <div 
               key={story.id} 
               onClick={() => setSelectedStory(story)}
               className="bg-white rounded-[15px] border border-slate-200 overflow-hidden shadow-sm hover:border-emerald-300 transition-all group cursor-pointer"
             >
                <div className="relative h-64">
                   <img src={story.imageUrl} alt={story.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                   <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                   <div className="absolute bottom-6 left-6 right-6">
                      <span className="px-2 py-1 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest rounded-[15px]">{story.category}</span>
                      <h3 className="text-xl font-black text-white mt-2 leading-tight">{story.title}</h3>
                   </div>
                </div>
                <div className="p-8 space-y-6">
                   <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-400">{story.farmerName.charAt(0)}</div>
                      <div>
                         <div className="text-sm font-black text-slate-900">{story.farmerName}</div>
                         <div className="text-[10px] text-slate-400 font-bold uppercase">{story.location}</div>
                      </div>
                   </div>
                   <p className="text-sm text-slate-500 font-medium leading-relaxed line-clamp-2 italic">"{story.result}"</p>
                   <div className="grid grid-cols-2 gap-3">
                      {story.metrics.slice(0, 2).map((m, i) => (
                        <div key={i} className="p-3 bg-emerald-50 rounded-[15px] border border-emerald-100">
                           <div className="text-xs font-black text-emerald-700">{m.value}</div>
                           <div className="text-[9px] text-emerald-600 font-bold uppercase tracking-tight">{m.label}</div>
                        </div>
                      ))}
                   </div>
                   <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
                      <div className="flex space-x-4 text-slate-400">
                         <span className="flex items-center space-x-1 text-[10px] font-bold"><i data-lucide="heart" className="w-3 h-3"></i> <span>{story.likes}</span></span>
                         <span className="flex items-center space-x-1 text-[10px] font-bold"><i data-lucide="share-2" className="w-3 h-3"></i> <span>{story.shares}</span></span>
                      </div>
                      <button className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center space-x-2">
                        <span>Read Case Study</span>
                        <i data-lucide="arrow-right" className="w-3 h-3"></i>
                      </button>
                   </div>
                </div>
             </div>
           ))}
        </div>
      )}

      {/* Story Detail View */}
      {selectedStory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => setSelectedStory(null)}></div>
           <div className="relative bg-white w-full max-w-5xl h-[90vh] rounded-[15px] overflow-hidden shadow-2xl flex flex-col lg:flex-row animate-scale-up">
              <div className="lg:w-2/5 relative h-64 lg:h-auto shrink-0">
                 <img src={selectedStory.imageUrl} className="w-full h-full object-cover" alt="" />
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent lg:hidden"></div>
                 <button onClick={() => setSelectedStory(null)} className="absolute top-8 left-8 p-3 bg-white/20 backdrop-blur-md text-white rounded-[15px] hover:bg-white/40 transition-all">
                    <i data-lucide="arrow-left" className="w-6 h-6"></i>
                 </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 lg:p-16 space-y-12 no-scrollbar">
                 <header className="space-y-4">
                    <div className="flex items-center space-x-3">
                       <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-[15px] text-[10px] font-black uppercase tracking-widest border border-emerald-100">{selectedStory.category}</span>
                       <span className="text-[10px] text-slate-400 font-bold uppercase">{selectedStory.cropType} Focus</span>
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-tight">{selectedStory.title}</h2>
                    <div className="flex items-center space-x-4">
                       <div className="w-12 h-12 bg-slate-100 rounded-[15px] flex items-center justify-center font-black text-slate-400">{selectedStory.farmerName.charAt(0)}</div>
                       <div>
                          <div className="text-base font-black text-slate-900">{selectedStory.farmerName}</div>
                          <div className="text-xs text-slate-400 font-bold uppercase">{selectedStory.location}</div>
                       </div>
                    </div>
                 </header>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {selectedStory.metrics.map((m, i) => (
                      <div key={i} className="p-6 bg-slate-50 rounded-[15px] border border-slate-100">
                         <div className="text-3xl font-black text-emerald-600">{m.value}</div>
                         <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{m.label}</div>
                         <p className="text-[10px] text-slate-500 font-bold leading-tight">{m.improvement}</p>
                      </div>
                    ))}
                 </div>

                 <div className="space-y-8">
                    <section className="space-y-4">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">The Challenge</h4>
                       <p className="text-lg text-slate-600 font-medium leading-relaxed italic">"{selectedStory.problem}"</p>
                    </section>
                    <section className="space-y-4">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">The AI Solution</h4>
                       <p className="text-lg text-slate-800 font-bold leading-relaxed">{selectedStory.solution}</p>
                    </section>

                    {selectedStory.beforeImageUrl && (
                      <section className="space-y-6">
                         <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Visual Impact (Before vs After)</h4>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="relative group">
                               <img src={selectedStory.beforeImageUrl} className="rounded-[15px] h-48 w-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all" alt="Before" />
                               <span className="absolute bottom-4 left-4 px-2 py-1 bg-black/40 text-white text-[8px] font-bold uppercase rounded-[15px]">Before Intervention</span>
                            </div>
                            <div className="relative">
                               <img src={selectedStory.imageUrl} className="rounded-[15px] h-48 w-full object-cover" alt="After" />
                               <span className="absolute bottom-4 left-4 px-2 py-1 bg-emerald-600 text-white text-[8px] font-bold uppercase rounded-[15px]">After AI Optimization</span>
                            </div>
                         </div>
                      </section>
                    )}

                    <section className="space-y-6">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Implementation Blueprint</h4>
                       <div className="space-y-4">
                          {selectedStory.steps.map((step, i) => (
                            <div key={i} className="flex items-start space-x-6 p-6 bg-slate-50 rounded-[15px]">
                               <div className="w-10 h-10 bg-white rounded-[15px] flex items-center justify-center font-black text-emerald-600 shadow-sm border border-slate-100 shrink-0">0{i+1}</div>
                               <div>
                                  <h5 className="text-sm font-black text-slate-900 mb-1">{step.title}</h5>
                                  <p className="text-xs text-slate-500 font-medium leading-relaxed">{step.description}</p>
                               </div>
                            </div>
                          ))}
                       </div>
                    </section>
                 </div>

                 <footer className="pt-10 border-t border-slate-100 flex flex-wrap gap-4 justify-between items-center">
                    <div className="flex gap-4">
                       <button className="flex items-center space-x-3 px-8 py-4 bg-emerald-600 text-white rounded-[15px] font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95">
                          <i data-lucide="heart" className="w-4 h-4"></i>
                          <span>Like Story</span>
                       </button>
                       <button className="flex items-center space-x-3 px-8 py-4 bg-white border border-slate-200 text-slate-600 rounded-[15px] font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95">
                          <i data-lucide="share-2" className="w-4 h-4"></i>
                          <span>Share Blueprint</span>
                       </button>
                    </div>
                 </footer>
              </div>
           </div>
        </div>
      )}

      {/* Submit Story Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => setShowSubmitModal(false)}></div>
           <div className="relative bg-white w-full max-w-2xl rounded-[15px] p-12 shadow-2xl animate-scale-up">
              <div className="flex justify-between items-center mb-8">
                 <h2 className="text-3xl font-black text-slate-900 tracking-tight">Share Your Success</h2>
                 <button onClick={() => setShowSubmitModal(false)} className="p-3 bg-slate-50 text-slate-400 hover:text-red-500 rounded-2xl transition-all">
                    <i data-lucide="x" className="w-6 h-6"></i>
                 </button>
              </div>
              <p className="text-slate-500 font-medium mb-8">Inspire the Nashik community by sharing how climate-smart tech improved your harvest. We'll help you format it into a replicable blueprint.</p>
              
              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Title of Your Story</label>
                    <input type="text" placeholder="e.g. My journey with automated irrigation" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Key Improvement (%)</label>
                    <input type="number" placeholder="e.g. 25" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" />
                 </div>
                 <button 
                  onClick={() => setShowSubmitModal(false)}
                  className="w-full py-5 bg-emerald-600 text-white rounded-[15px] font-black text-sm uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100"
                >
                   Complete Submission
                </button>
              </div>
           </div>
        </div>
      )}

      <style>{`
        .animate-fade-in { animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slide-up { animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-scale-up { animation: scale-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scale-up { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </div>
  );
};

export default SuccessStories;
