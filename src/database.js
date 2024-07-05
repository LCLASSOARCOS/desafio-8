//database.js

//Nos conectamos a MongoAtlas por medio de mongoose: 
import configObject from "./config/config.js";
import mongoose from "mongoose";

/*
mongoose.connect(configObject.mongo_url)
  .then(()=> console.log("Conectados a la BD!"))
  .catch((error)=> console.log("Tenemos un error vamos a morir :( : ", error))
*/


class BaseDatos {
  static #instancia; 
  //Se declara una variable estatica y privada llamada "instancia". 
  constructor(){
      mongoose.connect(configObject.mongo_url);
  }

  static getInstancia() {
      if(this.#instancia) {
          console.log("Conexion previa");
          return this.#instancia;
      }

      this.#instancia = new BaseDatos(); 
      console.log("Conexion exitosa");
      return this.#instancia;
  }
}

export default BaseDatos.getInstancia();