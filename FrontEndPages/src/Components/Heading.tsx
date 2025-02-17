import { ReactElement } from "react";
type HeadingProps = { title: string }; //what we would pass in
//would be a string
//Destructing from props

const Heading = ({ title }: HeadingProps): ReactElement => {
  //Return of the functional component is a JSX
  //Element
  return <h1>{title}</h1>;
};

export default Heading;
