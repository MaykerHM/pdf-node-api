export class MergeController {
  handle(httpRequest: any): any {
    if (httpRequest.files.length === 0) {
      return {
        statusCode: 400,
        body: new Error('Missing files'),
      }
    }
  }
}
