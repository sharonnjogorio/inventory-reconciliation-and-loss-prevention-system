import React, { useContext, useState } from "react";
import styles from "./ProductCard.module.css";
import { CartContext } from "../../context/CartContext"; // optional shared state

const ProductCard = ({ id, name, description, image }) => {
  const { cart, addItem, removeItem } = useContext(CartContext);
  const [inCart, setInCart] = useState(false);

  const handleAdd = () => {
    setInCart(true);
    if (addItem) addItem({ id, name, image });
  };

  const handleRemove = () => {
    setInCart(false);
    if (removeItem) removeItem(id);
  };

  return (
    <div className={styles.card}>
      <div className={styles.imgWrapper}>
        <img src={image} alt={name} className={styles.image} />
      </div>
      <div className={styles.info}>
        <h3 className={styles.title}>{name}</h3>
        <p className={styles.description}>{description}</p>
      </div>

      <div className={styles.actions}>
        {inCart ? (
          <>
            <button onClick={handleRemove} className={styles.removeBtn}>
              Remove
            </button>
            <button disabled className={styles.addedBtn}>
              Added
            </button>
          </>
        ) : (
          <>
            <button disabled className={styles.removeBtnAlt}>
              Remove
            </button>
            <button onClick={handleAdd} className={styles.addBtn}>
              Add
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
