import { createScipTools } from './tools.js';
import type { CustomToolFactory, CustomTool } from '@mariozechner/pi-coding-agent';

const factory: CustomToolFactory = async (pi) => {
  const toolsOrPromise = createScipTools(pi);
  const tools = (toolsOrPromise instanceof Promise
    ? await toolsOrPromise
    : toolsOrPromise) as CustomTool | CustomTool[];

  return tools;
};

export default factory;
