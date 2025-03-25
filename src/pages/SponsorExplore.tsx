import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./SponsorExplore.css";

interface Sponsor {
	OrganizationID: number;
	OrganizationName: string;
	OrganizationDescription: string;
	PointDollarRatio: string;
	AmountOfProducts: number;
	ProductType: string;
	MaxPrice: string;
	SearchTerm: string | null;
	}

export const SponsorExplore = () => {
	const [sponsors, setSponsors] = useState<Sponsor[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
	fetch("https://br9regxcob.execute-api.us-east-1.amazonaws.com/dev1/organizations")
		.then((res) => res.json())
		.then((data) => {
		setSponsors(data);
		setLoading(false);
		})
		.catch((error) => {
		console.error("Error fetching sponsors:", error);
		setLoading(false);
		});
	}, []);

	return (
	<div className="sponsor-explore">
		<h1>Explore Sponsors</h1>
		{loading ? (
		<p>Loading sponsors...</p>
		) : (
		<div className="sponsor-grid">
			{sponsors.map((sponsor) => (
			<Link
				to={`/sponsors/${sponsor.OrganizationID}`}
				key={sponsor.OrganizationID}
				className="sponsor-card"
			>
				<h2>{sponsor.OrganizationName}</h2>
				<p>{sponsor.OrganizationDescription || "No description available."}</p>
				<p><strong>Products:</strong> {sponsor.AmountOfProducts}</p>
				<p><strong>Max Price:</strong> ${sponsor.MaxPrice}</p>
			</Link>
			))}
		</div>
		)}
	</div>
	);
};
