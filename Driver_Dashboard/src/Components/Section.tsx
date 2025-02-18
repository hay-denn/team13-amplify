import { ReactNode } from "react";

//Declares a type section props
type SectionProps = {
  title?: string; //optional
  children: ReactNode; //React node means it can be a lots of things
};

//Children vs props
//Children is in between the h2 and paragraphs, etc

export const Section = ({ children, title = "Test" }: SectionProps) => {
  return (
    <section>
      <h2>{title}</h2>
      <p>{children}</p>
    </section>
  );
};
