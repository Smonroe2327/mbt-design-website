import CustomCursor from './CustomCursor'
import { Reveal, FillButton, SiteNav } from './shared'


const MARKETS = [
  {
    name: 'COMMERCIAL',
    desc: 'Office towers, mixed-use developments, retail, and hospitality projects demand precise MEP coordination across multiple floors and building systems. Our BIM-first approach keeps schedules tight and clash-free.',
    tags: ['HVAC Systems', 'Plumbing'],
  },
  {
    name: 'INDUSTRIAL',
    desc: 'Complex mechanical and process systems for manufacturing plants, distribution centers, and heavy industrial facilities. We coordinate high-density MEP systems with structure and process equipment to eliminate field conflicts before construction begins.',
    tags: ['Mechanical Systems', 'Process Piping', 'Data Centers', 'Power Generation'],
  },
  {
    name: 'PROCESS FACILITIES',
    desc: 'Pharmaceutical, food & beverage, and specialty chemical facilities require exact coordination of process piping, clean utilities, and critical MEP systems. We produce fabrication-ready spool drawings that go directly to the shop.',
    tags: ['Process Piping', 'Clean Facilities', 'Instrumentation', 'OSM Design'],
  },
  {
    name: 'OIL & GAS',
    desc: 'Upstream, midstream, and downstream facilities with demanding safety and regulatory requirements. Our teams understand hazardous area classifications, pressure systems, and the coordination complexity of petrochemical environments.',
    tags: ['Pipeline', 'Refineries', 'Piping Stress', 'P&ID Integration'],
  },
  {
    name: 'INSTITUTIONAL',
    desc: 'Universities, research institutions, and cultural facilities with long-lifecycle expectations. We coordinate complex laboratory systems, specialized exhaust, and high-density electrical infrastructure across phased delivery schedules.',
    tags: ['Lab Systems', 'Specialized Exhaust', 'Phased Delivery'],
  },
  {
    name: 'GOVERNMENT & DEFENSE',
    desc: 'Federal, state, municipal, and military construction governed by strict compliance and regulatory requirements. From UFC and NAVFAC standards to long-term facility management, our documentation meets agency review processes and our models are structured for mission-critical delivery.',
    tags: ['As-Built BIM', 'UFC Standards', 'NAVFAC', 'Secure Facilities', 'Infrastructure', 'CMMC'],
  },
  {
    name: 'HEALTHCARE',
    desc: 'Hospitals, surgery centers, and medical office buildings where systems reliability is non-negotiable. We coordinate complex medical gas, critical power, infection control zoning, and high-density MEP with zero tolerance for field errors.',
    tags: ['Medical Gas', 'Critical Power', 'Infection Control', 'HVAC Redundancy'],
  },
]

export default function MarketsPage() {
  return (
    <div className="min-h-screen bg-[#eeebe4]">
      <CustomCursor />

      <SiteNav />

      {/* Hero */}
      <div className="pt-16 border-b border-[#d4d0c8]">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-10 2xl:px-16 py-24 md:py-32">
          <Reveal>
            <div className="font-mono text-xs text-[#666] tracking-[0.3em] uppercase mb-6">Markets Served</div>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="text-[clamp(2.5rem,6vw,6rem)] font-bold tracking-tight leading-[0.9] uppercase mb-8">
              <span className="text-[#2952ff]">INDUSTRIES</span><br />
              WE SERVE
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="text-[#555] max-w-xl text-sm leading-relaxed">
              From defense installations to process facilities, MBT Design delivers precision BIM coordination across the full spectrum of complex building environments.
            </p>
          </Reveal>
        </div>
      </div>

      {/* Market list */}
      <div className="max-w-screen-2xl mx-auto px-6 md:px-10 2xl:px-16">
        {MARKETS.map((m, i) => (
          <Reveal key={m.name} delay={i * 40}>
            <div className={`border-t border-[#d4d0c8] py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start group hover:bg-[#e6e2da] transition-colors duration-300 px-2 ${i === MARKETS.length - 1 ? 'border-b' : ''}`}>
              <div className="lg:col-span-1 font-mono text-xs text-[#e63329] tracking-[0.2em] pt-1">
                [{String(i + 1).padStart(2, '0')}]
              </div>
              <div className="lg:col-span-4">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight uppercase text-[#111] group-hover:text-[#2952ff] transition-colors duration-300 leading-tight">
                  {m.name}
                </h2>
              </div>
              <div className="lg:col-span-5">
                <p className="text-[#555] text-sm leading-relaxed mb-6">{m.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {m.tags.map(t => (
                    <span key={t} className="font-mono text-[11px] tracking-[0.15em] uppercase border border-[#c0bbb2] text-[#555] px-3 py-1.5 group-hover:border-[#2a2a2a] transition-all">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-2 flex justify-end items-start pt-1">
                <div className="w-8 h-px bg-[#d4d0c8] group-hover:bg-[#2952ff] group-hover:w-12 transition-all duration-300" />
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* CTA */}
      <div className="max-w-screen-2xl mx-auto px-6 md:px-10 2xl:px-16 py-24 text-center">
        <Reveal>
          <p className="font-mono text-xs text-[#666] tracking-[0.3em] uppercase mb-6">Ready to build?</p>
        </Reveal>
        <Reveal delay={100}>
          <h2 className="text-[clamp(1.8rem,4vw,4rem)] font-bold tracking-tight uppercase mb-10">
            LET'S WORK<br />
            <span className="text-[#2952ff]">TOGETHER</span>
          </h2>
        </Reveal>
        <Reveal delay={200}>
          <FillButton href="mailto:info@mbtdesign.net" label="START CONVERSATION" />
        </Reveal>
      </div>

      {/* Footer strip */}
      <div className="border-t border-[#d4d0c8] py-8 px-6 md:px-10">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <span className="font-mono text-[11px] text-[#999] tracking-[0.2em] uppercase">© MBT Design Group</span>
          <span className="font-mono text-[11px] text-[#999] tracking-[0.2em] uppercase">BIM · MEP · Constructability</span>
        </div>
      </div>
    </div>
  )
}
