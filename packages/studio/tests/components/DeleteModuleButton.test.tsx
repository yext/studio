import { fireEvent, render, screen } from '@testing-library/react';
import { FileMetadataKind, ModuleMetadata } from '@yext/studio-plugin';
import DeleteModuleButton from '../../src/components/DeleteModuleButton';
import mockStore from '../__utils__/mockStore';

it('can open modal and call deleteModule with correct ModuleMetadata', async () => {
  const deleteModule = jest.fn()
  mockStore({ deleteModule })

  const testMetadata: ModuleMetadata = {
    kind: FileMetadataKind.Module,
    componentTree: [],
    metadataUUID: 'mock-uuid-123',
    filepath: '/a/b/c/Star.tsx'
  }
  render(<DeleteModuleButton metadata={testMetadata}/>);
  const openModalButton = await screen.findByRole('button', {
    name: 'Delete Module Star'
  });
  fireEvent.click(openModalButton);
  const deleteModuleConfirmation = await screen.findByRole('button', {
    name: 'Delete'
  });
  expect(deleteModule).toHaveBeenCalledTimes(0);
  fireEvent.click(deleteModuleConfirmation);
  expect(deleteModule).toHaveBeenCalledTimes(1);
  expect(deleteModule).toHaveBeenCalledWith(testMetadata)
});