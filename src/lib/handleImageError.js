import { useDark } from "@vueuse/core";

export default function handleImageError(e) {
  const isDark = useDark();

  e.target.src = new URL(
    `/logo/${isDark.value ? "small-dark" : "small"}.svg`,
    import.meta.url,
  ).href;
}
