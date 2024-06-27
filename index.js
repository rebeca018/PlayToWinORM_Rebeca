// Importações de módulos:
require("dotenv").config();
const conn = require("./db/conn");
const express = require("express");
const exphbs = require("express-handlebars");

const Usuario = require("./models/Usuario");
const Jogo = require("./models/Jogo");
const Cartao = require("./models/Cartao");
const Conquista = require("./models/Conquista");

Jogo.belongsToMany(Usuario, {through: "aquisicoes"});
Usuario.belongsToMany(Jogo, {through: "aquisicoes"});

// Instanciação do servidor:
const app = express();

// Vinculação do Handlebars ao Express:
app.engine("handlebars", exphbs.engine())
app.set("view engine", "handlebars");

app.use(
    express.urlencoded({
        extended: true,
    })
);

app.use(express.json());

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/usuarios", async (req, res) => {
    const usuarios = await Usuario.findAll({raw: true});

    res.render("usuarios", {usuarios});
});

app.get("/usuarios/novo", (req, res) => {
    res.render("formUsuario");
});
     
app.post("/usuarios/novo", async (req, res) => {
    const nickname = req.body.nickname;
    const nome = req.body.nome;

    const dadosUsuario = {
        nickname,
        nome,
    };

    const usuario = await Usuario.create(dadosUsuario);

    res.send("Usuario inserido sob o id " + usuario.id);
});

app.get("/usuarios/:id/update", async (req, res) => {
    const id = parseInt(req.params.id);
    const usuario = await Usuario.findByPk(id, {raw: true});

    res.render("formUsuario", {usuario});   
    //const usuario = Usuario.findOne({
    //  where: {id: id},
    //  raw: true,
    //})
});

app.post("/usuarios/:id/update", async (req, res) => {
    const id = parseInt(req.params.id);
    const dadosUsuario = {
        nickname: req.body.nickname,
        nome: req.body.nome,
    };

    const retorno = await Usuario.update(dadosUsuario, {where: {id: id}})

    if(retorno > 0){
        res.redirect("/usuarios");
    }else{
        res.send("Erro ao atualizar usuário");
    }
});

app.post("/usuarios/:id/delete", async (req, res)=>{
    const id = parseInt(req.params.id);
    const retorno = await Usuario.destroy({where: {id: id}});

    if(retorno > 0){
        res.redirect("/usuarios");
    }else{
        res.send("Erro ao excluir usuário");
    }
});

app.get("/jogos", async (req, res) => {
    const jogos = await Jogo.findAll({raw: true});

    res.render("jogos", {jogos});
});

app.get("/jogos/novo", (req, res) => {
    res.render("formJogos");
});
     
app.post("/jogos/novo", async (req, res) => {
    const titulo = req.body.titulo;
    const descricao = req.body.descricao;
    const preco = req.body.preco;

    const dadosJogo = {
        titulo,
        descricao,
        preco,
    };

    const jogo = await Jogo.create(dadosJogo);

    res.redirect("/jogos")
});

app.get("/jogos/:id/update", async (req, res) => {
    const id = parseInt(req.params.id);
    const jogo = await Jogo.findByPk(id, {raw: true});

    res.render("formJogos", {jogo});   

});

app.post("/jogos/:id/update", async (req, res) => {
    const id = parseInt(req.params.id);
    const dadosJogo = {
        titulo: req.body.titulo,
        descricao: req.body.descricao,
        preco: req.body.preco,
    };

    const retorno = await Jogo.update(dadosJogo, {where: {id: id}})

    if(retorno > 0){
        res.redirect("/jogos");
    }else{
        res.send("Erro ao atualizar jogo");
    }
});

app.post("/jogos/:id/delete", async (req, res)=>{
    const id = parseInt(req.params.id);
    const retorno = await Jogo.destroy({where: {id: id}});

    if(retorno > 0){
        res.redirect("/jogos");
    }else{
        res.send("Erro ao excluir jogo");
    }
});

// Rotas para cartões
// buscando cartão
app.get("/usuarios/:id/cartoes", async (req, res) => {
    const id = parseInt(req.params.id);
    const usuario = await Usuario.findByPk(id, {raw: true});

    const cartoes = await Cartao.findAll({
        raw: true,
        where: {UsuarioId: id},
    })
    res.render("cartoes.handlebars", { usuario, cartoes })
});

// Formulário de cadastro
app.get("/usuarios/:id/novoCartao", async (req, res) => {
    const id = parseInt(req.params.id);
    const usuario = await Usuario.findByPk(id, {raw: true});

    res.render("formCartao", { usuario })
});

// criando cartão
app.post("/usuarios/:id/novoCartao", async (req, res) => {
    const id = parseInt(req.params.id);

    const dadosCartao = {
        numero: req.body.numero,
        nome: req.body.nome,
        codSeguranca: req.body.codSeguranca,
        UsuarioId: id,
    };

   await Cartao.create(dadosCartao)
   res.redirect(`/usuarios/${id}/cartoes`)
});

// Rotas conquista

//formulário de cadastro
app.get("/jogos/:id/novaConquista", async (req, res) => {
    const id = parseInt(req.params.id);
    const jogo = await Jogo.findByPk(id, {raw: true});

    res.render("formConquista", { jogo })
});

//cadastrando conquista por jogo
app.post("/jogos/:id/novaConquista", async (req, res) => {
    const id = parseInt(req.params.id);

    const dadosConquista = {
        titulo: req.body.titulo,
        descricao: req.body.descricao,
        JogoId: id,
    };

   await Conquista.create(dadosConquista)
   res.redirect(`/jogos/${id}/conquistas`)
});

// mostrando as conquistas por jogo
app.get("/jogos/:id/conquistas", async (req, res) => {
    const id = parseInt(req.params.id);
    const jogo = await Jogo.findByPk(id, {raw: true});

    const conquistas = await Conquista.findAll({
        raw: true,
        where: {JogoId: id},
    })
    res.render("conquistas.handlebars", { jogo, conquistas })
});


app.listen(8000, () =>{
    console.log("Server rodando na porta 8000!");
});                                                                                                                                     

conn
    .sync()
    .then(() => {
        console.log("Banco de dados conectado e estrutura sincronizada!");
    })
    .catch((err) => {
        console.log("Erro ao conectar/sincronizar o banco de dados: " + err);
    });