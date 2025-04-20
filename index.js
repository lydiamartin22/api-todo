import dotenv from "dotenv";
dotenv.config();//lee el fichero .env y crea las variables de entorno
//-------------
import express from "express";
import { leerTareas,crearTarea,borrarTarea,editarTarea,editarEstado } from "./db.js";

const servidor = express();


servidor.use(express.json());

if(process.env.PRUEBAS){
    servidor.use(express.static("./pruebas"));
}

servidor.get("/tareas", async (peticion,respuesta) => {
    try{
        let tareas = await leerTareas();

        respuesta.json(tareas);

    }catch(error){

        respuesta.status(500);

        respuesta.json({ error : "error en el servidor" });

    }
});

servidor.post("/tareas/nueva", async (peticion,respuesta,siguiente) => {
    
    let {tarea} = peticion.body;

    if(!tarea || tarea.trim() == ""){
        return siguiente(true);
    }

    try{

        let id = await crearTarea(tarea);

        respuesta.json({id});

    }catch(error){
        respuesta.status(500);

        respuesta.json({ error : "error en el servidor" });
    }
    
});

servidor.delete("/tareas/borrar/:id([0-9]+)", async (peticion,respuesta) => {
    try{

        let id = Number(peticion.params.id);

        let cantidad = await borrarTarea(id);

        respuesta.json({ resultado : cantidad ? "ok" : "ko" });

    }catch(error){
        respuesta.status(500);

        respuesta.json({ error : "error en el servidor" });
    }
});

servidor.put("/tareas/actualizar/:id([0-9]+)/:operacion(1|2)", async (peticion,respuesta,siguiente) => {
    let operacion = Number(peticion.params.operacion);
    let id = Number(peticion.params.id);
    let {tarea} = peticion.body;

    let operaciones = [editarTarea,editarEstado];

    if(operacion == 1 && (!tarea || tarea.trim() == "")){
        return siguiente(true);
    }

    try{

        let cantidad = await operaciones[operacion - 1](id,tarea);//clever code

        respuesta.json({ resultado : cantidad ? "ok" : "ko" });

    }catch(error){
        respuesta.status(500);

        respuesta.json({ error : "error en el servidor" });
    }
    
});


servidor.use((error,peticion,respuesta,siguiente) => {
    respuesta.status(400);
    respuesta.json({ error : "error en la petición" });
});

servidor.use((peticion,respuesta) => {
    respuesta.status(404);
    respuesta.json({ error : "recurso no encontrado" });
});


servidor.listen(process.env.PORT);