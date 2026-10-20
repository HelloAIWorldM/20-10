/**
 * SCRIPT: 20/10 • NIÊN DU MỸ NHÂN LỤC ✨
 * Triết lý: Anti-AI-Slop, High-Performance Canvas Wiping & Sparkler Hearts.
 */

(() => {
  'use strict';

  // ================= 1. HẰNG SỐ & DOM ELEMENTS =================
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];

  const fogCanvas = $('#fogCanvas');
  const fogCtx = fogCanvas.getContext('2d');
  const fogWrapper = $('#fogWrapper');
  const btnSkipFog = $('#btnSkipFog');

  const fwCanvas = $('#fireworksCanvas');
  const fwCtx = fwCanvas.getContext('2d');

  const bgm = $('#bgm');
  const btnAudio = $('#btnAudio');
  const btnRefrost = $('#btnRefrost');
  const btnShare = $('#btnShare');
  const toast = $('#toast');
  const cardRecipient = $('#cardRecipient');
  const letterGreeting = $('#letterGreeting');

  // ================= 2. THIỆP CHÚC MỪNG PUBLIC CHO TOÀN THỂ BANG =================
  cardRecipient.textContent = 'Gửi Toàn Thể Chị Em Bang Niên Du 🌸';
  document.title = '20/10 • Niên Du Mỹ Nhân Lục ✨';
  if (letterGreeting) {
    letterGreeting.innerHTML = 'Nhân ngày <strong>Phụ Nữ Việt Nam 20/10</strong>, xin gửi tới toàn thể các tỷ muội, bóng hồng của <strong>Bang Niên Du</strong> lời chúc mừng trân trọng và nồng nhiệt nhất.';
  }

  // ================= 3. QUẢN LÝ ÂM THANH =================
  let audioStarted = false;

  function toggleAudio() {
    if (bgm.paused) {
      bgm.play().then(() => {
        btnAudio.classList.remove('muted');
      }).catch(err => console.log('Chờ tương tác để phát nhạc:', err));
    } else {
      bgm.pause();
      btnAudio.classList.add('muted');
    }
  }

  function ensureAudioStarted() {
    if (!audioStarted) {
      audioStarted = true;
      bgm.play().then(() => {
        btnAudio.classList.remove('muted');
      }).catch(() => {});
    }
  }

  btnAudio.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleAudio();
  });

  // ================= 4. HỆ THỐNG LAU KÍNH SƯƠNG (FOG CANVAS) =================
  let isWiping = false;
  let lastX = 0;
  let lastY = 0;
  let isFogCleared = false;
  let checkProgressTimer = null;
  const wipeRadius = window.innerWidth < 768 ? 38 : 52;

  function resizeFogCanvas() {
    const dpr = window.devicePixelRatio || 1;
    fogCanvas.width = window.innerWidth * dpr;
    fogCanvas.height = window.innerHeight * dpr;
    fogCtx.scale(dpr, dpr);
    drawFrostLayer();
  }

  // Vẽ lớp sương mù thực tế (Mờ sương đọng nước)
  function drawFrostLayer() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    fogCtx.globalCompositeOperation = 'source-over';
    
    // Nền chuyển sắc sương mù đục đặc che kín nội dung
    const frostGrad = fogCtx.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, Math.max(w, h));
    frostGrad.addColorStop(0, '#1c0f2d');
    frostGrad.addColorStop(0.5, '#120720');
    frostGrad.addColorStop(1, '#06020c');
    fogCtx.fillStyle = frostGrad;
    fogCtx.fillRect(0, 0, w, h);

    // Tạo các giọt nước ngưng tụ & hạt sương li ti trên mặt kính
    for (let i = 0; i < 500; i++) {
      const rx = Math.random() * w;
      const ry = Math.random() * h;
      const r = Math.random() * 2.8 + 0.6;
      fogCtx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.12 + 0.03})`;
      fogCtx.beginPath();
      fogCtx.arc(rx, ry, r, 0, Math.PI * 2);
      fogCtx.fill();
    }

    // Những vệt hơi nước đọng mờ ảo
    for (let i = 0; i < 35; i++) {
      const bx = Math.random() * w;
      const by = Math.random() * h;
      const br = Math.random() * 85 + 35;
      const bGrad = fogCtx.createRadialGradient(bx, by, 0, bx, by, br);
      bGrad.addColorStop(0, 'rgba(255, 255, 255, 0.06)');
      bGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      fogCtx.fillStyle = bGrad;
      fogCtx.beginPath();
      fogCtx.arc(bx, by, br, 0, Math.PI * 2);
      fogCtx.fill();
    }
  }

  // Tẩy sương bằng cọ tròn mềm (Soft Radial Mask)
  function eraseAt(x, y) {
    fogCtx.save();
    fogCtx.globalCompositeOperation = 'destination-out';

    const grad = fogCtx.createRadialGradient(x, y, wipeRadius * 0.35, x, y, wipeRadius);
    grad.addColorStop(0, 'rgba(0, 0, 0, 1)');
    grad.addColorStop(0.7, 'rgba(0, 0, 0, 0.85)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    fogCtx.fillStyle = grad;
    fogCtx.beginPath();
    fogCtx.arc(x, y, wipeRadius, 0, Math.PI * 2);
    fogCtx.fill();
    fogCtx.restore();
  }

  // Nội suy đường đi giữa 2 điểm chạm (tránh đứt đoạn khi vuốt nhanh)
  function interpolateWipe(x1, y1, x2, y2) {
    const dist = Math.hypot(x2 - x1, y2 - y1);
    const step = wipeRadius * 0.3;
    const steps = Math.ceil(dist / step);

    for (let i = 0; i <= steps; i++) {
      const t = steps === 0 ? 0 : i / steps;
      const x = x1 + (x2 - x1) * t;
      const y = y1 + (y2 - y1) * t;
      eraseAt(x, y);
    }
  }

  // Kiểm tra độ sạch của kính
  function calculateWipeProgress() {
    if (isFogCleared) return;

    const sampleWidth = 60;
    const sampleHeight = 60;
    const offCanvas = document.createElement('canvas');
    offCanvas.width = sampleWidth;
    offCanvas.height = sampleHeight;
    const offCtx = offCanvas.getContext('2d');

    offCtx.drawImage(fogCanvas, 0, 0, sampleWidth, sampleHeight);
    const imgData = offCtx.getImageData(0, 0, sampleWidth, sampleHeight).data;

    let transparentPixels = 0;
    const totalPixels = sampleWidth * sampleHeight;

    for (let i = 3; i < imgData.length; i += 4) {
      if (imgData[i] < 128) {
        transparentPixels++;
      }
    }

    const progress = transparentPixels / totalPixels;
    // Khi lau sạch trên 45% diện tích -> Tự động mở toàn bộ
    if (progress > 0.45) {
      clearFog();
    }
  }

  function clearFog() {
    if (isFogCleared) return;
    isFogCleared = true;
    fogWrapper.classList.add('cleared');

    // Chùm pháo hoa mở màn chào mừng (3 trái tim cách quãng nhẹ)
    const w = window.innerWidth;
    const h = window.innerHeight;
    createHeartFirework(w * 0.5, h * 0.28, 1.3);
    setTimeout(() => createHeartFirework(w * 0.27, h * 0.24, 1.1), 450);
    setTimeout(() => createHeartFirework(w * 0.73, h * 0.25, 1.1), 900);

    // Kích hoạt chu kỳ bắn pháo hoa tự động tuần hoàn sau màn chào mừng
    setTimeout(() => {
      startAutoFireworks();
    }, 2600);
  }

  function refrostWindow() {
    isFogCleared = false;
    stopAutoFireworks();
    fogWrapper.classList.remove('cleared');
    drawFrostLayer();
  }

  btnSkipFog.addEventListener('click', (e) => {
    e.stopPropagation();
    ensureAudioStarted();
    clearFog();
  });

  // Sự kiện chạm & chuột
  function handleStart(x, y) {
    if (isFogCleared) return;
    ensureAudioStarted();
    isWiping = true;
    lastX = x;
    lastY = y;
    eraseAt(x, y);
  }

  function handleMove(x, y) {
    if (!isWiping || isFogCleared) return;
    interpolateWipe(lastX, lastY, x, y);
    lastX = x;
    lastY = y;

    if (!checkProgressTimer) {
      checkProgressTimer = setTimeout(() => {
        calculateWipeProgress();
        checkProgressTimer = null;
      }, 250);
    }
  }

  function handleEnd() {
    isWiping = false;
    calculateWipeProgress();
  }

  fogCanvas.addEventListener('mousedown', (e) => handleStart(e.clientX, e.clientY));
  window.addEventListener('mousemove', (e) => handleMove(e.clientX, e.clientY));
  window.addEventListener('mouseup', handleEnd);

  fogCanvas.addEventListener('touchstart', (e) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      handleStart(touch.clientX, touch.clientY);
    }
  }, { passive: false });

  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0 && isWiping) {
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
      e.preventDefault();
    }
  }, { passive: false });

  window.addEventListener('touchend', handleEnd);

  // ================= 5. HỆ THỐNG PHÁO HOA TRÁI TIM (SPARKLER HEARTS) =================
  let particles = [];
  let ambientParticles = [];
  let dpr = window.devicePixelRatio || 1;

  function resizeFireworksCanvas() {
    dpr = window.devicePixelRatio || 1;
    fwCanvas.width = window.innerWidth * dpr;
    fwCanvas.height = window.innerHeight * dpr;
  }

  // Khởi tạo đom đóm & bụi tiên lơ lửng
  function initAmbientParticles() {
    ambientParticles = [];
    const count = window.innerWidth < 768 ? 40 : 75;
    for (let i = 0; i < count; i++) {
      ambientParticles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 2.2 + 0.8,
        vx: (Math.random() - 0.5) * 0.45,
        vy: -Math.random() * 0.65 - 0.25,
        alpha: Math.random() * 0.7 + 0.3,
        flicker: Math.random() * Math.PI * 2,
        color: Math.random() > 0.45 ? '#f3d089' : (Math.random() > 0.5 ? '#ff8fb1' : '#ffffff')
      });
    }
  }

  // Hạt pháo hoa có đuôi lấp lánh (Sparkler Heart Particle)
  class SparklerHeartParticle {
    constructor(x, y, vx, vy, color, size = 3.6) {
      this.x = x;
      this.y = y;
      this.vx = vx;
      this.vy = vy;
      this.color = color;
      this.alpha = 1;
      this.decay = Math.random() * 0.009 + 0.007; // 1.5 - 2s
      this.size = size;
      this.flicker = Math.random() * Math.PI * 2;
      this.history = [];
      this.maxHistory = 6;
    }

    update() {
      this.history.push({ x: this.x, y: this.y, alpha: this.alpha });
      if (this.history.length > this.maxHistory) {
        this.history.shift();
      }

      this.vx *= 0.96;
      this.vy *= 0.96;
      this.vy += 0.035; // Rơi nhẹ
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= this.decay;
      this.flicker += 0.35;
    }

    draw(ctx) {
      if (this.alpha <= 0) return;
      ctx.save();

      // Vệt đuôi tia lửa
      for (let i = 0; i < this.history.length; i++) {
        const pt = this.history[i];
        const trailAlpha = (i / this.history.length) * this.alpha * 0.55;
        ctx.fillStyle = this.color;
        ctx.globalAlpha = trailAlpha;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, this.size * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }

      // Hạt nhân lấp lánh
      const twinkle = 0.75 + 0.25 * Math.sin(this.flicker);
      ctx.globalAlpha = Math.max(0, this.alpha * twinkle);
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 18;
      ctx.shadowColor = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();

      // Tâm sáng trắng
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 0.45, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  // Bắn chùm pháo hoa hình trái tim
  function createHeartFirework(cx, cy, scaleFactor = 1.2) {
    // Ngăn chặn quá tải hạt để web luôn mượt mà 60fps trên mọi thiết bị
    if (particles.length > 260) return;

    const palette = [
      ['#f3d089', '#fff4d6'], // Vàng champagne & ánh trăng
      ['#ff8fb1', '#ffd2e1'], // Hồng đào & hồng phấn
      ['#ffffff', '#f3d089'], // Kim cương trắng & vàng
      ['#e63980', '#ff8fb1'], // Đỏ hoa hồng & sen
      ['#b79bff', '#ffffff']  // Tím cổ phong
    ];
    const pair = palette[Math.floor(Math.random() * palette.length)];
    const pointsCount = window.innerWidth < 768 ? 72 : 110;
    const heartScale = (window.innerWidth < 768 ? 0.20 : 0.26) * scaleFactor;

    for (let i = 0; i < pointsCount; i++) {
      const t = (i / pointsCount) * Math.PI * 2;
      // Phương trình đường cong trái tim chuẩn Parametric
      const hx = 16 * Math.pow(Math.sin(t), 3);
      const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));

      const speed = Math.random() * 0.26 + 0.82;
      const vx = hx * heartScale * speed;
      const vy = hy * heartScale * speed;
      const color = Math.random() > 0.3 ? pair[0] : pair[1];
      const size = Math.random() * 2.0 + 1.8;

      particles.push(new SparklerHeartParticle(cx, cy, vx, vy, color, size));
    }

    // Tâm nổ vụn lấp lánh (Sparkle center)
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = Math.random() * 2.0 + 0.5;
      particles.push(new SparklerHeartParticle(
        cx, cy,
        Math.cos(angle) * spd,
        Math.sin(angle) * spd,
        '#ffffff',
        Math.random() * 1.8 + 1.2
      ));
    }
  }

  // Quản lý bắn tự động tuần tự nhịp nhàng (Luân phiên bầu trời, chống lag)
  let autoFireworkTimer = null;
  let fireworkCycleIndex = 0;

  function scheduleNextAutoFirework() {
    if (!isFogCleared) return;

    const w = window.innerWidth;
    const h = window.innerHeight;

    // Vị trí luân phiên 3 vùng trời: Trái -> Phải -> Trung tâm
    const skyZones = [
      { x: w * (0.24 + Math.random() * 0.10), y: h * (0.23 + Math.random() * 0.08), s: 1.15 },
      { x: w * (0.68 + Math.random() * 0.10), y: h * (0.22 + Math.random() * 0.08), s: 1.15 },
      { x: w * (0.46 + Math.random() * 0.08), y: h * (0.19 + Math.random() * 0.08), s: 1.30 }
    ];

    const currentZone = skyZones[fireworkCycleIndex % skyZones.length];
    fireworkCycleIndex++;

    createHeartFirework(currentZone.x, currentZone.y, currentZone.s);

    // Thời gian giãn cách 3.6s đến 4.8s giữa các lần bắn -> êm dịu, không giật lag
    const delay = Math.floor(Math.random() * 1200 + 3600);
    autoFireworkTimer = setTimeout(scheduleNextAutoFirework, delay);
  }

  function startAutoFireworks() {
    stopAutoFireworks();
    scheduleNextAutoFirework();
  }

  function stopAutoFireworks() {
    if (autoFireworkTimer) {
      clearTimeout(autoFireworkTimer);
      autoFireworkTimer = null;
    }
  }

  // Animation Loop pháo hoa & ambient
  function animateFireworks() {
    fwCtx.save();
    fwCtx.setTransform(1, 0, 0, 1, 0, 0);
    fwCtx.clearRect(0, 0, fwCanvas.width, fwCanvas.height);
    fwCtx.scale(dpr, dpr);

    // Vẽ ambient particles
    for (let i = 0; i < ambientParticles.length; i++) {
      const p = ambientParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.flicker += 0.05;
      if (p.y < -10) p.y = window.innerHeight + 10;
      if (p.x < -10) p.x = window.innerWidth + 10;
      if (p.x > window.innerWidth + 10) p.x = -10;

      fwCtx.save();
      const a = p.alpha * (0.65 + 0.35 * Math.sin(p.flicker));
      fwCtx.globalAlpha = Math.max(0, a);
      fwCtx.fillStyle = p.color;
      fwCtx.shadowBlur = 8;
      fwCtx.shadowColor = p.color;
      fwCtx.beginPath();
      fwCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      fwCtx.fill();
      fwCtx.restore();
    }

    // Vẽ hạt pháo hoa
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.update();
      p.draw(fwCtx);
      if (p.alpha <= 0) {
        particles.splice(i, 1);
      }
    }

    fwCtx.restore();
    requestAnimationFrame(animateFireworks);
  }

  // ================= 6. TƯƠNG TÁC NGƯỜI DÙNG & NÚT BẤM =================
  // Đảm bảo khởi chạy âm thanh khi người dùng nhấp vào trang
  window.addEventListener('click', () => {
    ensureAudioStarted();
  });

  btnRefrost.addEventListener('click', (e) => {
    e.stopPropagation();
    refrostWindow();
  });

  btnShare.addEventListener('click', (e) => {
    e.stopPropagation();
    const shareText = `🌸 Chúc mừng ngày 20/10 toàn thể Chị Em Bang Niên Du! Luôn xinh đẹp, rạng ngời và mãi là niềm tự hào của bang! ✨\n💬 Tham gia Bang Hội Discord: https://discord.gg/niendu\n👉 Mở thiệp lau sương: ${window.location.origin + window.location.pathname}`;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareText).then(() => showToast()).catch(() => showToast());
    } else {
      showToast();
    }
  });

  function showToast() {
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2600);
  }

  // Hiệu ứng nhẹ khi chạm vào các thẻ lời chúc (không bắn pháo hoa để chống lag)
  $$('.wish-card').forEach(card => {
    card.addEventListener('click', (e) => {
      e.stopPropagation();
      ensureAudioStarted();
    });
  });

  // ================= 7. KHỞI TẠO HỆ THỐNG =================
  function init() {
    resizeFogCanvas();
    resizeFireworksCanvas();
    initAmbientParticles();
    animateFireworks();
  }

  window.addEventListener('resize', () => {
    resizeFogCanvas();
    resizeFireworksCanvas();
    initAmbientParticles();
  });

  init();

})();
