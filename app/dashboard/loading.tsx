export default function DashboardLoading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header skeleton */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 4 }}>
        <div className="skeleton" style={{ width: 220, height: 30, borderRadius: 6 }} />
        <div className="skeleton" style={{ width: 360, height: 15, borderRadius: 4 }} />
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{
            padding: '20px 22px', borderRadius: 12,
            border: '1px solid var(--color-border)',
            background: 'var(--color-bg-elevated)',
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="skeleton" style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0 }} />
              <div className="skeleton" style={{ width: 90, height: 11, borderRadius: 4 }} />
            </div>
            <div className="skeleton" style={{ width: 110, height: 30, borderRadius: 6 }} />
            <div className="skeleton" style={{ width: 75, height: 11, borderRadius: 4 }} />
            <div className="skeleton" style={{ width: 120, height: 11, borderRadius: 4 }} />
          </div>
        ))}
      </div>

      {/* Main chart */}
      <div style={{
        padding: 24, borderRadius: 12,
        border: '1px solid var(--color-border)',
        background: 'var(--color-bg-elevated)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div className="skeleton" style={{ width: 170, height: 16, borderRadius: 4 }} />
          <div className="skeleton" style={{ width: 80, height: 28, borderRadius: 6 }} />
        </div>
        <div className="skeleton" style={{ width: '100%', height: 220, borderRadius: 8 }} />
      </div>

      {/* Two-column row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Alerts panel */}
        <div style={{
          padding: 20, borderRadius: 12,
          border: '1px solid var(--color-border)',
          background: 'var(--color-bg-elevated)',
        }}>
          <div className="skeleton" style={{ width: 130, height: 15, borderRadius: 4, marginBottom: 18 }} />
          {[1, 2, 3].map(j => (
            <div key={j} style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'flex-start' }}>
              <div className="skeleton" style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, marginTop: 2 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div className="skeleton" style={{ width: '65%', height: 13, borderRadius: 4 }} />
                <div className="skeleton" style={{ width: '90%', height: 11, borderRadius: 4 }} />
                <div className="skeleton" style={{ width: '50%', height: 11, borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>

        {/* SHAP panel */}
        <div style={{
          padding: 20, borderRadius: 12,
          border: '1px solid var(--color-border)',
          background: 'var(--color-bg-elevated)',
        }}>
          <div className="skeleton" style={{ width: 150, height: 15, borderRadius: 4, marginBottom: 18 }} />
          {[1, 2, 3, 4, 5].map(j => (
            <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div className="skeleton" style={{ width: 100, height: 11, borderRadius: 4, flexShrink: 0 }} />
              <div className="skeleton" style={{ flex: 1, height: 8, borderRadius: 4 }} />
              <div className="skeleton" style={{ width: 32, height: 11, borderRadius: 4, flexShrink: 0 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
