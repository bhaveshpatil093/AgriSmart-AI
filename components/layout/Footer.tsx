import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-slate-100 bg-white py-12 px-6">
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-emerald-600/10 text-emerald-600 rounded-lg flex items-center justify-center font-black">
            <i data-lucide="sprout" className="w-4 h-4"></i>
          </div>
          <span className="text-sm font-black text-slate-900 tracking-tighter">AgriSmart Nashik Platform</span>
        </div>

        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <a href="#" className="hover:text-emerald-600 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-emerald-600 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-emerald-600 transition-colors">Safety Guidelines</a>
          <a href="#" className="hover:text-emerald-600 transition-colors">Regional Labs</a>
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 text-[10px] font-black text-slate-400">
            <i data-lucide="globe" className="w-3 h-3 text-emerald-500"></i>
            <select className="bg-transparent border-none focus:outline-none cursor-pointer hover:text-emerald-600">
              <option>Marathi</option>
              <option>English</option>
              <option>Hindi</option>
            </select>
          </div>
          <p className="text-[10px] font-bold text-slate-400">© 2024 AgriSmart Nashik</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
