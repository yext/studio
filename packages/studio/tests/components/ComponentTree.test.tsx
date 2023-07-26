import { render, screen } from "@testing-library/react";
import useStudioStore from "../../src/store/useStudioStore";
import userEvent from "@testing-library/user-event";
import ComponentTree from "../../src/components/ComponentTree";
import mockStoreActiveComponent from "../__utils__/mockActiveComponentState";
import { ComponentStateKind } from "@yext/studio-plugin";


it("removes the page when page delete button is clicked", async () => {
    mockStoreActiveComponent({
        activeComponent: {
            kind: ComponentStateKind.Standard,
            componentName: "name",
            props: {},
            uuid: "mock-uuid-1",
            metadataUUID: "mock-metadata-uuid-1"
        }, 
    })
    const removeComponentSpy = jest.spyOn(
        useStudioStore.getState().actions,
        "removeComponent"
      );

    render(<ComponentTree />); // ERROR HERE
    // const componentElement = screen.getByText("name");
    const removeComponentButton = screen.getByRole("button", {name: "Remove Element"});
    // await userEvent.click(componentElement);
    await userEvent.click(removeComponentButton);
    expect(removeComponentSpy).toBeCalledWith("mock-uuid-1");
    expect(useStudioStore.getState().pages.activeComponentUUID).toBeUndefined();
  });
  