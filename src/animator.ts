import $ from 'jquery';

import { AgentConfig, AgentWrapper, ClippyAnimation, ClippyFrame } from './types';

export default class Animator {
  public static States = { WAITING: 1, EXITED: 0 };

  private readonly $element: JQuery;
  private readonly path: string;
  private readonly sounds: Record<string, HTMLAudioElement>;

  private overlays: JQuery[];

  private config: AgentConfig;

  private currentFrameIndex: number;
  private currentFrame?: ClippyFrame;
  private currentAnimation?: ClippyAnimation;
  public currentAnimationName: string | undefined;

  private loopHandle?: number;

  private isExiting: boolean;
  private hasStarted: boolean;

  private onEnd?: Function;

  constructor(el: JQuery, config: AgentWrapper, sounds: Array<string>) {
    this.$element = el;
    this.config = config.config;
    this.path = config.image;
    this.currentFrameIndex = 0;
    this.currentFrame = undefined;
    this.isExiting = false;
    this.currentAnimation = undefined;
    this.onEnd = undefined;
    this.hasStarted = false;
    this.sounds = {};
    this.currentAnimationName = undefined;

    this.preloadSounds(sounds);

    this.overlays = [this.$element];

    let curr = this.$element;

    this.setupElement(this.$element);

    for (let i = 1; i < this.config.overlayCount; i++) {
      const inner = this.setupElement($('<div></div>'));
      curr.append(inner);

      this.overlays.push(inner);

      curr = inner;
    }
  }

  public animations(): string[] {
    const r: string[] = [];
    const d = this.config.animations;

    for (const n in d) {
      r.push(n);
    }

    return r;
  }

  public preloadSounds(sounds: Array<string>) {
    for (let i = 0; i < this.config.sounds.length; i++) {
      const snd: string = this.config.sounds[i];
      const uri = sounds[i];

      if (!uri) continue;

      this.sounds[snd] = new Audio(uri);
    }
  }

  public hasAnimation(name: string) {
    return !!this.config.animations[name];
  }

  public exitAnimation() {
    this.isExiting = true;
  }

  public showAnimation(animationName: string, stateChangeCallback: Function) {
    this.isExiting = false;

    if (!this.hasAnimation(animationName)) {
      return false;
    }

    this.currentAnimation = this.config.animations[animationName];
    this.currentAnimationName = animationName;

    if (!this.hasStarted) {
      this.stepFrame();
      this.hasStarted = true;
    }

    this.currentFrameIndex = 0;
    this.currentFrame = undefined;
    this.onEnd = stateChangeCallback;

    return true;
  }

  public pause() {
    window.clearTimeout(this.loopHandle);
  }

  public resume() {
    this.stepFrame();
  }

  private setupElement(el: JQuery) {
    const frameSize = this.config.framesize;

    el.css('display', 'none');
    el.css({ width: frameSize[0], height: frameSize[1] });
    el.css('background', `url('${this.path}') no-repeat`);

    return el;
  }

  private draw() {
    let images: number[][] = [];
    if (this.currentFrame) images = this.currentFrame.images || [];

    for (let i = 0; i < this.overlays.length; i++) {
      if (i < images.length) {
        const xy = images[i];
        const bg = `${-xy[0]}px ${-xy[1]}px`;

        this.overlays[i].css({ 'background-position': bg, 'display': 'block' });
      } else {
        this.overlays[i].css('display', 'none');
      }
    }
  }

  private getNextAnimationFrame(): number {
    if (!this.currentAnimation) return 0;

    // No current frame. start animation.
    if (!this.currentFrame) return 0;

    const currentFrame = this.currentFrame;
    const branching = this.currentFrame.branching;

    if (this.isExiting && currentFrame.exitBranch !== undefined) {
      return currentFrame.exitBranch;
    } else if (branching) {
      let rnd = Math.random() * 100;

      for (let i = 0; i < branching.branches.length; i++) {
        const branch = branching.branches[i];

        if (rnd <= branch.weight) {
          return branch.frameIndex;
        }

        rnd -= branch.weight;
      }
    }

    return this.currentFrameIndex + 1;
  }

  private playSound() {
    const s = this.currentFrame?.sound;
    if (!s) return;

    const audio = this.sounds[s];

    if (audio) {
      audio.play().catch((e) => {
        if (e instanceof DOMException) {
          // Chrome doesn't allow playing sound from a non-user action
          // so we catch that exception and just don't do it.
          return;
        }

        console.error(e);
      });
    }
  }

  private isAtLastFrame() {
    return this.currentAnimation ? this.currentFrameIndex >= this.currentAnimation.frames.length - 1 : false;
  }

  private stepFrame() {
    if (!this.currentAnimation) return;

    const newFrameIndex = Math.min(this.getNextAnimationFrame(), this.currentAnimation.frames.length - 1);
    const frameChanged = !this.currentFrame || this.currentFrameIndex !== newFrameIndex;
    this.currentFrameIndex = newFrameIndex;

    // always switch frame data, unless we're at the last frame of an animation with a useExitBranching flag.
    if (!(this.isAtLastFrame() && this.currentAnimation.useExitBranching)) {
      this.currentFrame = this.currentAnimation.frames[this.currentFrameIndex];
    }

    this.draw();
    this.playSound();

    if (!this.currentFrame) return;

    this.loopHandle = window.setTimeout(this.stepFrame.bind(this), this.currentFrame.duration);

    // fire events if the frames changed and we reached an end
    if (this.onEnd && frameChanged && this.isAtLastFrame()) {
      if (this.currentAnimation.useExitBranching && !this.isExiting) {
        this.onEnd(this.currentAnimationName, Animator.States.WAITING);
      } else {
        this.onEnd(this.currentAnimationName, Animator.States.EXITED);
      }
    }
  }
}
