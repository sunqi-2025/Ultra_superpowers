import { defineStore } from 'pinia';
import { sessionsApi, requestsApi } from '../api';

export const useRecorderStore = defineStore('recorder', {
  state: () => ({
    sessions: [],
    currentSession: null,
    requests: [],
    userActions: [],
    loading: false,
    error: null,
    exportProgress: 0
  }),
  
  getters: {
    activeSession: (state) => state.sessions.find(s => s.status === 'active'),
    sortedRequests: (state) => [...state.requests].sort((a, b) => 
      new Date(b.capturedAt) - new Date(a.capturedAt)
    )
  },
  
  actions: {
    async fetchSessions() {
      this.loading = true;
      this.error = null;
      try {
        const res = await sessionsApi.getAll();
        this.sessions = res.data.sessions;
      } catch (err) {
        this.error = err.message;
        console.error('Failed to fetch sessions:', err);
      } finally {
        this.loading = false;
      }
    },
    
    async createSession(name) {
      this.loading = true;
      this.error = null;
      try {
        const res = await sessionsApi.create(name);
        const session = res.data.session;
        this.sessions.unshift(session);
        return session;
      } catch (err) {
        this.error = err.message;
        console.error('Failed to create session:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
    
    async fetchSessionDetail(id) {
      this.loading = true;
      this.error = null;
      try {
        const res = await sessionsApi.getById(id);
        this.currentSession = res.data.session;
        this.requests = res.data.requests || [];
        this.userActions = res.data.userActions || [];
        return res.data;
      } catch (err) {
        this.error = err.message;
        console.error('Failed to fetch session detail:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
    
    async updateSession(id, data) {
      try {
        const res = await sessionsApi.update(id, data);
        const index = this.sessions.findIndex(s => s.id === id);
        if (index !== -1) {
          this.sessions[index] = res.data.session;
        }
        if (this.currentSession?.id === id) {
          this.currentSession = res.data.session;
        }
        return res.data;
      } catch (err) {
        this.error = err.message;
        console.error('Failed to update session:', err);
        throw err;
      }
    },
    
    async deleteSession(id) {
      try {
        await sessionsApi.delete(id);
        this.sessions = this.sessions.filter(s => s.id !== id);
        if (this.currentSession?.id === id) {
          this.currentSession = null;
          this.requests = [];
          this.userActions = [];
        }
      } catch (err) {
        this.error = err.message;
        console.error('Failed to delete session:', err);
        throw err;
      }
    },
    
    async deleteRequest(id) {
      try {
        await requestsApi.delete(id);
        this.requests = this.requests.filter(r => r.id !== id);
        if (this.currentSession) {
          this.currentSession.requestCount = this.requests.length;
        }
      } catch (err) {
        this.error = err.message;
        console.error('Failed to delete request:', err);
        throw err;
      }
    },
    
    async exportAsMarkdown(sessionId) {
      this.exportProgress = 0;
      try {
        this.exportProgress = 30;
        const res = await sessionsApi.exportMarkdown(sessionId);
        this.exportProgress = 70;
        const blob = new Blob([res.data], { type: 'text/markdown' });
        this.exportProgress = 90;
        this.downloadBlob(blob, `api-doc-${sessionId}.md`);
        this.exportProgress = 100;
        setTimeout(() => { this.exportProgress = 0; }, 1000);
      } catch (err) {
        this.exportProgress = 0;
        this.error = err.message;
        console.error('Failed to export markdown:', err);
        throw err;
      }
    },
    
    async exportAsJson(sessionId) {
      this.exportProgress = 0;
      try {
        this.exportProgress = 30;
        const res = await sessionsApi.exportJson(sessionId);
        this.exportProgress = 70;
        const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
        this.exportProgress = 90;
        this.downloadBlob(blob, `api-doc-${sessionId}.json`);
        this.exportProgress = 100;
        setTimeout(() => { this.exportProgress = 0; }, 1000);
      } catch (err) {
        this.exportProgress = 0;
        this.error = err.message;
        console.error('Failed to export json:', err);
        throw err;
      }
    },
    
    async exportAsJmx(sessionId) {
      this.exportProgress = 0;
      try {
        this.exportProgress = 30;
        const res = await sessionsApi.exportJmx(sessionId);
        this.exportProgress = 70;
        const blob = new Blob([res.data], { type: 'application/xml' });
        this.exportProgress = 90;
        this.downloadBlob(blob, `api-test-${sessionId}.jmx`);
        this.exportProgress = 100;
        setTimeout(() => { this.exportProgress = 0; }, 1000);
      } catch (err) {
        this.exportProgress = 0;
        this.error = err.message;
        console.error('Failed to export jmx:', err);
        throw err;
      }
    },
    
    downloadBlob(blob, filename) {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }
  }
});
