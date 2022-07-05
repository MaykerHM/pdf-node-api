import { PdfEditor } from './merge-protocols'
import { MergeController } from './merge'
import { MissingFilesError, FileTypeError, ServerError } from '../../errors'
import { Blob } from 'node:buffer'

interface SutTypes {
  sut: MergeController
  pdfEditorStub: PdfEditor
}
const makePdfEditor = (): PdfEditor => {
  class PdfEditorStub implements PdfEditor {
    merge(filesPath: string[]): Uint8Array {
      return new Uint8Array([255])
    }
  }
  return new PdfEditorStub()
}

const makeSut = (): SutTypes => {
  const pdfEditorStub = makePdfEditor()
  const sut = new MergeController(pdfEditorStub)
  return {
    sut,
    pdfEditorStub,
  }
}

describe('Merge Controller', () => {
  test('Should return 400 if no files is provided', () => {
    const { sut } = makeSut()
    const httpRequest = {
      files: [],
      body: {},
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingFilesError())
  })
  test('Should return 415 if non-pdf file is provided', () => {
    const { sut } = makeSut()
    const blob1 = new Blob([''], { type: 'application/text' })
    const blob2 = new Blob([''], { type: 'application/pdf' })
    const httpRequest = {
      files: [blob1, blob2],
      body: {},
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(415)
    expect(httpResponse.body).toEqual(new FileTypeError())
  })
  test('Should return 200 and a warning message if merged pdf is empty', () => {
    const { sut, pdfEditorStub } = makeSut()
    jest.spyOn(pdfEditorStub, 'merge').mockReturnValueOnce(new Uint8Array([]))
    const blob1 = new Blob([''], { type: 'application/pdf' })
    const blob2 = new Blob([''], { type: 'application/pdf' })
    const httpRequest = {
      files: [blob1, blob2],
      body: {},
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(200)
    expect(httpResponse.body.message).toEqual('Empty file')
  })
  test('Should return 200 if merged pdf is not empty and a success', () => {
    const { sut } = makeSut()
    const blob1 = new Blob(['x'], { type: 'application/pdf' })
    const blob2 = new Blob(['y'], { type: 'application/pdf' })
    const httpRequest = {
      files: [blob1, blob2],
      body: {},
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(200)
    expect(httpResponse.body.message).toEqual('Successfully merged pdf files')
  })
  test('Should return 500 if PdfEditor throws', () => {
    const { sut, pdfEditorStub } = makeSut()
    jest.spyOn(pdfEditorStub, 'merge').mockImplementationOnce(() => {
      throw new Error()
    })
    const blob1 = new Blob(['x'], { type: 'application/pdf' })
    const blob2 = new Blob(['y'], { type: 'application/pdf' })
    const httpRequest = {
      files: [blob1, blob2],
      body: {},
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })
})
