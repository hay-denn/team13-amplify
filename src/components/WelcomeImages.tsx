import { Component } from "react";
import "./ImageCycles.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

class CarouselTemplate extends Component {
  render() {
    return (
      <div>
        <div id="myCarousel" className="carousel slide" data-bs-ride="carousel">
          <div className="carousel-indicators">
            <button
              type="button"
              data-bs-target="#myCarousel"
              data-bs-slide-to="0"
              className="active"
              aria-current="true"
              aria-label="Slide 1"
            />
            <button
              type="button"
              data-bs-target="#myCarousel"
              data-bs-slide-to="1"
              aria-label="Slide 2"
            />
            <button
              type="button"
              data-bs-target="#myCarousel"
              data-bs-slide-to="2"
              aria-label="Slide 3"
            />
          </div>

          <div className="carousel-inner">
            <div className="carousel-item active">
              <img
                src="/images/TruckDriver1.png"
                className="d-block w-100"
                alt="First Slide"
                style={{ maxHeight: "500px" }}
              />
              <div className="carousel-caption d-none d-md-block">
                <h5>The Future is in your hands</h5>
                <p>Driving safe makes a difference.</p>
              </div>
            </div>
            <div className="carousel-item">
              <img
                src="/images/TruckDriver2.png"
                className="d-block w-100"
                alt="Second Slide"
                style={{ maxHeight: "500px" }}
              />
              <div className="carousel-caption d-none d-md-block"></div>
            </div>
            <div className="carousel-item">
              <img
                src="/images/TruckDriver3.png"
                className="d-block w-100"
                alt="Third Slide"
                style={{ maxHeight: "500px" }}
              />
              <div className="carousel-caption d-none d-md-block">
                <h5>Earn Rewards</h5>
                <p>Choose rewards based on a wide variety of products</p>
              </div>
            </div>
          </div>

          <button
            className="carousel-control-prev"
            type="button"
            data-bs-target="#myCarousel"
            data-bs-slide="prev"
          >
            <span
              className="carousel-control-prev-icon"
              aria-hidden="true"
            ></span>
            <span className="visually-hidden">Previous</span>
          </button>
          <button
            className="carousel-control-next"
            type="button"
            data-bs-target="#myCarousel"
            data-bs-slide="next"
          >
            <span
              className="carousel-control-next-icon"
              aria-hidden="true"
            ></span>
            <span className="visually-hidden">Next</span>
          </button>
        </div>
      </div>
    );
  }
}

export default CarouselTemplate;
