import { AgentWrapper } from '../../../types';
import { agent } from './agent';
import linksImg from './map.png';
import { sounds } from './sounds';

const Links: AgentWrapper = {
  name: 'Links',
  image: linksImg,
  config: agent,
  sounds,
};

export default Links;
