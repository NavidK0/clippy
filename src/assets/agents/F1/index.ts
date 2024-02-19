import { AgentWrapper } from '../../../types';
import { agent } from './agent';
import f1Img from './map.png';
import { sounds } from './sounds';

const F1: AgentWrapper = {
  name: 'F1',
  image: f1Img,
  config: agent,
  sounds,
};

export default F1;
