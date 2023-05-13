export class UploadAdapter {
    private loader;
    constructor(loader: any) {
        this.loader = loader;
    }

    public upload(): Promise<any> {
        //"data:image/png;base64,"+ btoa(binaryString)
        return this.readThis(this.loader.file);
    }

    readThis(file: File): Promise<any> {
        let imagePromise: Promise<any> = new Promise((resolve: any) => {
            var myReader: FileReader = new FileReader();
            myReader.onloadend = (e) => {
                let image = myReader.result;
                return { default: 'data:image/png;base64,' + image };
                resolve();
            };
        });
        return imagePromise;
    }
}
