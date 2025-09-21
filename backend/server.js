require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const pointsRoutes = require("./routes/points");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Conectar ao MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB conectado com sucesso"))
  .catch((err) => console.error("❌ Erro ao conectar MongoDB:", err.message));
// Rotas
app.use("/api/points", pointsRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend rodando na porta ${PORT}`);
});
