/**
 * Polar Angular Collision Engine
 * Eliminates tunneling at high rotation speeds with deterministic angular tolerances.
 */
const CollisionEngine = {
  // Normalizes an angle into [0, 2*PI)
  normalizeAngle(rad) {
    rad = rad % (Math.PI * 2);
    return rad < 0 ? rad + Math.PI * 2 : rad;
  },

  // Computes the shortest angular delta between two angles in radians
  angularDelta(a, b) {
    const diff = Math.abs(this.normalizeAngle(a) - this.normalizeAngle(b));
    return Math.min(diff, Math.PI * 2 - diff);
  },

  // Computes the local target angle where an upward flying knife lands
  // Knife impacts at the bottom of the target (screen angle +PI/2)
  getImpactLocalAngle(targetRotation) {
    return this.normalizeAngle(Math.PI / 2 - targetRotation);
  },

  // Checks collision against all active embedded items on the target
  checkCollision(targetRotation, embeddedKnives, obstacles, apples) {
    const impactAngle = this.getImpactLocalAngle(targetRotation);
    const KNIFE_TOLERANCE = 0.24; // ~13.75 degrees
    const OBSTACLE_TOLERANCE = 0.28; // ~16 degrees
    const APPLE_TOLERANCE = 0.28; // ~16 degrees

    // 1. Check knife-to-knife collision (Game Over)
    for (const knife of embeddedKnives) {
      const delta = this.angularDelta(impactAngle, knife.angle);
      if (delta < KNIFE_TOLERANCE) {
        return {
          type: 'DEFLECT',
          hitItem: knife,
          reason: 'KNIFE HIT KNIFE',
          impactAngle: impactAngle
        };
      }
    }

    // 2. Check knife-to-obstacle collision (Iron Spike / Shield - Game Over)
    for (const obs of obstacles) {
      const delta = this.angularDelta(impactAngle, obs.angle);
      if (delta < OBSTACLE_TOLERANCE) {
        return {
          type: 'DEFLECT',
          hitItem: obs,
          reason: 'KNIFE HIT IRON SPIKE',
          impactAngle: impactAngle
        };
      }
    }

    // 3. Check knife-to-apple collection (Bonus reward, knife still embeds!)
    let slicedAppleIndex = -1;
    for (let i = 0; i < apples.length; i++) {
      const delta = this.angularDelta(impactAngle, apples[i].angle);
      if (delta < APPLE_TOLERANCE) {
        slicedAppleIndex = i;
        break;
      }
    }

    // 4. Safe embed
    return {
      type: 'STICK',
      impactAngle: impactAngle,
      slicedAppleIndex: slicedAppleIndex
    };
  },

  // Generates randomized physical bounce kinematics for deflected knife
  createDeflection(originX, originY) {
    const dir = Math.random() > 0.5 ? 1 : -1;
    return {
      x: originX,
      y: originY,
      vx: dir * (300 + Math.random() * 350),
      vy: 600 + Math.random() * 300, // bounces downward
      rot: 0,
      vrot: dir * (12 + Math.random() * 16),
      gravity: 2600
    };
  }
};
