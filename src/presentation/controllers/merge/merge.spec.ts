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
    async merge(filesPath: string[]): Promise<Uint8Array> {
      return new Promise((resolve) => resolve(new Uint8Array([255])))
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
  test('Should return 400 if no files is provided', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      files: [],
      body: {},
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingFilesError())
  })
  test('Should return 415 if non-pdf file is provided', async () => {
    const { sut } = makeSut()
    const blob1 = new Blob([''], { type: 'application/text' })
    const blob2 = new Blob([''], { type: 'application/pdf' })
    const httpRequest = {
      files: [blob1, blob2],
      body: {},
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(415)
    expect(httpResponse.body).toEqual(new FileTypeError())
  })
  test('Should return 200 and a warning message if merged pdf is empty', async () => {
    const { sut, pdfEditorStub } = makeSut()
    jest
      .spyOn(pdfEditorStub, 'merge')
      .mockReturnValueOnce(
        new Promise((resolve) => resolve(new Uint8Array([])))
      )
    const blob1 = new Blob([''], { type: 'application/pdf' })
    const blob2 = new Blob([''], { type: 'application/pdf' })
    const httpRequest = {
      files: [blob1, blob2],
      body: {},
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(200)
    expect(httpResponse.body.message).toEqual('Empty file')
  })
  test('Should return 200 if merged pdf is not empty and a success', async () => {
    const { sut } = makeSut()
    const blob1 = new Blob(['x'], { type: 'application/pdf' })
    const blob2 = new Blob(['y'], { type: 'application/pdf' })
    const httpRequest = {
      files: [blob1, blob2],
      body: {},
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(200)
    expect(httpResponse.body.message).toEqual('Successfully merged pdf files')
  })
  test('Should return 500 if PdfEditor throws', async () => {
    const { sut, pdfEditorStub } = makeSut()
    jest.spyOn(pdfEditorStub, 'merge').mockImplementationOnce(async () => {
      return new Promise((resolve, reject) => reject(new Error()))
    })
    const blob1 = new Blob(['x'], { type: 'application/pdf' })
    const blob2 = new Blob(['y'], { type: 'application/pdf' })
    const httpRequest = {
      files: [blob1, blob2],
      body: {},
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })
})
