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

const PADDLE_ACTIVE_COLOR = 'RED';

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


// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Cliente Websocket (del network engine)

// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

const WEBSOCKET_SERVER = ''; // 'ws:/127.0.0.1:3000'

let socket;


function initServerConnection() {

// Iniciamos la conexión con el servidor de websocket (Motor de Red)

socket = io(WEBSOCKET_SERVER);


// Solicitamos la incorporación del jugador

socket.emit('new player');


// Indicamos cómo antendemos el mensaje de conexión del servidor(Motor de Red)

socket.on('connect', () => {

console.log(`Conexión de ${socket.id}`);

});


// Indicamos cómo actualizar el estado

socket.on('state', update);

}


// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// MOTOR DE JUEGO

// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


// Manejador de Eventos del ratón (handle del ratón) ----------------------------------------------------------------------------------------------------------------------------------------


function initPaddleMovement() {

cvs.addEventListener('mousemove', (event) => {

if (gameState !== gameStateEnum.PLAY) return;


const localPlayer = players[socket.id];

const rect = cvs.getBoundingClientRect();


localPlayer.y = event.clientY - (localPlayer.height / 2) - rect.top;

socket.emit('move player', localPlayer.y);

});

}




const CANVAS_WIDTH = cvs.width;

const CANVAS_HEIGHT = cvs.height;


// GENERIC HELPERS --------------------------------------------------------------------------------------------------------------------------------------------------------------------------


function getRandomDirection() {

return Math.floor(Math.random() * 2) === 0 ? -1 : 1; // Genera de forma aleatoria la dirección de la pelota al inicio del juego

}


function getPlayer(index) {

return players[index];

}


// OBJETOS DEL JUEGO ------------------------------------------------------------------------------------------------------------------------------------------------------------------------


// Declaramos los objetos del juego

let gameState = gameStateEnum.SYNC;

let players = {};

let ball = {};


// // Inicializamos los objetos del juego

// function initGameObjects() {

// players[0] = {

// x: 0,

// y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,

// width: PADDLE_WIDTH,

// height: PADDLE_HEIGHT,

// color: PADDLE_LEFT_COLOR,

// score: 0,

// };


// players[1] = {

// x: CANVAS_WIDTH - PADDLE_WIDTH,

// y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,

// width: PADDLE_WIDTH,

// height: PADDLE_HEIGHT,

// color: PADDLE_RIGHT_COLOR,

// score: 0,

// };


// newBall(true);

// }


// function newBall(init = false) {


// // Si lapelota ya estaba definida (es un tanto), cambiamos de sentido en el eje X

// const directionX = init ? getRandomDirection() : (ball.velocityX > 0 ? -1 : 1);


// ball = {

// x: CANVAS_WIDTH / 2,

// y: CANVAS_HEIGHT / 2,

// radius: BALL_RADIUS,

// speed: BALL_VELOCITY,

// velocityX: BALL_VELOCITY * directionX,

// velocityY: BALL_VELOCITY * getRandomDirection(),

// color: BALL_COLOR

// };

// }


// BUCLE DE JUEGO ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------


// // UPDATE HELPERS


// function collision(b, p) {

// // Calculamos el collider de la pelota (hitbox)

// b.top = b.y - b.radius;

// b.bottom = b.y + b.radius;

// b.left = b.x - b.radius;

// b.right = b.x + b.radius;


// // Calculamos el hitbox de la pala

// p.top = p.y;

// p.bottom = p.y + p.height;

// p.left = p.x;

// p.right = p.x + p.width;


// return b.right > p.left &&

// b.left < p.right &&

// b.bottom > p.top &&

// b.top < p.bottom;

// }


// // IA del juego

// const COMPUTER_LEVEL = 0.1; // hemos puesto 0.1, pero deberíamos probar y probar para ver el rtraso perfecto para que el juego enganche


// function updateNPC() {

// const npc = getPlayer(1);


// npc.y += (ball.y - (npc.y + npc.height / 2)) * COMPUTER_LEVEL; // con el computer level multiplicando, retrasamos la accion de la pala 10 veces, si no estaría a la altura de la pelota instantáneamente y sería imposible de ganar

// }


// function update() {

// // Si no estamos en modo PLAY, saltamos la actualización

// if (gameState !== gameStateEnum.PLAY) return;


// // Actualizar la posición de la pelota

// ball.x += ball.velocityX;

// ball.y += ball.velocityY;


// // AActualizamos la IA

// updateNPC();


// // Si la pelota golpea los laterales del campo... rebotará...

// const ballBottom = ball.y + ball.radius;

// const ballTop = ball.y - ball.radius;


// if (ballBottom > CANVAS_HEIGHT) {

// ball.y = CANVAS_HEIGHT - ball.radius; // Si la pelota va a salirse del tablero por abajo, la ponemos justo encima del borde

// ball.velocityY = -ball.velocityY;

// } else if (ballTop < 0) {

// ball.y = ball.radius; // Si la pelota va a salirse del tablero por encima, la ponemos justo debajo borde

// ball.velocityY = -ball.velocityY;

// }


// // Si la pala golpea la pelota...

// let whatPlayer = (ball.x < CANVAS_WIDTH / 2) ? getPlayer(0) : getPlayer(1);


// if (collision(ball, whatPlayer)) {

// // Calculamos en qué punto (píxel) de la pala ha colisionado: [-p.height/2, p.height/2]

// let collidePoint = ball.y - (whatPlayer.y + whatPlayer.height / 2);


// // Normalizamos el punto de colisión: [-1, 1]

// collidePoint /= whatPlayer.height / 2;


// // Calculamos el ángulo de rebote (en radianes): [-PI/4, PI/4]

// const angleRad = collidePoint * Math.PI / 4;


// const directionX = (ball.x < CANVAS_WIDTH / 2) ? 1 : -1;


// // Calculamos la velocidad (speed) de la pelota en los ejes X e Y

// ball.velocityX = ball.speed * Math.cos(angleRad) * directionX;

// ball.velocityY = ball.speed * Math.sin(angleRad);


// // Incrementamos la velocidad de la pelota cada vez que golpea lapala

// ball.speed += BALL_DELTA_VELOCITY;

// }


// // Si lapelota se sale por alguno de los laterales... tanto!

// const ballLeft = ball.x - ball.radius;

// const ballRight = ball.x + ball.radius;


// if (ballLeft < 0) {

// console.log('Tanto para el jugador de la derecha');

// getPlayer(1).score++;

// newBall();

// } else if (ballRight > CANVAS_WIDTH) {

// console.log('Tanto para el jugador de la izquierda');

// getPlayer(0).score++;

// newBall();

// }

// }


function update(gameObjects) {

players = gameObjects.players;

ball = gameObjects.ball;

gameState = gameObjects.gameState;

players[socket.id].color = PADDLE_ACTIVE_COLOR;

}


function render() {

if (gameState === gameStateEnum.PAUSE) {

drawText('PAUSA', CANVAS_WIDTH / 4, CANVAS_HEIGHT / 2);

return;

};


if (gameState === gameStateEnum.SYNC) {

drawText('Esperando rival...', CANVAS_WIDTH / 4, CANVAS_HEIGHT / 2);

return;

};


if (gameState === gameStateEnum.PLAY) {

drawBoard();

drawScore(players);

for (let id in players) {

drawPaddle(players[id]);

}

drawBall(ball);

};


if (gameState === gameStateEnum.END) {

drawBoard();

drawScore(players);

for (let id in players) {

drawPaddle(players[id]);

}

drawText('GAME OVER', CANVAS_WIDTH / 3, CANVAS_HEIGHT / 2);

};

}


function next() {

// Si ha terminado la partida...

if (gameState === gameStateEnum.END) {

console.log('GAME OVER');

stopGameLoop();

socket.disconnect();

return;

};


// Si ha ganado alguien... terminamos la partida

// if ((getPlayer(0).score >= NUM_BALLS) || (getPlayer(1).score >= NUM_BALLS)) {

// gameState = gameStateEnum.END;

// }

}


// Helpers para gestionar el bucle del juego

let gameLoopId; // identificador del bucle de juego


function gameLoop() {

// update();

render();

next();

}


function initGameLoop() {

gameLoopId = setInterval(gameLoop, 1000 / FRAME_PER_SECOND);

// gameState = gameStateEnum.PLAY;

}


function stopGameLoop() {

clearInterval(gameLoopId);

}


// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Inicialización del Motor del Juego

// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


function init() {

initServerConnection();

drawBoard();

initPaddleMovement();

initGameLoop();

}


// Punto de entrada

init();