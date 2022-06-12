import { HttpResponse } from '../protocols/http'

export const badRequest = (error: Error): HttpResponse => ({
  statusCode: 400,
  body: error,
})

export const unsupportedMediaType = (error: Error): HttpResponse => ({
  statusCode: 415,
  body: error,
})
