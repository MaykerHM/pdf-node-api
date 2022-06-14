export class MissingFilesError extends Error {
  constructor() {
    super('Missing files')
    this.name = 'MissingFilesError'
  }
}
