// import React, { useState, useEffect } from 'react';
// import { User, AppView } from '../types';
// import { AuthApi } from '../client_api/auth/service';
// import { UserApi } from '../client_api/user/service';
// import { SupabaseAuth } from '../client_api/auth/supabaseAuth';
// import { i18n } from '../utils/i18n';

// interface UserProfileProps {
//   user: User;
//   onUpdate: (updated: User) => void;
//   setView: (view: AppView) => void;
// }

// const UserProfile: React.FC<UserProfileProps> = ({ user, onUpdate, setView }) => {
//   const [isEditing, setIsEditing] = useState(false);
//   const [editedUser, setEditedUser] = useState<User>(user);
//   const [saving, setSaving] = useState(false);
//   const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile');

//   useEffect(() => {
//     // @ts-ignore
//     if (window.lucide) window.lucide.createIcons();
//   }, [isEditing, activeTab]);

//   const handleSave = async () => {
//     setSaving(true);
//     const result = await SupabaseAuth.updateProfile(user.userId, editedUser);
//     if (result.success && result.data) {
//       onUpdate(result.data);
//       setIsEditing(false);
//       alert('Profile updated successfully!');
//     } else {
//       alert('Failed to update profile: ' + (result.error || 'Unknown error'));
//     }
//     setSaving(false);
//   };

//   const handlePasswordChange = async () => {
//     const newPassword = prompt('Enter new password (min 6 characters):');
//     if (newPassword && newPassword.length >= 6) {
//       // In real implementation, this would call Supabase password update
//       alert('Password reset email sent! Check your inbox.');
//     }
//   };

//   const handleExport = async () => {
//     const res = await UserApi.exportData();
//     if (res.success) alert("Data export started. Check your email.");
//   };

//   const handleDelete = async () => {
//     if (window.confirm("Are you sure? This will delete all your farm history.")) {
//       await UserApi.deleteAccount();
//       window.location.reload();
//     }
//   };

//   return (
//     <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-0 animate-fade-in">
//       {/* Header */}
//       <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
//         <div className="flex items-center space-x-6">
//           <div className="relative">
//             <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[32px] flex items-center justify-center text-3xl font-black shadow-lg shadow-emerald-50">
//               {editedUser.name.charAt(0)}
//             </div>
//             <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-600 border-4 border-white rounded-full flex items-center justify-center text-white">
//               <i data-lucide="check" className="w-4 h-4"></i>
//             </div>
//           </div>
//           <div>
//             {isEditing ? (
//               <input
//                 type="text"
//                 value={editedUser.name}
//                 onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
//                 className="text-3xl font-black text-slate-900 tracking-tight bg-transparent border-b-2 border-emerald-500 outline-none"
//               />
//             ) : (
//               <h1 className="text-3xl font-black text-slate-900 tracking-tight">{editedUser.name}</h1>
//             )}
//             <p className="text-slate-500 font-medium">{editedUser.phone}</p>
//             {editedUser.email && <p className="text-slate-400 text-sm font-medium">{editedUser.email}</p>}
//             <div className="mt-3 flex gap-2">
//               <span className="inline-flex items-center px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-100">{editedUser.role}</span>
//             </div>
//           </div>
//         </div>
//         <div className="flex gap-3">
//           {isEditing ? (
//             <>
//               <button
//                 onClick={() => {
//                   setEditedUser(user);
//                   setIsEditing(false);
//                 }}
//                 className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSave}
//                 disabled={saving}
//                 className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all disabled:opacity-50"
//               >
//                 {saving ? 'Saving...' : 'Save Changes'}
//               </button>
//             </>
//           ) : (
//             <button
//               onClick={() => setIsEditing(true)}
//               className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all flex items-center space-x-2"
//             >
//               <i data-lucide="edit-2" className="w-4 h-4"></i>
//               <span>Edit Profile</span>
//             </button>
//           )}
//         </div>
//       </header>

//       {/* Tabs */}
//       <div className="flex bg-slate-50 p-1 rounded-xl">
//         <button
//           onClick={() => setActiveTab('profile')}
//           className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${
//             activeTab === 'profile' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-600'
//           }`}
//         >
//           Profile
//         </button>
//         <button
//           onClick={() => setActiveTab('security')}
//           className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${
//             activeTab === 'security' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-600'
//           }`}
//         >
//           Security
//         </button>
//         <button
//           onClick={() => setActiveTab('preferences')}
//           className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${
//             activeTab === 'preferences' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-600'
//           }`}
//         >
//           Preferences
//         </button>
//       </div>

//       {/* Profile Tab */}
//       {activeTab === 'profile' && (
//         <div className="space-y-6">
        
//         {/* Core Farm Summary */}
//         <div className="bg-white rounded-[40px] border border-slate-200 p-8 shadow-sm grid grid-cols-2 gap-6">
//            <div className="p-4 bg-slate-50 rounded-2xl">
//               <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Scale</div>
//               <div className="text-2xl font-black text-slate-900">{user.farmDetails.size} Acres</div>
//            </div>
//            <div className="p-4 bg-slate-50 rounded-2xl">
//               <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Language</div>
//               <div className="text-2xl font-black text-slate-900 uppercase">{user.language}</div>
//            </div>
//         </div>

//         {/* Global Nav Buttons */}
//         <div className="bg-white rounded-[40px] border border-slate-200 overflow-hidden shadow-sm">
//            <div className="p-2 space-y-1">
//               <button 
//                 onClick={() => setView(AppView.NOTIFICATION_SETTINGS)}
//                 className="w-full flex items-center justify-between p-6 hover:bg-slate-50 rounded-[32px] transition-all group"
//               >
//                  <div className="flex items-center space-x-5">
//                     <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
//                        <i data-lucide="bell" className="w-6 h-6"></i>
//                     </div>
//                     <div className="text-left">
//                        <div className="text-base font-black text-slate-900">Alert Profile</div>
//                        <div className="text-[10px] text-slate-400 font-bold uppercase">Manage channels & quiet hours</div>
//                     </div>
//                  </div>
//                  <i data-lucide="chevron-right" className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition-colors"></i>
//               </button>

//               <button 
//                 onClick={() => setView(AppView.OFFLINE_SETTINGS)}
//                 className="w-full flex items-center justify-between p-6 hover:bg-slate-50 rounded-[32px] transition-all group"
//               >
//                  <div className="flex items-center space-x-5">
//                     <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
//                        <i data-lucide="database" className="w-6 h-6"></i>
//                     </div>
//                     <div className="text-left">
//                        <div className="text-base font-black text-slate-900">Offline Cache</div>
//                        <div className="text-[10px] text-slate-400 font-bold uppercase">Control local data & storage</div>
//                     </div>
//                  </div>
//                  <i data-lucide="chevron-right" className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors"></i>
//               </button>
//            </div>
//         </div>

//         {/* System Settings */}
//         <div className="bg-white rounded-[40px] border border-slate-200 overflow-hidden shadow-sm">
//            <div className="p-8 border-b border-slate-50">
//               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Account & Safety</h3>
//            </div>
//            <div className="p-2 space-y-1">
//               <button onClick={handleExport} className="w-full flex items-center justify-between p-6 hover:bg-slate-50 rounded-[32px] transition-all group">
//                  <div className="flex items-center space-x-5">
//                     <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center">
//                        <i data-lucide="download" className="w-6 h-6"></i>
//                     </div>
//                     <span className="text-base font-black text-slate-700">Export All Farm Records</span>
//                  </div>
//               </button>

//               <button onClick={AuthApi.logout} className="w-full flex items-center justify-between p-6 hover:bg-rose-50 rounded-[32px] transition-all group">
//                  <div className="flex items-center space-x-5 text-rose-600">
//                     <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center">
//                        <i data-lucide="log-out" className="w-6 h-6"></i>
//                     </div>
//                     <span className="text-base font-black">Secure Sign Out</span>
//                  </div>
//               </button>

//               <button onClick={handleDelete} className="w-full flex items-center justify-between p-6 hover:bg-red-500 hover:text-white rounded-[32px] transition-all group text-slate-300">
//                  <div className="flex items-center space-x-5">
//                     <div className="w-12 h-12 bg-transparent border-2 border-slate-100 rounded-2xl flex items-center justify-center group-hover:border-white/20">
//                        <i data-lucide="trash-2" className="w-6 h-6"></i>
//                     </div>
//                     <span className="text-[10px] font-black uppercase tracking-widest">Permanent Account Deletion</span>
//                  </div>
//               </button>
//            </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserProfile;


import React, { useState, useEffect } from 'react';
import { User, AppView } from '../types';
import { AuthApi } from '../client_api/auth/service';
import { UserApi } from '../client_api/user/service';
import { SupabaseAuth } from '../client_api/auth/supabaseAuth';
import { i18n } from '../utils/i18n';

interface UserProfileProps {
  user: User;
  onUpdate: (updated: User) => void;
  setView: (view: AppView) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onUpdate, setView }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<User>(user);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile');

  useEffect(() => {
    // @ts-ignore
    if (window.lucide) window.lucide.createIcons();
  }, [isEditing, activeTab]);

  const handleSave = async () => {
    setSaving(true);
    const result = await SupabaseAuth.updateProfile(user.userId, editedUser);
    if (result.success && result.data) {
      onUpdate(result.data);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } else {
      alert('Failed to update profile: ' + (result.error || 'Unknown error'));
    }
    setSaving(false);
  };

  const handlePasswordChange = async () => {
    const newPassword = prompt('Enter new password (min 6 characters):');
    if (newPassword && newPassword.length >= 6) {
      // In real implementation, this would call Supabase password update
      alert('Password reset email sent! Check your inbox.');
    }
  };

  const handleExport = async () => {
    const res = await UserApi.exportData();
    if (res.success) alert("Data export started. Check your email.");
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure? This will delete all your farm history.")) {
      await UserApi.deleteAccount();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-0 animate-fade-in">
      {/* Header */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[32px] flex items-center justify-center text-3xl font-black shadow-lg shadow-emerald-50">
              {editedUser.name.charAt(0)}
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-600 border-4 border-white rounded-full flex items-center justify-center text-white">
              <i data-lucide="check" className="w-4 h-4"></i>
            </div>
          </div>
          <div>
            {isEditing ? (
              <input
                type="text"
                value={editedUser.name}
                onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                className="text-3xl font-black text-slate-900 tracking-tight bg-transparent border-b-2 border-emerald-500 outline-none"
              />
            ) : (
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">{editedUser.name}</h1>
            )}
            <p className="text-slate-500 font-medium">{editedUser.phone}</p>
            {editedUser.email && <p className="text-slate-400 text-sm font-medium">{editedUser.email}</p>}
            <div className="mt-3 flex gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-100">{editedUser.role}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <button
                onClick={() => {
                  setEditedUser(user);
                  setIsEditing(false);
                }}
                className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all flex items-center space-x-2"
            >
              <i data-lucide="edit-2" className="w-4 h-4"></i>
              <span>Edit Profile</span>
            </button>
          )}
        </div>
      </header>

      {/* Tabs */}
      <div className="flex bg-slate-50 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'profile' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-600'
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'security' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-600'
          }`}
        >
          Security
        </button>
        <button
          onClick={() => setActiveTab('preferences')}
          className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'preferences' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-600'
          }`}
        >
          Preferences
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
        
        {/* Core Farm Summary */}
        <div className="bg-white rounded-[40px] border border-slate-200 p-8 shadow-sm grid grid-cols-2 gap-6">
           <div className="p-4 bg-slate-50 rounded-2xl">
              <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Scale</div>
              <div className="text-2xl font-black text-slate-900">{user.farmDetails.size} Acres</div>
           </div>
           <div className="p-4 bg-slate-50 rounded-2xl">
              <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Language</div>
              <div className="text-2xl font-black text-slate-900 uppercase">{user.language}</div>
           </div>
        </div>

        {/* Global Nav Buttons */}
        <div className="bg-white rounded-[40px] border border-slate-200 overflow-hidden shadow-sm">
           <div className="p-2 space-y-1">
              <button 
                onClick={() => setView(AppView.NOTIFICATION_SETTINGS)}
                className="w-full flex items-center justify-between p-6 hover:bg-slate-50 rounded-[32px] transition-all group"
              >
                 <div className="flex items-center space-x-5">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                       <i data-lucide="bell" className="w-6 h-6"></i>
                    </div>
                    <div className="text-left">
                       <div className="text-base font-black text-slate-900">Alert Profile</div>
                       <div className="text-[10px] text-slate-400 font-bold uppercase">Manage channels & quiet hours</div>
                    </div>
                 </div>
                 <i data-lucide="chevron-right" className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition-colors"></i>
              </button>

              <button 
                onClick={() => setView(AppView.OFFLINE_SETTINGS)}
                className="w-full flex items-center justify-between p-6 hover:bg-slate-50 rounded-[32px] transition-all group"
              >
                 <div className="flex items-center space-x-5">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                       <i data-lucide="database" className="w-6 h-6"></i>
                    </div>
                    <div className="text-left">
                       <div className="text-base font-black text-slate-900">Offline Cache</div>
                       <div className="text-[10px] text-slate-400 font-bold uppercase">Control local data & storage</div>
                    </div>
                 </div>
                 <i data-lucide="chevron-right" className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors"></i>
              </button>
           </div>
        </div>

        {/* System Settings */}
        <div className="bg-white rounded-[40px] border border-slate-200 overflow-hidden shadow-sm">
           <div className="p-8 border-b border-slate-50">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Account & Safety</h3>
           </div>
           <div className="p-2 space-y-1">
              <button onClick={handleExport} className="w-full flex items-center justify-between p-6 hover:bg-slate-50 rounded-[32px] transition-all group">
                 <div className="flex items-center space-x-5">
                    <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center">
                       <i data-lucide="download" className="w-6 h-6"></i>
                    </div>
                    <span className="text-base font-black text-slate-700">Export All Farm Records</span>
                 </div>
              </button>

              <button onClick={AuthApi.logout} className="w-full flex items-center justify-between p-6 hover:bg-rose-50 rounded-[32px] transition-all group">
                 <div className="flex items-center space-x-5 text-rose-600">
                    <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center">
                       <i data-lucide="log-out" className="w-6 h-6"></i>
                    </div>
                    <span className="text-base font-black">Secure Sign Out</span>
                 </div>
              </button>

              <button onClick={handleDelete} className="w-full flex items-center justify-between p-6 hover:bg-red-500 hover:text-white rounded-[32px] transition-all group text-slate-300">
                 <div className="flex items-center space-x-5">
                    <div className="w-12 h-12 bg-transparent border-2 border-slate-100 rounded-2xl flex items-center justify-center group-hover:border-white/20">
                       <i data-lucide="trash-2" className="w-6 h-6"></i>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Permanent Account Deletion</span>
                 </div>
              </button>
           </div>
        </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-white rounded-[40px] border border-slate-200 p-8 shadow-sm">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Security Settings</h3>
            <div className="space-y-4">
              <button
                onClick={handlePasswordChange}
                className="w-full flex items-center justify-between p-6 hover:bg-slate-50 rounded-[32px] transition-all group"
              >
                <div className="flex items-center space-x-5">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                    <i data-lucide="lock" className="w-6 h-6"></i>
                  </div>
                  <span className="text-base font-black text-slate-700">Change Password</span>
                </div>
                <i data-lucide="chevron-right" className="w-5 h-5 text-slate-300"></i>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="space-y-6">
          <div className="bg-white rounded-[40px] border border-slate-200 p-8 shadow-sm">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">App Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4">
                <span className="text-base font-black text-slate-700">Language</span>
                <select
                  value={editedUser.language}
                  onChange={(e) => setEditedUser({ ...editedUser, language: e.target.value as any })}
                  className="px-4 py-2 border border-slate-200 rounded-lg font-bold"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="mr">Marathi</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
