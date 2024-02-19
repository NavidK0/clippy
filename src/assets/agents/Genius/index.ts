import { AgentWrapper } from '../../../types';
import { agent } from './agent';
import geniusImg from './map.png';
import { sounds } from './sounds';

const Genius: AgentWrapper = {
  name: 'Genius',
  image: geniusImg,
  config: agent,
  sounds,
};

export default Genius;
