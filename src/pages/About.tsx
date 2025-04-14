import { useState, useEffect } from "react";

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
        const API_URL = import.meta.env.VITE_API_ABOUT;

        const fetchTeamMembers = fetch(`${API_URL}/teammembers`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Team members fetch error! Status: ${response.status}`);
                }
                return response.json() as Promise<TeamMember[]>;
            });

        const fetchAboutTeam = fetch(`${API_URL}/aboutteam`)
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

    if (loading) return <h1>Loading...</h1>;
    if (error) return <h1>{error}</h1>;

    return (
        <div>
            <h1>About Our Team</h1>

            {/* About Team Info */}
            {aboutTeam ? (
                <div>
                    <p><strong>Team Number:</strong> {aboutTeam.TeamNumber}</p>
                    <p><strong>Sprint Number:</strong> {aboutTeam.SprintNumber}</p>
                    <p><strong>Release Date:</strong> {aboutTeam.ReleaseDate}</p>
                    <p><strong>Product Name:</strong> {aboutTeam.ProductName}</p>
                    <p><strong>Product Description:</strong> {aboutTeam.ProductDescription}</p>
                </div>
            ) : (
                <p>No "About Team" info available.</p>
            )}

            {/* Team Members */}
            <h2>Team Members</h2>
            {teamMembers.length === 0 ? (
                <p>No team members found.</p>
            ) : (
                <ul>
                    {teamMembers.map(member => (
                        <li key={member.MemeberID}>
                            {member.FirstName} {member.LastName}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}