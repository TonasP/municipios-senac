require("dotenv").config();
const pool = require("./db.js");
//ler chave liberada
//const api_key = process.env.API_KEY_SECRET

//let contadorReq = 0

async function autenticarAPIKey(req, res, next) {

    const api_key_front = req.header('minha-chave');
   
    const result = await pool.query("SELECT * FROM api_keys WHERE api_key = $1", [api_key_front])

    if (result.rows.length>0 && result.rows[0].consumo < result.rows[0].limite) {
        const agora = new Date()
        const dataBanco = new Date(result.rows[0].ultimo_uso)
        const diferenca = agora - dataBanco
        const diaEmMs= 1000 * 60 * 60 * 24
        console.log("chave válida", api_key_front, )
        await pool.query("UPDATE public.api_keys SET consumo = consumo +1 , ultimo_uso = now() where api_key = $1",[api_key_front])
        if (diferenca >= diaEmMs){
            await pool.query("UPDATE public.api_keys SET consumo = 0 where api_key = $1",[api_key_front])
        }
        next()   

    }
    else {
        if (result.rows[0].consumo >= result.rows[0].limite){
            return res.status(200).json({mensagem:"Limite de requisições da API foram alcançados"})
        }
        console.log("chave inválida", api_key_front)
        return res.status(500).json({ mensagem: "Chave inválida" })
    }
}

module.exports = autenticarAPIKey
