export interface ProminentImageProps {
  src: string;
  altText?: string;
}

export const initialProps: ProminentImageProps = {
  src: "https://images.ctfassets.net/n2ifzifcqscw/10wJSHT2Zvj5G1Z3GYHUqv/882e93cefece92d25d25933d56598903/telluride_shutterstock_2074692298.jpg",
};

export default function ProminentImage({ src, altText }: ProminentImageProps) {
  return (
    <div className="flex justify-center items-center flex-col">
      <img
        className="max-w-screen-sm max-h-screen-sm"
        src={src}
        alt={altText}
      />
    </div>
  );
}
