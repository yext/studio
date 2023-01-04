import { fireEvent, render, screen } from "@testing-library/react";
// import userEvent from "@testing-library/user-event";
// import ComponentEditor from "../../src/components/ComponentEditor";
// import {
//   ComponentState,
//   ComponentStateKind,
//   FileMetadata,
//   FileMetadataKind,
//   PropShape,
//   PropValueKind,
//   PropValueType,
//   PropValues,
//   StandardOrModuleComponentState,
// } from "@yext/studio-plugin";
// import useStudioStore from "../../src/store/useStudioStore";
// import mockStoreActiveComponent from "../__utils__/mockActiveComponentState";
// import mockStore from '../__utils__/mockStore';
import AddElementButton from "../../src/components/AddElementButton";

// jest.mock("../../src/icons/addcomponent.svg", () => {
//   return { ReactComponent: "svg" };
// });

it("renders", () => {
  // mockStore({
  //   pages: {
  //     getActivePageState: () => {
  //       return {
  //         componentTree: [],
  //         filepath: '',
  //         cssImports: []
  //       }
  //     }
  //   }
  // });

  render(<AddElementButton />);
  // expect(screen.queryByText("titleNode")).toBeNull();
  console.log(screen);
});
