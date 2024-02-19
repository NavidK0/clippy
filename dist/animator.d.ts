/// <reference types="jquery" />
/// <reference types="jquery" />
import { AgentWrapper } from './types';
export default class Animator {
    static States: {
        WAITING: number;
        EXITED: number;
    };
    private readonly $element;
    private readonly path;
    private readonly sounds;
    private overlays;
    private config;
    private currentFrameIndex;
    private currentFrame?;
    private currentAnimation?;
    currentAnimationName: string | undefined;
    private loopHandle?;
    private isExiting;
    private hasStarted;
    private onEnd?;
    constructor(el: JQuery, config: AgentWrapper, sounds: Array<string>);
    animations(): string[];
    preloadSounds(sounds: Array<string>): void;
    hasAnimation(name: string): boolean;
    exitAnimation(): void;
    showAnimation(animationName: string, stateChangeCallback: Function): boolean;
    pause(): void;
    resume(): void;
    private setupElement;
    private draw;
    private getNextAnimationFrame;
    private playSound;
    private isAtLastFrame;
    private stepFrame;
}
//# sourceMappingURL=animator.d.ts.map