// const API_URL = import.meta.env.VITE_API_URL;

// if (!API_URL) {
//   throw new Error('VITE_API_URL is not configured');
// }

// function getAccessToken() {
//   return (
//     localStorage.getItem('access_token') ||
//     sessionStorage.getItem('access_token')
//   );
// }

// export async function apiRequest<T>(
//   endpoint: string,
//   options: RequestInit = {},
// ): Promise<T> {
//   const token = getAccessToken();

//   const response = await fetch(`${API_URL}${endpoint}`, {
//     ...options,
//     headers: {
//       'Content-Type': 'application/json',

//       ...(token
//         ? {
//             Authorization: `Bearer ${token}`,
//           }
//         : {}),

//       ...options.headers,
//     },
//   });

//   if (response.status === 204) {
//     return undefined as T;
//   }

//   const data = await response.json().catch(() => null);

//   if (!response.ok) {
//     const message =
//       data?.detail || `Request failed with status ${response.status}`;

//     throw new Error(message);
//   }

//   return data as T;
// }

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error('VITE_API_URL is not configured');
}

function getAccessToken() {
  return (
    sessionStorage.getItem('access_token')
  );
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  // Login requests must not use an existing/stale access token.
  const isLoginRequest = /^\/auth\/(admin|operator|viewer)\/login$/.test(
    endpoint,
  );

  const token = isLoginRequest ? null : getAccessToken();

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',

      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),

      ...options.headers,
    },
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data?.detail || `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return data as T;
}