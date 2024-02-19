import './clippy.css';

import Agent, { load } from './agent';
import type Animator from './animator';
import type Balloon from './balloon';
import type Queue from './queue';
import { AgentType, AgentWrapper, Clippy } from './types';

const clippy: Clippy = {
  load,
  agents: {} as Record<AgentType, AgentWrapper>,
};

export type { Agent, Animator, Balloon, Queue };
export default clippy;
