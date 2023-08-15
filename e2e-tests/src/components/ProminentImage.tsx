export interface ProminentImageProps {
  src: string;
  altText?: string;
}

export const initialProps: ProminentImageProps = {
  src: "https://tellurideadventures.com/wp-content/uploads/2021/01/telluride-4100097_640.jpg",
};

export default function ProminentImage({ src, altText }: ProminentImageProps) {
  return (
    <div className="flex justify-center">
      <img
        className="max-w-screen-sm max-h-screen-sm"
        src={src}
        alt={altText}
      />
    </div>
  );
}
