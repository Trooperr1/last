/* ============================================
   LUXE Studio — Living Background Canvas
   Particle Network + Aurora Waves + Grid Pulse
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
    let particles = [];
    let mouse = { x: -1000, y: -1000 };
    let time = 0;
    let animationId;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        initParticles();
    }

    // --- Particles ---
    const PARTICLE_COUNT = Math.min(80, Math.floor(window.innerWidth / 20));
    const CONNECTION_DISTANCE = 150;
    const MOUSE_RADIUS = 200;

    function initParticles() {
        particles = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                radius: Math.random() * 1.5 + 0.5,
                opacity: Math.random() * 0.3 + 0.1,
                pulseSpeed: Math.random() * 0.02 + 0.005
            });
        }
    }

    function updateParticles() {
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;

            // Wrap around edges
            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height;
            if (p.y > height) p.y = 0;

            // Mouse repulsion
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < MOUSE_RADIUS) {
                const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
                p.vx += (dx / dist) * force * 0.02;
                p.vy += (dy / dist) * force * 0.02;
            }

            // Damping
            p.vx *= 0.99;
            p.vy *= 0.99;

            // Pulse opacity
            p.opacity = 0.1 + Math.sin(time * p.pulseSpeed) * 0.1 + 0.1;
        });
    }

    function drawParticles() {
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
            ctx.fill();
        });
    }

    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < CONNECTION_DISTANCE) {
                    const opacity = (1 - dist / CONNECTION_DISTANCE) * 0.08;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        // Mouse connections
        particles.forEach(p => {
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < MOUSE_RADIUS) {
                const opacity = (1 - dist / MOUSE_RADIUS) * 0.15;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        });
    }

    // --- Aurora Waves ---
    function drawAurora() {
        const gradient = ctx.createLinearGradient(0, height * 0.3, 0, height * 0.7);
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.008)');
        gradient.addColorStop(1, 'transparent');

        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(0, height * 0.5);

            const amplitude = 80 + i * 30;
            const frequency = 0.002 + i * 0.001;
            const speed = time * (0.0003 + i * 0.0001);

            for (let x = 0; x <= width; x += 3) {
                const y = height * 0.4 + i * 80
                    + Math.sin(x * frequency + speed) * amplitude
                    + Math.sin(x * frequency * 2.5 + speed * 1.5) * (amplitude * 0.3)
                    + Math.cos(x * frequency * 0.5 + speed * 0.8) * (amplitude * 0.5);
                ctx.lineTo(x, y);
            }

            ctx.lineTo(width, height);
            ctx.lineTo(0, height);
            ctx.closePath();

            const auroraGradient = ctx.createLinearGradient(0, height * 0.3, 0, height);
            auroraGradient.addColorStop(0, `rgba(255, 255, 255, ${0.012 - i * 0.003})`);
            auroraGradient.addColorStop(0.5, `rgba(255, 255, 255, ${0.006 - i * 0.001})`);
            auroraGradient.addColorStop(1, 'transparent');

            ctx.fillStyle = auroraGradient;
            ctx.fill();
        }
    }

    // --- Flowing Grid ---
    function drawGrid() {
        const gridSize = 80;
        const scrollOffset = (window.scrollY || 0) * 0.1;

        ctx.strokeStyle = `rgba(255, 255, 255, 0.015)`;
        ctx.lineWidth = 0.5;

        // Vertical lines with wave
        for (let x = 0; x < width; x += gridSize) {
            ctx.beginPath();
            for (let y = 0; y < height; y += 4) {
                const wave = Math.sin((y + scrollOffset) * 0.005 + time * 0.0005 + x * 0.01) * 3;
                if (y === 0) {
                    ctx.moveTo(x + wave, y);
                } else {
                    ctx.lineTo(x + wave, y);
                }
            }
            ctx.stroke();
        }

        // Horizontal lines with wave
        for (let y = 0; y < height; y += gridSize) {
            ctx.beginPath();
            for (let x = 0; x < width; x += 4) {
                const wave = Math.sin((x + scrollOffset) * 0.005 + time * 0.0004 + y * 0.01) * 3;
                if (x === 0) {
                    ctx.moveTo(x, y + wave);
                } else {
                    ctx.lineTo(x, y + wave);
                }
            }
            ctx.stroke();
        }

        // Pulse dots at intersections
        const pulseOpacity = Math.sin(time * 0.001) * 0.03 + 0.03;
        for (let x = 0; x < width; x += gridSize) {
            for (let y = 0; y < height; y += gridSize) {
                const distToMouse = Math.sqrt(
                    Math.pow(x - mouse.x, 2) + Math.pow(y - mouse.y, 2)
                );
                const glow = distToMouse < 250 ? (1 - distToMouse / 250) * 0.2 : 0;

                ctx.beginPath();
                ctx.arc(x, y, 1, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${pulseOpacity + glow})`;
                ctx.fill();
            }
        }
    }

    // --- Floating Geometric Shapes ---
    const shapes = [];
    const SHAPE_COUNT = 6;

    function initShapes() {
        for (let i = 0; i < SHAPE_COUNT; i++) {
            shapes.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: Math.random() * 60 + 30,
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.002,
                floatSpeed: Math.random() * 0.0005 + 0.0002,
                floatOffset: Math.random() * Math.PI * 2,
                type: Math.floor(Math.random() * 3), // 0: circle, 1: square, 2: triangle
                opacity: Math.random() * 0.03 + 0.01
            });
        }
    }

    function drawShapes() {
        shapes.forEach(s => {
            s.rotation += s.rotSpeed;
            const floatY = Math.sin(time * s.floatSpeed + s.floatOffset) * 20;

            ctx.save();
            ctx.translate(s.x, s.y + floatY);
            ctx.rotate(s.rotation);
            ctx.strokeStyle = `rgba(255, 255, 255, ${s.opacity})`;
            ctx.lineWidth = 0.5;

            if (s.type === 0) {
                ctx.beginPath();
                ctx.arc(0, 0, s.size / 2, 0, Math.PI * 2);
                ctx.stroke();
            } else if (s.type === 1) {
                ctx.strokeRect(-s.size / 2, -s.size / 2, s.size, s.size);
            } else {
                ctx.beginPath();
                ctx.moveTo(0, -s.size / 2);
                ctx.lineTo(s.size / 2, s.size / 2);
                ctx.lineTo(-s.size / 2, s.size / 2);
                ctx.closePath();
                ctx.stroke();
            }

            ctx.restore();
        });
    }

    // --- Light Beam Sweep ---
    function drawLightBeam() {
        const beamX = (Math.sin(time * 0.0002) + 1) * 0.5 * width;
        const gradient = ctx.createRadialGradient(beamX, 0, 0, beamX, 0, height * 0.8);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.015)');
        gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.005)');
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }

    // --- Vignette ---
    function drawVignette() {
        const gradient = ctx.createRadialGradient(
            width / 2, height / 2, height * 0.2,
            width / 2, height / 2, height * 0.9
        );
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }

    // --- Main Loop ---
    function animate() {
        time++;
        ctx.clearRect(0, 0, width, height);

        // Layer 1: Grid
        drawGrid();

        // Layer 2: Aurora
        drawAurora();

        // Layer 3: Light beam
        drawLightBeam();

        // Layer 4: Geometric shapes
        drawShapes();

        // Layer 5: Particles + connections
        updateParticles();
        drawConnections();
        drawParticles();

        // Layer 6: Vignette
        drawVignette();

        animationId = requestAnimationFrame(animate);
    }

    // --- Events ---
    window.addEventListener('resize', resize);

    document.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    document.addEventListener('mouseleave', () => {
        mouse.x = -1000;
        mouse.y = -1000;
    });

    // Reduce animation when tab is not visible
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(animationId);
        } else {
            animate();
        }
    });

    // --- Init ---
    resize();
    initShapes();
    animate();

})();
