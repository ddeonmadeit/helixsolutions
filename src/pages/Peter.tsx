const Peter = () => (
  <div className="w-full h-screen overflow-hidden" style={{ WebkitOverflowScrolling: 'touch' }}>
    <iframe
      src="https://peterdash.lovable.app"
      className="w-full h-full border-0"
      title="Peter Dashboard"
      allow="clipboard-write; clipboard-read"
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
      scrolling="no"
    />
  </div>
);

export default Peter;
