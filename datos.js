//import dotenv from "dotenv";
//dotenv.config();
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

export function crearUsuario(usuario,hash){
    return new Promise((ok,ko) => {
        const conexion = conectar();

        conexion`INSERT INTO usuarios (usuario, password) VALUES (${usuario}, ${hash}) RETURNING id`
        .then(([{ id }]) => {
            conexion.end();
            ok(id);
        })
        .catch(() => ko({ error: "error en base de datos"}));       
    });
}

export function buscarUsuario(usuario){
    return new Promise((ok,ko) => {
        const conexion = conectar();

        conexion `SELECT * FROM usuarios WHERE usuario = ${usuario}`
        .then(([usuario]) => {
            conexion.end();
            ok(usuario)
        })
        .catch(() => ko({ error: "error en base de datos"}));
    });
};

export function crearPost(texto,usuario){
    console.log("crearPost -> texto:", texto, "usuario:", usuario);
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

export function leerPosts(){
    return new Promise((ok,ko) => {
        const conexion = conectar();

        conexion `SELECT posts.id AS _id, posts.texto, usuarios.usuario AS autor, COALESCE(like_count.count, 0) AS likes FROM posts JOIN usuarios ON posts.usuario = usuarios.id LEFT JOIN (SELECT post_id, COUNT(*) AS count FROM likes GROUP BY post_id) AS like_count ON posts.id = like_count.post_id ORDER BY posts.id DESC`
        .then(posts => {
            conexion.end();
            ok(posts)
        })
        .catch(() => ko({ error: "error en base de datos"}));
    });
};

export function darLike(postId,usuarioId){
    return new Promise((ok,ko) => {
        const conexion = conectar();

        conexion `INSERT INTO likes (post_id, usuario_id) VALUES (${postId}, ${usuarioId}) ON CONFLICT DO NOTHING`
        .then(({count}) => {
            conexion.end();
            ok(count)
        })
        .catch(() => ko({ error: "error en base de datos"}));
    })
}

export function borrarPost(id){
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

export function editarPosts(id,texto){
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


