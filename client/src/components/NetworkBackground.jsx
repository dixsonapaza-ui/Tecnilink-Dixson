import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const NODE_LABELS = ['👤', '🔧', '📋', '✅', '💬', '🔗'];

const generateNodes = (count, width, height) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.25, // Un poco más lento para mejor estética con puntos grandes
    vy: (Math.random() - 0.5) * 0.25,
    radius: Math.random() * 3 + 4, // Puntos más grandes (de 4px a 7px)
    label: NODE_LABELS[i % NODE_LABELS.length],
    opacity: Math.random() * 0.4 + 0.3, // Un poco más visibles
  }));
};

const CONNECTION_DISTANCE = 180;
const PULSE_INTERVAL = 3000;

export const NetworkBackground = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const nodesRef = useRef([]);
  const pulsesRef = useRef([]);
  const lastPulseRef = useRef(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    ctx.scale(dpr, dpr);

    const nodeCount = Math.min(Math.floor((dimensions.width * dimensions.height) / 18000), 50);
    nodesRef.current = generateNodes(nodeCount, dimensions.width, dimensions.height);

    const animate = (timestamp) => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      const nodes = nodesRef.current;
      const pulses = pulsesRef.current;

      // Update node positions
      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > dimensions.width) node.vx *= -1;
        if (node.y < 0 || node.y > dimensions.height) node.vy *= -1;

        node.x = Math.max(0, Math.min(dimensions.width, node.x));
        node.y = Math.max(0, Math.min(dimensions.height, node.y));
      }

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < CONNECTION_DISTANCE) {
            const opacity = (1 - distance / CONNECTION_DISTANCE) * 0.22; // Opacidad aumentada de 0.12 a 0.22
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(15, 23, 42, ${opacity})`;
            ctx.lineWidth = 1.0; // Grosor aumentado de 0.5 a 1.0
            ctx.stroke();
          }
        }
      }

      // Spawn pulses
      if (timestamp - lastPulseRef.current > PULSE_INTERVAL && nodes.length > 1) {
        lastPulseRef.current = timestamp;
        const startNode = nodes[Math.floor(Math.random() * nodes.length)];
        let closestNode = null;
        let closestDist = Infinity;

        for (const node of nodes) {
          if (node === startNode) continue;
          const dx = startNode.x - node.x;
          const dy = startNode.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DISTANCE && dist < closestDist) {
            closestDist = dist;
            closestNode = node;
          }
        }

        if (closestNode) {
          pulses.push({
            startX: startNode.x,
            startY: startNode.y,
            endX: closestNode.x,
            endY: closestNode.y,
            progress: 0,
            speed: 0.008,
          });
        }
      }

      // Draw and update pulses
      for (let i = pulses.length - 1; i >= 0; i--) {
        const pulse = pulses[i];
        pulse.progress += pulse.speed;

        if (pulse.progress >= 1) {
          pulses.splice(i, 1);
          continue;
        }

        const x = pulse.startX + (pulse.endX - pulse.startX) * pulse.progress;
        const y = pulse.startY + (pulse.endY - pulse.startY) * pulse.progress;
        const opacity = Math.sin(pulse.progress * Math.PI) * 0.6;

        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59, 130, 246, ${opacity})`;
        ctx.fill();

        // Glow effect
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 10);
        gradient.addColorStop(0, `rgba(59, 130, 246, ${opacity * 0.4})`);
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // Draw nodes
      for (const node of nodes) {
        // Outer glow
        const glowGradient = ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, node.radius * 4
        );
        glowGradient.addColorStop(0, `rgba(15, 23, 42, ${node.opacity * 0.15})`);
        glowGradient.addColorStop(1, 'rgba(15, 23, 42, 0)');
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 4, 0, Math.PI * 2);
        ctx.fillStyle = glowGradient;
        ctx.fill();

        // Node dot
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(15, 23, 42, ${node.opacity * 0.6})`;
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions]);

  return (
    <motion.div
      className="fixed inset-0 overflow-hidden pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5, ease: 'easeOut' }}
      style={{ zIndex: 0 }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{
          width: dimensions.width,
          height: dimensions.height,
        }}
      />
      {/* Subtle radial gradient overlay for depth */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(248, 250, 252, 0.4) 70%, rgba(248, 250, 252, 0.85) 100%)',
        }}
      />
    </motion.div>
  );
};
