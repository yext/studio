export interface BannerRequiredPropsProps {
  title: string;
  intervals?: {
    end: string;
    start: string;
  }[];
  obj?: {
    firstName: string;
    lastName: string;
  };
}

export default function BannerRequiredProps(props: BannerRequiredPropsProps) {
  return (
    <div>
      {props.title}
      {props.intervals?.map(
        (interval) => `Start: ${interval.start} End: ${interval.end}, `
      )}
      {props.obj?.firstName}
      {props.obj?.lastName}
    </div>
  );
}
