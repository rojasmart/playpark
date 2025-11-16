// Utility functions for managing favorites in localStorage and MongoDB

export interface Playground {
  id: string;
  name: string;
  lat: number;
  lon: number;
  description?: string;
  images?: string[];
  rating?: number;
  ratingCount?: number;
  tags?: Record<string, any>;
  source?: string;
}

const FAVORITES_KEY = "playpark_favorites";
const USER_ID_KEY = "playpark_user_id";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

/**
 * Get or create a unique user ID
 */
export function getUserId(): string {
  if (typeof window === "undefined") return "";
  
  let userId = localStorage.getItem(USER_ID_KEY);
  
  if (!userId) {
    // Generate a unique ID
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(USER_ID_KEY, userId);
  }
  
  return userId;
}

/**
 * Get all favorites from localStorage
 */
export function getFavorites(): Playground[] {
  if (typeof window === "undefined") return [];
  
  try {
    const saved = localStorage.getItem(FAVORITES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Error loading favorites:", error);
    return [];
  }
}

/**
 * Save favorites to localStorage
 */
function saveFavoritesToLocal(favorites: Playground[]): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.error("Error saving favorites:", error);
  }
}

/**
 * Sync favorites with MongoDB
 */
export async function syncFavoritesWithServer(): Promise<boolean> {
  try {
    const userId = getUserId();
    const localFavorites = getFavorites();
    
    const response = await fetch(`${API_URL}/users/${userId}/favorites/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ favorites: localFavorites }),
    });
    
    if (!response.ok) {
      console.error("Failed to sync favorites with server");
      return false;
    }
    
    const result = await response.json();
    console.log("Favorites synced:", result);
    return true;
  } catch (error) {
    console.error("Error syncing favorites:", error);
    return false;
  }
}

/**
 * Load favorites from MongoDB
 */
export async function loadFavoritesFromServer(): Promise<Playground[]> {
  try {
    const userId = getUserId();
    
    const response = await fetch(`${API_URL}/users/${userId}/favorites`);
    
    if (!response.ok) {
      console.error("Failed to load favorites from server");
      return [];
    }
    
    const favorites = await response.json();
    
    // Save to localStorage
    saveFavoritesToLocal(favorites);
    
    return favorites;
  } catch (error) {
    console.error("Error loading favorites from server:", error);
    return [];
  }
}

/**
 * Check if a playground is favorited
 */
export function isFavorite(playgroundId: string): boolean {
  const favorites = getFavorites();
  return favorites.some((fav) => fav.id === playgroundId);
}

/**
 * Add a playground to favorites (localStorage + MongoDB)
 */
export async function addFavorite(playground: Playground): Promise<boolean> {
  try {
    const favorites = getFavorites();
    
    // Check if already favorited
    if (favorites.some((fav) => fav.id === playground.id)) {
      return false;
    }
    
    favorites.push(playground);
    saveFavoritesToLocal(favorites);
    
    // Sync with server in background
    const userId = getUserId();
    fetch(`${API_URL}/users/${userId}/favorites`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(playground),
    }).catch((error) => console.error("Error syncing add to server:", error));
    
    return true;
  } catch (error) {
    console.error("Error adding favorite:", error);
    return false;
  }
}

/**
 * Remove a playground from favorites (localStorage + MongoDB)
 */
export async function removeFavorite(playgroundId: string): Promise<boolean> {
  try {
    const favorites = getFavorites();
    const filtered = favorites.filter((fav) => fav.id !== playgroundId);
    
    if (filtered.length === favorites.length) {
      return false; // Not found
    }
    
    saveFavoritesToLocal(filtered);
    
    // Sync with server in background
    const userId = getUserId();
    fetch(`${API_URL}/users/${userId}/favorites/${playgroundId}`, {
      method: "DELETE",
    }).catch((error) => console.error("Error syncing remove to server:", error));
    
    return true;
  } catch (error) {
    console.error("Error removing favorite:", error);
    return false;
  }
}

/**
 * Toggle favorite status (localStorage + MongoDB)
 */
export async function toggleFavorite(playground: Playground): Promise<boolean> {
  if (isFavorite(playground.id)) {
    await removeFavorite(playground.id);
    return false;
  } else {
    await addFavorite(playground);
    return true;
  }
}

/**
 * Clear all favorites
 */
export function clearFavorites(): void {
  try {
    localStorage.removeItem(FAVORITES_KEY);
  } catch (error) {
    console.error("Error clearing favorites:", error);
  }
}

/**
 * Get favorites count
 */
export function getFavoritesCount(): number {
  return getFavorites().length;
}
