/* ============================================
   LUXE Studio — Fluid Silk Background
   Noise Flow Field + Morphing Blobs + Light Streaks
   ============================================ */

(function() {
    const canvas = document.createElement('canvas');
    canvas.id = 'bgCanvas';
    canvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
        pointer-events: none;
    `;
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d');
    let width, height;
    let time = 0;
    let mouse = { x: width / 2, y: height / 2, smoothX: 0, smoothY: 0 };
    let animationId;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        mouse.smoothX = width / 2;
        mouse.smoothY = height / 2;
    }

    // --- Simplex Noise (fast 2D/3D) ---
    const F2 = 0.5 * (Math.sqrt(3) - 1);
    const G2 = (3 - Math.sqrt(3)) / 6;
    const grad3 = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]];
    const perm = new Array(512);
    const p = [];

    for (let i = 0; i < 256; i++) p[i] = Math.floor(Math.random() * 256);
    for (let i = 0; i < 512; i++) perm[i] = p[i & 255];

    function noise2D(xin, yin) {
        let n0, n1, n2;
        const s = (xin + yin) * F2;
        const i = Math.floor(xin + s);
        const j = Math.floor(yin + s);
        const t = (i + j) * G2;
        const X0 = i - t;
        const Y0 = j - t;
        const x0 = xin - X0;
        const y0 = yin - Y0;
        let i1, j1;
        if (x0 > y0) { i1 = 1; j1 = 0; }
        else { i1 = 0; j1 = 1; }
        const x1 = x0 - i1 + G2;
        const y1 = y0 - j1 + G2;
        const x2 = x0 - 1.0 + 2.0 * G2;
        const y2 = y0 - 1.0 + 2.0 * G2;
        const ii = i & 255;
        const jj = j & 255;
        const gi0 = perm[ii + perm[jj]] % 12;
        const gi1 = perm[ii + i1 + perm[jj + j1]] % 12;
        const gi2 = perm[ii + 1 + perm[jj + 1]] % 12;
        let t0 = 0.5 - x0 * x0 - y0 * y0;
        if (t0 < 0) n0 = 0;
        else { t0 *= t0; n0 = t0 * t0 * (grad3[gi0][0] * x0 + grad3[gi0][1] * y0); }
        let t1 = 0.5 - x1 * x1 - y1 * y1;
        if (t1 < 0) n1 = 0;
        else { t1 *= t1; n1 = t1 * t1 * (grad3[gi1][0] * x1 + grad3[gi1][1] * y1); }
        let t2 = 0.5 - x2 * x2 - y2 * y2;
        if (t2 < 0) n2 = 0;
        else { t2 *= t2; n2 = t2 * t2 * (grad3[gi2][0] * x2 + grad3[gi2][1] * y2); }
        return 70.0 * (n0 + n1 + n2);
    }

    function noise3D(x, y, z) {
        return noise2D(x + z * 31.7, y + z * 47.3);
    }

    // --- Morphing Organic Blobs ---
    const blobs = [
        { x: 0.3, y: 0.3, radius: 0.25, speed: 0.0004, phase: 0 },
        { x: 0.7, y: 0.6, radius: 0.2, speed: 0.0003, phase: 2 },
        { x: 0.5, y: 0.8, radius: 0.22, speed: 0.00035, phase: 4 },
        { x: 0.2, y: 0.7, radius: 0.18, speed: 0.00045, phase: 1.5 },
        { x: 0.8, y: 0.3, radius: 0.2, speed: 0.00025, phase: 3 },
    ];

    function drawBlobs() {
        blobs.forEach((blob, index) => {
            const bx = blob.x * width + Math.sin(time * blob.speed + blob.phase) * width * 0.15;
            const by = blob.y * height + Math.cos(time * blob.speed * 1.3 + blob.phase) * height * 0.12;
            const radius = blob.radius * Math.min(width, height) * (0.8 + Math.sin(time * blob.speed * 2) * 0.2);

            // Mouse influence
            const dx = mouse.smoothX - bx;
            const dy = mouse.smoothY - by;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const influence = Math.max(0, 1 - dist / (width * 0.4));
            const offsetX = dx * influence * 0.05;
            const offsetY = dy * influence * 0.05;

            const gradient = ctx.createRadialGradient(
                bx + offsetX, by + offsetY, 0,
                bx + offsetX, by + offsetY, radius
            );

            const opacity = 0.04 + influence * 0.02;
            gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
            gradient.addColorStop(0.4, `rgba(255, 255, 255, ${opacity * 0.5})`);
            gradient.addColorStop(1, 'transparent');

            ctx.fillStyle = gradient;
            ctx.beginPath();

            // Organic shape using noise
            const points = 60;
            for (let i = 0; i <= points; i++) {
                const angle = (i / points) * Math.PI * 2;
                const noiseVal = noise3D(
                    Math.cos(angle) * 2 + index,
                    Math.sin(angle) * 2 + index,
                    time * 0.0008
                );
                const r = radius * (1 + noiseVal * 0.3);
                const px = bx + offsetX + Math.cos(angle) * r;
                const py = by + offsetY + Math.sin(angle) * r;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
        });
    }

    // --- Flowing Silk Noise Field ---
    function drawSilkField() {
        const resolution = 5;
        const cols = Math.ceil(width / resolution);
        const rows = Math.ceil(height / resolution);

        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const nx = x * 0.008;
                const ny = y * 0.008;
                const t = time * 0.0003;

                const n1 = noise2D(nx + t, ny + t * 0.7);
                const n2 = noise2D(nx * 2 + t * 0.5, ny * 2 - t * 0.3);
                const combined = (n1 + n2 * 0.5) / 1.5;

                const brightness = Math.pow(Math.abs(combined), 1.5) * 12;

                const px = x * resolution;
                const py = y * resolution;

                for (let dy = 0; dy < resolution && py + dy < height; dy++) {
                    for (let dx = 0; dx < resolution && px + dx < width; dx++) {
                        const idx = ((py + dy) * width + (px + dx)) * 4;
                        data[idx] = 255;
                        data[idx + 1] = 255;
                        data[idx + 2] = 255;
                        data[idx + 3] = brightness;
                    }
                }
            }
        }

        ctx.putImageData(imageData, 0, 0);
    }

    // --- Light Streaks ---
    const streaks = [];
    const STREAK_COUNT = 12;

    function initStreaks() {
        for (let i = 0; i < STREAK_COUNT; i++) {
            streaks.push({
                x: Math.random() * width,
                y: Math.random() * height,
                length: Math.random() * 200 + 100,
                angle: Math.random() * Math.PI * 2,
                speed: Math.random() * 0.5 + 0.2,
                width: Math.random() * 1.5 + 0.5,
                opacity: Math.random() * 0.06 + 0.02,
                life: Math.random() * 1000,
                maxLife: Math.random() * 800 + 400
            });
        }
    }

    function updateAndDrawStreaks() {
        streaks.forEach(s => {
            s.life++;

            // Reset when expired
            if (s.life > s.maxLife) {
                s.x = Math.random() * width;
                s.y = Math.random() * height;
                s.angle = Math.random() * Math.PI * 2;
                s.life = 0;
                s.maxLife = Math.random() * 800 + 400;
            }

            // Movement with noise-based direction change
            const noiseAngle = noise2D(s.x * 0.002, s.y * 0.002 + time * 0.0001) * Math.PI;
            s.angle += (noiseAngle - s.angle) * 0.01;
            s.x += Math.cos(s.angle) * s.speed;
            s.y += Math.sin(s.angle) * s.speed;

            // Wrap
            if (s.x < -50) s.x = width + 50;
            if (s.x > width + 50) s.x = -50;
            if (s.y < -50) s.y = height + 50;
            if (s.y > height + 50) s.y = -50;

            // Fade in/out
            const lifeRatio = s.life / s.maxLife;
            const fade = lifeRatio < 0.1 ? lifeRatio / 0.1 :
                         lifeRatio > 0.8 ? (1 - lifeRatio) / 0.2 : 1;

            // Draw
            const endX = s.x + Math.cos(s.angle) * s.length;
            const endY = s.y + Math.sin(s.angle) * s.length;

            const gradient = ctx.createLinearGradient(s.x, s.y, endX, endY);
            gradient.addColorStop(0, 'transparent');
            gradient.addColorStop(0.3, `rgba(255, 255, 255, ${s.opacity * fade})`);
            gradient.addColorStop(0.7, `rgba(255, 255, 255, ${s.opacity * fade})`);
            gradient.addColorStop(1, 'transparent');

            ctx.beginPath();
            ctx.moveTo(s.x, s.y);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = s.width;
            ctx.lineCap = 'round';
            ctx.stroke();
        });
    }

    // --- Depth Fog Layers ---
    function drawDepthFog() {
        // Top fog
        const topGrad = ctx.createLinearGradient(0, 0, 0, height * 0.4);
        topGrad.addColorStop(0, 'rgba(0, 0, 0, 0.5)');
        topGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = topGrad;
        ctx.fillRect(0, 0, width, height * 0.4);

        // Bottom fog
        const bottomGrad = ctx.createLinearGradient(0, height * 0.7, 0, height);
        bottomGrad.addColorStop(0, 'transparent');
        bottomGrad.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
        ctx.fillStyle = bottomGrad;
        ctx.fillRect(0, height * 0.7, width, height * 0.3);

        // Vignette
        const vignetteGrad = ctx.createRadialGradient(
            width / 2, height / 2, height * 0.25,
            width / 2, height / 2, height * 0.85
        );
        vignetteGrad.addColorStop(0, 'transparent');
        vignetteGrad.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
        ctx.fillStyle = vignetteGrad;
        ctx.fillRect(0, 0, width, height);
    }

    // --- Pulsing Rings (like radar/sonar) ---
    const rings = [];

    function spawnRing() {
        rings.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: 0,
            maxRadius: Math.random() * 300 + 200,
            speed: Math.random() * 0.8 + 0.3,
            opacity: 0.04
        });
    }

    function updateAndDrawRings() {
        for (let i = rings.length - 1; i >= 0; i--) {
            const r = rings[i];
            r.radius += r.speed;
            const progress = r.radius / r.maxRadius;
            const fade = 1 - progress;

            if (progress >= 1) {
                rings.splice(i, 1);
                continue;
            }

            ctx.beginPath();
            ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 255, 255, ${r.opacity * fade})`;
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // Spawn new rings occasionally
        if (Math.random() < 0.005) spawnRing();
    }

    // --- Main Animation Loop ---
    function animate() {
        time++;
        ctx.clearRect(0, 0, width, height);

        // Smooth mouse
        mouse.smoothX += (mouse.x - mouse.smoothX) * 0.03;
        mouse.smoothY += (mouse.y - mouse.smoothY) * 0.03;

        // Layer 1: Silk noise field
        drawSilkField();

        // Layer 2: Morphing blobs
        drawBlobs();

        // Layer 3: Light streaks
        updateAndDrawStreaks();

        // Layer 4: Pulsing rings
        updateAndDrawRings();

        // Layer 5: Depth & vignette
        drawDepthFog();

        animationId = requestAnimationFrame(animate);
    }

    // --- Events ---
    window.addEventListener('resize', resize);

    document.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    document.addEventListener('mouseleave', () => {
        mouse.x = width / 2;
        mouse.y = height / 2;
    });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(animationId);
        } else {
            animate();
        }
    });

    // --- Init ---
    resize();
    initStreaks();
    // Spawn initial rings
    for (let i = 0; i < 3; i++) spawnRing();
    animate();

})();
