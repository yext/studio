export interface EmptyModuleProps {
  document: Record<string, any>;
}

export default function Panel({ document }: EmptyModuleProps) {
  return <ErrBanner title={document.name} />;
}
