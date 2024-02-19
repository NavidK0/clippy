import { AgentWrapper } from '../../../types';
import { agent } from './agent';
import rockyImg from './map.png';
import { sounds } from './sounds';

const Rocky: AgentWrapper = {
  name: 'Rocky',
  image: rockyImg,
  config: agent,
  sounds,
};
export default Rocky;
