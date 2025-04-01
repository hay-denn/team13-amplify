import "./topBox.css";
import { catalogData } from "../TestData/ExampleItems";

export const TopBox = () => {
  return (
    <div className="topBox">
      <h2>Featured Items</h2>
      <div className="list">
        {catalogData.map((item) => (
          <div className="user" key={item.id}>
            <div className="name">{item.name}</div>
            <span className="amount">{item.price}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
