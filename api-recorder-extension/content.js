(function() {
  let isRecording = false;
  let originalFetch = window.fetch;
  let originalXHR = window.XMLHttpRequest;

  window.addEventListener('message', (event) => {
    if (event.data.type === 'SET_RECORDING') {
      isRecording = event.data.value;
      if (isRecording) {
        injectInterceptor();
      } else {
        removeInterceptor();
      }
    }
  });

  function injectInterceptor() {
    window.fetch = async function(...args) {
      const requestStartTime = Date.now();
      const [resource, config] = args;
      
      try {
        const response = await originalFetch.apply(this, args);
        const requestData = {
          method: config?.method || 'GET',
          url: typeof resource === 'string' ? resource : resource.url,
          headers: parseHeaders(config?.headers),
          body: config?.body ? JSON.parse(config.body) : null,
          response: {
            status: response.status,
            headers: parseHeaders(response.headers),
            body: await response.clone().text(),
            time: Date.now() - requestStartTime
          },
          capturedAt: new Date().toISOString(),
          pageUrl: window.location.href,
          type: 'fetch'
        };
        
        sendToBackground(requestData);
        return response;
      } catch (error) {
        return Promise.reject(error);
      }
    };

    const xhrOpen = originalXHR.prototype.open;
    originalXHR.prototype.open = function(method, url, ...rest) {
      this._method = method;
      this._url = url;
      return xhrOpen.apply(this, [method, url, ...rest]);
    };

    const xhrSend = originalXHR.prototype.send;
    originalXHR.prototype.send = function(body) {
      this._body = body;
      const requestStartTime = Date.now();
      
      this.addEventListener('load', () => {
        const requestData = {
          method: this._method,
          url: this._url,
          headers: this._getHeadersFromXHR(),
          body: this._body ? JSON.parse(this._body) : null,
          response: {
            status: this.status,
            headers: this._getResponseHeaders(),
            body: this.responseText,
            time: Date.now() - requestStartTime
          },
          capturedAt: new Date().toISOString(),
          pageUrl: window.location.href,
          type: 'xhr'
        };
        
        sendToBackground(requestData);
      });
      
      return xhrSend.apply(this, arguments);
    };
  }

  function removeInterceptor() {
    window.fetch = originalFetch;
    window.XMLHttpRequest = originalXHR;
  }

  function parseHeaders(headers) {
    if (!headers) return {};
    if (headers instanceof Headers) {
      const result = {};
      headers.forEach((value, key) => {
        result[key] = value;
      });
      return result;
    }
    return headers;
  }

  XMLHttpRequest.prototype._getHeadersFromXHR = function() {
    const headerStr = this.getAllResponseHeaders();
    const headers = {};
    if (headerStr) {
      headerStr.split('\r\n').forEach(line => {
        const parts = line.split(': ');
        if (parts[0]) {
          headers[parts[0]] = parts.slice(1).join(': ');
        }
      });
    }
    return headers;
  };

  XMLHttpRequest.prototype._getResponseHeaders = function() {
    return this._getHeadersFromXHR();
  };

  function sendToBackground(data) {
    chrome.runtime.sendMessage({
      type: 'REQUEST_CAPTURED',
      data: data
    });
  }

  document.addEventListener('click', (event) => {
    if (!isRecording) return;
    
    const target = event.target;
    const selector = generateSelector(target);
    
    chrome.runtime.sendMessage({
      type: 'USER_ACTION',
      data: {
        type: 'click',
        selector: selector,
        tagName: target.tagName,
        text: target.innerText?.substring(0, 100),
        capturedAt: new Date().toISOString(),
        pageUrl: window.location.href
      }
    });
  });

  document.addEventListener('input', (event) => {
    if (!isRecording) return;
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      const selector = generateSelector(event.target);
      
      chrome.runtime.sendMessage({
        type: 'USER_ACTION',
        data: {
          type: 'input',
          selector: selector,
          tagName: event.target.tagName,
          value: event.target.value,
          capturedAt: new Date().toISOString(),
          pageUrl: window.location.href
        }
      });
    }
  });

  function generateSelector(element) {
    if (element.id) {
      return `#${element.id}`;
    }
    
    if (element.className && typeof element.className === 'string') {
      const classes = element.className.split(' ').filter(c => c).slice(0, 2);
      if (classes.length > 0) {
        return `${element.tagName.toLowerCase()}.${classes.join('.')}`;
      }
    }
    
    let selector = element.tagName.toLowerCase();
    if (element.name) {
      selector += `[name="${element.name}"]`;
    }
    return selector;
  }

  console.log('API Recorder content script loaded');
})();
