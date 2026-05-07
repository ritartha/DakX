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
    <div className="min-h-screen bg-slate-100 px-4 py-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <Navbar user={user} isConnected={isConnected} onSearch={setSearchTerm} />
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)_minmax(0,1.2fr)]">
          <Sidebar currentFolder={folder} unreadCount={unreadCount} onSelect={handleSelectFolder} onCompose={() => setIsComposeOpen(true)} />
          <section className="space-y-4">
            {loading ? <LoadingSpinner label="Loading mail" /> : <MailList entries={visibleEntries} currentEntry={currentEntry} onSelect={handleSelectEntry} />}
          </section>
          <MailDetail entry={currentEntry} />
        </div>
      </div>
      <ComposeModal isOpen={isComposeOpen} onClose={() => setIsComposeOpen(false)} onSend={handleCompose} loading={loading} />
    </div>
  );
}
