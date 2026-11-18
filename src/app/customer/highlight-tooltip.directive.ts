import { Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[appHighlightTooltip]',
  standalone: true,
})
export class HighlightTooltipDirective {
  @Input('appHighlightTooltip') text = '';
  private tooltip?: HTMLElement;

  constructor(private el: ElementRef) {
    this.el.nativeElement.addEventListener('mouseenter', () => this.show());
    this.el.nativeElement.addEventListener('mouseleave', () => this.hide());
  }

  show() {
    this.tooltip = document.createElement('div');
    this.tooltip.innerHTML = this.text;
    this.tooltip.style.position = 'absolute';
    document.body.appendChild(this.tooltip);
  }

  hide() {
    this.tooltip?.remove();
  }
}
