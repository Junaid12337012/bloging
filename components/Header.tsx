
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { 
    SearchIcon, BookmarkIcon, MenuIcon, XIcon, UserIcon, GoogleIcon, LogOutIcon, 
    PenSquareIcon, GalleryHorizontalEndIcon, CompassIcon, ChevronDownIcon, ArrowRightIcon
} from './icons';
import { motion, AnimatePresence, Transition, Variants } from 'framer-motion';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import SearchModal from './SearchModal';
import { Category, Post } from '../types';

const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Categories', hasDropdown: true },
    { 
      name: 'AI Tools', 
      hasDropdown: true,
      dropdownItems: [
        { name: 'Story Writer', href: '/story-writer', icon: <PenSquareIcon className="w-5 h-5 text-primary-500" /> },
        { name: 'Vision Weaver', href: '/vision-weaver', icon: <GalleryHorizontalEndIcon className="w-5 h-5 text-primary-500" /> },
        { name: 'Pathfinder', href: '/pathfinder', icon: <CompassIcon className="w-5 h-5 text-primary-500" /> },
      ]
    },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
];

const mobileNavItems = [
    { name: 'Home', href: '/' },
    { name: 'Categories', href: '/categories' },
    { name: 'Story Writer', href: '/story-writer' },
    { name: 'Vision Weaver', href: '/vision-weaver' },
    { name: 'Pathfinder', href: '/pathfinder' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
];

const dropdownVariants = {
    initial: { opacity: 0, scale: 0.95, y: -10 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: -10 },
};

const dropdownTransition: Transition = { duration: 0.2, ease: 'easeOut' };

const mobileMenuVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
};

const mobileNavContainerVariants = {
    initial: { opacity: 0 },
    animate: {
        opacity: 1,
        transition: {
            staggerChildren: 0.07,
            delayChildren: 0.2,
        },
    },
    exit: {
        opacity: 0,
        transition: {
            staggerChildren: 0.05,
            staggerDirection: -1,
        },
    },
};

const mobileNavItemVariants: Variants = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 260, damping: 20 } },
    exit: { y: 20, opacity: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } },
};

const AIToolsDropdown: React.FC = () => (
    <motion.div 
        variants={dropdownVariants} 
        initial="initial"
        animate="animate"
        exit="exit"
        transition={dropdownTransition}
        className="absolute top-full mt-2 w-56 origin-top-left rounded-xl bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-slate-700 focus:outline-none">
        <div className="py-2">
            {navItems.find(item => item.name === 'AI Tools')?.dropdownItems?.map(item => (
                <NavLink key={item.name} to={item.href} className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    {item.icon}
                    <span>{item.name}</span>
                </NavLink>
            ))}
        </div>
    </motion.div>
);

const MegaMenuCategoryItem: React.FC<{ category: Category }> = ({ category }) => (
    <Link to={`/category/${category.id}`} className="group relative block rounded-lg overflow-hidden h-full">
        <img src={category.imageUrl} alt={category.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        <div className="absolute inset-0 bg-black/50 group-hover:bg-black/60 transition-colors"></div>
        <div className="relative h-full flex items-end p-4">
            <h3 className="text-white font-bold font-serif">{category.name}</h3>
        </div>
    </Link>
);

const MegaMenuPostItem: React.FC<{ post: Post }> = ({ post }) => (
    <Link to={`/post/${post.id}`} className="group block p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
        <p className="text-xs font-semibold text-primary-600 dark:text-primary-400">{post.category.name}</p>
        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-primary-600 dark:group-hover:text-primary-400">{post.title}</h4>
    </Link>
);

const CategoriesMegaMenu: React.FC = () => {
    const { categories, publishedPosts } = useData();
    const featuredCategories = categories.slice(0, 2);
    const recentPosts = publishedPosts.slice(0, 3);

    return (
        <motion.div
            variants={dropdownVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={dropdownTransition}
            className="absolute top-full mt-2 w-[36rem] origin-top-left rounded-xl bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-slate-700 focus:outline-none"
        >
            <div className="grid grid-cols-5">
                <div className="col-span-3 grid grid-cols-1 grid-rows-2 gap-px p-1 bg-slate-200 dark:bg-slate-700 rounded-l-xl overflow-hidden">
                    {featuredCategories.map(cat => (
                         <MegaMenuCategoryItem key={cat.id} category={cat} />
                    ))}
                </div>

                <div className="col-span-2 p-2">
                     <h3 className="px-3 pt-2 pb-1 text-sm font-semibold text-slate-500 dark:text-slate-400">Latest Posts</h3>
                     <div className="space-y-1">
                        {recentPosts.map(post => (
                           <MegaMenuPostItem key={post.id} post={post} />
                        ))}
                     </div>
                     <div className="mt-2 p-2">
                        <Link to="/categories" className="group flex items-center justify-between text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                            <span>View All Categories</span>
                            <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};


const NavigationMenu: React.FC = () => {
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const { user } = useAuth();
    
    return (
        <nav className="hidden md:flex items-center space-x-1">
            {navItems.map(item => (
                <div 
                    key={item.name}
                    className="relative"
                    onMouseEnter={() => item.hasDropdown && setActiveDropdown(item.name)}
                    onMouseLeave={() => item.hasDropdown && setActiveDropdown(null)}
                >
                    {item.hasDropdown ? (
                        <div className="relative px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer flex items-center gap-1">
                            {item.name}
                            <ChevronDownIcon className="w-4 h-4" />
                            <AnimatePresence>
                                {activeDropdown === item.name && (
                                  item.name === 'Categories' ? <CategoriesMegaMenu /> : <AIToolsDropdown />
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <NavLink 
                            to={item.href || '#'} 
                            className={({ isActive }) =>
                                `relative px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400'}`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    {item.name}
                                    {isActive && <motion.div className="absolute bottom-0 left-1 right-1 h-0.5 bg-primary-500 rounded-full" layoutId="underline" />}
                                </>
                            )}
                        </NavLink>
                    )}
                </div>
            ))}
            {user?.isAdmin && (
                 <NavLink 
                    to="/admin" 
                    className={({ isActive }) =>
                        `relative px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400'}`
                    }
                >
                    {({ isActive }) => (
                        <>
                            Admin
                            {isActive && <motion.div className="absolute bottom-0 left-1 right-1 h-0.5 bg-primary-500 rounded-full" layoutId="underline" />}
                        </>
                    )}
                </NavLink>
            )}
        </nav>
    );
};

const MobileNav: React.FC<{onClose: () => void}> = ({ onClose }) => {
    const { user, login, logout } = useAuth();
    const { siteSettings } = useData();
    const navigate = useNavigate();
    
    const handleLogout = () => {
        logout();
        onClose();
        navigate('/');
    };
    
    const handleGoogleSignIn = async () => {
        try {
            await login('elena@example.com');
            onClose();
        } catch (error) { console.error("Failed to sign in"); }
    };
    
    const finalNavItems = user?.isAdmin ? [...mobileNavItems, { name: 'Admin', href: '/admin' }] : mobileNavItems;

    return (
        <motion.div
            variants={mobileMenuVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg z-50 flex flex-col"
        >
            <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800">
                <Link to="/" onClick={onClose} className="flex items-center gap-2 text-xl font-bold font-serif text-primary-600 dark:text-primary-400">
                   {(siteSettings.logoLightUrl || siteSettings.logoDarkUrl) && (
                      <>
                          {siteSettings.logoLightUrl && <img src={siteSettings.logoLightUrl} alt={`${siteSettings.title} Logo`} className="h-7 w-auto block dark:hidden" />}
                          {(siteSettings.logoDarkUrl || siteSettings.logoLightUrl) && <img src={siteSettings.logoDarkUrl || siteSettings.logoLightUrl} alt={`${siteSettings.title} Logo`} className="h-7 w-auto hidden dark:block" />}
                      </>
                  )}
                  <span>{siteSettings.title}</span>
                </Link>
                <button onClick={onClose} className="p-2 text-slate-500 dark:text-slate-400">
                    <XIcon className="w-6 h-6" />
                </button>
            </div>
            
            <motion.nav 
                variants={mobileNavContainerVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex-1 flex flex-col items-center justify-center space-y-4"
            >
                {finalNavItems.map((item) => (
                    <motion.div key={item.name} variants={mobileNavItemVariants}>
                        <NavLink 
                            to={item.href}
                            onClick={onClose}
                            className={({isActive}) => 
                                `block text-3xl font-serif transition-colors py-2 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-700 dark:text-slate-200 hover:text-primary-500 dark:hover:text-primary-400'}`
                            }
                        >
                            {item.name}
                        </NavLink>
                    </motion.div>
                ))}
            </motion.nav>
            
             <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="p-6 border-t border-slate-200 dark:border-slate-800 space-y-4"
            >
                <div className="flex justify-center items-center space-x-4">
                    <Link 
                        to="/saved" 
                        onClick={onClose}
                        className="relative w-12 h-12 flex items-center justify-center rounded-full text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 transition-colors"
                        aria-label="Saved posts"
                    >
                        <BookmarkIcon className="w-6 h-6" />
                    </Link>
                    <ThemeToggle />
                </div>
                {user ? (
                    <button 
                        onClick={handleLogout}
                        className="w-full py-3 text-lg font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-300 dark:border-slate-700 rounded-full"
                    >
                        Sign Out
                    </button>
                ) : (
                    <button
                        onClick={handleGoogleSignIn}
                        className="w-full flex items-center justify-center text-center py-3 text-lg font-medium text-white bg-gradient-to-r from-primary-600 to-blue-500 rounded-full hover:from-primary-700 hover:to-blue-600 transition-all shadow-lg hover:shadow-primary-500/50"
                    >
                         <GoogleIcon className="w-5 h-5 mr-3" />
                         Sign in
                    </button>
                )}
            </motion.div>
        </motion.div>
    );
};

const ProfileDropdown: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

     useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!user) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-slate-900"
            >
                <UserIcon className="w-5 h-5" />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-56 origin-top-right rounded-md shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 dark:ring-slate-700 focus:outline-none"
                    >
                        <div className="py-1">
                            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.name}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                            </div>
                            <button
                                onClick={() => { onLogout(); setIsOpen(false); }}
                                className="w-full text-left flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                            >
                                <LogOutIcon className="w-4 h-4 mr-2" />
                                Sign Out
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const navigate = useNavigate();
  const { siteSettings } = useData();
  const { user, login, logout } = useAuth();

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen || isSearchModalOpen ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; }
  }, [isMobileMenuOpen, isSearchModalOpen]);
  
  const handleGoogleSignIn = async () => {
    try {
        await login('elena@example.com');
    } catch (error) {
        console.error("Failed to sign in", error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center gap-3 text-2xl font-bold font-serif text-primary-600 dark:text-primary-400">
                {siteSettings.logoLightUrl && (
                    <img src={siteSettings.logoLightUrl} alt={`${siteSettings.title} Logo`} className="h-8 w-auto block dark:hidden" />
                )}
                {(siteSettings.logoDarkUrl || siteSettings.logoLightUrl) && (
                    <img src={siteSettings.logoDarkUrl || siteSettings.logoLightUrl} alt={`${siteSettings.title} Logo`} className="h-8 w-auto hidden dark:block" />
                )}
                <span>{siteSettings.title}</span>
              </Link>
            </div>
            
            <div className="flex-1 flex justify-center">
                <NavigationMenu />
            </div>

            <div className="flex items-center space-x-2">
              <div className="hidden md:flex items-center space-x-2">
                <button 
                  onClick={() => setIsSearchModalOpen(true)}
                  className="relative w-10 h-10 flex items-center justify-center rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  aria-label="Search"
                >
                  <SearchIcon className="w-5 h-5" />
                </button>
                <Link 
                  to="/saved" 
                  className="relative w-10 h-10 flex items-center justify-center rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  aria-label="Saved posts"
                >
                  <BookmarkIcon className="w-5 h-5" />
                </Link>
                <ThemeToggle />
              </div>
              
              <div className="hidden md:block">
                {user ? (
                    <ProfileDropdown onLogout={handleLogout} />
                ) : (
                    <button 
                    onClick={handleGoogleSignIn}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-full hover:bg-primary-700 transition-colors shadow-sm hover:shadow-lg hover:shadow-primary-500/30"
                    >
                    Sign in
                    </button>
                )}
              </div>

               <div className="md:hidden flex items-center">
                    <button 
                        onClick={() => setIsSearchModalOpen(true)}
                        className="relative w-10 h-10 flex items-center justify-center rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        aria-label="Search"
                    >
                        <SearchIcon className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="relative w-10 h-10 flex items-center justify-center rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        aria-label="Open menu"
                    >
                        <MenuIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && <MobileNav onClose={() => setIsMobileMenuOpen(false)} />}
      </AnimatePresence>

      <SearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
    </>
  );
};

export default Header;
