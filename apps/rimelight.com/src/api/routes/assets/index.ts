import { Hono } from "hono"
import assetsGet from "./get"
import assetsPut from "./put"
import assetsDelete from "./delete"
import assetsMove from "./move"

const api = new Hono()
  .route("/", assetsGet)
  .route("/", assetsPut)
  .route("/", assetsDelete)
  .route("/", assetsMove)

export default api
