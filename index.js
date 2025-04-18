import dotenv from "dotenv";
dotenv.config();//lee el fichero .env y crea las variables de entorno
//---------------------------
import express from "express";



const servidor = express();

servidor.listen(process.env.PORT);