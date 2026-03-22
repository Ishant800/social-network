import { useEffect, useMemo, useState } from "react";

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

const tabs = ["For You", "Trending Topics", "Articles", "Posts", "Topics"];

const curatedTopics = [
  { icon: "palette", label: "Art" },
  { icon: "memory", label: "Tech" },
  { icon: "auto_stories", label: "Poetry" },
  { icon: "biotech", label: "Science" },
  { icon: "architecture", label: "Design" },
  { icon: "history_edu", label: "History" },
];

const trendingTopics = [
  { label: "#FutureOfWork" },
  { label: "#EthicalAI" },
  { label: "#SustainableTech" },
  { label: "#Minimalism" },
];

const feedItems = [
  {
    id: "article-1",
    type: "article",
    tag: "Tech Trends",
    topic: "#EthicalAI",
    title: "The Return of Analogue in a Digital First World.",
    description:
      "Explore why the most sophisticated tech pioneers are returning to vinyl, film, and mechanical switches in their personal lives.",
    image:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop",
    author: "Marcus Chen",
    meta: "8 min read",
    accent: "text-indigo-600",
    icon: "auto_awesome",
    layout: "split",
  },
  {
    id: "post-1",
    type: "post",
    topic: "#EthicalAI",
    author: "Sarah Jenkins",
    handle: "@sara_h",
    time: "2 hours ago",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop",
    content:
      "Just finished reading 'The Ethics of AI' collection. It's fascinating how our definition of human-centric design is shifting so rapidly. Thoughts on the new EU regulations?",
    likes: 124,
    comments: 18,
  },
  {
    id: "article-1b",
    type: "article",
    tag: "Workflows",
    topic: "#FutureOfWork",
    title: "Why Desk Rituals Beat Productivity Apps for Deep Creative Work.",
    description:
      "A closer look at why writers, designers, and researchers are rebuilding simple work rituals around sound, light, and analog planning.",
    image:
      "https://images.unsplash.com/photo-1742198848815-8da760f8e9e9?auto=format&fit=crop&w=1400&q=80",
    author: "Elena Park",
    meta: "6 min read",
    accent: "text-emerald-700",
    icon: "event_note",
    layout: "split",
  },
  {
    id: "article-2",
    type: "article",
    tag: "Architecture",
    topic: "#Minimalism",
    title: "Brutalism: The Beauty in Raw Sincerity.",
    description:
      "A look at why raw materiality, unapologetic structure, and bold geometry are finding a new audience in digital-first creative culture.",
    image:
      "https://www.google.com/imgres?q=raw%20beauty%20image&imgurl=https%3A%2F%2Ft3.ftcdn.net%2Fjpg%2F15%2F54%2F34%2F26%2F360_F_1554342684_RHrDnuLx7cevqFn6zfTMqs977r1tcaiU.jpg&imgrefurl=https%3A%2F%2Fstock.adobe.com%2Fsearch%3Fk%3Draw%2Bportrait&docid=xsnbJ2rYSFc-YM&tbnid=jU6MPltBWH8DTM&vet=12ahUKEwjWk7bO5LCTAxXmwzgGHSUWNt0QnPAOegQIIBAB..i&w=643&h=360&hcb=2&ved=2ahUKEwjWk7bO5LCTAxXmwzgGHSUWNt0QnPAOegQIIBAB",
    author: "Julian Rossi",
    meta: "15 min read",
    accent: "text-sky-700",
    icon: "architecture",
    layout: "feature",
  },
  {
    id: "post-1b",
    type: "post",
    topic: "#SustainableTech",
    author: "Omar Fielding",
    handle: "@omar.builds",
    time: "4 hours ago",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    content:
      "Prototype update: we swapped the default onboarding flow for a lighter one built around fewer prompts and clearer defaults. Completion rate jumped immediately.",
    image:
      "https://images.unsplash.com/photo-1637558872005-9f5932b42014?auto=format&fit=crop&w=1200&q=80",
    likes: 89,
    comments: 12,
  },
  {
    id: "post-2",
    type: "post",
    topic: "#FutureOfWork",
    author: "Nadia Brooks",
    handle: "@nadia.studio",
    time: "Yesterday",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&auto=format&fit=crop",
    content:
      "Remote teams do better when async writing is treated like product design, not admin overhead. Templates, rituals, and strong editorial review matter more than meetings.",
    likes: 301,
    comments: 47,
  },
  {
    id: "article-3",
    type: "article",
    tag: "Media",
    topic: "#SustainableTech",
    title: "Podcast Rooms, Shared Studios, and the Return of Intentional Workspaces.",
    description:
      "Small teams are designing creator spaces that feel less like offices and more like focused production environments built for conversation and craft.",
    image:
      "https://images.unsplash.com/photo-1637558872005-9f5932b42014?auto=format&fit=crop&w=1400&q=80",
    author: "Naomi Reed",
    meta: "9 min read",
    accent: "text-violet-700",
    icon: "mic_external_on",
    layout: "split",
  },
  {
    id: "post-3",
    type: "post",
    topic: "#Minimalism",
    author: "Mina Hart",
    handle: "@minahart",
    time: "Yesterday",
    avatar:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=200&q=80",
    content:
      "The best product update this week was invisible: fewer badges, fewer labels, stronger spacing. Sometimes the fastest way to help people is to stop shouting at them.",
    likes: 214,
    comments: 33,
  },
  {
    id: "article-4",
    type: "article",
    tag: "Urban Design",
    topic: "#Minimalism",
    title: "Why Clean City Geometry Still Feels Fresh in Editorial Design.",
    description:
      "Sharp grid lines, high contrast structures, and quiet monochrome palettes are shaping a new visual language for modern reading experiences.",
    image:
      "https://images.unsplash.com/photo-1756719032890-770d2c8946c7?auto=format&fit=crop&w=1400&q=80",
    author: "Daniel Sato",
    meta: "7 min read",
    accent: "text-slate-700",
    icon: "location_city",
    layout: "feature",
  },
  {
    id: "post-4",
    type: "post",
    topic: "#EthicalAI",
    author: "Tessa Morgan",
    handle: "@tessamorgan",
    time: "2 days ago",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    content:
      "If your AI summary changes the tone of the original writer, it is not a summary anymore. It is a rewrite. Teams need stronger editorial guardrails before they automate more surfaces.",
    image:
      "https://images.unsplash.com/photo-1512920115544-d149d1dedcb7?auto=format&fit=crop&w=1200&q=80",
    likes: 176,
    comments: 29,
  },
];

export default function Explore() {
  const [activeTab, setActiveTab] = useState("For You");
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const existingLink = document.querySelector('link[data-material-symbols="true"]');
    if (existingLink) return;

    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap";
    link.rel = "stylesheet";
    link.dataset.materialSymbols = "true";
    document.head.appendChild(link);

    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, []);

  const visibleItems = useMemo(() => {
    return feedItems.filter((item) => {
      const matchesTopic = selectedTopic === "All" || item.topic === selectedTopic;
      const searchValue = searchQuery.trim().toLowerCase();
      const searchSource = [
        item.title,
        item.description,
        item.author,
        item.handle,
        item.content,
        item.tag,
        item.topic,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesSearch = !searchValue || searchSource.includes(searchValue);

      if (activeTab === "For You") return matchesTopic && matchesSearch;
      if (activeTab === "Trending Topics") {
        return matchesTopic && matchesSearch && trendingTopics.some((topic) => topic.label === item.topic);
      }
      if (activeTab === "Articles") return matchesTopic && matchesSearch && item.type === "article";
      if (activeTab === "Posts") return matchesTopic && matchesSearch && item.type === "post";
      if (activeTab === "Topics") return matchesSearch && item.type === "article";

      return matchesTopic && matchesSearch;
    });
  }, [activeTab, searchQuery, selectedTopic]);

  return (
    <div className="min-h-screen bg-[#f5f7f9] font-body text-slate-900">
      <div className="mx-auto w-full max-w-[1180px] px-4 pb-20 md:px-6 xl:px-8">
        <main className="space-y-5">
          <div className="sticky top-15 z-20 border-b border-slate-200 bg-[#f5f7f9]/95 backdrop-blur-sm">
            <div className="flex flex-col gap-3 py-2 md:flex-row md:items-center md:justify-between">
              <div className="flex gap-6 overflow-x-auto whitespace-nowrap">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`border-b-2 px-1 py-3 text-sm font-semibold transition-colors ${
                      activeTab === tab
                        ? "border-indigo-600 text-indigo-700"
                        : "border-transparent text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <label className="flex w-full bg-slate-100 items-center gap-2 text-slate-400 md:max-w-xs">
                <MaterialIcon name="search" className="text-lg" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search posts, articles, or topics"
                  className="w-full bg-transparent py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                />
              </label>
            </div>
          </div>

          <section className="rounded-2xl bg-white p-4 shadow-sm md:p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-display text-base font-bold text-slate-900">Filters</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Pick a topic to narrow the feed.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 text-sm">
                <button
                  type="button"
                  onClick={() => setActiveTab("Topics")}
                  className="font-medium text-slate-500 transition hover:text-slate-900"
                >
                  View more
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
              {curatedTopics.map((topic) => (
                <button
                  key={topic.label}
                  type="button"
                  onClick={() => {
                    setSelectedTopic("All");
                    setActiveTab(topic.label === "Tech" ? "Trending Topics" : "Topics");
                  }}
                  className="flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
                >
                  <MaterialIcon name={topic.icon} className="text-base" />
                  <span>{topic.label}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setActiveTab("For You");
                  setSelectedTopic("All");
                }}
                className="flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
              >
                <MaterialIcon name="add" className="text-base" />
                <span>View more topics</span>
              </button>
            </div>
          </section>

          <section className="space-y-6">
            {visibleItems.length === 0 && (
              <div className="rounded-2xl bg-white px-6 py-10 text-center shadow-sm">
                <h3 className="font-display text-lg font-bold text-slate-900">No matches yet</h3>
                <p className="mt-2 text-sm text-slate-500">
                  Try another tab or clear the active filter.
                </p>
              </div>
            )}

            {visibleItems.map((item) =>
              item.type === "article" ? (
                item.layout === "split" ? (
                  <article
                    key={item.id}
                    className="overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-md"
                  >
                    <div className="grid gap-0 md:grid-cols-[minmax(260px,0.9fr)_minmax(0,1.1fr)]">
                      <div className="h-72 overflow-hidden md:h-full">
                        <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex flex-col justify-between p-6 md:p-8">
                        <div>
                          <div className={`mb-3 flex items-center gap-2 text-xs font-semibold ${item.accent}`}>
                            <MaterialIcon name={item.icon} className="text-base" />
                            <span>{item.tag}</span>
                          </div>
                          <h3 className="font-display text-2xl font-bold leading-tight text-slate-900 md:text-3xl">
                            {item.title}
                          </h3>
                          <p className="mt-3 text-sm leading-7 text-slate-500">
                            {item.description}
                          </p>
                        </div>

                        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{item.author}</p>
                            <p className="text-sm text-slate-500">{item.meta}</p>
                          </div>
                          <button
                            type="button"
                            className="rounded-full border border-slate-200 p-2.5 text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
                          >
                            <MaterialIcon name="bookmark" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ) : (
                  <article key={item.id} className="rounded-2xl bg-white p-5 shadow-sm md:p-6">
                    <div className="overflow-hidden rounded-xl">
                      <img src={item.image} alt={item.title} className="h-[320px] w-full object-cover md:h-[420px]" />
                    </div>
                    <div className="mx-auto max-w-3xl py-6">
                      <div className={`mb-3 flex items-center gap-2 text-xs font-semibold ${item.accent}`}>
                        <MaterialIcon name={item.icon} className="text-base" />
                        <span>{item.tag}</span>
                      </div>
                      <h3 className="font-display text-2xl font-bold text-slate-900 md:text-3xl">
                        {item.title}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-slate-500">
                        {item.description}
                      </p>
                      <div className="mt-5 flex flex-wrap items-center gap-4 text-sm">
                        <span className="font-semibold text-slate-900">By {item.author}</span>
                        <span className="h-1 w-1 rounded-full bg-slate-300" />
                        <span className="text-slate-500">{item.meta}</span>
                        <span className="h-1 w-1 rounded-full bg-slate-300" />
                        <button type="button" className="font-semibold text-indigo-600">
                          Read more
                        </button>
                      </div>
                    </div>
                  </article>
                )
              ) : (
                <article key={item.id} className="rounded-2xl bg-white p-5 shadow-sm md:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <img
                        src={item.avatar}
                        alt={item.author}
                        className="h-11 w-11 rounded-full object-cover"
                      />
                      <div className="min-w-0">
                        <h4 className="truncate text-[15px] font-semibold text-slate-900">
                          {item.author}{" "}
                          <span className="font-normal text-slate-400">{item.handle}</span>
                        </h4>
                        <p className="text-sm text-slate-500">{item.time}</p>
                      </div>
                    </div>
                    <button type="button" className="text-slate-400 transition hover:text-slate-700">
                      <MaterialIcon name="more_horiz" />
                    </button>
                  </div>

                  <p className="mt-5 text-[15px] leading-7 text-slate-700">{item.content}</p>

                  {item.image && (
                    <div className="mt-4 overflow-hidden rounded-xl">
                      <img
                        src={item.image}
                        alt={item.author}
                        className="h-64 w-full object-cover"
                      />
                    </div>
                  )}

                  <div className="mt-5 flex items-center gap-5 text-slate-500">
                    <button type="button" className="flex items-center gap-2 text-sm transition hover:text-indigo-600">
                      <MaterialIcon name="favorite" className="text-xl" />
                      <span className="font-medium">{item.likes}</span>
                    </button>
                    <button type="button" className="flex items-center gap-2 text-sm transition hover:text-indigo-600">
                      <MaterialIcon name="chat_bubble" className="text-xl" />
                      <span className="font-medium">{item.comments}</span>
                    </button>
                    <button type="button" className="ml-auto transition hover:text-indigo-600">
                      <MaterialIcon name="share" className="text-xl" />
                    </button>
                  </div>
                </article>
              ),
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
