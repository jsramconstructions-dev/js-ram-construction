
import { useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  Clock3,
} from "lucide-react";
import { Link } from "react-router-dom";
import "./Blog.css";

const blogPosts = [
  {
    id: 1,
    category: "Construction Insights",
    title: "What Defines Quality in Modern Construction?",
    excerpt:
      "Explore the planning, engineering standards, and attention to detail that shape reliable and lasting structures.",
    date: "October 12, 2026",
    readTime: "5 min read",
    image: "/images/hero-construction.jpg",
  },
  {
    id: 2,
    category: "Project Updates",
    title: "From Foundation to Finish: The Building Journey",
    excerpt:
      "A closer look at the key stages of construction and the coordination required to deliver projects with precision.",
    date: "October 18, 2026",
    readTime: "6 min read",
    image: "/images/anjani-exoctica.jpg",
  },
  {
    id: 3,
    category: "Engineering",
    title: "The Importance of Precision in Structural Planning",
    excerpt:
      "Discover how careful structural planning, technical expertise, and execution contribute to building performance.",
    date: "October 22, 2026",
    readTime: "4 min read",
    image: "/images/limbanna-towers.jpg",
  },
];

const categories = [
  "All Articles",
  "Construction Insights",
  "Project Updates",
  "Engineering",
];

function Blog() {
  const [activeCategory, setActiveCategory] = useState("All Articles");

  const filteredPosts =
    activeCategory === "All Articles"
      ? blogPosts
      : blogPosts.filter(
          (post) => post.category === activeCategory
        );

  const handleImageError = (event) => {
    event.currentTarget.style.display = "none";
  };

  return (
    <main className="blog-page">
      {/* Compact premium hero section */}
      <section className="blog-hero">
        <div className="blog-hero-content">
          <span className="blog-eyebrow">
            KNOWLEDGE · EXPERIENCE · PERSPECTIVE
          </span>

          <h1>
            Insights That
            <br />
            <span>Build Tomorrow.</span>
          </h1>

          <p>
            Perspectives on construction, engineering, project execution,
            and the ideas shaping the built environment.
          </p>

          <div className="blog-hero-line" />
        </div>
      </section>

      {/* Blog articles */}
      <section className="blog-content">
        <div className="blog-section-heading">
          <div>
            <span className="blog-eyebrow">FROM OUR JOURNAL</span>
            <h2>Latest Articles</h2>
          </div>

          <p>
            Knowledge built through experience.
            <br />
            Insights designed to move you forward.
          </p>
        </div>

        {/* Category filters */}
        <div
          className="blog-filters"
          role="group"
          aria-label="Filter blog articles"
        >
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={
                activeCategory === category
                  ? "blog-filter active"
                  : "blog-filter"
              }
              onClick={() => setActiveCategory(category)}
              aria-pressed={activeCategory === category}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Article cards */}
        {filteredPosts.length > 0 ? (
          <div className="blog-grid">
            {filteredPosts.map((post, index) => (
              <article
                className="blog-card"
                key={post.id}
                style={{ "--blog-index": index }}
              >
                <div className="blog-card-image">
                  <img
                    src={post.image}
                    alt={post.title}
                    loading="lazy"
                    onError={handleImageError}
                  />

                  <span className="blog-card-category">
                    {post.category}
                  </span>
                </div>

                <div className="blog-card-body">
                  <div className="blog-card-meta">
                    <span>
                      <CalendarDays size={14} aria-hidden="true" />
                      {post.date}
                    </span>

                    <span>
                      <Clock3 size={14} aria-hidden="true" />
                      {post.readTime}
                    </span>
                  </div>

                  <h3>{post.title}</h3>

                  <p>{post.excerpt}</p>

                  <Link
                    to={`/blog/${post.id}`}
                    className="blog-read-more"
                    aria-label={`Read article: ${post.title}`}
                  >
                    Read Article
                    <ArrowUpRight size={17} aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="blog-empty" role="status">
            No articles found in this category.
          </p>
        )}

        {/* Brand signature */}
        <div className="blog-bottom-note">
          <span aria-hidden="true" />
          <p>
            Precision in Construction, Commitment in Delivery.
          </p>
          <span aria-hidden="true" />
        </div>
      </section>
    </main>
  );
}

export default Blog;
