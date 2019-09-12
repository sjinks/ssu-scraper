import request = require('request');

export = function req(url: string, options: request.CoreOptions): Promise<string> {
    return new Promise(function(resolve: (s: string) => void, reject: (e: Error) => void) {
        request(url, options, function(error: any, response: request.Response, body: any): void {
            if (error) {
                reject(error);
            } else if (response.statusCode !== 200) {
                reject(new Error(`HTTP Error ${response.statusCode} ${response.statusMessage}`));
            } else {
                resolve(typeof body === 'string' ? body : '');
            }
        });
    });
}
