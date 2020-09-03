const cvs = document.getElementById("pig");
const ctx = cvs.getContext("2d");

// game vars and const
let frames = 0;
const DEGREE = Math.PI/180;


//Load Images
const sprite = new Image();
sprite.src = "img/sprite.png"
const background = new Image();
background.src = "img/bg.png";
const foreground = new Image();
foreground.src = "img/fg.png";
const piggey = new Image();
piggey.src = "img/pig.png";
const topPipe = new Image();
topPipe.src = "img/pipeNorth.png";
const bottomPipe = new Image();
bottomPipe.src = "img/pipeSouth.png";
// Load sounds
const SCORE_S = new Audio();
SCORE_S.src = "audio/sfx_point.wav";

const FLAP = new Audio();
FLAP.src = "audio/fly.mp3";

const HIT = new Audio();
HIT.src = "audio/die.mp3";

const SWOOSHING = new Audio();
SWOOSHING.src = "audio/sfx_swooshing.wav";

const DIE = new Audio();
DIE.src = "audio/die.mp3";
// GAME STATE
const state = {
  current : 0,
  getReady : 0,
  game : 1,
  over :2

}
//start button
const startBtn = {
  x:120,
  y:263,
  w:83,
  h:29
}
// CONTROL THE game
cvs.addEventListener("click", function(evt){


  switch(state.current) {
    case state.getReady:
        state.current = state.game;
        SWOOSHING.play();
        break;
    case state.game:
        pig.flap();
        FLAP.play();
        break;
    case state.over:

        let rect = cvs.getBoundingClientRect();
        let clickX = evt.clientX - rect.left;
        let clickY = evt.clientY - rect.top;
        if(clickX >= startBtn.x && clickX <= startBtn.x + startBtn.w
        && clickY >= startBtn.y && clickY <= startBtn.y + startBtn.h){
          pipes.reset();
          pig.speedReset();
          score.reset();
          state.current = state.getReady;
        }

        break;
  }

});
document.addEventListener("keydown", function(evt1){


  switch(state.current) {
    case state.getReady:
        state.current = state.game;
        SWOOSHING.play();
        break;
    case state.game:
        pig.flap();
        FLAP.play();
        break;
    case state.over:


          state.current = state.getReady;


        break;
  }

});


//BACKGROUND
const bg = {
  x: 0,
  y: cvs.height - 512,
  w:288,
  h:512,

 draw : function() {
   ctx.drawImage(background,this.x, this.y,this.w,this.h);
    ctx.drawImage(background,this.x+this.w, this.y,this.w,this.h);
 }
}
// fOREGROUND
const fg = {
  x:0,
  y:cvs.height - 100,
  w:306,
  h:99,

  dx:2,

   draw : function() {
      ctx.drawImage(foreground,this.x, this.y,this.w,this.h);
      ctx.drawImage(foreground,this.x + this.w, this.y,this.w,this.h);
      //ctx.drawImage(foreground,0,this.y);
   },

   update : function() {
       if(state.current == state.game){
         this.x = (this.x - this.dx) % (this.w/2);
       }
   }
}

//  PIG
const pig = {
  x: 50,
  y:150,
  w:30,
  h:30,
  speed:0,
  gravity:0.25,
  jump:4.6,
  rotation:0,
  radius: 12,


   draw : function() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.drawImage(piggey,-this.w/2,-this.h/2,);
      ctx.restore();
 },

   flap : function() {
         this.speed = - this.jump;
   },

   update: function() {
     if(state.current == state.getReady){
        this.y = 150;  //reset pig position after game over
        this.rotation = 0 * DEGREE;
    }else {
     this.speed += this.gravity;
     this.y += this.speed;

     if(this.y + this.h/2 >= cvs.height - fg.h) {
       this.y = cvs.height - fg.h - this.h/2;
       if(state.current == state.game) {
         state.current = state.over;
         DIE.play();
       }
     }
     // IF THE SPEED IS GREATER THAN THE JUMP THE BIRD IS FALLING DOWN
     if(this.speed >= this.jump) {
       this.rotation = 60 * DEGREE;
     }else{
       this.rotation = -25 * DEGREE;
     }
   }

 },
 speedReset : function() {
   this.speed = 0;
 }
}

// get readdy msg
const getReady = {
  sX:0,
  sY:228,
  w:173,
  h:50,
  x:cvs.width/2 -173/2,
  y:80,

   draw : function() {
     if(state.current == state.getReady) {
       ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y,this.w,this.h);
   }
  }
}

// GAME OVER MSG
const gameOver = {
  sX:175,
  sY:228,
  w:225,
  h:202,
  x:cvs.width/2 -225/2,
  y:90,

   draw : function() {
     if(state.current == state.over) {
       ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y,this.w,this.h);
     }
  }
}
 // PIPES
 const pipes = {
     position : [],
     w : 50,
     h :400,
     gap :85,
     maxYPos : -150,
     dx : 2,

     draw : function(){
        for(let i = 0; i <this.position.length; i++){
          let p = this.position[i];

          let topYPos = p.y;
          let bottomYPos = p.y + this.h + this.gap;

          //top pipe
          ctx.drawImage(topPipe, p.x, topYPos, this.w, this.h);

          //bottom pipe
          ctx.drawImage(bottomPipe, p.x, bottomYPos, this.w, this.h);
        }
     },

     update : function(){
       if(state.current !== state.game) return;

       if(frames % 100 == 0){
         this.position.push({
           x:cvs.width,
           y:this.maxYPos * (Math.random() + 1)
         });
       }
       for(let i = 0; i< this.position.length; i++){
         let p = this.position[i];


         let bottomPipeYPos = p.y + this.h + this.gap;

         //COLLISION DETECTION
          //TOP PIPE
         if(pig.x + pig.radius > p.x && pig.x - pig.radius < p.x + this.w && pig.y + pig.radius > p.y && pig.y - pig.radius < p.y + this.h){
             state.current = state.over;
             HIT.play();

         }
         // BOTTOM PIPE
         if(pig.x + pig.radius > p.x && pig.x - pig.radius < p.x + this.w && pig.y + pig.radius > bottomPipeYPos && pig.y - pig.radius < bottomPipeYPos + this.h){
             state.current = state.over;
             HIT.play();

         }
          //move pipes to the left
          p.x -= this.dx;
    // if the pipes go beyond canvas ,we delete them from array
         if(p.x + this.w <= 0) {
           this.position.shift();
           score.value += 1;
         SCORE_S.play();
           score.best = Math.max(score.value, score.best);
           localStorage.setItem("best", score.best);
         }
       }
     },
      reset : function() {
        this.position = [];
      }
 }
// SCORE
const score= {
    best : parseInt(localStorage.getItem("best")) || 0,
    value : 0,

    draw : function(){
        ctx.fillStyle = "#ffd8a6";
        ctx.strokeStyle = "#000";

        if(state.current == state.game){
            ctx.lineWidth = 1;
            ctx.font = "35px Teko";
            ctx.fillText(this.value, cvs.width/2, 50);
            ctx.strokeText(this.value, cvs.width/2, 50);


        }else if(state.current == state.over){
            // SCORE VALUE
            ctx.font = "25px Teko";
            ctx.fillText(this.value, 225, 186);
            ctx.strokeText(this.value, 225, 186);

            // BEST SCORE
            ctx.fillText(this.best, 225, 228);
            ctx.strokeText(this.best, 225, 228);
        }
    },

    reset : function(){
        this.value = 0;
    }
}
// DRAW

function draw() {

  ctx.fillRect(0, 0, cvs.width, cvs.height);

  bg.draw();
  pipes.draw();
  fg.draw();
  pig.draw();
  getReady.draw();
  gameOver.draw();
  score.draw();

}

//Update
function update(){
pig.update();
fg.update();
pipes.update();
}
// Loop
function loop() {
  update();
  draw();
  frames++;

  requestAnimationFrame(loop);
}
loop();
