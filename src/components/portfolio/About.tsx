import { profile, education, personal, certifications, activities } from '../../data/profile';
import { Icon } from '../ui/Icon';

/** Scene 6: the person behind the projects. Warmer light, right-hand column. */
export function About() {
  return (
    <section id="about" className="section about" aria-labelledby="about-title">
      <div className="container">
        <div className="about__inner panel-right">
        <p className="eyebrow">About</p>
        <h2 id="about-title" className="section__title">
          Curious about how things work — then building them.
        </h2>
        <div className="about__story">
          {personal.story.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>

        <div className="edu" aria-labelledby="edu-title">
          <div className="edu__head">
            <span className="edu__icon" aria-hidden="true">
              <Icon name="cap" size={20} />
            </span>
            <div>
              <h3 id="edu-title">{education.school}</h3>
              <p className="muted">
                {education.degree} · {education.college}
              </p>
            </div>
          </div>
          <dl className="edu__facts">
            <div>
              <dt>Standing</dt>
              <dd>{profile.year}</dd>
            </div>
            <div>
              <dt>Graduation</dt>
              <dd>{education.graduation}</dd>
            </div>
            <div>
              <dt>GPA</dt>
              <dd>{education.gpa}</dd>
            </div>
            <div>
              <dt>Honours</dt>
              <dd>
                {education.honors.map((h) => (
                  <span key={h} className="edu__honor">
                    {h}
                  </span>
                ))}
              </dd>
            </div>
          </dl>
          <div className="edu__courses">
            <div>
              <h4>Completed</h4>
              <ul>
                {education.completed.map((c) => (
                  <li key={c.name}>
                    <span className="mono">{c.code}</span> {c.name}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4>In progress · {education.inProgress.term}</h4>
              <ul>
                {education.inProgress.courses.map((c) => (
                  <li key={c.code}>
                    <span className="mono">{c.code}</span> {c.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="about__grid">
          <div>
            <h3 className="about__sub">Activities</h3>
            {activities.map((a) => (
              <div key={a.title} className="activity">
                <p className="activity__title">
                  {a.title} <span className="muted">· {a.when}</span>
                </p>
                {a.points.map((p) => (
                  <p key={p} className="activity__point">
                    {p}
                  </p>
                ))}
              </div>
            ))}
          </div>
          <div>
            <h3 className="about__sub">Certification</h3>
            {certifications.map((c) => (
              <p key={c.name} className="activity__title">
                {c.name} <span className="muted">· {c.issuer} · {c.status}</span>
              </p>
            ))}
            <h3 className="about__sub">Interests</h3>
            <div className="chip-row">
              {[...profile.interests, ...personal.hobbies].map((h) => (
                <span key={h} className="chip">
                  {h}
                </span>
              ))}
            </div>
            <h3 className="about__sub">Where I’m headed</h3>
            <p className="muted">{profile.goal} — on a team where craft, curiosity and impact all matter.</p>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}
