import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

// ─── Icon Component ────────────────────────────────────────────────────────
const MaterialIcon = ({ name, filled = false, className = "" }) => (
  <span
    className={`material-symbols-outlined ${className}`}
    style={{
      fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
    }}
  >
    {name}
  </span>
);

// ─── Data (Articles/Blogs/News Only - No Posts) ───────────────────────────
const TABS = ["For You", "Trending", "Latest", "News", "Topics"];

const CONTENT_TYPES = [
  { icon: "article", label: "Articles" },
  { icon: "newspaper", label: "News" },
  { icon: "school", label: "Tutorials" },
  { icon: "case_study", label: "Case Studies" },
  { icon: "lightbulb", label: "Insights" },
];

const TRENDING_TOPICS = ["#EthicalAI", "#FutureOfWork", "#SustainableTech", "#Minimalism", "#WebDev"];

const FEED_ITEMS = [
  // Articles - Split Layout
  {
    id: "article-1",
    type: "article",
    category: "Articles",
    topic: "#EthicalAI",
    title: "The Return of Analogue in a Digital First World.",
    description: "Explore why the most sophisticated tech pioneers are returning to vinyl, film, and mechanical switches in their personal lives.",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop",
    author: "Marcus Chen",
    meta: "8 min read",
    accent: "text-indigo-600",
    icon: "auto_awesome",
    layout: "split",
  },
  {
    id: "article-2",
    type: "article",
    category: "Tutorials",
    topic: "#WebDev",
    title: "Mastering React Server Components in 2026.",
    description: "A comprehensive guide to building faster, more efficient applications with the latest React architecture patterns.",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&auto=format&fit=crop",
    author: "Sarah Kim",
    meta: "12 min read",
    accent: "text-emerald-600",
    icon: "code",
    layout: "split",
  },
  {
    id: "article-3",
    type: "article",
    category: "Insights",
    topic: "#FutureOfWork",
    title: "Why Desk Rituals Beat Productivity Apps for Deep Creative Work.",
    description: "A closer look at why writers, designers, and researchers are rebuilding simple work rituals around sound, light, and analog planning.",
    image: "https://images.unsplash.com/photo-1742198848815-8da760f8e9e9?auto=format&fit=crop&w=1400&q=80",
    author: "Elena Park",
    meta: "6 min read",
    accent: "text-violet-600",
    icon: "event_note",
    layout: "split",
  },
  // News - Split Layout
  {
    id: "news-1",
    type: "news",
    category: "News",
    topic: "#SustainableTech",
    title: "Major Tech Companies Commit to Carbon Neutral Data Centers by 2028.",
    description: "Industry leaders announce joint initiative to reduce computing environmental impact through renewable energy and efficient cooling systems.",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop",
    author: "Tech News Daily",
    meta: "3 min read",
    accent: "text-sky-600",
    icon: "newspaper",
    layout: "split",
  },
  {
    id: "news-2",
    type: "news",
    category: "News",
    topic: "#EthicalAI",
    title: "New EU Regulations Set Global Standard for AI Transparency.",
    description: "Groundbreaking legislation requires AI systems to disclose training data sources and decision-making processes to users.",
    image: "https://images.unsplash.com/photo-1555421689-d68471e189f2?w=1200&auto=format&fit=crop",
    author: "Policy Watch",
    meta: "5 min read",
    accent: "text-rose-600",
    icon: "gavel",
    layout: "split",
  },
  // Case Studies - Feature Layout
  {
    id: "case-1",
    type: "case-study",
    category: "Case Studies",
    topic: "#WebDev",
    title: "How We Scaled to 10M Users: A Backend Architecture Deep Dive.",
    description: "Lessons learned from migrating a monolith to microservices while maintaining 99.99% uptime during hypergrowth.",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop",
    author: "Engineering Team",
    meta: "20 min read",
    accent: "text-amber-600",
    icon: "timeline",
    layout: "feature",
  },
  // Articles - Feature Layout
  {
    id: "article-4",
    type: "article",
    category: "Articles",
    topic: "#Minimalism",
    title: "Brutalism: The Beauty in Raw Sincerity.",
    description: "A look at why raw materiality, unapologetic structure, and bold geometry are finding a new audience in digital-first creative culture.",
    image: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=1200&auto=format&fit=crop",
    author: "Julian Rossi",
    meta: "15 min read",
    accent: "text-slate-600",
    icon: "architecture",
    layout: "feature",
  },
  {
    id: "article-5",
    type: "article",
    category: "Tutorials",
    topic: "#WebDev",
    title: "Building Accessible Forms: A Complete Guide.",
    description: "Step-by-step tutorial on creating forms that work for everyone, including screen reader users and keyboard-only navigation.",
    image: "https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=1200&auto=format&fit=crop",
    author: "Alex Morgan",
    meta: "10 min read",
    accent: "text-indigo-600",
    icon: "accessibility",
    layout: "split",
  },
  {
    id: "news-3",
    type: "news",
    category: "News",
    topic: "#FutureOfWork",
    title: "Remote Work Stabilizes at 35% as Companies Find Hybrid Balance.",
    description: "New survey data shows workforce preferences settling into predictable patterns as organizations refine flexible policies.",
    image: "https://images.unsplash.com/photo-1593642632823-8f78536788c6?w=1200&auto=format&fit=crop",
    author: "Work Trends Report",
    meta: "4 min read",
    accent: "text-teal-600",
    icon: "trending_up",
    layout: "split",
  },
];

// ─── Card Components (Same Layout Pattern) ─────────────────────────────────

const ArticleSplitCard = ({ item }) => (
  <Link to={`/blog/${item.id}`} className="block overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-md">
    <div className="grid gap-0 md:grid-cols-[minmax(260px,0.9fr)_minmax(0,1.1fr)]">
      <div className="h-72 overflow-hidden md:h-full">
        <img src={item.image} alt={item.title} className="h-full w-full object-cover transition hover:scale-105" />
      </div>
      <div className="flex flex-col justify-between p-6 md:p-8">
        <div>
          <div className={`mb-3 flex items-center gap-2 text-xs font-semibold ${item.accent}`}>
            <MaterialIcon name={item.icon} className="text-base" />
            <span>{item.category}</span>
          </div>
          <h3 className="font-display text-2xl font-bold leading-tight text-slate-900 md:text-3xl line-clamp-2">
            {item.title}
          </h3>
          <p className="mt-3 text-sm leading-7 text-slate-500 line-clamp-3">{item.description}</p>
        </div>
        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">{item.author}</p>
            <p className="text-sm text-slate-500">{item.meta}</p>
          </div>
          <button
            type="button"
            onClick={(e) => e.preventDefault()}
            className="rounded-full border border-slate-200 p-2.5 text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
          >
            <MaterialIcon name="bookmark" />
          </button>
        </div>
      </div>
    </div>
  </Link>
);

const ArticleFeatureCard = ({ item }) => (
  <Link to={`/blog/${item.id}`} className="block rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md md:p-6">
    <div className="overflow-hidden rounded-xl">
      <img src={item.image} alt={item.title} className="h-[320px] w-full object-cover transition hover:scale-105 md:h-[420px]" />
    </div>
    <div className="mx-auto max-w-3xl py-6">
      <div className={`mb-3 flex items-center gap-2 text-xs font-semibold ${item.accent}`}>
        <MaterialIcon name={item.icon} className="text-base" />
        <span>{item.category}</span>
      </div>
      <h3 className="font-display text-2xl font-bold text-slate-900 md:text-3xl line-clamp-2">{item.title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-500 line-clamp-3">{item.description}</p>
      <div className="mt-5 flex flex-wrap items-center gap-4 text-sm">
        <span className="font-semibold text-slate-900">By {item.author}</span>
        <span className="h-1 w-1 rounded-full bg-slate-300" />
        <span className="text-slate-500">{item.meta}</span>
        <span className="ml-auto font-semibold text-indigo-600 hover:text-indigo-700">Read more →</span>
      </div>
    </div>
  </Link>
);

const FeedItem = ({ item }) => {
  return item.layout === "split" ? <ArticleSplitCard item={item} /> : <ArticleFeatureCard item={item} />;
};

// ─── Compact Filter Bar (Merged) ───────────────────────────────────────────

const CompactFilterBar = ({ selectedType, setSelectedType, selectedTrend, setSelectedTrend, onClear }) => {
  const hasActiveFilter = selectedType !== "All" || selectedTrend !== null;

  return (
    <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-295 items-center gap-2 overflow-x-auto px-0 py-2.5 scrollbar-hide">
        {/* Content Type Pills */}
        <div className="flex items-center gap-1.5 pl-4">
          <button
            onClick={() => setSelectedType("All")}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              selectedType === "All" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All
          </button>
          {CONTENT_TYPES.slice(0, 4).map((t) => (
            <button
              key={t.label}
              onClick={() => setSelectedType(t.label)}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                selectedType === t.label ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <MaterialIcon name={t.icon} className="text-xs" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Divider */}
        <span className="mx-2 h-4 w-px bg-slate-200" />

        {/* Trending Tags */}
        <div className="flex items-center gap-1.5 pr-4">
          {TRENDING_TOPICS.slice(0, 3).map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTrend(selectedTrend === tag ? null : tag)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                selectedTrend === tag ? "bg-indigo-50 text-indigo-700 border border-indigo-200" : "bg-slate-50 text-slate-600 border border-slate-200 hover:border-slate-300"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Clear Filters */}
        {hasActiveFilter && (
          <>
            <span className="mx-2 h-4 w-px bg-slate-200" />
            <button
              onClick={onClear}
              className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
            >
              <MaterialIcon name="close" className="text-xs" />
              Clear
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────

export default function Explore() {
  const [activeTab, setActiveTab] = useState("For You");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedTrend, setSelectedTrend] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Load Material Symbols font
  useEffect(() => {
    const existing = document.querySelector('link[data-material-symbols="true"]');
    if (existing) return;
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap";
    link.rel = "stylesheet";
    link.dataset.materialSymbols = "true";
    document.head.appendChild(link);
    return () => { if (document.head.contains(link)) document.head.removeChild(link); };
  }, []);

  // Filter logic (Articles/Blogs/News only - No Posts)
  const visibleItems = useMemo(() => {
    return FEED_ITEMS.filter((item) => {
      const matchesType = selectedType === "All" || item.category === selectedType;
      const matchesTrend = !selectedTrend || item.topic === selectedTrend;
      const search = searchQuery.trim().toLowerCase();
      const searchable = [item.title, item.description, item.author, item.category, item.topic].filter(Boolean).join(" ").toLowerCase();
      const matchesSearch = !search || searchable.includes(search);

      if (activeTab === "For You") return matchesType && matchesTrend && matchesSearch;
      if (activeTab === "Trending") return matchesTrend && matchesSearch;
      if (activeTab === "Latest") return matchesType && matchesSearch;
      if (activeTab === "News") return matchesType && matchesSearch && item.type === "news";
      if (activeTab === "Topics") return matchesSearch;

      return matchesType && matchesTrend && matchesSearch;
    });
  }, [activeTab, searchQuery, selectedType, selectedTrend]);

  const clearFilters = () => {
    setSelectedType("All");
    setSelectedTrend(null);
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-[#f5f7f9] font-body text-slate-900 scrollbar-hide">
      {/* Global Scrollbar Hide Styles */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="mx-auto w-full max-w-295 px-4 pb-20 md:px-6 xl:px-8">
        <main className="space-y-4">
          
          {/* Sticky Header: Tabs + Search + Compact Filters */}
          <div className="sticky top-0 z-30 -mx-4 bg-[#f5f7f9]/95 px-4 pb-0 pt-2 backdrop-blur-sm md:-mx-6 md:px-6 md:pt-3 xl:px-8">
            
            {/* Page Title */}
            <div className="mb-2 hidden md:block">
              <h1 className="text-xl font-extrabold text-slate-900">Explore</h1>
              <p className="text-sm text-slate-500">Discover articles, news, tutorials, and insights</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`border-b-2 px-1 py-2 text-sm font-semibold transition-colors ${
                    activeTab === tab ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Search + Filter Bar */}
            <div className="flex flex-col gap-2 pt-1">
              <label className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 text-slate-400">
                <MaterialIcon name="search" className="text-lg" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles, news, or topics"
                  className="w-full bg-transparent py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="rounded-full p-1 text-slate-400 hover:bg-slate-200">
                    <MaterialIcon name="close" className="text-sm" />
                  </button>
                )}
              </label>
              
              {/* Compact Filter Bar */}
              <CompactFilterBar
                selectedType={selectedType}
                setSelectedType={setSelectedType}
                selectedTrend={selectedTrend}
                setSelectedTrend={setSelectedTrend}
                onClear={clearFilters}
              />
            </div>
          </div>

          {/* Feed Items */}
          <section className="space-y-6 pt-2">
            {visibleItems.length === 0 ? (
              <div className="rounded-2xl bg-white px-6 py-10 text-center shadow-sm">
                <MaterialIcon name="search_off" className="mx-auto h-12 w-12 text-slate-300" />
                <h3 className="mt-4 font-display text-lg font-bold text-slate-900">No content found</h3>
                <p className="mt-2 text-sm text-slate-500">Try adjusting your search or filters to discover more.</p>
                {(selectedType !== "All" || selectedTrend || searchQuery) && (
                  <button onClick={clearFilters} className="mt-4 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700">
                    <MaterialIcon name="filter_alt_off" className="text-sm" />
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              visibleItems.map((item) => <FeedItem key={item.id} item={item} />)
            )}
          </section>

        </main>
      </div>
    </div>
  );
}