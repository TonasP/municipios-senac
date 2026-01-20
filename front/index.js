//const API = "http://127.0.0.1:3000/municipios";
const API = "https://municipios-senac-dzky.onrender.com/municipios";

const CLIENT_API_KEY = "SUA_CHAVE_SECRETA_MUITO_FORTE_123456"

let idEdicao = null

let lastScrollTop = 0

let offset = 0


const listagem = document.getElementById("listagem");
const btnCarregar = document.getElementById("btn");
const btnSalvar = document.getElementById("btnSalvar");
const btnDeletar = document.getElementById("btn-delete")
const btnAlterar = document.getElementById("btn-alterar")
const btnPlus = document.getElementById("btn_plus")
const btnMinus = document.getElementById("btn_minus")

// Eventos


btnCarregar.addEventListener("click", async => { offset = 0 })
btnCarregar.addEventListener("click", carregarMunicipios);

btnSalvar.addEventListener("click", decidirSalvar);
btnPlus.addEventListener("click", () => mudarPagina(1))
btnMinus.addEventListener("click", () => mudarPagina(-1))

window.addEventListener("scroll", () => {
    const top = window.scrollY;
    const alturaPagina = document.documentElement.scrollHeight;
    const alturaJanela = window.innerHeight;
    console.log("alturaPagina ", alturaPagina)
    console.log("alturaJanela ", alturaPagina)
    console.log( (top + alturaJanela >= alturaPagina - 5))

    // Scroll para baixo → carregar mais
    if (top + alturaJanela >= alturaPagina - 5) {
        console.log("⬇ Rolou para BAIXO");
        mudarPagina(1);
    }

    // Scroll topo → voltar
    if (top <= 0) {
        console.log("⬆ Rolou para CIMA");
        mudarPagina(-1);
    }
});
//--------------------------------------------------
// LISTAR MUNICÍPIOS
//--------------------------------------------------
async function carregarMunicipios() {
    try {
        const url = `${API}?limit=3&offset=${offset}`
        const resposta = await fetch(url,{
            headers:{
                'minha-chave': CLIENT_API_KEY
            }
        });
        const dados = await resposta.json();


        listagem.innerHTML = ""; // limpa

        dados.forEach(m => criarCard(m));

    } catch (erro) {
        console.error("Erro ao carregar:", erro.message);
    }
}
async function mudarPagina(direcao) {
    let itensPorPagina = 3
    try {
        if (direcao === 1) {
            offset += itensPorPagina
            carregarMunicipios()
        }
        if (direcao === -1) {
            if (offset > 0) {
                offset -= itensPorPagina
                carregarMunicipios()
            }
            else {
                alert("Não é possivel retornar a página")
                return
            }
        }

    }
    catch (erro) {
        console.error("Erro ao paginar", erro.message)
    }
}

//--------------------------------------------------
// CRIAR CARD NO FRONT
//--------------------------------------------------
function criarCard(m) {
    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
        <h3>${m.nome} (${m.estado})</h3>
        <p>${m.caracteristica}</p>
        <button class="btn-delete" onclick="deletar(${m.id})">Deletar</button>
        <button class= "btn-alterar" onclick="preencherFormulario('${m.id}', '${m.nome}', '${m.estado}', '${m.caracteristica}')">Alterar</button>
    `;

    listagem.appendChild(card);
}

//--------------------------------------------------
// INSERIR MUNICÍPIO (POST)
//--------------------------------------------------
async function inserirMunicipio() {
    const nome = document.getElementById("campoMunicipio").value;
    const estado = document.getElementById("campoUF").value;
    const caracteristica = document.getElementById("campoCaracteristica").value;


    const novoMunicipio = { nome, estado, caracteristica };

    try {
        const resposta = await fetch(API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(novoMunicipio),
        });

        if (!resposta.ok) {
            throw new Error("Erro ao inserir!");
        }
        limparFormulario()
        carregarMunicipios();

    } catch (erro) {
        console.error("Erro ao inserir:", erro.message);
    }
}
async function alterarMunicipio() {
    const nome = document.getElementById("campoMunicipio").value;
    const estado = document.getElementById("campoUF").value;
    const caracteristica = document.getElementById("campoCaracteristica").value;

    const novosDados = { nome, estado, caracteristica }
    try {
        const resposta = await fetch(`${API}/${idEdicao}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(novosDados)
        })
        if (!resposta.ok) {
            throw new Error("Erro ao alterar!");
        }
        limparFormulario()
        carregarMunicipios();

    }
    catch (erro) {
        console.error("Erro ao alterar", erro.message)
    }
}
function preencherFormulario(id, nome, estado, caracteristica) {
    document.getElementById("campoMunicipio").value = nome;
    document.getElementById("campoUF").value = estado;
    document.getElementById("campoCaracteristica").value = caracteristica;

    idEdicao = id;

    btnSalvar.textContent = "Atualizar";
}
function limparFormulario() {
    document.getElementById("campoMunicipio").value = "";
    document.getElementById("campoUF").value = "";
    document.getElementById("campoCaracteristica").value = "";

    idEdicao = null;

    btnSalvar.textContent = "Salvar";
}


async function decidirSalvar() {
    if (idEdicao === null) {
        await inserirMunicipio();
    } else {
        await alterarMunicipio();
    }
}
async function deletar(id) {
    try {
        const resposta = await fetch(`${API}/${id}`, {
            method: "DELETE"
        });
        if (!resposta.ok) {
            throw new Error("Erro ao deletar!");
        }
        carregarMunicipios();

    } catch (erro) {
        console.error("Erro ao deletar:", erro.message);
    }
}