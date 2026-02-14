import React, { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { JobApi } from '../api/jobs/service';
import { BackgroundJob, SystemEvent, JobStatus } from '../types';

const SystemJobsDashboard: React.FC = () => {
  const [jobs, setJobs] = useState<BackgroundJob[]>([]);
  const [events, setEvents] = useState<SystemEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING'>('ALL');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // Polling for job status
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const win = window as any;
    if (win.lucide) win.lucide.createIcons();
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [loading, jobs, events]);

  const loadData = async () => {
    const [jobsRes, eventsRes] = await Promise.all([
      JobApi.getJobs(),
      JobApi.getEvents()
    ]);
    if (jobsRes.success) setJobs(jobsRes.data || []);
    if (eventsRes.success) setEvents(eventsRes.data || []);
    setLoading(false);
  };

  const handleRunJob = async (id: string) => {
    await JobApi.triggerJob(id);
    loadData();
  };

  const filteredEvents = events.filter(e => {
    if (filter === 'ALL') return true;
    return e.severity === filter;
  });

  const getStatusStyle = (status: JobStatus) => {
    switch (status) {
      case 'RUNNING': return 'bg-blue-500 animate-pulse text-white';
      case 'SUCCESS': return 'bg-emerald-500 text-white';
      case 'FAILED': return 'bg-rose-500 text-white';
      default: return 'bg-slate-200 text-slate-500';
    }
  };

  const mockPerfData = [
    { name: '00:00', load: 12 }, { name: '04:00', load: 85 }, { name: '08:00', load: 45 },
    { name: '12:00', load: 30 }, { name: '16:00', load: 60 }, { name: '20:00', load: 25 }
  ];

  if (loading && jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-6"></div>
        <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Connecting to Cloud Resource Manager...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-24 animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-slate-900 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest mb-4">
             <i data-lucide="cloud" className="w-3 h-3 mr-2"></i>
             GCP Cloud Scheduler: Active
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">System Automations</h1>
          <p className="text-slate-500 font-medium">Monitoring recurring pipelines and event-driven functions</p>
        </div>
        <div className="flex gap-4">
           <div className="p-4 bg-white border border-slate-200 rounded-[32px] flex items-center space-x-6 shadow-sm">
              <div className="text-center">
                 <div className="text-xl font-black text-slate-900">99.9%</div>
                 <div className="text-[8px] font-black text-slate-400 uppercase">Uptime</div>
              </div>
              <div className="w-px h-8 bg-slate-100"></div>
              <div className="text-center">
                 <div className="text-xl font-black text-emerald-600">Active</div>
                 <div className="text-[8px] font-black text-slate-400 uppercase">Worker Node</div>
              </div>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Scheduled Jobs Table */}
        <div className="lg:col-span-8 space-y-8">
           <div className="bg-white rounded-[48px] border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center">
                 <h2 className="text-xl font-black text-slate-900 tracking-tight">Cloud Scheduler Tasks</h2>
                 <button onClick={loadData} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors">
                    <i data-lucide="refresh-cw" className="w-4 h-4"></i>
                 </button>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <th className="px-10 py-5">Pipeline Name</th>
                          <th className="px-10 py-5">Schedule (Cron)</th>
                          <th className="px-10 py-5 text-center">Status</th>
                          <th className="px-10 py-5">Last Run</th>
                          <th className="px-10 py-5"></th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {jobs.map((job) => (
                         <tr key={job.id} className="group hover:bg-slate-50/50 transition-colors">
                            <td className="px-10 py-8">
                               <div className="font-black text-slate-900">{job.name}</div>
                               <div className="text-[9px] text-slate-400 font-medium max-w-[200px] truncate">{job.description}</div>
                            </td>
                            <td className="px-10 py-8">
                               <code className="px-2 py-1 bg-slate-100 rounded text-[10px] font-mono text-slate-600">{job.schedule}</code>
                            </td>
                            <td className="px-10 py-8 text-center">
                               <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${getStatusStyle(job.status)}`}>
                                  {job.status}
                               </span>
                            </td>
                            <td className="px-10 py-8">
                               <div className="text-[10px] font-bold text-slate-600">
                                  {new Date(job.lastRun).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                               </div>
                               <div className="text-[8px] text-slate-400 font-black uppercase tracking-tight">Success: {job.successRate}%</div>
                            </td>
                            <td className="px-10 py-8 text-right">
                               <button 
                                 onClick={() => handleRunJob(job.id)}
                                 disabled={job.status === 'RUNNING'}
                                 className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-200 rounded-xl transition-all shadow-sm active:scale-90"
                               >
                                  <i data-lucide="play" className="w-4 h-4 fill-current"></i>
                               </button>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>

           {/* Event Stream (Terminal UI) */}
           <div className="bg-slate-950 rounded-[48px] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col h-[500px]">
              <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10 flex flex-col h-full">
                 <div className="flex justify-between items-center mb-8 shrink-0">
                    <div>
                       <h3 className="text-xl font-black tracking-tight">Cloud Functions Log</h3>
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1">Event-Driven Execution Stream</p>
                    </div>
                    <div className="flex bg-white/5 p-1 rounded-xl">
                       {['ALL', 'CRITICAL'].map(f => (
                         <button 
                           key={f} 
                           onClick={() => setFilter(f as any)}
                           className={`px-4 py-1.5 rounded-lg text-[9px] font-black transition-all ${filter === f ? 'bg-emerald-500 text-white' : 'text-slate-500'}`}
                         >
                           {f}
                         </button>
                       ))}
                    </div>
                 </div>
                 
                 <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar font-mono text-[11px] space-y-4 pb-4">
                    {filteredEvents.map((evt) => (
                      <div key={evt.id} className="animate-fade-in flex space-x-4 border-l-2 border-white/5 pl-4 hover:border-emerald-500/50 transition-colors">
                         <span className="text-slate-600 shrink-0">[{new Date(evt.timestamp).toLocaleTimeString()}]</span>
                         <span className={`font-black shrink-0 ${evt.severity === 'CRITICAL' ? 'text-rose-400' : evt.severity === 'WARNING' ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {evt.type}
                         </span>
                         <span className="text-slate-400 leading-relaxed">{evt.message}</span>
                         <span className="text-[9px] text-slate-700 italic ml-auto uppercase tracking-tighter">src:{evt.source}</span>
                      </div>
                    ))}
                    {filteredEvents.length === 0 && (
                       <div className="text-slate-600 italic">No events currently being processed...</div>
                    )}
                 </div>
              </div>
           </div>
        </div>

        {/* Sidebar Controls */}
        <div className="lg:col-span-4 space-y-8">
           <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm space-y-8">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Resource Monitoring</h3>
              <div className="space-y-6">
                 <div>
                    <div className="flex justify-between items-end mb-2">
                       <span className="text-[10px] font-black uppercase text-slate-500">Instance CPU (Auto-scaling)</span>
                       <span className="text-sm font-black text-slate-900">42%</span>
                    </div>
                    <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500" style={{ width: '42%' }}></div>
                    </div>
                 </div>
                 <div>
                    <div className="flex justify-between items-end mb-2">
                       <span className="text-[10px] font-black uppercase text-slate-500">Active Function Queues</span>
                       <span className="text-sm font-black text-slate-900">12 / 100</span>
                    </div>
                    <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden">
                       <div className="h-full bg-blue-500" style={{ width: '12%' }}></div>
                    </div>
                 </div>
              </div>
              <div className="h-40">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockPerfData}>
                       <defs>
                          <linearGradient id="loadGradient" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                             <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <Area type="monotone" dataKey="load" stroke="#10b981" fill="url(#loadGradient)" strokeWidth={2} dot={false} />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed font-medium italic text-center">Peak activity at 05:00 AM due to global advisory generation window.</p>
           </div>

           <div className="bg-emerald-950 p-10 rounded-[48px] text-white space-y-8 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-3xl"></div>
              <div className="relative z-10 space-y-6">
                 <h4 className="text-lg font-black tracking-tight">Vertex AI Hub Connection</h4>
                 <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                       <i data-lucide="cpu" className="w-5 h-5 text-emerald-400"></i>
                    </div>
                    <div>
                       <div className="text-xs font-black uppercase">Model Artifacts</div>
                       <div className="text-sm font-bold text-emerald-400">Nashik-Ensemble-v4</div>
                    </div>
                 </div>
                 <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-black uppercase opacity-60">
                       <span>Predictive Confidence</span>
                       <span>94.8%</span>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-400" style={{ width: '94.8%' }}></div>
                    </div>
                 </div>
                 <button className="w-full py-4 bg-white text-slate-950 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-400 transition-all">
                    Access Training Logs
                 </button>
              </div>
           </div>
        </div>
      </div>

      <style>{`
        .animate-fade-in { animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slide-up { animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default SystemJobsDashboard;