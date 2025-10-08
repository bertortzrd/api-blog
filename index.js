import dotenv from "dotenv";
dotenv.config();
//----------------------------------
import express from "express";
import cors from "cors";

const servidor = express();

servidor.use(cors());
servidor.use(express.json());

servidor.get("/posts", (pet,res) => {
    res.json([]);
});

servidor.post("/posts/nuevo", (pet,res,siguiente) => {
    let {texto} = pet.body;

    if(texto == undefined || tarea.toString().trim() == ""){
    return siguiente(true);
    }
});

servidor.use((error,pet,res,siguiente) => {
    res.status(400)
    res.json({error: "error en la petición"})
});

servidor.use((pet,res) => {
    res.status(404)
    res.json({error: "recurso no encontrado"})
});

servidor.listen(process.env.PORT);