
import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import BlogPostCard from '../components/BlogPostCard';
import { motion, Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, ArrowLeftIcon } from '../components/icons';
import { useData } from '../hooks/useData';
import NewsletterSignup from '../components/NewsletterSignup';
import FeaturedAuthorCard from '../components/FeaturedAuthorCard';
import FeaturedCategoryCard from '../components/FeaturedCategoryCard';
import HorizontalPostCard from '../components/HorizontalPostCard';
import { Post } from '../types';
import SecondaryFeaturedPostCard from '../components/SecondaryFeaturedPostCard';

const pageVariants: Variants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
};

const listContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
};

const heroContainerVariants: Variants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.3,
        },
    },
};

const heroItemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: 'easeOut',
        },
    },
};

const MainFeaturedPostCard: React.FC<{ post: Post }> = ({ post }) => (
    <Link to={`/post/${post.id}`} className="block group relative rounded-3xl overflow-hidden shadow-2xl shadow-slate-200 dark:shadow-slate-900 h-full">
        <div className="h-full">
            <motion.img
                src={post.imageUrl}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                initial={{ scale: 1.05 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1 }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
        </div>
        <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 md:p-12 text-white">
            <motion.div
                className="max-w-3xl"
                variants={heroContainerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
            >
                <motion.div variants={heroItemVariants}>
                    <span
                        className="relative z-10 inline-block text-xs font-bold uppercase tracking-widest py-1 px-3 bg-primary-500 text-white rounded-full"
                    >
                        {post.category.name}
                    </span>
                </motion.div>
                <motion.h1
                    variants={heroItemVariants}
                    className="text-3xl md:text-5xl font-bold font-serif mt-4 leading-tight group-hover:underline decoration-white/50"
                >
                    {post.title}
                </motion.h1>
                 <motion.p variants={heroItemVariants} className="mt-4 max-w-lg text-white/80 hidden sm:block">
                    {post.excerpt}
                </motion.p>
            </motion.div>
        </div>
    </Link>
);


const HomePage: React.FC = () => {
    const { publishedPosts: posts, authors, categories, tags } = useData();

    const mainFeaturedPost = posts[0];
    const secondaryFeaturedPosts = posts.slice(1, 3);
    const trendingPosts = [...posts].sort((a, b) => b.likes - a.likes).slice(0, 10);
    const recentPosts = posts.slice(3, 9);
    const featuredCategories = categories.slice(0, 4);
    const popularTags = tags.slice(0, 10);
    
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const getPostCountForCategory = (categoryId: string) => {
        return posts.filter(post => post.category.id === categoryId).length;
    };

    const featuredAuthors = useMemo(() => {
        const postCounts = posts.reduce((acc, post) => {
            acc[post.author.id] = (acc[post.author.id] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return authors
            .map(author => ({
                ...author,
                postCount: postCounts[author.id] || 0,
            }))
            .filter(author => author.postCount > 0)
            .sort((a, b) => b.postCount - a.postCount)
            .slice(0, 3);
    }, [posts, authors]);

    const checkScrollButtons = useCallback(() => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setCanScrollLeft(scrollLeft > 5);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
        }
    }, []);

    useEffect(() => {
        const scrollContainer = scrollContainerRef.current;
        if (scrollContainer) {
            checkScrollButtons();
            scrollContainer.addEventListener('scroll', checkScrollButtons, { passive: true });
            window.addEventListener('resize', checkScrollButtons);

            if (scrollContainer.scrollWidth <= scrollContainer.clientWidth) {
                setCanScrollRight(false);
            }

            return () => {
                scrollContainer.removeEventListener('scroll', checkScrollButtons);
                window.removeEventListener('resize', checkScrollButtons);
            };
        }
    }, [trendingPosts, checkScrollButtons]);

    const handleScroll = (scrollOffset: number) => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: scrollOffset, behavior: 'smooth' });
        }
    };

    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="in"
            exit="out"
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="space-y-24"
        >
            {/* Hero Section */}
             <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[60vh] min-h-[500px] max-h-[600px]">
                {/* Main Featured Post */}
                <div className="lg:col-span-2 h-full">
                    {mainFeaturedPost && <MainFeaturedPostCard post={mainFeaturedPost} />}
                </div>

                {/* Secondary Featured Posts */}
                <div className="hidden lg:flex flex-col gap-6 h-full">
                    {secondaryFeaturedPosts.map(post => (
                        <SecondaryFeaturedPostCard key={post.id} post={post} />
                    ))}
                </div>
            </section>

            {/* Featured Categories */}
            <section>
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold font-serif text-slate-900 dark:text-white">Featured Topics</h2>
                    <Link to="/categories" className="group flex items-center text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline">
                        View All
                        <ArrowRightIcon className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
                <motion.div variants={listContainerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {featuredCategories.map(cat => (
                        <FeaturedCategoryCard key={cat.id} category={cat} postCount={getPostCountForCategory(cat.id)} />
                    ))}
                </motion.div>
            </section>

            {/* Trending Posts */}
            <section>
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold font-serif text-slate-900 dark:text-white">Trending Stories</h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleScroll(-320)}
                            disabled={!canScrollLeft}
                            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Scroll left"
                        >
                            <ArrowLeftIcon className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => handleScroll(320)}
                            disabled={!canScrollRight}
                            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Scroll right"
                        >
                            <ArrowRightIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <motion.div
                    ref={scrollContainerRef}
                    variants={listContainerVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex overflow-x-auto space-x-8 pb-4 -mx-4 px-4 hide-scrollbar"
                >
                    {trendingPosts.map((post) => (
                        <HorizontalPostCard key={post.id} post={post} />
                    ))}
                </motion.div>
            </section>
            
            {/* Main Content & Sidebar */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <main className="lg:col-span-2">
                    <h2 className="text-3xl font-bold font-serif text-slate-900 dark:text-white mb-8">Latest From The Blog</h2>
                    <motion.div variants={listContainerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {recentPosts.map(post => (
                            <BlogPostCard key={post.id} post={post} />
                        ))}
                    </motion.div>
                </main>
                <aside className="lg:col-span-1">
                    <div className="sticky top-24 space-y-12">
                        {featuredAuthors.length > 0 && (
                            <div>
                                <h3 className="text-xl font-bold font-serif text-slate-900 dark:text-white mb-6">Our Top Writers</h3>
                                <div className="space-y-6">
                                    {featuredAuthors.map(author => (
                                        <FeaturedAuthorCard key={author.id} author={author} />
                                    ))}
                                </div>
                            </div>
                        )}
                        <div>
                            <h3 className="text-xl font-bold font-serif text-slate-900 dark:text-white mb-6">Popular Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {popularTags.map(tag => (
                                    <Link key={tag.id} to={`/tag/${tag.id}`} className="px-3 py-1 text-sm bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full hover:bg-primary-100 dark:hover:bg-primary-900/50 hover:text-primary-600 dark:hover:text-primary-300 transition-colors">
                                        #{tag.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>
            </section>
            
            <NewsletterSignup />
        </motion.div>
    );
};

export default HomePage;