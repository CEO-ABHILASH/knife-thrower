/**
 * Knife Thrower - Core Game Engine & Finite State Machine
 */
class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // Reference Canvas Space (1080 x 1920)
    this.V_WIDTH = 1080;
    this.V_HEIGHT = 1920;

    // Target Specs
    this.targetBaseX = 540;
    this.targetBaseY = 500;
    this.targetX = 540;
    this.targetY = 500;
    this.targetRadius = 185;
    this.targetRotation = 0;
    this.targetRecoilY = 0;
    this.targetPatternTime = 0;

    // Knife Launch Specs
    this.knifeSpawnY = 1560;
    this.knifeImpactY = 700;
    this.knifeSpeed = -3600; // px/sec
    this.knifeWidth = 42;
    this.knifeHeight = 140;

    // Game States
    this.STATE = {
      MENU: 'MENU',
      PLAYING: 'PLAYING',
      TRANSITION: 'TRANSITION',
      GAME_OVER: 'GAME_OVER',
      PAUSED: 'PAUSED'
    };
    this.currentState = this.STATE.MENU;

    // Player Data & Economy
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('knife_thrower_high_score') || '0', 10);
    this.apples = parseInt(localStorage.getItem('knife_thrower_apples') || '0', 10);
    this.unlockedSkins = JSON.parse(localStorage.getItem('knife_thrower_skins') || '["default"]');
    this.selectedSkin = localStorage.getItem('knife_thrower_selected_skin') || 'default';

    // Skin Definitions
    this.skinCatalog = [
      { id: 'default', name: 'Tactical Combat', cost: 0 },
      { id: 'damascus', name: 'Damascus Steel', cost: 25 },
      { id: 'cyber', name: 'Cyber Titanium', cost: 60 },
      { id: 'kunai', name: 'Shinobi Kunai', cost: 120 }
    ];

    // Progression State
    this.currentLevel = 1;
    this.levelConfig = null;
    this.remainingKnives = 0;
    this.totalKnivesForLevel = 0;

    // Active Entities
    this.embeddedKnives = []; // { angle, skinId }
    this.obstacles = [];      // { type, angle }
    this.applesOnTarget = []; // { angle }
    this.flyingKnife = null;  // { y, skinId }
    this.deflectedKnife = null;
    this.throwCooldown = 0;
    this.inputBuffered = false;

    // Game Feel & Juiciness
    this.particles = new ParticleSystem();
    this.screenShake = 0;
    this.freezeFrameTime = 0;
    this.lastHitTime = 0;
    this.comboCount = 0;

    // Target Entrance Animation
    this.targetSpawnOffset = 0;
    this.isSpawningTarget = false;

    // Initialize UI bindings
    this.bindUI();
    this.updateHUD();
  }

  // --- PROGRESSION & LEVEL SETUP ---

  loadLevel(stageNumber) {
    this.currentLevel = stageNumber;
    this.levelConfig = getLevelConfig(stageNumber);

    this.remainingKnives = this.levelConfig.knivesRequired;
    this.totalKnivesForLevel = this.levelConfig.knivesRequired;
    this.targetRotation = 0;
    this.targetPatternTime = 0;
    this.embeddedKnives = [];
    this.obstacles = [];
    this.applesOnTarget = [];
    this.flyingKnife = null;
    this.deflectedKnife = null;
    this.throwCooldown = 0;
    this.inputBuffered = false;

    // Pre-populate embedded items from level config
    for (const angle of this.levelConfig.preSetKnives) {
      this.embeddedKnives.push({ angle, skinId: 'default' });
    }
    for (const obs of this.levelConfig.obstacles) {
      this.obstacles.push({ type: obs.type, angle: obs.angle });
    }
    for (const appleAngle of this.levelConfig.apples) {
      this.applesOnTarget.push({ angle: appleAngle });
    }

    // Target entrance drop-down animation
    this.targetSpawnOffset = -800;
    this.isSpawningTarget = true;

    // Boss Warning Banner
    const bossBanner = document.getElementById('boss-banner');
    if (this.levelConfig.type === 'boss') {
      document.getElementById('boss-banner-name').textContent = this.levelConfig.bossTitle;
      bossBanner.classList.remove('hidden');
      setTimeout(() => bossBanner.classList.add('hidden'), 1800);
      this.triggerScreenShake(12);
    } else {
      bossBanner.classList.add('hidden');
    }

    this.renderAmmoIcons();
    this.updateHUD();
  }

  startNewGame() {
    this.score = 0;
    this.comboCount = 0;
    this.particles.reset();
    this.loadLevel(1);
    this.currentState = this.STATE.PLAYING;

    document.getElementById('screen-menu').classList.add('hidden');
    document.getElementById('screen-game-over').classList.add('hidden');
    document.getElementById('modal-skins').classList.add('hidden');
  }

  // --- INPUT HANDLING ---

  handleThrowInput() {
    if (this.currentState !== this.STATE.PLAYING) return;
    if (this.isSpawningTarget) return;

    // If knife already in flight, buffer this tap
    if (this.flyingKnife) {
      this.inputBuffered = true;
      return;
    }

    if (this.remainingKnives <= 0 || this.throwCooldown > 0) return;

    // Launch knife
    this.flyingKnife = {
      y: this.knifeSpawnY,
      skinId: this.selectedSkin
    };
    this.remainingKnives--;
    this.throwCooldown = 0.11; // 110ms minimum interval

    this.updateAmmoIcons();
    window.soundCtrl.playThrow();
  }

  // --- ROTATION MECHANICS ---

  updateTargetRotation(dt) {
    if (this.isSpawningTarget) {
      // Elastic drop-in entrance
      this.targetSpawnOffset += (0 - this.targetSpawnOffset) * 14 * dt;
      if (Math.abs(this.targetSpawnOffset) < 2) {
        this.targetSpawnOffset = 0;
        this.isSpawningTarget = false;
      }
    }

    this.targetPatternTime += dt;
    const baseSpeed = this.levelConfig.rotationSpeed;
    const pattern = this.levelConfig.rotationPattern;
    let currentOmega = baseSpeed;

    switch (pattern) {
      case 'sinusoid':
        // Smooth sine wave oscillation
        currentOmega = baseSpeed * (1 + 0.85 * Math.sin(this.targetPatternTime * 2.8));
        break;

      case 'stutter':
        // Fast rotation for 1.2s, smooth stop for 0.35s
        const cycle = this.targetPatternTime % 1.55;
        if (cycle < 1.2) {
          currentOmega = baseSpeed * 1.35;
        } else {
          // Eased deceleration
          const brakeProgress = (cycle - 1.2) / 0.35;
          currentOmega = baseSpeed * 1.35 * Math.max(0, 1 - brakeProgress * 3);
        }
        break;

      case 'reversal':
        // Reverses rotation direction every 2.4 seconds
        const revPhase = Math.sin(this.targetPatternTime * (Math.PI / 2.4));
        currentOmega = baseSpeed * revPhase * 1.2;
        break;

      case 'constant':
      default:
        currentOmega = baseSpeed;
        break;
    }

    this.targetRotation = CollisionEngine.normalizeAngle(this.targetRotation + currentOmega * dt);

    // Elastic target recoil dampening
    if (this.targetRecoilY !== 0) {
      this.targetRecoilY += (0 - this.targetRecoilY) * 22 * dt;
      if (Math.abs(this.targetRecoilY) < 0.2) this.targetRecoilY = 0;
    }
  }

  // --- MAIN UPDATE LOOP ---

  update(dt) {
    // Micro freeze-frame handling for impact punch
    if (this.freezeFrameTime > 0) {
      this.freezeFrameTime -= dt;
      return;
    }

    // Screen Shake decay
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - 40 * dt);
    }

    this.particles.update(dt);

    if (this.throwCooldown > 0) {
      this.throwCooldown -= dt;
    }

    // Update Deflected Knife tumbling away
    if (this.deflectedKnife) {
      this.deflectedKnife.x += this.deflectedKnife.vx * dt;
      this.deflectedKnife.y += this.deflectedKnife.vy * dt;
      this.deflectedKnife.vy += this.deflectedKnife.gravity * dt;
      this.deflectedKnife.rot += this.deflectedKnife.vrot * dt;
    }

    if (this.currentState !== this.STATE.PLAYING && this.currentState !== this.STATE.TRANSITION) {
      return;
    }

    this.updateTargetRotation(dt);

    // Flying Knife Update
    if (this.flyingKnife) {
      this.flyingKnife.y += this.knifeSpeed * dt;

      // Check Impact
      if (this.flyingKnife.y <= this.knifeImpactY) {
        this.resolveKnifeImpact();
      }
    }
  }

  // --- IMPACT & COLLISION RESOLUTION ---

  resolveKnifeImpact() {
    const result = CollisionEngine.checkCollision(
      this.targetRotation,
      this.embeddedKnives,
      this.obstacles,
      this.applesOnTarget
    );

    if (result.type === 'DEFLECT') {
      // Deflection & Game Over
      this.deflectedKnife = CollisionEngine.createDeflection(
        this.targetBaseX,
        this.targetBaseY + this.targetRadius
      );
      this.flyingKnife = null;
      this.inputBuffered = false;

      // Juice: Deflection SFX, Sparks, Shake
      window.soundCtrl.playMetalRicochet();
      this.particles.spawnMetalSparks(
        this.targetBaseX,
        this.targetBaseY + this.targetRadius,
        32
      );
      this.triggerScreenShake(20);
      this.freezeFrameTime = 0.04; // 40ms freeze

      // Trigger Game Over after knife tumbles
      this.currentState = this.STATE.GAME_OVER;
      setTimeout(() => this.showGameOver(result.reason), 650);

    } else {
      // Successful Embed!
      const embedAngle = result.impactAngle;
      this.embeddedKnives.push({
        angle: embedAngle,
        skinId: this.flyingKnife.skinId
      });
      this.flyingKnife = null;

      // Slice apple if collected
      if (result.slicedAppleIndex >= 0) {
        const apple = this.applesOnTarget.splice(result.slicedAppleIndex, 1)[0];
        this.apples += 2;
        this.score += 50;
        localStorage.setItem('knife_thrower_apples', this.apples);
        window.soundCtrl.playAppleSlice();
        this.particles.spawnAppleJuice(
          this.targetBaseX,
          this.targetBaseY + this.targetRadius,
          20
        );
        this.particles.spawnFloatingText('+50 🍎', this.targetBaseX, this.knifeImpactY - 40, '#FF334B', 1.2);
      }

      // Combo System
      const now = performance.now();
      if (now - this.lastHitTime < 450) {
        this.comboCount++;
        if (this.comboCount >= 2) {
          const comboMult = Math.min(5, this.comboCount);
          this.score += comboMult * 5;
          this.showComboAlert(`COMBO x${comboMult}!`);
          this.particles.spawnFloatingText(`+${comboMult * 5}`, this.targetBaseX + 60, this.knifeImpactY - 10, '#FFB300', 1.1);
        }
      } else {
        this.comboCount = 0;
      }
      this.lastHitTime = now;

      // Points & Juice
      this.score += 10;
      if (this.score > this.highScore) {
        this.highScore = this.score;
        localStorage.setItem('knife_thrower_high_score', this.highScore);
      }

      window.soundCtrl.playWoodImpact(this.comboCount);
      this.particles.spawnWoodSplinters(
        this.targetBaseX,
        this.targetBaseY + this.targetRadius,
        18
      );
      this.targetRecoilY = -7; // Upward kinetic nudge
      this.triggerScreenShake(5);
      this.freezeFrameTime = 0.025; // 25ms tactile freeze
      this.updateHUD();

      // Check Stage Clear
      if (this.remainingKnives <= 0) {
        this.handleStageClear();
      } else if (this.inputBuffered) {
        // Immediately fire buffered knife
        this.inputBuffered = false;
        this.handleThrowInput();
      }
    }
  }

  // --- STAGE CLEAR SHATTER ---

  handleStageClear() {
    this.currentState = this.STATE.TRANSITION;
    window.soundCtrl.playTargetShatter();
    this.triggerScreenShake(14);

    // Shatter target into exploding wedge shards
    this.particles.spawnTargetShards(
      this.targetBaseX,
      this.targetBaseY + this.targetRecoilY,
      this.targetRadius,
      this.levelConfig.targetTheme,
      this.embeddedKnives,
      8
    );

    // Clear target items
    this.embeddedKnives = [];
    this.obstacles = [];
    this.applesOnTarget = [];

    // Advance level after shatter animation
    setTimeout(() => {
      this.loadLevel(this.currentLevel + 1);
      this.currentState = this.STATE.PLAYING;
    }, 750);
  }

  // --- JUICE & SCREEN SHAKE ---

  triggerScreenShake(magnitude) {
    this.screenShake = magnitude;
  }

  showComboAlert(text) {
    const banner = document.getElementById('combo-banner');
    const label = document.getElementById('combo-text');
    label.textContent = text;
    banner.classList.remove('hidden');
    clearTimeout(this.comboTimer);
    this.comboTimer = setTimeout(() => banner.classList.add('hidden'), 700);
  }

  // --- RENDERING ---

  render() {
    const ctx = this.ctx;
    ctx.save();

    // Apply Screen Shake
    if (this.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * this.screenShake;
      const shakeY = (Math.random() - 0.5) * this.screenShake;
      ctx.translate(shakeX, shakeY);
    }

    // Clear Canvas
    ctx.clearRect(0, 0, this.V_WIDTH, this.V_HEIGHT);

    // Background Subtle Atmospheric Vignette
    this.renderBackground(ctx);

    // Render Rotating Target (if not shattered in transition)
    if (this.currentState !== this.STATE.TRANSITION) {
      this.renderTargetWithEntities(ctx);
    }

    // Render Particles (Splinters, Sparks, Shards, Texts)
    this.particles.render(ctx);

    // Render Active Flying Knife
    if (this.flyingKnife) {
      ctx.save();
      ctx.translate(this.targetBaseX, this.flyingKnife.y);
      ProceduralRenderer.renderKnife(ctx, this.flyingKnife.skinId, this.knifeWidth, this.knifeHeight);
      ctx.restore();
    }

    // Render Deflected Knife
    if (this.deflectedKnife) {
      ctx.save();
      ctx.translate(this.deflectedKnife.x, this.deflectedKnife.y);
      ctx.rotate(this.deflectedKnife.rot);
      ProceduralRenderer.renderKnife(ctx, this.selectedSkin, this.knifeWidth, this.knifeHeight);
      ctx.restore();
    }

    // Render Ready Knife at launcher (if playing and ammo remaining)
    if (this.currentState === this.STATE.PLAYING && this.remainingKnives > 0 && !this.flyingKnife) {
      ctx.save();
      ctx.translate(this.targetBaseX, this.knifeSpawnY);
      ProceduralRenderer.renderKnife(ctx, this.selectedSkin, this.knifeWidth, this.knifeHeight);
      ctx.restore();
    }

    ctx.restore();
  }

  renderBackground(ctx) {
    const bgGrad = ctx.createRadialGradient(
      this.targetBaseX, this.targetBaseY, 80,
      this.targetBaseX, this.targetBaseY, 900
    );
    bgGrad.addColorStop(0, '#151D2A');
    bgGrad.addColorStop(0.6, '#0B0F17');
    bgGrad.addColorStop(1, '#05070B');

    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, this.V_WIDTH, this.V_HEIGHT);

    // Subtle trajectory alignment guideline
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 12]);
    ctx.beginPath();
    ctx.moveTo(this.targetBaseX, this.targetBaseY + this.targetRadius);
    ctx.lineTo(this.targetBaseX, this.knifeSpawnY);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  renderTargetWithEntities(ctx) {
    const currentY = this.targetBaseY + this.targetRecoilY + this.targetSpawnOffset;

    ctx.save();
    ctx.translate(this.targetBaseX, currentY);
    ctx.rotate(this.targetRotation);

    // 1. Draw Target Disk
    ProceduralRenderer.renderTarget(ctx, this.levelConfig ? this.levelConfig.targetTheme : 'wood', this.targetRadius);

    // 2. Draw Embedded Knives
    for (const knife of this.embeddedKnives) {
      ctx.save();
      ctx.rotate(knife.angle);
      // Position knife protruding outward from target edge
      ctx.translate(0, this.targetRadius + (this.knifeHeight / 2 - 55));
      // Flip knife so handle points outward and blade is embedded
      ctx.rotate(Math.PI);
      ProceduralRenderer.renderKnife(ctx, knife.skinId, this.knifeWidth, this.knifeHeight);
      ctx.restore();
    }

    // 3. Draw Obstacles (Iron Spikes)
    for (const obs of this.obstacles) {
      ctx.save();
      ctx.rotate(obs.angle);
      ctx.translate(0, this.targetRadius);
      ProceduralRenderer.renderSpike(ctx, 36, 85);
      ctx.restore();
    }

    // 4. Draw Collectibles (Apples)
    for (const apple of this.applesOnTarget) {
      ctx.save();
      ctx.rotate(apple.angle);
      ctx.translate(0, this.targetRadius - 10);
      ProceduralRenderer.renderApple(ctx, 22);
      ctx.restore();
    }

    ctx.restore();
  }

  // --- UI SYNCHRONIZATION ---

  bindUI() {
    // Play Button
    document.getElementById('btn-play').addEventListener('click', () => {
      window.soundCtrl.playClick();
      this.startNewGame();
    });

    // Retry Button
    document.getElementById('btn-retry').addEventListener('click', () => {
      window.soundCtrl.playClick();
      this.startNewGame();
    });

    // Main Menu Button
    document.getElementById('btn-menu').addEventListener('click', () => {
      window.soundCtrl.playClick();
      this.currentState = this.STATE.MENU;
      document.getElementById('screen-game-over').classList.add('hidden');
      document.getElementById('screen-menu').classList.remove('hidden');
      this.updateHUD();
    });

    // Sound Toggle
    const soundBtn = document.getElementById('btn-sound');
    const soundIcon = document.getElementById('sound-icon');
    const updateSoundUI = (muted) => {
      soundIcon.textContent = muted ? '🔇' : '🔊';
    };
    updateSoundUI(window.soundCtrl.muted);

    soundBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const muted = window.soundCtrl.toggleMute();
      updateSoundUI(muted);
    });

    // Skin Shop Modal
    const skinsModal = document.getElementById('modal-skins');
    document.getElementById('btn-skins').addEventListener('click', (e) => {
      e.stopPropagation();
      window.soundCtrl.playClick();
      this.openSkinShop();
    });
    document.getElementById('btn-open-shop').addEventListener('click', (e) => {
      e.stopPropagation();
      window.soundCtrl.playClick();
      this.openSkinShop();
    });
    document.getElementById('hud-apples-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      window.soundCtrl.playClick();
      this.openSkinShop();
    });
    document.getElementById('btn-close-skins').addEventListener('click', () => {
      window.soundCtrl.playClick();
      skinsModal.classList.add('hidden');
    });

    // Keyboard Controls
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (this.currentState === this.STATE.MENU) {
          this.startNewGame();
        } else if (this.currentState === this.STATE.GAME_OVER) {
          this.startNewGame();
        } else if (this.currentState === this.STATE.PLAYING) {
          this.handleThrowInput();
        }
      }
    });

    // Pointer / Tap Controls on Canvas
    const handleTap = (e) => {
      if (this.currentState === this.STATE.PLAYING) {
        this.handleThrowInput();
      }
    };
    this.canvas.addEventListener('pointerdown', handleTap);
  }

  updateHUD() {
    document.getElementById('hud-score').textContent = this.score;
    document.getElementById('hud-apple-count').textContent = this.apples;
    document.getElementById('hud-stage-label').textContent = `STAGE ${this.currentLevel}`;
    document.getElementById('menu-high-score').textContent = this.highScore;
    document.getElementById('menu-apple-count').textContent = `🍎 ${this.apples}`;

    // Stage Progress Dots (Every 5th is Boss)
    const dotsContainer = document.getElementById('hud-stage-dots');
    dotsContainer.innerHTML = '';
    const tierStart = Math.floor((this.currentLevel - 1) / 5) * 5 + 1;

    for (let s = tierStart; s < tierStart + 5; s++) {
      const isBoss = s % 5 === 0;
      const dot = document.createElement('span');
      dot.className = isBoss ? 'boss-dot' : 'dot';
      if (isBoss) dot.textContent = '★';
      if (s === this.currentLevel) dot.classList.add('active');
      dotsContainer.appendChild(dot);
    }
  }

  renderAmmoIcons() {
    const list = document.getElementById('ammo-list');
    list.innerHTML = '';
    for (let i = 0; i < this.totalKnivesForLevel; i++) {
      const knifeEl = document.createElement('div');
      knifeEl.className = 'ammo-knife';
      list.appendChild(knifeEl);
    }
  }

  updateAmmoIcons() {
    const list = document.getElementById('ammo-list');
    const knives = list.children;
    const usedCount = this.totalKnivesForLevel - this.remainingKnives;
    for (let i = 0; i < knives.length; i++) {
      if (i < usedCount) {
        knives[i].classList.add('used');
      } else {
        knives[i].classList.remove('used');
      }
    }
  }

  showGameOver(reason) {
    document.getElementById('game-over-reason').textContent = reason || 'KNIFE DEFLECTED';
    document.getElementById('game-over-score').textContent = this.score;
    document.getElementById('game-over-best').textContent = this.highScore;
    document.getElementById('game-over-stage').textContent = this.currentLevel;
    document.getElementById('screen-game-over').classList.remove('hidden');
  }

  openSkinShop() {
    document.getElementById('shop-apple-count').textContent = this.apples;
    const grid = document.getElementById('skins-grid');
    grid.innerHTML = '';

    for (const skin of this.skinCatalog) {
      const isUnlocked = this.unlockedSkins.includes(skin.id);
      const isSelected = this.selectedSkin === skin.id;

      const card = document.createElement('div');
      card.className = `skin-card ${isSelected ? 'selected' : ''}`;

      // Miniature preview canvas
      const previewCanvas = document.createElement('canvas');
      previewCanvas.className = 'skin-canvas-preview';
      previewCanvas.width = 50;
      previewCanvas.height = 90;
      const pctx = previewCanvas.getContext('2d');
      pctx.save();
      pctx.translate(25, 45);
      ProceduralRenderer.renderKnife(pctx, skin.id, 24, 75);
      pctx.restore();

      const nameEl = document.createElement('div');
      nameEl.className = 'skin-name';
      nameEl.textContent = skin.name;

      card.appendChild(previewCanvas);
      card.appendChild(nameEl);

      if (isSelected) {
        const statusEl = document.createElement('div');
        statusEl.className = 'skin-status';
        statusEl.textContent = 'EQUIPPED';
        card.appendChild(statusEl);
      } else if (isUnlocked) {
        const btnEquip = document.createElement('button');
        btnEquip.className = 'skin-status';
        btnEquip.textContent = 'EQUIP';
        btnEquip.onclick = (e) => {
          e.stopPropagation();
          this.selectedSkin = skin.id;
          localStorage.setItem('knife_thrower_selected_skin', skin.id);
          this.openSkinShop();
        };
        card.appendChild(btnEquip);
      } else {
        const btnBuy = document.createElement('button');
        btnBuy.className = 'skin-buy-btn';
        btnBuy.textContent = `🍎 ${skin.cost}`;
        btnBuy.onclick = (e) => {
          e.stopPropagation();
          if (this.apples >= skin.cost) {
            this.apples -= skin.cost;
            this.unlockedSkins.push(skin.id);
            this.selectedSkin = skin.id;
            localStorage.setItem('knife_thrower_apples', this.apples);
            localStorage.setItem('knife_thrower_skins', JSON.stringify(this.unlockedSkins));
            localStorage.setItem('knife_thrower_selected_skin', skin.id);
            this.updateHUD();
            this.openSkinShop();
          } else {
            alert('Not enough apples! Slice more apples during gameplay.');
          }
        };
        card.appendChild(btnBuy);
      }

      grid.appendChild(card);
    }

    document.getElementById('modal-skins').classList.remove('hidden');
  }
}
