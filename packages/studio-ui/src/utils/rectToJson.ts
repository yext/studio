/**
 * This function is needed because {@link DOMRect.toJSON} does not exist in jest.
 * It also has better type safety than toJSON (which returns any).
 */
export default function rectToJson(rect: DOMRect) {
  return {
    x: rect.x,
    y: rect.y,
    bottom: rect.bottom,
    height: rect.height,
    left: rect.left,
    right: rect.right,
    top: rect.top,
    width: rect.width,
  };
}
