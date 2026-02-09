const DensityBar = ({ densities }) => (
  <div className="max-w-6xl mx-auto px-4 py-2">
    <div className="bg-white dark:bg-navy-900 border border-[var(--color-border-subtle)] dark:border-navy-700 rounded-[10px] px-4 py-2 text-[0.72rem] flex flex-wrap gap-x-6 gap-y-1 items-center text-[var(--color-dim)]">
      <span className="text-[0.55rem] uppercase tracking-wide text-[var(--color-faint)] font-bold">Densities</span>
      <span className="font-mono">HFO: <b className="text-[var(--color-text)] dark:text-white font-bold">{densities.HFO}</b></span>
      <span className="font-mono">MGO: <b className="text-[var(--color-text)] dark:text-white font-bold">{densities.MGO}</b></span>
      <span className="font-mono">LSFO: <b className="text-[var(--color-text)] dark:text-white font-bold">{densities.LSFO}</b></span>
      <span className="text-[0.55rem] text-[var(--color-faint)] ml-auto">
        Counters m&sup3; &bull; Summaries MT
      </span>
    </div>
  </div>
);

export default DensityBar;
