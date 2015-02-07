// Tela
var canvas = document.getElementById("screen");
var ctx = canvas.getContext("2d"); 

// Botões
var runDiv = document.getElementById("run"); 
var selectDiv = document.getElementById("select"); 
var debug = document.getElementById("debug");
var games = document.getElementById("games");
var lblJogos = document.getElementById("lblJogos");

runDiv.addEventListener("click", select, false);
selectDiv.addEventListener("click", chooser, false);

var k0 = document.getElementById("k0");
var k1 = document.getElementById("k1");
var k2 = document.getElementById("k2");
var k3 = document.getElementById("k3");
var k4 = document.getElementById("k4");
var k5 = document.getElementById("k5");
var k6 = document.getElementById("k6");
var k7 = document.getElementById("k7");
var k8 = document.getElementById("k8");
var k9 = document.getElementById("k9");
var ka = document.getElementById("ka");
var kb = document.getElementById("kb");
var kc = document.getElementById("kc");
var kd = document.getElementById("kd");
var ke = document.getElementById("ke");
var kf = document.getElementById("kf");

k0.addEventListener("click", press_k0, false);
k1.addEventListener("click", press_k1, false);
k2.addEventListener("click", press_k2, false);
k3.addEventListener("click", press_k3, false);
k4.addEventListener("click", press_k4, false);
k5.addEventListener("click", press_k5, false);
k6.addEventListener("click", press_k6, false);
k7.addEventListener("click", press_k7, false);
k8.addEventListener("click", press_k8, false);
k9.addEventListener("click", press_k9, false);
ka.addEventListener("click", press_ka, false);
kb.addEventListener("click", press_kb, false);
kc.addEventListener("click", press_kc, false);
kd.addEventListener("click", press_kd, false);
ke.addEventListener("click", press_ke, false);
kf.addEventListener("click", press_kf, false);

function press_k0() {
  keys[0] = true;
}

function press_k1() {
  keys[1] = true;
}

function press_k2() {
  keys[2] = true;
}

function press_k3() {
  keys[3] = true;
}

function press_k4() {
  keys[4] = true;
}

function press_k5() {
  keys[5] = true;
}

function press_k6() {
  keys[6] = true;
}

function press_k7() {
  keys[7] = true;
}

function press_k8() {
  keys[8] = true;
}

function press_k9() {
  keys[9] = true;
}

function press_ka() {
  keys[0xA] = true;
}

function press_kb() {
  keys[0xB] = true;
}

function press_kc() {
  keys[0xC] = true;
}

function press_kd() {
  keys[0xD] = true;
}

function press_ke() {
  keys[0xE] = true;
}

function press_kf() {
  keys[0xF] = true;
}

// Memoria Principal
var mem = new Uint8Array(4096);

// Memoria de Video
var gfx = new Uint8Array(64*32);

// Registradores
var V = new Uint8Array(16);

// Input
var keys = [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false];

// Program Counter
var PC = 512;

// Instruction Pointer
var I = 0;

// Stack
var stack = new Array(16);

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
  canvas.width = 256;
  canvas.height = 128;
  loadROM("INVADERS");
  init();
});

function select()
{
  console.log("select");
}

function init()
{
  for(var i = 0; i<mem.length; i++)
  {
    mem[i] = 0;
  }
  
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
        mem[512 + i] = rom[i];
      }
    }
    
    reader.readAsArrayBuffer(blob);
  };
  
  oReq.send();
}

function step() {
  opcode = (mem[PC] << 8 | mem[PC + 1]);
  
  if (delay_timer > 0)
  {
   delay_timer--;
  }
  
  if (sound_timer > 0)
  {
    if (sound_timer == 1)
    {
      
    }
    sound_timer--;
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
          PC = stack.pop();
          PC += 2;
          break;
          
        default:
          console.log("Opcode não implementado");
          break;
      }
      break;
      
    case 0x1000:
      PC = opcode & 0x0FFF;
      break;
      
    case 0x2000:
      stack.push(PC);
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
          if(V[(opcode & 0x00F0) >> 4] > (0xFF - V[(opcode & 0x0F00) >> 8]))
          {
            V[0xF] = 1;
          } else {
            V[0xF] = 0;
          }
          V[(opcode & 0x0F00) >> 8] += V[(opcode & 0x00F0) >> 4];
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
          
        case 0x0007: 
					if(V[(opcode & 0x0F00) >> 8] > V[(opcode & 0x00F0) >> 4])
						V[0xF] = 0;
					else
						V[0xF] = 1;
					V[(opcode & 0x0F00) >> 8] = V[(opcode & 0x00F0) >> 4] - V[(opcode & 0x0F00) >> 8];				
					pc += 2;
				  break;
          
        case 0x000E:
          V[0xF] = (v[(opcode & 0x0F00) >> 8] & 0x80) >> 7;
          V[(opcode & 0x0F00) >> 8] = V[(opcode & 0x0F00) >> 8] << 1;
          PC += 2;
          break;
          
        default:
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
      V[(opcode & 0x0F00) >> 8] = Math.floor(Math.random() * 0xFF) & (opcode & 0x00FF);
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
          if (keys[V[(opcode & 0x0F00) >> 8]])
          {
           PC += 4;
           keys[V[(opcode & 0x0F00) >> 8]] = false;
          }
          else
          {
           PC += 2;
          }
          break;
          
        case 0x0001:
          if (!keys[V[(opcode & 0x0F00) >> 8]])
          {
           PC += 4;
          }
          else
          {
           PC += 2;
           keys[V[(opcode & 0x0F00) >> 8]] = false;
          }
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
          for (var k = 0; k < keys.length; k++)
          {
           if (keys[k])
           {
            V[(opcode & 0x0F00) >> 8] = k;
            PC += 2;
            break;
           }
          }
          break;
          
        case 0x0015:
          delay_timer = V[(opcode & 0x0F00) >> 8];
          PC += 2;
          break;
          
        case 0x0018:
          sound_timer = V[(opcode & 0x0F00) >> 8];
          PC += 2;
          break;
          
        case 0x001E:
          if(I + V[(opcode & 0x0F00) >> 8] > 0xFFF)
          {
            V[0xF] = 1;
          } else {
            V[0xF] = 0;
          }
          I += V[(opcode & 0x0F00) >> 8];
          PC += 2;
          break;
          
        case 0x0029:
          I = V[(opcode & 0x0F00) >> 8] * 0x5;
          PC += 2;
          break;
          
        case 0x0033:
          mem[I] = (V[(opcode & 0x0F00) >> 8] / 100);
          mem[I+1] = (V[(opcode & 0x0F00) >> 8] / 10) % 10;
          mem[I+2] = (V[(opcode & 0x0F00) >> 8] % 100) % 10;
          PC += 2;
          break;
          
        case 0x0055:
          for (var j = 0; j <= ((opcode & 0x0F00) >> 8); j++)
          {
            mem[I + j] = V[j];
          }
          I += ((opcode & 0x0F00) >> 8) + 1;
          PC += 2;
          break;
          
        case 0x0065:
          for (var j = 0; j <= ((opcode & 0x0F00) >> 8); j++)
          {
            V[j] = mem[I + j];
          }
          I += ((opcode & 0x0F00) >> 8) + 1;
          PC += 2;
          break;
      }
      break;
      
    default:
      break;
  }
}

function chooser()
{  
  /* 
  if(games.style.visibility == "hidden")
  {
    games.style.visibility = "visible";
    running = false;
  }
  else
  {
    games.style.visibility = "hidden";
  } */
}

function select()
{  
  var game = games.options[games.selectedIndex].value;  
  games.style.visibility = "hidden";
  lblJogos.style.visibility = "hidden";
  init();
  console.log("Carregando jogo: " + game);
  rom = null;
  loadROM(game);
  run();
}

function run()
{
    step();
    draw();
    window.requestAnimationFrame(run);
}

function draw() 
{
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for(var k=0; k<gfx.length; k++)
    {
      var Y = Math.floor(k/64);
      var X = Math.floor(k - (Y * 64));
      
      ctx.fillStyle = "white";
      if(gfx[k] == 1)
      {        
        ctx.fillRect(X*4, Y*4, 4, 4);
      }
    }
}

function stop()
{
  running = false;
}