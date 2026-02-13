[English](./README.md) | [简体中文](./README-zh.md)

# 2D Physics Sandbox Game

一个基于 `Vite + TypeScript + matter.js` 的 2D 物理沙盒原型。
你可以先建造结构，再切换到破坏模式，观察碰撞、爆炸、断裂和粒子效果。

## 功能特性

- 双模式：`Build`（建造）和 `Destroy`（破坏）
- 建造系统：
- 材质：`wood`、`brick`、`stone`、`steel`、`glass`
- 形状：矩形、圆形、三角形
- 预设：高塔、墙体、桥梁
- 网格吸附与幽灵预览
- 破坏系统：
- 武器：炸弹、加农炮、破坏球、激光
- 基于碰撞的断裂与碎片
- 爆炸与碎屑粒子效果
- 相机与模拟控制：
- 右键拖拽平移、滚轮缩放
- 重力与时间倍率滑条
- 暂停/继续与重置场景

## 技术栈

- `Vite`
- `TypeScript`
- `matter-js`
- `HTML5 Canvas 2D`

## 快速开始

```bash
pnpm install
pnpm dev
```

默认开发地址通常是 `http://localhost:5173`（以终端输出为准）。

## 构建与预览

```bash
pnpm build
pnpm preview
```

## 操作说明

- 鼠标左键：放置方块 / 使用武器
- 鼠标右键 + 拖拽：平移相机
- 鼠标滚轮：缩放
- `Space`：暂停/继续模拟
- `G`：切换网格显示

## 项目结构

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

## 说明

- 包管理器：`pnpm`
- 应用入口：`src/main.ts`
- 物理世界管理：`src/core/Engine.ts`
- 输入与相机控制：`src/core/InputManager.ts`、`src/core/Camera.ts`
