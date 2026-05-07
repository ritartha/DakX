import api from './axiosInstance';

export const fetchEntries = (folder = 'INBOX') => api.get(`/mail/entries/?folder=${folder}`);
export const fetchThread = (threadId) => api.get(`/mail/threads/${threadId}/`);
export const composeMail = (payload) => api.post('/mail/compose/', payload);
export const markRead = (entryId, payload) => api.patch(`/mail/entries/${entryId}/`, payload);
export const moveToTrash = (entryId) => api.delete(`/mail/entries/${entryId}/`);
export const searchMail = (query) => api.get(`/mail/search/?q=${encodeURIComponent(query)}`);
