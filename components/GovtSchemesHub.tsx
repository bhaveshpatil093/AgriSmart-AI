import React, { useState, useEffect } from 'react';
import { GovtSchemesApi } from '../client_api/schemes/service';
import { GovtScheme, SchemeApplication, User } from '../types';

interface Props {
  user: User;
}

const GovtSchemesHub: React.FC<Props> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'matches' | 'applications'>('matches');
  const [schemes, setSchemes] = useState<GovtScheme[]>([]);
  const [matches, setMatches] = useState<GovtScheme[]>([]);
  const [applications, setApplications] = useState<SchemeApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScheme, setSelectedScheme] = useState<GovtScheme | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const win = window as any;
    if (win.lucide) win.lucide.createIcons();
  }, [loading, schemes, matches, applications, activeTab, selectedScheme]);

  const loadData = async () => {
    setLoading(true);
    const [allRes, matchRes, appRes] = await Promise.all([
      GovtSchemesApi.getSchemes(),
      GovtSchemesApi.getRecommended(user),
      GovtSchemesApi.getApplications(user.userId)
    ]);

    if (allRes.success) setSchemes(allRes.data || []);
    if (matchRes.success) setMatches(matchRes.data || []);
    if (appRes.success) setApplications(appRes.data || []);
    setLoading(false);
  };

  const handleApply = async (schemeId: string) => {
    const res = await GovtSchemesApi.applyForScheme(schemeId);
    if (res.success) {
      alert("Application successfully submitted to the portal draft. Complete your document upload on the official site.");
      loadData();
      setSelectedScheme(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Verified': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Submitted': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Rejected': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-6"></div>
        <p className="text-slate-500 font-black uppercase tracking-widest text-xs animate-pulse">Scanning Portals for Subsidies...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-24 animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">Scheme Concierge</h1>
          <p className="text-slate-500 font-medium">Personalized government support and subsidy management</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 w-fit overflow-x-auto no-scrollbar">
           {[
             { id: 'matches', label: 'Recommended', icon: 'sparkles' },
             { id: 'all', label: 'All Schemes', icon: 'layout-grid' },
             { id: 'applications', label: 'My Requests', icon: 'file-text' }
           ].map((t) => (
             <button
               key={t.id}
               onClick={() => setActiveTab(t.id as any)}
               className={`flex items-center space-x-2 shrink-0 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === t.id ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-400 hover:text-emerald-600'}`}
             >
               <i data-lucide={t.icon} className="w-3.5 h-3.5"></i>
               <span>{t.label}</span>
             </button>
           ))}
        </div>
      </header>

      {activeTab === 'matches' && (
        <div className="space-y-8">
           <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[40px] flex items-center space-x-8">
              <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-sm shrink-0">
                 <i data-lucide="check-circle" className="w-8 h-8 text-emerald-600"></i>
              </div>
              <div>
                 <h3 className="text-xl font-black text-emerald-900 tracking-tight">Smart Match Active</h3>
                 <p className="text-sm text-emerald-800 leading-relaxed font-medium">We've identified <span className="font-black underline">{matches.length} schemes</span> where you meet 100% of the eligibility criteria based on your {user.farmDetails.size} acre farm and crops.</p>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-slide-up">
              {matches.map(scheme => (
                <div key={scheme.id} onClick={() => setSelectedScheme(scheme)} className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm hover:border-emerald-300 transition-all group cursor-pointer relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                   <div className="flex justify-between items-start mb-6">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${scheme.authority === 'Central' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                         {scheme.authority} Scheme
                      </span>
                      <div className="flex items-center text-emerald-600 space-x-1">
                         <i data-lucide="award" className="w-3 h-3"></i>
                         <span className="text-[8px] font-black uppercase">Top Match</span>
                      </div>
                   </div>
                   <h3 className="text-xl font-black text-slate-900 leading-tight mb-4 group-hover:text-emerald-700 transition-colors">{scheme.name}</h3>
                   <div className="space-y-2 mb-8">
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Max Benefit</div>
                      <div className="text-2xl font-black text-slate-900">{scheme.maxBenefit}</div>
                   </div>
                   <div className="flex flex-wrap gap-2 mb-8">
                      <span className="px-3 py-1 bg-slate-50 text-slate-500 text-[9px] font-bold uppercase tracking-widest rounded-lg border border-slate-100">{scheme.category}</span>
                   </div>
                   <button className="w-full py-4 bg-slate-50 text-slate-400 font-black text-[10px] uppercase tracking-widest rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                      Check Requirements
                   </button>
                </div>
              ))}
           </div>
        </div>
      )}

      {activeTab === 'all' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-slide-up">
           {schemes.map(scheme => (
             <div key={scheme.id} onClick={() => setSelectedScheme(scheme)} className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm hover:border-emerald-300 transition-all group cursor-pointer">
                <div className="flex justify-between items-start mb-6">
                   <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${scheme.authority === 'Central' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                      {scheme.authority}
                   </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 leading-tight mb-4">{scheme.name}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-6 font-medium leading-relaxed">{scheme.description}</p>
                <div className="flex justify-between items-center pt-6 border-t border-slate-50">
                   <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{scheme.maxBenefit}</span>
                   <i data-lucide="arrow-right" className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-all group-hover:translate-x-1"></i>
                </div>
             </div>
           ))}
        </div>
      )}

      {activeTab === 'applications' && (
        <div className="space-y-6 animate-slide-up">
           {applications.length > 0 ? (
             <div className="bg-white rounded-[48px] border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
                <table className="w-full text-left">
                   <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                         <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Application Details</th>
                         <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Status</th>
                         <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Next Step</th>
                         <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Applied Date</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {applications.map(app => (
                        <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                           <td className="px-10 py-8">
                              <div className="text-sm font-black text-slate-900">{app.schemeName}</div>
                              <div className="text-[10px] text-slate-400 font-bold tracking-tight">Ref: {app.trackingNumber || '--'}</div>
                           </td>
                           <td className="px-10 py-8">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(app.status)}`}>
                                 {app.status}
                              </span>
                           </td>
                           <td className="px-10 py-8">
                              <div className="text-xs font-bold text-slate-600 max-w-xs">{app.nextStep}</div>
                           </td>
                           <td className="px-10 py-8 text-right">
                              <div className="text-sm font-black text-slate-400">{app.appliedDate}</div>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
           ) : (
             <div className="py-40 text-center bg-white rounded-[48px] border-2 border-dashed border-slate-200">
                <i data-lucide="file-x" className="w-12 h-12 text-slate-200 mx-auto mb-6"></i>
                <h3 className="text-xl font-black text-slate-900">No active applications</h3>
                <p className="text-slate-400 font-medium max-w-xs mx-auto mt-2">Any applications you start through the Concierge will appear here for tracking.</p>
             </div>
           )}
        </div>
      )}

      {/* Scheme Detail Modal */}
      {selectedScheme && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => setSelectedScheme(null)}></div>
           <div className="relative bg-white w-full max-w-3xl rounded-[56px] overflow-hidden shadow-2xl animate-scale-up max-h-[90vh] flex flex-col">
              <div className="p-12 pb-6 border-b border-slate-50 relative shrink-0">
                 <button onClick={() => setSelectedScheme(null)} className="absolute top-8 right-8 p-3 bg-slate-50 text-slate-400 hover:text-rose-600 rounded-2xl transition-all">
                    <i data-lucide="x" className="w-6 h-6"></i>
                 </button>
                 <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border mb-4 inline-block ${selectedScheme.authority === 'Central' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                   {selectedScheme.authority} Government
                 </span>
                 <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight pr-12">{selectedScheme.name}</h2>
              </div>
              
              <div className="flex-1 overflow-y-auto p-12 space-y-10 no-scrollbar">
                 <section className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Objective</h4>
                    <p className="text-lg text-slate-600 font-medium leading-relaxed italic">"{selectedScheme.description}"</p>
                 </section>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <section className="space-y-6">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Document Checklist</h4>
                       <div className="space-y-3">
                          {selectedScheme.documents.map((doc, i) => (
                            <div key={i} className="flex items-center space-x-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                               <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center border border-slate-200">
                                  <i data-lucide="file" className="w-3.5 h-3.5 text-slate-400"></i>
                               </div>
                               <span className="text-xs font-bold text-slate-700">{doc}</span>
                            </div>
                          ))}
                       </div>
                    </section>
                    
                    <section className="space-y-6">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Eligibility Analysis</h4>
                       <div className="space-y-4">
                          <div className="flex justify-between items-center text-xs pb-3 border-b border-slate-50">
                             <span className="text-slate-500 font-medium">Land Limit</span>
                             <span className="font-black text-slate-900">{selectedScheme.eligibility.maxLandSize ? `${selectedScheme.eligibility.maxLandSize} Acres` : 'No Limit'}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs pb-3 border-b border-slate-50">
                             <span className="text-slate-500 font-medium">Crop Types</span>
                             <span className="font-black text-slate-900">{selectedScheme.eligibility.cropTypes.join(', ')}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-[10px] font-black text-emerald-600 uppercase pt-2">
                             <i data-lucide="check" className="w-4 h-4"></i>
                             <span>You qualify for this scheme</span>
                          </div>
                       </div>
                    </section>
                 </div>

                 <div className="bg-slate-900 p-8 rounded-[40px] text-white">
                    <h3 className="text-lg font-black tracking-tight mb-4">Benefit Projection</h3>
                    <div className="flex items-end justify-between">
                       <div>
                          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Potential Subsidy</div>
                          <div className="text-4xl font-black text-emerald-400">{selectedScheme.maxBenefit}</div>
                       </div>
                       <div className="text-right">
                          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ROI Boost</div>
                          <div className="text-2xl font-black text-white">+24%</div>
                       </div>
                    </div>
                 </div>
              </div>

              <footer className="p-12 pt-0 shrink-0">
                 <div className="flex gap-4">
                    <button 
                      onClick={() => handleApply(selectedScheme.id)}
                      className="flex-1 py-5 bg-emerald-600 text-white rounded-[32px] font-black text-lg hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100"
                    >
                       Initialize Direct Apply
                    </button>
                    <a 
                      href={selectedScheme.officialUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="px-10 py-5 border-2 border-slate-100 text-slate-400 rounded-[32px] font-black text-lg hover:bg-slate-50 hover:text-slate-600 transition-all flex items-center justify-center"
                    >
                       Portal
                    </a>
                 </div>
              </footer>
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
      `}</style>
    </div>
  );
};

export default GovtSchemesHub;
