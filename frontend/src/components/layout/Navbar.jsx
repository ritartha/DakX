export default function Navbar({ user, isConnected, onSearch }) {
  return (
    <header className="flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm font-medium text-brand-600">DakX</p>
        <h1 className="text-2xl font-semibold text-slate-900">Welcome back{user?.display_name ? `, ${user.display_name}` : ''}</h1>
      </div>
      <div className="flex flex-1 items-center gap-3 md:max-w-xl">
        <input
          type="search"
          placeholder="Search mail"
          onChange={(event) => onSearch(event.target.value)}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-brand-500"
        />
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
          {isConnected ? 'Realtime on' : 'Reconnecting'}
        </span>
      </div>
    </header>
  );
}
