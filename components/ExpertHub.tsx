import React, { useState, useEffect } from 'react';
import { ExpertApi } from '../api/experts/service';
import { ExpertProfile, ExpertQuestion, ConsultationSession } from '../types';

const ExpertHub: React.FC = () => {
  const [experts, setExperts] = useState<ExpertProfile[]>([]);
  const [questions, setQuestions] = useState<ExpertQuestion[]>([]);
  const [activeView, setActiveView] = useState<'experts' | 'my-questions' | 'consults'>('experts');
  const [loading, setLoading] = useState(true);
  const [showAskModal, setShowAskModal] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<ExpertProfile | null>(null);
  const [newQuestion, setNewQuestion] = useState({ title: '', content: '', cropType: 'Grape', urgency: 'Standard' as any });

  useEffect(() => {
    loadInitial();
  }, []);

  useEffect(() => {
    const win = window as any;
    if (win.lucide) win.lucide.createIcons();
  }, [loading, experts, questions, activeView, showAskModal, selectedExpert]);

  const loadInitial = async () => {
    setLoading(true);
    const [expRes, qRes] = await Promise.all([
      ExpertApi.getExperts(),
      ExpertApi.getQuestions('u123')
    ]);
    if (expRes.success) setExperts(expRes.data || []);
    if (qRes.success) setQuestions(qRes.data || []);
    setLoading(false);
  };

  const handleAskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await ExpertApi.askQuestion(newQuestion);
    if (res.success) {
      setShowAskModal(false);
      const qRes = await ExpertApi.getQuestions('u123');
      setQuestions(qRes.data || []);
    }
  };

  const handleBookConsult = async (expert: ExpertProfile, slot: string) => {
    const res = await ExpertApi.bookConsultation({
      userId: 'u123',
      expertId: expert.id,
      expertName: expert.name,
      date: new Date().toISOString().split('T')[0],
      timeSlot: slot,
      topic: 'Urgent crop inspection'
    });
    if (res.success) {
      alert(`Consultation booked with ${expert.name} at ${slot}. Meeting link sent to your phone.`);
      setSelectedExpert(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-6"></div>
        <p className="text-slate-500 font-black uppercase tracking-widest text-xs animate-pulse">Syncing with Extension Network...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-24 animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Expert Concierge</h1>
          <p className="text-slate-500 font-medium">Direct access to verified regional agronomists</p>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={() => setShowAskModal(true)}
             className="bg-emerald-600 text-white px-8 py-3 rounded-[15px] font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center space-x-3"
           >
             <i data-lucide="help-circle" className="w-5 h-5"></i>
             <span>Ask Specialist</span>
           </button>
        </div>
      </header>

      <div className="flex bg-slate-100 p-1 rounded-[15px] border border-slate-200 w-fit">
         {[
           { id: 'experts', label: 'Find Experts', icon: 'users' },
           { id: 'my-questions', label: 'My Q&A History', icon: 'message-square' },
           { id: 'consults', label: 'Consultations', icon: 'video' }
         ].map((t) => (
           <button 
             key={t.id}
             onClick={() => setActiveView(t.id as any)}
             className={`flex items-center space-x-2 px-6 py-2.5 rounded-[15px] text-[10px] font-black uppercase transition-all ${activeView === t.id ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-emerald-600'}`}
           >
             <i data-lucide={t.icon} className="w-3.5 h-3.5"></i>
             <span>{t.label}</span>
           </button>
         ))}
      </div>

      {activeView === 'experts' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up">
           <div className="lg:col-span-2 space-y-6">
              {experts.map(expert => (
                <div key={expert.id} className="bg-white p-8 rounded-[15px] border border-slate-200 shadow-sm hover:border-emerald-300 transition-all group relative overflow-hidden">
                   <div className="flex flex-col md:flex-row gap-8">
                      <div className="relative shrink-0">
                         <div className="w-24 h-24 bg-slate-100 rounded-[15px] flex items-center justify-center font-black text-3xl text-slate-400">
                            {expert.name.charAt(0)}
                         </div>
                         {expert.verified && (
                           <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-[15px] flex items-center justify-center border-4 border-white shadow-lg text-white">
                              <i data-lucide="check" className="w-5 h-5"></i>
                           </div>
                         )}
                      </div>
                      <div className="flex-1 space-y-4">
                         <div className="flex justify-between items-start">
                            <div>
                               <h3 className="text-2xl font-black text-slate-900 tracking-tight">{expert.name}</h3>
                               <div className="flex items-center space-x-3 mt-1">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-[15px] border border-emerald-100">{expert.role}</span>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{expert.reviewCount} Reviews</span>
                               </div>
                            </div>
                            <div className="flex items-center space-x-1">
                               <i data-lucide="star" className="w-4 h-4 fill-amber-400 text-amber-400"></i>
                               <span className="text-sm font-black text-slate-900">{expert.rating}</span>
                            </div>
                         </div>
                         <p className="text-sm text-slate-500 font-medium leading-relaxed italic line-clamp-2">"{expert.bio}"</p>
                         <div className="flex flex-wrap gap-2">
                            {expert.specializations.map(s => (
                              <span key={s} className="px-3 py-1 bg-slate-50 text-slate-500 text-[9px] font-black uppercase tracking-widest rounded-[15px] border border-slate-100">{s}</span>
                            ))}
                         </div>
                      </div>
                   </div>

                   <div className="mt-8 pt-8 border-t border-slate-50 flex flex-wrap gap-4 justify-between items-center">
                      <div className="flex space-x-8">
                         <div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Response</div>
                            <div className="text-xs font-bold text-slate-700">{expert.responseTime}</div>
                         </div>
                         <div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Languages</div>
                            <div className="text-xs font-bold text-slate-700">{expert.languages.join(', ')}</div>
                         </div>
                      </div>
                      <button 
                        onClick={() => setSelectedExpert(expert)}
                        className="px-8 py-3 bg-slate-950 text-white rounded-[15px] font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl active:scale-95"
                      >
                         Book Call
                      </button>
                   </div>
                </div>
              ))}
           </div>

           <div className="space-y-8">
              <div className="bg-slate-900 p-10 rounded-[15px] text-white space-y-8 relative overflow-hidden">
                 <div className="absolute bottom-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl"></div>
                 <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">Network Impact</h3>
                 <div className="space-y-6">
                    {[
                      { label: 'Experts Online', val: '24', icon: 'zap', color: 'text-emerald-400' },
                      { label: 'Active Advice', val: '1.2K', icon: 'message-circle', color: 'text-blue-400' },
                      { label: 'Problem Solved', val: '8.4K', icon: 'check-circle', color: 'text-amber-400' }
                    ].map((stat, i) => (
                      <div key={i} className="flex items-center space-x-6 p-4 bg-white/5 rounded-[15px] border border-white/10">
                         <div className={`w-10 h-10 rounded-[15px] bg-white/5 flex items-center justify-center ${stat.color}`}>
                            <i data-lucide={stat.icon} className="w-5 h-5"></i>
                         </div>
                         <div>
                            <div className="text-xl font-black">{stat.val}</div>
                            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="p-8 bg-blue-50 rounded-[15px] border border-blue-100 flex items-start space-x-4">
                 <div className="w-10 h-10 bg-white rounded-[15px] flex items-center justify-center shrink-0 shadow-sm">
                    <i data-lucide="award" className="w-6 h-6 text-blue-500"></i>
                 </div>
                 <div>
                    <h4 className="text-[11px] font-black text-blue-900 uppercase tracking-widest">Certified Advice</h4>
                    <p className="text-[11px] text-blue-800 leading-relaxed font-medium mt-1">All advice tagged as 'Verified Solution' is backed by regional agricultural research stations.</p>
                 </div>
              </div>
           </div>
        </div>
      )}

      {activeView === 'my-questions' && (
        <div className="space-y-6 animate-slide-up">
           {questions.length > 0 ? (
             questions.map(q => (
               <div key={q.id} className="bg-white p-10 rounded-[15px] border border-slate-200 shadow-sm space-y-8">
                  <div className="flex justify-between items-start">
                     <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-[15px] flex items-center justify-center ${q.urgency === 'Urgent' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'}`}>
                           <i data-lucide="alert-circle" className="w-6 h-6"></i>
                        </div>
                        <div>
                           <h3 className="text-xl font-black text-slate-900 tracking-tight">{q.title}</h3>
                           <div className="flex items-center space-x-3 mt-1">
                              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-[15px] border ${q.status === 'Answered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400'}`}>{q.status}</span>
                              <span className="text-[10px] font-bold text-slate-400">{new Date(q.createdAt).toLocaleDateString()}</span>
                           </div>
                        </div>
                     </div>
                  </div>
                  
                  <p className="text-sm text-slate-600 leading-relaxed font-medium pl-14 italic">"{q.content}"</p>

                  {q.answer && (
                    <div className="pl-10 md:pl-14 border-l-2 border-emerald-100 space-y-6 animate-fade-in">
                       <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-emerald-600 rounded-[15px] flex items-center justify-center text-white font-black text-sm">SP</div>
                          <div>
                             <div className="text-sm font-black text-slate-900">Dr. Sanjay Patil <span className="ml-2 px-2 py-0.5 bg-blue-50 text-blue-600 text-[8px] font-black uppercase rounded-[15px] tracking-widest">Expert Answer</span></div>
                             <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{new Date(q.answer.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                          </div>
                       </div>
                       <div className="p-6 bg-emerald-50 rounded-[15px] border border-emerald-100 text-emerald-900 text-sm leading-relaxed font-medium">
                          {q.answer.content}
                          {q.answer.references.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-emerald-200/50 flex items-center space-x-4">
                               <span className="text-[10px] font-black uppercase text-emerald-700">References:</span>
                               {q.answer.references.map((ref, idx) => (
                                 <a key={idx} href={ref.url} className="text-[10px] font-bold text-blue-600 hover:underline flex items-center">
                                    <i data-lucide="file-text" className="w-3 h-3 mr-1"></i>
                                    {ref.title}
                                 </a>
                               ))}
                            </div>
                          )}
                       </div>
                    </div>
                  )}
               </div>
             ))
           ) : (
             <div className="py-40 text-center bg-white rounded-[15px] border-2 border-dashed border-slate-200">
                <i data-lucide="message-square" className="w-12 h-12 text-slate-200 mx-auto mb-6"></i>
                <h3 className="text-xl font-black text-slate-900">No questions found</h3>
                <p className="text-slate-400 font-medium max-w-xs mx-auto mt-2">Specialist consultation history will appear here.</p>
             </div>
           )}
        </div>
      )}

      {/* Ask Question Modal */}
      {showAskModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => setShowAskModal(false)}></div>
           <div className="relative bg-white w-full max-w-2xl rounded-[15px] p-12 shadow-2xl overflow-y-auto max-h-[90vh] animate-scale-up">
              <div className="flex justify-between items-center mb-8">
                 <h2 className="text-3xl font-black text-slate-900 tracking-tight">Ask a Specialist</h2>
                 <button onClick={() => setShowAskModal(false)} className="p-3 bg-slate-50 text-slate-400 hover:text-red-500 rounded-[15px] transition-all">
                    <i data-lucide="x" className="w-6 h-6"></i>
                 </button>
              </div>
              <form onSubmit={handleAskSubmit} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Question Summary</label>
                    <input 
                      required
                      type="text" 
                      value={newQuestion.title}
                      onChange={(e) => setNewQuestion({...newQuestion, title: e.target.value})}
                      className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[15px] font-bold text-slate-900" 
                      placeholder="e.g. Unusual wilting in Tomato crop"
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Crop</label>
                       <select 
                         value={newQuestion.cropType}
                         onChange={(e) => setNewQuestion({...newQuestion, cropType: e.target.value})}
                         className="w-full p-4 bg-slate-50 border border-slate-200 rounded-[15px] font-bold"
                       >
                          <option>Grape</option>
                          <option>Onion</option>
                          <option>Tomato</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Urgency</label>
                       <select 
                         value={newQuestion.urgency}
                         onChange={(e) => setNewQuestion({...newQuestion, urgency: e.target.value as any})}
                         className="w-full p-4 bg-slate-50 border border-slate-200 rounded-[15px] font-bold"
                       >
                          <option>Standard</option>
                          <option>Urgent</option>
                          <option>Emergency</option>
                       </select>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Context & Observation</label>
                    <textarea 
                      required
                      rows={4}
                      value={newQuestion.content}
                      onChange={(e) => setNewQuestion({...newQuestion, content: e.target.value})}
                      className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[15px] font-medium text-slate-600"
                      placeholder="Detail the symptoms, recent weather, and any applications you've done..."
                    ></textarea>
                 </div>
                 <button type="submit" className="w-full py-6 bg-emerald-600 text-white rounded-[15px] font-black text-lg hover:bg-emerald-700 active:scale-95 shadow-xl shadow-emerald-100 transition-all">
                    Route to Extension Officer
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* Booking Modal */}
      {selectedExpert && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => setSelectedExpert(null)}></div>
           <div className="relative bg-white w-full max-w-lg rounded-[15px] p-12 shadow-2xl animate-scale-up">
              <div className="flex justify-between items-center mb-10">
                 <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Schedule with <br /> {selectedExpert.name}</h2>
                 <button onClick={() => setSelectedExpert(null)} className="p-3 bg-slate-50 text-slate-400 hover:text-red-500 rounded-[15px] transition-all">
                    <i data-lucide="x" className="w-6 h-6"></i>
                 </button>
              </div>
              <div className="space-y-8">
                 {selectedExpert.availability.map((day, i) => (
                   <div key={i} className="space-y-4">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">{day.day}</h4>
                      <div className="flex flex-wrap gap-2">
                         {day.slots.map(slot => (
                           <button 
                             key={slot}
                             onClick={() => handleBookConsult(selectedExpert, `${day.day} at ${slot}`)}
                             className="px-6 py-2.5 bg-slate-50 border border-slate-100 text-slate-900 rounded-[15px] text-xs font-black hover:bg-emerald-600 hover:text-white transition-all active:scale-95"
                           >
                              {slot}
                           </button>
                         ))}
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      <style>{`
        .animate-fade-in { animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slide-up { animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default ExpertHub;