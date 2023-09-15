import { ComponentMetadata } from '@yext/studio-plugin';
import useStudioStore from '../../store/useStudioStore';
import renderIconForType from '../common/renderIconForType';
import { ElementSelectorProps } from './ElementSelector';
import path from "path-browserify";
import { useCallback } from "react";

export default function AddElementOption({
  metadata,
  activeType,
  afterSelect,
}: {
  metadata: ComponentMetadata;
} & ElementSelectorProps) {
  const componentName = path.basename(metadata.filepath, ".tsx");

  const addComponent = useStudioStore((store) => {
    return store.actions.addComponent;
  });

  const handleSelect = useCallback(() => {
    addComponent(metadata);
    afterSelect?.();
  }, [afterSelect, addComponent, metadata]);

  return (
    <button
      className="flex items-center gap-x-2 px-6 py-2 cursor-pointer hover:bg-gray-100 w-full text-left"
      onClick={handleSelect}
      aria-label={`Add ${componentName} Element`}
    >
      {renderIconForType(activeType)}
      {componentName}
    </button>
  );
}
