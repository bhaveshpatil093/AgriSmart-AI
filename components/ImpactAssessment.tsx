
import React, { useState, useEffect } from 'react';
import { ImpactApi } from '../api/impact/service';
import { CropsApi } from '../api/crops/service';
import { WeatherApi } from '../api/weather/service';
import { WeatherImpactAssessment, DamageReport, Crop } from '../types';

const ImpactAssessment: React.FC = () => {
  const [assessments, setAssessments] = useState<WeatherImpactAssessment[]>([]);
  const [reports, setReports] = useState<DamageReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'assessments' | 'reports'>('assessments');
  const [showReportForm, setShowReportForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // @ts-ignore
    if (window.lucide) window.lucide.createIcons();
  }, [loading, assessments, reports, activeTab, showReportForm]);

  const loadData = async () => {
    setLoading(true);
    const userId = 'u123';
    const [cropsRes, weatherRes, reportsRes] = await Promise.all([
      CropsApi.getByUser(userId),
      WeatherApi.getForLocation('Nashik'),
      ImpactApi.getReports(userId)
    ]);

    if (cropsRes.success && weatherRes.success) {
      const assessmentPromises = cropsRes.data!.map(crop => 
        ImpactApi.getAssessment(crop, weatherRes.data!)
      );
      const assessmentResults = await Promise.all(assessmentPromises);
      setAssessments(assessmentResults.map(r => r.data!));
    }

    if (reportsRes.success) setReports(reportsRes.data || []);
    setLoading(false);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'High': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Moderate': return 'text-amber-600 bg-amber-50 border-amber-200';
      default: return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        <p className="text-slate-500 font-medium">Running Nashik vulnerability models...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 md:pb-0 animate-fade-in">
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-950 tracking-tight">Weather Impact Center</h1>
          <p className="text-slate-500 font-medium">Monitoring extreme climatic risks for Nashik belts</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-sm">
          <button 
            onClick={() => setActiveTab('assessments')}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'assessments' ? 'bg-white text-red-700 shadow-sm' : 'text-slate-500'}`}
          >
            Real-time Risk
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'reports' ? 'bg-white text-red-700 shadow-sm' : 'text-slate-500'}`}
          >
            Damage Audit
          </button>
        </div>
      </header>

      {activeTab === 'assessments' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {assessments.map((item, idx) => (
            <div key={idx} className="bg-white rounded-[40px] border border-slate-200 p-10 shadow-sm space-y-8 relative overflow-hidden group hover:border-red-200 transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">{item.cropName}</h3>
                  <div className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getRiskColor(item.riskLevel)}`}>
                    {item.riskLevel} Hazard
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-black text-slate-900">{item.riskScore}%</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Risk Score</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Potential Loss</div>
                    <div className="text-2xl font-black text-red-600">-{item.potentialYieldLoss}%</div>
                 </div>
                 <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Risk Factors</div>
                    <div className="text-2xl font-black text-slate-900">{item.vulnerabilities.length}</div>
                 </div>
              </div>

              <section className="space-y-4">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Regional Vulnerabilities</h4>
                 <div className="space-y-3">
                    {item.vulnerabilities.map((v, i) => (
                      <div key={i} className="flex items-start p-4 bg-white border border-slate-100 rounded-2xl">
                         <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-4 shrink-0 ${v.impact === 'High' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                            <i data-lucide="alert-triangle" className="w-4 h-4"></i>
                         </div>
                         <div>
                            <div className="text-xs font-black text-slate-900 uppercase tracking-tight">{v.factor}</div>
                            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{v.description}</p>
                         </div>
                      </div>
                    ))}
                 </div>
              </section>

              <div className="pt-6 border-t border-slate-50 flex gap-4">
                 <button className="flex-1 py-4 bg-slate-950 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all">
                    Protective Protocol
                 </button>
              </div>
            </div>
          ))}

          {/* Insurance Claims Section */}
          <div className="lg:col-span-2 bg-emerald-950 p-12 rounded-[48px] text-white relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
             <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                   <div className="inline-flex px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-500/10">PMFBY Support</div>
                   <h2 className="text-4xl font-black tracking-tighter leading-none">Crop Insurance <br /> Claims Helper</h2>
                   <p className="text-emerald-100/70 leading-relaxed font-medium">Our AI compiles decadal weather snapshots and localized alerts to help you file insurance claims under Pradhan Mantri Fasal Bima Yojana.</p>
                </div>
                <div className="bg-white/5 p-8 rounded-[40px] border border-white/10 backdrop-blur-md">
                   <h4 className="font-bold text-lg mb-6">Claim Readiness Audit</h4>
                   <div className="space-y-4 mb-8">
                      <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
                        <span className="opacity-60">Weather Logs</span>
                        <span className="text-emerald-400 font-black">SYNCED</span>
                      </div>
                      <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
                        <span className="opacity-60">Anomaly Proof</span>
                        <span className="text-emerald-400 font-black">VALIDATED</span>
                      </div>
                   </div>
                   <button className="w-full py-4 bg-white text-slate-950 rounded-2xl font-black text-sm hover:bg-slate-100 transition-all shadow-xl">
                      Generate Documentation
                   </button>
                </div>
             </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in">
          <div className="flex justify-between items-center px-4">
             <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Recent Damage Logs</h2>
             <button 
               onClick={() => setShowReportForm(true)}
               className="px-6 py-2.5 bg-red-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg"
             >
               Log Incident
             </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {reports.map((report) => (
               <div key={report.id} className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
                  <div className="flex justify-between items-center">
                     <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center">
                           <i data-lucide="cloud-lightning" className="w-5 h-5"></i>
                        </div>
                        <div>
                           <div className="text-xs font-black text-slate-900 uppercase tracking-tight">{report.weatherType}</div>
                           <div className="text-[10px] text-slate-400 font-bold">{report.incidentDate}</div>
                        </div>
                     </div>
                     <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${report.status === 'Verified' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                        {report.status}
                     </span>
                  </div>
                  <div>
                     <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Yield Impact</div>
                     <div className="text-3xl font-black text-red-600">-{report.estimatedLoss}%</div>
                  </div>
                  <p className="text-xs text-slate-500 font-medium italic leading-relaxed">"{report.notes}"</p>
               </div>
             ))}
          </div>
        </div>
      )}

      {showReportForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => setShowReportForm(false)}></div>
           <div className="relative bg-white w-full max-w-lg rounded-[48px] p-12 shadow-2xl">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-8">Report Farm Damage</h2>
              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Crop Impacted</label>
                    <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold">
                       <option>Grapes (Thompson Seedless)</option>
                       <option>Onion (Baswant 780)</option>
                       <option>Tomato (Abhinav)</option>
                    </select>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Incident Date</label>
                       <input type="date" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Climate Event</label>
                       <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold">
                          <option>Hail</option>
                          <option>Frost</option>
                          <option>Waterlogging</option>
                          <option>Wind Damage</option>
                       </select>
                    </div>
                 </div>
                 <button className="w-full py-5 bg-red-600 text-white rounded-3xl font-black text-lg shadow-xl shadow-red-100 active:scale-95 transition-all">
                    File Claim Report
                 </button>
              </div>
           </div>
        </div>
      )}

      <style>{`
        .animate-fade-in { animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default ImpactAssessment;
