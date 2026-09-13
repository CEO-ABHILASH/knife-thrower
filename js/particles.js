/**
 * High Performance Particle Engine
 * Handles wood splinters, metal deflection sparks, fruit juices, and target fracture shards.
 */
class ParticleSystem {
  constructor() {
    this.particles = [];
    this.shards = [];
    this.floatingTexts = [];
  }

  reset() {
    this.particles = [];
    this.shards = [];
    this.floatingTexts = [];
  }

  // --- SPAWNERS ---

  spawnWoodSplinters(x, y, count = 16) {
    const colors = ['#C8963E', '#9E6E38', '#6B4226', '#E5B869', '#3D2314'];
    for (let i = 0; i < count; i++) {
      const angle = Math.PI / 2 + (Math.random() - 0.5) * 1.6; // Downward spread
      const speed = 250 + Math.random() * 450;
      this.particles.push({
        type: 'rect',
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        w: 3 + Math.random() * 4,
        h: 8 + Math.random() * 12,
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 20,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1.0,
        decay: 2.0 + Math.random() * 1.5,
        gravity: 1800
      });
    }
  }

  spawnMetalSparks(x, y, count = 28) {
    const colors = ['#FFFFFF', '#FFF7C2', '#FFAA00', '#FF3B30'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 350 + Math.random() * 600;
      this.particles.push({
        type: 'spark',
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        len: 8 + Math.random() * 16,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1.0,
        decay: 3.0 + Math.random() * 2.0,
        gravity: 600,
        drag: 0.93
      });
    }
  }

  spawnAppleJuice(x, y, count = 18) {
    const colors = ['#FF2A4B', '#FF5E7E', '#FFCAD4', '#85E35D'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 200 + Math.random() * 450;
      this.particles.push({
        type: 'circle',
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 3 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1.0,
        decay: 2.2 + Math.random() * 1.2,
        gravity: 1400
      });
    }

    // Spawn 2 tumbling apple halves
    for (let i = 0; i < 2; i++) {
      const dir = i === 0 ? -1 : 1;
      this.particles.push({
        type: 'apple_half',
        x: x,
        y: y,
        vx: dir * (180 + Math.random() * 150),
        vy: -150 - Math.random() * 200,
        side: i,
        rot: 0,
        vrot: dir * (8 + Math.random() * 10),
        life: 1.0,
        decay: 1.2,
        gravity: 2200
      });
    }
  }

  spawnTargetShards(centerX, centerY, radius, theme, embeddedKnives = [], count = 8) {
    const anglePerShard = (Math.PI * 2) / count;

    for (let i = 0; i < count; i++) {
      const startAngle = i * anglePerShard;
      const endAngle = (i + 1) * anglePerShard;
      const midAngle = (startAngle + endAngle) / 2;
      const speed = 400 + Math.random() * 350;

      // Find embedded knives attached to this shard slice
      const shardKnives = embeddedKnives.filter(k => {
        const normAngle = ((k.angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        return normAngle >= startAngle && normAngle < endAngle;
      });

      this.shards.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(midAngle) * speed,
        vy: Math.sin(midAngle) * speed - 200,
        startAngle,
        endAngle,
        radius,
        theme,
        rot: 0,
        vrot: (Math.random() - 0.5) * 12,
        knives: shardKnives,
        life: 1.0,
        decay: 1.1,
        gravity: 2400
      });
    }
  }

  spawnFloatingText(text, x, y, color = '#FFB300', scale = 1.0) {
    this.floatingTexts.push({
      text,
      x,
      y,
      vy: -180,
      color,
      scale,
      life: 1.0,
      decay: 1.5
    });
  }

  // --- UPDATE & RENDER ---

  update(dt) {
    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= p.decay * dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      if (p.drag) {
        p.vx *= Math.pow(p.drag, dt * 60);
        p.vy *= Math.pow(p.drag, dt * 60);
      }
      p.vy += p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.vrot) {
        p.rot += p.vrot * dt;
      }
    }

    // Update shards
    for (let i = this.shards.length - 1; i >= 0; i--) {
      const s = this.shards[i];
      s.life -= s.decay * dt;
      if (s.life <= 0) {
        this.shards.splice(i, 1);
        continue;
      }
      s.vy += s.gravity * dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.rot += s.vrot * dt;
    }

    // Update floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life -= ft.decay * dt;
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
        continue;
      }
      ft.y += ft.vy * dt;
    }
  }

  render(ctx) {
    ctx.save();

    // Render Shards
    for (const s of this.shards) {
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.rot);
      ctx.globalAlpha = Math.max(0, s.life);

      // Draw wedge slice
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, s.radius, s.startAngle, s.endAngle);
      ctx.closePath();

      // Theme coloring for shards
      if (s.theme === 'lemon') {
        ctx.fillStyle = '#F4D03F';
      } else if (s.theme === 'shield') {
        ctx.fillStyle = '#4A5568';
      } else if (s.theme === 'cheese') {
        ctx.fillStyle = '#F5B041';
      } else if (s.theme === 'compass') {
        ctx.fillStyle = '#B7950B';
      } else {
        ctx.fillStyle = '#A06835';
      }
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#2B170B';
      ctx.stroke();

      ctx.restore();
    }

    // Render Particles
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);

      if (p.type === 'rect') {
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      } else if (p.type === 'spark') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        const tailAngle = Math.atan2(p.vy, p.vx);
        ctx.lineTo(p.x - Math.cos(tailAngle) * p.len, p.y - Math.sin(tailAngle) * p.len);
        ctx.stroke();
      } else if (p.type === 'circle') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'apple_half') {
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = '#FF2A4B';
        ctx.beginPath();
        ctx.arc(0, 0, 16, -Math.PI / 2, Math.PI / 2, p.side === 0);
        ctx.closePath();
        ctx.fill();
        // Inner white pulp
        ctx.fillStyle = '#FFF8DC';
        ctx.beginPath();
        ctx.arc(0, 0, 11, -Math.PI / 2, Math.PI / 2, p.side === 0);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
    }

    // Render Floating Text with stroke outline for contrast against any target
    for (const ft of this.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.life);
      ctx.font = `900 ${Math.floor(36 * ft.scale)}px 'Outfit', sans-serif`;
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 10;
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#05070B';
      ctx.strokeText(ft.text, ft.x, ft.y);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }

    ctx.restore();
  }
}
