const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinaryModule = require('cloudinary').v2;
const Point = require('../models/Point');

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
    folder: 'playpark',
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});
const upload = multer({ storage });

// Criar novo ponto
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, description, lat, lng, tags } = req.body;

    const newPoint = new Point({
      title,
      description,
      location: {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      },
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      imageUrl: req.file.path,
    });

    await newPoint.save();
    res.status(201).json(newPoint);
  } catch (err) {
    console.error('Erro ao criar ponto:', err);
    res.status(500).json({ error: 'Erro ao criar ponto' });
  }
});

// Listar todos os pontos
router.get('/', async (req, res) => {
  try {
    const points = await Point.find().sort({ createdAt: -1 });
    res.json(points);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar pontos' });
  }
});

module.exports = router;
