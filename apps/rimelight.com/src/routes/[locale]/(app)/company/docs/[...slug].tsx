import type { Component } from "solid-js";
import { useParams } from "@solidjs/router";
import { DocsPage } from "#components/docs/DocsPage";

/** /company/docs/<version>/<section>/<…path> */
export const DocPage: Component = () => {
  const params = useParams<{ locale: string; slug?: string }>();
  return <DocsPage path={params.slug} />;
};

export default DocPage;
