/* Global helpers */
function $(sel){ return document.querySelector(sel); }
function $all(sel){ return document.querySelectorAll(sel); }

/* NAV: hamburger menu */
const menu = $('#menu');
$('#hamburgerBtn').addEventListener('click', ()=> menu.classList.toggle('hidden') );

/* THEME toggle (dark/light) */
const themeToggle = $('#themeToggle');
themeToggle.addEventListener('click', () => {
  document.documentElement.classList.toggle('dark');
  themeToggle.textContent = document.documentElement.classList.contains('dark') ? '🌙' : '☀️';
});

/* HERO animations (GSAP) */
gsap.to("#heroTitle", { opacity: 1, y: -10, duration: 1.1, ease: "power3.out" });
gsap.to("#heroSubtitle", { opacity: 1, y: -6, delay: 0.25, duration: 1.1, ease: "power3.out" });
gsap.to("#heroBtn", { opacity: 1, delay: 0.6, duration: 1.1 });

/* PARTICLES (simple dots) */
(function initParticles(){
  const canvas = document.getElementById('particles');
  const ctx = canvas.getContext('2d');
  function resize(){ canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  window.addEventListener('resize', resize);
  resize();

  const particles = [];
  for(let i=0;i<100;i++) particles.push({ x: Math.random()*canvas.width, y: Math.random()*canvas.height, r: 0.6 + Math.random()*1.6, s: 0.2+Math.random()*0.6 });

  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    particles.forEach(p=>{
      p.y += p.s;
      if(p.y > canvas.height + 10) p.y = -10;
      ctx.beginPath();
      ctx.fillStyle = 'rgba(59,130,246,0.18)';
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

/* THREE.JS: 3D Charger model */
(function initThree(){
  const canvas3 = $('#threeCanvas');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, canvas3.clientWidth / 420, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas: canvas3, alpha: true, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio || 1);

  function resizeRenderer(){
    renderer.setSize(canvas3.clientWidth, 420);
    camera.aspect = canvas3.clientWidth / 420;
    camera.updateProjectionMatrix();
  }
  resizeRenderer();
  window.addEventListener('resize', resizeRenderer);

  // Charger group
  const charger = new THREE.Group();
  // base
  const base = new THREE.Mesh(new THREE.BoxGeometry(2.4,0.3,1.2), new THREE.MeshStandardMaterial({ color: 0x0b1320, metalness:0.6, roughness:0.4 }));
  base.position.y = -0.15; charger.add(base);
  // column
  const col = new THREE.Mesh(new THREE.BoxGeometry(0.9,2.6,0.7), new THREE.MeshStandardMaterial({ color: 0x0ea5e9, metalness:0.25, roughness:0.5 }));
  col.position.y = 1.2; charger.add(col);
  // screen
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.7,0.42), new THREE.MeshStandardMaterial({ color: 0x071225, emissive: 0x1e90ff, emissiveIntensity:0.2 }));
  screen.position.set(0,1.6,0.39); charger.add(screen);
  // nozzle
  const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,0.4,16), new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness:0.7 }));
  nozzle.rotation.z = Math.PI/2; nozzle.position.set(0.7,0.95,0); charger.add(nozzle);
  // hose (torus segments)
  const hoseGroup = new THREE.Group();
  for(let i=0;i<3;i++){
    const tor = new THREE.Mesh(new THREE.TorusGeometry(0.4 - i*0.06, 0.045, 12, 50, Math.PI*0.9), new THREE.MeshStandardMaterial({ color: 0x111827, metalness:0.7 }));
    tor.rotation.x = Math.PI/2; tor.position.set(0, 0.9 - i*0.02, -0.05 + i*0.02); hoseGroup.add(tor);
  }
  charger.add(hoseGroup);

  scene.add(charger);

  // lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const dir = new THREE.DirectionalLight(0xffffff, 0.8); dir.position.set(5,10,7); scene.add(dir);
  const rim = new THREE.PointLight(0x1e90ff, 0.5, 10); rim.position.set(-2,2,3); scene.add(rim);

  camera.position.set(0,1.2,4);

  // pointer-driven rotation
  let tY = 0, tX = 0;
  canvas3.addEventListener('pointermove', (e)=>{
    const r = canvas3.getBoundingClientRect();
    const x = (e.clientX - r.left)/r.width;
    const y = (e.clientY - r.top)/r.height;
    tY = (x - 0.5) * Math.PI/6;
    tX = (y - 0.5) * Math.PI/20;
  });

  function animate(){
    charger.rotation.y += (tY - charger.rotation.y) * 0.06;
    charger.rotation.x += (tX - charger.rotation.x) * 0.06;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
})();

/* MAP (Leaflet) and SWIPER init after DOM load */
document.addEventListener('DOMContentLoaded', function(){
  // MAP init
  try{
    const map = L.map('map').setView([28.6139,77.2090], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors'}).addTo(map);
    const stations = [
      {lat:28.6139, lng:77.2090, name: 'Windsor - Connaught Place'},
      {lat:28.6467, lng:77.2195, name: 'Windsor - Karol Bagh'},
      {lat:28.5342, lng:77.3810, name: 'Windsor - Highway Fast Charger'}
    ];
    stations.forEach(s => L.marker([s.lat, s.lng]).addTo(map).bindPopup(s.name));
    setTimeout(()=> map.invalidateSize(), 350);
  }catch(e){ console.warn('Leaflet map failed to load', e); }

  // Swiper (app preview)
  try{
    new Swiper('.swiper', {
      loop: true,
      autoplay: { delay: 2500, disableOnInteraction: false },
      pagination: { el: '.swiper-pagination', clickable: true },
      navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }
    });
  }catch(e){ console.warn('Swiper init failed', e); }
});

/* Newsletter button demo */
$('#newsletterBtn').addEventListener('click', (ev)=>{
  ev.preventDefault();
  const email = $('#newsletterEmail').value.trim();
  if(!email) { alert('Please enter your email'); return; }
  $('#newsletterBtn').textContent = 'Subscribed ✓';
  setTimeout(()=> $('#newsletterBtn').textContent = '→', 2200);
});
