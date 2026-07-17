// api.ts
const BASE_URL = import.meta.env.VITE_SERVER_ADDRESS || 'http://localhost:3000/api';

let tempSecret: string | null = null; // in-memory, resets on page reload

type admin = {
  username?: string;
  password?: string; // plain text in request, hashed before save
};

type restaurant = {
  name?: string;
  tagline?: string;
  primaryColor?: string;
  accentColor?: string; 
  tabStyle?: string; // match your NavStyle enum values
  roundness?: string;
  showSearch?: boolean;
  showItemCount?: boolean;
  stickyNav?: boolean;
  domain?: string;
};


export function setTempSecret(secret: string) {
  tempSecret = secret;
}

export function clearTempSecret() {
  tempSecret = null;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
   console.log(tempSecret)
   
  // Attach the secret as a header if available
  if (tempSecret) {
    headers.set('x-tempdata', tempSecret);
  }
  console.log(`${BASE_URL}${endpoint}`)
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }

  const jsonres = await response.json()

  console.log(jsonres)

  return jsonres
}

export type Admin = Record<string, unknown>;

// ----- API functions -----

export function getAllAdmins() {
  // GET – secret goes in header (no body)
  return request<{ data: Admin[] }>('/auth/getAllAdmins');
}

export function registerAdmin(adminData: unknown) {
  // POST – secret in header, adminData in body
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ para: adminData }),
  });
}

export function updateAdmin(restaurantPublicId: string, data: { admin?: admin; restaurant?: restaurant }) {
  // If backend expects param in URL:
  return request(`/auth/updateAdmin/${restaurantPublicId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  // If backend expects ID in body (and route has no param):
  // return request('/auth/updateAdmin', {
  //   method: 'POST',
  //   body: JSON.stringify({ restaurantPublicId, ...data }),
  // });
}

export function deleteAdmin(publicId: string) {
  // DELETE – secret in header
  return request(`/auth/delete/${publicId}`, {
    method: 'DELETE',
  });
}