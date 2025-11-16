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
  
  localStorage.removeItem(IS_LOGGED_IN_KEY);
  // Keep userId for guest mode
  // localStorage.removeItem(USER_ID_KEY);
  // localStorage.removeItem(USER_EMAIL_KEY);
  // localStorage.removeItem(USER_NAME_KEY);
}

/**
 * Register new user (creates account)
 */
export async function register(email: string, name: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> {
  try {
    // In a real app, this would call a backend API
    // For now, we'll create a user with email-based ID
    
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const user: User = {
      userId,
      email,
      name,
    };
    
    // Store user data
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
    // In a real app, this would validate credentials with backend
    // For now, we'll accept any credentials and retrieve/create user
    
    // Check if we already have a user with this email
    const existingUserId = localStorage.getItem(USER_ID_KEY);
    const existingEmail = localStorage.getItem(USER_EMAIL_KEY);
    
    if (existingEmail === email && existingUserId) {
      // User exists locally
      const user: User = {
        userId: existingUserId,
        email: existingEmail,
        name: localStorage.getItem(USER_NAME_KEY) || undefined,
      };
      
      login(user);
      return { success: true, user };
    }
    
    // Create new user
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const user: User = {
      userId,
      email,
      name: email.split("@")[0], // Use email prefix as name
    };
    
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
