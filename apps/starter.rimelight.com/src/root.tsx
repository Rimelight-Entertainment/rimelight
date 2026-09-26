import { MetaProvider, Title, Meta, Link } from "@solidjs/meta"
import { Router } from "@solidjs/router"
import { FileRoutes } from "filesystem-routing"
import { Suspense, type Component } from "solid-js"
import "uno.css"

export interface RootProps {
  url?: string
  session?: any
}

export const Root: Component<RootProps> = (props) => {
  return (
    <MetaProvider>
      <html lang="en" class="h-full">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <Title>Rimelight Starter</Title>
          <Meta name="description" content="Welcome to Rimelight Starter!" />
          <Link
            rel="icon"
            type="image/svg+xml"
            href="https://cdn.rimelight.com/logos/logomark_color.svg"
          />
        </head>
        <body class="min-h-full bg-default text-default flex flex-col">
          <Router url={props.url}>
            <Suspense fallback={<div class="p-8 text-center text-muted">Loading...</div>}>
              <FileRoutes />
            </Suspense>
          </Router>
        </body>
      </html>
    </MetaProvider>
  )
}

export default Root
