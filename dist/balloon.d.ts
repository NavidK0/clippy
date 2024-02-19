/// <reference types="jquery" />
/// <reference types="jquery" />
export default class Balloon {
    WORD_SPEAK_TIME: number;
    CLOSE_BALLOON_DELAY: number;
    BALLOON_MARGIN: number;
    private readonly $targetElement;
    private readonly $balloon;
    private readonly $content;
    private hidingHandle;
    private loopHandle;
    private isHidden;
    private isActive;
    private isHolding;
    private addWord?;
    private onComplete?;
    constructor(target: JQuery);
    reposition(): void;
    speak(text: string, hold?: boolean, onComplete?: Function): void;
    show(): void;
    hide(fast?: boolean): void;
    close(): void;
    pause(): void;
    resume(): void;
    /**
     * @param side
     * @private
     */
    private position;
    private isOut;
    private finishHideBalloon;
    private sayWords;
}
//# sourceMappingURL=balloon.d.ts.map