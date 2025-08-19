
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI, Type } from '@google/genai';
import { useData } from '../hooks/useData';
import { CompassIcon, ArrowRightIcon, CheckIcon } from '../components/icons';
import { ReadingPath, Post } from '../types';
import { Link } from 'react-router-dom';

const API_KEY = process.env.API_KEY;

const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
};

const PathItem: React.FC<{ post: Post, index: number }> = ({ post, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="flex items-start space-x-6 relative"
    >
        <div className="flex flex-col items-center">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-500 text-white flex items-center justify-center text-xl font-bold font-serif">
                {index + 1}
            </div>
            {/* Don't draw a line for the last item */}
            <div className="w-px flex-grow bg-slate-300 dark:bg-slate-700 my-2"></div>
        </div>
        <div className="flex-1 pb-10">
            <p className="text-sm font-semibold text-primary-600 dark:text-primary-400">{post.category.name}</p>
            <Link to={`/post/${post.id}`}>
                <h3 className="text-xl font-bold font-serif mt-1 hover:underline text-slate-900 dark:text-white">{post.title}</h3>
            </Link>
            <p className="mt-2 text-slate-500 dark:text-slate-400">{post.excerpt}</p>
            <Link to={`/post/${post.id}`} className="inline-flex items-center text-sm font-semibold text-primary-600 dark:text-primary-400 mt-4 group">
                Read Article <ArrowRightIcon className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
            </Link>
        </div>
    </motion.div>
);

const PathfinderPage: React.FC = () => {
    const { publishedPosts } = useData();
    const [topic, setTopic] = useState('');
    const [readingPath, setReadingPath] = useState<ReadingPath | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!API_KEY) {
            setError('The Pathfinder feature is currently unavailable. Please try again later.');
            return;
        }
        if (topic.trim().length < 3) {
            setError('Please enter a topic with at least 3 characters.');
            return;
        }

        setIsLoading(true);
        setError('');
        setReadingPath(null);

        try {
            const ai = new GoogleGenAI({ apiKey: API_KEY });
            const postsForPrompt = publishedPosts.map(({ id, title, excerpt, category, tags }) => ({
                id,
                title,
                excerpt,
                category: category.name,
                tags: tags.map(t => t.name)
            }));

            const prompt = `You are a learning path curator for a blog. Based on the provided list of blog posts, create a logical, step-by-step reading path for a user interested in the topic: "${topic}".

The path must have a creative title and a short, encouraging description. It should consist of a list of post IDs from the provided list, ordered in a way that makes sense for learning about the topic. Select between 3 to 5 relevant posts. If no relevant posts are found, return an empty postIds array.

Available posts:
${JSON.stringify(postsForPrompt)}
`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            description: { type: Type.STRING },
                            postIds: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING }
                            }
                        },
                        required: ['title', 'description', 'postIds']
                    }
                }
            });
            
            const jsonStr = response.text.trim();
            const pathResult = JSON.parse(jsonStr);
            setReadingPath(pathResult);
        } catch (err) {
            console.error("Pathfinder error:", err);
            setError("Sorry, I couldn't create a reading path for that topic. Please try a different one.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const pathPosts = readingPath?.postIds.map(id => publishedPosts.find(p => p.id === id)).filter((p): p is Post => !!p);

    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="in"
            exit="out"
            transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
            <div className="text-center mb-12">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900/50 mb-4">
                    <CompassIcon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h1 className="text-4xl font-bold font-serif text-slate-900 dark:text-white sm:text-5xl">
                    AI Reading Pathfinder
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-500 dark:text-slate-400">
                    Tell us what you want to learn, and our AI will chart a personalized reading course through our articles for you.
                </p>
            </div>
            
            <div className="max-w-2xl mx-auto">
                <form onSubmit={handleSubmit}>
                    <div className="flex gap-4">
                         <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g., 'Getting started with AI in web development'"
                            className="flex-1 w-full px-5 py-3 text-base bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-full shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                         />
                         <button
                            type="submit"
                            disabled={isLoading}
                            className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-primary-600 rounded-full hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-slate-900 transition-all shadow-lg hover:shadow-primary-500/50 disabled:bg-slate-400"
                         >
                            {isLoading ? 'Charting...' : 'Find Path'}
                         </button>
                    </div>
                     {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
                </form>
            </div>
            
            <div className="mt-16">
                <AnimatePresence mode="wait">
                    {isLoading && (
                        <motion.div
                            key="loader"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center"
                        >
                            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                            <p className="mt-4 text-slate-500 dark:text-slate-400">Our AI is charting your course...</p>
                        </motion.div>
                    )}
                    
                    {readingPath && pathPosts && (
                         <motion.div
                            key="results"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-3xl mx-auto"
                        >
                             <div className="text-center mb-12 p-6 bg-slate-100 dark:bg-slate-800/50 rounded-2xl">
                                <h2 className="text-3xl font-bold font-serif text-slate-900 dark:text-white">{readingPath.title}</h2>
                                <p className="mt-2 text-slate-600 dark:text-slate-300">{readingPath.description}</p>
                             </div>
                             
                             {pathPosts.length > 0 ? (
                                <div className="relative">
                                    {pathPosts.map((post, index) => (
                                       <div key={post.id} className="relative">
                                         <PathItem post={post} index={index} />
                                         {/* Hide line on last item */}
                                         {index === pathPosts.length - 1 && <style>{`div:has(> .pb-10:last-child) .flex-col > .w-px { display: none; }`}</style>}
                                       </div>
                                    ))}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: pathPosts.length * 0.1 }}
                                        className="flex items-start space-x-6 relative"
                                    >
                                        <div className="flex flex-col items-center">
                                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center">
                                                <CheckIcon className="w-7 h-7" />
                                            </div>
                                        </div>
                                        <div className="flex-1 pt-2.5">
                                            <h3 className="text-xl font-bold font-serif text-slate-900 dark:text-white">Path Complete!</h3>
                                            <p className="mt-1 text-slate-500 dark:text-slate-400">You've reached the end of this learning journey. Happy reading!</p>
                                        </div>
                                    </motion.div>
                                </div>
                             ) : (
                                <div className="text-center py-10">
                                    <p className="text-lg text-slate-500 dark:text-slate-400">Couldn't find a clear path on that topic. Try being more specific or broader in your request!</p>
                                </div>
                             )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default PathfinderPage;
