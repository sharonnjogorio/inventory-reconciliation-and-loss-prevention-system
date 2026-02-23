// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import AnalyticProductCard from "./AnalyticProductCard";

const AnalyticProduct = () => {
  const [products, setProducts] = useState(null);

  useEffect(() => {
    async function fetchProducts() {
      // Example placeholder – replace with your API/AI endpoint
      // const res = await fetch("https://your-api.com/top-products");
      // const json = await res.json();
      // setProducts(json.products);

      // Temporary mock response
      const mock = [
        { id: "p1", name: "AI‑Oil 5L", unitsSold: 300, revenue: 420.33 },
        { id: "p2", name: "AI‑Oil 2L", unitsSold: 210, revenue: 210.11 },
      ];
      setProducts(mock);
    }

    fetchProducts();
  }, []);

  return (
    <div
      style={{
        padding: "24px",
        minHeight: "500px",
      }}
    >
      <AnalyticProductCard products={products} />
    </div>
  );
};

export default AnalyticProduct;
