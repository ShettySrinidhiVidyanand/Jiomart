import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import "./BannerSlider.css";

function BannerSlider() {
  return (
    <div className="banner-container">
      <Carousel
        infiniteLoop
        showThumbs={false}
        showStatus={false}
      >
        <div>
          <img src="https://www.jiomart.com/images/cms/aw_rbslider/slides/1776071878_Tall_Banner_1.jpeg?im=Resize=(768,448)" alt="slide1" />
        </div>
        <div>
          <img src="https://www.jiomart.com/images/cms/aw_rbslider/slides/1770185919_Baby_Care_2.jpg?im=Resize=(768,448)" alt="slide2" />
        </div>
        <div>
          <img src="https://www.jiomart.com/images/cms/aw_rbslider/slides/1776072031_Tall_Banner_5.jpeg?im=Resize=(768,448)" alt="slide3" />
        </div>
      </Carousel>
    </div>
  );
}

export default BannerSlider;