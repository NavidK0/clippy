import { AgentWrapper } from '../../../types';
import { agent } from './agent';
import peedyImg from './map.png';
import { sounds } from './sounds';

const Peedy: AgentWrapper = {
  name: 'Peedy',
  image: peedyImg,
  config: agent,
  sounds,
};

export default Peedy;
