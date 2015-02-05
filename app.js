// Tela
var canvas = document.getElementById("screen");
var ctx = canvas.getContext("2d"); 

var debug = document.getElementById("debug");
var stepDiv = document.getElementById("step"); 

stepDiv.addEventListener("click", step, false);

var x = 0;

// Memoria Principal
var mem = new Uint8Array(4096);

// Memoria de Video
var gfx = new Uint8Array(64*32);

// Registradores
var V = new Uint8Array(16);

// Input
var keys = new Uint8Array(16);

// Program Counter
var PC = 512;

var stack = new Uint8Array(16);

window.addEventListener("load", function() {  
  loadROM("INVADERS");
});

function step(evt) {
  opcode = (mem[PC] << 8 | mem[PC + 1]);
  debug.innerHTML = "Opcode: " + opcode.toString(16);
  
  switch(opcode & 0xF000)
  {
     case 0x1000:
       console.log("comeca com 1");
       break;
  }
  PC += 2;
}

function loadROM(name)
{
  // Provavelmente existem formas melhores de fazer isso
  var oReq = new XMLHttpRequest();
  oReq.open("GET", "/roms/" + name, true);
  oReq.responseType = "blob";

  oReq.onload = function(oEvent) {
    var blob = oReq.response;
    var reader = new FileReader();
    
    reader.onloadend = function() {
      console.log("ROM Carregada");
      rom = new Uint8Array(reader.result);
      
      for(var i=0; i<rom.length; i++)
      {
        mem[512 + i] = rom[i];
      }
    }
    
    reader.readAsArrayBuffer(blob);
  };
  
  oReq.send();
}

/*
function draw()
{
  x+=1;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillRect(x, 20, 150, 100); 
  window.requestAnimationFrame(draw);
}
*/