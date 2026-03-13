// src/api/agents/base.js
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const getToken = () => {
  try {
    return JSON.parse(localStorage.getItem('user_token'))?.token;
  } catch {
    return null;
  }
};

// Safely read response body — detects PHP HTML warnings instead of JSON
const safeJson = async (res) => {
  const text = await res.text();
  if (!text || text.trim() === '') return {};
  try {
    return JSON.parse(text);
  } catch {
    // PHP sent an HTML warning/error page instead of JSON
    const isHtml = text.includes('<br />') || text.includes('<b>') || text.trimStart().startsWith('<');
    if (isHtml) {
      const match = text.match(/<b>([^<]+)<\/b>:?\s*([^<\n]+)/);
      const hint = match ? `${match[1]}: ${match[2].trim()}` : 'Server returned an HTML error page';
      throw new Error(hint);
    }
    throw new Error('Invalid server response');
  }
};

export const request = async (method, path, body = null) => {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, options);
  const data = await safeJson(res);

  if (!res.ok) {
    throw new Error(data?.error || `${res.status} ${res.statusText}`);
  }
  return data;
};

export const requestFormData = async (method, path, formData) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Authorization': `Bearer ${getToken()}` },
    body: formData,
  });

  // When PHP's post_max_size is exceeded, PHP resets $_POST and $_FILES to empty
  // and may emit a warning. Detect by checking Content-Type header first.
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    const text = await res.text();

    // Explicit PHP size warning
    if (
      text.includes('post_max_size') ||
      text.includes('Content-Length') ||
      text.includes('exceeds the limit')
    ) {
      throw new Error(
        'Upload too large — total file size exceeds the server limit (8 MB). ' +
        'Try uploading fewer photos at a time or use smaller files.'
      );
    }

    // Empty body — PHP silently swallowed the request
    if (!text || text.trim() === '') {
      throw new Error(
        'Photo upload failed — the files may be too large for the server. ' +
        'Try uploading fewer photos at once.'
      );
    }

    // Other HTML page
    if (text.trimStart().startsWith('<')) {
      const match = text.match(/<b>([^<]+)<\/b>:?\s*([^<\n]+)/);
      const hint = match ? `${match[1]}: ${match[2].trim()}` : 'Server error during photo upload';
      throw new Error(hint);
    }

    // Might still be JSON despite wrong content-type
    try { return JSON.parse(text); } catch { /* fall through */ }
    throw new Error('Photo upload failed — unexpected server response.');
  }

  const data = await safeJson(res);
  if (!res.ok) {
    throw new Error(data?.error || `${res.status} ${res.statusText}`);
  }
  return data;
};

export const get       = (path)           => request('GET',    path);
export const post      = (path, body)     => request('POST',   path, body);
export const put       = (path, body)     => request('PUT',    path, body);
export const patch     = (path, body)     => request('PATCH',  path, body);
export const del       = (path)           => request('DELETE', path);
export const upload    = (path, fd)       => requestFormData('POST', path, fd);
export const uploadPut = (path, fd)       => requestFormData('PUT',  path, fd);