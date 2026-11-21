import { profile } from '../../data/profile';
import { ContactList } from '../workspace/apps';
import { Icon } from '../ui/Icon';
import { useMediaQuery } from '../../hooks/useMedia';

/** The resume, viewable in place or downloadable. */
export function Resume() {
  // Phones rarely render PDFs inline, so they get the buttons only.
  const canEmbed = useMediaQuery('(min-width: 900px)');
  return (
    <section id="resume" className="section resume" aria-labelledby="resume-title">
      <div className="container">
        <div className="resume__inner panel-right">
          <p className="eyebrow">Resume</p>
          <h2 id="resume-title" className="section__title">
            The one-page version.
          </h2>
          <p className="section__lead">Education, skills, projects and activities — updated for Fall 2026.</p>
          <div className="resume__actions">
            <a className="btn btn--primary" href={profile.links.resume} target="_blank" rel="noopener noreferrer">
              <Icon name="external" /> View resume
            </a>
            <a className="btn" href={profile.links.resume} download="AdityaGupta_Resume.pdf">
              <Icon name="download" /> Download PDF
            </a>
          </div>
          {canEmbed && (
            <div className="resume__frame">
              <object data={`${profile.links.resume}#view=FitH&toolbar=0`} type="application/pdf" aria-label="Resume preview">
                <p>
                  This browser can’t show PDFs inline. <a href={profile.links.resume}>Open the resume</a> instead.
                </p>
              </object>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/** Scene 7: contact, as the camera pulls back to the whole desk. */
export function Contact({ has3D }: { has3D: boolean }) {
  return (
    <section id="contact" className="section contact" aria-labelledby="contact-title">
      <div className="container">
        <div className="contact__inner panel-left">
          <p className="eyebrow">Contact</p>
          <h2 id="contact-title" className="contact__title">
            Let’s build something.
          </h2>
          <p className="section__lead">I’m always happy to talk about internships, projects or Formula 1. Email is the fastest way to reach me.</p>
          <ContactList />
        </div>
      </div>
      <footer className="footer">
        <div className="container footer__inner">
          <p>
            © {new Date().getFullYear()} {profile.name}
          </p>
          <p className="footer__links">
            <a href={profile.links.instagram} target="_blank" rel="noopener noreferrer">
              <Icon name="instagram" size={16} /> Instagram
            </a>
            <a href={profile.links.portfolioRepo} target="_blank" rel="noopener noreferrer">
              <Icon name="github" size={16} /> Source
            </a>
          </p>
          <p className="muted">
            Desk modelled in code with Three.js · {has3D ? <a href="?lite">Lite version without 3D</a> : <a href="./">Full 3D version</a>}
          </p>
        </div>
      </footer>
    </section>
  );
}
