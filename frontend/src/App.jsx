import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

import Hero from "./components/Hero";
import ServiceStrip from "./components/ServiceStrip";
import ShortAbout from "./components/ShortAbout";
import ProjectPortfolio from "./components/ProjectPortfolio";
import TrustedClients from "./components/TrustedClients";
import Services from "./components/Services";
import Blog from "./components/Blog";

// Category Grid & Project Details pages
import CategoryProjectGrid from "./components/CategoryProjectGrid";
import ProjectDetails from "./components/ProjectDetails";

// Standalone pages
import About from "./components/About";
import Projects from "./components/Projects";
import Contact from "./components/Contact";

// Admin Panel Components & Pages
import ProtectedRoute from "./admin/components/ProtectedRoute";
import AdminLayout from "./admin/components/AdminLayout";
import AdminLogin from "./admin/pages/AdminLogin";
import AdminDashboard from "./admin/pages/AdminDashboard";
import CategoryManagement from "./admin/pages/CategoryManagement";
import ProjectManagement from "./admin/pages/ProjectManagement";
import HomepageManagement from "./admin/pages/HomepageManagement";

import "./App.css";

function HomePage() {
  return (
    <main className="home-page">
      {/* 1. Existing Hero Section (Preserved 100% with dynamic background image) */}
      <div id="home">
        <Hero />
      </div>

      {/* 2. Existing Black Services Strip (Preserved 100%) */}
      <ServiceStrip />

      {/* 3. Short About Section */}
      <ShortAbout />

      {/* 4. Three Project Category Cards with Category-Specific Grid Navigation */}
      <ProjectPortfolio />

      {/* 5. Trusted Client Partnerships — continuous logo carousel */}
      <TrustedClients />

      {/* 6. Comprehensive Services Section */}
      <Services />

      {/* 7. Insights & Blog Section */}
      <Blog />
    </main>
  );
}

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      <ScrollToTop />

      {/* Public Navbar (Hidden on Admin Panel routes) */}
      {!isAdminRoute && <Navbar />}

      <Routes>
        {/* PUBLIC SINGLE-PAGE HOMEPAGE */}
        <Route path="/" element={<HomePage />} />

        {/* DYNAMIC CATEGORY GRID & PROJECT DETAILS */}
        <Route path="/category/:slug" element={<CategoryProjectGrid />} />
        <Route path="/projects/:slug" element={<ProjectDetails />} />

        {/* STANDALONE ROUTES (PRESERVED) */}
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/contact" element={<Contact />} />

        {/* ADMIN PANEL ROUTES (ONLY THREE SECTIONS) */}
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="homepage" element={<HomepageManagement />} />
          <Route path="categories" element={<CategoryManagement />} />
          <Route path="projects" element={<ProjectManagement />} />
        </Route>

        {/* FALLBACK CATCH-ALL */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Public Footer (Hidden on Admin Panel routes) */}
      {!isAdminRoute && <Footer />}
    </>
  );
}

export default App;
