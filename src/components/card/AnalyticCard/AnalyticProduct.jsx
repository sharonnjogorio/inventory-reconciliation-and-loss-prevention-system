import React from "react";
import AnalyticProductCard from "./AnalyticProductCard";

const AnalyticProduct = ({ products = [], loading = false }) => {
  return (
    <div style={{ padding: "24px", minHeight: "500px" }}>
      <AnalyticProductCard products={products} loading={loading} />
    </div>
  );
};

export default AnalyticProduct;
