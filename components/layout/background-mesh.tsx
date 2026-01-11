export default function BackgroundMesh() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 opacity-50 bg-gradient-to-b from-[#1a1208] via-transparent to-transparent" />
      <div className="absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(228,177,103,0.45)_0%,_rgba(8,5,2,0)_60%)] blur-3xl" />
      <div className="absolute bottom-[-10%] left-[15%] h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(118,83,39,0.5)_0%,_rgba(8,5,2,0)_60%)] blur-[140px]" />
      <div className="absolute bottom-[-25%] right-[5%] h-80 w-80 rounded-full opacity-70 bg-[radial-gradient(circle,_rgba(75,46,12,0.65)_0%,_rgba(8,5,2,0)_65%)] blur-[160px]" />
      <div className="absolute inset-0 bg-noise-texture opacity-25" />
    </div>
  );
}
