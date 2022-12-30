import create from "zustand";
import useStudioStore from "./useStudioStore";

const useTemporalStore = create(useStudioStore.temporal);

export default useTemporalStore;
