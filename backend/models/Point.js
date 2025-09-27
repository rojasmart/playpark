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
    name: { type: String, required: true },
    description: String,
    // location suporta GeoJSON { type: 'Point', coordinates: [lng, lat] }
    // e mantém lat/lng por compatibilidade
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: { type: [Number] }, // [lng, lat]
      // legacy fields (optional)
      lat: Number,
      lng: Number,
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
      verifiedBy: String,
      verifiedAt: Date,
      createdBy: String,
      submittedToOSM: { type: Boolean, default: false },
      osmSubmissionDate: Date,
      osmSubmissionError: String,
      lastSyncWithOSM: Date,
    },
  },
  {
    timestamps: true,
  }
);

// 2dsphere index for GeoJSON queries
pointSchema.index({ location: "2dsphere" });

// Normalize location before validation: keep coordinates and lat/lng in sync
pointSchema.pre("validate", function (next) {
  if (!this.location) return next();

  // If coordinates exist (GeoJSON), fill legacy lat/lng
  if (Array.isArray(this.location.coordinates) && this.location.coordinates.length >= 2) {
    const lng = parseFloat(this.location.coordinates[0]);
    const lat = parseFloat(this.location.coordinates[1]);
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
      this.location.type = "Point";
      this.location.lat = lat;
      this.location.lng = lng;
    }
  } else if (typeof this.location.lat !== "undefined" && typeof this.location.lng !== "undefined") {
    // If legacy lat/lng present, create coordinates
    const lat = parseFloat(this.location.lat);
    const lng = parseFloat(this.location.lng);
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
      this.location.type = "Point";
      this.location.coordinates = [lng, lat];
    }
  }

  next();
});

module.exports = mongoose.model("Point", pointSchema);
