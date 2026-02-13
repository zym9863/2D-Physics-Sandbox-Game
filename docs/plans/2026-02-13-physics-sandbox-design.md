# 2D Physics Sandbox Game - Design Document

## Overview

A 2D physics destruction sandbox game built with Vite + TypeScript + matter.js. Players build structures using various materials, then destroy them with weapons and observe realistic physics effects.

## Tech Stack

- **Build**: Vite 8 + TypeScript 5.9
- **Physics**: matter.js (rigid body, collision detection, constraints)
- **Rendering**: HTML5 Canvas 2D
- **Package Manager**: pnpm

## Core Gameplay

Two modes:
- **Build Mode**: Place blocks of various materials to construct buildings
- **Destroy Mode**: Select weapons to destroy structures, observe physics

## Project Structure

```
src/
├── main.ts              # Entry: init engine and UI
├── style.css            # Global styles
├── core/
│   ├── Engine.ts        # Game engine (main loop, matter.js instance)
│   ├── Camera.ts        # Camera (pan, zoom)
│   └── InputManager.ts  # Unified input (mouse, keyboard)
├── physics/
│   ├── Materials.ts     # Material definitions (density, hardness, fracture threshold)
│   ├── Destruction.ts   # Destruction system (fracture, split logic)
│   └── Explosion.ts     # Explosion mechanics (shockwave, force propagation)
├── building/
│   ├── BuildSystem.ts   # Build system (place, rotate, delete)
│   ├── Presets.ts       # Preset structures (tower, bridge, wall)
│   └── Grid.ts          # Grid snap assist
├── weapons/
│   ├── Bomb.ts          # Bomb (placed, radius-adjustable explosion)
│   ├── Cannon.ts        # Cannon (fires from screen edge, adjustable angle/force)
│   ├── WreckingBall.ts  # Wrecking ball (high-altitude drop)
│   └── Laser.ts         # Laser (cuts bodies along path)
├── effects/
│   └── ParticleSystem.ts # Particles (explosion, debris, smoke, sparks)
└── ui/
    ├── Toolbar.ts       # Left sidebar tools
    ├── TopBar.ts        # Top bar (mode switch, controls)
    └── BottomBar.ts     # Bottom panel (gravity slider, speed control)
```

## Material System

| Material | Density | Hardness | Fracture Threshold | Color       |
|----------|---------|----------|--------------------|-------------|
| Wood     | Low     | Low      | Low                | Brown       |
| Brick    | Medium  | Medium   | Medium             | Red-brown   |
| Stone    | High    | High     | High               | Gray        |
| Steel    | V.High  | V.High   | V.High             | Silver-gray |
| Glass    | Medium  | Low      | V.Low              | Trans. blue |

Each material has distinct physics parameters (friction, restitution, break force) and produces corresponding debris/particles on fracture.

## Building System

- **Shapes**: Rectangle (resizable), circle, triangle
- **Placement**: Click to place, drag to adjust position/rotation
- **Presets**: One-click generate simple buildings (tower, bridge, wall)
- **Grid Snap**: Optional grid alignment for precise building

## Weapons

- **Bomb**: Click to place, explosion shockwave with adjustable radius
- **Cannon**: Fire projectiles from screen edge, adjustable angle and force
- **Wrecking Ball**: Heavy ball dropped from height
- **Laser**: Cutting line that splits matter.js bodies along path

## Particle Effects

- **Explosion**: Fire-colored particles expanding outward + shockwave ring
- **Fracture**: Material-colored debris flying
- **Smoke**: Gray semi-transparent particles slowly dissipating
- **Sparks**: Small particles on metal collision
- Particles are visual-only (no physics simulation), managed in simple arrays

## UI Layout

```
┌─────────────────────────────────────────┐
│  [Build Mode] [Destroy Mode]  [Reset] [Pause] │
├─────────┬───────────────────────────────┤
│ Toolbar │                               │
│ ------  │                               │
│ Brick   │        Canvas                 │
│ Wood    │        (Main game area)       │
│ Stone   │                               │
│ Steel   │                               │
│ Glass   │                               │
│ ------  │                               │
│ Bomb    │                               │
│ Cannon  │                               │
│ Ball    │                               │
│ Laser   │                               │
├─────────┼───────────────────────────────┤
│ Props   │  [Gravity Slider] [Speed]     │
└─────────┴───────────────────────────────┘
```

## Controls

- **Left Click**: Place object / Use weapon
- **Right Click**: Drag to pan canvas
- **Scroll Wheel**: Zoom in/out
- **Delete Key**: Delete selected object
- **Space**: Pause/resume simulation

## UI Style

Clean modern style, similar to Algodoo. Minimal toolbar + property panel.
