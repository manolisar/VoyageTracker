const DensityBar = ({ densities }) => (
  <div className="max-w-6xl mx-auto px-4 py-2">
    <div className="glass-card rounded-xl px-4 py-2.5 text-sm flex flex-wrap gap-x-6 gap-y-1 items-center">
      <span className="font-semibold text-navy-700 dark:text-navy-200">Current Densities:</span>
      <span className="text-navy-600 dark:text-navy-300">HFO: <b className="font-mono">{densities.HFO}</b></span>
      <span className="text-navy-600 dark:text-navy-300">MGO: <b className="font-mono">{densities.MGO}</b></span>
      <span className="text-navy-600 dark:text-navy-300">LSFO: <b className="font-mono">{densities.LSFO}</b></span>
      <span className="text-navy-400 dark:text-navy-500 ml-auto text-xs">
        Counters in m&sup3; &bull; Summaries in MT &bull; DG3: MGO/LSFO &bull; Boilers: MGO only &bull; Auto-saves
      </span>
    </div>
  </div>
);

export default DensityBar;
