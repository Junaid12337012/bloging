


import React from 'react';
import { Routes, Route, useLocation, Outlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import BlogPostPage from './pages/BlogPostPage';
import CategoriesPage from './pages/CategoriesPage';
import CategoryPage from './pages/CategoryPage';
import TagPage from './pages/TagPage';
import SavedPostsPage from './pages/SavedPostsPage';
import SearchPage from './pages/SearchPage';
import StoryWriterPage from './pages/StoryWriterPage';
import VisionWeaverPage from './pages/VisionWeaverPage';
import PathfinderPage from './pages/PathfinderPage';
import SitePage from './pages/SitePage';
import AuthorPage from './pages/AuthorPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ScrollToTop from './components/ScrollToTop';
import AIAssistantFab from './components/AIAssistantFab';

// Admin Imports
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminPostsPage from './pages/admin/AdminPostsPage';
import AdminPostFormPage from './pages/admin/AdminPostFormPage';
import AdminPagesPage from './pages/admin/AdminPagesPage';
import AdminPageFormPage from './pages/admin/AdminPageFormPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminCommentsPage from './pages/admin/AdminCommentsPage';
import AdminMessagesPage from './pages/admin/AdminMessagesPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminAuthorsPage from './pages/admin/AdminAuthorsPage';
import AdminAuthorFormPage from './pages/admin/AdminAuthorFormPage';
import AdminProtectedRoute from './components/admin/AdminProtectedRoute';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import { ToastProvider } from './contexts/ToastContext';
import { useData } from './hooks/useData';
import ToastContainer from './components/ToastContainer';
import AdminSubscribersPage from './pages/admin/AdminSubscribersPage';


const PublicLayout = () => (
  <div className="flex flex-col min-h-screen">
    <Header />
    <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Outlet />
    </main>
    <Footer />
    <AIAssistantFab />
  </div>
);

function App() {
  const location = useLocation();
  const { siteSettings } = useData();

  React.useEffect(() => {
    document.title = siteSettings.title;
  }, [siteSettings.title]);


  return (
    <ToastProvider>
      <ScrollToTop />
      <ToastContainer />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public facing routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/post/:id" element={<BlogPostPage />} />
            <Route path="/author/:id" element={<AuthorPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/category/:id" element={<CategoryPage />} />
            <Route path="/tag/:id" element={<TagPage />} />
            <Route path="/saved" element={<SavedPostsPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/story-writer" element={<StoryWriterPage />} />
            <Route path="/vision-weaver" element={<VisionWeaverPage />} />
            <Route path="/pathfinder" element={<PathfinderPage />} />
            <Route path="/privacy" element={<SitePage slug="privacy" />} />
            <Route path="/terms" element={<SitePage slug="terms" />} />
          </Route>
          
          {/* Admin panel routes */}
          <Route element={<AdminProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="posts" element={<AdminPostsPage />} />
              <Route path="posts/new" element={<AdminPostFormPage />} />
              <Route path="posts/edit/:id" element={<AdminPostFormPage />} />
              <Route path="pages" element={<AdminPagesPage />} />
              <Route path="pages/edit/:id" element={<AdminPageFormPage />} />
              <Route path="categories" element={<AdminCategoriesPage />} />
              <Route path="comments" element={<AdminCommentsPage />} />
              <Route path="messages" element={<AdminMessagesPage />} />
              <Route path="authors" element={<AdminAuthorsPage />} />
              <Route path="authors/new" element={<AdminAuthorFormPage />} />
              <Route path="authors/edit/:id" element={<AdminAuthorFormPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="subscribers" element={<AdminSubscribersPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>
          </Route>
        </Routes>
      </AnimatePresence>
    </ToastProvider>
  );
}

export default App;