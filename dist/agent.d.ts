import { AgentWrapper, LoadOptions } from './types';
export interface AgentOptions {
    agent: AgentWrapper;
    rootClass?: string | HTMLElement;
    allowDrag?: boolean;
    allowDoubleClick?: boolean;
    enableSounds?: boolean;
}
export declare function load(options: LoadOptions): void;
export default class Agent {
    private readonly $parentElement;
    private readonly $element;
    private readonly allowDrag;
    private readonly allowDoubleClick;
    private readonly enableSounds;
    private queue;
    private animator;
    private balloon;
    private isHidden;
    private idleDeferred?;
    private dragUpdateLoopHandle?;
    private offset;
    private targetX?;
    private targetY?;
    private onMouseMoved?;
    private onMouseUp?;
    constructor(options: AgentOptions);
    gestureAt(x: number, y: number): boolean;
    hide(fast?: boolean, callback?: () => void): void;
    moveTo(x: number | string, y: number | string, duration?: number): void;
    play(animation: any, timeout?: number, onComplete?: Function): boolean;
    show(fast?: boolean): boolean | undefined;
    speak(text: string, hold?: boolean): void;
    /**
     * Close the current balloon
     */
    closeBalloon(): void;
    delay(time: number): void;
    /**
     * Skips the current animation
     */
    stopCurrent(): void;
    stop(): void;
    hasAnimation(name: string): boolean;
    /**
     * Gets a list of animation names
     */
    animations(): string[];
    /**
     * Play a random animation
     * @return {Deferred}
     */
    animate(): any;
    reposition(): void;
    pause(): void;
    resume(): void;
    private getDirection;
    private playInternal;
    /**
     * Handle empty queue.
     * We need to transition the animation to an idle state
     * @private
     */
    private onQueueEmpty;
    private onIdleComplete;
    /**
     * Is the current animation state Idle?
     */
    private isIdleAnimation;
    /**
     * Gets a random Idle animation
     */
    private getIdleAnimation;
    private setupEvents;
    private onDoubleClick;
    private onMouse;
    private startDrag;
    private calculateClickOffset;
    private updateLocation;
    private dragMove;
    private finishDrag;
    private addToQueue;
}
//# sourceMappingURL=agent.d.ts.map