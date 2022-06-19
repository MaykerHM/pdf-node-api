import { MergeController } from './merge'
import { Blob } from 'node:buffer'
import { MissingFilesError } from '../errors/missing-files-error'
import { FileTypeError } from '../errors/file-type-error'
import { PdfEditor } from '../protocols/pdf-editor'

interface SutTypes {
  sut: MergeController
  pdfEditorStub: PdfEditor
}

const makeSut = (): SutTypes => {
  class PdfEditorStub implements PdfEditor {
    merge(filesPath: string[]): Uint8Array {
      return new Uint8Array([255])
    }
  }
  const pdfEditorStub = new PdfEditorStub()
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
    expect(httpResponse.body).toEqual('Empty file')
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
    expect(httpResponse.body).toEqual('Empty file')
  })
})
