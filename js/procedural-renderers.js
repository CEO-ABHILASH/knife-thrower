/**
 * High-Fidelity Procedural Canvas 2D Graphic Renderers
 * Draws stunning targets, weapons, bosses, and collectibles directly on canvas.
 */
const ProceduralRenderer = {

  // --- TARGET RENDERERS ---

  renderTarget(ctx, theme, radius) {
    ctx.save();
    switch (theme) {
      case 'lemon':
        this.drawLemon(ctx, radius);
        break;
      case 'shield':
        this.drawShield(ctx, radius);
        break;
      case 'cheese':
        this.drawCheese(ctx, radius);
        break;
      case 'compass':
        this.drawCompass(ctx, radius);
        break;
      case 'wood':
      default:
        this.drawWoodLog(ctx, radius);
        break;
    }
    ctx.restore();
  },

  drawWoodLog(ctx, radius) {
    // Drop shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 35;
    ctx.shadowOffsetY = 15;

    // Outer Bark
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#3E2415';
    ctx.fill();

    // Reset shadow for internal detail
    ctx.shadowColor = 'transparent';

    // Inner Wood Disk
    const woodGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, radius - 14);
    woodGrad.addColorStop(0, '#C99355');
    woodGrad.addColorStop(0.4, '#B3783E');
    woodGrad.addColorStop(0.8, '#8C5627');
    woodGrad.addColorStop(1, '#5C3314');

    ctx.beginPath();
    ctx.arc(0, 0, radius - 14, 0, Math.PI * 2);
    ctx.fillStyle = woodGrad;
    ctx.fill();

    // Concentric Growth Rings
    const ringRadii = [radius * 0.28, radius * 0.48, radius * 0.68, radius * 0.85];
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(74, 40, 14, 0.4)';
    for (const r of ringRadii) {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Radial Wood Cracks
    const crackAngles = [0.4, 1.8, 3.2, 4.6, 5.7];
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(40, 20, 8, 0.6)';
    for (const a of crackAngles) {
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * (radius * 0.4), Math.sin(a) * (radius * 0.4));
      ctx.lineTo(Math.cos(a) * (radius - 12), Math.sin(a) * (radius - 12));
      ctx.stroke();
    }

    // Central Brass Core / Medallion
    const hubGrad = ctx.createRadialGradient(-8, -8, 2, 0, 0, 42);
    hubGrad.addColorStop(0, '#FFF099');
    hubGrad.addColorStop(0.4, '#D4AF37');
    hubGrad.addColorStop(1, '#7A5B0B');

    ctx.beginPath();
    ctx.arc(0, 0, 36, 0, Math.PI * 2);
    ctx.fillStyle = hubGrad;
    ctx.fill();

    ctx.lineWidth = 3;
    ctx.strokeStyle = '#4A3705';
    ctx.stroke();

    // 4 Hex Rivets on Brass Hub
    ctx.fillStyle = '#302202';
    for (let i = 0; i < 4; i++) {
      const boltAngle = i * (Math.PI / 2);
      const bx = Math.cos(boltAngle) * 22;
      const by = Math.sin(boltAngle) * 22;
      ctx.beginPath();
      ctx.arc(bx, by, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  },

  drawLemon(ctx, radius) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 12;

    // Rind
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#F4D03F';
    ctx.fill();

    ctx.shadowColor = 'transparent';

    // White Pith
    ctx.beginPath();
    ctx.arc(0, 0, radius - 16, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFDE7';
    ctx.fill();

    // 8 Citrus Segments
    const segments = 8;
    const segAngle = (Math.PI * 2) / segments;
    for (let i = 0; i < segments; i++) {
      const a1 = i * segAngle + 0.08;
      const a2 = (i + 1) * segAngle - 0.08;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius - 26, a1, a2);
      ctx.closePath();

      const pulpGrad = ctx.createRadialGradient(0, 0, 20, 0, 0, radius - 26);
      pulpGrad.addColorStop(0, '#FFF176');
      pulpGrad.addColorStop(1, '#FBC02D');
      ctx.fillStyle = pulpGrad;
      ctx.fill();
    }

    // Center Core
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFDE7';
    ctx.fill();
  },

  drawShield(ctx, radius) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 35;
    ctx.shadowOffsetY = 15;

    // Steel Outer Rim
    const rimGrad = ctx.createLinearGradient(-radius, -radius, radius, radius);
    rimGrad.addColorStop(0, '#718096');
    rimGrad.addColorStop(0.5, '#CBD5E1');
    rimGrad.addColorStop(1, '#2D3748');

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = rimGrad;
    ctx.fill();

    ctx.shadowColor = 'transparent';

    // Gold Inset Plate
    ctx.beginPath();
    ctx.arc(0, 0, radius - 22, 0, Math.PI * 2);
    ctx.fillStyle = '#9A7D0A';
    ctx.fill();

    // Inner Dark Bronze Core
    const coreGrad = ctx.createRadialGradient(-10, -10, 10, 0, 0, radius - 40);
    coreGrad.addColorStop(0, '#F39C12');
    coreGrad.addColorStop(1, '#784212');

    ctx.beginPath();
    ctx.arc(0, 0, radius - 40, 0, Math.PI * 2);
    ctx.fillStyle = coreGrad;
    ctx.fill();

    // Cross Relief
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(-18, -(radius - 45), 36, (radius - 45) * 2);
    ctx.fillRect(-(radius - 45), -18, (radius - 45) * 2, 36);

    // Center Lion Boss
    ctx.beginPath();
    ctx.arc(0, 0, 48, 0, Math.PI * 2);
    ctx.fillStyle = '#F5B041';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#6E2C00';
    ctx.stroke();

    // 12 Outer Rivets
    ctx.fillStyle = '#E2E8F0';
    for (let i = 0; i < 12; i++) {
      const a = i * (Math.PI * 2 / 12);
      ctx.beginPath();
      ctx.arc(Math.cos(a) * (radius - 11), Math.sin(a) * (radius - 11), 5, 0, Math.PI * 2);
      ctx.fill();
    }
  },

  drawCheese(ctx, radius) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 14;

    // Rind
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#D68910';
    ctx.fill();

    ctx.shadowColor = 'transparent';

    // Cheese Meat
    const cheeseGrad = ctx.createRadialGradient(-20, -20, 20, 0, 0, radius - 12);
    cheeseGrad.addColorStop(0, '#FAD7A0');
    cheeseGrad.addColorStop(1, '#F5B041');

    ctx.beginPath();
    ctx.arc(0, 0, radius - 12, 0, Math.PI * 2);
    ctx.fillStyle = cheeseGrad;
    ctx.fill();

    // Distinct Holes (Craters)
    const holes = [
      { x: -50, y: -60, r: 28 },
      { x: 60, y: -45, r: 22 },
      { x: -40, y: 55, r: 34 },
      { x: 45, y: 50, r: 24 },
      { x: 5, y: -5, r: 18 }
    ];

    for (const h of holes) {
      // Internal crater shadow
      ctx.beginPath();
      ctx.arc(h.x, h.y, h.r, 0, Math.PI * 2);
      ctx.fillStyle = '#B9770E';
      ctx.fill();

      // Inset lip highlight
      ctx.beginPath();
      ctx.arc(h.x + 3, h.y + 3, h.r - 3, 0, Math.PI * 2);
      ctx.fillStyle = '#935116';
      ctx.fill();
    }
  },

  drawCompass(ctx, radius) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 35;
    ctx.shadowOffsetY = 15;

    // Steampunk Brass Outer Ring
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#7D6608';
    ctx.fill();

    ctx.shadowColor = 'transparent';

    // Dial face
    const dialGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, radius - 18);
    dialGrad.addColorStop(0, '#FCF3CF');
    dialGrad.addColorStop(1, '#D4AC0D');

    ctx.beginPath();
    ctx.arc(0, 0, radius - 18, 0, Math.PI * 2);
    ctx.fillStyle = dialGrad;
    ctx.fill();

    // 16 Dial Notches
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#5B4605';
    for (let i = 0; i < 16; i++) {
      const a = i * (Math.PI * 2 / 16);
      const len = i % 4 === 0 ? 22 : 12;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * (radius - 20), Math.sin(a) * (radius - 20));
      ctx.lineTo(Math.cos(a) * (radius - 20 - len), Math.sin(a) * (radius - 20 - len));
      ctx.stroke();
    }

    // 4-Point Star Compass Rose
    ctx.fillStyle = '#78281F';
    for (let i = 0; i < 4; i++) {
      const a = i * (Math.PI / 2);
      ctx.save();
      ctx.rotate(a);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-15, -40);
      ctx.lineTo(0, -(radius - 55));
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#C0392B';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(15, -40);
      ctx.lineTo(0, -(radius - 55));
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Center Needle Cap
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.fillStyle = '#1B4F72';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#D4AC0D';
    ctx.stroke();
  },

  // --- WEAPON / KNIFE RENDERERS ---

  renderKnife(ctx, skinId = 'default', width = 42, height = 140) {
    ctx.save();
    switch (skinId) {
      case 'damascus':
        this.drawDamascusKnife(ctx, width, height);
        break;
      case 'cyber':
        this.drawCyberKnife(ctx, width, height);
        break;
      case 'kunai':
        this.drawKunai(ctx, width, height);
        break;
      case 'default':
      default:
        this.drawDefaultKnife(ctx, width, height);
        break;
    }
    ctx.restore();
  },

  drawDefaultKnife(ctx, w, h) {
    const halfW = w / 2;
    const halfH = h / 2;
    const bladeBottom = 12;

    // Drop shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 6;

    // Left Blade Bevel (Highlighted)
    const leftGrad = ctx.createLinearGradient(-halfW, -halfH, 0, bladeBottom);
    leftGrad.addColorStop(0, '#FFFFFF');
    leftGrad.addColorStop(0.5, '#E2E8F0');
    leftGrad.addColorStop(1, '#94A3B8');

    ctx.beginPath();
    ctx.moveTo(0, -halfH); // Tip
    ctx.lineTo(-halfW, -halfH + 55); // Shoulder
    ctx.lineTo(-halfW + 6, bladeBottom);
    ctx.lineTo(0, bladeBottom);
    ctx.closePath();
    ctx.fillStyle = leftGrad;
    ctx.fill();

    // Right Blade Bevel (Shadowed)
    const rightGrad = ctx.createLinearGradient(0, -halfH, halfW, bladeBottom);
    rightGrad.addColorStop(0, '#CBD5E1');
    rightGrad.addColorStop(0.5, '#94A3B8');
    rightGrad.addColorStop(1, '#64748B');

    ctx.beginPath();
    ctx.moveTo(0, -halfH); // Tip
    ctx.lineTo(halfW, -halfH + 55); // Shoulder
    ctx.lineTo(halfW - 6, bladeBottom);
    ctx.lineTo(0, bladeBottom);
    ctx.closePath();
    ctx.fillStyle = rightGrad;
    ctx.fill();

    // Center Blade Spine Line
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(0, -halfH);
    ctx.lineTo(0, bladeBottom);
    ctx.stroke();

    // Crossguard
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.roundRect(-halfW - 4, bladeBottom, w + 8, 8, [3]);
    ctx.fill();

    // Handle
    const handleGrad = ctx.createLinearGradient(-halfW + 4, bladeBottom + 8, halfW - 4, halfH);
    handleGrad.addColorStop(0, '#334155');
    handleGrad.addColorStop(0.5, '#0F172A');
    handleGrad.addColorStop(1, '#1E293B');

    ctx.fillStyle = handleGrad;
    ctx.beginPath();
    ctx.roundRect(-halfW + 5, bladeBottom + 8, w - 10, halfH - bladeBottom - 18, [4]);
    ctx.fill();

    // Handle Grip Ridges
    ctx.fillStyle = '#020617';
    for (let y = bladeBottom + 16; y < halfH - 16; y += 9) {
      ctx.fillRect(-halfW + 7, y, w - 14, 3);
    }

    // Pommel
    ctx.fillStyle = '#94A3B8';
    ctx.beginPath();
    ctx.roundRect(-halfW + 4, halfH - 10, w - 8, 10, [2, 2, 6, 6]);
    ctx.fill();
  },

  drawDamascusKnife(ctx, w, h) {
    const halfW = w / 2;
    const halfH = h / 2;
    const bladeBottom = 12;

    // Damascus Wavy Blade
    const damascusGrad = ctx.createLinearGradient(-halfW, -halfH, halfW, bladeBottom);
    damascusGrad.addColorStop(0, '#E2E8F0');
    damascusGrad.addColorStop(0.2, '#64748B');
    damascusGrad.addColorStop(0.4, '#F8FAFC');
    damascusGrad.addColorStop(0.6, '#475569');
    damascusGrad.addColorStop(0.8, '#CBD5E1');
    damascusGrad.addColorStop(1, '#334155');

    ctx.beginPath();
    ctx.moveTo(0, -halfH);
    ctx.lineTo(-halfW, -halfH + 50);
    ctx.lineTo(-halfW + 5, bladeBottom);
    ctx.lineTo(halfW - 5, bladeBottom);
    ctx.lineTo(halfW, -halfH + 50);
    ctx.closePath();
    ctx.fillStyle = damascusGrad;
    ctx.fill();

    // Acid Etched Wave Lines
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.5)';
    for (let y = -halfH + 20; y < bladeBottom; y += 12) {
      ctx.beginPath();
      ctx.moveTo(-halfW + 6, y);
      ctx.bezierCurveTo(-halfW / 2, y + 8, halfW / 2, y - 8, halfW - 6, y);
      ctx.stroke();
    }

    // Brass Bolster
    ctx.fillStyle = '#D4AF37';
    ctx.fillRect(-halfW - 2, bladeBottom, w + 4, 8);

    // Rosewood Handle
    const woodHandle = ctx.createLinearGradient(-halfW + 5, 0, halfW - 5, 0);
    woodHandle.addColorStop(0, '#5C1D11');
    woodHandle.addColorStop(0.5, '#822818');
    woodHandle.addColorStop(1, '#42140C');
    ctx.fillStyle = woodHandle;
    ctx.beginPath();
    ctx.roundRect(-halfW + 5, bladeBottom + 8, w - 10, halfH - bladeBottom - 18, [5]);
    ctx.fill();

    // Brass Pommel
    ctx.fillStyle = '#D4AF37';
    ctx.beginPath();
    ctx.roundRect(-halfW + 4, halfH - 10, w - 8, 10, [2, 2, 6, 6]);
    ctx.fill();
  },

  drawCyberKnife(ctx, w, h) {
    const halfW = w / 2;
    const halfH = h / 2;
    const bladeBottom = 12;

    // Dark Titanium Blade
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.moveTo(0, -halfH);
    ctx.lineTo(-halfW, -halfH + 45);
    ctx.lineTo(-halfW + 4, bladeBottom);
    ctx.lineTo(halfW - 4, bladeBottom);
    ctx.lineTo(halfW, -halfH + 45);
    ctx.closePath();
    ctx.fill();

    // Glowing Cyan Core Groove
    ctx.shadowColor = '#00F2FE';
    ctx.shadowBlur = 15;
    ctx.strokeStyle = '#00F2FE';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -halfH + 15);
    ctx.lineTo(0, bladeBottom - 4);
    ctx.stroke();

    ctx.shadowColor = 'transparent';

    // Carbon Grip
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.roundRect(-halfW + 5, bladeBottom + 6, w - 10, halfH - bladeBottom - 16, [3]);
    ctx.fill();

    // Neon Accent Rings on Grip
    ctx.fillStyle = '#00F2FE';
    ctx.fillRect(-halfW + 6, bladeBottom + 16, w - 12, 2);
    ctx.fillRect(-halfW + 6, bladeBottom + 32, w - 12, 2);
    ctx.fillRect(-halfW + 6, bladeBottom + 48, w - 12, 2);

    // Pommel
    ctx.fillStyle = '#334155';
    ctx.fillRect(-halfW + 4, halfH - 10, w - 8, 10);
  },

  drawKunai(ctx, w, h) {
    const halfW = w / 2;
    const halfH = h / 2;
    const bladeBottom = 0;

    // Diamond Leaf Blade
    const bladeGrad = ctx.createLinearGradient(-halfW - 4, 0, halfW + 4, 0);
    bladeGrad.addColorStop(0, '#E2E8F0');
    bladeGrad.addColorStop(0.5, '#94A3B8');
    bladeGrad.addColorStop(1, '#475569');

    ctx.beginPath();
    ctx.moveTo(0, -halfH); // Tip
    ctx.lineTo(-halfW - 6, -halfH + 50);
    ctx.lineTo(0, bladeBottom);
    ctx.lineTo(halfW + 6, -halfH + 50);
    ctx.closePath();
    ctx.fillStyle = bladeGrad;
    ctx.fill();

    // Center Ridge
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(0, -halfH);
    ctx.lineTo(0, bladeBottom);
    ctx.stroke();

    // Wrapped Handle
    ctx.fillStyle = '#F1F5F9';
    ctx.fillRect(-4, bladeBottom, 8, halfH - bladeBottom - 20);

    // Red Cord Wrap
    ctx.strokeStyle = '#DC2626';
    ctx.lineWidth = 3;
    for (let y = bladeBottom + 6; y < halfH - 22; y += 7) {
      ctx.beginPath();
      ctx.moveTo(-5, y);
      ctx.lineTo(5, y + 4);
      ctx.stroke();
    }

    // Finger Ring Pommel
    ctx.beginPath();
    ctx.arc(0, halfH - 10, 11, 0, Math.PI * 2);
    ctx.fillStyle = '#475569';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, halfH - 10, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#0A0D14';
    ctx.fill();
  },

  // --- OBSTACLE RENDERER (IRON SPIKE) ---

  renderSpike(ctx, w = 36, h = 90) {
    ctx.save();
    const halfW = w / 2;

    // Rusted oxidized iron gradient
    const ironGrad = ctx.createLinearGradient(-halfW, 0, halfW, 0);
    ironGrad.addColorStop(0, '#78281F');
    ironGrad.addColorStop(0.5, '#566573');
    ironGrad.addColorStop(1, '#1B2631');

    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(-halfW, 20);
    ctx.lineTo(-halfW + 4, 0);
    ctx.lineTo(halfW - 4, 0);
    ctx.lineTo(halfW, 20);
    ctx.closePath();
    ctx.fillStyle = ironGrad;
    ctx.fill();

    ctx.lineWidth = 3;
    ctx.strokeStyle = '#17202A';
    ctx.stroke();

    ctx.restore();
  },

  // --- COLLECTIBLE RENDERER (GLOSSY APPLE) ---

  renderApple(ctx, radius = 22) {
    ctx.save();

    // Drop shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;

    // Red Apple Body
    const appleGrad = ctx.createRadialGradient(-radius * 0.3, -radius * 0.3, 3, 0, 0, radius);
    appleGrad.addColorStop(0, '#FF6B8B');
    appleGrad.addColorStop(0.5, '#E60026');
    appleGrad.addColorStop(1, '#800014');

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = appleGrad;
    ctx.fill();

    ctx.shadowColor = 'transparent';

    // Specular Highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.ellipse(-radius * 0.35, -radius * 0.35, radius * 0.3, radius * 0.18, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    // Curved Stem
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#5D4037';
    ctx.beginPath();
    ctx.moveTo(0, -radius + 3);
    ctx.quadraticCurveTo(4, -radius - 10, 8, -radius - 12);
    ctx.stroke();

    // Green Leaf
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.ellipse(7, -radius - 8, 7, 3, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
};
