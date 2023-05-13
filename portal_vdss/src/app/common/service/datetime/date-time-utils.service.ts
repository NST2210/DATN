import { DatePipe } from '@angular/common';
import { Injectable, Input } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DateTimeUtilsService {
  
  displayDetailDate(dateView: string) {
    let now = new Date(dateView);
    const day1 = now.getDay();
    let dayname = [
      'Chủ nhật',
      'Thứ 2',
      'Thứ 3',
      'Thứ 4',
      'Thứ 5',
      'Thứ 6',
      'Thứ 7',
    ];
    return dayname[day1];
  }
}