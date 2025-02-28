import { Navbar } from "../components/Navbar";
import { TopBox } from "../components/TopBox/TopBox";

interface Props {
  userFName?: string;
  companyName?: string;
}

export const AdminDashboard = ({ userFName = "User" }: Props) => {
  return (
    <>
      <h1 className="welcome">Good Afternoon {userFName}!</h1>

      <div className="home">
        <div className="box box1">
          <TopBox></TopBox>
        </div>
        <div className="box box2">
          <b>Graph Here?</b>
        </div>
        <div className="box box3">Placeholder Item</div>
        <div className="box box4">Placeholder Item</div>
        <div className="box box5">Stats?</div>
      </div>
    </>
  );
};
