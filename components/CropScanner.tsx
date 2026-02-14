import React, { useState, useRef, useEffect } from 'react';
import { analyzeCropImage } from '../services/geminiService';
import { PestApi } from '../api/pest/service';
import { PestDetection, OutbreakZone } from '../types';

const CropScanner: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<PestDetection | null>(null);
  const [outbreaks, setOutbreaks] = useState<OutbreakZone[]>([]);
  const [cropType, setCropType] = useState('Grape');
  const [location, setLocation] = useState('Nashik Central');
  const [viewMode, setViewMode] = useState<'scanner' | 'outbreak'>('scanner');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadOutbreaks();
  }, []);

  useEffect(() => {
    const win = window as any;
    if (win.lucide) win.lucide.createIcons();
  }, [image, analysis, loading, outbreaks, viewMode]);

  const loadOutbreaks = async () => {
    const res = await PestApi.getRegionalOutbreaks(location);
    if (res.success) setOutbreaks(res.data || []);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        handleAnalysis(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalysis = async (base64Data: string) => {
    setLoading(true);
    setAnalysis(null);
    try {
      const pureBase64 = base64Data.split(',')[1];
      const result = await analyzeCropImage(pureBase64, cropType, location);
      
      const fullDetection: PestDetection = {
        id: Math.random().toString(36).substr(2, 9),
        cropType,
        location,
        timestamp: new Date().toISOString(),
        imageUrl: base64Data,
        isVerified: false,
        ...result
      };

      await PestApi.saveDetection(fullDetection);
      setAnalysis(fullDetection);
    } catch (err) {
      console.error(err);
      alert("AI Diagnostic failed. Ensure your image has good lighting.");
    } finally {
      setLoading(false);
    }
  };

  const severityColors = {
    Low: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Moderate: 'bg-amber-100 text-amber-700 border-amber-200',
    High: 'bg-orange-100 text-orange-700 border-orange-200',
    Critical: 'bg-red-100 text-red-700 border-red-200'
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 md:pb-0 animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">AI Pest Diagnostic</h1>
          <p className="text-slate-500 font-medium">Computer vision diagnostics for Nashik cultivators</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
           <button 
             onClick={() => setViewMode('scanner')}
             className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${viewMode === 'scanner' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'}`}
           >
             Visual Scan
           </button>
           <button 
             onClick={() => setViewMode('outbreak')}
             className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${viewMode === 'outbreak' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'}`}
           >
             Outbreak Map
           </button>
        </div>
      </header>

      {viewMode === 'scanner' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
             <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-6">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Scan Configuration</h3>
                <div className="space-y-4">
                   <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Target Crop</label>
                      <select 
                        value={cropType}
                        onChange={(e) => setCropType(e.target.value)}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold appearance-none"
                      >
                         <option>Grape</option>
                         <option>Onion</option>
                         <option>Tomato</option>
                      </select>
                   </div>
                   <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Detection Location</label>
                      <div className="relative">
                         <input 
                           type="text" 
                           value={location}
                           onChange={(e) => setLocation(e.target.value)}
                           className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold"
                         />
                         <i data-lucide="map-pin" className="absolute right-4 top-4 w-5 h-5 text-emerald-600"></i>
                      </div>
                   </div>
                </div>
             </div>

             <div 
               onClick={() => !loading && fileInputRef.current?.click()}
               className={`aspect-square relative rounded-[40px] border-4 border-dashed overflow-hidden flex flex-col items-center justify-center cursor-pointer transition-all ${image ? 'border-emerald-500' : 'border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300'}`}
             >
                {image ? (
                  <img src={image} className="w-full h-full object-cover" alt="Scan target" />
                ) : (
                  <div className="text-center p-10">
                     <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-lg mx-auto mb-6 text-emerald-600">
                        <i data-lucide="camera" className="w-10 h-10"></i>
                     </div>
                     <span className="text-lg font-black text-slate-900 block">Snap or Upload</span>
                     <span className="text-sm text-slate-400 font-medium mt-2 block">Ensure clear focus on symptoms</span>
                  </div>
                )}
                {loading && (
                   <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md flex flex-col items-center justify-center text-white">
                      <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                      <span className="text-xs font-black uppercase tracking-widest">Gemini Analyzing...</span>
                   </div>
                )}
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
             </div>
             
             {image && !loading && (
                <button 
                  onClick={() => { setImage(null); setAnalysis(null); }}
                  className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all"
                >
                   Clear Image
                </button>
             )}
          </div>

          <div className="lg:col-span-2">
             {analysis ? (
               <div className="bg-white rounded-[48px] border border-slate-200 shadow-sm overflow-hidden animate-slide-up">
                  <div className="p-10 border-b border-slate-50 flex justify-between items-start">
                     <div>
                        <div className="flex items-center space-x-3 mb-2">
                           <h2 className="text-3xl font-black text-slate-900 tracking-tight">{analysis.diagnosis_en}</h2>
                           <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${severityColors[analysis.severity]}`}>
                              {analysis.severity} Risk
                           </span>
                        </div>
                        <h3 className="text-xl font-bold text-emerald-700 tracking-tight">{analysis.diagnosis_mr}</h3>
                     </div>
                     <div className="text-right">
                        <div className="text-4xl font-black text-slate-900">{Math.round(analysis.confidence * 100)}%</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">AI Confidence</div>
                     </div>
                  </div>

                  <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                     <section className="space-y-6">
                        <div>
                           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                              <i data-lucide="eye" className="w-3 h-3 mr-2"></i>
                              Key Symptoms Identified
                           </h4>
                           <ul className="space-y-3">
                              {analysis.symptoms.map((s, i) => (
                                <li key={i} className="flex items-start text-sm text-slate-600 font-medium">
                                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 mr-3 shrink-0"></div>
                                   {s}
                                </li>
                              ))}
                           </ul>
                        </div>
                        <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                           <h4 className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-2">Organic Treatment</h4>
                           <p className="text-xs text-emerald-900 font-medium leading-relaxed">{analysis.organic_treatment}</p>
                        </div>
                     </section>

                     <section className="space-y-6">
                        <div className="p-6 bg-slate-900 rounded-3xl text-white">
                           <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Standard Protocol (Chemical)</h4>
                           <p className="text-xs text-slate-300 font-medium leading-relaxed">{analysis.chemical_treatment}</p>
                        </div>
                        <div>
                           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Prevention (Next Cycle)</h4>
                           <p className="text-xs text-slate-600 font-medium leading-relaxed">{analysis.prevention}</p>
                        </div>
                        <div className="pt-6 border-t border-slate-100 flex space-x-3">
                           <button className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all">
                              Download PDF Report
                           </button>
                           <button className="p-4 bg-slate-50 text-slate-400 hover:text-emerald-600 rounded-2xl transition-colors">
                              <i data-lucide="share-2" className="w-5 h-5"></i>
                           </button>
                        </div>
                     </section>
                  </div>
                  
                  <div className="px-10 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                     <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-400 uppercase">
                        <i data-lucide="shield-check" className="w-4 h-4"></i>
                        <span>Community Status: Pending Expert Validation</span>
                     </div>
                     <button className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                        Flag for Review
                     </button>
                  </div>
               </div>
             ) : (
               <div className="h-full flex flex-col items-center justify-center py-40 text-center bg-white rounded-[48px] border border-dashed border-slate-200">
                  <div className="w-24 h-24 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mb-8">
                     <i data-lucide="scan" className="w-12 h-12"></i>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">Awaiting Diagnostic...</h3>
                  <p className="text-slate-500 max-w-md mt-4 font-medium leading-relaxed">
                     Our vision system is tuned to detect regional variants of Mildew, Blight, and Thrips. Upload a leaf photo to begin.
                  </p>
               </div>
             )}
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm relative overflow-hidden">
                 <h3 className="text-xl font-black text-slate-950 mb-1">Nashik Outbreak Heatmap</h3>
                 <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-10">Active Detections (Last 72 Hours)</p>
                 
                 <div className="space-y-6">
                    {outbreaks.map((zone, i) => (
                      <div key={i} className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 flex items-center justify-between group hover:bg-white hover:border-emerald-300 transition-all cursor-pointer">
                         <div className="flex items-center space-x-6">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${zone.riskLevel === 'High' ? 'bg-red-100 text-red-600' : zone.riskLevel === 'Medium' ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>
                               {zone.count}
                            </div>
                            <div>
                               <div className="text-sm font-black text-slate-900 tracking-tight">{zone.village}</div>
                               <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{zone.disease}</div>
                            </div>
                         </div>
                         <div className="text-right">
                            <div className={`text-[10px] font-black uppercase tracking-widest ${zone.riskLevel === 'High' ? 'text-red-600' : 'text-slate-400'}`}>
                               {zone.riskLevel} Risk
                            </div>
                            <div className="flex items-center space-x-1 mt-1 justify-end">
                               {[1, 2, 3].map(dot => (
                                 <div key={dot} className={`w-1 h-1 rounded-full ${dot <= (zone.riskLevel === 'High' ? 3 : zone.riskLevel === 'Medium' ? 2 : 1) ? 'bg-red-400' : 'bg-slate-200'}`}></div>
                               ))}
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="bg-slate-950 p-10 rounded-[48px] text-white space-y-8 shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                 <div className="relative z-10">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-8">
                       <i data-lucide="shield-alert" className="w-8 h-8 text-emerald-400"></i>
                    </div>
                    <h3 className="text-4xl font-black tracking-tighter leading-tight mb-4">Outbreak Prevention <br /> Mode Active</h3>
                    <p className="text-slate-400 leading-relaxed font-medium mb-10">We detected a cluster of Downy Mildew cases 12km upwind from your location. We recommend a preventive spray of Bordeaux mixture within 48 hours.</p>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-6 bg-white/5 rounded-3xl border border-white/10 text-center">
                          <div className="text-[10px] font-black uppercase opacity-40 mb-2">My Proximity</div>
                          <div className="text-2xl font-black text-emerald-400">12 KM</div>
                       </div>
                       <div className="p-6 bg-white/5 rounded-3xl border border-white/10 text-center">
                          <div className="text-[10px] font-black uppercase opacity-40 mb-2">Wind Vector</div>
                          <div className="text-2xl font-black text-blue-400">NE → SW</div>
                       </div>
                    </div>
                    <button className="w-full mt-10 py-5 bg-white text-slate-950 rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-slate-100 active:scale-95 transition-all">
                       Alert Neighbors (5 Farmers)
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      <style>{`
        .animate-fade-in { animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slide-up { animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default CropScanner;