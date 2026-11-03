import { type Component } from "solid-js";
import { RLError } from "@rimelight/ui/components/error/RLError.tsx";

export const Error404Page: Component = () => <RLError status={404} />;

export default Error404Page;
