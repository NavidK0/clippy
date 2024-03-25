import clippy from '../dist/index.js';

const availableAgents = ['Bonzi', 'Clippy', 'F1', 'Genie', 'Genius', 'Links', 'Merlin', 'Peedy', 'Rocky', 'Rover'];
const talks = ['How can I help you?', 'Nice day!', 'Glad to meet you.', 'At your service', 'Hello'];

function nextAgent() {
  let agentName = availableAgents[Math.floor(Math.random() * availableAgents.length)];
  if (!agentName) return;

  clippy.load({
    name: agentName,

    // allowDrag: false,
    // allowDoubleClick: false,
    enableSounds: true,
    
    onSuccess: (agent) => {
      agent.moveTo('90%', '90%');
      agent.show(false);
      agent.play('Greeting');

      // Speak on click and start
      const speak = () => {
        const randomTalk = talks[~~(Math.random() * talks.length)];

        agent.speak(`I am ${agentName}!`);
        agent.delay(2000);

        agent.speak(`${randomTalk}`);
        agent.delay(2000);

        agent.animate();
      };

      document.querySelector('.clippy-root').addEventListener('click', () => speak());
      speak();

      // Animate randomly
      setInterval(
        () => {
          agent.animate();
        },
        3000 + Math.random() * 4000
      );
    },
  });
}

function destroy() {
  document.querySelector('.clippy-root').innerHTML = '';
}

window.onload = () => {
  nextAgent();

  document.getElementById('next-agent').addEventListener('click', () => {
    destroy();
    nextAgent();
  });
};
