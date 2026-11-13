const API_URL = import.meta.env.VITE_API_URL;
const TOKEN_KEY = "tabby_token";

// sessionStorage is per tab, so two tabs can be logged in as two different people
export const getToken = () => sessionStorage.getItem(TOKEN_KEY);
export const setToken = (token) => sessionStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => sessionStorage.removeItem(TOKEN_KEY);

// The auth context will register a logout function here later
let onUnauthorized = () => {};
export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

// Our controllers return { message }, ASP.NET's automatic validation returns
// { errors: { Field: ["..."] } }. Pull one readable sentence out of either.
function extractMessage(data) {
  if (data?.message) return data.message;
  if (data?.errors) return Object.values(data.errors).flat()[0];
  return null;
}

export async function request(path, { method = "GET", body } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Can't reach the server. Is the API running?", 0);
  }

  // A rejected token means the session is over. A failed login also returns 401,
  // but no token exists yet at that point, so it doesn't trigger a logout.
  if (response.status === 401 && token) onUnauthorized();

  const data = response.status === 204 ? null : await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(extractMessage(data) ?? "Something went wrong.", response.status);
  }

  return data;
}