import dotenv from "dotenv";
dotenv.config();
//----------------------------------
import express from "express";
import { crearPost, leerPosts, borrarPost, editarPosts } from "./datos.js";
import cors from "cors";

const servidor = express();

servidor.use(cors());
servidor.use(express.json());

//BORRAR LUEGO
servidor.use((pet,res,siguiente) => {
    pet.usuario = 1;
    siguiente();
});

servidor.get("/posts", async (pet,res) => {
    try{
        let posts = await leerPosts(pet.usuario);
        res.json(posts);
    }catch(error){
        res.status(500);
        res.json({error: "error en el servidor"})
    }
});

servidor.post("/posts/nuevo", async (pet,res,siguiente) => {
    let {texto} = pet.body;

    if(texto == undefined || texto.toString().trim() == ""){
    return siguiente(true);
    }

    try{
        let id = await crearPost(texto,pet.usuario);
        res.json({id});
    }catch(error){
        res.status(500);
        res.json({error: "error en el servidor"})
    }
});

servidor.delete("/posts/borrar/:id", async (pet,res,siguiente) => {
    let id = Number(pet.params.id);

    if(!id){
        return siguiente();
    }

    try{
        let realizado = await borrarPost(id);
        if(!realizado){
            return siguiente();
        }
        res.sendStatus(204);
    }catch(error){
        res.status(500);
        res.json({error: "error en el servidor"})
    }
});

servidor.put("/posts/editar/texto/:id", async (pet,res,siguiente) => {
    let id = Number(pet.params.id);
    let {texto} = pet.body;

    if(texto == undefined || texto.toString().trim() == "" ){
        return siguiente(true);
    }else if(!id){
        return siguiente();
    }

    try{
        let editado = await editarPosts(id,texto)
        if(!editado){
            return siguiente();
        }
        res.sendStatus(204);
    }catch(error){
        res.status(500);
        res.json({error: "error en el servidor"})
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