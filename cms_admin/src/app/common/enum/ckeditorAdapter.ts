export default class Adapter {
    loader!: any;
    reader!: any;
    config!: any;
    constructor(loader: any, config: any) {
        this.loader = loader;
        this.config = config;
    }


    public async upload(): Promise<any> {
        const value = await this.loader.file;
        return this.read(value);
    }

    read(file: any) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = function () {
                resolve({ default: reader.result });
            };

            reader.onerror = function (error) {
                reject(error);
            };

            reader.onabort = function () {
                reject();
            };
            reader.readAsDataURL(file);
        });
    }

    abort() {
        if (this.reader) {
            this.reader.abort();
        }
    }
}
