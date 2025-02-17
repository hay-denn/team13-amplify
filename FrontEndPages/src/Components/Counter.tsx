import { ReactNode } from "react";

//Type defining
type CounterProps = {
  setCount: React.Dispatch<React.SetStateAction<number>>;
  children: ReactNode; //ReactNode can be a olot
};
//UseState

export const Counter = ({ setCount, children }: CounterProps) => {
  //Use state component
  return (
    <>
      <h1>{children}</h1>
      <button onClick={() => setCount((prev) => prev + 1)}>+</button>
      <button onClick={() => setCount((prev) => prev - 1)}>-</button>
    </>
  );
};
