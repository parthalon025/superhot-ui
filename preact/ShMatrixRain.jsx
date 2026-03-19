import { useEffect, useRef } from "preact/hooks";

const COLUMN_SPACING = { low: 40, medium: 24, high: 14 };
const CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}|;:,.<>?";
const TRAIL_LENGTH = 12;
const FRAME_INTERVAL = 50; // ~20fps

export function ShMatrixRain({ active, density = "medium", class: className, children, ...rest }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const dropsRef = useRef([]);
  const lastFrameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const spacing = COLUMN_SPACING[density] || COLUMN_SPACING.medium;

    function resize() {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      const columns = Math.floor(rect.width / spacing);
      const currentDrops = dropsRef.current;
      const newDrops = new Array(columns);
      for (let i = 0; i < columns; i++) {
        newDrops[i] =
          i < currentDrops.length ? currentDrops[i] : Math.floor(Math.random() * -TRAIL_LENGTH);
      }
      dropsRef.current = newDrops;
    }

    const observer = new ResizeObserver(() => resize());
    observer.observe(container);
    resize();

    // Read --sh-phosphor from theme tokens
    const tempEl = document.createElement("span");
    tempEl.style.color = "var(--sh-phosphor)";
    container.appendChild(tempEl);
    const phosphorRgb = getComputedStyle(tempEl).color || "rgb(0, 212, 255)";
    tempEl.remove();
    // Extract r,g,b for alpha compositing
    const rgbMatch = phosphorRgb.match(/(\d+),\s*(\d+),\s*(\d+)/);
    const [pr, pg, pb] = rgbMatch ? [rgbMatch[1], rgbMatch[2], rgbMatch[3]] : [0, 212, 255];

    function draw(timestamp) {
      if (timestamp - lastFrameRef.current < FRAME_INTERVAL) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }
      lastFrameRef.current = timestamp;

      const drops = dropsRef.current;
      const width = canvas.width;
      const height = canvas.height;

      // Semi-transparent black rect to fade trail
      ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
      ctx.fillRect(0, 0, width, height);

      const fontSize = Math.max(10, spacing * 0.6);
      ctx.font = `${fontSize}px monospace`;

      for (let col = 0; col < drops.length; col++) {
        const x = col * spacing;
        const y = drops[col] * spacing;

        if (y >= 0 && y < height) {
          // Lead character — bright
          const leadChar = CHARS[Math.floor(Math.random() * CHARS.length)];
          ctx.fillStyle = `rgba(${pr}, ${pg}, ${pb}, 0.9)`;
          ctx.fillText(leadChar, x, y);
        }

        // Trail characters — dim
        for (let t = 1; t <= TRAIL_LENGTH; t++) {
          const trailY = y - t * spacing;
          if (trailY >= 0 && trailY < height) {
            const trailChar = CHARS[Math.floor(Math.random() * CHARS.length)];
            ctx.fillStyle = `rgba(${pr}, ${pg}, ${pb}, 0.15)`;
            ctx.fillText(trailChar, x, trailY);
          }
        }

        // Advance drop
        drops[col]++;

        // Reset when past bottom
        if (drops[col] * spacing > height && Math.random() > 0.98) {
          drops[col] = Math.floor(Math.random() * -TRAIL_LENGTH);
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    if (active) {
      rafRef.current = requestAnimationFrame(draw);
    }

    return () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      observer.disconnect();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [active, density]);

  return (
    <div
      ref={containerRef}
      class={["sh-matrix-rain", className].filter(Boolean).join(" ")}
      {...rest}
    >
      <canvas ref={canvasRef} class="sh-matrix-rain-canvas" aria-hidden="true" />
      {children}
    </div>
  );
}
