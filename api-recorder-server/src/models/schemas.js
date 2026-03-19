export const sessionSchema = {
  id: String,
  name: String,
  createdAt: Date,
  updatedAt: Date,
  status: String,
  requestCount: Number
};

export const requestSchema = {
  id: String,
  sessionId: String,
  method: String,
  url: String,
  headers: Object,
  queryParams: Object,
  body: Object,
  response: {
    status: Number,
    headers: Object,
    body: String,
    time: Number
  },
  capturedAt: Date,
  pageUrl: String,
  type: String,
  userAction: Object
};

export const userActionSchema = {
  id: String,
  sessionId: String,
  type: String,
  selector: String,
  tagName: String,
  value: String,
  text: String,
  capturedAt: Date,
  pageUrl: String
};
