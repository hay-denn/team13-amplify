import { Navbar } from "../components/Navbar";
import { DriverDashboard } from "./DriverDashboard";
import { TopBox } from "../components/TopBox/TopBox";
export const SponsorDashboard = () => {
  return (
    <>
      <div>
        <h1 className="welcome">Good Afternoon Sponsor!!</h1>

        <div className="home">
          <div className="box box1">
            <TopBox></TopBox>
          </div>
          <div className="box box2">
            <b>Graph Here?</b>
          </div>
          <div className="box box3">Featured Users</div>
          <div className="box box4">Company Notices</div>
          <div className="box box5">Stats?</div>
        </div>
      </div>
      ;
    </>
  );
};
