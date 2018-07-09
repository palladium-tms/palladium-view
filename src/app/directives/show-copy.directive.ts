import {Directive, ElementRef, HostListener} from '@angular/core';

@Directive({
  selector: '[appShowCopy]'
})
export class ShowCopyDirective {
  z = 0;

  constructor(private el: ElementRef) { }

  @HostListener('mouseenter', ['$event']) onMouseEnter($event) {
    this.z = this.z + 1;
    // this.el.nativeElement.style.backgroundColor = 'yellow';
  }
  @HostListener('mouseleave', ['$event']) onMouseLeave($event) {
    if ((this.z - 10) >= 0) {
      console.log('lsfladskfkasd')
      this.z = 0;
    }
    // this.el.nativeElement.style.backgroundColor = 'red';
  }
}
