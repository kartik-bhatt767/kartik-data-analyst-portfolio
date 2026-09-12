const projects = [
  {
    number: '01',
    type: 'Business intelligence · case study',
    title: 'Retail sales, without the fog',
    description: 'A real-world retail analysis that turns public transaction data into clear revenue, product-mix, and cancellation decisions.',
    tools: ['Python', 'SQL', 'Next.js'],
    result: 'Read case study ↗',
    href: '/projects/superstore-sales-dashboard',
  },
  {
    number: '02',
    type: 'Customer analytics · case study',
    title: 'Churn, before cancellation',
    description: 'An intermediate retention analysis combining cohort segmentation, recurring-charge exposure, and churn-risk scoring.',
    tools: ['Python', 'SQL', 'BI'],
    result: 'Read case study ↗',
    href: '/projects/customer-churn-analysis',
  },
  {
    number: '03',
    type: 'Operations analytics · case study',
    title: 'Plan for the next rush',
    description: 'An hourly demand analysis that turns bike-sharing patterns into practical capacity-planning signals.',
    tools: ['Python', 'SQL', 'Next.js'],
    result: 'Read case study ↗',
    href: '/projects/bike-sharing-operations',
  },
];

const tools = ['SQL', 'Python', 'Excel', 'Power BI', 'Tableau', 'Pandas', 'NumPy', 'Statistics'];

export default function Home() {
  return (
    <main className="site-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Kartik Bhatt data analyst home">KARTIK<span>/</span>BHATT</a>
        <nav className="main-nav" aria-label="Main navigation">
          <a href="#work">Work</a>
          <a href="#about">Approach</a>
          <a href="#contact">Contact</a>
        </nav>
        <a className="header-cta" href="https://www.linkedin.com/in/kartik-bhatt-33bbb02b7/" target="_blank" rel="noreferrer">LinkedIn <span aria-hidden="true">↗</span></a>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-dot" /> 3rd-year data analyst student</div>
          <h1>I turn messy data into <em>clear decisions.</em></h1>
          <p className="hero-intro">I’m Kartik Bhatt, a third-year B.Tech CSE (AI/ML) student in Lucknow, India, focused on finding the signal, building trust in the numbers, and making the next move easier to see.</p>
          <div className="hero-actions">
            <a className="button button-dark" href="#work">View selected work <span aria-hidden="true">↓</span></a>
            <a className="button button-quiet" href="#about">How I work <span aria-hidden="true">↘</span></a>
          </div>
          <div className="hero-meta">
            <div><span className="meta-label">Based in</span><span>Lucknow, India</span></div>
            <div><span className="meta-label">Education</span><span>B.Tech CSE · AI/ML</span></div>
            <div><span className="meta-label">Status</span><span>3rd-year student</span></div>
          </div>
        </div>

        <div className="hero-visual" aria-label="Illustration of an upward analytics chart">
          <div className="visual-topline"><span>analysis / overview</span><span>working draft</span></div>
          <svg className="chart" viewBox="0 0 620 390" role="img" aria-label="An upward line chart showing performance growth">
            <g className="chart-grid">
              <line x1="35" y1="65" x2="585" y2="65" />
              <line x1="35" y1="130" x2="585" y2="130" />
              <line x1="35" y1="195" x2="585" y2="195" />
              <line x1="35" y1="260" x2="585" y2="260" />
              <line x1="35" y1="325" x2="585" y2="325" />
            </g>
            <polyline className="chart-area" points="35,286 112,260 182,276 254,204 326,220 400,152 470,162 525,95 585,72 585,325 35,325" />
            <polyline className="chart-line" points="35,286 112,260 182,276 254,204 326,220 400,152 470,162 525,95 585,72" />
            <circle className="chart-point" cx="525" cy="95" r="7" />
            <circle className="chart-point-inner" cx="525" cy="95" r="3" />
          </svg>
          <div className="chart-callout"><strong>INSIGHT</strong><span>from the data</span></div>
          <div className="chart-labels"><span>Jan</span><span>Mar</span><span>Jun</span><span>Sep</span><span>Dec</span></div>
        </div>
      </section>

      <div className="signal-strip" aria-label="Areas of focus">
        <span>SQL</span><i>✦</i><span>Python</span><i>✦</i><span>Power BI</span><i>✦</i><span>Statistics</span><i>✦</i><span>Better questions</span>
      </div>

      <section className="section work-section" id="work">
        <div className="section-heading">
          <div className="section-kicker"><span>01</span><span>Selected work</span></div>
          <p>Three case studies are ready. Each starts with a real business question, makes its assumptions visible, and ends with an action someone could explain in an interview.</p>
        </div>
        <div className="project-grid">
          {projects.map((project) => {
            const card = (
              <article className="project-card">
                <div className="project-topline"><span>{project.number}</span><span>{project.type}</span></div>
                <div className="project-body">
                  <h2>{project.title}</h2>
                  <p>{project.description}</p>
                </div>
                <div className="project-bottomline"><div className="tool-list">{project.tools.map((tool) => <span key={tool}>{tool}</span>)}</div><strong>{project.result}</strong></div>
              </article>
            );

            return project.href ? <a className="project-card-link" key={project.number} href={project.href}>{card}</a> : <div key={project.number}>{card}</div>;
          })}
        </div>
      </section>

      <section className="section about-section" id="about">
        <div className="section-kicker"><span>02</span><span>Approach</span></div>
        <div className="about-layout">
          <h2>Good analysis starts with a better question.</h2>
          <div className="about-copy">
            <p>I bring structure to ambiguous problems: understand the context, clean the right data, test the story, and present the answer in language people can use. I’m currently building my foundation through a B.Tech in Computer Science Engineering with AI/ML.</p>
            <div className="tool-cloud">{tools.map((tool) => <span key={tool}>{tool}</span>)}</div>
          </div>
        </div>
      </section>

      <section className="contact-section" id="contact">
        <div className="contact-kicker">Have a question worth answering?</div>
        <h2>Let&apos;s find the signal.</h2>
        <p>Open to thoughtful teams, useful problems, and work that makes a measurable difference.</p>
        <a className="contact-link" href="https://www.linkedin.com/in/kartik-bhatt-33bbb02b7/" target="_blank" rel="noreferrer">Connect on LinkedIn <span aria-hidden="true">↗</span></a>
        <div className="profile-links" aria-label="Profile links">
          <a href="https://mail.google.com/mail/?view=cm&fs=1&to=kartikbhatt23100%40gmail.com&su=Hello%20Kartik%20Bhatt" target="_blank" rel="noreferrer">Gmail <span aria-hidden="true">↗</span></a>
          <a href="https://github.com/kartik-bhatt767" target="_blank" rel="noreferrer">GitHub <span aria-hidden="true">↗</span></a>
          <a href="https://www.kaggle.com/kartikbhatt5533" target="_blank" rel="noreferrer">Kaggle <span aria-hidden="true">↗</span></a>
        </div>
      </section>

      <footer className="site-footer"><span>KARTIK BHATT</span><span>© 2026 · Lucknow, India</span><span>SQL · PYTHON · BI</span></footer>
    </main>
  );
}
