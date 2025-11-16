const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Identificação básica
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Email (opcional - pode usar userId como identificador único)
    email: {
      type: String,
      sparse: true,
      lowercase: true,
      trim: true,
    },

    // Nome (opcional)
    name: String,

    // Favoritos - array de referências aos parques
    favorites: [
      {
        // ID do parque (pode ser OSM ou backend)
        playgroundId: {
          type: String,
          required: true,
        },

        // Dados do parque armazenados (para acesso rápido)
        // Evita ter que fazer join com a coleção Points
        playgroundData: {
          name: String,
          lat: Number,
          lon: Number,
          description: String,
          images: [String],
          tags: mongoose.Schema.Types.Mixed,
          rating: Number,
          ratingCount: Number,
          source: String, // 'osm' ou 'backend'
        },

        // Metadata do favorito
        addedAt: {
          type: Date,
          default: Date.now,
        },

        // Opcional: notas pessoais do usuário
        notes: String,
      },
    ],

    // Preferências do usuário
    preferences: {
      defaultLocation: {
        lat: Number,
        lon: Number,
      },
      searchRadius: {
        type: Number,
        default: 5000, // metros
      },
      mapZoom: {
        type: Number,
        default: 13,
      },
    },

    // Histórico de parques visitados (opcional)
    visited: [
      {
        playgroundId: String,
        visitedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Última sincronização
    lastSync: Date,
  },
  {
    timestamps: true,
  }
);

// Index para busca rápida de favoritos
userSchema.index({ "favorites.playgroundId": 1 });

// Método para adicionar favorito
userSchema.methods.addFavorite = function (playgroundData) {
  const exists = this.favorites.find((fav) => fav.playgroundId === playgroundData.id);

  if (exists) {
    return false; // Já existe
  }

  this.favorites.push({
    playgroundId: playgroundData.id,
    playgroundData: {
      name: playgroundData.name,
      lat: playgroundData.lat,
      lon: playgroundData.lon,
      description: playgroundData.description,
      images: playgroundData.images || [],
      tags: playgroundData.tags || {},
      rating: playgroundData.rating,
      ratingCount: playgroundData.ratingCount,
      source: playgroundData.source,
    },
  });

  return true;
};

// Método para remover favorito
userSchema.methods.removeFavorite = function (playgroundId) {
  const initialLength = this.favorites.length;
  this.favorites = this.favorites.filter((fav) => fav.playgroundId !== playgroundId);
  return this.favorites.length < initialLength;
};

// Método para verificar se é favorito
userSchema.methods.isFavorite = function (playgroundId) {
  return this.favorites.some((fav) => fav.playgroundId === playgroundId);
};

module.exports = mongoose.model("User", userSchema);
