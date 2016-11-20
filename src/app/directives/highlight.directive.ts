import {Directive, ElementRef, HostListener, Input, Renderer} from "@angular/core";

@Directive({
  selector: '[highlight]'
})
export class HighlightDirective {

  @Input() results: any[];
  private index: number = 0;

  constructor(private el: ElementRef, private renderer: Renderer) {
  }

  @Input('highlight') highlightColor: string;

  @HostListener('mouseenter') onMouseEnter() {
    this.highlight(this.el.nativeElement, true);
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.highlight(this.el.nativeElement, false);
  }

  private highlight(element: ElementRef, highlight: boolean) {
    highlight
    ? this.renderer.setElementStyle(element, 'backgroundColor', 'lightsteelblue')
    : this.renderer.setElementStyle(element, 'backgroundColor', 'white');
  }

}
