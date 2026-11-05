import { describe, it, expect } from "vite-plus/test";
import { mountComponent } from "./utils/browser-render";
import { RLForm } from "../src/components/form/RLForm";

describe("RLForm", () => {
  it("renders a native form root", () => {
    const container = mountComponent(() => <RLForm />);
    expect(container.querySelector("form")).not.toBeNull();
  });

  it("renders its children inside the form", () => {
    const container = mountComponent(() => (
      <RLForm>
        <input name="email" />
      </RLForm>
    ));
    expect(container.querySelector("form input[name='email']")).not.toBeNull();
  });
});
