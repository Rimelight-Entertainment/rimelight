import type { Component } from "solid-js";
import { isSafeHttpUrl, toEmbedUrl } from "../../core/blocks/embed";
import type { BlockViewProps } from "./ParagraphBlock";

export const EmbedBlock: Component<BlockViewProps> = (props) => {
  const url = () => ((props.block.props?.["url"] as string | undefined) ?? "").trim();
  const caption = () => props.block.props?.["caption"] as string | undefined;
  const embedSrc = () => toEmbedUrl(url());

  return (
    <figure class="cms-embed my-6" data-block-id={props.block.id}>
      {embedSrc() ? (
        <div class="relative w-full aspect-video">
          <iframe
            src={embedSrc()!}
            title={caption() || "Embedded video"}
            class="absolute inset-0 size-full border-0"
            allow="accelerometer; encrypted-media; picture-in-picture"
            allowfullscreen
            loading="lazy"
            referrerpolicy="strict-origin-when-cross-origin"
          />
        </div>
      ) : isSafeHttpUrl(url()) ? (
        <a href={url()} rel="noopener noreferrer" class="break-all text-primary-700 underline">
          {url()}
        </a>
      ) : null}
      {caption() ? (
        <figcaption class="mt-2 text-center text-sm text-neutral-500">{caption()}</figcaption>
      ) : null}
    </figure>
  );
};
