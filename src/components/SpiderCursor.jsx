import { useEffect, useRef } from "react";

const SpiderCursor = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let w, h;
    let animationFrameId;

    const { sin, cos, PI, hypot, min, max } = Math;

    // --- Helper Functions ---
    function rnd(x = 1, dx = 0) {
      return Math.random() * x + dx;
    }

    function pt(x, y) {
      return { x, y, len: 0, dist: 0 };
    }

    function many(n, f) {
      return [...Array(n)].map((_, i) => f(i));
    }

    function lerp(a, b, t) {
      return a + (b - a) * t;
    }

    function drawCircle(x, y, r) {
      ctx.beginPath();
      ctx.ellipse(x, y, r, r, 0, 0, PI * 2);
      ctx.fill();
    }

    // --- Core Spider Kinematics ---
    function spawn(index) {
      // Create a pool of "stepping stones" for the spider to grab onto
      const pts = many(80, () => pt(rnd(window.innerWidth), rnd(window.innerHeight)));

      let seed = rnd(100);
      let tx = window.innerWidth * 0.05; 
      let ty = window.innerHeight / 2;
      let x = window.innerWidth * 0.05;
      let y = window.innerHeight / 2;
      
      let kx = rnd(0.5, 0.5);
      let ky = rnd(0.5, 0.5);
      let walkRadius = pt(rnd(60, 40), rnd(80, 50));
      
      // Base radius of the spider body
      let r = 5; 

      // Space them out vertically if there are multiple
      const yOffset = index === 0 ? 0.3 : 0.7;

      return {
        tick(t) {
          // 1. Calculate Target Patrol Point (Drifting on the left side)
          tx = window.innerWidth * 0.05; 
          ty = window.innerHeight * yOffset + sin(t * 0.2 + seed) * 150;

          const selfMoveX = cos(t * kx + seed) * walkRadius.x;
          const selfMoveY = sin(t * ky + seed) * walkRadius.y;
          let fx = tx + selfMoveX;
          let fy = ty + selfMoveY;

          // Velocity and smoothing
          x += (fx - x) / 20;
          y += (fy - y) / 20;

          // Calculate body rotation angle based on movement direction
          const moveAng = Math.atan2(fy - y, fx - x);

          // 2. Recycle stepping stones that get left behind
          pts.forEach(p => {
            if (hypot(p.x - x, p.y - y) > 300) {
               p.x = x + rnd(400, -200);
               p.y = y + rnd(400, -200);
               p.len = 0;
            }
          });

          // 3. Find the 8 closest stepping stones to act as feet
          pts.forEach(p => {
             p.dist = hypot(p.x - x, p.y - y);
          });
          
          // Sort to find the absolute closest points
          const sortedPts = [...pts].sort((a, b) => a.dist - b.dist);
          const activeFeet = sortedPts.slice(0, 8); // A spider has exactly 8 legs!
          const inactiveFeet = sortedPts.slice(8);

          // Retract unused legs
          inactiveFeet.forEach(p => {
             p.len = max(0, p.len - 0.1);
          });

          // 4. Draw Spider Body (Two Segments)
          // Cephalothorax (Head/Torso)
          drawCircle(x, y, r);
          // Abdomen (Rear segment - hangs exactly opposite to the direction of movement)
          drawCircle(x - cos(moveAng) * r * 1.8, y - sin(moveAng) * r * 1.8, r * 1.4);

          // 5. Calculate 8 Leg Roots on the body
          const roots = many(8, (i) => {
             // Split 4 legs to the left, 4 to the right
             let side = i < 4 ? 1 : -1;
             let legIndex = i % 4; // 0, 1, 2, 3
             // Space them along the side of the body
             let ang = moveAng + side * (PI / 3 + (legIndex * PI / 8)); 
             return { x: x + cos(ang) * r, y: y + sin(ang) * r };
          });

          // 6. Map roots to feet and draw jointed legs
          activeFeet.forEach((pt, idx) => {
             pt.len = min(1, pt.len + 0.1);
             const root = roots[idx];
             
             ctx.beginPath();
             ctx.moveTo(root.x, root.y);

             // Calculate Midpoint for the "Knee" joint
             let mx = (root.x + pt.x) / 2;
             let my = (root.y + pt.y) / 2;
             
             // Push the knee outwards away from the body to look arachnid
             let outDx = mx - x;
             let outDy = my - y;
             let outDist = hypot(outDx, outDy) || 1;
             
             // Knee height stretches based on how far the leg is reaching
             let kneeH = pt.dist * 0.4; 
             let kneeX = mx + (outDx / outDist) * kneeH;
             let kneeY = my + (outDy / outDist) * kneeH;

             // Animate the leg extending (lerp)
             let currentFootX = lerp(root.x, pt.x, pt.len);
             let currentFootY = lerp(root.y, pt.y, pt.len);
             let currentKneeX = lerp(root.x, kneeX, pt.len);
             let currentKneeY = lerp(root.y, kneeY, pt.len);

             // Draw sharp joints
             ctx.lineTo(currentKneeX, currentKneeY);
             ctx.lineTo(currentFootX, currentFootY);
             ctx.stroke();

             // Draw small foot pad if fully extended
             if (pt.len > 0.9) {
                 drawCircle(pt.x, pt.y, 1.5);
             }
          });
        },
      };
    }

    // --- Initialization & Loop ---
    let spiders = many(2, (i) => spawn(i));

    function anim(t) {
      if (w !== window.innerWidth) w = canvas.width = window.innerWidth;
      if (h !== window.innerHeight) h = canvas.height = window.innerHeight;

      ctx.clearRect(0, 0, w, h);
      
      // Ultra-thin lines for a delicate, creepy web feel
      ctx.lineWidth = 0.8;
      
      // Light, ghostly opacity
      ctx.fillStyle = ctx.strokeStyle = "rgba(150, 150, 150, 0.25)"; 

      t /= 1000;
      spiders.forEach((spider) => spider.tick(t));
      animationFrameId = requestAnimationFrame(anim);
    }

    animationFrameId = requestAnimationFrame(anim);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-[9999]"
    />
  );
};

export default SpiderCursor;