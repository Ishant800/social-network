import { Edit3, MapPin, Calendar } from 'lucide-react';
import { useSelector } from 'react-redux';
import { ProfileSkeleton } from '../skeleton/profileSkeleton';

export default function Profile() {
  const { user } = useSelector((state) => state.auth);

  if (!user) return <ProfileSkeleton/>;

  const name = user?.name?.trim() || 'User';
  const email = user?.email || '';
  const handle = email ? email.split('@')[0] : name.toLowerCase().replace(/\s+/g, '');
  const bio = user?.bio || '';
  const location = user?.address || '';
  const joined = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : '';

  const avatar =
    user?.profileImage?.url?.trim() ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=128`;

  const followers = user?.followers?.length ?? 0;
  const following = user?.following?.length ?? 0;
  const friends = user?.friends?.length ?? 0;

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-start gap-4 pb-4 border-b border-slate-100">
        <img
          src={avatar}
          alt={name}
          className="w-20 h-20 rounded-2xl object-cover border border-slate-100"
        />

        <div className="flex-1">
          <div className="flex justify-between">
            <div>
              <h1 className="text-lg font-semibold text-slate-900">{name}</h1>
              <p className="text-sm text-slate-500">@{handle}</p>
            </div>

            <button className="p-2 hover:bg-slate-100 rounded-lg transition">
              <Edit3 className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          {bio && <p className="text-sm text-slate-700 mt-2">{bio}</p>}

          <div className="flex gap-4 mt-3 text-xs text-slate-500 flex-wrap">
            {location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {location}
              </span>
            )}
            {joined && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Joined {joined}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-6 py-3 border-b border-slate-100 text-sm">
        <Stat label="Followers" value={followers} />
        <Stat label="Following" value={following} />
        <Stat label="Friends" value={friends} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 py-2">
        {['Posts', 'About', 'Friends'].map((tab) => (
          <button
            key={tab}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition"
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="py-6 text-center text-slate-400 text-sm">
        No content yet
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <button className="hover:text-indigo-600 transition">
      <span className="font-semibold text-slate-900">{value}</span>
      <span className="text-slate-500 ml-1">{label}</span>
    </button>
  );
}