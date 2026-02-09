const Footer = ({ directoryHandle }) => (
  <footer className="text-center py-6 text-sm text-navy-400 dark:text-navy-500">
    <div className="flex items-center justify-center gap-2">
      <span>Auto-saves to network folder</span>
      <span>&bull;</span>
      <span>Backup to IndexedDB</span>
      <span>&bull;</span>
      <span className="flex items-center gap-1">
        <span className={`status-dot ${directoryHandle ? 'connected' : 'disconnected'}`}></span>
        {directoryHandle ? 'Connected' : 'No folder selected'}
      </span>
    </div>
  </footer>
);

export default Footer;
