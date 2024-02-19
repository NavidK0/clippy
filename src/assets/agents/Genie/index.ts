import { AgentWrapper } from '../../../types';
import { agent } from './agent';
import genieImg from './map.png';
import { sounds } from './sounds';

const Genie: AgentWrapper = {
  name: 'Genie',
  image: genieImg,
  config: agent,
  sounds,
};

export default Genie;
