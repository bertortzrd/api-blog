//import dotenv from "dotenv";
//dotenv.config();
//----------------------------------
import express from "express";
import cors from "cors";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { buscarUsuario, crearUsuario, crearPost, leerPosts, borrarPost, editarPosts } from "./datos.js";

function autorizar(pet,res,siguiente){

    if(!pet.headers.authorization) return res.sendStatus(401);   

    let token = pet.headers.authorization.split(" ")[1];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, process.env.SECRET, (error,datos) => {
        if(!error){
            pet.usuario = datos.id;
            return siguiente();
        }
        res.sendStatus(401);
    });
};

const servidor = express();

servidor.use(cors());
servidor.use(express.json());

servidor.post("/registro", async (pet,res,siguiente) => {
    let {usuario,password} = pet.body;

    if(usuario == undefined || 
        usuario.toString().trim() == "" ||
        password == undefined || 
        password.toString().trim() == "" )
    {
    return siguiente(true);
    }

    try{
        let existe = await buscarUsuario(usuario);
        if(existe){
            res.status(409);
            res.json({error: "el usuario ya existe"});
        }

        let hash = await bcrypt.hash(password,10);
        let id = await crearUsuario(usuario,hash);
        res.status(201);
        res.json({id, usuario});
    }catch(error){
        res.status(500);
        res.json({error: "error en el servidor"})
    }    
});


servidor.post("/login", async (pet,res,siguiente) => {
    let {usuario,password} = pet.body;

    if(usuario == undefined || 
        usuario.toString().trim() == "" ||
        password == undefined || 
        password.toString().trim() == "" )
    {
    return siguiente(true);
    }

    try{
        let datos = await buscarUsuario(usuario);
        if(!datos){
            return res.sendStatus(401);
        }

        let valido = await bcrypt.compare(password,datos.password);
        if(!valido){
            return res.sendStatus(403);
        }

        let token = jwt.sign({ id: datos.id }, process.env.SECRET)
        res.json({token});
    }catch(error){
        res.status(500);
        res.json({error: "error en el servidor"})
    }    
});


servidor.use(autorizar);

servidor.get("/posts", async (pet,res) => {
    // leerPosts devuelve todos los posts de todos los usuarios
    try{
        let posts = await leerPosts(); //sin filtrar por pet.usuario
        if(!Array.isArray(posts)) posts = []  // para garantizar que sea un array
        res.json(posts);
    }catch(error){
        res.status(500);
        res.json({error: "error en el servidor"})
    }
});

servidor.post("/posts/nuevo", async (pet,res,siguiente) => {

    let {texto} = pet.body;

    if(texto == undefined || texto.toString().trim() == ""){
    return siguiente(true); //validación para que no esté vacío
    }

    try{
        let id = await crearPost(texto,pet.usuario);
        res.json({id});
    }catch(error){
        console.error("Error en crearPost:", error);
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