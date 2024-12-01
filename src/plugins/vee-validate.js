import { Field, Form, ErrorMessage } from "vee-validate";

export async function registerVeeValidate(app) {
  app.component("VeeField", Field);
  app.component("VeeForm", Form);
  app.component("VeeErrorMessage", ErrorMessage);
}
