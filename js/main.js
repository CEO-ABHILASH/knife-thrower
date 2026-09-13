/**
 * Knife Thrower - Application Entry Point & Responsive Canvas Driver
 */
window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas');

  // Instantiate Game Engine
  const game = new Game(canvas);

  // Retina / High-DPI Canvas Scaling
  function resizeCanvas() {
    const container = document.getElementById('game-container');
    const rect = container.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x for optimal mobile performance

    // Set backing store size
    canvas.width = 1080 * dpr;
    canvas.height = 1920 * dpr;

    // Scale canvas context to match reference coordinate system
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Resume Web Audio on first gesture
  const unlockAudio = () => {
    window.soundCtrl.resume();
    window.removeEventListener('pointerdown', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  };
  window.addEventListener('pointerdown', unlockAudio);
  window.addEventListener('keydown', unlockAudio);

  // Main Loop with Delta Time Accumulator & Clamping
  let lastTimestamp = performance.now();

  function gameLoop(currentTimestamp) {
    const rawDelta = (currentTimestamp - lastTimestamp) / 1000;
    lastTimestamp = currentTimestamp;

    // Clamp dt to avoid physics explosions during tab switching
    const dt = Math.min(rawDelta, 0.05);

    game.update(dt);
    game.render();

    requestAnimationFrame(gameLoop);
  }

  requestAnimationFrame(gameLoop);

  // Auto-pause when page loses visibility
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && game.currentState === game.STATE.PLAYING) {
      // Pause delta accumulation
      lastTimestamp = performance.now();
    }
  });
});
