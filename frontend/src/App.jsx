
import { Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Hero from "./components/Hero";
import ServiceStrip from "./components/ServiceStrip";
import Clients from "./components/Clients";
import PhilosophyValues from "./components/PhilosophyValues";

import About from "./components/About";
import Services from "./components/Services";
import Projects from "./components/Projects";
import Blog from "./components/Blog";
import Contact from "./components/Contact";

import "./App.css";

function HomePage() {
  return (
    <main className="home-page">
      <Hero />
      <ServiceStrip />
      <PhilosophyValues />
      <Clients />
    </main>
  );
}

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/contact" element={<Contact />} />

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>

      <Footer />
    </>
  );
}

export default App;
