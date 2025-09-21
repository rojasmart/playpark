const mongoose = require("mongoose");

const pointSchema = new mongoose.Schema(
  {
    // ID do OSM para fazer a ligação (se existir)
    osmId: {
      type: String,
      unique: true,
      sparse: true, // Permite null para parques criados localmente
    },

    // Dados básicos (compatíveis com OSM)
    name: String,
    description: String,
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },

    // Tags do OSM (estrutura similar)
    tags: {
      leisure: { type: String, default: "playground" },
      access: String,
      surface: String,
      min_age: String,
      max_age: String,
      wheelchair: String,
      covered: String,
      bench: String,
      drinking_water: String,
      natural_shade: String,

      // Equipamentos playground
      "playground:slide": String,
      "playground:swing": String,
      "playground:climbingframe": String,
      "playground:climbing_net": String,
      "playground:theme": String,
      // ... outros equipamentos
    },

    // Dados específicos da sua app (não existem no OSM)
    appData: {
      rating: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 },
        ratings: [
          {
            userId: String,
            rating: Number,
            createdAt: { type: Date, default: Date.now },
          },
        ],
      },
      images: [
        {
          url: String,
          caption: String,
          uploadedBy: String,
          uploadedAt: { type: Date, default: Date.now },
        },
      ],
      verified: { type: Boolean, default: false },
      lastSyncWithOSM: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Point", pointSchema);
