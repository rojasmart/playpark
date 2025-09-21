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

// Criar/atualizar ponto
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const {
      osmId,
      name,
      description,
      lat,
      lng,
      surface,
      min_age,
      max_age,
      theme,
      rating,
      // Equipamentos
      playground_slide,
      playground_swing,
      playground_climbingframe,
      wheelchair,
      covered,
      bench,
      drinking_water,
      access,
    } = req.body;

    console.log("Body recebido:", req.body); // Debug
    console.log("Ficheiro recebido:", req.file); // Debug

    // Estruturar tags no formato OSM
    const tags = {
      leisure: "playground",
      access: access || undefined,
      surface: surface || undefined,
      min_age: min_age || undefined,
      max_age: max_age || undefined,
      wheelchair: wheelchair || undefined,
      covered: covered || undefined,
      bench: bench || undefined,
      drinking_water: drinking_water || undefined,
      "playground:slide": playground_slide || undefined,
      "playground:swing": playground_swing || undefined,
      "playground:climbingframe": playground_climbingframe || undefined,
      "playground:theme": theme || undefined,
    };

    // Remover propriedades undefined
    Object.keys(tags).forEach((key) => tags[key] === undefined && delete tags[key]);

    let point;

    if (osmId) {
      // Atualizar ponto existente do OSM
      point = await Point.findOneAndUpdate(
        { osmId },
        {
          name,
          description,
          location: { lat: parseFloat(lat), lng: parseFloat(lng) },
          tags,
          $push: {
            "appData.images": req.file
              ? {
                  url: req.file.path,
                  uploadedAt: new Date(),
                }
              : undefined,
          },
          "appData.lastSyncWithOSM": new Date(),
        },
        { upsert: true, new: true }
      );
    } else {
      // Criar novo ponto local
      point = new Point({
        name,
        description,
        location: { lat: parseFloat(lat), lng: parseFloat(lng) },
        tags,
        appData: {
          images: req.file
            ? [
                {
                  url: req.file.path,
                  uploadedAt: new Date(),
                },
              ]
            : [],
          rating: rating
            ? {
                average: parseFloat(rating),
                count: 1,
                ratings: [
                  {
                    rating: parseFloat(rating),
                    createdAt: new Date(),
                  },
                ],
              }
            : { average: 0, count: 0, ratings: [] },
        },
      });

      await point.save();
    }

    console.log("Ponto criado/atualizado com sucesso:", point); // Debug
    res.status(201).json(point);
  } catch (err) {
    console.error("Erro ao criar/atualizar ponto:", err);
    res.status(500).json({ error: "Erro ao processar ponto", details: err.message });
  }
});

// Adicionar rating a um ponto
router.post("/:id/rating", async (req, res) => {
  try {
    const { rating, userId } = req.body;
    const point = await Point.findById(req.params.id);

    if (!point) {
      return res.status(404).json({ error: "Ponto não encontrado" });
    }

    // Inicializar appData se não existir
    if (!point.appData) {
      point.appData = { rating: { average: 0, count: 0, ratings: [] }, images: [] };
    }
    if (!point.appData.rating) {
      point.appData.rating = { average: 0, count: 0, ratings: [] };
    }

    // Adicionar novo rating
    point.appData.rating.ratings.push({
      userId,
      rating: parseFloat(rating),
      createdAt: new Date(),
    });

    // Recalcular média
    const ratings = point.appData.rating.ratings;
    point.appData.rating.average = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
    point.appData.rating.count = ratings.length;

    await point.save();
    res.json(point);
  } catch (err) {
    console.error("Erro ao adicionar rating:", err);
    res.status(500).json({ error: "Erro ao adicionar rating" });
  }
});

// Listar todos os pontos (híbrido: OSM + dados locais)
router.get("/", async (req, res) => {
  try {
    // Buscar pontos locais
    const points = await Point.find().sort({ createdAt: -1 });
    console.log("Pontos encontrados:", points.length); // Debug

    // Aqui você pode implementar lógica para:
    // 1. Fazer cache dos dados do OSM
    // 2. Combinar com dados locais
    // 3. Sincronizar periodicamente

    res.json(points);
  } catch (err) {
    console.error("Erro ao buscar pontos:", err);
    res.status(500).json({ error: "Erro ao buscar pontos" });
  }
});

// Obter um ponto específico por ID
router.get("/:id", async (req, res) => {
  try {
    const point = await Point.findById(req.params.id);
    if (!point) {
      return res.status(404).json({ error: "Ponto não encontrado" });
    }
    res.json(point);
  } catch (err) {
    console.error("Erro ao buscar ponto:", err);
    res.status(500).json({ error: "Erro ao buscar ponto" });
  }
});

// Adicionar imagem a um ponto existente
router.post("/:id/image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhuma imagem fornecida" });
    }

    const point = await Point.findById(req.params.id);
    if (!point) {
      return res.status(404).json({ error: "Ponto não encontrado" });
    }

    // Inicializar appData se não existir
    if (!point.appData) {
      point.appData = { rating: { average: 0, count: 0, ratings: [] }, images: [] };
    }
    if (!point.appData.images) {
      point.appData.images = [];
    }

    // Adicionar nova imagem
    point.appData.images.push({
      url: req.file.path,
      caption: req.body.caption || "",
      uploadedBy: req.body.userId || "anonymous",
      uploadedAt: new Date(),
    });

    await point.save();
    res.json(point);
  } catch (err) {
    console.error("Erro ao adicionar imagem:", err);
    res.status(500).json({ error: "Erro ao adicionar imagem" });
  }
});

module.exports = router;
