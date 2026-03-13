// src/api/user/base.js
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const getToken = () => {
  try {
    return JSON.parse(localStorage.getItem('user_token'))?.token;
  } catch {
    return null;
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
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `${res.status} ${res.statusText}`);
  }
  return res.json();
};

export const get   = (path)       => request('GET',    path);
export const post  = (path, body) => request('POST',   path, body);
export const put   = (path, body) => request('PUT',    path, body);
export const patch = (path, body) => request('PATCH',  path, body);
export const del   = (path)       => request('DELETE', path);