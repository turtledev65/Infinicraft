import "./style.css";
import { startParticleSimulation } from "./particles";
import { querrySelectorOrThrow } from "./utils/html";
import { startGame } from "./game";

// Background (Needs optimization)
const canvas = querrySelectorOrThrow<HTMLCanvasElement>("#particles");
startParticleSimulation(canvas);

// Game
startGame();
