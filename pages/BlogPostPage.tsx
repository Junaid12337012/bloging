import React, { useMemo, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, useScroll } from 'framer-motion';
import { HeartIcon, MessageCircleIcon, Share2Icon, BookmarkIcon, UserIcon } from '../components/icons';
import { useSavedPosts } from '../hooks/useSavedPosts';
import AiSummary from '../components/AiSummary';
import AskTheArticle from '../components/AskTheArticle';
import TableOfContents, { Heading } from '../components/TableOfContents';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import BlogPostCard from '../components/BlogPostCard';
import { useLikedPosts } from '../hooks/useLikedPosts';
import { useToast } from '../hooks/useToast';
import AiQuizGenerator from '../components/AiQuizGenerator';

const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 },
};

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');

const BlogPostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { publishedPosts: posts, comments: allComments, addComment, updateLikes, siteSettings } = useData();
  const { user } = useAuth();
  const post = posts.find(p => p.id === id);
  const { isSaved, toggleSaved } = useSavedPosts();
  const { isLiked, toggleLiked } = useLikedPosts();
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);
  const { scrollYProgress } = useScroll();
  const toast = useToast();

  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState('');

  useEffect(() => {
    const originalTitle = document.title;
    if (post) {
        document.title = `${post.title} | ${siteSettings.title}`;
    }
    // Reset title on unmount
    return () => {
        document.title = originalTitle;
    };
  }, [post, siteSettings.title]);

  const { processedContent, headings } = useMemo(() => {
    if (!post) return { processedContent: '', headings: [] };

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = post.content;
    const foundHeadings: Heading[] = [];
    
    tempDiv.querySelectorAll('h2, h3').forEach((header, index) => {
      const text = header.textContent || '';
      const id = slugify(text) || `heading-${index}`;
      header.id = id;
      foundHeadings.push({
        id,
        text,
        level: header.tagName === 'H2' ? 2 : 3,
      });
    });

    return { processedContent: tempDiv.innerHTML, headings: foundHeadings };
  }, [post]);

  const relatedPosts = useMemo(() => {
    if (!post) return [];
    const postsInCategory = posts
        .filter(p => p.category.id === post.category.id && p.id !== post.id)
        .slice(0, 3);
    if (postsInCategory.length >= 3) return postsInCategory;
    const recentPosts = posts
        .filter(p => !postsInCategory.some(selected => selected.id === p.id) && p.id !== post.id)
        .sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());
    return [...postsInCategory, ...recentPosts].slice(0, 3);
  }, [post, posts]);

  useEffect(() => {
    const headingElements = headings.map(h => document.getElementById(h.id)).filter(Boolean) as HTMLElement[];
    if (headingElements.length === 0) return;
    
    const intersectingIds = new Set<string>();

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    intersectingIds.add(entry.target.id);
                } else {
                    intersectingIds.delete(entry.target.id);
                }
            });

            let newActiveId: string | null = null;
            // Find the LAST heading in document order that is intersecting.
            // This means it's the one lowest on the page that's still in our observation area.
            for (let i = headings.length - 1; i >= 0; i--) {
                if (intersectingIds.has(headings[i].id)) {
                    newActiveId = headings[i].id;
                    break;
                }
            }
            
            setActiveHeadingId(newActiveId);
        },
        {
            // The observation area starts 80px from the top (to account for the sticky header)
            // and ends 40% from the bottom of the viewport. This targets the content
            // in the upper-middle part of the screen.
            rootMargin: `-80px 0px -40% 0px`,
        }
    );

    headingElements.forEach(el => observer.observe(el));

    return () => {
        headingElements.forEach(el => observer.unobserve(el));
    };
  }, [headings]);

  if (!post) {
    return <div className="text-center py-20">Post not found. <Link to="/" className="text-primary-600 hover:underline">Go back home</Link></div>;
  }

  const { author, title, publishedDate, readingTime, imageUrl, excerpt, tags, likes } = post;
  const isPostSaved = isSaved(post.id);
  const isPostLiked = isLiked(post.id);
  const postComments = allComments.filter(c => c.postId === post.id && c.status === 'approved');
  const postCommentCount = postComments.length;
  
  const handleLikeClick = () => {
    const isCurrentlyLiked = isLiked(post.id);
    updateLikes(post.id, !isCurrentlyLiked);
    toggleLiked(post.id);
  };
  
  const handleShare = async () => {
    const postUrl = new URL(`#/post/${id}`, window.location.href).href;
    const shareData = {
      title: title,
      text: excerpt,
      url: postUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(postUrl);
        toast.success('Link copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy link:', error);
        toast.error('Failed to copy link.');
      }
    }
  };


  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !user) {
        if (!user) setSubmissionMessage("You must be logged in to comment.");
        return;
    }
    setIsSubmitting(true);
    setSubmissionMessage('');
    
    setTimeout(() => {
        addComment({
            postId: post.id,
            authorName: user.name,
            authorAvatarUrl: 'https://picsum.photos/seed/user/50/50',
            text: commentText,
            status: 'pending',
        });
        setIsSubmitting(false);
        setCommentText('');
        setSubmissionMessage('Success! Your comment has been submitted for moderation.');
    }, 500);
  };
  
  const SidebarAction: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string | number;
    onClick?: () => void;
    active?: boolean;
  }> = ({ icon, label, value, onClick, active = false }) => (
    <button
        onClick={onClick}
        className={`group flex items-center justify-between w-full text-left p-3 rounded-lg transition-colors ${
            active ? 'bg-primary-50 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
        }`}
    >
      <div className="flex items-center">
        {icon}
        <span className="ml-3 text-sm font-medium">{label}</span>
      </div>
      <span className={`text-sm font-semibold ${active ? 'text-primary-600 dark:text-primary-300' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-100'}`}>{value}</span>
    </button>
  );

  const MobileActionButton: React.FC<{
    icon: React.ReactNode;
    ariaLabel: string;
    onClick?: () => void;
    active?: boolean;
  }> = ({ icon, ariaLabel, onClick, active = false }) => (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className={`p-3 rounded-full transition-colors ${
        active ? 'text-primary-500 bg-primary-100 dark:text-primary-300 dark:bg-primary-900/50' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
      }`}
    >
      {icon}
    </button>
  );

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out"
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      {/* Reading Progress Bar */}
      <motion.div
        className="fixed top-16 left-0 right-0 h-1.5 bg-sky-500 origin-[0%] z-40"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Hero Header */}
      <header className="max-w-4xl mx-auto text-center py-12 px-4">
        <Link to={`/category/${post.category.id}`} className="text-sm font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400 hover:underline">
          {post.category.name}
        </Link>
        <h1 className="text-4xl md:text-6xl font-extrabold font-serif text-slate-900 dark:text-white leading-tight mt-4">
          {title}
        </h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">{excerpt}</p>
        <div className="mt-8 flex justify-center items-center flex-wrap gap-x-6 gap-y-2 text-slate-500 dark:text-slate-400">
          <Link to={`/author/${author.id}`} className="flex items-center space-x-2 hover:underline text-slate-800 dark:text-slate-200 font-semibold">
            <img src={author.avatarUrl} alt={author.name} className="w-8 h-8 rounded-full" />
            <span>{author.name}</span>
          </Link>
          <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">&bull;</span>
          <time dateTime={publishedDate}>{new Date(publishedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
           <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">&bull;</span>
          <span>{readingTime} min read</span>
        </div>
      </header>
      
      {/* Featured Image */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <img src={imageUrl} alt={title} className="w-full h-auto max-h-[70vh] object-cover rounded-2xl shadow-2xl shadow-slate-300/50 dark:shadow-black/30" />
      </div>


      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:grid lg:grid-cols-12 lg:gap-12">
          
          {/* Left Sticky Sidebar */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 space-y-8">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border dark:border-slate-700/50">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">Author</h4>
                <div className="flex items-center gap-4">
                  <Link to={`/author/${author.id}`}>
                    <img src={author.avatarUrl} alt={author.name} className="w-12 h-12 rounded-full" />
                  </Link>
                  <div>
                    <Link to={`/author/${author.id}`} className="hover:underline">
                      <h4 className="font-bold text-slate-900 dark:text-white">{author.name}</h4>
                    </Link>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{author.bio.substring(0,40)}...</p>
                  </div>
                </div>
              </div>

              <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border dark:border-slate-700/50 space-y-1">
                <SidebarAction 
                    icon={<HeartIcon className="w-5 h-5" filled={isPostLiked}/>} 
                    label="Likes"
                    value={likes}
                    onClick={handleLikeClick}
                    active={isPostLiked}
                />
                <SidebarAction icon={<MessageCircleIcon className="w-5 h-5"/>} label="Comments" value={postCommentCount} />
                <SidebarAction 
                  icon={<BookmarkIcon className="w-5 h-5" filled={isPostSaved}/>} 
                  label={isPostSaved ? 'Saved' : 'Save'} 
                  value=""
                  onClick={() => toggleSaved(post.id)}
                  active={isPostSaved}
                />
                <SidebarAction icon={<Share2Icon className="w-5 h-5"/>} label="Share" value="" onClick={handleShare} />
              </div>

            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-6">
             <div className="lg:hidden mb-12">
                {headings.length >= 3 && <TableOfContents headings={headings} activeId={activeHeadingId} />}
              </div>
            <article>
              <div 
                className="prose prose-lg dark:prose-invert max-w-none mx-auto text-slate-700 dark:text-slate-300 font-serif leading-relaxed"
                dangerouslySetInnerHTML={{ __html: processedContent }}
              />
              <div className="mt-12 flex flex-wrap gap-2">
                {tags.map(tag => (
                  <Link 
                      key={tag.id} 
                      to={`/tag/${tag.id}`}
                      className="inline-block bg-slate-100 dark:bg-slate-700 rounded-full px-3 py-1 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                      #{tag.name}
                  </Link>
                ))}
              </div>
            </article>

            <AiSummary content={post.content} />
            <AskTheArticle content={post.content} />
            <AiQuizGenerator content={post.content} />
            
            <section className="mt-24">
              <h2 className="text-3xl font-bold font-serif text-slate-900 dark:text-white mb-8">Comments ({postCommentCount})</h2>
              <div className="space-y-8 bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl shadow-lg border dark:border-slate-700">
                {postComments.map(comment => (
                  <div key={comment.id} className="flex items-start space-x-4">
                    <img src={comment.authorAvatarUrl} alt={comment.authorName} className="w-12 h-12 rounded-full"/>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-semibold text-slate-800 dark:text-slate-100">{comment.authorName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{comment.timestamp}</p>
                      </div>
                      <p className="mt-1 text-slate-600 dark:text-slate-300">{comment.text}</p>
                    </div>
                  </div>
                ))}
                <div className="pt-8 border-t border-slate-200 dark:border-slate-700">
                      <form onSubmit={handleCommentSubmit} className="flex items-start space-x-4">
                          {user ? (
                            <img src={'https://picsum.photos/seed/user/50/50'} alt={user.name} className="w-10 h-10 rounded-full flex-shrink-0 mt-1" />
                           ) : (
                            <div className="w-10 h-10 rounded-full flex-shrink-0 mt-1 bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                <UserIcon className="w-5 h-5 text-slate-400" />
                            </div>
                           )}
                          <div className="flex-1">
                              <textarea 
                                  rows={4} 
                                  value={commentText}
                                  onChange={(e) => setCommentText(e.target.value)}
                                  disabled={!user || isSubmitting}
                                  className="w-full p-4 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-600 focus:ring-primary-500 focus:border-primary-500 transition disabled:opacity-50" 
                                  placeholder={user ? "Join the discussion..." : "Please log in to leave a comment."}
                              ></textarea>
                              <div className="mt-4 flex items-center justify-between">
                                   <button 
                                      type="submit"
                                      disabled={!user || isSubmitting || !commentText.trim()}
                                      className="px-6 py-2 text-sm font-medium text-white bg-primary-600 rounded-full hover:bg-primary-700 disabled:bg-slate-400 dark:disabled:bg-slate-600"
                                  >
                                    {isSubmitting ? "Submitting..." : "Post Comment"}
                                  </button>
                                  {submissionMessage && <p className="text-sm text-green-600 dark:text-green-400">{submissionMessage}</p>}
                              </div>
                              {!user && <p className="text-sm mt-2 text-slate-500">Please <span className="font-semibold text-primary-600 dark:text-primary-400">sign in</span> to join the conversation.</p>}
                          </div>
                      </form>
                  </div>
              </div>
            </section>
          </main>
          
           {/* Right Sticky Sidebar */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24">
              {headings.length >= 3 && <TableOfContents headings={headings} activeId={activeHeadingId} />}
            </div>
          </aside>
        </div>
      </div>
      
      {/* Related Posts Section */}
      {relatedPosts.length > 0 && (
        <section className="mt-16 py-24 bg-slate-50 dark:bg-slate-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold font-serif text-slate-900 dark:text-white mb-8 text-center">Continue Reading</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {relatedPosts.map(relatedPost => (
                      <BlogPostCard key={relatedPost.id} post={relatedPost} />
                  ))}
              </div>
            </div>
        </section>
      )}

       {/* Mobile Floating Toolbar */}
       <div className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
        <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg rounded-full shadow-lg p-2 border dark:border-slate-700">
            <MobileActionButton 
                icon={<HeartIcon className="w-5 h-5" filled={isPostLiked}/>}
                ariaLabel="Like this post" 
                onClick={handleLikeClick}
                active={isPostLiked}
            />
            <MobileActionButton icon={<MessageCircleIcon className="w-5 h-5"/>} ariaLabel="View comments" />
            <MobileActionButton 
                icon={<BookmarkIcon className="w-5 h-5" filled={isPostSaved}/>}
                ariaLabel="Save this post"
                onClick={() => toggleSaved(post.id)}
                active={isPostSaved}
            />
            <MobileActionButton icon={<Share2Icon className="w-5 h-5"/>} ariaLabel="Share this post" onClick={handleShare} />
        </div>
       </div>
    </motion.div>
  );
};

export default BlogPostPage;
