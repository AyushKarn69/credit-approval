export default function StatusBadge({ approved }) {
  const bgColor = approved ? '#27ae60' : '#e74c3c'
  const text = approved ? 'APPROVED' : 'DENIED'
  
  return (
    <div style={{
      display: 'inline-block',
      backgroundColor: bgColor,
      color: 'white',
      padding: '6px 12px',
      borderRadius: '3px',
      fontSize: '12px',
      fontWeight: '600',
      letterSpacing: '0.5px'
    }}>
      {text}
    </div>
  )
}
