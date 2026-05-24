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

//-------------------------------------------------------------------------------------------------------------------------------
//MOTOR GRÁFICO (GRAPHICS ENGINE) 
//-------------------------------------------------------------------------------------------------------------------------------



//RECUPERAMOS CANVAS
const cvs=document.getElementById('pong_canvas');
const ctx=cvs.getContext('2d');


//LAYER 0:BASIC CANVAS DRAW HELPERS----------------------------------------------------------------------------------------------

function drawRect(x,y,w,h,color){
    ctx.fillStyle =color;
    ctx.fillRect(x,y,w,h);
}

function drawCircle(x,y,r,color){
    ctx.fillStyle =color;
    ctx.beginPath();
    ctx.arc(x,y,r,0,2*Math.PI);
    ctx.closePath();
    ctx.fill();
}

function drawText(text,x,y,color=FONT_COLOR,fontSize=FONT_SIZE, fontFamily=FONT_FAMILY){ //por si no me lo pasan
ctx.fillStyle=color;
ctx.font=`${fontSize} ${fontFamily}`;
ctx.fillText(text,x,y);
}

//drawCircle(60,60,10,'WHITE');
//drawText("Saludos!!",200,200,'BLUE')


//LAYER 1:BASIC PONG HELPERS----------------------------------------------------------------------------------------------

function clearCanvas(){
    drawRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT,'BLACK');
  
}

function drawNet(){
    const net={
        x:CANVAS_WIDTH/2-NET_WIDTH/2,
        y:0,
        width: NET_WIDTH,
        height: NET_HEIGHT,
        padding: NET_PADDING,
        color: NET_COLOR

    };
    for(let i=0; i<=CANVAS_HEIGHT; i+=net.padding){
       drawRect(net.x,net.y+i,net.width, net.height,net.color)
    }
        
}

function drawBoard(){
    clearCanvas();
    drawNet();
}



function drawScore(players){
    for(let id in players){
        drawText(
            players[id].score,
            (players[id].x===0? 1 : 3)*CANVAS_WIDTH/4, //significa que es el de la izquierda
            CANVAS_HEIGHT/5,
            FONT_SCORE_COLOR
        );
    }
}

function drawPaddle(paddle){
    drawRect(paddle.x,paddle.y,paddle.width,paddle.height,paddle.color);
}

function drawBall(ball){
    drawCircle(ball.x,ball.y,ball.radius,ball.color)   
}

//-------------------------------------------------------------------------------------------------------------------------------
//MOTOR DE JUEGO
//-------------------------------------------------------------------------------------------------------------------------------

//Manejador de eventos del ratón (handle del ratón)-------------------------------------------------------------------------------------------
function initPaddleMovement(){
    cvs.addEventListener('mousemove', (event)=>{
        if(gameState !== gameStateEnum.PLAY) return;

        const localPlayer = getPlayer(0);
        const rect = cvs.getBoundingClientRect();

        localPlayer.y = event.clientY - (localPlayer.height/2) - rect.top;
    });
}

const CANVAS_WIDTH=cvs.width;
const CANVAS_HEIGHT=cvs.height;

//GENERIC HELPERS-----------------------------------------------------------------------------------------------------------------------------

function getRandomDirection(){
    return Math.floor(Math.random()*2) === 0 ? -1 : 1;
}

function getPlayer(index){
    return players[index];
}

//---OBJETOS DEL JUEGO-------------------------------------------------------------------------------------------------------------------------------
//Declaramos los objetos del juego

let gameState=gameStateEnum.SYNC;
let players={};
let ball={}; 

function initGameObjects(){
  //Inicializamos los objetos del juego
    players[0]={
        x:0,
        y:CANVAS_HEIGHT/2-PADDLE_HEIGHT/2, //para que saque la pala en el medio
        width:PADDLE_WIDTH,
        height:PADDLE_HEIGHT,
        color:PADDLE_LEFT_COLOR,
        score:0
    };

    players[1]={
        x:CANVAS_WIDTH-PADDLE_WIDTH, //ESTA A LA DERECHE
        y:CANVAS_HEIGHT/2-PADDLE_HEIGHT/2, //para que saque la pala en el medio
        width:PADDLE_WIDTH,
        height:PADDLE_HEIGHT,
        color:PADDLE_RIGHT_COLOR,
        score:0
    };

    newBall(true);
  
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
const COMPUTER_LEVEL = 0.1;

function updateNPC(){
    const npc = getPlayer(1);

    npc.y += (ball.y - (npc.y + npc.height/2))*COMPUTER_LEVEL;
}

function update(){
    // Si no estamos en modo PLAY saltamos la actualizacion
    if(gameState !== gameStateEnum.PLAY) return;

    // Actualizar la posición de la pelota
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    // Actualizamos la IA
    updateNPC();

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
    }else if(ball < CANVAS_WIDTH){
        console.log('Tanto para el jugador de la izquierda');
        getPlayer(0).score++;
        newBall();
    }
}

function render(){
    if(gameState===gameStateEnum.PAUSE){
        drawText('PAUSA', CANVAS_WIDTH/4, CANVAS_HEIGHT/2);
        return;
    }
    if(gameState===gameStateEnum.SYNC){
        drawText('Esperando rival....', CANVAS_WIDTH/4, CANVAS_HEIGHT/2);
        return;
    }
    if(gameState===gameStateEnum.PLAY){
        drawBoard();
        drawScore(players);
        for(let id in [0,1]){
            drawPaddle(getPlayer(id));
        };
        drawBall(ball);
    }
    if(gameState===gameStateEnum.END){
        drawBoard();
        drawScore(players);
        for(let id in [0,1]){
            drawPaddle(getPlayer(id));
        };
        drawText('GAME OVER', CANVAS_WIDTH/4, CANVAS_HEIGHT/2);
    }
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
    }
}


//Helpers para gestionar el bucle del juego
let gameLoopID; //identificador del bucle del uego
function gameLoop(){
    update();
    render();
    next();
}

function initGameLoop(){
    gameLoopID = setInterval(gameLoop,1000/FRAME_PER_SECOND); //lo llama mil veces por segundo
    gameState= gameStateEnum.PLAY;
}

function stopGameLoop(){
    clearInterval(gameLoopID);
}

//--------------------------------------------------------------------------------------------------------------------
//Inicialización del motor de juego
//--------------------------------------------------------------------------------------------------------------------

function init(){
    initGameObjects();
    drawBoard();
    initPaddleMovement();
    initGameLoop();
}

//PUNTO DE ENTRADA
init();