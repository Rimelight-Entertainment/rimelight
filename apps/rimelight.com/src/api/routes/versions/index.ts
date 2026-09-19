import { Hono } from "hono"
import versionList from "./list"
import versionActions from "./actions"

const api = new Hono().route("/", versionList).route("/", versionActions)

export default api
