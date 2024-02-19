import { AgentWrapper } from '../../../types';
import { agent } from './agent';
import roverImg from './map.png';
import { sounds } from './sounds';

const Rover: AgentWrapper = {
  name: 'Rover',
  image: roverImg,
  config: agent,
  sounds,
};

export default Rover;
