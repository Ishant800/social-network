import { ChevronRight, LockKeyholeIcon, ShieldCheck, UserCircle } from "lucide-react";
import { useState } from "react";

const settingsSections = [
  {
    id: "account",
    icon: UserCircle,
    title: "Account",
    description: "Manage your profile details and account contact info.",
    items: [
      {
        title: "Profile information",
        description: "Update your photo, name, and editorial bio.",
        type: "profile",
      },
      {
        title: "Email address",
        description: "alex.atheneum@editorial.com",
        type: "link",
      },
    ],
  },
  {
    id: "privacy",
    icon: LockKeyholeIcon,
    title: "Privacy",
    description: "Control how people discover you and interact with your profile.",
    items: [
      {
        title: "Discoverability",
        description: "Allow others to find your profile via email or phone.",
        type: "toggle",
        key: "discoverability",
      },
      {
        title: "Mentions and tags",
        description: "Only people you follow can tag you in posts.",
        type: "link",
      },
    ],
  },
  {
    id: "security",
    icon: ShieldCheck,
    title: "Security",
    description: "Keep your account protected and review access activity.",
    items: [
      {
        title: "Two-factor authentication",
        description: "Add an extra layer of security to your Atheneum account.",
        type: "badge",
        badge: "Recommended",
      },
      {
        title: "Login history",
        description: "Review recent devices and locations used.",
        type: "link",
      },
    ],
  },
];

export default function Settings() {
  const [discoverability, setDiscoverability] = useState(true);

  const renderControl = (item) => {
    if (item.type === "toggle") {
      return (
        <button
          type="button"
          onClick={() => setDiscoverability(!discoverability)}
          className={`flex h-6 w-11 items-center rounded-full px-1 transition ${
            discoverability ? "bg-indigo-600" : "bg-slate-300"
          }`}
        >
          <span
            className={`h-4 w-4 rounded-full bg-white transition ${
              discoverability ? "ml-auto" : ""
            }`}
          />
        </button>
      );
    }

    if (item.type === "badge") {
      return (
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
          {item.badge}
        </span>
      );
    }

    return <ChevronRight className="h-5 w-5 text-slate-400" />;
  };

  return (
    <main className="w-full bg-[#f5f7f9] py-4">
      <div className="mx-auto w-full max-w-[1040px] px-4 sm:px-6">
        <header className="mb-8">
          <h1 className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight text-slate-900">
            Settings
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
            Manage your account preferences, privacy controls, and security settings in one place.
          </p>
        </header>

        <div className="space-y-6">
          {settingsSections.map((section) => {
            const Icon = section.icon;

            return (
              <section key={section.id} className="rounded-[1.75rem] bg-white p-5 shadow-sm md:p-6">
                <div className="mb-5 flex items-start gap-3">
                  <div className="rounded-xl bg-slate-100 p-2.5 text-slate-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-slate-900">
                      {section.title}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">{section.description}</p>
                  </div>
                </div>

                <div className="overflow-hidden rounded-[1.25rem] border border-slate-100">
                  {section.items.map((item, index) => (
                    <div
                      key={item.title}
                      className={`flex items-center justify-between gap-4 bg-white px-4 py-4 md:px-5 ${
                        index !== 0 ? "border-t border-slate-100" : ""
                      }`}
                    >
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                        <p className="mt-1 text-sm leading-6 text-slate-500">{item.description}</p>
                      </div>

                      <div className="shrink-0">
                        {item.type === "profile" ? (
                          <div className="flex items-center gap-3">
                            <div className="h-11 w-11 overflow-hidden rounded-xl">
                              <img
                                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80"
                                alt="Profile"
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <ChevronRight className="h-5 w-5 text-slate-400" />
                          </div>
                        ) : (
                          renderControl(item)
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}

          <section className="rounded-[1.75rem] border border-red-100 bg-red-50 p-5 md:p-6">
            <h2 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-red-600">
              Deactivate account
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
              Temporarily disable your account and remove your profile from public view until you
              decide to come back.
            </p>
            <button className="mt-5 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700">
              Deactivate account
            </button>
          </section>
        </div>
      </div>
    </main>
  );
}
