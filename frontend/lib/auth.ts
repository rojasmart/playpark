// Authentication utilities for Playpark

const USER_ID_KEY = "playpark_user_id";
const USER_EMAIL_KEY = "playpark_user_email";
const USER_NAME_KEY = "playpark_user_name";
const IS_LOGGED_IN_KEY = "playpark_is_logged_in";

export interface User {
  userId: string;
  email?: string;
  name?: string;
}

/**
 * Check if user is logged in
 */
export function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(IS_LOGGED_IN_KEY) === "true";
}

/**
 * Get current user data
 */
export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null;
  
  const userId = localStorage.getItem(USER_ID_KEY);
  const email = localStorage.getItem(USER_EMAIL_KEY);
  const name = localStorage.getItem(USER_NAME_KEY);
  
  if (!userId) return null;
  
  return {
    userId,
    email: email || undefined,
    name: name || undefined,
  };
}

/**
 * Login user
 */
export function login(user: User): void {
  if (typeof window === "undefined") return;
  
  localStorage.setItem(USER_ID_KEY, user.userId);
  localStorage.setItem(IS_LOGGED_IN_KEY, "true");
  
  if (user.email) {
    localStorage.setItem(USER_EMAIL_KEY, user.email);
  }
  
  if (user.name) {
    localStorage.setItem(USER_NAME_KEY, user.name);
  }
}

/**
 * Logout user
 */
export function logout(): void {
  if (typeof window === "undefined") return;
  
  // Clear all user data on logout
  localStorage.removeItem(IS_LOGGED_IN_KEY);
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(USER_EMAIL_KEY);
  localStorage.removeItem(USER_NAME_KEY);
}

/**
 * Register new user (creates account)
 */
export async function register(email: string, password: string, name: string): Promise<{ success: boolean; error?: string; user?: User }> {
  try {
    // Get current userId (anonymous or existing)
    const currentUserId = getOrCreateGuestUserId();
    
    // Call backend to update user with email and name
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const response = await fetch(`${API_URL}/users/${currentUserId}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        name,
        password, // In production, this would be hashed
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.error || "Failed to register" };
    }
    
    const data = await response.json();
    
    const user: User = {
      userId: currentUserId, // Keep the same userId
      email,
      name,
    };
    
    // Store user data (mark as logged in)
    login(user);
    
    return { success: true, user };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, error: "Failed to register" };
  }
}

/**
 * Login existing user (validates credentials)
 */
export async function loginUser(email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> {
  try {
    // Call backend to validate credentials
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const response = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.error || "Failed to login" };
    }
    
    const data = await response.json();
    
    const user: User = {
      userId: data.userId,
      email: data.email,
      name: data.name,
    };
    
    // If we had an anonymous userId, we might want to merge data
    const currentUserId = localStorage.getItem(USER_ID_KEY);
    if (currentUserId && currentUserId !== data.userId) {
      // TODO: Merge anonymous user data with logged in user
      console.log("TODO: Merge anonymous data from", currentUserId, "to", data.userId);
    }
    
    login(user);
    return { success: true, user };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "Failed to login" };
  }
}

/**
 * Get or create guest user ID
 */
export function getOrCreateGuestUserId(): string {
  if (typeof window === "undefined") return "";
  
  let userId = localStorage.getItem(USER_ID_KEY);
  
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(USER_ID_KEY, userId);
  }
  
  return userId;
}
