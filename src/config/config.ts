import { NODE_ENV, PORT } from "../constants.js";

interface Config {
  nodeEnv: string;
  port: number;
}

const config: Config = {
  nodeEnv: NODE_ENV,
  port: PORT,
};

export default config;
