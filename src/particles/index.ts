import { App, drawCircle, drawLine } from "../utils/canvas";
import { pickRandom, randomRange, Vector2 } from "../utils/math";

class Particle {
  ctx: CanvasRenderingContext2D;

  pos: Vector2;
  vel: Vector2;
  radius: number;
  color?: string;

  constructor(
    ctx: CanvasRenderingContext2D,
    pos: Vector2,
    vel: Vector2,
    radius: number,
    color?: string,
  ) {
    this.ctx = ctx;
    this.pos = pos;
    this.radius = radius;
    this.vel = vel;
    this.radius = radius;
    this.color = color;
  }

  draw() {
    drawCircle(this.ctx, this.pos, this.radius, undefined, this.color);
  }

  update(deltaSeconds: number) {
    this.pos.add(this.vel.multiplied(deltaSeconds));
  }
}

export function startParticleSimulation(canvas: HTMLCanvasElement) {
  const app = new App(canvas);
  app.init();

  function getRandomVelocity() {
    const dirs = [
      new Vector2(-1, -1),
      new Vector2(1, 1),
      new Vector2(-1, 1),
      new Vector2(1, -1),
      new Vector2(0, 1),
      new Vector2(0, -1),
      new Vector2(-1, 0),
      new Vector2(1, 0),
    ];
    return pickRandom(dirs).normalized().multiplied(randomRange(2, 15));
  }

  function getRandomColor() {
    const colors = ["#333446", "#7F8CAA", "#B8CFCE"];
    return pickRandom(colors);
  }

  const points = new Array(100)
    .fill(0)
    .map(
      () =>
        new Particle(
          app.getContext(),
          Vector2.randomRange(Vector2.empty(), app.getDimensions()),
          getRandomVelocity(),
          randomRange(3, 5),
          getRandomColor(),
        ),
    );

  app.onUpdate = () => {
    for (const point of points) {
      point.update(app.getDeltaSeconds());

      // Screen wrapping
      const dimensions = app.getDimensions();
      if (point.pos.x > dimensions.x) {
        point.pos.x = 0;
      } else if (point.pos.x < 0) {
        point.pos.x = dimensions.x;
      }
      if (point.pos.y > dimensions.y) {
        point.pos.y = 0;
      } else if (point.pos.y < 0) {
        point.pos.y = dimensions.y;
      }
    }
  };

  app.onDraw = () => {
    for (const point of points) {
      let connectCount = 1;

      for (const other of points) {
        const distance = point.pos.distanceTo(other.pos);
        if (distance <= 60 && connectCount <= 2) {
          connectCount++;

          app.getContext().globalCompositeOperation = "destination-over";
          drawLine(
            app.getContext(),
            point.pos,
            other.pos,
            Math.min(point.radius, other.radius) - 1,
            "#e6e8e8",
          );
          app.getContext().globalCompositeOperation = "source-over";
        }
      }

      point.draw();
    }
  };

  app.start();
}
