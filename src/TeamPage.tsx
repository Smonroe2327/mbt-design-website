import { useState } from 'react'
import CustomCursor from './CustomCursor'
import { Reveal, SiteNav } from './shared'
import mbtFlow from './assets/team-supergraphic.png'
import timTrippVideo from './imports/monroesnmimosas_httpss.mj.runhmg1ZU-PlX8_create_a_professiona_90d12394-b92a-495a-818d-a5f94f085b8d_1.mp4'
import jasonBellVideo from './imports/monroesnmimosas_httpss.mj.run4onKGy0wieQ_professional_talking_286ede98-89b8-4637-a787-cfd06ac666f5_2.mp4'
import joeMonroeVideo from './imports/monroesnmimosas_httpss.mj.runCVAP70yLeYM_talking_professional_5c61fa5a-7df9-42e1-ac59-ff1d24cdf6e9_0.mp4'

const WIX = 'https://static.wixstatic.com/media'

const LEADERSHIP = [
  { name: 'Joe Monroe', title: 'President', img: null, video: joeMonroeVideo },
  { name: 'Tim Tripp', title: 'Operations Manager', img: null, video: timTrippVideo },
  { name: 'Jason Bell', title: 'Chief Financial Officer', img: null, video: jasonBellVideo },
]

const TEAM = [
  {
    name: 'James Miley',
    title: 'Director of Operations',
    bio: `"Miley" spent 25 years working in powerhouses, refineries, and semiconductor facilities as a union steamfitter, rigger, and detailer before transitioning into management.

Today, he is a dedicated mental health advocate who values creating strong, connected teams. He enjoys planning team-building activities for his crews and brings a people-first approach to leadership.

Above all, Miley is a proud father of five, grounding his work and advocacy in purpose and perspective.`,
    img: `${WIX}/3d2ae4_030ebe0fd0e94bce8aedfb6460340ad4~mv2.jpg/v1/fill/w_600,h_600,al_c,q_85,usm_0.66_1.00_0.01/file.jpg`,
  },
  {
    name: 'James Frolov',
    title: 'BIM Detailer — Lead',
    bio: `James brings over 25 years of experience as a union pipefitter, translating deep field expertise into project engineering, BIM detailing, and trade coordination.

As an instructor at the Local 469 Training Center, he is known for teaching how to bridge the gap between the field and design—ensuring practical, efficient solutions across every phase of a project.

Outside of work, James is a dedicated father who enjoys spending time outdoors with his family.`,
    img: `${WIX}/3d2ae4_7f5ead6c49ba4ac8adc9be93413c53e5~mv2.jpg/v1/fill/w_600,h_600,al_c,q_85,usm_0.66_1.00_0.01/file.jpg`,
  },
  {
    name: 'Tobe Sanford',
    title: 'BIM Detailer — Lead',
    bio: `Tobe turned out of UA Local 375 and went on to spend 26 years as a union pipefitter, working on the Alaskan Pipeline, power plants, and multi-use commercial buildings before bringing that experience into the BIM world.

He is known for applying real-world field knowledge to digital coordination, helping create practical and constructible solutions.

Outside of the office, Tobe is a dedicated hunter and fisherman who also enjoys camping and gardening.`,
    img: `${WIX}/3d2ae4_25f92d38a7c74a8d9a0389348b40413e~mv2.jpg/v1/fill/w_600,h_600,al_c,q_85,usm_0.66_1.00_0.01/file.jpg`,
  },
  {
    name: 'Eric Goodman',
    title: 'BIM Detailer — Lead',
    bio: `Eric is a certified welder and rigger with 20 years of experience working in data centers, hospitals, pharmaceutical plants, and semiconductor facilities. He also serves as a UA Local 469 detailing instructor at the apprenticeship, sharing his field knowledge with the next generation.

He is known for his hands-on expertise, and commitment to quality.

Outside of work, Eric enjoys competitive snowboarding, motocross racing, and off-road adventures.`,
    img: `${WIX}/3d2ae4_60a47c5933064f6e800323ee83b14f36~mv2.jpg/v1/crop/x_0,y_201,w_1236,h_1231/fill/w_600,h_600,al_c,q_85,usm_0.66_1.00_0.01/file.jpg`,
  },
  {
    name: 'Michael Miley',
    title: 'Trainer | Tech Lead',
    bio: `Michael spent several years as a union field detailer and is now an active member of the UA Local 469 PAC. He also serves as a Revit instructor at the apprenticeship, bringing a strong focus on workflow optimization and automation.

He is known for streamlining processes and advancing digital efficiency across projects.

Outside of work, he is an avid reader and practitioner of philosophy who enjoys spirited debate.`,
    img: `${WIX}/3d2ae4_afd1925d3e3b4c0f8bbb4f4aa90b2886~mv2.jpg/v1/crop/x_0,y_184,w_911,h_907/fill/w_600,h_600,al_c,q_85,usm_0.66_1.00_0.01/file.jpg`,
  },
  {
    name: 'Bryant Couch',
    title: 'BIM Detailer',
    bio: `Bryant started as a field detailer with UA Local 469 before bringing his expertise into the digital space. He is now an experienced BIM detailer specializing in semiconductor projects, with proficiency in both Plant 3D and Revit.

He brings a strong technical skill set to digital coordination, supporting accurate and efficient project execution.

Outside of work, Bryant is an adventurous outdoorsman and survivalist.`,
    img: `${WIX}/3d2ae4_399ffe62dd27478883bed2b1b4f543a9~mv2.jpg/v1/crop/x_0,y_212,w_1303,h_1298/fill/w_600,h_600,al_c,q_85,usm_0.66_1.00_0.01/file.jpg`,
  },
  {
    name: 'Ismael Martinez',
    title: 'BIM Detailer',
    bio: `Ismael brings over 13 years of experience as a detailer and BIM designer, specializing in semiconductor and healthcare projects.

His work emphasizes precision and coordination, supporting efficient and well-executed project outcomes.

Ismael is a proud family man who enjoys the outdoors and staying active in the gym when he's outside of the office.`,
    img: `${WIX}/3d2ae4_d05ada9a35b2403ca5cc17c5cdd04299~mv2.jpg/v1/crop/x_0,y_212,w_1052,h_1047/fill/w_600,h_600,al_c,q_85,usm_0.66_1.00_0.01/file.jpg`,
  },
  {
    name: 'Daniel Westfall',
    title: 'BIM Detailer',
    bio: `Daniel brings 15 years of experience, beginning as a union welder working in nuclear power plants, steel mills, and paper mills before transitioning into BIM detailing and project management.

His background combines hands-on field expertise with digital coordination and project leadership, supporting efficient and well-executed outcomes.

When not in the office, Daniel enjoys spending time with his kids exploring nature trails and relaxing at the beach.`,
    img: `${WIX}/3d2ae4_93f3338974cd4d2b99835c5fd3cf4028~mv2.jpg/v1/crop/x_0,y_203,w_1005,h_1001/fill/w_600,h_600,al_c,q_85,usm_0.66_1.00_0.01/file.jpg`,
  },
  {
    name: 'Lanedrick Begay',
    title: 'BIM Detailer',
    bio: `Lanedrick began his career as a union welder on rural projects before transitioning into BIM detailing within the semiconductor industry.

He brings a grounded, hands-on perspective to digital coordination, shaped by diverse field experience and a strong work ethic.

Outside of work, Lanedrick is a well-traveled husband and father of five, dedicated to honoring his family history.`,
    img: `${WIX}/3d2ae4_1f9d5f54b9a040da87ae799ff57b225b~mv2.jpg/v1/crop/x_0,y_194,w_957,h_953/fill/w_600,h_600,al_c,q_85,usm_0.66_1.00_0.01/file.jpg`,
  },
  {
    name: 'Victor Soto',
    title: 'BIM Detailer',
    bio: `Victor began his union career as a welder before transitioning into detailing and BIM design. His field experience and technical expertise help create practical, accurate solutions that support successful project execution.

Outside of work, Victor enjoys traveling, golfing, spending time outdoors with his family, and working on projects in his garage.`,
    img: `${WIX}/3d2ae4_4cc90249a99e4e4fa4b3bb98341c042d~mv2.jpg/v1/crop/x_0,y_11,w_848,h_844/fill/w_600,h_600,al_c,q_85,usm_0.66_1.00_0.01/file.jpg`,
  },
  {
    name: 'Kai Gunderson',
    title: 'BIM Detailer',
    bio: `Kai is a BIM Detailer specializing in plumbing and pipefitting systems, with 13 years of industry experience and seven years focused on design and detailing. He has worked on semiconductor, pharmaceutical, healthcare, and data center projects, bringing both field and design experience to every project.

Kai is a devoted father who enjoys scuba diving, traveling, exploring the outdoors, and learning the craft of leatherworking.`,
    img: `${WIX}/3d2ae4_484a2672a7c64fda8548d24f0d7c5b2a~mv2.jpg/v1/crop/x_0,y_152,w_848,h_844/fill/w_600,h_600,al_c,q_85,usm_0.66_1.00_0.01/file.jpg`,
  },
  {
    name: 'Josh Sanford',
    title: 'BIM Detailer',
    bio: `Josh spent 14 years as a union pipefitter, working on refineries, power plants, paper mills, steel mills, hospitals, semiconductor facilities, and government projects across the country before transitioning into BIM.

He brings extensive field experience to digital coordination, helping develop practical and constructible solutions. Outside of work, Josh enjoys exploring new places with his family.`,
    img: `${WIX}/3d2ae4_f29b425c11ad43d698b2cdb8a1d7d447~mv2.jpg/v1/crop/x_0,y_156,w_848,h_844/fill/w_600,h_600,al_c,q_85,usm_0.66_1.00_0.01/file.jpg`,
  },
  {
    name: 'Eriq Boler',
    title: 'BIM Detailer',
    bio: `Eriq developed his career through the UA Local 469 apprenticeship, gaining experience in detailing, coordination, field installation, and project execution. He brings a practical, solutions-driven approach to every project.

Outside of work, Eriq is a proud father of three who enjoys dirt bikes, camping, and the outdoors.`,
    img: `${WIX}/3d2ae4_b6cb57504f5747669091fda1b5a59bbe~mv2.jpg/v1/crop/x_0,y_112,w_848,h_844/fill/w_600,h_600,al_c,q_85,usm_0.66_1.00_0.01/file.jpg`,
  },
  {
    name: 'Ivan Trinidad',
    title: 'BIM Detailer',
    bio: `Ivan began his career through the UA Local 469 apprenticeship, gaining experience on semiconductor facilities, fabrication shops, and complex piping systems. His hands-on background supports practical and efficient project coordination.

Outside of work, Ivan enjoys building custom computers and working on his cars.`,
    img: `${WIX}/3d2ae4_dc999110076e45a3b183b9d81c942739~mv2.jpg/v1/crop/x_0,y_335,w_848,h_844/fill/w_600,h_600,al_c,q_85,usm_0.66_1.00_0.01/file.jpg`,
  },
  {
    name: 'Charles Johnson',
    title: 'BIM Detailer',
    bio: `Charles brings more than 31 years of experience as a union pipefitter, working on semiconductor facilities, pharmaceutical plants, hospitals, data centers, and sporting arenas. After beginning with hand detailing, he transitioned into BIM using AutoCAD, SmartPlant, Revit, and CADWorx.

Outside of work, Charles is a proud father of four who enjoys fishing and 3D printing.`,
    img: `${WIX}/3d2ae4_f111d562cfa744fa81f323fc5f5251be~mv2.png/v1/crop/x_0,y_2,w_1024,h_1020/fill/w_600,h_600,al_c,q_85,usm_0.66_1.00_0.01/file.png`,
  },
  {
    name: 'Eli Miley',
    title: 'BIM Detailer',
    bio: `Elias recently graduated from high school and is beginning their career with MBT Design as an intern. They are gaining hands-on experience in VDC while developing their technical skills and learning from experienced members of the team.

Elias brings a positive attitude, curiosity, and a willingness to learn as they build a foundation for their career in the industry.

Outside of work, Elias enjoys spending time with friends and family, good conversation, and finding the humor in just about anything.`,
    img: `${WIX}/3d2ae4_1f72c5f3498f4895b11abd62b3fb3182~mv2.jpg/v1/crop/x_0,y_145,w_848,h_844/fill/w_600,h_600,al_c,q_85,usm_0.66_1.00_0.01/file.jpg`,
  },
  {
    name: 'Oscar Valencia',
    title: 'BIM Detailer',
    bio: `Oscar brings 20 years of experience working in semiconductor facilities, hospitals, and commercial buildings. After years as a field detailer, he transitioned into BIM detailing, bringing practical field knowledge and experience to his work.

Oscar eagerly takes on new challenges and is known for his positive attitude and commitment to producing quality work.

Outside of work, Oscar enjoys spending time with his children and family, and he and his wife especially enjoy getting away from the crowds and chaos to spend quiet time together.`,
    img: `${WIX}/3d2ae4_b715a3eaf3814132a71d818785a3ad35~mv2.jpg/v1/crop/x_0,y_138,w_848,h_844/fill/w_600,h_600,al_c,q_85,usm_0.66_1.00_0.01/file.jpg`,
  },
]

function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2)
  return (
    <div className="w-full aspect-square bg-[#1a1a1a] flex items-center justify-center">
      <span className="font-mono text-3xl font-bold text-[#2952ff]">{initials}</span>
    </div>
  )
}

function TeamGrid() {
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-0">
      {TEAM.map((p, i) => {
        const bioOpen = openIdx === i
        return (
          <Reveal key={p.name} delay={(i % 4) * 60} className="h-full">
            <div
              className={`group flex flex-col h-full border-[#d4d0c8] hover:bg-[#e6e2da] transition-colors duration-300
                ${(i + 1) % 4 !== 0 ? 'border-r' : ''} border-b`}
              onMouseLeave={() => setOpenIdx(null)}
            >
              {/* Photo with bio overlay */}
              <div className="relative overflow-hidden flex-shrink-0">
                {p.img ? (
                  <img
                    src={p.img}
                    alt={p.name}
                    className="w-full aspect-square object-cover"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling?.removeAttribute('style') }}
                  />
                ) : null}
                <div style={{ display: p.img ? 'none' : undefined }}>
                  <Avatar name={p.name} />
                </div>
                {/* Overlay: hover on desktop, tap-toggle on mobile */}
                <div
                  className={`absolute inset-0 bg-[#111]/90 flex items-start justify-center p-3 lg:p-5 overflow-y-auto
                    transition-opacity duration-300 cursor-pointer
                    group-hover:opacity-100
                    ${bioOpen ? 'opacity-100' : 'opacity-0'}`}
                  onClick={() => setOpenIdx(bioOpen ? null : i)}
                >
                  <p className="whitespace-pre-line text-[10px] md:text-[11px] lg:text-[15px] text-white/90 leading-snug lg:leading-relaxed text-center">{p.bio}</p>
                </div>
                {/* Tap hint on mobile + tablet (hidden on desktop) */}
                {!bioOpen && (
                  <div className="lg:hidden absolute bottom-2 right-2 bg-black/50 rounded-full px-2 py-0.5 pointer-events-none">
                    <span className="text-white/70 text-[9px] tracking-wider">TAP</span>
                  </div>
                )}
              </div>
              <div className="p-5 flex flex-col">
                <div className="font-mono text-[10px] text-[#e63329] tracking-[0.25em] mb-2">[{String(i + 1).padStart(2, '0')}]</div>
                <div className="font-bold uppercase tracking-tight text-[#111] text-sm mb-0.5">{p.name}</div>
                <div className="font-mono text-[10px] text-[#666] tracking-[0.12em] uppercase">{p.title}</div>
              </div>
            </div>
          </Reveal>
        )
      })}
    </div>
  )
}

export default function TeamPage() {
  return (
    <div className="min-h-screen bg-[#eeebe4]">
      <CustomCursor />

      <SiteNav />

      {/* Hero */}
      <div className="pt-16 border-b border-[#d4d0c8]">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-10 2xl:px-16 py-24 md:py-32">
          <Reveal>
            <div className="font-mono text-xs text-[#666] tracking-[0.3em] uppercase mb-6">The Team</div>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="text-[clamp(2.5rem,6vw,6rem)] font-bold tracking-tight leading-[0.9] uppercase mb-8">
              <span className="text-[#2952ff]">BUILT</span><br />
              BY TRADESPEOPLE
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="text-[#555] max-w-xl text-sm leading-relaxed">
              Every member of the MBT team comes from the field. Master plumbers, pipefitters, welders, apprentices, journeymen, foremen, superintendents — people who have actually built what they now coordinate in the model. That experience is our advantage.
            </p>
          </Reveal>
        </div>
      </div>

      {/* MBT Flow Graphic */}
      <div className="max-w-5xl mx-auto px-6 md:px-10 py-16">
        <Reveal>
          <img src={mbtFlow} alt="The MBT Approach" className="w-full h-auto" draggable={false}/>
        </Reveal>
      </div>

      {/* Leadership */}
      <div className="max-w-screen-2xl mx-auto px-6 md:px-10 2xl:px-16 py-20 border-b border-[#d4d0c8]">
        <Reveal>
          <div className="font-mono text-xs text-[#e63329] tracking-[0.3em] uppercase mb-12">Leadership</div>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          {LEADERSHIP.map((p, i) => (
            <Reveal key={p.name} delay={i * 80} className="h-full">
              <div className={`h-full py-10 ${i < LEADERSHIP.length - 1 ? 'border-b border-[#d4d0c8] md:border-b-0' : ''} md:px-10 first:pl-0`}>
                <div className={`mx-auto mb-6 overflow-hidden md:mx-0 ${p.video ? 'max-w-52' : 'max-w-64'}`}>
                  {p.video ? (
                    <video
                      src={p.video}
                      aria-label={`${p.name} headshot`}
                      className="block w-full aspect-2/3 object-cover"
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="metadata"
                    />
                  ) : p.img ? (
                    <img src={p.img} alt={p.name} className="w-full aspect-square object-cover" />
                  ) : (
                    <Avatar name={p.name} />
                  )}
                </div>
                <div className="mb-4 text-center font-mono text-xs tracking-[0.3em] text-[#e63329] md:text-left">[{String(i + 1).padStart(2, '0')}]</div>
                <div className="mb-1 text-center text-xl font-bold uppercase tracking-tight text-[#111] md:text-left">{p.name}</div>
                <div className="text-center font-mono text-xs uppercase tracking-[0.15em] text-[#666] md:text-left">{p.title}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Full team grid */}
      <div className="max-w-screen-2xl mx-auto px-6 md:px-10 2xl:px-16 py-20">
        <Reveal>
          <div className="font-mono text-xs text-[#e63329] tracking-[0.3em] uppercase mb-12">Team</div>
        </Reveal>
        <TeamGrid />
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
