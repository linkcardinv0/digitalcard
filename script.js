import * as THREE from 'three';

// --- BAHAGIAN 1: TYPEWRITER EFFECT ---
const line1 = "Majlis Merisik & Bertunang";
const line2 = "Haqimi & Balqis";

function typeWriter(text, element, speed, callback) {
    let i = 0;
    function typing() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(typing, speed);
        } else if (callback) {
            callback();
        }
    }
    typing();
}

document.addEventListener("DOMContentLoaded", () => {
    const el1 = document.querySelector(".typewriter-line1");
    const el2 = document.querySelector(".typewriter-line2");
    
    if(el1 && el2) {
        typeWriter(line1, el1, 100, () => {
            el1.style.borderRight = "none"; 
            setTimeout(() => {
                typeWriter(line2, el2, 100);
            }, 500);
        });
    }
});

// --- BAHAGIAN 2: SETUP THREE.JS ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('canvas-container').appendChild(renderer.domElement);

const light = new THREE.PointLight(0xffffff, 10, 100);
light.position.set(2, 3, 4);
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff, 0.8));

// --- BAHAGIAN 3: CINCIN 3D ---
const ringGeo = new THREE.TorusGeometry(1, 0.1, 16, 100);
const ringMat = new THREE.MeshStandardMaterial({ 
    color: 0xffd700, 
    metalness: 1, 
    roughness: 0.1 
});
const ring = new THREE.Mesh(ringGeo, ringMat);
scene.add(ring);

camera.position.z = 5;
ring.position.y = 2.0; // Kedudukan cincin masa skrin typewriter (atas sikit dari teks)
ring.scale.set(0.5, 0.5, 0.5); // Saiz permulaan yang nampak jelas

// --- BAHAGIAN 4: FLOATING LEAVES ---
const loader = new THREE.TextureLoader();
const leafTexture = loader.load('https://png.pngtree.com/png-vector/20220909/ourmid/pngtree-wedding-invitation-flower-corner-decoration-png-image_6144805.png');

const leaves = [];
const leafCount = 15;

for (let i = 0; i < leafCount; i++) {
    const leafGeo = new THREE.PlaneGeometry(0.5, 0.5);
    const leafMat = new THREE.MeshBasicMaterial({
        map: leafTexture,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
    });
    const leaf = new THREE.Mesh(leafGeo, leafMat);
    leaf.position.set((Math.random() - 0.5) * 10, Math.random() * 10, (Math.random() - 0.5) * 5);
    leaf.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    scene.add(leaf);
    leaves.push(leaf);
}

// --- BAHAGIAN 5: ANIMATION LOOP ---
function animate() {
    requestAnimationFrame(animate);
    
    // Putar Cincin (Selagi ia belum di-remove dari scene)
    if (ring && ring.parent) {
        ring.rotation.y += 0.01;
        ring.rotation.x += 0.005;
    }
    
    // Gerakkan Daun (Kekal ada sebagai hiasan latar)
    leaves.forEach(leaf => {
        leaf.position.y -= 0.01;
        leaf.rotation.x += 0.01;
        if (leaf.position.y < -5) leaf.position.y = 5;
    });

    renderer.render(scene, camera);
}
animate();

// --- BAHAGIAN 6: LOGIK BUTANG & TRANSISI ---
const openBtn = document.getElementById('openBtn');
const startOverlay = document.getElementById('start-overlay');
const mainUI = document.getElementById('main-ui');
const bgMusic = document.getElementById('bgMusic'); // Panggil ID audio

if (openBtn) {
    openBtn.addEventListener('click', () => {
        // A. MAIN LAGU (FADE IN)
        if (bgMusic) {
            bgMusic.volume = 0.1; // Mula dengan senyap
            bgMusic.play();
            
            // Naikkan volume sikit-sikit
            let vol = 0;
            const fadeIn = setInterval(() => {
                if (vol < 0.5) { // Maksimum volume 50% supaya tak bingit
                    vol += 0.05;
                    bgMusic.volume = vol;
                } else {
                    clearInterval(fadeIn);
                }
            }, 200);
        }

        // B. TRANSISI UI
        startOverlay.style.transition = 'opacity 1s ease';
        startOverlay.style.opacity = '0';
        
        setTimeout(() => {
            startOverlay.style.display = 'none';
        }, 1000); // 1000ms di luar curly bracket

        mainUI.classList.remove('hidden');
        
        setTimeout(() => {
            mainUI.classList.add('show');
        }, 500);

        // 3. Animasi Cincin: Mengecil, Terbang Naik & Hilang
        // Pastikan 'ring' dan 'scene' dah didefinisikan kat bahagian Three.js kau
        if (typeof ring !== 'undefined' && ring) {
            const fadeRing = setInterval(() => {
                if (ring.scale.x > 0.05) {
                    ring.scale.x -= 0.08;
                    ring.scale.y -= 0.08;
                    ring.scale.z -= 0.08;
                    ring.position.y += 0.1; // Efek terbang naik
                    ring.rotation.z += 0.2; // Tambah sikit pusingan masa hilang
                } else {
                    scene.remove(ring); // Padam terus dari dunia 3D
                    clearInterval(fadeRing);
                }
            }, 20);
        }
    }); // Penutup Click Listener
}

// Handling Resize Skrin (Duduk luar, jangan kacau click listener)
window.addEventListener('resize', () => {
    if (typeof renderer !== 'undefined' && typeof camera !== 'undefined') {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }

});
