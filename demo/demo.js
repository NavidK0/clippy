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
    // enableSounds: false,

    onSuccess: (agent) => {
      agent.show(false);
      agent.moveTo(500, 500);

      // Speak on click and start
      const speak = () => {
        const randomTalk = talks[~~(Math.random() * talks.length)];

        agent.speak(`I am ${agentName}!`);
        agent.delay(2000);

        agent.speak(`${randomTalk}`);
        agent.delay(2000);

        agent.animate();
      };

      $('.clippy-root').on('click', () => speak());
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
  $('.clippy-root').empty();
}

window.onload = () => {
  nextAgent();

  document.getElementById('next-agent').addEventListener('click', () => {
    destroy();
    nextAgent();
  });
};
