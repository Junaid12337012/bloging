import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useData } from '../hooks/useData';
import ArticleRow from '../components/ArticleRow';
import { ArrowLeftIcon, ArrowRightIcon } from '../components/icons';

const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const POSTS_PER_PAGE = 10;

const TagPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { tags, publishedPosts: posts } = useData();
  const [currentPage, setCurrentPage] = useState(1);

  const tag = tags.find(t => t.id === id);
  
  const filteredPosts = posts
    .filter(p => p.tags.some(t => t.id === id))
    .sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const currentPosts = filteredPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );
  
  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
     window.scrollTo(0, 0);
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  if (!tag) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Tag not found.</h1>
        <Link to="/" className="mt-4 inline-block text-primary-600 hover:underline">
          Explore all articles
        </Link>
      </div>
    );
  }
  
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out"
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="max-w-4xl mx-auto"
    >
      <header className="border-b border-slate-200 dark:border-slate-700 pb-8 mb-12">
        <h1 className="text-5xl md:text-6xl font-bold font-serif text-slate-900 dark:text-white">
          #{tag.name}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-500 dark:text-slate-400">
          Showing all articles tagged with "{tag.name}".
        </p>
        <p className="mt-4 text-sm font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">
            {filteredPosts.length} {filteredPosts.length === 1 ? 'STORY' : 'STORIES'}
        </p>
      </header>
      
      {currentPosts.length > 0 ? (
        <>
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-12 divide-y divide-slate-200 dark:divide-slate-700"
        >
            {currentPosts.map((post, index) => (
                <div key={post.id} className={index > 0 ? 'pt-12' : ''}>
                    <ArticleRow post={post} />
                </div>
            ))}
        </motion.div>
        
        {totalPages > 1 && (
            <div className="mt-16 flex justify-between items-center">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white rounded-full border border-slate-300 hover:bg-slate-50 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Previous
              </button>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white rounded-full border border-slate-300 hover:bg-slate-50 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Next
                <ArrowRightIcon className="w-4 h-4 ml-2" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 border-t border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400 text-lg">There are no stories with this tag yet.</p>
        </div>
      )}
    </motion.div>
  );
};

export default TagPage;
