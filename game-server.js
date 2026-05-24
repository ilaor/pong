'use strict'

// ------------------------------------------------------------------------------------------------
// SERVIDOR JUEGO
// ------------------------------------------------------------------------------------------------

//Incluimos bibliotecas
const express = require('express');
const { dirname } = require('path');
const app = express();
const server = require('http').createServer(app);

const port = process.env.PORT || 3000 ;

// Servidor web -----------------------------------------------------------------------------------

// Iniciamos servidor HTTP para proporcionar la interfaz del juego
function initWebServer(){
    //Configuramos carpeta pública
    app.use(express.static(__dirname+'/public'));

    // Indicar página por defecto
    app.get('/', (req, res) =>{
        res.sendFile(__dirname + 'index.html');
    });

    // Lanzamos el servidor web
    server.listen(port, ()=>{
        console.log(`Game Server running on port ${port}`); 
    })
}

// ------------------------------------------------------------------------------------------------
// Inicialización del servidor de Juego:  Servidor Web
// ------------------------------------------------------------------------------------------------

initWebServer();