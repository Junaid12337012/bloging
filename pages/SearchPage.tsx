import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import BlogPostCard from '../components/BlogPostCard';
import { SearchIcon } from '../components/icons';
import { useData } from '../hooks/useData';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { publishedPosts: posts } = useData();

  const filteredPosts = query
    ? posts.filter(post => {
        const searchTerm = query.toLowerCase();
        
        // Create a temporary div to parse and extract text from HTML content
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = post.content;
        const textContent = tempDiv.textContent || tempDiv.innerText || '';

        return (
          post.title.toLowerCase().includes(searchTerm) ||
          post.excerpt.toLowerCase().includes(searchTerm) ||
          textContent.toLowerCase().includes(searchTerm) ||
          post.author.name.toLowerCase().includes(searchTerm) ||
          post.category.name.toLowerCase().includes(searchTerm)
        );
      })
    : [];

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out"
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold font-serif text-slate-900 dark:text-white sm:text-5xl">
          Search Results
        </h1>
        {query && (
            <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-500 dark:text-slate-400">
                Found {filteredPosts.length} {filteredPosts.length === 1 ? 'result' : 'results'} for <span className="font-semibold text-primary-600 dark:text-primary-400">"{query}"</span>
            </p>
        )}
      </div>

      {filteredPosts.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-8 lg:grid-cols-3"
        >
          {filteredPosts.map(post => (
            <BlogPostCard key={post.id} post={post} />
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-16 px-6 bg-white dark:bg-slate-800 rounded-lg shadow-md">
           <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900/50">
            <SearchIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="mt-5 text-2xl font-semibold font-serif text-slate-900 dark:text-white">No results found</h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            We couldn't find any articles matching your search. Try using different keywords.
          </p>
           <div className="mt-6">
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Back to Home
            </Link>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default SearchPage;