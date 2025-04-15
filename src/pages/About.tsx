import { useState, useEffect } from "react";
import "./About.css";

type TeamMember = {
  MemeberID: number;
  FirstName: string;
  LastName: string;
};

type AboutTeam = {
  TeamNumber: number;
  SprintNumber: number;
  ReleaseDate: string;
  ProductName: string;
  ProductDescription: string;
};

export default function About() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [aboutTeam, setAboutTeam] = useState<AboutTeam | null>(null);
  // Loading & error states
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const API_ABOUT_URL = import.meta.env.VITE_API_ABOUT;

    const fetchTeamMembers = fetch(`${API_ABOUT_URL}/teammembers`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Team members fetch error! Status: ${response.status}`);
        }
        return response.json() as Promise<TeamMember[]>;
      });

    const fetchAboutTeam = fetch(`${API_ABOUT_URL}/aboutteam`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`About team fetch error! Status: ${response.status}`);
        }
        return response.json() as Promise<AboutTeam[]>;
      });

    Promise.all([fetchTeamMembers, fetchAboutTeam])
      .then(([membersData, aboutTeamData]) => {
        setTeamMembers(membersData);
        setAboutTeam(aboutTeamData[0] || null);
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch error:", err);
        setError("Failed to load team information.");
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div className="about-container">
        <h1>Loading...</h1>
      </div>
    );
  if (error)
    return (
      <div className="about-container">
        <h1>{error}</h1>
      </div>
    );

  return (
    <div className="about-container">
      <header className="about-header">
        <h1>About Our Team</h1>
      </header>

      {/* About Team Info */}
      <section className="about-info">
        {aboutTeam ? (
          <div className="about-team-card">
            <h2>{aboutTeam.ProductName}</h2>
            <p className="product-description">{aboutTeam.ProductDescription}</p>
            <div className="about-team-details">
              <p>
                <strong>Team Number:</strong> {aboutTeam.TeamNumber}
              </p>
              <p>
                <strong>Sprint Number:</strong> {aboutTeam.SprintNumber}
              </p>
              <p>
                <strong>Release Date:</strong> {aboutTeam.ReleaseDate}
              </p>
            </div>
          </div>
        ) : (
          <p className="no-info">No "About Team" info available.</p>
        )}
      </section>

      {/* Team Members */}
      <section className="team-members">
        <h2>Team Members</h2>
        {teamMembers.length === 0 ? (
          <p>No team members found.</p>
        ) : (
          <div className="members-grid">
            {teamMembers.map(member => (
              <div key={member.MemeberID} className="member-card">
                <p className="member-name">
                  {member.FirstName} {member.LastName}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
