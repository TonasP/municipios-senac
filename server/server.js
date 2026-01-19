const dns = require('node:dns');
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const express = require("express");
require("dotenv").config();

const cors = require('cors');

const municipiosRouter = require("./routes/municipios");

const autenticarAPIKey = require("./autorizar");

const app = express();
app.use(cors());
app.use(express.json());

app.use(autenticarAPIKey)
app.use("/municipios",  municipiosRouter);

// Rota raiz
app.get("/", (req, res) => {
  res.send("🌎 API de Municípios rodando! Acesse a documentação em /api-docs");
});

// =====================
// Servidor
// =====================
const PORT = process.env.PORT || 3000;

const pool = require("./db");


app.listen(PORT,  () => {
  console.log("✅ Servidor rodando ");
});


(async () => {
  try {
    await pool.query("SELECT 1");
    console.log("✅ Conexão com Supabase OK");
  } catch (err) {
    console.error("❌ ERRO AO CONECTAR NO SUPABASE");
    console.error("Mensagem:", err.message);
    console.error("Código:", err.code);
  }
})();