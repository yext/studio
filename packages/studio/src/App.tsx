import useStudioStore from "./store/useStudioStore";

export default function App() {
  const { activePageName, activePageState } = useStudioStore((store) => {
    return {
      activePageName: store.pages.activePageName,
      activePageState: store.pages.getActivePageState(),
    };
  });

  return (
    <div className="App bg-sky-400">
      <h1>Studio Client</h1>
      <h2>Active Page: {activePageName}</h2>
      <div>Active PageState: {JSON.stringify(activePageState, null, 2)}</div>
    </div>
  );
}
