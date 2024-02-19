import { AgentWrapper } from '../../../types';
import { agent } from './agent';
import bonziImg from './map.png';
import { sounds } from './sounds';

const Bonzi: AgentWrapper = {
  name: 'Bonzi',
  image: bonziImg,
  config: agent,
  sounds,
};

export default Bonzi;
