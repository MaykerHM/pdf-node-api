import { MergeController } from './merge'
import { Blob } from 'node:buffer'

describe('Merge Controller', () => {
  test('Should return 400 if no files is provided', () => {
    const sut = new MergeController()
    const httpRequest = {
      files: [],
      body: {},
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new Error('Missing files'))
  })
  test('Should return 415 if non-pdf file is provided', () => {
    const sut = new MergeController()
    const blob1 = new Blob([''], { type: 'application/text' })
    const blob2 = new Blob([''], { type: 'application/pdf' })
    const httpRequest = {
      files: [blob1, blob2],
      body: {},
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(415)
    expect(httpResponse.body).toEqual(new Error('Wrong file type'))
  })
})
