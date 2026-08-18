import type { MouseEvent } from 'react';
import { Briefcase, Compass, GraduationCap, Laptop, Rocket } from 'lucide-react';

import './styles/roleSelect.css';

export type RoleId =
  | 'students-interns'
  | 'freshers-entry-level'
  | 'experienced-professionals'
  | 'career-switchers-returners'
  | 'freelance-contract';

export type RoleOption = {
  id: RoleId;
  title: string;
  description: string;
  tint: string;
  icon: typeof GraduationCap;
};

// Single source of truth for the five audiences. Each id maps to its own
// question set in `roleQuestionnaires` (see questionnaire.ts) — swap the
// placeholder questions there later without touching this list or the
// selection screen itself.
export const roleOptions: RoleOption[] = [
  {
    id: 'students-interns',
    title: 'Students & Interns',
    description: 'Currently studying and looking for internships, campus placements, or part-time roles.',
    tint: 'var(--color-blue)',
    icon: GraduationCap,
  },
  {
    id: 'freshers-entry-level',
    title: 'Freshers & Entry-Level',
    description: 'Recently graduated or under 2 years in, applying for your first full-time roles.',
    tint: 'var(--color-gold)',
    icon: Rocket,
  },
  {
    id: 'experienced-professionals',
    title: 'Experienced Professionals',
    description: 'Established in your field and moving toward your next, more senior opportunity.',
    tint: 'var(--color-green)',
    icon: Briefcase,
  },
  {
    id: 'career-switchers-returners',
    title: 'Career Switchers & Returners',
    description: 'Changing industries or functions, or returning to work after a break.',
    tint: 'var(--color-red)',
    icon: Compass,
  },
  {
    id: 'freelance-contract',
    title: 'Freelance & Contract',
    description: 'Independent, project-based, or contract work across multiple clients.',
    tint: 'var(--color-blue)',
    icon: Laptop,
  },
];

export function roleLabel(id: string | null | undefined): string | null {
  return roleOptions.find((role) => role.id === id)?.title ?? null;
}

function Logo() {
  return (
    <a className="logo" href="#top">
      <b>↗</b>resume<span>redefined</span>
    </a>
  );
}

function RoleSelect({
  selectedRole,
  onSelect,
  onBack,
}: {
  selectedRole: string | null;
  onSelect: (roleId: RoleId) => void;
  onBack: () => void;
}) {
  const back = (event: MouseEvent) => {
    event.preventDefault();
    onBack();
  };

  return (
    <div className="role-select-page graph-canvas">
      <main>
        <nav className="nav container" id="top">
          <Logo />
          <a className="back-link" href="#" onClick={back} data-testid="link-back-home">
            &larr; Back to home
          </a>
        </nav>

        <section className="role-hero container">
          <p className="kicker">&mdash; ONE QUICK QUESTION</p>
          <h1>Who are you building this resume for?</h1>
          <p className="lead">
            Your answer decides which questions we ask next, so the profile you build matches where you actually
            are in your career.
          </p>
        </section>

        <section className="container">
          <div className="role-list" role="list">
            {roleOptions.map((role) => {
              const Icon = role.icon;
              return (
                <button
                  key={role.id}
                  type="button"
                  role="listitem"
                  className={`role-card ${selectedRole === role.id ? 'selected' : ''}`}
                  style={{ ['--role-tint' as string]: role.tint }}
                  onClick={() => onSelect(role.id)}
                  data-testid={`button-role-${role.id}`}
                >
                  <span className="role-icon">
                    <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
                  </span>
                  <span className="role-copy">
                    <b>{role.title}</b>
                    <small>{role.description}</small>
                  </span>
                  <span className="role-arrow" aria-hidden="true">
                    &rarr;
                  </span>
                </button>
              );
            })}
          </div>
          <p className="role-note">
            Not sure which fits? Pick the closest match — you can start over at any time, and nothing is shared
            until you choose to export it.
          </p>
        </section>

        <footer className="container">
          <Logo />
          <span>Build your career story with intention.</span>
          <small>© 2026 Resume Redefined</small>
        </footer>
      </main>
    </div>
  );
}

export default RoleSelect;
