import { AgentWrapper } from '../../../types';
import { agent } from './agent';
import merlinImg from './map.png';
import { sounds } from './sounds';

const Merlin: AgentWrapper = {
  name: 'Merlin',
  image: merlinImg,
  config: agent,
  sounds,
};

export default Merlin;
