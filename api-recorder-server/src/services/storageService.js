import { v4 as uuidv4 } from 'uuid';

class StorageService {
  constructor() {
    this.sessions = new Map();
    this.requests = new Map();
    this.userActions = new Map();
  }

  createSession(name) {
    const id = uuidv4();
    const session = {
      id,
      name: name || `Session ${new Date().toLocaleString('zh-CN')}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active',
      requestCount: 0
    };
    this.sessions.set(id, session);
    return session;
  }

  getSession(id) {
    return this.sessions.get(id);
  }

  getAllSessions() {
    return Array.from(this.sessions.values()).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  updateSession(id, updates) {
    const session = this.sessions.get(id);
    if (!session) return null;
    
    Object.assign(session, updates, { updatedAt: new Date() });
    return session;
  }

  deleteSession(id) {
    const session = this.sessions.get(id);
    if (!session) return false;

    this.sessions.delete(id);
    
    for (const [reqId, req] of this.requests) {
      if (req.sessionId === id) {
        this.requests.delete(reqId);
      }
    }
    
    for (const [actionId, action] of this.userActions) {
      if (action.sessionId === id) {
        this.userActions.delete(actionId);
      }
    }
    
    return true;
  }

  createRequest(sessionId, requestData) {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const id = uuidv4();
    const request = {
      id,
      sessionId,
      ...requestData,
      capturedAt: new Date(requestData.capturedAt) || new Date()
    };
    
    this.requests.set(id, request);
    session.requestCount = this.getSessionRequests(sessionId).length;
    
    return request;
  }

  getRequest(id) {
    return this.requests.get(id);
  }

  getSessionRequests(sessionId) {
    return Array.from(this.requests.values())
      .filter(r => r.sessionId === sessionId)
      .sort((a, b) => new Date(b.capturedAt) - new Date(a.capturedAt));
  }

  deleteRequest(id) {
    const request = this.requests.get(id);
    if (!request) return false;
    
    this.requests.delete(id);
    
    const session = this.sessions.get(request.sessionId);
    if (session) {
      session.requestCount = this.getSessionRequests(session.id).length;
    }
    
    return true;
  }

  createUserAction(sessionId, actionData) {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const id = uuidv4();
    const action = {
      id,
      sessionId,
      ...actionData,
      capturedAt: new Date(actionData.capturedAt) || new Date()
    };
    
    this.userActions.set(id, action);
    return action;
  }

  getSessionUserActions(sessionId) {
    return Array.from(this.userActions.values())
      .filter(a => a.sessionId === sessionId)
      .sort((a, b) => new Date(b.capturedAt) - new Date(a.capturedAt));
  }
}

export const storageService = new StorageService();
