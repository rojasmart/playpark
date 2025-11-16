"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";

export default function AppPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirecionar para login se não estiver autenticado
    if (!isLoggedIn()) {
      router.push("/login");
    } else {
      // Se estiver autenticado, redirecionar para a home (mapa)
      router.push("/");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Área Restrita</h1>
        <p className="text-gray-600 mb-6">Redirecionando...</p>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C91C1C] mx-auto"></div>
      </div>
    </div>
  );
}
