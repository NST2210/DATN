import { Observable, ReplaySubject } from 'rxjs';

export class FileUtils {
    constructor() {}

    public convertFileToBase64(file: File): Observable<string> {
        const result = new ReplaySubject<string>(1);
        const reader = new FileReader();
        reader.readAsBinaryString(file);
        reader.onload = (event: any) =>
            result.next(btoa(event.target.result.toString()));
        return result;
    }
}
