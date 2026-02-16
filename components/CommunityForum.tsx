import React, { useState, useEffect } from 'react';
import { CommunityApi } from '../client_api/community/service';
import { CommunityPost, CommunityReply, ForumCategory } from '../types';

type FeedType = 'latest' | 'trending' | 'unanswered' | 'village' | 'my-posts' | 'following' | 'expert';

const CommunityForum: React.FC = () => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [filter, setFilter] = useState<FeedType>('latest');
  const [activeCategory, setActiveCategory] = useState<ForumCategory | 'All'>('All');
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'feed' | 'detail' | 'create'>('feed');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  useEffect(() => {
    if (currentView === 'feed') {
      loadPosts();
    }
  }, [filter, activeCategory, currentView]);

  useEffect(() => {
    const win = window as any;
    if (win.lucide) win.lucide.createIcons();
  }, [loading, posts, currentView, filter, activeCategory]);

  const loadPosts = async () => {
    setLoading(true);
    const cat = activeCategory === 'All' ? undefined : activeCategory;
    const res = await CommunityApi.getFeed(filter, cat);
    if (res.success) setPosts(res.data || []);
    setLoading(false);
  };

  const openPost = (id: string) => {
    setSelectedPostId(id);
    setCurrentView('detail');
  };

  const categories: (ForumCategory | 'All')[] = ['All', 'Crop Management', 'Pest Control', 'Market Trends', 'Climate Change', 'Equipment'];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-24 animate-fade-in">
      {currentView === 'feed' && (
        <div className="space-y-8">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Farmer Commons</h1>
              <p className="text-slate-500 font-medium">Connect, Share, and Learn from the Nashik farming network</p>
            </div>
            <button 
              onClick={() => setCurrentView('create')}
              className="bg-emerald-600 text-white px-10 py-4 rounded-[15px] font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95 flex items-center space-x-3"
            >
              <i data-lucide="plus-circle" className="w-5 h-5"></i>
              <span>Create Post</span>
            </button>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar Left */}
            <div className="lg:col-span-3 space-y-8">
               <div className="bg-white p-8 rounded-[15px] border border-slate-200 shadow-sm space-y-6">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Navigation</h3>
                  <div className="space-y-1">
                     {[
                       { id: 'latest', label: 'Global Feed', icon: 'globe' },
                       { id: 'trending', label: 'Trending Now', icon: 'zap' },
                       { id: 'following', label: 'Following', icon: 'users' },
                       { id: 'expert', label: 'Expert Verified', icon: 'shield-check' },
                       { id: 'my-posts', label: 'My Contributions', icon: 'user' }
                     ].map((t) => (
                       <button
                         key={t.id}
                         onClick={() => setFilter(t.id as FeedType)}
                         className={`w-full flex items-center space-x-4 px-6 py-4 rounded-[15px] text-xs font-black transition-all ${filter === t.id ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'}`}
                       >
                         <i data-lucide={t.icon} className="w-4 h-4"></i>
                         <span>{t.label}</span>
                       </button>
                     ))}
                  </div>
               </div>

               <div className="bg-white p-8 rounded-[15px] border border-slate-200 shadow-sm space-y-6">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Explore Categories</h3>
                  <div className="flex flex-wrap gap-2">
                     {categories.map((cat) => (
                       <button
                         key={cat}
                         onClick={() => setActiveCategory(cat)}
                         className={`px-4 py-2 rounded-[15px] text-[10px] font-black uppercase transition-all ${activeCategory === cat ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-100'}`}
                       >
                         {cat}
                       </button>
                     ))}
                  </div>
               </div>
            </div>

            {/* Main Feed */}
            <div className="lg:col-span-6 space-y-6">
               {loading ? (
                 <div className="py-40 flex flex-col items-center justify-center bg-white rounded-[15px] border border-slate-100 shadow-sm">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-6"></div>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest animate-pulse">Syncing Discussions...</p>
                 </div>
               ) : posts.length > 0 ? (
                 <div className="space-y-6">
                    {posts.map((post) => (
                      <div 
                        key={post.postId} 
                        onClick={() => openPost(post.postId)}
                        className="bg-white p-10 rounded-[15px] border border-slate-200 shadow-sm hover:border-emerald-300 hover:shadow-2xl transition-all group cursor-pointer relative overflow-hidden"
                      >
                         <div className="flex justify-between items-start mb-8">
                            <div className="flex items-center space-x-4">
                               <img src={post.userAvatar || `https://ui-avatars.com/api/?name=${post.userName}&background=random`} className="w-14 h-14 rounded-[15px] object-cover shadow-sm" alt="" />
                               <div>
                                  <div className="flex items-center space-x-2">
                                     <span className="text-base font-black text-slate-900">{post.userName}</span>
                                     <span className="text-[10px] font-black text-slate-300">•</span>
                                     <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{post.userReputation} Rep</span>
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                     {post.location.village} • {new Date(post.createdAt).toLocaleDateString()}
                                  </div>
                               </div>
                            </div>
                            <div className={`px-3 py-1 rounded-[15px] text-[9px] font-black uppercase tracking-widest border ${post.category === 'Pest Control' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                               {post.category}
                            </div>
                         </div>

                         <div className="flex gap-8">
                            <div className="flex-1 space-y-4">
                               <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight group-hover:text-emerald-700 transition-colors">
                                  {post.title}
                               </h2>
                               <p className="text-base text-slate-500 font-medium leading-relaxed line-clamp-3">
                                  {post.snippet || post.content}
                               </p>
                            </div>
                            {post.imageUrl && (
                               <div className="w-40 h-40 shrink-0 rounded-[15px] overflow-hidden border border-slate-100 hidden md:block shadow-sm">
                                  <img src={post.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                               </div>
                            )}
                         </div>

                         <div className="flex flex-wrap gap-2 mt-8">
                            {post.tags.map(tag => (
                              <span key={tag} className="px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-widest rounded-[15px]">#{tag}</span>
                            ))}
                         </div>

                         <div className="flex items-center justify-between mt-10 pt-8 border-t border-slate-50">
                            <div className="flex items-center space-x-8">
                               <div className="flex items-center space-x-2 text-slate-400">
                                  <i data-lucide="arrow-big-up" className="w-6 h-6"></i>
                                  <span className="text-sm font-black">{post.upvotes}</span>
                               </div>
                               <div className="flex items-center space-x-2 text-slate-400">
                                  <i data-lucide="message-circle" className="w-6 h-6"></i>
                                  <span className="text-sm font-black">{post.replyCount}</span>
                               </div>
                               <div className="flex items-center space-x-2 text-slate-400">
                                  <i data-lucide="eye" className="w-6 h-6"></i>
                                  <span className="text-sm font-black">{post.viewCount}</span>
                               </div>
                            </div>
                            <div className="flex space-x-3">
                               <button className={`p-3 rounded-[15px] border transition-all ${post.isBookmarked ? 'bg-amber-50 text-amber-500 border-amber-200' : 'bg-slate-50 text-slate-400 border-transparent hover:bg-amber-50'}`}>
                                  <i data-lucide="bookmark" className="w-5 h-5"></i>
                               </button>
                               <button className="px-6 py-3 bg-slate-900 text-white rounded-[15px] font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center space-x-2">
                                  <span>View Discuss</span>
                                  <i data-lucide="arrow-right" className="w-3 h-3"></i>
                               </button>
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
               ) : (
                 <div className="py-40 text-center bg-white rounded-[15px] border-2 border-dashed border-slate-200 shadow-sm">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-200">
                       <i data-lucide="message-square" className="w-12 h-12"></i>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900">No discussions found</h3>
                    <p className="text-sm text-slate-400 font-medium max-w-xs mx-auto mt-4 leading-relaxed">Try adjusting your filters or be the first to share something with the community.</p>
                 </div>
               )}
            </div>

            {/* Right Sidebar: Trending & Reputation */}
            <div className="lg:col-span-3 space-y-8">
               <div className="bg-slate-950 p-10 rounded-[15px] text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-[80px]"></div>
                  <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] mb-8">Trending Topics</h3>
                  <div className="space-y-6">
                     {[
                       { tag: 'DownyMildewAlert', count: 124, trend: 'up' },
                       { tag: 'OnionPriceSpike', count: 85, trend: 'up' },
                       { tag: 'DripSubsidyMH', count: 42, trend: 'down' },
                       { tag: ' ThompsonGrapes', count: 31, trend: 'up' }
                     ].map((t, i) => (
                       <div key={i} className="flex justify-between items-center group cursor-pointer">
                          <div>
                             <div className="text-sm font-black group-hover:text-emerald-400 transition-colors">#{t.tag}</div>
                             <div className="text-[9px] text-slate-500 font-bold uppercase">{t.count} Active Posts</div>
                          </div>
                          <i data-lucide={t.trend === 'up' ? "trending-up" : "trending-down"} className={`w-4 h-4 ${t.trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}></i>
                       </div>
                     ))}
                  </div>
               </div>

               <div className="bg-white p-8 rounded-[15px] border border-slate-200 shadow-sm space-y-8">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Community Stats</h3>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-5 bg-slate-50 rounded-[15px] text-center">
                        <div className="text-2xl font-black text-slate-900">12.4K</div>
                        <div className="text-[8px] font-black text-slate-400 uppercase mt-1">Total Members</div>
                     </div>
                     <div className="p-5 bg-slate-50 rounded-[15px] text-center">
                        <div className="text-2xl font-black text-emerald-600">840</div>
                        <div className="text-[8px] font-black text-slate-400 uppercase mt-1">Experts Online</div>
                     </div>
                  </div>
                  <div className="p-6 bg-blue-50 border border-blue-100 rounded-[15px]">
                     <div className="flex items-center space-x-3 mb-2">
                        <i data-lucide="award" className="w-4 h-4 text-blue-600"></i>
                        <span className="text-[10px] font-black text-blue-800 uppercase">Top Reviewer Today</span>
                     </div>
                     <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center font-black text-[10px] text-blue-600 shadow-sm">DP</div>
                        <span className="text-xs font-black text-slate-800">Dinesh Patil</span>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {currentView === 'detail' && selectedPostId && (
        <PostDetailView postId={selectedPostId} onBack={() => setCurrentView('feed')} />
      )}

      {currentView === 'create' && (
        <PostCreator onCancel={() => setCurrentView('feed')} onSuccess={() => setCurrentView('feed')} />
      )}

      <style>{`
        .animate-fade-in { animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slide-up { animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-scale-up { animation: scale-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scale-up { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

/* --- SUB-COMPONENTS --- */

const PostDetailView: React.FC<{ postId: string; onBack: () => void }> = ({ postId, onBack }) => {
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [sortReplies, setSortReplies] = useState<'top' | 'recent' | 'expert'>('expert');

  useEffect(() => {
    loadPost();
  }, [postId]);

  useEffect(() => {
    const win = window as any;
    if (win.lucide) win.lucide.createIcons();
  }, [loading, post, replyText]);

  const loadPost = async () => {
    setLoading(true);
    const res = await CommunityApi.getPost(postId);
    if (res.success) setPost(res.data || null);
    setLoading(false);
  };

  const handleSubmitReply = async () => {
    if (!replyText.trim()) return;
    const res = await CommunityApi.replyToPost(postId, replyText);
    if (res.success) {
      setReplyText('');
      loadPost();
    }
  };

  if (loading || !post) return (
    <div className="py-40 flex flex-col items-center justify-center bg-white rounded-[15px] border border-slate-100 shadow-sm">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-6"></div>
      <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Opening Discussion...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-slide-up">
       <button onClick={onBack} className="flex items-center space-x-3 text-slate-400 hover:text-emerald-600 transition-colors group">
          <div className="p-3 bg-white border border-slate-200 rounded-[15px] group-hover:border-emerald-300">
             <i data-lucide="arrow-left" className="w-5 h-5"></i>
          </div>
          <span className="text-xs font-black uppercase tracking-widest">Back to Commons</span>
       </button>

       <article className="bg-white p-12 lg:p-20 rounded-[15px] border border-slate-200 shadow-sm space-y-12">
          <header className="space-y-10">
             <div className="flex flex-wrap gap-4 justify-between items-start">
                <div className="flex items-center space-x-5">
                   <img src={post.userAvatar || `https://ui-avatars.com/api/?name=${post.userName}&background=random`} className="w-20 h-20 rounded-[15px] object-cover shadow-sm border-4 border-slate-50" alt="" />
                   <div className="space-y-1">
                      <div className="flex items-center space-x-3">
                         <h1 className="text-xl font-black text-slate-900">{post.userName}</h1>
                         <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase rounded-[15px] tracking-[0.2em] border border-emerald-100">Regional Member</span>
                      </div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{post.location.village}, Nashik District • {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                   </div>
                </div>
                <div className="flex gap-3">
                   <button className="p-4 bg-slate-50 text-slate-400 rounded-[15px] hover:bg-emerald-50 hover:text-emerald-600 transition-all shadow-sm">
                      <i data-lucide="share-2" className="w-6 h-6"></i>
                   </button>
                   <button className="px-8 py-4 bg-slate-900 text-white rounded-[15px] font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl active:scale-95">
                      Follow Author
                   </button>
                </div>
             </div>
             <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter leading-[1.1]">{post.title}</h2>
          </header>

          <div className="prose prose-slate max-w-none">
             <p className="text-lg text-slate-600 leading-[1.8] font-medium whitespace-pre-wrap italic">"{post.content}"</p>
          </div>

          {post.imageGallery && post.imageGallery.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
               {post.imageGallery.map((img, i) => (
                 <div key={i} className="aspect-video rounded-[15px] overflow-hidden border border-slate-100 shadow-sm cursor-zoom-in">
                    <img src={img} className="w-full h-full object-cover" alt="" />
                 </div>
               ))}
            </div>
          )}

          <div className="pt-10 border-t border-slate-50 flex items-center justify-between">
             <div className="flex items-center space-x-8">
                <button className="flex items-center space-x-3 text-slate-400 hover:text-emerald-600 group transition-all">
                   <div className="w-12 h-12 bg-slate-50 rounded-[15px] flex items-center justify-center group-hover:bg-emerald-50 group-hover:scale-110 transition-all shadow-sm">
                      <i data-lucide="arrow-big-up" className="w-7 h-7"></i>
                   </div>
                   <span className="text-base font-black text-slate-900">{post.upvotes}</span>
                </button>
                <div className="flex items-center space-x-3 text-slate-400">
                   <i data-lucide="message-circle" className="w-7 h-7"></i>
                   <span className="text-base font-black text-slate-900">{post.replyCount}</span>
                </div>
             </div>
             <div className="flex items-center space-x-3">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Share to:</span>
                <button className="w-10 h-10 bg-[#25D366] text-white rounded-[15px] flex items-center justify-center shadow-lg active:scale-90 transition-transform"><i data-lucide="phone" className="w-5 h-5 fill-current"></i></button>
                <button className="w-10 h-10 bg-[#1DA1F2] text-white rounded-[15px] flex items-center justify-center shadow-lg active:scale-90 transition-transform"><i data-lucide="twitter" className="w-5 h-5 fill-current"></i></button>
             </div>
          </div>
       </article>

       <section className="space-y-10">
          <div className="flex justify-between items-end px-4">
             <h3 className="text-2xl font-black text-slate-900 tracking-tight">Community Answers</h3>
             <div className="flex items-center space-x-3 bg-slate-100 p-1 rounded-[15px] border border-slate-200">
                {['top', 'expert', 'recent'].map(s => (
                  <button 
                    key={s} 
                    onClick={() => setSortReplies(s as any)}
                    className={`px-4 py-2 rounded-[15px] text-[10px] font-black uppercase transition-all ${sortReplies === s ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-400'}`}
                  >
                    {s}
                  </button>
                ))}
             </div>
          </div>

          <div className="space-y-8">
             {post.replies.map((reply) => (
               <ReplyCard key={reply.replyId} reply={reply} />
             ))}
          </div>

          {/* Quick Reply Form */}
          <div className="bg-white p-10 rounded-[15px] border-2 border-emerald-100 shadow-xl shadow-emerald-50 space-y-6">
             <div className="flex items-center space-x-4 mb-2">
                <i data-lucide="message-square" className="w-6 h-6 text-emerald-600"></i>
                <h4 className="text-xl font-black text-slate-900 tracking-tight">Your Contribution</h4>
             </div>
             <textarea 
               value={replyText}
               onChange={(e) => setReplyText(e.target.value)}
               placeholder="Add your insight or answer here..."
               className="w-full bg-slate-50 border border-slate-200 rounded-[15px] p-8 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[150px] leading-relaxed"
             />
             <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                   <button className="p-3 bg-slate-50 text-slate-400 hover:text-emerald-600 rounded-[15px] transition-colors"><i data-lucide="image" className="w-5 h-5"></i></button>
                   <button className="p-3 bg-slate-50 text-slate-400 hover:text-emerald-600 rounded-[15px] transition-colors"><i data-lucide="paperclip" className="w-5 h-5"></i></button>
                </div>
                <button 
                  onClick={handleSubmitReply}
                  disabled={!replyText.trim()}
                  className="bg-emerald-600 text-white px-10 py-4 rounded-[15px] font-black text-sm uppercase tracking-widest hover:bg-emerald-700 transition-all active:scale-95 disabled:bg-slate-200 shadow-lg shadow-emerald-100"
                >
                  Submit Answer
                </button>
             </div>
          </div>
       </section>
    </div>
  );
};

const ReplyCard: React.FC<{ reply: CommunityReply }> = ({ reply }) => {
  return (
    <div className={`space-y-6 animate-fade-in ${reply.isExpertAnswer ? 'bg-emerald-50/30 p-10 rounded-[15px] border border-emerald-100' : 'bg-white p-10 rounded-[15px] border border-slate-200 shadow-sm'}`}>
       <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
             <img src={reply.userAvatar || `https://ui-avatars.com/api/?name=${reply.userName}&background=random`} className="w-12 h-12 rounded-[15px] object-cover shadow-sm" alt="" />
             <div>
                <div className="flex items-center space-x-2">
                   <span className="text-sm font-black text-slate-900">{reply.userName}</span>
                   {reply.userBadge === 'Expert' && (
                     <span className="flex items-center space-x-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-[8px] font-black uppercase rounded-[15px] tracking-widest border border-blue-200">
                        <i data-lucide="check-badge" className="w-2.5 h-2.5"></i>
                        <span>Verified Specialist</span>
                     </span>
                   )}
                </div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
             </div>
          </div>
          <button className="text-slate-400 hover:text-emerald-600">
             <i data-lucide="more-horizontal" className="w-5 h-5"></i>
          </button>
       </div>
       <p className="text-sm text-slate-600 leading-relaxed font-medium pl-2 italic">"{reply.content}"</p>
       <div className="flex items-center space-x-8 pt-4 border-t border-slate-50/50">
          <button className="flex items-center space-x-2 text-slate-400 hover:text-emerald-600 transition-colors">
             <i data-lucide="arrow-big-up" className="w-5 h-5"></i>
             <span className="text-xs font-black">{reply.upvotes}</span>
          </button>
          <button className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Reply to this</button>
          <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-auto hover:text-rose-500">Flag</button>
       </div>

       {reply.replies && reply.replies.length > 0 && (
         <div className="pl-12 pt-6 border-l-2 border-emerald-100 space-y-6">
            {reply.replies.map(sub => (
              <ReplyCard key={sub.replyId} reply={sub} />
            ))}
         </div>
       )}
    </div>
  );
};

const PostCreator: React.FC<{ onCancel: () => void; onSuccess: () => void }> = ({ onCancel, onSuccess }) => {
  const [formData, setFormData] = useState({ title: '', content: '', cropType: 'General', category: 'General' as ForumCategory, tags: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await CommunityApi.createPost({
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim().replace('#', ''))
    });
    if (res.success) {
      onSuccess();
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto animate-scale-up">
       <div className="bg-white rounded-[15px] border border-slate-200 shadow-2xl p-12 lg:p-20 space-y-12">
          <header className="flex justify-between items-center">
             <div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter">New Discussion</h2>
                <p className="text-slate-400 font-medium mt-2 uppercase text-[10px] tracking-[0.3em]">Sharing regional intelligence</p>
             </div>
             <button onClick={onCancel} className="p-4 bg-slate-50 text-slate-400 hover:text-rose-500 rounded-[15px] transition-all">
                <i data-lucide="x" className="w-8 h-8"></i>
             </button>
          </header>

          <form onSubmit={handleSubmit} className="space-y-8">
             <div className="space-y-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Engaging Title</label>
                   <input 
                     required
                     type="text" 
                     placeholder="e.g. Unusual wilting in Thompson Grapes after recent rain"
                     value={formData.title}
                     onChange={(e) => setFormData({...formData, title: e.target.value})}
                     className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[15px] text-lg font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:bg-white transition-all"
                   />
                </div>
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Primary Topic</label>
                      <select 
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value as ForumCategory})}
                        className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[15px] font-bold text-slate-700 outline-none appearance-none cursor-pointer"
                      >
                         <option>Crop Management</option>
                         <option>Pest Control</option>
                         <option>Market Trends</option>
                         <option>Climate Change</option>
                         <option>Equipment</option>
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Related Crop</label>
                      <select 
                        value={formData.cropType}
                        onChange={(e) => setFormData({...formData, cropType: e.target.value})}
                        className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[15px] font-bold text-slate-700 outline-none appearance-none cursor-pointer"
                      >
                         <option>Grape</option>
                         <option>Onion</option>
                         <option>Tomato</option>
                         <option>Pomegranate</option>
                         <option>General</option>
                      </select>
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Content / Observations</label>
                   <textarea 
                     required
                     rows={6}
                     placeholder="Describe your situation in detail. Mention variety, DAP, and recent soil applications..."
                     value={formData.content}
                     onChange={(e) => setFormData({...formData, content: e.target.value})}
                     className="w-full p-8 bg-slate-50 border border-slate-100 rounded-[15px] font-medium text-slate-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:bg-white transition-all leading-relaxed"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Search Tags (comma separated)</label>
                   <input 
                     type="text" 
                     placeholder="e.g. downymildew, ozar, fungicide"
                     value={formData.tags}
                     onChange={(e) => setFormData({...formData, tags: e.target.value})}
                     className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[15px] font-bold text-slate-900 focus:outline-none"
                   />
                </div>
             </div>

             <div className="flex gap-4 p-8 bg-slate-50 rounded-[15px] border border-dashed border-slate-200">
                <button type="button" className="flex-1 flex flex-col items-center justify-center p-6 bg-white border-2 border-slate-100 rounded-[15px] hover:border-emerald-300 transition-all group">
                   <i data-lucide="image" className="w-8 h-8 text-slate-300 group-hover:text-emerald-500 mb-2"></i>
                   <span className="text-[10px] font-black uppercase text-slate-400">Attach Photos</span>
                </button>
                <button type="button" className="flex-1 flex flex-col items-center justify-center p-6 bg-white border-2 border-slate-100 rounded-[15px] hover:border-emerald-300 transition-all group">
                   <i data-lucide="map-pin" className="w-8 h-8 text-slate-300 group-hover:text-emerald-500 mb-2"></i>
                   <span className="text-[10px] font-black uppercase text-slate-400">Add Location</span>
                </button>
             </div>

             <div className="flex gap-6 pt-6">
                <button 
                  type="button" 
                  onClick={onCancel}
                  className="flex-1 py-6 bg-slate-100 text-slate-400 rounded-[15px] font-black text-sm uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                   Discard Draft
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-[2] py-6 bg-emerald-600 text-white rounded-[15px] font-black text-sm uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-100 flex items-center justify-center space-x-3 active:scale-95"
                >
                   {loading ? <i data-lucide="refresh-cw" className="w-5 h-5 animate-spin"></i> : (
                     <>
                        <i data-lucide="send" className="w-5 h-5"></i>
                        <span>Publish to Commons</span>
                     </>
                   )}
                </button>
             </div>
          </form>
       </div>
    </div>
  );
};

export default CommunityForum;