import { AgentWrapper } from '../../../types';
import { agent } from './agent';
import clippyImg from './map.png';
import { sounds } from './sounds';

const Clippy: AgentWrapper = {
  name: 'Clippy',
  image: clippyImg,
  config: agent,
  sounds,
};

export default Clippy;
