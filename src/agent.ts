import $ from 'jquery';

import Animator from './animator';
import { agents } from './assets/agents';
import Balloon from './balloon';
import Queue from './queue';
import { AgentWrapper, LoadOptions } from './types';

export interface AgentOptions {
  agent: AgentWrapper;

  rootClass?: string | HTMLElement;

  allowDrag?: boolean;
  allowDoubleClick?: boolean;
  enableSounds?: boolean;
}

export function load(options: LoadOptions) {
  const { name, onSuccess, onFail } = options || {};
  if (!name) {
    throw new Error('You must specify an agent to load.');
  }

  // Wrapper to the success callback
  agents[name]()
    .then((agentConfig: AgentWrapper) => {
      const a = new Agent({
        agent: agentConfig,
        rootClass: options?.rootClass,
        allowDrag: options?.allowDrag,
        allowDoubleClick: options?.allowDoubleClick,
      });

      if (onSuccess) onSuccess(a);
    })
    .catch((error: any) => {
      if (onFail) onFail(error);
    });
}

export default class Agent {
  private readonly $parentElement: JQuery;
  private readonly $element: JQuery;

  private readonly allowDrag: boolean = true;
  private readonly allowDoubleClick: boolean = true;
  private readonly enableSounds: boolean = true;

  private queue: Queue;
  private animator: Animator;
  private balloon: Balloon;

  private isHidden: boolean = false;
  private idleDeferred?: JQuery.Deferred<void>;

  private dragUpdateLoopHandle?: number;

  private offset: { top: number; left: number } = { top: 0, left: 0 };
  private targetX?: number;
  private targetY?: number;

  private onMouseMoved?: (e: MouseEvent) => void;
  private onMouseUp?: (e: MouseEvent) => void;

  constructor(options: AgentOptions) {
    const { agent } = options;

    this.queue = new Queue(this.onQueueEmpty.bind(this));

    if (!options.rootClass) options.rootClass = 'clippy-root';

    this.$parentElement = $('.clippy-root');
    if (!this.$parentElement.length)
      this.$parentElement = $(`<div class="${options.rootClass}"></div>`).appendTo(document.body);

    this.$element = $('<div class="clippy"></div>').appendTo(this.$parentElement);
    this.$element.hide();

    const agentSounds: string[] = [];

    this.enableSounds = options.enableSounds !== undefined ? options.enableSounds : this.enableSounds;

    if (this.enableSounds) {
      const audio = document.createElement('audio');
      const canPlayMp3 = !!audio.canPlayType && audio.canPlayType('audio/mpeg') !== '';

      if (canPlayMp3) {
        agentSounds.push(...Object.values(options.agent.sounds));
      }
    }

    if (options.allowDrag !== undefined) {
      this.allowDrag = options.allowDrag;
    }

    if (options.allowDoubleClick !== undefined) {
      this.allowDoubleClick = options.allowDoubleClick;
    }

    this.animator = new Animator(this.$element, agent, agentSounds);
    this.balloon = new Balloon(this.$element);

    this.setupEvents();
  }

  public width() {
    return this.$element.width()!;
  }

  public height() {
    return this.$element.height()!;
  }

  public gestureAt(x: number, y: number) {
    const d = this.getDirection(x, y);
    const gAnim = 'Gesture' + d;
    const lookAnim = 'Look' + d;

    const animation = this.hasAnimation(gAnim) ? gAnim : lookAnim;
    return this.play(animation);
  }

  public hide(fast: boolean = true, callback?: () => void) {
    this.isHidden = true;
    const el = this.$element;

    this.stop();

    if (fast) {
      this.$element.hide();
      this.stop();
      this.pause();

      if (callback) callback();
      return;
    }

    return this.playInternal('Hide', () => {
      el.hide();
      this.pause();

      if (callback) callback();
    });
  }

  public moveTo(x: number | string, y: number | string, duration?: number) {
    const dir = this.getDirection(x, y);
    const anim = 'Move' + dir;

    duration = duration !== undefined ? duration : 1000;

    this.addToQueue((complete: (this: HTMLElement) => void) => {
      // the simple case
      if (duration === 0) {
        this.$element.css({ top: y, left: x });
        this.reposition();

        complete.call(this.$element[0]);
        return;
      }

      duration = duration !== undefined ? duration : 1000;

      // no animations
      if (!this.hasAnimation(anim)) {
        this.$element.animate({ top: y, left: x }, duration, complete);
        return;
      }

      const callback = (_name: string, state: number) => {
        // when exited, complete
        if (state === Animator.States.EXITED) {
          complete.call(this.$element[0]);
        }

        duration = duration !== undefined ? duration : 1000;

        // if waiting,
        if (state === Animator.States.WAITING) {
          this.$element.animate({ top: y, left: x }, duration, () => {
            // after we're done with the movement, do the exit animation
            this.animator.exitAnimation();
          });
        }
      };

      this.playInternal(anim, callback);
    }, this);
  }

  public play(animation: any, timeout?: number, onComplete?: Function) {
    if (!this.hasAnimation(animation)) return false;
    if (timeout === undefined) timeout = 5000;

    this.addToQueue((complete: Function) => {
      let completed = false;
      // Handle callback
      const callback = (name: string, state: number) => {
        if (state === Animator.States.EXITED) {
          completed = true;
          if (onComplete) onComplete();
          complete();
        }
      };

      // If has timeout, register a timeout function
      if (timeout) {
        setTimeout(() => {
          if (completed) return;
          // Exit after timeout
          this.animator.exitAnimation();
        }, timeout);
      }

      this.playInternal(animation, callback);
    }, this);

    return true;
  }

  public show(fast: boolean = true) {
    this.isHidden = false;

    if (fast) {
      this.$element.show();
      this.resume();
      this.onQueueEmpty();
      return;
    }

    const windowWidth = $(window).width()!;
    const windowHeight = $(window).height()!;
    const documentScrollTop = $(document).scrollTop()!;

    if (this.$element.css('top') === 'auto' || this.$element.css('left') !== 'auto') {
      const left = windowWidth * 0.8;
      const top = (windowHeight + documentScrollTop) * 0.8;
      this.$element.css({ top, left });
    }

    this.resume();
    return this.play('Show');
  }

  public speak(text: string, hold: boolean = false) {
    this.addToQueue((complete: Function) => {
      this.balloon.speak(text, hold, complete);
    }, this);
  }

  /**
   * Close the current balloon
   */
  public closeBalloon() {
    this.balloon.hide();
  }

  public delay(time: number) {
    time = time || 250;

    this.addToQueue((complete: Function) => {
      this.onQueueEmpty();
      setTimeout(complete, time);
    });
  }

  /**
   * Skips the current animation
   */
  public stopCurrent() {
    this.animator.exitAnimation();
    this.balloon.close();
  }

  public stop() {
    // Clear the queue
    this.queue.clear();
    this.animator.exitAnimation();
    this.balloon.hide();
  }

  public hasAnimation(name: string) {
    return this.animator.hasAnimation(name);
  }

  /**
   * Gets a list of animation names
   */
  public animations(): string[] {
    return this.animator.animations();
  }

  /**
   * Play a random animation
   * @return {Deferred}
   */
  public animate(): any {
    const animations = this.animations();
    const anim = animations[Math.floor(Math.random() * animations.length)];

    // skip idle animations
    if (anim.indexOf('Idle') === 0) {
      return this.animate();
    }
    return this.play(anim);
  }

  public reposition() {
    if (!this.$element.is(':visible')) return;

    const offset = this.$element.offset()!;
    const boundsHeight = this.$element.outerHeight()!;
    const boundsWidth = this.$element.outerWidth()!;

    const winWidth = $(window).width()!;
    const winHeight = $(window).height()!;
    const scrollTop = $(window).scrollTop()!;
    const scrollLeft = $(window).scrollLeft()!;

    let top = offset.top - scrollTop;
    let left = offset.left - scrollLeft;
    const margin = 5;

    if (top - margin < 0) {
      top = margin;
    } else if (top + boundsHeight + margin > winHeight) {
      top = winHeight - boundsHeight - margin;
    }

    if (left - margin < 0) {
      left = margin;
    } else if (left + boundsWidth + margin > winWidth) {
      left = winWidth - boundsWidth - margin;
    }

    this.$element.css({ left, top });

    // reposition balloon
    this.balloon.reposition();
  }

  public pause() {
    this.animator.pause();
    this.balloon.pause();
  }

  public resume() {
    this.animator.resume();
    this.balloon.resume();
  }

  private getDirection(x: number | string, y: number | string) {
    const offset = this.$element.offset();
    const h = this.$element.height();
    const w = this.$element.width();

    // check if percentage css and return Top if detected
    if (typeof x === 'string' && x.indexOf('%') > -1) return 'Top';
    if (offset === undefined || h === undefined || w === undefined) return 'Top';

    // remove all non numeric values from x and y
    x = parseInt(x as string, 10);
    y = parseInt(y as string, 10);

    const centerX = offset.left + w / 2;
    const centerY = offset.top + h / 2;

    const a = centerY - y;
    const b = centerX - x;

    const r = Math.round((180 * Math.atan2(a, b)) / Math.PI);

    // Left and Right are for the character, not the screen :-/
    if (r >= -45 && r < 45) return 'Right';
    if (r >= 45 && r < 135) return 'Up';
    if ((r >= 135 && r <= 180) || (r >= -180 && r < -135)) return 'Left';
    if (r >= -135 && r < -45) return 'Down';

    // sanity check
    return 'Top';
  }

  private playInternal(animation: any, callback: Function) {
    // if we're inside an idle animation,
    if (this.isIdleAnimation() && this.idleDeferred && this.idleDeferred.state() === 'pending') {
      this.idleDeferred.done(() => {
        this.playInternal(animation, callback);
      });

      this.animator.exitAnimation();
      return;
    }

    this.animator.showAnimation(animation, callback);
  }

  /**
   * Handle empty queue.
   * We need to transition the animation to an idle state
   * @private
   */
  private onQueueEmpty() {
    if (this.isHidden || this.isIdleAnimation()) return;
    const idleAnim = this.getIdleAnimation();
    this.idleDeferred = $.Deferred();

    this.animator.showAnimation(idleAnim, this.onIdleComplete.bind(this));
  }

  private onIdleComplete(name: string, state: number) {
    if (state === Animator.States.EXITED) {
      this.idleDeferred?.resolve();
    }
  }

  /**
   * Is the current animation state Idle?
   */
  private isIdleAnimation(): boolean {
    const c = this.animator.currentAnimationName;
    return !!(c && c.indexOf('Idle') === 0);
  }

  /**
   * Gets a random Idle animation
   */
  private getIdleAnimation() {
    const animations = this.animations();
    const r: string[] = [];

    for (let i = 0; i < animations.length; i++) {
      const a = animations[i];
      if (a.indexOf('Idle') === 0) {
        r.push(a);
      }
    }

    // pick one
    const idx = Math.floor(Math.random() * r.length);
    return r[idx];
  }

  private setupEvents() {
    window.addEventListener('resize', this.reposition.bind(this));

    if (this.allowDrag) {
      this.$element[0].addEventListener('mousedown', this.onMouse.bind(this));
    }

    if (this.allowDoubleClick) {
      this.$element[0].addEventListener('dblclick', this.onDoubleClick.bind(this));
    }
  }

  private onDoubleClick() {
    if (!this.play('ClickedOn')) {
      this.animate();
    }
  }

  private onMouse(e: MouseEvent) {
    e.preventDefault();
    this.startDrag(e);
  }

  private startDrag(e: MouseEvent) {
    // Pause animations
    this.pause();
    this.balloon.hide(true);
    this.offset = this.calculateClickOffset(e);

    this.onMouseMoved = this.dragMove.bind(this);
    this.onMouseUp = this.finishDrag.bind(this);

    window.addEventListener('mousemove', this.onMouseMoved);
    window.addEventListener('mouseup', this.onMouseUp);

    this.dragUpdateLoopHandle = window.setTimeout(this.updateLocation.bind(this), 10);
  }

  private calculateClickOffset(e: MouseEvent) {
    const mouseX = e.pageX;
    const mouseY = e.pageY;
    const o = this.$element.offset()!;

    return {
      top: mouseY - o.top,
      left: mouseX - o.left,
    };
  }

  private updateLocation() {
    if (this.targetX !== undefined && this.targetY !== undefined) {
      this.$element.css({ top: this.targetY, left: this.targetX });
    }

    this.dragUpdateLoopHandle = window.setTimeout(this.updateLocation.bind(this), 10);
  }

  private dragMove(e: MouseEvent) {
    e.preventDefault();

    const x = e.clientX - this.offset.left;
    const y = e.clientY - this.offset.top;

    this.targetX = x;
    this.targetY = y;
  }

  private finishDrag() {
    window.clearTimeout(this.dragUpdateLoopHandle);

    // Remove handles
    if (this.onMouseMoved) {
      window.removeEventListener('mousemove', this.onMouseMoved);
    }
    if (this.onMouseUp) {
      window.removeEventListener('mouseup', this.onMouseUp);
    }

    // Resume animations
    this.balloon.show();
    this.reposition();
    this.resume();
  }

  private addToQueue(func: Function, scope?: any) {
    if (scope) func = func.bind(scope);
    this.queue.enqueue(func);
  }
}
