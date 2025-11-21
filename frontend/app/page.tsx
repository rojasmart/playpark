"use client";
import { useState, useEffect } from "react";
import { MapPin, Heart, Trophy, Star, Users, Map as MapIcon, Download, ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";

export default function LandingPage() {
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const logged = isLoggedIn();
    setUserLoggedIn(logged);

    // Redirect logged-in users to map
    if (logged) {
      router.push("/map");
    }
  }, [router]);

  const features = [
    {
      icon: <MapIcon className="w-8 h-8 text-[#C91C1C]" />,
      title: "Explore Parques",
      description: "Descubra parques infantis perto de si com mapa interativo e filtros personalizados.",
    },
    {
      icon: <Heart className="w-8 h-8 text-[#C91C1C]" />,
      title: "Guarde Favoritos",
      description: "Marque seus parques preferidos e acesse-os rapidamente quando quiser.",
    },
    {
      icon: <Trophy className="w-8 h-8 text-[#C91C1C]" />,
      title: "Desbloqueie Conquistas",
      description: "Visite parques e ganhe badges exclusivos. De Bronze a Diamante!",
    },
    {
      icon: <Users className="w-8 h-8 text-[#C91C1C]" />,
      title: "Comunidade Ativa",
      description: "Compartilhe experiências e descubra novos parques com outros pais.",
    },
  ];

  const badges = [
    { emoji: "🎯", name: "Bronze", count: "5 parques" },
    { emoji: "🏆", name: "Prata", count: "10 parques" },
    { emoji: "👑", name: "Ouro", count: "20 parques" },
    { emoji: "💎", name: "Platina", count: "50 parques" },
    { emoji: "⭐", name: "Diamante", count: "100 parques" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header/Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <MapPin className="w-8 h-8 text-[#C91C1C]" />
              <span className="text-2xl font-bold text-[#C91C1C]">Playpark</span>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/map" className="text-gray-600 hover:text-[#C91C1C] transition-colors">
                Ver Mapa
              </Link>
              {userLoggedIn ? (
                <>
                  <Link href="/map" className="bg-[#C91C1C] text-white px-6 py-2 rounded-lg hover:bg-[#A01515] transition-colors">
                    Ir para o Mapa
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-gray-600 hover:text-[#C91C1C] transition-colors">
                    Entrar
                  </Link>
                  <Link href="/register" className="bg-[#C91C1C] text-white px-6 py-2 rounded-lg hover:bg-[#A01515] transition-colors">
                    Criar Conta
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Descubra os Melhores
            <span className="text-[#C91C1C]"> Parques Infantis</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Encontre, explore e avalie parques infantis perto de si. Marque favoritos, desbloqueie conquistas e compartilhe experiências com a
            comunidade.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href={userLoggedIn ? "/map" : "/register"}
              className="bg-[#C91C1C] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#A01515] transition-colors flex items-center gap-2"
            >
              Começar Agora
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/map"
              className="border-2 border-[#C91C1C] text-[#C91C1C] px-8 py-4 rounded-lg text-lg font-semibold hover:bg-red-50 transition-colors"
            >
              Ver Mapa
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-4xl font-bold text-[#C91C1C] mb-2">500+</div>
              <div className="text-gray-600">Parques Cadastrados</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-4xl font-bold text-[#C91C1C] mb-2">1000+</div>
              <div className="text-gray-600">Utilizadores Ativos</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-4xl font-bold text-[#C91C1C] mb-2">5000+</div>
              <div className="text-gray-600">Visitas Registadas</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Funcionalidades Principais</h2>
            <p className="text-xl text-gray-600">Tudo o que precisa para encontrar o parque perfeito</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gamification Section */}
      <section className="py-20 bg-gradient-to-r from-[#C91C1C] to-[#A01515]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <Trophy className="w-16 h-16 mx-auto mb-6" />
          <h2 className="text-4xl font-bold mb-4">Sistema de Conquistas</h2>
          <p className="text-xl mb-12 opacity-90">Visite parques e desbloqueie badges exclusivos!</p>

          <div className="flex flex-wrap justify-center gap-6">
            {badges.map((badge, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-6 w-32 hover:bg-white/20 transition-colors">
                <div className="text-5xl mb-2">{badge.emoji}</div>
                <div className="font-semibold">{badge.name}</div>
                <div className="text-sm opacity-75">{badge.count}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Pronto para Começar?</h2>
          <p className="text-xl text-gray-600 mb-8">Junte-se a milhares de pais que já descobriram os melhores parques com o Playpark!</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={userLoggedIn ? "/app" : "/register"}
              className="bg-[#C91C1C] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#A01515] transition-colors inline-flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Criar Conta Grátis
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Logo and Description */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <MapPin className="w-8 h-8 text-[#C91C1C]" />
                <span className="text-2xl font-bold">Playpark</span>
              </div>
              <p className="text-gray-400 mb-4">A plataforma mais completa para descobrir e explorar parques infantis em Portugal.</p>

              {/* App Download Buttons */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-300">Baixe o App Mobile:</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href="#"
                    className="flex items-center gap-2 bg-black border border-gray-700 px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    <div className="text-left">
                      <div className="text-xs">Disponível na</div>
                      <div className="text-sm font-semibold">App Store</div>
                    </div>
                  </a>
                  <a
                    href="#"
                    className="flex items-center gap-2 bg-black border border-gray-700 px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    <div className="text-left">
                      <div className="text-xs">Disponível no</div>
                      <div className="text-sm font-semibold">Google Play</div>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            {/* Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Links Rápidos</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/map" className="text-gray-400 hover:text-white transition-colors">
                    Ver Mapa
                  </Link>
                </li>
                <li>
                  <Link href="/app" className="text-gray-400 hover:text-white transition-colors">
                    Aplicação Completa
                  </Link>
                </li>
                <li>
                  <Link href="/favorites" className="text-gray-400 hover:text-white transition-colors">
                    Meus Favoritos
                  </Link>
                </li>
                <li>
                  <Link href="/gamification" className="text-gray-400 hover:text-white transition-colors">
                    Conquistas
                  </Link>
                </li>
              </ul>
            </div>

            {/* Account */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Conta</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/login" className="text-gray-400 hover:text-white transition-colors">
                    Entrar
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="text-gray-400 hover:text-white transition-colors">
                    Criar Conta
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Suporte
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Privacidade
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">© 2025 Playpark. Todos os direitos reservados.</p>
            <div className="flex gap-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Facebook
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Instagram
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Twitter
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
