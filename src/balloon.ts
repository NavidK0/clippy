import $ from 'jquery';

export default class Balloon {
  public WORD_SPEAK_TIME: number = 200;
  public CLOSE_BALLOON_DELAY: number = 2000;
  public BALLOON_MARGIN: number = 15;

  private readonly $targetElement: JQuery;
  private readonly $balloon: JQuery;
  private readonly $content: JQuery;

  private hidingHandle: number | null = null;
  private loopHandle: number | null = null;

  private isHidden: boolean;
  private isActive: boolean = true;
  private isHolding: boolean = false;

  private addWord?: (() => void) | null = null;
  private onComplete?: Function;

  constructor(target: JQuery) {
    this.$targetElement = target;
    this.isHidden = true;

    this.$balloon = $(
      '<div class="clippy-balloon"><div class="clippy-tip"></div><div class="clippy-content"></div></div> '
    ).hide();
    this.$content = this.$balloon.find('.clippy-content');

    target.parent().append(this.$balloon);
  }

  public reposition() {
    const sides = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

    for (let i = 0; i < sides.length; i++) {
      const s = sides[i];
      this.position(s);

      if (!this.isOut()) break;
    }
  }

  public speak(text: string, hold?: boolean, onComplete?: Function) {
    this.isHidden = false;

    this.show();

    const content = this.$content;

    if (!content) return;

    // set height to auto
    content.height('auto');
    content.width('auto');

    // add the text
    content.text(text);

    // update height and width
    content.height(content.height()!);
    content.width(content.width()!);
    content.text('');

    this.reposition();

    this.onComplete = onComplete;
    this.sayWords(text, hold, onComplete);
  }

  public show() {
    if (this.isHidden) return;

    this.$balloon.show();
  }

  public hide(fast?: boolean) {
    if (fast) {
      this.$balloon.hide();
      return;
    }

    this.hidingHandle = window.setTimeout(this.finishHideBalloon.bind(this), this.CLOSE_BALLOON_DELAY);
  }

  public close() {
    if (this.isActive) {
      this.isHolding = false;
    } else if (this.isHolding && this.onComplete) {
      this.onComplete();
    }
  }

  public pause() {
    if (this.loopHandle) {
      window.clearTimeout(this.loopHandle);
    }

    if (this.hidingHandle) {
      window.clearTimeout(this.hidingHandle);
      this.hidingHandle = null;
    }
  }

  public resume() {
    if (this.addWord) {
      this.addWord();
    } else if (!this.isHolding && !this.isHidden) {
      this.hidingHandle = window.setTimeout(this.finishHideBalloon.bind(this), this.CLOSE_BALLOON_DELAY);
    }
  }

  /**
   * @param side
   * @private
   */
  private position(side: string) {
    const o = this.$targetElement.offset()!;
    const h = this.$targetElement.height()!;
    const w = this.$targetElement.width()!;

    o.top -= $(window).scrollTop()!;
    o.left -= $(window).scrollLeft()!;

    const bH = this.$balloon.outerHeight()!;
    const bW = this.$balloon.outerWidth()!;

    this.$balloon.removeClass('clippy-top-left');
    this.$balloon.removeClass('clippy-top-right');
    this.$balloon.removeClass('clippy-bottom-right');
    this.$balloon.removeClass('clippy-bottom-left');

    let left: number | undefined;
    let top: number | undefined;

    switch (side) {
      case 'top-left':
        // right side of the balloon next to the right side of the agent
        left = o.left + w - bW;
        top = o.top - bH - this.BALLOON_MARGIN;
        break;
      case 'top-right':
        // left side of the balloon next to the left side of the agent
        left = o.left;
        top = o.top - bH - this.BALLOON_MARGIN;
        break;
      case 'bottom-right':
        // right side of the balloon next to the right side of the agent
        left = o.left;
        top = o.top + h + this.BALLOON_MARGIN;
        break;
      case 'bottom-left':
        // left side of the balloon next to the left side of the agent
        left = o.left + w - bW;
        top = o.top + h + this.BALLOON_MARGIN;
        break;
    }

    if (!top) return;
    if (!left) return;

    this.$balloon.css({ top, left });
    this.$balloon.addClass('clippy-' + side);
  }

  private isOut() {
    if (!this.$balloon) return false;

    const o = this.$balloon.offset()!;
    const bH = this.$balloon.outerHeight()!;
    const bW = this.$balloon.outerWidth()!;

    const wW = $(window).width()!;
    const wH = $(window).height()!;
    const sT = $(document).scrollTop()!;
    const sL = $(document).scrollLeft()!;

    const top = o.top - sT;
    const left = o.left - sL;
    const m = 5;

    if (top - m < 0 || left - m < 0) return true;

    return top + bH + m > wH || left + bW + m > wW;
  }

  private finishHideBalloon() {
    if (this.isActive) return;

    this.$balloon.hide();

    this.isHidden = true;
    this.hidingHandle = null;
  }

  private sayWords(text: string, hold?: boolean, complete?: Function) {
    this.isActive = true;
    this.isHolding = !!hold;
    const words = text.split(/[^\S-]/);
    const time = this.WORD_SPEAK_TIME;
    const el = this.$content;
    let idx = 1;

    if (!el) return;

    this.addWord = () => {
      if (!this.isActive) return;

      if (idx > words.length) {
        delete this.addWord;

        this.isActive = false;

        if (!this.isHolding) {
          complete?.();
          this.hide();
        }
      } else {
        el.text(words.slice(0, idx).join(' '));
        idx++;

        if (!this.addWord) return;

        this.loopHandle = window.setTimeout(this.addWord?.bind(this), time);
      }
    };

    this.addWord();
  }
}
