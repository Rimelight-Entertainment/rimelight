import { Hono } from "hono"
import pagesList from "./list"
import pagesRead from "./read"
import pagesCreate from "./create"
import pagesUpdate from "./update"
import pagesPublish from "./publish"
import pagesUnpublish from "./unpublish"
import pagesDelete from "./delete"

const api = new Hono()
  .route("/", pagesList)
  .route("/", pagesRead)
  .route("/", pagesCreate)
  .route("/", pagesUpdate)
  .route("/", pagesPublish)
  .route("/", pagesUnpublish)
  .route("/", pagesDelete)

export default api
