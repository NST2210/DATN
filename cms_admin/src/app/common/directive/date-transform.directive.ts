import {
  Directive,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { DATE_CONSTANT } from '../shared/constants/date.constant';
import * as moment from 'moment';
import { Subject } from 'rxjs';

/**
 * @howToUse
 *
 *     <nz-date-picker [nzFormat]="DD/MM/YYYY" dateTransform>...</nz-date-picker>
 *
 */
@Directive({
  selector: '[dateTransform]',
})
export class DateTransformDirective implements OnInit, OnDestroy {
  private el: any;
  private destroy = new Subject<void>();
  private valueComplete = false;

  // @Input() nzFormat = DATE_CONSTANT.DDMMYYYY_SLASH_BIG;
  constructor(
    private elementRef: ElementRef,
  ) {
    this.el = this.elementRef.nativeElement;
  }

  ngOnInit(): void { }
  @HostListener('keyup', ['$event'])
  handleKeyboardEvent(event: any): void {
    const x = event.keyCode;
    if (x === 13) {
      event.preventDefault();
      event.stopPropagation();
    }
    // backspace, delete
    if (x === 8 || x === 46) {
      event.target.value = event.target.value.replace(/\D/g, '');
      this.el.value = event.target.value;
      return;
    }
    if (/[0-9]{8}/g.test(event.target.value)) {
      event.target.value = this.transform(event.target.value);
      this.el.value = event.target.value;
    }
  }

  transform(value: string): string {
    if (/[0-9]{8}/g.test(value)) {
      value = moment(value, DATE_CONSTANT.DDMMYYYY).format(
        DATE_CONSTANT.DDMMYYYY_SLASH_BIG
      );
      this.valueComplete = /^\d{2}\/\d{2}\/\d{4}$/g.test(value) && moment(value, DATE_CONSTANT.DDMMYYYY).isValid();
      if (!this.valueComplete) {
        value = '';
        this.valueComplete = false;
        // this.formControl.control.setErrors({ inValidDate: true });
        // this.formControl.control.markAllAsTouched();
      }
    }

    return value;
  }

  @HostListener('keypress', ['$event'])
  validateDateKeyPress(event: any): void {
    const pattern = /[0-9/]/;
    const inputChar = event.key;

    if (!pattern.test(inputChar)) {
      // invalid character, prevent input
      event.preventDefault();
    }

    const x = event.keyCode;
    // chặn nhập số khi đã nhập xong date
    const value = event?.target?.value;
    this.valueComplete = /^\d{2}\/?\d{2}\/?\d{4}$/g.test(value);
    if (this.valueComplete && ((x >= 48 && x <= 57) || (x >= 96 && x <= 105))) {
      event.preventDefault();
      event.stopPropagation();
    }

  }

  ngOnDestroy(): void {
    this.destroy.next();
  }
}
