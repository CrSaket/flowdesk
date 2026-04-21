export default function AppLoading() {
  return (
    <>
      <style>{`
        @keyframes fd-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fd-pulse-dot {
          0%, 100% { opacity: 1; box-shadow: 0 0 12px 3px rgba(79,70,255,0.8); }
          50%       { opacity: 0.6; box-shadow: 0 0 20px 6px rgba(79,70,255,0.4); }
        }
        @keyframes fd-bar {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        @keyframes fd-fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#08080f',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 32,
      }}>

        {/* Spinner ring */}
        <div style={{ position: 'relative', width: 72, height: 72 }}>
          {/* Outer ring */}
          <div style={{
            position: 'absolute', inset: 0,
            borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.06)',
          }} />
          {/* Spinning gradient arc */}
          <div style={{
            position: 'absolute', inset: 0,
            borderRadius: '50%',
            border: '2px solid transparent',
            borderTopColor: '#4F46FF',
            borderRightColor: '#00E5A0',
            animation: 'fd-spin 0.9s linear infinite',
          }} />
          {/* Centre glowing dot */}
          <div style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 10, height: 10, borderRadius: '50%',
            background: '#4F46FF',
            animation: 'fd-pulse-dot 1.8s ease-in-out infinite',
          }} />
        </div>

        {/* Brand */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          animation: 'fd-fade-in 0.4s ease both',
        }}>
          <span style={{
            fontFamily: 'var(--font-display, system-ui)', fontWeight: 800,
            fontSize: 22, letterSpacing: '-0.03em',
            color: '#fff',
          }}>
            FlowDesk
          </span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.04em' }}>
            Loading your dashboard…
          </span>
        </div>

        {/* Progress bar */}
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          height: 2, background: 'rgba(255,255,255,0.04)', overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', width: '25%',
            background: 'linear-gradient(90deg, #4F46FF, #00E5A0)',
            animation: 'fd-bar 1.4s ease-in-out infinite',
          }} />
        </div>
      </div>
    </>
  )
}
