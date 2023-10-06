export interface BusinessInfoProps {
  title?: string;
  children: React.ReactNode;
}

export default function BusinessInfo({ title, children }: BusinessInfoProps) {
  return (
    <div className="flex flex-col bg-slate-100">
      {title && <h2 className="text-3xl">{title}</h2>}
      <div className="flex flex-row justify-around">{children}</div>
    </div>
  );
}
