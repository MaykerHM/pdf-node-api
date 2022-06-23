import { HttpResponse } from '../protocols/http'

export const badRequest = (error: Error): HttpResponse => ({
  statusCode: 400,
  body: error,
})

export const unsupportedMediaType = (error: Error): HttpResponse => ({
  statusCode: 415,
  body: error,
})

export const ok = (message: string, content?: any): HttpResponse => ({
  statusCode: 200,
  body: {
    message,
    content,
  },
})
