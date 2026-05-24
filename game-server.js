'use strict'

// Constantes básicas del juego
const FRAME_PER_SECOND = 50;

const NUM_BALLS = 5;

const BG_COLOR = 'BLACK';

const FONT_COLOR = 'GREEN';
const FONT_SCORE_COLOR = 'WHITE';
const FONT_GAME_OVER_COLOR = 'BLUE';
const FONT_FAMILY = 'impact';
const FONT_SIZE = '45px';

const NET_COLOR = 'WHITE';
const NET_WIDTH = 4;
const NET_HEIGHT = 10;
const NET_PADDING = 15;

const PADDLE_RIGHT_COLOR = 'WHITE';
const PADDLE_LEFT_COLOR = 'WHITE';
const PADDLE_WIDTH = 20;
const PADDLE_HEIGHT = 100;

const BALL_COLOR = 'WHITE';
const BALL_RADIUS = 10;
const BALL_DELTA_VELOCITY = 0.5;
const BALL_VELOCITY = 5;

const gameStateEnum = {
    SYNC: 0,
    PLAY: 1,
    PAUSE: 2,
    END: 3,
};

const { Socket } = require('dgram');
// ------------------------------------------------------------------------------------------------
// SERVIDOR JUEGO: Servidor Web + Servidor de Socket
// ------------------------------------------------------------------------------------------------

//Incluimos bibliotecas
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

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

// Servidor WebSocket: Motor de Red -----------------------------------------------------------------------------------

// Inicializamos el servidor de Websockets sobre el servidor http
function initNetworkEngine(){
    //Definimos la interacción con el Motor del juego 

    io.on('connection', (socket)=>{
        console.log(`Nuevo jugador que quiere entrar: ${socket.id}`);

        socket.on('new player', ()=>{
            // Calcular número de jugadores que hay actualmente a partir del objeto players
            const numberOfPlayers = Object.keys(players).length;

            // Atendemos el evento
            onNewPlayer(socket, numberOfPlayers);
        })

        socket.on('move player', (data)=>{
            let player = players[socket.id];
            player.y = data;
        })
    })
}

function sendStatus(){
    io.emit('state', {players, ball, gameState});
}

//-------------------------------------------------------------------------------------------------------------------------------
//MOTOR DE RED (NETWORK ENGINE)
//-------------------------------------------------------------------------------------------------------------------------------

const CANVAS_WIDTH=600;
const CANVAS_HEIGHT=400;

//GENERIC HELPERS-----------------------------------------------------------------------------------------------------------------------------

function getRandomDirection(){
    return Math.floor(Math.random()*2) === 0 ? -1 : 1;
}

function getPlayer(index){
    return Object.values(players).find(player =>
        (index === 0 && player.x === 0) || (index !== 0 && player.x !== 0)
    );
}

//---OBJETOS DEL JUEGO-------------------------------------------------------------------------------------------------------------------------------
//Declaramos los objetos del juego

let gameState=gameStateEnum.SYNC;
let players={};
let ball={}; 

function onNewPlayer(){

    if(numberOfPlayers===0){
        players[socket.id]={
            x:0,
            y:CANVAS_HEIGHT/2-PADDLE_HEIGHT/2, //para que saque la pala en el medio
            width:PADDLE_WIDTH,
            height:PADDLE_HEIGHT,
            color:PADDLE_LEFT_COLOR,
            score:0
        };
        console.log(`Dando de alta al jugador A con índice ${numberOfPlayers}-${socket.id}`);
    }

    if(numberOfPlayers===1){
        players[socket.id]={
            x:CANVAS_WIDTH-PADDLE_WIDTH, //ESTA A LA DERECHE
            y:CANVAS_HEIGHT/2-PADDLE_HEIGHT/2, //para que saque la pala en el medio
            width:PADDLE_WIDTH,
            height:PADDLE_HEIGHT,
            color:PADDLE_RIGHT_COLOR,
            score:0
        };
        console.log(`Dando de alta al jugador B con índice ${numberOfPlayers}-${socket.id}`);
        console.log(`Ya hay dos jugadores...`);
        console.log(`Generando una pelota nueva...`);
        newBall(true);

        console.log(`Generando bucle de juego...`);
        initGameLoop();
    }

    if(numberOfPlayers>=2){
        console.log(`Demasiados jugadores, espere su turno`);
        socket.disconnect();
    }
}

function newBall(init = false){
    
    //Si la pelota ya estaba definida (es un tanto) cambiamos de sentido en ejeX
    const directionX = init ? getRandomDirection() : (ball.velocityX > 0 ? -1 : 1);
    
    ball={
        x:CANVAS_WIDTH/2, 
        y:CANVAS_HEIGHT/2, 
        radius:BALL_RADIUS,
        speed:BALL_VELOCITY,
        velocityX:BALL_VELOCITY * directionX,
        velocityY:BALL_VELOCITY * getRandomDirection(),
        color:BALL_COLOR,
    
    };
}

//---BUCLE DEL JUEGO-------------------------------------------------------------------------------------------------------------------------------

//UPDATE HELPERS 

function collision(b,p){
    //Calculamos el collider de la pelota (hitbox)
    b.top = b.y - b.radius;
    b.bottom = b.y + b.radius;
    b.left = b.x - b.radius;
    b.right = b.x + b.radius;

    //Calculamos hitbox de la pala
    p.top = p.y;
    p.bottom = p.y + p.height;
    p.left = p.x;
    p.right = p.x + p.width;

    return b.right > p.left  &&  b.left < p.right
        && b.bottom > p.top  && b.top < p.bottom; 
}


// IA DEL JUEGO 
// const COMPUTER_LEVEL = 0.1;

// function updateNPC(){
//     const npc = getPlayer(1);

//     npc.y += (ball.y - (npc.y + npc.height/2))*COMPUTER_LEVEL;
// }

function update(){
    // Si no estamos en modo PLAY saltamos la actualizacion
    if(gameState !== gameStateEnum.PLAY) return;

    // Actualizar la posición de la pelota
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    // Actualizamos la IA
    //updateNPC();

    // Si la pelota toca los laterales del campo... rebotará
    const ballBottom = ball.y + ball.radius;
    const ballTop = ball.y - ball.radius;

    if(ballBottom > CANVAS_HEIGHT){
        ball.y = CANVAS_HEIGHT - ball.radius;
        ball.velocityY = -ball.velocityY;
    } else if(ballTop < 0){
        ball.y = ball.radius;
        ball.velocityY = -ball.velocityY;
    } 

    // Si la pala golpea la pelota...
    let whatPlayer = (ball.x < CANVAS_WIDTH/2) ? getPlayer(0) : getPlayer(1);

    if(collision(ball, whatPlayer)) {
        //Calculamos en qué punto (píxel) de la pala ha colisionado: [-p.height/2, p.height/2] 
        let collidePoint = ball.y - (whatPlayer.y + whatPlayer.height/2);

        //Normalizamos el punto de colisión: [-1,1]
        collidePoint /= whatPlayer.height/2;;

        //Calculamos el ángulo de rebote en radianes:
        const angleRad = collidePoint * Math.PI/4;

        const directionX = (ball.x < CANVAS_WIDTH/2) ? 1 : -1 ;

        //Calculamos la velocidad (speed) de la pelota en los ejes X e Y
        ball.velocityX = ball.speed * Math.cos(angleRad) * directionX;
        ball.velocityY = ball.speed * Math.sin(angleRad);

        //Incrementamos la velocidad de la pelota cada vez que golpea la pala
        ball.speed += BALL_DELTA_VELOCITY;
    }

    const ballLeft = ball.x - ball.radius;
    const ballRight = ball.x + ball.radius;

    if(ballLeft < 0) {
        console.log('Tanto para el jugador de la derecha');
        getPlayer(1).score++;
        newBall();
    }else if(ballRight > CANVAS_WIDTH){
        console.log('Tanto para el jugador de la izquierda');
        getPlayer(0).score++;
        newBall();
    }

    sendStatus();
}

function next(){
    //Si ha terminado la partida
    if(gameState === gameStateEnum.END){
        console.log('Game Over')
        stopGameLoop();
        return;
    };

    //Si ha ganado alguien... terminamos la partida
    if((getPlayer(0).score>=NUM_BALLS) || (getPlayer(1).score>=NUM_BALLS) ){
        gameState = gameStateEnum.END;
        sendStatus();
    }
}


//Helpers para gestionar el bucle del juego
let gameLoopID; //identificador del bucle del uego
function gameLoop(){
    update();
    // render();
    next();
}

function initGameLoop(){
    gameLoopID = setInterval(gameLoop,1000/FRAME_PER_SECOND); //lo llama mil veces por segundo
    gameState= gameStateEnum.PLAY;
    sendStatus();
}

function stopGameLoop(){
    clearInterval(gameLoopID);
}


// ------------------------------------------------------------------------------------------------
// Inicialización del servidor de Juego:  Servidor Web + Servidor WebSockets
// ------------------------------------------------------------------------------------------------
function init(){
    initWebServer();
    initNetworkEngine();
}


// Punto de entrada al Servidor
init();