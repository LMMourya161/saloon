// src/api.js
const BASE = "http://localhost:5000/api";
// Existing API helper functions

export const apiGet = async (path) => {
  const res = await fetch(`${BASE}/${path}`);
  if (!res.ok) throw new Error("Failed to fetch data");
  return await res.json();
};

export const apiPost = async (path, body) => {
  const res = await fetch(`${BASE}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error("Failed to create");
  return await res.json();
};

export const apiPut = async (path, body) => {
  const res = await fetch(`${BASE}/${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error("Failed to update");
  return await res.json();
};

export const apiDelete = async (path) => {
  const res = await fetch(`${BASE}/${path}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete");
  return await res.json();
};

// Dummy logger to keep existing calls working without errors
export const logSystemAction = (...args) => {
  // No‑op: could be wired to a backend logging endpoint later
};

const getHeaders = (token) => ({
  "Content-Type": "application/json",
  ...(token && { Authorization: `Bearer ${token}` })
});

export const apiGet = async (path) => {
  const res = await fetch(`${BASE}/${path}`);
  if (!res.ok) throw new Error(`GET ${path} failed`);
  return await res.json();
};

export const apiPost = async (path, body) => {
  const res = await fetch(`${BASE}/${path}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`POST ${path} failed`);
  return await res.json();
};

export const apiPut = async (path, body) => {
  const res = await fetch(`${BASE}/${path}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`PUT ${path} failed`);
  return await res.json();
};

export const apiDelete = async (path) => {
  const res = await fetch(`${BASE}/${path}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`DELETE ${path} failed`);
  return await res.json();
};
