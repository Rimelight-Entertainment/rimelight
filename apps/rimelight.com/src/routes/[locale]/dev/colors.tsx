import { type Component } from "solid-js";
import DevLayout from "#layouts/DevLayout";
import ColorTestingMatrix from "../../../components/dev/ColorTestingMatrix.tsx";

export const DevColorsPage: Component = () => {
  return (
    <DevLayout
      title="Color & Intent Matrix"
      description="Rimelight UI hybrid OKLCH palette scales, intent matrices, and theme sandboxes"
      currentSection="colors"
      maxWidth="7xl"
    >
      <ColorTestingMatrix />
    </DevLayout>
  );
};

export default DevColorsPage;
