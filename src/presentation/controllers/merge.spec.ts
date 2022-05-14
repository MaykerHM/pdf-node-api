import { MergeController } from './merge'

describe('Merge Controller', () => {
  test('Should return 400 if no files is provided', () => {
    const sut = new MergeController()
    const httpRequest = {
      files: [],
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
  })
})
