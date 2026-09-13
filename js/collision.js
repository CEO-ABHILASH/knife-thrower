/**
 * Polar Angular & Continuous Collision Engine
 * Eliminates tunneling, enforces strict collision priority (OBSTACLE -> KNIFE -> LOG),
 * and calculates exact deterministic penetration angles.
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

  // Computes the exact local angle where an upward flying knife penetrates the target rim.
  // When drawing with ctx.rotate(angle) then translating outward along Y (0, radius),
  // the angle corresponding to world bottom (x=0, y=R) is exactly normalizeAngle(-targetRotation).
  getImpactLocalAngle(targetRotation) {
    return this.normalizeAngle(-targetRotation);
  },

  // Frame-rate independent Continuous Swept-Segment Penetration Check:
  // Detects if the blade tip's path from yPrev to yCurrent crossed the target's bottom boundary.
  checkSweptPenetration(yPrevTip, yCurrentTip, targetSurfaceY, margin = 28) {
    // Knife travels upward (y decreases: yPrevTip >= yCurrentTip)
    // Checks if interval [yCurrentTip, yPrevTip] overlaps target boundary with tolerance margin
    return yPrevTip >= (targetSurfaceY - margin) && yCurrentTip <= (targetSurfaceY + margin);
  },

  // Checks collision against all active embedded items on the target
  // Priority: OBSTACLE -> KNIFE -> APPLE (Slice & Stick) -> LOG (Stick)
  checkCollision(targetRotation, embeddedKnives, obstacles, apples) {
    const impactAngle = this.getImpactLocalAngle(targetRotation);
    const KNIFE_TOLERANCE = 0.22; // ~12.6 degrees
    const OBSTACLE_TOLERANCE = 0.28; // ~16 degrees
    const APPLE_TOLERANCE = 0.30; // ~17.2 degrees

    // 1. Check knife-to-obstacle collision FIRST (Iron Spike / Shield / Rock)
    for (const obs of obstacles) {
      const delta = this.angularDelta(impactAngle, obs.angle);
      if (delta < OBSTACLE_TOLERANCE) {
        let reason = 'KNIFE HIT OBSTACLE';
        if (obs.type === 'spike') reason = 'KNIFE HIT IRON SPIKE';
        else if (obs.type === 'shield') reason = 'DEFLECTED BY SHIELD';
        else if (obs.type === 'rock') reason = 'KNIFE HIT HARD ROCK';

        return {
          type: 'DEFLECT',
          obstacleType: obs.type || 'spike',
          hitItem: obs,
          reason: reason,
          impactAngle: impactAngle
        };
      }
    }

    // 2. Check knife-to-knife collision SECOND (Game Over)
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

    // 3. Check knife-to-apple collection THIRD (Bonus reward, knife still embeds!)
    let slicedAppleIndex = -1;
    for (let i = 0; i < apples.length; i++) {
      const delta = this.angularDelta(impactAngle, apples[i].angle);
      if (delta < APPLE_TOLERANCE) {
        slicedAppleIndex = i;
        break;
      }
    }

    // 4. Safe embed into Log
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
      vx: dir * (320 + Math.random() * 380),
      vy: 550 + Math.random() * 320, // bounces downward
      rot: 0,
      vrot: dir * (14 + Math.random() * 18),
      gravity: 2800
    };
  }
};
