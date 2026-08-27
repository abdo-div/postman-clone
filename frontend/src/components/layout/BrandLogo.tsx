interface BrandLogoProps {
  height?: number;
  className?: string;
}

export function BrandLogo({ height = 50, className = "" }: BrandLogoProps) {
  return (
    <img
      src="/logos/mainProjectLogo.png"
      alt="APIPilot"
      height={height}
      loading="eager"
      className={`inline-block shrink-0 object-contain m-2 ${className}`}
      style={{ height }}
    />
  );
}