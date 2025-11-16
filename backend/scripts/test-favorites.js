/**
 * Script de teste para API de favoritos
 *
 * Como usar:
 * node scripts/test-favorites.js
 */

const API_URL = "http://localhost:5000/api";
const testUserId = `test_user_${Date.now()}`;

async function testFavoritesAPI() {
  console.log("🧪 Testando API de Favoritos\n");
  console.log(`User ID de teste: ${testUserId}\n`);

  // Teste 1: Obter favoritos de usuário novo (deve retornar array vazio)
  console.log("1️⃣ Testando GET /api/users/:userId/favorites (usuário novo)");
  try {
    const response = await fetch(`${API_URL}/users/${testUserId}/favorites`);
    const favorites = await response.json();
    console.log("✅ Resposta:", favorites);
    console.assert(Array.isArray(favorites) && favorites.length === 0, "Deve retornar array vazio");
  } catch (error) {
    console.error("❌ Erro:", error.message);
  }

  // Teste 2: Adicionar um favorito
  console.log("\n2️⃣ Testando POST /api/users/:userId/favorites");
  const testPlayground = {
    id: "test_playground_1",
    name: "Parque de Teste",
    lat: 38.7169,
    lon: -9.139,
    description: "Um parque de teste",
    images: ["https://example.com/image.jpg"],
    tags: { swing: "yes", slide: "yes" },
    rating: 4.5,
    ratingCount: 10,
    source: "backend",
  };

  try {
    const response = await fetch(`${API_URL}/users/${testUserId}/favorites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testPlayground),
    });
    const result = await response.json();
    console.log("✅ Resposta:", result);
  } catch (error) {
    console.error("❌ Erro:", error.message);
  }

  // Teste 3: Obter favoritos (deve retornar 1)
  console.log("\n3️⃣ Testando GET /api/users/:userId/favorites (após adicionar)");
  try {
    const response = await fetch(`${API_URL}/users/${testUserId}/favorites`);
    const favorites = await response.json();
    console.log("✅ Resposta:", favorites);
    console.assert(favorites.length === 1, "Deve retornar 1 favorito");
  } catch (error) {
    console.error("❌ Erro:", error.message);
  }

  // Teste 4: Verificar se é favorito
  console.log("\n4️⃣ Testando GET /api/users/:userId/favorites/check/:playgroundId");
  try {
    const response = await fetch(`${API_URL}/users/${testUserId}/favorites/check/test_playground_1`);
    const result = await response.json();
    console.log("✅ Resposta:", result);
    console.assert(result.isFavorite === true, "Deve retornar isFavorite: true");
  } catch (error) {
    console.error("❌ Erro:", error.message);
  }

  // Teste 5: Tentar adicionar duplicado (deve falhar)
  console.log("\n5️⃣ Testando POST /api/users/:userId/favorites (duplicado)");
  try {
    const response = await fetch(`${API_URL}/users/${testUserId}/favorites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testPlayground),
    });
    const result = await response.json();
    console.log("✅ Resposta:", result);
    console.assert(response.status === 409, "Deve retornar status 409 (Conflict)");
  } catch (error) {
    console.error("❌ Erro:", error.message);
  }

  // Teste 6: Adicionar mais favoritos
  console.log("\n6️⃣ Testando POST múltiplos favoritos");
  const playgrounds = [
    { id: "test_playground_2", name: "Parque 2", lat: 38.72, lon: -9.14 },
    { id: "test_playground_3", name: "Parque 3", lat: 38.73, lon: -9.15 },
  ];

  for (const pg of playgrounds) {
    try {
      await fetch(`${API_URL}/users/${testUserId}/favorites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pg),
      });
      console.log(`✅ Adicionado: ${pg.name}`);
    } catch (error) {
      console.error(`❌ Erro ao adicionar ${pg.name}:`, error.message);
    }
  }

  // Teste 7: Sincronizar favoritos
  console.log("\n7️⃣ Testando POST /api/users/:userId/favorites/sync");
  const syncPlaygrounds = [
    { id: "sync_1", name: "Sync Parque 1", lat: 38.74, lon: -9.16 },
    { id: "sync_2", name: "Sync Parque 2", lat: 38.75, lon: -9.17 },
  ];

  try {
    const response = await fetch(`${API_URL}/users/${testUserId}/favorites/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ favorites: syncPlaygrounds }),
    });
    const result = await response.json();
    console.log("✅ Resposta:", result);
  } catch (error) {
    console.error("❌ Erro:", error.message);
  }

  // Teste 8: Verificar favoritos após sync (deve ter apenas os 2 novos)
  console.log("\n8️⃣ Testando GET /api/users/:userId/favorites (após sync)");
  try {
    const response = await fetch(`${API_URL}/users/${testUserId}/favorites`);
    const favorites = await response.json();
    console.log("✅ Resposta:", favorites);
    console.assert(favorites.length === 2, "Deve retornar 2 favoritos (após sync)");
  } catch (error) {
    console.error("❌ Erro:", error.message);
  }

  // Teste 9: Remover um favorito
  console.log("\n9️⃣ Testando DELETE /api/users/:userId/favorites/:playgroundId");
  try {
    const response = await fetch(`${API_URL}/users/${testUserId}/favorites/sync_1`, {
      method: "DELETE",
    });
    const result = await response.json();
    console.log("✅ Resposta:", result);
  } catch (error) {
    console.error("❌ Erro:", error.message);
  }

  // Teste 10: Verificar favoritos finais (deve ter 1)
  console.log("\n🔟 Testando GET /api/users/:userId/favorites (final)");
  try {
    const response = await fetch(`${API_URL}/users/${testUserId}/favorites`);
    const favorites = await response.json();
    console.log("✅ Resposta:", favorites);
    console.assert(favorites.length === 1, "Deve retornar 1 favorito (após remover)");
  } catch (error) {
    console.error("❌ Erro:", error.message);
  }

  console.log("\n✅ Testes concluídos!");
  console.log(`\n💡 Dica: Para limpar os dados de teste, use:`);
  console.log(`   MongoDB: db.users.deleteOne({ userId: "${testUserId}" })`);
}

// Executar testes
testFavoritesAPI().catch(console.error);
