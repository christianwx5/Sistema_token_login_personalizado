'use strict';

const lodash = require('lodash');
const uuidv4 = require('uuid').v4;

const express = require('express');

const app = express();
app.use(express.json());

let UsersDB = [{}], ult_user=0;
let ItemDB = [{}], ult_item=0;
let token = Array.from(Array(5000), () => new Array(2)), user_id_online;
let ult_token = 0;

// Your code starts here.
// Placeholders for all requests are provided for your convenience.

app.post('/api/user', (req, res) => {
  try {
      
      if (JSON.stringify(req.body)=="{}"){
        return res.status(400).json({message: "vacio"});
      }

      UsersDB[ult_user] = req.body;
      ult_user++;

      return res.status(201).json({message: "creado", object: UsersDB[ult_user -1]});
    
  }catch (error) {
    return res.status(500).json({error: error});
  }
})

app.post('/api/authenticate', (req, res) => {
  try {

    if (JSON.stringify(req.body)=="{}"){
      return res.status(400).json({message: "vacio"});
    }

    //busqueda de usuario name
    let boolFind = false, id = -1;
    for (let i =0; i<ult_user;i++){
      if (req.body.login==UsersDB[i].login){
        boolFind = true;
        id = i;
      }
    }
    
    
    
    //SI el usuario no se encontro
    if (!boolFind){
      return res.status(404).json({message: "Usuario no encontrado"});
    }

    //Si la contraseña dle usuario no es correcta
    if (req.body.password!=UsersDB[id].password){
      return res.status(401).json({message: "La contraseña es incorrecta"});
    }
    
    //Convertir los valores del segundo vector del arreglo en un objeto {token, user_id} <<<-------<
    token[ult_token].token = uuidv4(); //<<<------------
    token[ult_token].user_id = UsersDB[id].user_id;

    
    return res.status(200).json({token : token[ult_token++].token});

    
    console.log("Ha iniciando sesion correctamente");

  } catch (error) {
    console.error(error);
  }
})

function check_token (req_token) {
  let i = 0;
  for ( ;i<token.length; i++) {
    if (token[i].token==req_token){
      return {value: true, index: i};
    }
  }

  return {value: false, index: i};
}

app.post('/api/logout', (req, res) => {
  let token_finded = check_token(req.headers.authentication);
  if (!(token_finded.value) || req.headers.authentication=="") {
    return res.status(401).json({message: "token invalido"});
  }else {
    token[token_finded.index].token = "";
    return res.status(401).json({message: "Se ha desconectado correctamente"});
  }
})

app.post('/api/articles', (req, res) => {
  //visibility: 'public' | 'private' | 'logged_in'
  
  if (JSON.stringify(req.body)=="{}"){
    return res.status(400).json({message: "vacio"});
  }

  if (!(check_token(req.headers.authentication).value) || req.headers.authentication=="") {
    return res.status(401).json({message: "token invalido"});
  }

  ItemDB[ult_item] = req.body;
  ItemDB[ult_item].user_id = check_token(req.headers.authentication).index;
  ult_item++;
  
  return res.status(201).json({message: "Se ha registrado el articulo correctamente"});
  
})

app.get('/api/articles', (req, res) => {
  if (!(check_token(req.headers.authentication).value)) {
    return res.status(401).json({message: "token invalido"});
  }
  try {
    //si el token es valido
    if (check_token(req.headers.authentication).value && !(req.headers.authentication=="")) {
      
      let e = 0;
      let itemsConsulta = []; 
      for (let i = 0; i < ItemDB.length; i++) {
        if (ItemDB[i].visibility=="public" || ItemDB[i].visibility=="logged_in" || ItemDB[i].user_id==check_token(req.headers.authentication).index) 
        {
          itemsConsulta[e] = ItemDB[i];
          e++;
          console.log("num T "+e);
        }
      }
      return res.status(200).json(itemsConsulta);
    }else {

      //si el token no es valido
      let e = 0;
      let itemsConsulta = []; 
      for (let i = 0; i < ItemDB.length; i++) {
        if (ItemDB[i].visibility=="public") 
        {
          itemsConsulta[e] = ItemDB[i];
          e++;
          console.log("num S "+e);
        }
      }
      return res.status(200).json(itemsConsulta);
    }

    

    if (!(token==req.headers.authentication)) {
      return res.status(401).json({message: "token invalido"});
    }
  } catch (error) {
    console.error(error);
  }

})

exports.default = app.listen(process.env.HTTP_PORT || 3000, ()=> {
    console.log("The app is running...");
})