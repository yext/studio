import PageFile from "../../src/parsing/PageFile";
import { ComponentState, ComponentStateKind } from '../../src/types/State';
import { PropValueKind, PropValueType } from "../../src/types/PropValues";
import path from "path";

jest.mock('uuid', () => ({ v4: () => 'mock-uuid' }))

const componentsState: ComponentState[] = [
  {
    kind: ComponentStateKind.Standard,
    componentName: 'ComplexBanner',
    props: {
      num: {
        kind: PropValueKind.Literal,
        valueType: PropValueType.number,
        value: 1
      },
      title: {
        kind: PropValueKind.Literal,
        valueType: PropValueType.string,
        value: 'first!'
      }
    },
    uuid: 'mock-uuid',
    parentUUID: 'mock-uuid',
    metadataUUID: getComponentPath('ComplexBanner')
  },
  {
    kind: ComponentStateKind.Standard,
    componentName: 'ComplexBanner',
    props: {},
    uuid: 'mock-uuid',
    parentUUID: 'mock-uuid',
    metadataUUID: getComponentPath('ComplexBanner')
  },
  {
    kind: ComponentStateKind.Standard,
    componentName: 'ComplexBanner',
    props: {
      num: {
        kind: PropValueKind.Literal,
        valueType: PropValueType.number,
        value: 3
      },
      title: {
        kind: PropValueKind.Literal,
        valueType: PropValueType.string,
        value: 'three'
      },
      bool: {
        kind: PropValueKind.Literal,
        valueType: PropValueType.boolean,
        value: false
      }
    },
    uuid: 'mock-uuid',
    parentUUID: 'mock-uuid',
    metadataUUID: getComponentPath('ComplexBanner')
  }
]

it('correctly parses page with top-level React.Fragment', () => {
  const pageFile = new PageFile(getPagePath('reactFragmentPage'));
  const result = pageFile.getPageState();

  expect(result.componentTree).toEqual([
    {
      kind: ComponentStateKind.Fragment,
      uuid: 'mock-uuid',
    },
    ...componentsState
  ]);
})

it('correctly parses page with top-level Fragment', () => {
  const pageFile = new PageFile(getPagePath('fragmentPage'));
  const result = pageFile.getPageState();

  expect(result.componentTree).toEqual([
    {
      kind: ComponentStateKind.Fragment,
      uuid: 'mock-uuid',
    },
    ...componentsState
  ]);
})

it('correctly parse page with top-level Fragment in short syntax', () => {
  const pageFile = new PageFile(getPagePath('shortFragmentSyntaxPage'));
  const result = pageFile.getPageState();

  expect(result.componentTree).toEqual([
    {
      kind: ComponentStateKind.Fragment,
      uuid: 'mock-uuid',
    },
    ...componentsState
  ]);
})

it('correctly parses page with top-level div component', () => {
  const pageFile = new PageFile(getPagePath('divPage'));
  const result = pageFile.getPageState();

  expect(result.componentTree).toEqual([
    {
      kind: ComponentStateKind.Standard,
      componentName: 'div',
      props: {},
      uuid: 'mock-uuid',
      metadataUUID: 'builtIn'
    },
    ...componentsState
  ]);
})

function getPagePath(pageName: string) {
  return path.resolve(
    __dirname,
    `../__fixtures__/PageFile/${pageName}.tsx`
  );
}

function getComponentPath(componentName: string) {
  return path.resolve(
    __dirname,
    `../__fixtures__/ComponentFile/${componentName}.tsx`
  );
}