# Clippy

> Add Clippy or his friends to any website for instant nostalgia.

## Demos

Please be patient for first load. It may take some time as agents are loaded one by one.

- [Simple JSFiddle](https://jsfiddle.net/lizozomi/n5yz3jeb/23/)

![clippy-agents](https://user-images.githubusercontent.com/3016806/223058578-e4123bc3-0f4b-4913-a15d-d04e8be04525.png)

## Usage

### Demo

Run `npm run demo` to view the agent demo page.

### NPM / Webpack

```shell
npm install clippyts
```

```ts
import clippy from "clippyts"

clippy.load("Merlin", (agent: Agent) => {
  // Do anything with the loaded agent
  agent.show();
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