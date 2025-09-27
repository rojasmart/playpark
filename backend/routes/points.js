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
    transformation: [{ width: 1200, height: 1200, crop: "limit", quality: "auto:good" }],
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB por imagem
    files: 5, // Máximo 5 imagens por upload
  },
  fileFilter: (req, file, cb) => {
    // Validar tipo de arquivo
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Apenas imagens são permitidas"), false);
    }

    // Validar extensões permitidas
    const allowedExtensions = [".jpg", ".jpeg", ".png"];
    const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf("."));

    if (!allowedExtensions.includes(fileExtension)) {
      return cb(new Error("Apenas arquivos JPG, JPEG e PNG são permitidos"), false);
    }

    cb(null, true);
  },
});

// Middleware para tratar erros de upload
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "Arquivo muito grande. Máximo 5MB por imagem." });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({ error: "Muitos arquivos. Máximo 5 imagens por upload." });
    }
  } else if (err.message) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
};

// Criar/atualizar ponto
router.post("/", upload.array("images", 5), handleUploadError, async (req, res) => {
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
      // Dados adicionais
      userId,
    } = req.body;

    console.log("Body recebido:", req.body); // Debug
    console.log("Ficheiros recebidos:", req.files); // Debug

    // Validação básica
    if (!name || !lat || !lng) {
      return res.status(400).json({
        error: "Nome, latitude e longitude são obrigatórios",
      });
    }

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

    // Processar imagens uploadeadas
    const images = req.files
      ? req.files.map((file) => ({
          url: file.path,
          caption: req.body.caption || "",
          uploadedBy: userId || "anonymous",
          uploadedAt: new Date(),
        }))
      : [];

    let point;

    if (osmId) {
      // Atualizar ponto existente do OSM
      const updateData = {
        name,
        description,
        location: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
        tags,
        "appData.lastSyncWithOSM": new Date(),
      };

      if (images.length > 0) {
        updateData.$push = { "appData.images": { $each: images } };
      }

      point = await Point.findOneAndUpdate({ osmId }, updateData, { upsert: true, new: true });
    } else {
      // Criar novo ponto local
      point = new Point({
        name,
        description,
        location: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
        tags,
        appData: {
          images: images,
          rating: rating
            ? {
                average: parseFloat(rating),
                count: 1,
                ratings: [
                  {
                    userId: userId || "anonymous",
                    rating: parseFloat(rating),
                    createdAt: new Date(),
                  },
                ],
              }
            : { average: 0, count: 0, ratings: [] },
          verified: false, // Novos pontos começam não verificados
          createdBy: userId || "anonymous",
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
    const { status, verified } = req.query;

    let filter = {};

    // Filtrar por status de verificação
    if (verified === "true") {
      filter["appData.verified"] = true;
    } else if (verified === "false") {
      filter["appData.verified"] = { $ne: true };
    }

    // Filtrar por existência de osmId
    if (status === "local") {
      filter.osmId = { $exists: false };
    } else if (status === "osm") {
      filter.osmId = { $exists: true };
    }

    // Buscar pontos com filtros aplicados
    const points = await Point.find(filter).sort({ createdAt: -1 });
    console.log("Pontos encontrados:", points.length, "Filtros:", filter); // Debug

    res.json(points);
  } catch (err) {
    console.error("Erro ao buscar pontos:", err);
    res.status(500).json({ error: "Erro ao buscar pontos" });
  }
});

// Listar pontos pendentes de verificação (apenas admin)
router.get("/pending-verification", async (req, res) => {
  try {
    const pendingPoints = await Point.find({
      "appData.verified": { $ne: true },
      osmId: { $exists: false }, // Apenas pontos locais não verificados
    }).sort({ createdAt: -1 });

    res.json(pendingPoints);
  } catch (err) {
    console.error("Erro ao buscar pontos pendentes:", err);
    res.status(500).json({ error: "Erro ao buscar pontos pendentes" });
  }
});

// Verificar um ponto (marca como verified e potencialmente submete ao OSM)
router.post("/:id/verify", async (req, res) => {
  try {
    const { adminUserId, submitToOSM } = req.body;
    const point = await Point.findById(req.params.id);

    if (!point) {
      return res.status(404).json({ error: "Ponto não encontrado" });
    }

    // Verificar se já tem osmId (já foi submetido)
    if (point.osmId) {
      return res.status(400).json({ error: "Ponto já foi submetido ao OSM" });
    }

    // Marcar como verificado
    if (!point.appData) {
      point.appData = { verified: false, rating: { average: 0, count: 0, ratings: [] }, images: [] };
    }

    point.appData.verified = true;
    point.appData.verifiedBy = adminUserId;
    point.appData.verifiedAt = new Date();

    // Se foi solicitado submissão ao OSM
    if (submitToOSM === true) {
      try {
        // Aqui você implementaria a chamada real à API do OSM
        // Por agora, vamos simular
        const osmSubmissionResult = await submitPointToOSM(point);

        if (osmSubmissionResult.success) {
          point.osmId = osmSubmissionResult.osmId;
          point.appData.submittedToOSM = true;
          point.appData.osmSubmissionDate = new Date();
        }
      } catch (osmError) {
        console.error("Erro ao submeter ao OSM:", osmError);
        // Continua mesmo se falhar o OSM, apenas marca como verificado
        point.appData.osmSubmissionError = osmError.message;
      }
    }

    await point.save();
    res.json({
      message: "Ponto verificado com sucesso",
      point,
      submittedToOSM: !!point.osmId,
    });
  } catch (err) {
    console.error("Erro ao verificar ponto:", err);
    res.status(500).json({ error: "Erro ao verificar ponto" });
  }
});

// Função helper para submeter ao OSM (implementação futura)
async function submitPointToOSM(point) {
  // Esta é uma função placeholder
  // Na implementação real, você faria:
  // 1. Autenticação OAuth com OSM
  // 2. Criar changeset
  // 3. Criar node com as tags apropriadas
  // 4. Fechar changeset
  // 5. Retornar o ID do node criado

  console.log("Simulando submissão ao OSM para ponto:", point.name);

  // Simular delay de API
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Por agora, retorna sucesso simulado
  return {
    success: true,
    osmId: `sim_${Date.now()}`, // ID simulado
    changesetId: `cs_${Date.now()}`,
  };
}

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
router.post("/:id/image", upload.single("image"), handleUploadError, async (req, res) => {
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
