import React, { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { QAApi } from '../api/qa/service';
import { PipelineStage, TestCoverage, UATFeedback, LoadTestMetric } from '../types';

const QADashboard: React.FC = () => {
  const [pipeline, setPipeline] = useState<PipelineStage[]>([]);
  const [coverage, setCoverage] = useState<TestCoverage | null>(null);
  const [feedback, setFeedback] = useState<UATFeedback[]>([]);
  const [loadMetrics, setLoadMetrics] = useState<LoadTestMetric | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTriggering, setIsTriggering] = useState(false);

  useEffect(() => {
    loadQAData();
  }, []);

  useEffect(() => {
    const win = window as any;
    if (win.lucide) win.lucide.createIcons();
  }, [loading, pipeline, coverage, feedback, loadMetrics]);

  const loadQAData = async () => {
    setLoading(true);
    const [pRes, cRes, fRes, lRes] = await Promise.all([
      QAApi.getPipeline(),
      QAApi.getCoverage(),
      QAApi.getUATFeedback(),
      QAApi.getLoadMetrics()
    ]);

    if (pRes.success) setPipeline(pRes.data || []);
    if (cRes.success) setCoverage(cRes.data || null);
    if (fRes.success) setFeedback(fRes.data || []);
    if (lRes.success) setLoadMetrics(lRes.data || null);
    setLoading(false);
  };

  const runFullSuite = async () => {
    setIsTriggering(true);
    await QAApi.triggerPipeline();
    setTimeout(() => {
      loadQAData();
      setIsTriggering(false);
    }, 2000);
  };

  const coveragePie = coverage ? [
    { name: 'Covered', value: coverage.total, color: '#10b981' },
    { name: 'Gap', value: 100 - coverage.total, color: '#f1f5f9' }
  ] : [];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-6"></div>
        <p className="text-slate-500 font-black uppercase tracking-widest text-xs animate-pulse">Initializing QA Audit Hub...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-24 animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-slate-900 text-blue-400 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest mb-4">
             <i data-lucide="shield-check" className="w-3 h-3 mr-2"></i>
             QA & DevOps Framework Active
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Quality Assurance</h1>
          <p className="text-slate-500 font-medium">Monitoring code coverage, automated tests, and UAT feedback</p>
        </div>
        <button 
          onClick={runFullSuite}
          disabled={isTriggering}
          className="px-10 py-5 bg-emerald-600 text-white rounded-[32px] font-black text-lg shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center space-x-3 active:scale-95 disabled:bg-slate-200"
        >
          {isTriggering ? <i data-lucide="refresh-cw" className="w-6 h-6 animate-spin"></i> : <i data-lucide="play" className="w-6 h-6"></i>}
          <span>Run Deployment Suite</span>
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Pipeline Visualizer */}
        <div className="lg:col-span-8 space-y-8">
           <div className="bg-white p-10 rounded-[56px] border border-slate-200 shadow-sm overflow-hidden">
              <h3 className="text-xl font-black text-slate-950 mb-12 flex items-center gap-3">
                 <i data-lucide="git-merge" className="w-6 h-6 text-slate-400"></i>
                 CI/CD Pipeline: production-main
              </h3>
              <div className="relative flex flex-col md:flex-row justify-between items-center gap-8 md:gap-4">
                 {/* Connection Lines (Desktop Only) */}
                 <div className="hidden md:block absolute top-10 left-0 right-0 h-px border-t-2 border-dashed border-slate-100 -z-0"></div>
                 
                 {pipeline.map((stage, i) => (
                   <div key={stage.id} className="relative z-10 flex flex-col items-center text-center space-y-4 group">
                      <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center border-4 border-white shadow-xl transition-all ${
                        stage.status === 'SUCCESS' ? 'bg-emerald-500 text-white' : 
                        stage.status === 'RUNNING' ? 'bg-blue-500 text-white animate-pulse' : 
                        stage.status === 'FAILED' ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-300'
                      }`}>
                         <i data-lucide={
                           stage.status === 'SUCCESS' ? 'check' : 
                           stage.status === 'RUNNING' ? 'loader-2' : 
                           stage.status === 'FAILED' ? 'x' : 'clock'
                         } className={`w-8 h-8 ${stage.status === 'RUNNING' ? 'animate-spin' : ''}`}></i>
                      </div>
                      <div>
                         <div className="text-xs font-black text-slate-900 tracking-tight">{stage.name}</div>
                         <div className="text-[9px] font-bold text-slate-400 uppercase">{stage.durationMs > 0 ? `${(stage.durationMs/1000).toFixed(1)}s` : 'Queued'}</div>
                      </div>
                      
                      {/* Terminal Hover Popover Mockup */}
                      <div className="absolute top-24 scale-0 group-hover:scale-100 transition-all z-50 w-64 p-4 bg-slate-950 rounded-2xl shadow-2xl text-left border border-white/10">
                         <div className="text-[8px] font-black text-emerald-400 uppercase tracking-widest mb-2">Build Logs</div>
                         {stage.logs.map((log, li) => (
                           <div key={li} className="text-[9px] font-mono text-slate-500 mb-1">{log}</div>
                         ))}
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           {/* Load Performance Tool */}
           <div className="bg-slate-950 p-10 rounded-[56px] text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10 flex flex-col md:flex-row gap-12">
                 <div className="flex-1 space-y-8">
                    <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
                       <i data-lucide="zap" className="w-6 h-6 text-emerald-400"></i>
                       API Stress Monitor
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                          <div className="text-[10px] font-black uppercase opacity-40 mb-1">Concurrent Users</div>
                          <div className="text-4xl font-black text-white">{loadMetrics?.concurrentUsers.toLocaleString()}</div>
                          <div className="mt-2 text-[9px] font-bold text-emerald-400">Stable Node</div>
                       </div>
                       <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                          <div className="text-[10px] font-black uppercase opacity-40 mb-1">Error Frequency</div>
                          <div className="text-4xl font-black text-rose-400">{(loadMetrics?.errorRate || 0) * 100}%</div>
                          <div className="mt-2 text-[9px] font-bold text-rose-400">Target: &lt; 0.5%</div>
                       </div>
                    </div>
                    <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4">
                       <div className="flex justify-between items-center text-[10px] font-black uppercase opacity-40">
                          <span>Pod Resource Consumption</span>
                          <span>Auto-scaling: Enabled</span>
                       </div>
                       <div className="space-y-4">
                          <div className="space-y-1">
                             <div className="flex justify-between text-xs font-bold"><span>CPU Usage</span><span>{loadMetrics?.cpuUsage}%</span></div>
                             <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500" style={{ width: `${loadMetrics?.cpuUsage}%` }}></div>
                             </div>
                          </div>
                          <div className="space-y-1">
                             <div className="flex justify-between text-xs font-bold"><span>RAM Allocation</span><span>{loadMetrics?.memoryUsage}%</span></div>
                             <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500" style={{ width: `${loadMetrics?.memoryUsage}%` }}></div>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
                 <div className="md:w-1/3 flex flex-col justify-between border-l border-white/10 md:pl-12 pt-12 md:pt-0">
                    <div className="space-y-4">
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Regional Node Status</h4>
                       <div className="space-y-3">
                          {['MH-Mumbai-1', 'MH-Pune-1', 'KA-Bangalore-2'].map(node => (
                            <div key={node} className="flex justify-between items-center text-xs">
                               <span className="font-bold">{node}</span>
                               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-glow"></div>
                            </div>
                          ))}
                       </div>
                    </div>
                    <button className="w-full mt-10 py-5 bg-white text-slate-950 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-xl">
                       Trigger Scalability Test
                    </button>
                 </div>
              </div>
           </div>
        </div>

        {/* Coverage & UAT Sidebars */}
        <div className="lg:col-span-4 space-y-8">
           <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm space-y-8">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Code Test Coverage</h3>
              <div className="relative h-64">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie
                          data={coveragePie}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={8}
                          dataKey="value"
                       >
                          {coveragePie.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                       </Pie>
                       <Tooltip />
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className="text-3xl font-black text-slate-900">{coverage?.total}%</div>
                    <div className="text-[8px] font-black text-slate-400 uppercase">Avg Coverage</div>
                 </div>
              </div>
              <div className="space-y-4">
                 {[
                   { label: 'Unit Tests', val: coverage?.unit, icon: 'code', color: 'text-blue-500' },
                   { label: 'Integration', val: coverage?.integration, icon: 'layers', color: 'text-purple-500' },
                   { label: 'E2E (Mobile)', val: coverage?.e2e, icon: 'smartphone', color: 'text-amber-500' }
                 ].map(item => (
                   <div key={item.label} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                      <div className="flex items-center space-x-3">
                         <i data-lucide={item.icon} className={`w-4 h-4 ${item.color}`}></i>
                         <span className="text-xs font-black text-slate-700">{item.label}</span>
                      </div>
                      <span className="text-sm font-black text-slate-900">{item.val}%</span>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm space-y-8">
              <div className="flex justify-between items-center px-2">
                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">UAT Beta Feedback</h3>
                 <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[8px] font-black uppercase">Live Sync</span>
              </div>
              <div className="space-y-6">
                 {feedback.map(f => (
                   <div key={f.id} className="space-y-3 p-6 bg-slate-50 rounded-[32px] border border-transparent hover:border-emerald-200 transition-all cursor-pointer">
                      <div className="flex justify-between items-start">
                         <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-black text-[10px] text-slate-400 shadow-sm">{f.userName.charAt(0)}</div>
                            <div>
                               <div className="text-xs font-black text-slate-900">{f.userName}</div>
                               <div className="text-[8px] font-bold text-slate-400 uppercase">{f.category}</div>
                            </div>
                         </div>
                         <div className="flex text-amber-400">
                            {Array.from({ length: f.rating }).map((_, ri) => (
                               <i key={ri} data-lucide="star" className="w-2.5 h-2.5 fill-current"></i>
                            ))}
                         </div>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed italic">"{f.comment}"</p>
                   </div>
                 ))}
              </div>
              <button className="w-full py-4 bg-slate-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all">
                 Full Survey Analytics
              </button>
           </div>
        </div>
      </div>

      <style>{`
        .animate-fade-in { animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slide-up { animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .shadow-glow { box-shadow: 0 0 10px rgba(16, 185, 129, 0.5); }
      `}</style>
    </div>
  );
};

export default QADashboard;