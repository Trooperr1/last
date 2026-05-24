/* ============================================
   LUXE Studio — Ultra Luxury Living Background
   Liquid Metal + Aurora + Diamond Particles +
   Volumetric Smoke + Caustic Light
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
    let mouse = { x: 0, y: 0, sx: 0, sy: 0 };
    let animId;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.scale(dpr, dpr);
        mouse.sx = width / 2;
        mouse.sy = height / 2;
    }

    // --- Noise ---
    const F2 = 0.5 * (Math.sqrt(3) - 1);
    const G2 = (3 - Math.sqrt(3)) / 6;
    const grad3 = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]];
    const perm = new Array(512);
    const p = [];
    for (let i = 0; i < 256; i++) p[i] = Math.floor(Math.random() * 256);
    for (let i = 0; i < 512; i++) perm[i] = p[i & 255];

    function simplex(xin, yin) {
        let n0, n1, n2;
        const s = (xin + yin) * F2;
        const i = Math.floor(xin + s), j = Math.floor(yin + s);
        const t = (i + j) * G2;
        const x0 = xin - (i - t), y0 = yin - (j - t);
        const i1 = x0 > y0 ? 1 : 0, j1 = x0 > y0 ? 0 : 1;
        const x1 = x0 - i1 + G2, y1 = y0 - j1 + G2;
        const x2 = x0 - 1 + 2 * G2, y2 = y0 - 1 + 2 * G2;
        const ii = i & 255, jj = j & 255;
        const gi0 = perm[ii + perm[jj]] % 12;
        const gi1 = perm[ii + i1 + perm[jj + j1]] % 12;
        const gi2 = perm[ii + 1 + perm[jj + 1]] % 12;
        let t0 = 0.5 - x0*x0 - y0*y0;
        n0 = t0 < 0 ? 0 : (t0 *= t0, t0 * t0 * (grad3[gi0][0]*x0 + grad3[gi0][1]*y0));
        let t1 = 0.5 - x1*x1 - y1*y1;
        n1 = t1 < 0 ? 0 : (t1 *= t1, t1 * t1 * (grad3[gi1][0]*x1 + grad3[gi1][1]*y1));
        let t2 = 0.5 - x2*x2 - y2*y2;
        n2 = t2 < 0 ? 0 : (t2 *= t2, t2 * t2 * (grad3[gi2][0]*x2 + grad3[gi2][1]*y2));
        return 70 * (n0 + n1 + n2);
    }

    function fbm(x, y, octaves) {
        let val = 0, amp = 1, freq = 1, sum = 0;
        for (let i = 0; i < octaves; i++) {
            val += simplex(x * freq, y * freq) * amp;
            sum += amp;
            amp *= 0.5;
            freq *= 2;
        }
        return val / sum;
    }

    // ==========================
    // LAYER 1: Liquid Metal Aurora
    // ==========================
    function drawLiquidAurora() {
        const t = time * 0.0002;
        const segments = 120;
        const layers = 5;

        for (let l = 0; l < layers; l++) {
            const yBase = height * (0.25 + l * 0.12);
            const amplitude = 60 + l * 20;
            const opacity = 0.025 - l * 0.003;
            const speed = t * (1 + l * 0.2);

            ctx.beginPath();
            ctx.moveTo(-10, height);

            for (let i = 0; i <= segments; i++) {
                const x = (i / segments) * (width + 20) - 10;
                const nx = x * 0.003 + speed;
                const ny = l * 3.7 + speed * 0.5;

                const n = fbm(nx, ny, 4);
                const mouseDistX = Math.abs(x - mouse.sx) / width;
                const mouseInfluence = Math.exp(-mouseDistX * 3) * 30;

                const y = yBase + n * amplitude + mouseInfluence * Math.sin(time * 0.003 + l);

                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }

            ctx.lineTo(width + 10, height);
            ctx.lineTo(-10, height);
            ctx.closePath();

            const grad = ctx.createLinearGradient(0, yBase - amplitude, 0, yBase + amplitude * 2);
            grad.addColorStop(0, `rgba(255, 255, 255, ${opacity * 1.5})`);
            grad.addColorStop(0.3, `rgba(255, 255, 255, ${opacity})`);
            grad.addColorStop(0.7, `rgba(200, 200, 200, ${opacity * 0.5})`);
            grad.addColorStop(1, 'transparent');

            ctx.fillStyle = grad;
            ctx.fill();

            // Top edge glow (liquid metal shine)
            ctx.beginPath();
            for (let i = 0; i <= segments; i++) {
                const x = (i / segments) * (width + 20) - 10;
                const nx = x * 0.003 + speed;
                const ny = l * 3.7 + speed * 0.5;
                const n = fbm(nx, ny, 4);
                const mouseDistX = Math.abs(x - mouse.sx) / width;
                const mouseInfluence = Math.exp(-mouseDistX * 3) * 30;
                const y = yBase + n * amplitude + mouseInfluence * Math.sin(time * 0.003 + l);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 2})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }
    }

    // ==========================
    // LAYER 2: Volumetric Smoke
    // ==========================
    function drawVolumetricSmoke() {
        const t = time * 0.00015;
        const columns = Math.ceil(width / 8);
        const rows = Math.ceil(height / 8);

        for (let pass = 0; pass < 2; pass++) {
            const scale = 0.004 + pass * 0.002;
            const tOffset = pass * 10;

            for (let y = 0; y < rows; y += 2) {
                for (let x = 0; x < columns; x += 2) {
                    const px = x * 8;
                    const py = y * 8;

                    const n1 = simplex(px * scale + t, py * scale + t * 0.7 + tOffset);
                    const n2 = simplex(px * scale * 2 + t * 0.5, py * scale * 2 + tOffset);
                    const n = (n1 + n2 * 0.5) / 1.5;

                    const distort = simplex(px * 0.001 + t * 2, py * 0.001) * 0.5;
                    const val = Math.pow(Math.abs(n + distort), 2) * 18;

                    if (val > 1) {
                        ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(val * 0.003, 0.04)})`;
                        ctx.fillRect(px, py, 16, 16);
                    }
                }
            }
        }
    }

    // ==========================
    // LAYER 3: Diamond Particles (Rising)
    // ==========================
    const diamonds = [];
    const DIAMOND_COUNT = 50;

    function initDiamonds() {
        for (let i = 0; i < DIAMOND_COUNT; i++) {
            diamonds.push(createDiamond());
        }
    }

    function createDiamond() {
        return {
            x: Math.random() * width,
            y: height + Math.random() * 200,
            size: Math.random() * 3 + 1,
            speedY: Math.random() * 0.4 + 0.15,
            speedX: (Math.random() - 0.5) * 0.3,
            opacity: 0,
            maxOpacity: Math.random() * 0.6 + 0.2,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.02,
            twinkleSpeed: Math.random() * 0.05 + 0.02,
            drift: Math.random() * Math.PI * 2
        };
    }

    function updateDiamonds() {
        diamonds.forEach((d, i) => {
            d.y -= d.speedY;
            d.x += d.speedX + Math.sin(time * 0.002 + d.drift) * 0.2;
            d.rotation += d.rotSpeed;

            // Fade in / fade out
            const progress = 1 - (d.y / height);
            if (progress < 0.1) d.opacity = (progress / 0.1) * d.maxOpacity;
            else if (progress > 0.85) d.opacity = ((1 - progress) / 0.15) * d.maxOpacity;
            else d.opacity = d.maxOpacity;

            // Twinkle
            d.opacity *= 0.7 + Math.sin(time * d.twinkleSpeed) * 0.3;

            // Reset
            if (d.y < -50) {
                diamonds[i] = createDiamond();
            }
        });
    }

    function drawDiamonds() {
        diamonds.forEach(d => {
            if (d.opacity < 0.01) return;

            ctx.save();
            ctx.translate(d.x, d.y);
            ctx.rotate(d.rotation);

            // Diamond shape
            ctx.beginPath();
            ctx.moveTo(0, -d.size);
            ctx.lineTo(d.size * 0.6, 0);
            ctx.lineTo(0, d.size);
            ctx.lineTo(-d.size * 0.6, 0);
            ctx.closePath();

            ctx.fillStyle = `rgba(255, 255, 255, ${d.opacity})`;
            ctx.fill();

            // Sparkle glow
            if (d.opacity > 0.3) {
                const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, d.size * 4);
                glow.addColorStop(0, `rgba(255, 255, 255, ${d.opacity * 0.3})`);
                glow.addColorStop(1, 'transparent');
                ctx.fillStyle = glow;
                ctx.beginPath();
                ctx.arc(0, 0, d.size * 4, 0, Math.PI * 2);
                ctx.fill();
            }

            // Cross sparkle for bright ones
            if (d.opacity > 0.4) {
                ctx.strokeStyle = `rgba(255, 255, 255, ${d.opacity * 0.4})`;
                ctx.lineWidth = 0.5;
                const sparkSize = d.size * 3;
                ctx.beginPath();
                ctx.moveTo(-sparkSize, 0);
                ctx.lineTo(sparkSize, 0);
                ctx.moveTo(0, -sparkSize);
                ctx.lineTo(0, sparkSize);
                ctx.stroke();
            }

            ctx.restore();
        });
    }

    // ==========================
    // LAYER 4: Caustic Light Patterns
    // ==========================
    function drawCaustics() {
        const t = time * 0.0003;
        const cellSize = 60;
        const cols = Math.ceil(width / cellSize) + 1;
        const rows = Math.ceil(height / cellSize) + 1;

        ctx.globalCompositeOperation = 'lighter';

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const px = x * cellSize;
                const py = y * cellSize;

                const n1 = simplex(px * 0.005 + t, py * 0.005 + t * 0.6);
                const n2 = simplex(px * 0.008 - t * 0.4, py * 0.008 + t * 0.3);
                const n3 = simplex(px * 0.003 + t * 0.2, py * 0.003 - t * 0.5);

                const caustic = Math.pow(Math.abs(Math.sin(n1 * 5 + n2 * 3 + n3 * 2)), 8);

                if (caustic > 0.1) {
                    const opacity = caustic * 0.03;
                    const size = cellSize * 0.8;

                    const grad = ctx.createRadialGradient(px, py, 0, px, py, size);
                    grad.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
                    grad.addColorStop(1, 'transparent');

                    ctx.fillStyle = grad;
                    ctx.beginPath();
                    ctx.arc(px, py, size, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }

        ctx.globalCompositeOperation = 'source-over';
    }

    // ==========================
    // LAYER 5: Glowing Orbs (slow moving)
    // ==========================
    const orbs = [
        { x: 0.2, y: 0.3, r: 250, speed: 0.0003, phase: 0 },
        { x: 0.8, y: 0.5, r: 200, speed: 0.00025, phase: 2 },
        { x: 0.5, y: 0.7, r: 280, speed: 0.00035, phase: 4 },
        { x: 0.7, y: 0.2, r: 180, speed: 0.0004, phase: 1 },
    ];

    function drawOrbs() {
        orbs.forEach(orb => {
            const ox = orb.x * width + Math.sin(time * orb.speed + orb.phase) * 100;
            const oy = orb.y * height + Math.cos(time * orb.speed * 1.3 + orb.phase) * 80;

            // Breathe
            const breathe = 1 + Math.sin(time * orb.speed * 3) * 0.15;
            const r = orb.r * breathe;

            const grad = ctx.createRadialGradient(ox, oy, 0, ox, oy, r);
            grad.addColorStop(0, 'rgba(255, 255, 255, 0.025)');
            grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.012)');
            grad.addColorStop(0.6, 'rgba(255, 255, 255, 0.005)');
            grad.addColorStop(1, 'transparent');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(ox, oy, r, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    // ==========================
    // LAYER 6: Horizontal Light Sweeps
    // ==========================
    function drawLightSweeps() {
        const sweepCount = 3;
        for (let i = 0; i < sweepCount; i++) {
            const t = time * 0.0004 + i * 2;
            const x = ((Math.sin(t) + 1) / 2) * width;
            const spreadY = height * 0.6;
            const yCenter = height * (0.3 + i * 0.2);

            const grad = ctx.createRadialGradient(x, yCenter, 0, x, yCenter, spreadY);
            grad.addColorStop(0, 'rgba(255, 255, 255, 0.015)');
            grad.addColorStop(0.2, 'rgba(255, 255, 255, 0.008)');
            grad.addColorStop(1, 'transparent');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.ellipse(x, yCenter, spreadY * 0.3, spreadY, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // ==========================
    // LAYER 7: Cinematic Depth
    // ==========================
    function drawCinematicDepth() {
        // Top gradient
        const topGrad = ctx.createLinearGradient(0, 0, 0, height * 0.35);
        topGrad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
        topGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = topGrad;
        ctx.fillRect(0, 0, width, height * 0.35);

        // Bottom gradient
        const botGrad = ctx.createLinearGradient(0, height * 0.75, 0, height);
        botGrad.addColorStop(0, 'transparent');
        botGrad.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
        ctx.fillStyle = botGrad;
        ctx.fillRect(0, height * 0.75, width, height * 0.25);

        // Edge vignette
        const vigGrad = ctx.createRadialGradient(
            width / 2, height / 2, Math.min(width, height) * 0.2,
            width / 2, height / 2, Math.max(width, height) * 0.75
        );
        vigGrad.addColorStop(0, 'transparent');
        vigGrad.addColorStop(0.7, 'transparent');
        vigGrad.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
        ctx.fillStyle = vigGrad;
        ctx.fillRect(0, 0, width, height);

        // Subtle film grain flash
        if (Math.random() < 0.03) {
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.005})`;
            ctx.fillRect(0, 0, width, height);
        }
    }

    // ==========================
    // LAYER 8: Reflective Floor
    // ==========================
    function drawReflectiveFloor() {
        const floorY = height * 0.85;
        const grad = ctx.createLinearGradient(0, floorY, 0, height);
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.008)');
        grad.addColorStop(0.6, 'rgba(255, 255, 255, 0.003)');
        grad.addColorStop(1, 'transparent');

        ctx.fillStyle = grad;
        ctx.fillRect(0, floorY, width, height - floorY);

        // Reflection lines
        const lineCount = 8;
        for (let i = 0; i < lineCount; i++) {
            const y = floorY + (i / lineCount) * (height - floorY) * 0.6 + 20;
            const opacity = 0.02 * (1 - i / lineCount);
            const wave = Math.sin(time * 0.001 + i * 0.5) * 20;

            ctx.beginPath();
            ctx.moveTo(width * 0.2 + wave, y);
            ctx.lineTo(width * 0.8 + wave, y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
        }
    }

    // ==========================
    // MAIN LOOP
    // ==========================
    function animate() {
        time++;

        // Smooth mouse
        mouse.sx += (mouse.x - mouse.sx) * 0.02;
        mouse.sy += (mouse.y - mouse.sy) * 0.02;

        // Clear
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, width, height);

        // Background base
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);

        // Draw all layers
        drawOrbs();
        drawVolumetricSmoke();
        drawLiquidAurora();
        drawCaustics();
        drawLightSweeps();
        drawDiamonds();
        updateDiamonds();
        drawReflectiveFloor();
        drawCinematicDepth();

        animId = requestAnimationFrame(animate);
    }

    // --- Events ---
    window.addEventListener('resize', () => {
        resize();
    });

    document.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) cancelAnimationFrame(animId);
        else animate();
    });

    // --- Start ---
    resize();
    initDiamonds();
    animate();

})();
