import { Vector2 } from "./math";

export function drawLine(
  ctx: CanvasRenderingContext2D,
  startPos: Vector2,
  endPos: Vector2,
  width?: number,
  strokeStyle?: string | CanvasGradient | CanvasPattern,
) {
  ctx.beginPath();

  ctx.moveTo(startPos.x, startPos.y);
  ctx.lineTo(endPos.x, endPos.y);
  if (width !== undefined) {
    ctx.lineWidth = width;
  }
  if (strokeStyle) {
    ctx.strokeStyle = strokeStyle;
  }
  ctx.stroke();

  ctx.closePath();
  ctx.lineWidth = 1;
}

export function drawCircle(
  ctx: CanvasRenderingContext2D,
  pos: Vector2,
  radius: number,
  strokeStyle?: string | CanvasGradient | CanvasPattern,
  fillStyle?: string | CanvasGradient | CanvasPattern,
) {
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2, true);
  if (!fillStyle && !strokeStyle) {
    ctx.fillStyle = "dark";
    ctx.fill();
  } else {
    if (fillStyle) {
      ctx.fillStyle = fillStyle;
      ctx.fill();
    }

    if (strokeStyle) {
      ctx.strokeStyle = strokeStyle;
      ctx.stroke();
    }
  }
  ctx.closePath();
}

export class App {
  onUpdate?: () => void;
  onDraw?: () => void;

  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  private reqAnimationId: number | null = null;
  private running: boolean = false;
  private previousTimeMs = 0;
  private currentTimeMs = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (ctx === null) {
      throw new Error("Could not get context");
    }

    this.ctx = ctx;
  }

  init() {
    this.resize();
  }

  start() {
    this.running = true;
    this.reqAnimationId = requestAnimationFrame(currentTimeMs => {
      this.loop(currentTimeMs);
    });
  }

  stop() {
    this.running = false;
  }

  getDeltaSeconds() {
    const deltaMs = this.currentTimeMs - this.previousTimeMs;
    return deltaMs / 1000;
  }

  getDimensions() {
    return new Vector2(this.canvas.width, this.canvas.height);
  }

  getContext() {
    return this.ctx;
  }

  private loop(currentTimeMs: number) {
    this.resize();
    this.previousTimeMs = this.currentTimeMs;
    this.currentTimeMs = currentTimeMs;

    this.onUpdate?.call(null);
    this.onDraw?.call(null);

    if (!this.running) {
      if (this.reqAnimationId !== null) {
        cancelAnimationFrame(this.reqAnimationId);
        this.reqAnimationId = null;
      }
      return;
    }
    this.reqAnimationId = requestAnimationFrame(this.loop.bind(this));
  }

  private resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
}
