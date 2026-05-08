import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <div className="glass-card animate-slide-up relative z-10 max-w-md rounded-3xl p-10 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/15 border border-amber-500/20">
          <AlertTriangle className="h-10 w-10 text-amber-400" />
        </div>
        <h1 className="text-6xl font-extrabold gradient-text">404</h1>
        <p className="mt-4 text-lg font-semibold text-white">Page not found</p>
        <p className="mt-2 text-sm text-slate-400">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn-primary mt-8 inline-flex items-center gap-2">
          <Home className="h-4 w-4" />
          Back to Inbox
        </Link>
      </div>
    </div>
  );
}
