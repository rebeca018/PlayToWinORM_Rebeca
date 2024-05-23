// Importações de módulos:
require("dotenv").config();
const conn = require("./db/conn");
const Usuario = require("./models/Usuario");
const express = require("express");
const exphbs = require("express-handlebars");

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
})

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