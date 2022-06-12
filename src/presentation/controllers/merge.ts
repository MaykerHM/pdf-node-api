import { HttpResponse, HttpRequest } from '../protocols/http'
import { FileTypeError } from '../erros/file-type-error'
import { MissingFilesError } from '../erros/missing-files-error'

export class MergeController {
  handle(httpRequest: HttpRequest): HttpResponse {
    const files = httpRequest.files
    if (files.length === 0) {
      return {
        statusCode: 400,
        body: new MissingFilesError(),
      }
    }
    const isAllPdfTypeFiles = files.reduce((accumulator, file) => {
      return accumulator && file.type === 'application/pdf'
    }, true)
    if (!isAllPdfTypeFiles) {
      console.log(files)
      return {
        statusCode: 415,
        body: new FileTypeError(),
      }
    }
  }
}
