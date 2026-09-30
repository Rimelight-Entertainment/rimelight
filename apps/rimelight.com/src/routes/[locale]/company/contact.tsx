import { type Component } from "solid-js";
import AppLayout from "#layouts/AppLayout";

export const CompanyContactPage: Component = () => {
  return (
    <AppLayout title="Contact Us" description="Get in touch with Rimelight Entertainment">
      <div class="max-w-7xl mx-auto px-4 py-16">
        <h1 class="text-4xl font-extrabold text-white">Contact Us</h1>
        <p class="text-neutral-400 mt-4 text-lg">
          Reach out for business inquiries, press, support, or partnerships.
        </p>
      </div>
    </AppLayout>
  );
};

export default CompanyContactPage;
