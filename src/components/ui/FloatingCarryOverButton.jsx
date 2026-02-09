const FloatingCarryOverButton = ({ onClick, disabled, sourceInfo }) => (
  <button
    className="floating-carryover-btn"
    onClick={onClick}
    disabled={disabled}
    title={disabled ? 'Edit END values in any phase first' : 'Carry over to next phase'}
  >
    <span className="carryover-icon">{'\u2193'}</span>
    <div className="flex flex-col items-start">
      <span className="font-semibold">Carry Over</span>
      {sourceInfo ? (
        <span className="carryover-source">from: {sourceInfo.phaseName}</span>
      ) : (
        <span className="carryover-source">edit END values first</span>
      )}
    </div>
  </button>
);

export default FloatingCarryOverButton;
