import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import ComposeModal from '../components/mail/ComposeModal';
import MailDetail from '../components/mail/MailDetail';
import MailList from '../components/mail/MailList';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useWebSocket } from '../hooks/useWebSocket';
import { composeThunk, fetchFolderThunk, fetchInboxThunk, markReadThunk, searchThunk, selectEntry } from '../store/mailSlice';

export default function InboxPage() {
  const dispatch = useDispatch();
  const { user, accessToken } = useSelector((state) => state.auth);
  const { entries, currentEntry, folder, loading, unreadCount, searchResults } = useSelector((state) => state.mail);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isConnected } = useWebSocket(accessToken);

  useEffect(() => {
    dispatch(fetchInboxThunk());
  }, [dispatch]);

  useEffect(() => {
    if (searchTerm.trim().length >= 2) {
      dispatch(searchThunk(searchTerm));
    }
  }, [dispatch, searchTerm]);

  const visibleEntries = useMemo(() => (searchTerm.trim().length >= 2 ? searchResults : entries), [entries, searchResults, searchTerm]);

  const handleSelectFolder = (nextFolder) => {
    if (nextFolder === 'LABELS') return;
    dispatch(fetchFolderThunk(nextFolder));
    setSidebarOpen(false);
  };

  const handleSelectEntry = (entry) => {
    dispatch(selectEntry(entry));
    if (!entry.is_read) {
      dispatch(markReadThunk({ entryId: entry.id, isRead: true }));
    }
  };

  const handleCompose = async (payload) => {
    const result = await dispatch(composeThunk(payload));
    if (composeThunk.fulfilled.match(result)) {
      setIsComposeOpen(false);
      dispatch(fetchFolderThunk(folder));
    }
  };

  return (
    <div className="relative min-h-screen bg-navy-950">
      {/* Subtle background glow */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-brand-600/10 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-brand-500/8 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-4 lg:px-6">
        <Navbar
          user={user}
          isConnected={isConnected}
          onSearch={setSearchTerm}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
        />

        <div className="flex gap-4 lg:gap-5">
          {/* Mobile sidebar overlay */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-40 bg-navy-950/80 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
          )}

          {/* Sidebar */}
          <div className={`
            fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 lg:static lg:z-auto lg:w-64 lg:translate-x-0 lg:flex-shrink-0
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}>
            <Sidebar
              currentFolder={folder}
              unreadCount={unreadCount}
              onSelect={handleSelectFolder}
              onCompose={() => { setIsComposeOpen(true); setSidebarOpen(false); }}
            />
          </div>

          {/* Mail list */}
          <section className="w-full min-w-0 lg:w-80 lg:flex-shrink-0">
            {loading ? (
              <LoadingSpinner label="Loading mail" />
            ) : (
              <MailList entries={visibleEntries} currentEntry={currentEntry} onSelect={handleSelectEntry} />
            )}
          </section>

          {/* Mail detail */}
          <section className="hidden flex-1 lg:block">
            <MailDetail entry={currentEntry} />
          </section>
        </div>
      </div>

      <ComposeModal isOpen={isComposeOpen} onClose={() => setIsComposeOpen(false)} onSend={handleCompose} loading={loading} />
    </div>
  );
}
