import api from "#api"
import { type APIContext } from "astro"

export async function POST({ request, params }: APIContext) {
  const path = "/" + (params.path || "")
  const url = new URL(request.url)
  url.pathname = path

  const modifiedRequest = new Request(url, {
    method: request.method,
    headers: request.headers,
    body: request.body
  })

  const response = await api.request(modifiedRequest)
  return response
}

export async function GET({ request, params }: APIContext) {
  const path = "/" + (params.path || "")
  const url = new URL(request.url)
  url.pathname = path

  const modifiedRequest = new Request(url, {
    method: request.method,
    headers: request.headers
  })

  const response = await api.request(modifiedRequest)
  return response
}
