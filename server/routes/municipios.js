const express = require("express");
const pool = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    let { estado, ordem , offset, limit} = req.query;


    estado = estado ? '%'+ estado + '%' : '%';
    ordem = ordem && ordem.toLowerCase() === "asc" ? "ASC" : "DESC";
    offset =  parseInt(offset) || 0;    
    limit =   parseInt(limit) || 100;
    
    console.log(estado,ordem,offset,limit);
    const query = `
    SELECT * FROM municipios
    where estado ilike  $1
    ORDER BY id ${ordem}
    LIMIT $2
    OFFSET $3
    `;

    const result = await pool.query(query, [estado, limit, offset]);

    res.json(result.rows);

  } catch (err) {
    res.status(500).json({ 
      error: "Erro ao listar municípios", 
      detalhes: err.message 
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await pool.query("SELECT * FROM municipios WHERE id = $1 order by id desc", [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Município não encontrado" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar município" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { nome, estado, caracteristica } = req.body;
    if (!nome || !estado || !caracteristica) return res.status(400).json({ error: "Campos obrigatórios: nome, estado, caracteristica" });

    const result = await pool.query(
      "INSERT INTO municipios (nome, estado, caracteristica) VALUES ($1, $2, $3) RETURNING *",
      [nome, estado, caracteristica]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Erro ao inserir município" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { nome, estado, caracteristica } = req.body;
    const result = await pool.query(
      "UPDATE municipios SET nome=$1, estado=$2, caracteristica=$3 WHERE id=$4 RETURNING *",
      [nome, estado, caracteristica, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Município não encontrado" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Erro ao atualizar município" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await pool.query("DELETE FROM municipios WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Município não encontrado" });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: "Erro ao deletar município" });
  }
});

module.exports = router;
