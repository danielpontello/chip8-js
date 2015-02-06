// Tela
var canvas = document.getElementById("screen");
var ctx = canvas.getContext("2d"); 

var debug = document.getElementById("debug");
var stepDiv = document.getElementById("step"); 
var runDiv = document.getElementById("run"); 
var stopDiv = document.getElementById("stop"); 

stepDiv.addEventListener("click", step, false);
runDiv.addEventListener("click", run, false);
stopDiv.addEventListener("click", stop, false);

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

// Instruction Pointer
var I = 0;

// Stack
var stack = new Uint8Array(16);
var SP = 0;

function stack_push(value)
{
  stack[SP] = value;
  SP++;
}

function stack_pop()
{
  SP--;
  value = stack[SP]
  return value;
}

// Delay Timers
var delay_timer = 0;
var sound_timer = 0;

// Default Font
var chip8Font = [
  0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
  0x20, 0x60, 0x20, 0x20, 0x70, // 1
  0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
  0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
  0x90, 0x90, 0xF0, 0x10, 0x10, // 4
  0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
  0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
  0xF0, 0x10, 0x20, 0x40, 0x40, // 7
  0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
  0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
  0xF0, 0x90, 0xF0, 0x90, 0x90, // A
  0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
  0xF0, 0x80, 0x80, 0x80, 0xF0, // C
  0xE0, 0x90, 0x90, 0x90, 0xE0, // D
  0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
  0xF0, 0x80, 0xF0, 0x80, 0x80  // F
];

// Run flag
var running = false;

window.addEventListener("load", function() {  
  loadROM("INVADERS");
  init();
});

function init()
{
  for(var i = 0; i<V.length; i++)
  {
    V[i] = 0;
  }
  
  for(var i = 0; i<gfx.length; i++)
  {
    gfx[i] = 0;
  }
  
  for(var i = 0; i<chip8Font.length; i++)
  {
    mem[i] = chip8Font[i];
  }
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
        init();
        mem[512 + i] = rom[i];
      }
    }
    
    reader.readAsArrayBuffer(blob);
  };
  
  oReq.send();
}

function step() {
  opcode = (mem[PC] << 8 | mem[PC + 1]);
  debug.innerHTML = "Opcode: " + opcode.toString(16);
  
  if (delay_timer > 0)
  {
   delay_timer--;
  }
  
  switch(opcode & 0xF000)
  {
    case 0x0000:
      switch (opcode & 0x000F)
      {
        case 0x0000:
          for(var i = 0; i<gfx.length; i++)
          {
            gfx[i] = 0;
          }
          PC += 2;
          break;
          
        case 0x000E:
          PC = stack_pop();
          PC += 2;
          break;
          
        default:
          break;
      }
      break;
      
    case 0x1000:
      PC = opcode & 0x0FFF;
      break;
      
    case 0x2000:
      stack_push(PC);
      PC = opcode & 0x0FFF;
      break;
      
    case 0x3000:
      if(V[(opcode & 0x0F00) >> 8] == (opcode & 0x00FF))
      {
        PC += 4;
      } else {
        PC += 2;
      }
      break;
      
    case 0x4000:
      if(V[(opcode & 0x0F00) >> 8] != (opcode & 0x00FF))
      {
        PC += 4;
      } else {
        PC += 2;
      }
      break;
      
    case 0x5000:
      if(V[(opcode & 0x0F00) >> 8] == V[(opcode & 0x00F0) >> 4])
      {
        PC += 4;
      } else {
        PC += 2;
      }
      break;
      
    case 0x6000:
      V[(opcode & 0x0F00) >> 8] = opcode & 0x00FF;
      PC += 2;
      break;
      
    case 0x7000:
      V[(opcode & 0x0F00) >> 8] += opcode & 0x00FF;
      PC += 2;
      break;
      
    case 0x8000:
      switch(opcode & 0x000F)
      {
        case 0x0000:
          V[(opcode & 0x0F00) >> 8] = V[(opcode & 0x00F0) >> 4];
          PC += 2;
          break;
        
        case 0x0001:
          V[(opcode & 0x0F00) >> 8] |= V[(opcode & 0x00F0) >> 4];
          PC += 2;
          break;
          
        case 0x0002:
          V[(opcode & 0x0F00) >> 8] &= V[(opcode & 0x00F0) >> 4];
          PC += 2;
          break;
          
        case 0x0003:
          V[(opcode & 0x0F00) >> 8] ^= V[(opcode & 0x00F0) >> 4];
          PC += 2;
          break;
          
        case 0x0004:
          if((V[(opcode & 0x0F00) >> 8] + V[(opcode & 0x00F0) >> 4]) > 10)
          {
            V[0xF] = 1;
          } else {
            V[0xF] = 0;
          }
          PC += 2;
          break;
          
        case 0x0005:
          if (V[(opcode & 0x00F0) >> 4] > V[(opcode & 0x0F00) >> 8])
          {
           V[0xF] = 0;
          }
          else
          {
           V[0xF] = 1;
          }
          V[(opcode & 0x0F00) >> 8] -= V[(opcode & 0x00F0) >> 4];
          PC += 2;
          break;
          
        case 0x0006:
          V[0xF] = V[(opcode & 0x0F00) >> 8] & 0x1;
          V[(opcode & 0x0F00) >> 8] = V[(opcode & 0x0F00) >> 8] >> 1;
          PC += 2;
          break;
          
        case 0x000E:
          V[0xF] = v[(opcode & 0x0F00) >> 8] & 0x80 >> 7;
          V[(opcode & 0x0F00) >> 8] = V[(opcode & 0x0F00) >> 8] << 1;
          PC += 2;
          break;
      }
      break;
      
    case 0x9000:
      if(V[(opcode & 0x0F00) >> 8] != V[(opcode & 0x00F0) >> 4])
      {
        PC += 4;
      } else {
        PC += 2;
      }
      break;
      
    case 0xA000:
      I = opcode & 0x0FFF;
      PC += 2;
      break;
      
    case 0xC000:
      V[(opcode & 0x0F00) >> 8] = Math.floor(Math.random() * 0xFF);
      PC += 2;
      break;
      
    case 0xD000:
      var x = V[(opcode & 0x0F00) >> 8];
      var y = V[(opcode & 0x00F0) >> 4];
      var height = opcode & 0x000F;
      var pixel;
      
      V[0xF] = 0;
      
      for(var _y = 0; _y < height; _y++)
      {
        pixel = mem[I + _y];
        for(var _x = 0; _x < 8; _x++)
        {
          if((pixel & (0x80 >> _x)) != 0)
          {
            if (gfx[(x + _x + ((y + _y) * 64))] == 1)
            {
             V[0xF] = 1;
            }
          gfx[x + _x + ((y + _y) * 64)] ^= 1;
          }
        }
      }
      PC += 2;
      break;
      
    case 0xE000:
      switch(opcode & 0x000F)
      {
        case 0x000E:
          console.log("INPUT: Opcode não implementado!");
          PC += 2;
          break;
          
        case 0x0001:
          console.log("INPUT: Opcode não implementado!");
          PC += 2;
          break;
      }
      break;
      
    case 0xF000:
      switch(opcode & 0x00FF)
      {
        case 0x0007:
          V[(opcode & 0x0F00) >> 8] = delay_timer;
          PC += 2;
          break;
          
        case 0x000A:
          console.log("INPUT: Opcode não implementado!");
          break;
          
        case 0x0015:
          delay_timer = V[(opcode & 0x0F00) >> 8];
          PC += 2;
          break;
          
        case 0x0018:
          delay_timer = V[(opcode & 0x0F00) >> 8];
          PC += 2;
          break;
          
        case 0x001E:
          if(I + V[(opcode & 0x0F00) >> 8] > 0xFFF)
          {
            V[0xF] = 1;
          } else {
            V[0xF0] = 0;
          }
          I += V[(opcode & 0x0F00) >> 8];
          PC += 2;
          break;
          
        case 0x0029:
          I = V[(opcode & 0x0F00) >> 8] * 5;
          PC += 2;
          break;
          
        case 0x0033:
          mem[i] = V[(opcode & 0x0F00) >> 8] / 100;
          mem[i+1] = (V[(opcode & 0x0F00) >> 8] / 10) % 10;
          mem[i+2] = (V[(opcode & 0x0F00) >> 8] % 100) % 10;
          PC += 2;
          break;
          
        case 0x0055:
          for (var j = 0; j <= ((opcode & 0x0F00) >> 8); j++)
          {
            mem[i + j] = V[j];
          }
            I += ((opcode & 0x0F00) >> 8) + 1;
            PC += 2;
          break;
          
        case 0x0065:
          for (var j = 0; j <= ((opcode & 0x0F00) >> 8); j++)
          {
            V[j] = mem[i + j];
          }
          I += ((opcode & 0x0F00) >> 8) + 1;
          PC += 2;
          break;
      }
      break;
      
    default:
      console.log("Opcode: " + opcode.toString(16) + " não implementado!");
      break;
  }
}


function run()
{
  step();
  draw();
  window.requestAnimationFrame(run);
}

function draw() 
{
  console.log("draw");
  for(var k=0; k<gfx.length; k++)
    {
      var Y = Math.floor(k/64);
      var X = Math.floor(k - (Y * 64));
      
      if(gfx[k] == 1)
      {
        ctx.fillRect(X*2, Y*2, 2, 2);
      }
    }
}

function stop()
{
  running = false;
}