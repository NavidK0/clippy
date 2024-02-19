# Clippy

> Fork of a fork of a fork of a fork of the original clippy.js by https://www.smore.com/

![clippy-agents](https://user-images.githubusercontent.com/3016806/223058578-e4123bc3-0f4b-4913-a15d-d04e8be04525.png)

## Usage

### NPM / Webpack

```ts
import clippy from "clippy"

clippy.load({
  name: agentName,

  // allowDrag: false,
  // allowDoubleClick: false,
  // enableSounds: false,

  onSuccess: (agent) => {
    window[agentName] = agent;

    // Do something with the agent
    agent.show();

    // Move it instantly to start it from somewhere
    agent.moveTo(100, 100, 0);
  },
});
```

## Actions

All the agent actions are queued and executed by order, so you can stack them:

```js
// Play a given animation
agent.play("Searching");

// Play a random animation
agent.animate();

// Get a list of all the animations
agent.animations();
// => ["MoveLeft", "Congratulate", "Hide", "Pleased", "Acknowledge", ...]

// Show text balloon
agent.speak("When all else fails, bind some paper together. My name is Clippy.");

// Move to the given point, use animation if available
agent.moveTo(100, 100);

// Gesture at a given point (if gesture animation is available)
agent.gestureAt(200, 200);

// Stop the current action in the queue
agent.stopCurrent();

// Stop all actions in the queue and go back to idle mode
agent.stop();
```

## Special Thanks

- [pi0 for the original clippyJS implementation](https://github.com/pi0/clippyjs)
- The [Clippy.JS](http://smore.com/clippy-js) project by [Smore](http://smore.com)
- The awesome [Cinnamon Software](http://www.cinnamonsoftware.com/) for
  developing [Double Agent](http://doubleagent.sourceforge.net/)
  the program we used to unpack Clippy and his friends!
- Microsoft, for creating clippy :)

### Original Projects and Forks

- https://github.com/pi0/clippyjs
- https://github.com/lizozom/clippyts