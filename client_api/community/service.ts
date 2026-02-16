import { api } from '../../lib/apiClient';
import { CommunityPost, CommunityReply, ApiResponse, ForumCategory } from '../../types';

let mockPosts: CommunityPost[] = [
  {
    postId: 'p1',
    userId: 'u100',
    userName: 'Farmer Ramesh',
    userAvatar: 'https://images.unsplash.com/photo-1595304033282-3e28be636d14?auto=format&fit=crop&q=80&w=100',
    userReputation: 1240,
    title: 'Flowering Stage Nutrients for Tomato',
    content: 'What organic fertilizer is best for tomatoes during the flowering stage? My plants look a bit yellow on the bottom leaves. I have tried using FYM but looking for something more rapid-acting.',
    snippet: 'What organic fertilizer is best for tomatoes during the flowering stage? My plants look a bit yellow...',
    cropType: 'Tomato',
    category: 'Crop Management',
    location: { village: 'Pimpalgaon', district: 'Nashik' },
    tags: ['tomato', 'organic', 'fertilizer'],
    upvotes: 15,
    viewCount: 240,
    replyCount: 1,
    isExpertVerified: true,
    isFlagged: false,
    isBookmarked: false,
    isFollowing: true,
    createdAt: '2023-10-30T14:20:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=800',
    imageGallery: [
      'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1595304033282-3e28be636d14?auto=format&fit=crop&q=80&w=800'
    ],
    replies: [
      {
        replyId: 'r1',
        postId: 'p1',
        userId: 'exp1',
        userName: 'Dr. Sanjay Patil',
        userBadge: 'Expert',
        content: 'Yellowing of lower leaves usually indicates Nitrogen deficiency. Use a seaweed-based extract or well-decomposed FYM compost tea. You can also try Fish Amino Acids for faster uptake.',
        createdAt: '2023-10-31T10:00:00Z',
        upvotes: 8,
        isExpertAnswer: true,
        isHelpful: true,
        replies: [
          {
            replyId: 'r1-sub',
            postId: 'p1',
            userId: 'u100',
            userName: 'Farmer Ramesh',
            content: 'Thank you Doctor, will Fish Amino Acid affect the fruit taste?',
            createdAt: '2023-10-31T12:00:00Z',
            upvotes: 2,
            isExpertAnswer: false,
            isHelpful: false
          }
        ]
      }
    ]
  },
  {
    postId: 'p2',
    userId: 'u101',
    userName: 'Vidya Deshmukh',
    userReputation: 850,
    title: 'Downy Mildew Alert in Ozar',
    content: 'Seeing some oil spots on my Thompson Seedless. Has the outbreak reached Ozar taluka yet? I am seeing specific yellow patches on the older leaves.',
    snippet: 'Seeing some oil spots on my Thompson Seedless. Has the outbreak reached Ozar taluka yet?',
    cropType: 'Grape',
    category: 'Pest Control',
    location: { village: 'Ozar', district: 'Nashik' },
    tags: ['grape', 'downy-mildew', 'alert'],
    upvotes: 28,
    viewCount: 450,
    replyCount: 0,
    isExpertVerified: false,
    isFlagged: false,
    isBookmarked: true,
    isFollowing: false,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    replies: []
  }
];

export const CommunityApi = {
  getFeed: async (filter: 'latest' | 'trending' | 'unanswered' | 'village' | 'my-posts' | 'following' | 'expert', category?: ForumCategory): Promise<ApiResponse<CommunityPost[]>> => {
    let feed = [...mockPosts];
    
    if (category && category !== 'General') {
      feed = feed.filter(p => p.category === category);
    }

    switch (filter) {
      case 'trending':
        feed.sort((a, b) => b.upvotes - a.upvotes);
        break;
      case 'unanswered':
        feed = feed.filter(p => p.replyCount === 0);
        break;
      case 'village':
        feed = feed.filter(p => p.location.village === 'Pimpalgaon'); // Mock village filter
        break;
      case 'my-posts':
        feed = feed.filter(p => p.userId === 'u123');
        break;
      case 'following':
        feed = feed.filter(p => p.isFollowing);
        break;
      case 'expert':
        feed = feed.filter(p => p.isExpertVerified);
        break;
      default:
        feed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return api.wrapSuccess(feed);
  },

  getPost: async (postId: string): Promise<ApiResponse<CommunityPost>> => {
    const post = mockPosts.find(p => p.postId === postId);
    if (!post) return { success: false, error: "Post not found", timestamp: new Date().toISOString() };
    return api.wrapSuccess(post);
  },

  createPost: async (post: Partial<CommunityPost>): Promise<ApiResponse<CommunityPost>> => {
    const newPost: CommunityPost = {
      postId: Math.random().toString(36).substr(2, 9),
      userId: 'u123',
      userName: 'Current Farmer',
      userReputation: 150,
      title: post.title || '',
      content: post.content || '',
      snippet: (post.content || '').substring(0, 100) + '...',
      cropType: post.cropType || 'General',
      category: (post.category as ForumCategory) || 'General',
      location: { village: 'Nashik', district: 'Nashik' },
      tags: post.tags || [],
      upvotes: 0,
      viewCount: 0,
      replyCount: 0,
      isExpertVerified: false,
      isFlagged: false,
      createdAt: new Date().toISOString(),
      replies: []
    };
    mockPosts.unshift(newPost);
    return api.wrapSuccess(newPost);
  },

  toggleBookmark: async (postId: string): Promise<ApiResponse<boolean>> => {
    const post = mockPosts.find(p => p.postId === postId);
    if (post) post.isBookmarked = !post.isBookmarked;
    return api.wrapSuccess(post?.isBookmarked || false);
  },

  replyToPost: async (postId: string, content: string, parentReplyId?: string): Promise<ApiResponse<CommunityReply>> => {
    const post = mockPosts.find(p => p.postId === postId);
    if (!post) return { success: false, error: "Post not found", timestamp: new Date().toISOString() };

    const newReply: CommunityReply = {
      replyId: Math.random().toString(36).substr(2, 9),
      postId,
      userId: 'u123',
      userName: 'Current Farmer',
      content,
      createdAt: new Date().toISOString(),
      upvotes: 0,
      isExpertAnswer: false,
      isHelpful: false,
      replies: []
    };

    if (parentReplyId) {
      const parent = post.replies.find(r => r.replyId === parentReplyId);
      if (parent) {
        if (!parent.replies) parent.replies = [];
        parent.replies.push(newReply);
      }
    } else {
      post.replies.push(newReply);
    }
    
    post.replyCount++;
    return api.wrapSuccess(newReply);
  },

  upvotePost: async (postId: string): Promise<ApiResponse<void>> => {
    const post = mockPosts.find(p => p.postId === postId);
    if (post) post.upvotes++;
    return api.wrapSuccess(undefined);
  },

  flagPost: async (postId: string): Promise<ApiResponse<void>> => {
    const post = mockPosts.find(p => p.postId === postId);
    if (post) post.isFlagged = true;
    return api.wrapSuccess(undefined);
  }
};
