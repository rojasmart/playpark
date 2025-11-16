"use client";
import { useState, useEffect } from "react";
import { Trophy, MapPin, Target, Award, TrendingUp, Star } from "lucide-react";
import Link from "next/link";
import { getUserStats, BADGES, Badge, calculateProgress } from "@/lib/gamification";

export default function GamificationPage() {
  const [stats, setStats] = useState({
    visitedCount: 0,
    favoritesCount: 0,
    progress: calculateProgress(0),
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await getUserStats();
      setStats(data);
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeColor = (tier: string) => {
    switch (tier) {
      case "bronze":
        return "from-amber-700 to-amber-900";
      case "silver":
        return "from-gray-400 to-gray-600";
      case "gold":
        return "from-yellow-400 to-yellow-600";
      case "platinum":
        return "from-gray-300 to-gray-500";
      case "diamond":
        return "from-cyan-400 to-blue-500";
      default:
        return "from-gray-400 to-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C91C1C] mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <MapPin className="w-8 h-8 text-[#C91C1C]" />
                <h1 className="text-xl font-bold text-[#C91C1C]">Playpark</h1>
              </Link>
              <span className="text-gray-400">|</span>
              <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#C91C1C]" />
                Conquistas
              </h2>
            </div>
            <Link href="/" className="text-sm text-gray-600 hover:text-[#C91C1C] transition-colors">
              ← Voltar ao Mapa
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Visited Count */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Parques Visitados</p>
                <p className="text-3xl font-bold text-[#C91C1C]">{stats.visitedCount}</p>
              </div>
              <div className="bg-red-50 p-3 rounded-full">
                <MapPin className="w-8 h-8 text-[#C91C1C]" />
              </div>
            </div>
          </div>

          {/* Favorites Count */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Favoritos</p>
                <p className="text-3xl font-bold text-[#C91C1C]">{stats.favoritesCount}</p>
              </div>
              <div className="bg-red-50 p-3 rounded-full">
                <Star className="w-8 h-8 text-[#C91C1C]" />
              </div>
            </div>
          </div>

          {/* Badges Unlocked */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Badges Desbloqueados</p>
                <p className="text-3xl font-bold text-[#C91C1C]">
                  {stats.progress.unlockedBadges.length}/{BADGES.length}
                </p>
              </div>
              <div className="bg-red-50 p-3 rounded-full">
                <Trophy className="w-8 h-8 text-[#C91C1C]" />
              </div>
            </div>
          </div>
        </div>

        {/* Next Badge Progress */}
        {stats.progress.nextBadge && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#C91C1C]" />
                  Próximo Objetivo
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {stats.progress.nextBadge.name} - {stats.progress.nextBadge.description}
                </p>
              </div>
              <div className="text-5xl">{stats.progress.nextBadge.icon}</div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Progresso</span>
                <span>
                  {stats.visitedCount} / {stats.progress.nextBadge.requirement} parques
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#C91C1C] to-[#A01515] h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                  style={{ width: `${stats.progress.progress}%` }}
                >
                  {stats.progress.progress > 10 && <span className="text-xs text-white font-medium">{stats.progress.progress}%</span>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* All Badges */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Award className="w-6 h-6 text-[#C91C1C]" />
            Todas as Conquistas
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BADGES.map((badge) => {
              const isUnlocked = stats.progress.unlockedBadges.includes(badge.id);

              return (
                <div
                  key={badge.id}
                  className={`relative border-2 rounded-lg p-6 transition-all ${
                    isUnlocked ? "border-[#C91C1C] bg-gradient-to-br from-red-50 to-white shadow-md" : "border-gray-200 bg-gray-50 opacity-60"
                  }`}
                >
                  {/* Badge Icon */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`text-6xl ${isUnlocked ? "grayscale-0" : "grayscale opacity-50"}`}>{badge.icon}</div>
                    {isUnlocked && (
                      <div className="bg-green-500 text-white rounded-full p-1">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Badge Info */}
                  <h4 className="text-lg font-bold text-gray-900 mb-2">{badge.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{badge.description}</p>

                  {/* Tier Badge */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${getBadgeColor(badge.tier)}`}
                    >
                      {badge.tier.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500">{badge.requirement} parques</span>
                  </div>

                  {/* Lock Icon for locked badges */}
                  {!isUnlocked && (
                    <div className="absolute top-4 right-4 text-gray-400">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Call to Action */}
        {stats.visitedCount === 0 && (
          <div className="mt-8 bg-gradient-to-r from-[#C91C1C] to-[#A01515] rounded-lg shadow-lg p-8 text-center text-white">
            <TrendingUp className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Comece Sua Jornada!</h3>
            <p className="mb-6 opacity-90">Visite parques e desbloqueie conquistas incríveis!</p>
            <Link href="/" className="inline-block bg-white text-[#C91C1C] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Explorar Parques
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
