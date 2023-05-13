import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HelperUtilsService {
  constructor() {}

  subText(str: string, txtSize: number) {
    if (str.length > txtSize) {
      return str.substring(0, txtSize) + '...';
    }
    
    return str; 
  }

  convertText(str: string) {
    if (str) {
      str = str.replace(/<\/p>/g, '').replace(/<p>/g, '')
    }
    return str
  }
}
