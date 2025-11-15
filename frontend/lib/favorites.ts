// Utility functions for managing favorites in localStorage

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
 * Check if a playground is favorited
 */
export function isFavorite(playgroundId: string): boolean {
  const favorites = getFavorites();
  return favorites.some((fav) => fav.id === playgroundId);
}

/**
 * Add a playground to favorites
 */
export function addFavorite(playground: Playground): boolean {
  try {
    const favorites = getFavorites();
    
    // Check if already favorited
    if (favorites.some((fav) => fav.id === playground.id)) {
      return false;
    }
    
    favorites.push(playground);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    return true;
  } catch (error) {
    console.error("Error adding favorite:", error);
    return false;
  }
}

/**
 * Remove a playground from favorites
 */
export function removeFavorite(playgroundId: string): boolean {
  try {
    const favorites = getFavorites();
    const filtered = favorites.filter((fav) => fav.id !== playgroundId);
    
    if (filtered.length === favorites.length) {
      return false; // Not found
    }
    
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error("Error removing favorite:", error);
    return false;
  }
}

/**
 * Toggle favorite status
 */
export function toggleFavorite(playground: Playground): boolean {
  if (isFavorite(playground.id)) {
    return !removeFavorite(playground.id);
  } else {
    return addFavorite(playground);
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
