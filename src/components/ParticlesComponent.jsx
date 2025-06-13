"use client";

import React, { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

export default function ParticlesComponent() {
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const options = {
    background: {
      color: {
        value: "transparent",
      },
    },
    fpsLimit: 60,
    interactivity: {
      events: {
        onHover: {
          enable: false, // <-- Mouse interactivity is OFF for a cleaner look
        },
        resize: true,
      },
    },
    particles: {
      color: {
        value: "00ffaa", // Simple white/icy particles
      },
      links: {
        enable: false, // <-- No lines connecting particles
      },
      move: {
        direction: "top", // Particles float upwards
        enable: true,
        outModes: {
          default: "out", // They disappear when they go off-screen
        },
        random: true, // A little randomness in their movement
        speed: 0.3, // Very slow and gentle
        straight: false,
      },
      number: {
        density: {
          enable: true,
          area: 800,
        },
        value: 60, // A smaller number of particles
      },
      opacity: {
        value: { min: 0.1, max: 0.5 }, // Varying transparency
      },
      shape: {
        type: "circle", // Simple circular particles
      },
      size: {
        value: { min: 1, max: 3 }, // Small particle sizes
      },
    },
    detectRetina: true,
  };

  return <Particles id="tsparticles" init={particlesInit} options={options} />;
}
