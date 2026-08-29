"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarDays, Clock3, PenLine, Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PageHero } from "@/components/ui/PageHero";

type BlogPost = {
  id: string | number;
  title: string;
  category?: string;
  image?: string;
  excerpt?: string;
  slug?: string;
  read_time?: string;
  date?: string;
};

const FALLBACK_IMAGES = [
  "/images/catalog/general.png",
  "/images/catalog/google.png",
  "/images/catalog/discord.png",
  "/logo.jpg",
];

function getPostHref(post: BlogPost) {
  return `/blog/${post.slug || post.id}`;
}

function getCategory(post: BlogPost) {
  return post.category?.trim() || "Growth";
}

function getReadTime(readTime?: string) {
  const value = readTime?.trim();
  if (!value) return "5 min read";
  return value.toLowerCase().includes("read") ? value : `${value} read`;
}

function getFallbackImage(index: number) {
  return FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
}

function getImageSource(image: string | undefined, index: number) {
  const value = image?.trim();
  if (!value) return getFallbackImage(index);

  if (value.startsWith("/images/") && !value.startsWith("/images/catalog/")) {
    return getFallbackImage(index);
  }

  return value;
}

function BlogImage({
  post,
  index,
  priority = false,
}: {
  post: BlogPost;
  index: number;
  priority?: boolean;
}) {
  const src = getImageSource(post.image, index);

  return (
    <img
      src={src}
      alt={post.title}
      loading={priority ? "eager" : "lazy"}
      className="official-blog-image"
      onError={(event) => {
        event.currentTarget.onerror = null;
        event.currentTarget.src = getFallbackImage(index);
      }}
    />
  );
}

export default function BlogPageClient({ initialPosts }: { initialPosts: BlogPost[] }) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts ?? []);
  const [loading, setLoading] = useState(!(initialPosts && initialPosts.length > 0));
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    let mounted = true;

    async function loadLatestPosts() {
      try {
        const response = await fetch("/api/blogs", { cache: "no-store" });
        if (!response.ok) throw new Error("Blog API unavailable");

        const data = await response.json();
        if (!mounted || !Array.isArray(data)) return;

        if (data.length > 0 || (initialPosts ?? []).length === 0) {
          setPosts(data);
        }
      } catch {
        // Keep server-rendered posts visible if the local API or database is unavailable.
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadLatestPosts();

    return () => {
      mounted = false;
    };
  }, [initialPosts]);

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(posts.map(getCategory))).filter(Boolean);
    return ["All", ...uniqueCategories];
  }, [posts]);

  useEffect(() => {
    if (!categories.includes(activeCategory)) setActiveCategory("All");
  }, [activeCategory, categories]);

  const filteredPosts = useMemo(() => {
    if (activeCategory === "All") return posts;
    return posts.filter((post) => getCategory(post) === activeCategory);
  }, [activeCategory, posts]);

  const featuredPost = filteredPosts[0];
  const otherPosts = featuredPost
    ? filteredPosts.filter((post) => String(post.id) !== String(featuredPost.id))
    : [];

  return (
    <main style={{ background: "var(--bg-base)", minHeight: "100vh", color: "var(--text-primary)" }}>
      <Navbar />

      <div style={{ paddingTop: "80px" }}>
        <PageHero
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "Blog" }]}
          label="Blog"
          title={
            <>
              Growth Playbooks That <span style={{ color: "#ff4444" }}>Rank</span>
            </>
          }
          description="Actionable SEO, guest posting, web development, and digital growth guides written for founders who need clear next steps."
        />

        <section className="official-blog-section">
          <div className="container">
            <div className="official-blog-topbar">
              <div>
                <p className="official-blog-eyebrow">Latest articles</p>
                <h2>Guides built for search visibility and conversion.</h2>
              </div>
              <div className="official-blog-search-note">
                <Search size={18} />
                <span>{posts.length} published guides</span>
              </div>
            </div>

            <div className="official-blog-filter" aria-label="Blog categories">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={activeCategory === category ? "is-active" : ""}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="official-blog-loading">Loading blog posts...</div>
            ) : (
              <>
                {featuredPost ? (
                  <motion.article
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55 }}
                    className="official-blog-featured"
                  >
                    <Link href={getPostHref(featuredPost)} className="official-blog-featured-link">
                      <div className="official-blog-featured-media">
                        <BlogImage post={featuredPost} index={0} priority />
                        <span>Featured guide</span>
                      </div>

                      <div className="official-blog-featured-copy">
                        <div className="official-blog-meta">
                          <span>{getCategory(featuredPost)}</span>
                          <span>
                            <Clock3 size={15} />
                            {getReadTime(featuredPost.read_time)}
                          </span>
                        </div>
                        <h3>{featuredPost.title}</h3>
                        <p>{featuredPost.excerpt}</p>
                        <div className="official-blog-read-more">Read article {"->"}</div>
                      </div>
                    </Link>
                  </motion.article>
                ) : null}

                {otherPosts.length > 0 ? (
                  <div className="official-blog-grid">
                    {otherPosts.map((post, index) => (
                      <motion.article
                        key={`${post.id}-${post.slug || index}`}
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.2) }}
                        viewport={{ once: true, margin: "-80px" }}
                        className="official-blog-card"
                      >
                        <Link href={getPostHref(post)} className="official-blog-card-link">
                          <div className="official-blog-card-media">
                            <BlogImage post={post} index={index + 1} />
                          </div>

                          <div className="official-blog-card-copy">
                            <div className="official-blog-meta">
                              <span>{getCategory(post)}</span>
                              <span>
                                <CalendarDays size={15} />
                                {post.date || "Updated"}
                              </span>
                            </div>
                            <h3>{post.title}</h3>
                            <p>{post.excerpt}</p>
                            <div className="official-blog-card-footer">
                              <span>{getReadTime(post.read_time)}</span>
                              <strong>Read {"->"}</strong>
                            </div>
                          </div>
                        </Link>
                      </motion.article>
                    ))}
                  </div>
                ) : null}

                {filteredPosts.length === 0 ? (
                  <div className="official-blog-empty">
                    <PenLine size={42} />
                    <h3>No posts found</h3>
                    <p>Fresh OfficialUM1 guides will appear here as soon as they are published.</p>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </section>
      </div>

      <style jsx global>{`
        .official-blog-section {
          padding: 72px 0 110px;
          background: linear-gradient(180deg, var(--bg-base) 0%, #ffffff 100%);
        }

        .official-blog-topbar {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 24px;
        }

        .official-blog-eyebrow {
          margin: 0 0 8px;
          color: var(--accent-blue);
          font-size: 14px;
          font-weight: 800;
          text-transform: uppercase;
        }

        .official-blog-topbar h2 {
          margin: 0;
          max-width: 720px;
          color: var(--text-primary);
          font-size: clamp(30px, 4vw, 48px);
          font-weight: 900;
          line-height: 1.08;
          letter-spacing: 0;
        }

        .official-blog-search-note {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          flex: 0 0 auto;
          border: 1px solid var(--border-subtle);
          border-radius: 999px;
          background: #ffffff;
          color: var(--text-secondary);
          padding: 12px 16px;
          font-weight: 700;
          box-shadow: 0 14px 30px rgba(24, 32, 38, 0.06);
        }

        .official-blog-filter {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin: 0 0 34px;
        }

        .official-blog-filter button {
          border: 1px solid var(--border-subtle);
          border-radius: 999px;
          background: #ffffff;
          color: var(--text-secondary);
          min-height: 42px;
          padding: 0 16px;
          font-weight: 800;
          cursor: pointer;
          transition: border-color 0.2s ease, color 0.2s ease, background 0.2s ease, transform 0.2s ease;
        }

        .official-blog-filter button:hover,
        .official-blog-filter button.is-active {
          background: var(--accent-blue);
          border-color: var(--accent-blue);
          color: #ffffff;
          transform: translateY(-1px);
        }

        .official-blog-loading,
        .official-blog-empty {
          border: 1px solid var(--border-subtle);
          border-radius: 18px;
          background: #ffffff;
          color: var(--text-secondary);
          padding: 64px 24px;
          text-align: center;
          box-shadow: 0 16px 34px rgba(24, 32, 38, 0.06);
        }

        .official-blog-empty svg {
          color: #ff4444;
          margin-bottom: 18px;
        }

        .official-blog-empty h3 {
          margin: 0 0 8px;
          color: var(--text-primary);
          font-size: 24px;
          font-weight: 900;
        }

        .official-blog-empty p {
          margin: 0;
          color: var(--text-secondary);
        }

        .official-blog-featured {
          margin-bottom: 34px;
        }

        .official-blog-featured-link,
        .official-blog-card-link {
          color: inherit;
          text-decoration: none;
        }

        .official-blog-featured-link {
          display: grid;
          grid-template-columns: minmax(300px, 0.95fr) minmax(320px, 1.05fr);
          overflow: hidden;
          border: 1px solid var(--border-subtle);
          border-radius: 22px;
          background: #ffffff;
          box-shadow: 0 22px 48px rgba(24, 32, 38, 0.08);
        }

        .official-blog-featured-media,
        .official-blog-card-media {
          position: relative;
          min-height: 100%;
          background: #edf5f3;
          overflow: hidden;
        }

        .official-blog-featured-media {
          min-height: 430px;
        }

        .official-blog-featured-media span {
          position: absolute;
          top: 22px;
          left: 22px;
          z-index: 2;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.94);
          color: var(--text-primary);
          padding: 9px 13px;
          font-size: 13px;
          font-weight: 900;
          box-shadow: 0 12px 26px rgba(24, 32, 38, 0.16);
        }

        .official-blog-image {
          display: block;
          width: 100%;
          height: 100%;
          min-height: inherit;
          object-fit: cover;
          transition: transform 0.35s ease;
        }

        .official-blog-featured-link:hover .official-blog-image,
        .official-blog-card-link:hover .official-blog-image {
          transform: scale(1.04);
        }

        .official-blog-featured-copy {
          display: flex;
          min-width: 0;
          flex-direction: column;
          justify-content: center;
          padding: clamp(28px, 5vw, 58px);
        }

        .official-blog-meta {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 10px 14px;
          margin-bottom: 16px;
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 800;
        }

        .official-blog-meta span {
          display: inline-flex;
          align-items: center;
          gap: 7px;
        }

        .official-blog-meta span:first-child {
          color: #ff4444;
        }

        .official-blog-featured-copy h3,
        .official-blog-card-copy h3 {
          margin: 0;
          color: var(--text-primary);
          font-weight: 900;
          line-height: 1.18;
          letter-spacing: 0;
        }

        .official-blog-featured-copy h3 {
          max-width: 780px;
          font-size: clamp(30px, 4vw, 48px);
        }

        .official-blog-featured-copy p,
        .official-blog-card-copy p {
          color: var(--text-secondary);
          line-height: 1.72;
        }

        .official-blog-featured-copy p {
          margin: 20px 0 28px;
          max-width: 700px;
          font-size: 17px;
        }

        .official-blog-read-more {
          display: inline-flex;
          align-items: center;
          width: fit-content;
          border-radius: 999px;
          background: linear-gradient(135deg, var(--accent-blue), #b64b3a);
          color: #ffffff;
          padding: 14px 20px;
          font-weight: 900;
          box-shadow: 0 16px 34px rgba(20, 108, 120, 0.2);
        }

        .official-blog-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
        }

        .official-blog-card {
          min-width: 0;
        }

        .official-blog-card-link {
          display: flex;
          min-height: 100%;
          overflow: hidden;
          flex-direction: column;
          border: 1px solid var(--border-subtle);
          border-radius: 18px;
          background: #ffffff;
          box-shadow: 0 16px 34px rgba(24, 32, 38, 0.07);
          transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
        }

        .official-blog-card-link:hover {
          transform: translateY(-5px);
          border-color: rgba(20, 108, 120, 0.34);
          box-shadow: 0 22px 42px rgba(24, 32, 38, 0.11);
        }

        .official-blog-card-media {
          height: 212px;
          border-bottom: 1px solid var(--border-subtle);
        }

        .official-blog-card-copy {
          display: flex;
          flex: 1;
          min-width: 0;
          flex-direction: column;
          padding: 24px;
        }

        .official-blog-card-copy h3 {
          font-size: 22px;
        }

        .official-blog-card-copy p {
          flex: 1;
          margin: 14px 0 22px;
          font-size: 15.5px;
        }

        .official-blog-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          border-top: 1px solid var(--border-subtle);
          padding-top: 16px;
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 800;
        }

        .official-blog-card-footer strong {
          color: var(--accent-blue);
          white-space: nowrap;
        }

        @media (max-width: 900px) {
          .official-blog-section {
            padding: 52px 0 82px;
          }

          .official-blog-topbar {
            align-items: flex-start;
            flex-direction: column;
          }

          .official-blog-featured-link {
            grid-template-columns: 1fr;
          }

          .official-blog-featured-media {
            min-height: 300px;
          }
        }

        @media (max-width: 560px) {
          .official-blog-topbar h2 {
            font-size: 30px;
          }

          .official-blog-filter {
            overflow-x: auto;
            flex-wrap: nowrap;
            padding-bottom: 6px;
          }

          .official-blog-filter button {
            flex: 0 0 auto;
          }

          .official-blog-featured-copy,
          .official-blog-card-copy {
            padding: 22px;
          }

          .official-blog-featured-media {
            min-height: 240px;
          }

          .official-blog-card-media {
            height: 190px;
          }
        }
      `}</style>

      <Footer />
    </main>
  );
}
