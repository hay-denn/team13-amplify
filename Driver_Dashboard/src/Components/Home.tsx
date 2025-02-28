import { useState } from "react";
import "./HomeStyles.css";
import { TopBox } from "./TopBox/TopBox";
import "bootstrap/dist/css/bootstrap.min.css";
import CarouselTemplate from "./ImageCycles";
import ApplySponsorModal from "./SponsorApplyModal";

interface Props {
  userFName?: string;
  companyName?: string;
}

export const Home = ({ userFName = "User", companyName }: Props) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <h1 className="welcome">Good Afternoon, {userFName}!</h1>

      {companyName ? (
        <div className="home">
          <div className="box box1">
            <TopBox />
          </div>
          <div className="box box2">
            <b>Current Point Balance</b>
          </div>
          <div className="box box3">Placeholder Item</div>
          <div className="box box4">Placeholder Item</div>
          <div className="box box5">My Point Progress Chart:</div>
        </div>
      ) : (
        <div className="container-fluid">
          <div className="row align-items-center">
            <div className="col-md-5 left-col">
              <h2>Next Steps:</h2>
              <p>
                Now that you have completed registration as a driver, it is time
                for you to start applying to a sponsor of your choice.
              </p>
              <button className="btn btn-primary mb-3" onClick={() => setShowModal(true)}>
                Apply Now!
              </button>
            </div>
            <div className="col-md-7 right-col">
              <CarouselTemplate />
            </div>
          </div>
        </div>
      )}

      <ApplySponsorModal show={showModal} handleClose={() => setShowModal(false)} userFName={userFName} />
    </>
  );
};