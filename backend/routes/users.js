const express = require("express");
const router = express.Router();
const User = require("../models/User");

/**
 * GET /api/users/:userId/favorites
 * Obter todos os favoritos de um usuário
 */
router.get("/:userId/favorites", async (req, res) => {
  try {
    const { userId } = req.params;

    let user = await User.findOne({ userId });

    if (!user) {
      // Se o usuário não existe, retorna array vazio
      return res.json([]);
    }

    // Retornar favoritos ordenados por data de adição (mais recentes primeiro)
    const favorites = user.favorites
      .sort((a, b) => b.addedAt - a.addedAt)
      .map((fav) => ({
        id: fav.playgroundId,
        ...fav.playgroundData,
        addedAt: fav.addedAt,
        notes: fav.notes,
      }));

    res.json(favorites);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
});

/**
 * POST /api/users/:userId/favorites
 * Adicionar um parque aos favoritos
 * Body: { id, name, lat, lon, description?, images?, tags?, rating?, ratingCount?, source? }
 */
router.post("/:userId/favorites", async (req, res) => {
  try {
    const { userId } = req.params;
    const playgroundData = req.body;

    // Validar dados obrigatórios
    if (!playgroundData.id || !playgroundData.name || !playgroundData.lat || !playgroundData.lon) {
      return res.status(400).json({ error: "Missing required fields: id, name, lat, lon" });
    }

    // Buscar ou criar usuário
    let user = await User.findOne({ userId });

    if (!user) {
      user = new User({ userId });
    }

    // Adicionar favorito
    const added = user.addFavorite(playgroundData);

    if (!added) {
      return res.status(409).json({ error: "Playground already in favorites" });
    }

    user.lastSync = new Date();
    await user.save();

    res.status(201).json({
      message: "Added to favorites",
      favorite: {
        id: playgroundData.id,
        name: playgroundData.name,
        addedAt: user.favorites[user.favorites.length - 1].addedAt,
      },
    });
  } catch (error) {
    console.error("Error adding favorite:", error);
    res.status(500).json({ error: "Failed to add favorite" });
  }
});

/**
 * DELETE /api/users/:userId/favorites/:playgroundId
 * Remover um parque dos favoritos
 */
router.delete("/:userId/favorites/:playgroundId", async (req, res) => {
  try {
    const { userId, playgroundId } = req.params;

    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const removed = user.removeFavorite(playgroundId);

    if (!removed) {
      return res.status(404).json({ error: "Playground not in favorites" });
    }

    user.lastSync = new Date();
    await user.save();

    res.json({ message: "Removed from favorites", playgroundId });
  } catch (error) {
    console.error("Error removing favorite:", error);
    res.status(500).json({ error: "Failed to remove favorite" });
  }
});

/**
 * POST /api/users/:userId/favorites/sync
 * Sincronizar favoritos do localStorage com o servidor
 * Body: { favorites: [...] }
 */
router.post("/:userId/favorites/sync", async (req, res) => {
  try {
    const { userId } = req.params;
    const { favorites } = req.body;

    if (!Array.isArray(favorites)) {
      return res.status(400).json({ error: "Invalid favorites array" });
    }

    // Buscar ou criar usuário
    let user = await User.findOne({ userId });

    if (!user) {
      user = new User({ userId });
    }

    // Limpar favoritos atuais e adicionar novos
    user.favorites = [];

    for (const playground of favorites) {
      if (playground.id && playground.name && playground.lat && playground.lon) {
        user.addFavorite(playground);
      }
    }

    user.lastSync = new Date();
    await user.save();

    res.json({
      message: "Favorites synced",
      count: user.favorites.length,
      lastSync: user.lastSync,
    });
  } catch (error) {
    console.error("Error syncing favorites:", error);
    res.status(500).json({ error: "Failed to sync favorites" });
  }
});

/**
 * GET /api/users/:userId/favorites/check/:playgroundId
 * Verificar se um parque está nos favoritos
 */
router.get("/:userId/favorites/check/:playgroundId", async (req, res) => {
  try {
    const { userId, playgroundId } = req.params;

    const user = await User.findOne({ userId });

    if (!user) {
      return res.json({ isFavorite: false });
    }

    const isFavorite = user.isFavorite(playgroundId);

    res.json({ isFavorite });
  } catch (error) {
    console.error("Error checking favorite:", error);
    res.status(500).json({ error: "Failed to check favorite" });
  }
});

/**
 * POST /api/users/:userId/visited
 * Marcar um parque como visitado
 * Body: { playgroundId }
 */
router.post("/:userId/visited", async (req, res) => {
  try {
    const { userId } = req.params;
    const { playgroundId } = req.body;

    if (!playgroundId) {
      return res.status(400).json({ error: "Missing playgroundId" });
    }

    // Buscar ou criar usuário
    let user = await User.findOne({ userId });

    if (!user) {
      user = new User({ userId });
    }

    // Verificar se já foi visitado
    const alreadyVisited = user.visited.some((v) => v.playgroundId === playgroundId);

    if (alreadyVisited) {
      return res.status(409).json({ error: "Playground already marked as visited" });
    }

    // Adicionar aos visitados
    user.visited.push({
      playgroundId,
      visitedAt: new Date(),
    });

    await user.save();

    res.status(201).json({
      message: "Marked as visited",
      visitedCount: user.visited.length,
    });
  } catch (error) {
    console.error("Error marking as visited:", error);
    res.status(500).json({ error: "Failed to mark as visited" });
  }
});

/**
 * GET /api/users/:userId/visited
 * Obter todos os parques visitados
 */
router.get("/:userId/visited", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findOne({ userId });

    if (!user) {
      return res.json([]);
    }

    // Retornar visitados ordenados por data (mais recentes primeiro)
    const visited = user.visited
      .sort((a, b) => b.visitedAt - a.visitedAt)
      .map((v) => ({
        playgroundId: v.playgroundId,
        visitedAt: v.visitedAt,
      }));

    res.json(visited);
  } catch (error) {
    console.error("Error fetching visited:", error);
    res.status(500).json({ error: "Failed to fetch visited playgrounds" });
  }
});

/**
 * GET /api/users/:userId/visited/check/:playgroundId
 * Verificar se um parque foi visitado
 */
router.get("/:userId/visited/check/:playgroundId", async (req, res) => {
  try {
    const { userId, playgroundId } = req.params;

    const user = await User.findOne({ userId });

    if (!user) {
      return res.json({ isVisited: false });
    }

    const isVisited = user.visited.some((v) => v.playgroundId === playgroundId);

    res.json({ isVisited });
  } catch (error) {
    console.error("Error checking visited:", error);
    res.status(500).json({ error: "Failed to check visited" });
  }
});

/**
 * GET /api/users/:userId/stats
 * Obter estatísticas do usuário (favoritos, visitados, badges)
 */
router.get("/:userId/stats", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findOne({ userId });

    if (!user) {
      return res.json({
        visitedCount: 0,
        favoritesCount: 0,
        lastSync: null,
      });
    }

    res.json({
      visitedCount: user.visited.length,
      favoritesCount: user.favorites.length,
      lastSync: user.lastSync,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

module.exports = router;
