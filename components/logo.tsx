import Image from "next/image";

interface LogoProps {
  variant?: "full" | "mark";
  tone?: "light" | "dark";
  height?: number;
}

export function Logo({ variant = "full", tone = "light", height = 48 }: LogoProps) {
  const dark = tone === "dark";

  if (variant === "mark") {
    return (
      <Image
        src={dark ? "/brand/liciba-mark-dark.svg" : "/brand/liciba-mark.svg"}
        alt="LICIBA"
        width={height}
        height={height}
        className="block flex-none"
        priority
      />
    );
  }

  const width = Math.round(height * 2.15);
  return (
    <span
      role="img"
      aria-label="LICIBA"
      className="relative block flex-none"
      style={{ width, aspectRatio: "430 / 200", containerType: "inline-size" }}
    >
      <Image
        src={dark ? "/brand/liciba-ring-dark.svg" : "/brand/liciba-ring.svg"}
        alt=""
        fill
        sizes={`${width}px`}
        className="object-contain"
        priority
      />
      <span
        className="absolute left-1/2 top-1/2 whitespace-nowrap font-sans italic font-black"
        style={{
          transform: "translate(-50%,-52%) scaleX(1.42)",
          fontSize: "20.5cqi",
          color: dark ? "#FFFFFF" : "#13201B",
        }}
      >
        LICIBA
      </span>
    </span>
  );
}
