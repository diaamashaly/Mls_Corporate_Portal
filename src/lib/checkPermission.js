import { useRouter } from "vue-router";
import hasPermission from "./hasPermission";

export default function checkPermission(permission) {
  const router = useRouter();

  if (!hasPermission(permission)) {
    router.push("/permission-denied");
  }
}
