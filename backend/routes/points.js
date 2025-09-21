const express = require("express");
const router = express.Router();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinaryModule = require("cloudinary").v2;
const Point = require("../models/Point");

// Configurar Cloudinary
cloudinaryModule.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configurar Multer + Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinaryModule,
  params: {
    folder: "playpark",
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});
const upload = multer({ storage });

// Criar novo ponto
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { title, description, lat, lng, tags } = req.body;

    console.log("Body recebido:", req.body); // Debug
    console.log("Ficheiro recebido:", req.file); // Debug

    const newPoint = new Point({
      title,
      description,
      location: {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      },
      tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
      imageUrl: req.file ? req.file.path : null, // Torna opcional temporariamente
    });

    await newPoint.save();
    console.log("Ponto criado com sucesso:", newPoint); // Debug
    res.status(201).json(newPoint);
  } catch (err) {
    console.error("Erro completo ao criar ponto:", err.message, err.stack);
    res.status(500).json({ error: "Erro ao criar ponto", details: err.message });
  }
});

// Listar todos os pontos
router.get("/", async (req, res) => {
  try {
    const points = await Point.find().sort({ createdAt: -1 });
    console.log("Pontos encontrados:", points.length); // Adiciona esta linha
    res.json(points);
  } catch (err) {
    console.error("Erro ao buscar pontos:", err); // Adiciona esta linha
    res.status(500).json({ error: "Erro ao buscar pontos" });
  }
});

module.exports = router;
