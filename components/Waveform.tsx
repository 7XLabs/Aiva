export default function Waveform({ className = "" }: { className?: string }) {
  return (
    <div className={`waveform ${className}`} aria-hidden>
      <span />
      <span />
      <span />
      <span />
      <span />
    </div>
  );
}
