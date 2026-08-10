import { ImageResponse } from "next/og";

const supportedSizes = new Set([180, 192, 512]);

export async function GET(_request: Request, { params }: { params: Promise<{ size: string }> }) {
  const requestedSize = Number((await params).size);
  const size = supportedSizes.has(requestedSize) ? requestedSize : 512;
  const unit = size / 64;

  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#141713", borderRadius: size * .16 }}>
    <div style={{ width: 44 * unit, height: 44 * unit, position: "relative", display: "flex" }}>
      <span style={{ position: "absolute", left: 0, top: 0, width: 19 * unit, height: 19 * unit, background: "#d9ff43" }}/>
      <span style={{ position: "absolute", left: 25 * unit, top: 0, width: 19 * unit, height: 44 * unit, background: "#d9ff43" }}/>
      <span style={{ position: "absolute", left: 0, top: 25 * unit, width: 19 * unit, height: 19 * unit, background: "#d9ff43" }}/>
    </div>
  </div>, { width: size, height: size });
}
