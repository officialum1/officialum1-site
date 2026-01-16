export default function Loading() {
  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#050505'
    }}>
      <div className="loader"></div>
    </div>
  );
}
