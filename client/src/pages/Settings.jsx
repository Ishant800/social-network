import { ChevronRight, LockKeyholeIcon, ShieldCheck, UserCircle } from 'lucide-react';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

export default function Settings() {
  const { user } = useSelector((s) => s.auth);
  const [discoverability, setDiscoverability] = useState(true);

  const displayName = user?.profile?.fullName || user?.username || 'Your account';
  const email = user?.email || '—';
  const avatarUrl =
    user?.profile?.avatar?.url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=ccfbf1&color=115e59`;

  const renderControl = (item) => {
    if (item.type === 'toggle') {
      return (
        <button
          type="button"
          onClick={() => setDiscoverability(!discoverability)}
          className={`flex h-6 w-11 items-center rounded-full px-1 transition ${
            discoverability ? 'bg-teal-600' : 'bg-slate-300'
          }`}
        >
          <span
            className={`h-4 w-4 rounded-full bg-white transition ${discoverability ? 'ml-auto' : ''}`}
          />
        </button>
      );
    }

    if (item.type === 'badge') {
      return (
        <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800">
          {item.badge}
        </span>
      );
    }

    return <ChevronRight className="h-5 w-5 text-slate-400" />;
  };

  const sections = [
    {
      id: 'account',
      icon: UserCircle,
      title: 'Account',
      description: 'Profile and contact information.',
      items: [
        {
          title: 'Update profile',
          description: 'Photo, name, and bio',
          type: 'profile',
        },
        {
          title: 'Email address',
          description: email,
          type: 'link',
        },
      ],
    },
    {
      id: 'privacy',
      icon: LockKeyholeIcon,
      title: 'Privacy',
      description: 'Control how others find and interact with you.',
      items: [
        {
          title: 'Discoverability',
          description: 'Placeholder toggle for future privacy API.',
          type: 'toggle',
          key: 'discoverability',
        },
        {
          title: 'Mentions and tags',
          description: 'Configure who can tag you (coming soon).',
          type: 'link',
        },
      ],
    },
    {
      id: 'security',
      icon: ShieldCheck,
      title: 'Security',
      description: 'Protect your sign-in.',
      items: [
        {
          title: 'Password',
          description: 'Change password flows can be added here.',
          type: 'link',
        },
        {
          title: 'Active sessions',
          description: 'Review devices (coming soon).',
          type: 'link',
        },
      ],
    },
  ];

  return (
    <main className="w-full py-4">
      <div className="mx-auto w-full max-w-[1040px] px-4 sm:px-6">
        <header className="mb-8">
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900">Settings</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
            Account preferences and security. Values below reflect your signed-in profile where applicable.
          </p>
        </header>

        <div className="space-y-6">
          {sections.map((section) => {
            const Icon = section.icon;

            return (
              <section
                key={section.id}
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm md:p-6"
              >
                <div className="mb-5 flex items-start gap-3">
                  <div className="rounded-xl bg-teal-50 p-2.5 text-teal-800">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-bold text-slate-900">{section.title}</h2>
                    <p className="mt-1 text-sm text-slate-600">{section.description}</p>
                  </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-100">
                  {section.items.map((item, index) => (
                    <div
                      key={item.title}
                      className={`flex items-center justify-between gap-4 bg-white px-4 py-4 md:px-5 ${
                        index !== 0 ? 'border-t border-slate-100' : ''
                      }`}
                    >
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                        <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p>
                      </div>

                      <div className="shrink-0">
                        {item.type === 'profile' ? (
                          <Link
                            to="/profile/edit"
                            className="flex items-center gap-3 rounded-lg transition hover:bg-slate-50"
                          >
                            <div className="h-11 w-11 overflow-hidden rounded-xl ring-1 ring-slate-200">
                              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                            </div>
                            <ChevronRight className="h-5 w-5 text-slate-400" />
                          </Link>
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

          <section className="rounded-2xl border border-rose-100 bg-rose-50/80 p-5 md:p-6">
            <h2 className="font-display text-lg font-bold text-rose-700">Danger zone</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
              Account deactivation requires a backend endpoint. This button is disabled until that exists.
            </p>
            <button
              type="button"
              disabled
              className="mt-5 cursor-not-allowed rounded-full bg-rose-200 px-5 py-2.5 text-sm font-semibold text-rose-400"
            >
              Deactivate account
            </button>
          </section>
        </div>
      </div>
    </main>
  );
}
