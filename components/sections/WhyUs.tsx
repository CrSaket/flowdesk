'use client'

import { useRef } from 'react'
import dynamic from 'next/dynamic'

const AnimatedShaderBackground = dynamic(() => import('@/components/ui/animated-shader-background'), { ssr: false })
const WhyUsFeatureSteps = dynamic(() => import('@/components/ui/why-us-feature-steps'), { ssr: false })

function CheckIcon({ color = 'var(--color-accent)' }: { color?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function PartialIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,200,92,0.7)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}


export default function WhyUs() {
  const sectionRef = useRef<HTMLDivElement>(null)

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Animated shader background */}
      <AnimatedShaderBackground />
      {/* Dark overlay so content stays readable */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(10, 11, 15, 0.82)', pointerEvents: 'none' }} />

    <section
      id="why-us"
      ref={sectionRef}
      style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: 1280,
        margin: '0 auto',
        padding: '120px 48px',
      }}
    >
      {/* Explainability feature steps */}
      <WhyUsFeatureSteps />

      {/* Comparison Table */}
      <div style={{ marginTop: 96 }}>
        <div style={{ marginBottom: 48 }}>
          <p
            style={{
              fontSize: 11,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
              fontWeight: 500,
              marginBottom: 16,
            }}
          >
            How we compare
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 'clamp(1.6rem, 3.5vw, 3rem)',
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
              color: 'var(--color-text-primary)',
              maxWidth: 560,
            }}
          >
            Built to explain,
            <br />not just analyze.
          </h2>
          <p
            style={{
              marginTop: 16,
              fontSize: 15,
              lineHeight: 1.65,
              color: 'var(--color-text-secondary)',
              maxWidth: 480,
            }}
          >
            Enterprise platforms like Databricks and IBM AI give you powerful models — but they don't tell you what to do next. FlowDesk speaks your language.
          </p>
        </div>

        {/* Table */}
        <div
          style={{
            border: '1px solid var(--color-border)',
            borderRadius: 12,
            overflow: 'hidden',
            background: 'rgba(15, 17, 23, 0.7)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          {/* Column headers */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 160px 160px 160px',
              borderBottom: '1px solid var(--color-border)',
              background: 'rgba(10, 11, 15, 0.6)',
            }}
          >
            <div style={{ padding: '20px 28px', fontSize: 12, color: 'var(--color-text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
              Capability
            </div>
            {[
              { label: 'FlowDesk', highlight: true },
              { label: 'Databricks', highlight: false },
              { label: 'IBM AI', highlight: false },
            ].map(({ label, highlight }) => (
              <div
                key={label}
                style={{
                  padding: '20px 0',
                  textAlign: 'center',
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: 'var(--font-display)',
                  color: highlight ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                  borderLeft: '1px solid var(--color-border)',
                  position: 'relative',
                }}
              >
                {highlight && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 2,
                      background: 'var(--color-accent)',
                    }}
                  />
                )}
                {label}
              </div>
            ))}
          </div>

          {/* Rows */}
          {[
            {
              feature: 'Plain-English explanations of every insight',
              flowdesk: 'yes',
              databricks: 'no',
              ibm: 'no',
              highlight: true,
            },
            {
              feature: 'Tells you what action to take next',
              flowdesk: 'yes',
              databricks: 'no',
              ibm: 'partial',
              highlight: true,
            },
            {
              feature: 'No data science or SQL required',
              flowdesk: 'yes',
              databricks: 'no',
              ibm: 'no',
              highlight: false,
            },
            {
              feature: 'Real-time cash flow forecasting',
              flowdesk: 'yes',
              databricks: 'partial',
              ibm: 'partial',
              highlight: false,
            },
            {
              feature: 'SMB-ready pricing (under $500/mo)',
              flowdesk: 'yes',
              databricks: 'no',
              ibm: 'no',
              highlight: false,
            },
            {
              feature: 'Live in under 30 minutes',
              flowdesk: 'yes',
              databricks: 'no',
              ibm: 'no',
              highlight: false,
            },
            {
              feature: 'Human support with < 2hr response',
              flowdesk: 'yes',
              databricks: 'no',
              ibm: 'no',
              highlight: false,
            },
          ].map((row, i) => (
            <div
              key={row.feature}
              className="compare-row"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 160px 160px 160px',
                borderBottom: i < 6 ? '1px solid var(--color-border)' : undefined,
                background: row.highlight ? 'rgba(79,70,255,0.04)' : 'transparent',
                transition: 'background 0.2s ease',
              }}
            >
              <div
                style={{
                  padding: '18px 28px',
                  fontSize: 14,
                  lineHeight: 1.5,
                  color: 'var(--color-text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                {row.highlight && (
                  <span
                    style={{
                      display: 'inline-block',
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: 'var(--color-accent)',
                      flexShrink: 0,
                    }}
                  />
                )}
                {row.feature}
              </div>

              {[
                { val: row.flowdesk, isFlowDesk: true },
                { val: row.databricks, isFlowDesk: false },
                { val: row.ibm, isFlowDesk: false },
              ].map(({ val, isFlowDesk }, ci) => (
                <div
                  key={ci}
                  style={{
                    padding: '18px 0',
                    textAlign: 'center',
                    borderLeft: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {val === 'yes' ? (
                    <CheckIcon color={isFlowDesk ? 'var(--color-accent)' : 'var(--color-text-muted)'} />
                  ) : val === 'no' ? (
                    <XIcon />
                  ) : (
                    <PartialIcon />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p
          style={{
            marginTop: 20,
            fontSize: 12,
            color: 'var(--color-text-muted)',
            lineHeight: 1.6,
          }}
        >
          Comparison based on publicly available information as of Q1 2025. "Partial" indicates the capability exists but requires significant configuration or add-on purchase.
        </p>
      </div>

      <style>{`
        .why-us-card {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.5s ease, transform 0.5s ease, background 0.25s ease, border-color 0.25s ease;
        }
        .why-us-card.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .why-us-card:hover {
          background: rgba(22, 24, 32, 0.85) !important;
          border-color: rgba(79, 70, 255, 0.3) !important;
        }
        .why-us-card:hover .why-us-accent-line {
          opacity: 1 !important;
        }
        .compare-row:hover {
          background: rgba(79,70,255,0.07) !important;
        }
      `}</style>
    </section>
    </div>
  )
}
