import { twMerge } from "tailwind-merge";

const selectCssClasses =
  "disabled:bg-gray-100 border border-gray-400 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2";

export default function getSelectCssClasses(additionalClasses?: string) {
  return twMerge(selectCssClasses, additionalClasses);
}
