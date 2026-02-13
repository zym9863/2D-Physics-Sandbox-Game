[English](./README.md) | [简体中文](./README-zh.md)

# 2D Physics Sandbox Game

A 2D physics sandbox prototype built with `Vite + TypeScript + matter.js`.
Build structures, switch to destroy mode, and watch collisions, explosions, fractures, and particles.

## Features

- Two game modes: `Build` and `Destroy`
- Build system:
- Materials: `wood`, `brick`, `stone`, `steel`, `glass`
- Shapes: rectangle, circle, triangle
- Presets: tower, wall, bridge
- Grid snap and ghost preview
- Destruction system:
- Weapons: bomb, cannon, wrecking ball, laser
- Collision-based fracture and debris
- Particle effects for explosion and debris
- Camera + simulation controls:
- Right-drag to pan, wheel to zoom
- Gravity and time-scale sliders
- Pause/resume and reset scene

## Tech Stack

- `Vite`
- `TypeScript`
- `matter-js`
- `HTML5 Canvas 2D`

## Getting Started

```bash
pnpm install
pnpm dev
```

Default dev URL is usually `http://localhost:5173` (check terminal output).

## Build and Preview

```bash
pnpm build
pnpm preview
```

## Controls

- Left click: place block / use weapon
- Right click + drag: pan camera
- Mouse wheel: zoom
- `Space`: pause/resume simulation
- `G`: toggle grid

## Project Structure

```text
src/
  main.ts
  style.css
  core/
    Engine.ts
    Renderer.ts
    Camera.ts
    InputManager.ts
  building/
    BuildSystem.ts
    Grid.ts
    Presets.ts
  physics/
    Materials.ts
    Explosion.ts
    Destruction.ts
  weapons/
    Bomb.ts
    Cannon.ts
    WreckingBall.ts
    Laser.ts
  effects/
    ParticleSystem.ts
  ui/
    TopBar.ts
    Toolbar.ts
    BottomBar.ts
```

## Notes

- Package manager: `pnpm`
- App entry: `src/main.ts`
- Physics world management: `src/core/Engine.ts`
- Input and camera handling: `src/core/InputManager.ts`, `src/core/Camera.ts`
