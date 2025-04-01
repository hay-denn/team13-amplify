import { TopBox } from "../components/TopBox/TopBox";
import { ChartBox } from "../components/Charts/chartBox";
import "./SponsorDashboard.css";

export const SponsorDashboard = () => {
  return (
    <div className="container my-4">
      <h1 className="text-center mb-5">Good Afternoon Sponsor!!</h1>

      <div className="row g-3">
        <div className="col-md-4">
          <div className="box box1">
            <TopBox />
          </div>
        </div>

        <div className="col-md-8">
          <div className="box box2">
            <ChartBox />
          </div>
        </div>

        <div className="col-md-4">
          <div className="box box3">Featured Users</div>
        </div>
        <div className="col-md-4">
          <div className="box box4">Company Notices</div>
        </div>
        <div className="col-md-4">
          <div className="box box5">Stats?</div>
        </div>
      </div>
    </div>
  );
};
