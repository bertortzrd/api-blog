import dotenv from "dotenv";
dotenv.config();
//----------------------------------
import postgres from "postgres";


function conectar(){
    return postgres({
        host : process.env.DB_HOST,
        database : process.env.DB_NAME,
        user : process.env.DB_USER,
        password : process.env.DB_PASSWORD
    });
};

function crearPost(texto,usuario){
    return new Promise((ok,ko) => {
        const conexion = conectar();

        conexion `INSERT INTO posts (texto,usuario) VALUES(${texto},${usuario}) RETURNING id`
        .then(([{id}]) => {
            conexion.end();
            ok(id)
        })
        .catch(() => ko({ error: "error en base de datos"}));
    });
};

function leerPosts(usuario){
    return new Promise((ok,ko) => {
        const conexion = conectar();

        conexion `SELECT * FROM posts WHERE usuario = ${usuario} ORDER BY id`
        .then(posts => {
            conexion.end();
            ok(posts)
        })
        .catch(() => ko({ error: "error en base de datos"}));
    });
};

function borrarPost(id){
    return new Promise((ok,ko) => {
        const conexion = conectar();

        conexion `DELETE FROM posts WHERE id = ${id}`
        .then(({count}) => {
            conexion.end();
            ok(count)
        })
        .catch(() => ko({ error: "error en base de datos"}));
    });
};

function editarPosts(id,texto){
    return new Promise((ok,ko) => {
        const conexion = conectar();

        conexion `UPDATE posts SET texto = ${texto} WHERE id = ${id}`
        .then(({count}) => {
            conexion.end();
            ok(count)
        })
        .catch(() => ko({ error: "error en base de datos"}));
    });
};

leerPosts(1)
.then(x => console.log(x))
.catch(x => console.log(x))
