// Gamification system for visited playgrounds and badges

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: "bronze" | "silver" | "gold" | "platinum" | "diamond";
  requirement: number;
  color: string;
}

export interface UserProgress {
  visitedCount: number;
  unlockedBadges: string[];
  nextBadge?: Badge;
  progress: number; // 0-100
}

// Badge definitions
export const BADGES: Badge[] = [
  {
    id: "explorer_5",
    name: "Explorador Iniciante",
    description: "Visitou 5 parques diferentes",
    icon: "🎯",
    tier: "bronze",
    requirement: 5,
    color: "#CD7F32",
  },
  {
    id: "explorer_10",
    name: "Aventureiro",
    description: "Visitou 10 parques diferentes",
    icon: "🏆",
    tier: "silver",
    requirement: 10,
    color: "#C0C0C0",
  },
  {
    id: "explorer_20",
    name: "Veterano dos Parques",
    description: "Visitou 20 parques diferentes",
    icon: "👑",
    tier: "gold",
    requirement: 20,
    color: "#FFD700",
  },
  {
    id: "explorer_50",
    name: "Mestre dos Parques",
    description: "Visitou 50 parques diferentes",
    icon: "💎",
    tier: "platinum",
    requirement: 50,
    color: "#E5E4E2",
  },
  {
    id: "explorer_100",
    name: "Lenda dos Parques",
    description: "Visitou 100 parques diferentes",
    icon: "⭐",
    tier: "diamond",
    requirement: 100,
    color: "#B9F2FF",
  },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

/**
 * Get user ID from localStorage
 */
function getUserId(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("playpark_user_id") || "";
}

/**
 * Mark a playground as visited
 */
export async function markAsVisited(playgroundId: string): Promise<boolean> {
  try {
    const userId = getUserId();
    
    const response = await fetch(`${API_URL}/users/${userId}/visited`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ playgroundId }),
    });
    
    if (!response.ok) {
      console.error("Failed to mark as visited");
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error marking as visited:", error);
    return false;
  }
}

/**
 * Check if a playground was visited
 */
export async function isVisited(playgroundId: string): Promise<boolean> {
  try {
    const userId = getUserId();
    
    const response = await fetch(`${API_URL}/users/${userId}/visited/check/${playgroundId}`);
    
    if (!response.ok) {
      return false;
    }
    
    const data = await response.json();
    return data.isVisited || false;
  } catch (error) {
    console.error("Error checking visited:", error);
    return false;
  }
}

/**
 * Get all visited playgrounds
 */
export async function getVisitedPlaygrounds(): Promise<any[]> {
  try {
    const userId = getUserId();
    
    const response = await fetch(`${API_URL}/users/${userId}/visited`);
    
    if (!response.ok) {
      return [];
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error getting visited playgrounds:", error);
    return [];
  }
}

/**
 * Calculate user progress and unlocked badges
 */
export function calculateProgress(visitedCount: number): UserProgress {
  const unlockedBadges: string[] = [];
  let nextBadge: Badge | undefined;
  let progress = 0;
  
  // Find unlocked badges
  for (const badge of BADGES) {
    if (visitedCount >= badge.requirement) {
      unlockedBadges.push(badge.id);
    } else if (!nextBadge) {
      nextBadge = badge;
      // Calculate progress to next badge
      const prevBadge = BADGES[BADGES.indexOf(badge) - 1];
      const prevRequirement = prevBadge?.requirement || 0;
      const range = badge.requirement - prevRequirement;
      const current = visitedCount - prevRequirement;
      progress = Math.round((current / range) * 100);
    }
  }
  
  // If all badges unlocked
  if (!nextBadge) {
    progress = 100;
  }
  
  return {
    visitedCount,
    unlockedBadges,
    nextBadge,
    progress: Math.max(0, Math.min(100, progress)),
  };
}

/**
 * Get badge by ID
 */
export function getBadgeById(badgeId: string): Badge | undefined {
  return BADGES.find((b) => b.id === badgeId);
}

/**
 * Get user stats
 */
export async function getUserStats(): Promise<{
  visitedCount: number;
  favoritesCount: number;
  progress: UserProgress;
}> {
  try {
    const userId = getUserId();
    
    const response = await fetch(`${API_URL}/users/${userId}/stats`);
    
    if (!response.ok) {
      return {
        visitedCount: 0,
        favoritesCount: 0,
        progress: calculateProgress(0),
      };
    }
    
    const data = await response.json();
    
    return {
      visitedCount: data.visitedCount || 0,
      favoritesCount: data.favoritesCount || 0,
      progress: calculateProgress(data.visitedCount || 0),
    };
  } catch (error) {
    console.error("Error getting user stats:", error);
    return {
      visitedCount: 0,
      favoritesCount: 0,
      progress: calculateProgress(0),
    };
  }
}
