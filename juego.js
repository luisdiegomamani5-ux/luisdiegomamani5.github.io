const canvas = document.getElementById("juego");
const ctx = canvas.getContext("2d");

// Imágenes de automóviles incluidas en la carpeta imagenes
const imagenesAutos = {
  jugador: new Image(),
  enemigos: [new Image(), new Image(), new Image()]
};
imagenesAutos.jugador.src = "imagenes/jhonny_sins_1.png";
imagenesAutos.enemigos[0].src = "imagenes/Mia_1.png";
imagenesAutos.enemigos[1].src = "imagenes/Lana_1.png";
imagenesAutos.enemigos[2].src = "imagenes/Speed_1.png";
const puntosHTML = document.getElementById("puntos");
const vidasHTML = document.getElementById("vidas");
const velocidadHTML = document.getElementById("velocidad");
const pantallaInicio = document.getElementById("pantallaInicio");
const pantallaFinal = document.getElementById("pantallaFinal");

let ancho=0, alto=0, jugando=false, puntos=0, vidas=3;
let velocidad=4, cuadros=0, obstaculos=[], teclas={};
const jugador={x:0,y:0,ancho:38,alto:65};
const carretera={x:0,ancho:0,lineas:0};

function ajustarCanvas() {
  const rect=canvas.getBoundingClientRect();
  const dpr=Math.min(window.devicePixelRatio||1,2);
  ancho=rect.width; alto=rect.height;
  canvas.width=Math.round(ancho*dpr);
  canvas.height=Math.round(alto*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  carretera.ancho=ancho*.72;
  carretera.x=(ancho-carretera.ancho)/2;
  jugador.ancho=Math.max(28,ancho*.09);
  jugador.alto=jugador.ancho*1.65;
  jugador.y=alto-jugador.alto-20;
  jugador.x=Math.max(carretera.x,Math.min(jugador.x||ancho/2-jugador.ancho/2,carretera.x+carretera.ancho-jugador.ancho));
  dibujar();
}

function dibujarCarretera() {
  ctx.fillStyle="green"; ctx.fillRect(0,0,ancho,alto);
  ctx.fillStyle="#dda90f"; ctx.fillRect(carretera.x,0,carretera.ancho,alto);
  ctx.fillStyle="green";
  ctx.fillRect(carretera.x,0,5,alto);
  ctx.fillRect(carretera.x+carretera.ancho-5,0,5,alto);
  ctx.strokeStyle="#dda90f"; ctx.lineWidth=4; ctx.setLineDash([30,25]);
  ctx.lineDashOffset=-carretera.lineas;
  ctx.beginPath(); ctx.moveTo(ancho/2,0); ctx.lineTo(ancho/2,alto); ctx.stroke();
  ctx.setLineDash([]);
}

function dibujarAuto(x, y, w, h, imagen, colorAlternativo) {
  if (imagen && imagen.complete && imagen.naturalWidth > 0) {
    ctx.drawImage(imagen, x, y, w, h);
  } else {
    ctx.fillStyle = colorAlternativo || "#00aaff";
    ctx.fillRect(x, y, w, h);
  }
}

function dibujar() {
  dibujarCarretera();
  obstaculos.forEach(a=>dibujarAuto(a.x,a.y,a.ancho,a.alto,a.imagen,a.color));
  dibujarAuto(jugador.x,jugador.y,jugador.ancho,jugador.alto,imagenesAutos.jugador,"#00aaff");
}

function crearObstaculo() {
  const carriles=[carretera.x+carretera.ancho*.25,carretera.x+carretera.ancho*.75];
  const w=jugador.ancho,h=jugador.alto;
  const carril=carriles[Math.floor(Math.random()*2)];
  const indice=Math.floor(Math.random()*imagenesAutos.enemigos.length);
  obstaculos.push({x:carril-w/2,y:-h,ancho:w,alto:h,
    imagen:imagenesAutos.enemigos[indice],
    color:["#1976d2","#eeeeee","#fdd835"][indice]});
}

function colision(a,b) {
  return a.x+5<b.x+b.ancho-5 && a.x+a.ancho-5>b.x+5 &&
    a.y+8<b.y+b.alto-5 && a.y+a.alto-8>b.y+5;
}

function actualizar() {
  if(!jugando) return;
  cuadros++;
  const movimiento=ancho*.009;
  if(teclas.izquierda) jugador.x-=movimiento;
  if(teclas.derecha) jugador.x+=movimiento;
  jugador.x=Math.max(carretera.x+5,Math.min(jugador.x,carretera.x+carretera.ancho-jugador.ancho-5));
  if(teclas.acelerar) velocidad=Math.min(10,velocidad+.04);
  if(teclas.frenar) velocidad=Math.max(2,velocidad-.08);
  carretera.lineas+=velocidad;
  const frecuencia=Math.max(35,85-Math.floor(puntos/100));
  if(cuadros%frecuencia===0) crearObstaculo();

  obstaculos.forEach(a=>{
    a.y+=velocidad;
    if(!a.tocado && colision(jugador,a)) {
      a.tocado=true; vidas--; vidasHTML.textContent=vidas;
    }
    if(!a.contado && a.y>jugador.y+jugador.alto) {
      a.contado=true; puntos+=10; puntosHTML.textContent=puntos;
    }
  });
  obstaculos=obstaculos.filter(a=>a.y<alto+100&&!a.tocado);
  if(cuadros%60===0) { puntos++; puntosHTML.textContent=puntos; }
  velocidadHTML.textContent=Math.floor(velocidad);
  dibujar();
  if(vidas<=0) { terminarJuego(); return; }
  requestAnimationFrame(actualizar);
}

function iniciarJuego() {
  puntos=0; vidas=3; velocidad=4; cuadros=0; obstaculos=[]; teclas={};
  jugador.x=ancho/2-jugador.ancho/2; jugador.y=alto-jugador.alto-20;
  carretera.lineas=0;
  puntosHTML.textContent=puntos; vidasHTML.textContent=vidas; velocidadHTML.textContent=velocidad;
  pantallaInicio.classList.add("oculto"); pantallaFinal.classList.add("oculto");
  jugando=true; actualizar();
}

function terminarJuego() {
  jugando=false;
  document.getElementById("resultado").textContent=puntos;
  pantallaFinal.classList.remove("oculto"); dibujar();
}

document.addEventListener("keydown",e=>{
  if(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"," "].includes(e.key)) e.preventDefault();
  if(e.key==="ArrowLeft"||e.key==="a") teclas.izquierda=true;
  if(e.key==="ArrowRight"||e.key==="d") teclas.derecha=true;
  if(e.key==="ArrowUp"||e.key==="w") teclas.acelerar=true;
  if(e.key==="ArrowDown"||e.key==="s") teclas.frenar=true;
});
document.addEventListener("keyup",e=>{
  if(e.key==="ArrowLeft"||e.key==="a") teclas.izquierda=false;
  if(e.key==="ArrowRight"||e.key==="d") teclas.derecha=false;
  if(e.key==="ArrowUp"||e.key==="w") teclas.acelerar=false;
  if(e.key==="ArrowDown"||e.key==="s") teclas.frenar=false;
});

function configurarBoton(id,accion) {
  const boton=document.getElementById(id);
  boton.addEventListener("pointerdown",e=>{e.preventDefault();teclas[accion]=true;});
  ["pointerup","pointerleave","pointercancel"].forEach(tipo=>{
    boton.addEventListener(tipo,e=>{if(e.preventDefault)e.preventDefault();teclas[accion]=false;});
  });
}
configurarBoton("izquierda","izquierda");
configurarBoton("derecha","derecha");
configurarBoton("acelerar","acelerar");
configurarBoton("frenar","frenar");
window.addEventListener("blur",()=>{teclas={};});
document.getElementById("iniciar").addEventListener("click",iniciarJuego);
document.getElementById("reiniciar").addEventListener("click",iniciarJuego);
window.addEventListener("resize",ajustarCanvas);
ajustarCanvas();
