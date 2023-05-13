import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class HelperService {
    constructor(public datepipe: DatePipe) {}

    formatDateView(dateData: Date): string {
        if (dateData) {
            let cvDate = new Date(dateData);
            let dayofweek = cvDate.getDay();

            const dayname = [
                'Chủ nhật',
                'Thứ 2',
                'Thứ 3',
                'Thứ 4',
                'Thứ 5',
                'Thứ 6',
                'Thứ 7',
            ];

            let currentDateTime = this.datepipe.transform(
                cvDate,
                'dd/MM/yyyy HH:mm:ss'
            );
            return dayname[dayofweek] + ', ' + currentDateTime?.toString();
        }

        return '';
    }
}
