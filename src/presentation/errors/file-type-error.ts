export class FileTypeError extends Error {
  constructor() {
    super('Wrong file type')
    this.name = 'FileTypeError'
  }
}
