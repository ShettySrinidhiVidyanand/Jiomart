import { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "./CategoryCarousel.css";

import essentials from "../assets/essentials.webp";
import home_lifestyle from "../assets/home_lifestyle.webp";
import Smartphones from "../assets/Smartphones.webp";
import Fashion from "../assets/Fashion.webp";
import Electronics from "../assets/Electronics.webp";
import Groceries from "../assets/Groceries.webp";
import store999 from "../assets/store999.webp";
import globalstore from "../assets/globalstore.webp";
import localshops from "../assets/localshops.webp";
import milkbasket from "../assets/milkbasket.webp";

const categories = [
  { name: "Everyday Essentials", img: essentials },
  { name: "Home & Lifestyle", img: home_lifestyle },
  { name: "Smartphone Deals", img: Smartphones },
  { name: "Fashion", img: Fashion },
  { name: "Electronics", img: Electronics },
  { name: "Groceries", img: Groceries },
  { name: "₹99 to ₹999 Store", img: store999 },
  { name: "Global Store", img: globalstore },
  { name: "Local Shops", img: localshops },
  { name: "Milkbasket", img: milkbasket },
];

function CategoryCarousel() {

  const [index, setIndex] = useState(0);
  const visibleItems = 5;

  const next = () => {
    if (index < categories.length - visibleItems) {
      setIndex(index + 1);
    }
  };

  const prev = () => {
    if (index > 0) {
      setIndex(index - 1);
    }
  };

  return (
    <div className="category-wrapper">

      <button className="nav-btn left" onClick={prev}>
        <FaChevronLeft size={12} />
      </button>

      <div className="category-container">
        <div
          className="category-track"
          style={{
            transform: `translateX(-${index * 20}%)`
          }}
        >
          {categories.map((cat, i) => (
            <div className="category-item" key={i}>
              <img src={cat.img} alt={cat.name} />
              <span>{cat.name}</span>
            </div>
          ))}
        </div>
      </div>

      <button className="nav-btn right" onClick={next}>
        <FaChevronRight size={12} />
      </button>

    </div>
  );
}

export default CategoryCarousel;