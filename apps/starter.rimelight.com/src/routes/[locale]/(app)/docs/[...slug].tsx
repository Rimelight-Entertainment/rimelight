import { useParams } from "@solidjs/router";
import { DocsPage } from "../../../../components/docs/DocsPage";

export default function DocsSlug() {
  const params = useParams<{ slug: string }>();
  return <DocsPage path={params.slug} />;
}
