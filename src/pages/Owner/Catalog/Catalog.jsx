import React from "react";
import {Link }  from "react-router-dom";
import styles from "./Catalog.module.css";
import ProductCard from "../../../components/card/ProductCard/ProductCard";
import { CartProvider } from "../../../components/context/CartContext";
import kingsOil from "../../../assets/image/poweroil.svg";
import MamadorOil from "../../../assets/image/mamador.svg"
import GoldenPennyOil from "../../../assets/image/goldenpenny.svg"
import DevonKingOil from "../../../assets/image/devonking.svg"
import PowerOil from "../../../assets/image/mamador.svg"
import TurkeyOil from "../../../assets/image/poweroil.svg";
import Footer from '../../../components/card/Footer/Footer'
import Header from "../../../components/Header/Header";
import Button from "../../../components/ui/button/button";

const Catalog = () => {
    

    return (
        <div>
            <Header/>

            <div className={styles.catalogHeading}>
                <h1>Select Your Product Catalog</h1>
                <p>Choose the cooking oil brands and sizes you sell</p>
            </div>

                <section className={styles.brandSection} >
            <h3>Popular Brands</h3>
            <div className={styles.productBrandWrapper}>
                <CartProvider>
                    <div style={{ display: "flex", gap: "20px" }}>
                        <ProductCard
                            id="1"
                            name="Mamador"
                            description="Pure Vegetable Oil"
                            image={MamadorOil}
                        />
                    </div>
                </CartProvider>

                <CartProvider>
                    <div style={{ display: "flex", gap: "20px" }}>
                        <ProductCard
                            id="2"
                            name="King's Oil"
                            description="Premium Cooking Oil"
                            image={kingsOil}
                        />
                    </div>
                </CartProvider>

                <CartProvider>
                    <div style={{ display: "flex", gap: "20px" }}>
                        <ProductCard
                            id="3"
                            name="Golden Penny"
                            description="Quality Vegetable Oil"
                            image={GoldenPennyOil}
                        />
                    </div>
                </CartProvider>
            </div>

            <div className={styles.productBrandWrapper}>
                <CartProvider>
                    <div style={{ display: "flex", gap: "20px" }}>
                        <ProductCard
                            id="4"
                            name="Devon King's"
                            description="Pure Vegetable Oil"
                            image={DevonKingOil}
                        />
                    </div>
                </CartProvider>

                <CartProvider>
                    <div style={{ display: "flex", gap: "20px" }}>
                        <ProductCard
                            id="5"
                            name="Power Oil"
                            description="Cooking Oil"
                            image={PowerOil}
                        />
                    </div>
                </CartProvider>

                <CartProvider>
                    <div style={{ display: "flex", gap: "20px" }}>
                        <ProductCard
                            id="6"
                            name="Turkey"
                            description="Pure Vegetable Oil"
                            image={TurkeyOil}
                        />
                    </div>
                </CartProvider>
            </div>
        </section>

        <section className={styles.packageSelection}>
            <h3>Package Sizes for sale</h3>

            <div className={styles.productBrandWrapper}>
                <CartProvider>
                    <div style={{ display: "flex", gap: "20px" }}>
                        <ProductCard
                            id="7"
                            name="1 Litre"
                            description="Sachet/Bottle"
                            image={MamadorOil}
                        />
                    </div>
                </CartProvider>

                <CartProvider>
                    <div style={{ display: "flex", gap: "20px" }}>
                        <ProductCard
                            id="8"
                            name="2 Litres"
                            description="Bottle"
                            image={kingsOil}
                        />
                    </div>
                </CartProvider>

                <CartProvider>
                    <div style={{ display: "flex", gap: "20px" }}>
                        <ProductCard
                            id="9"
                            name="5 Litres"
                            description="Jerry Can"
                            image={GoldenPennyOil}
                        />
                    </div>
                </CartProvider>
            </div>

            <div className={styles.productBrandWrapper}>
                <CartProvider>
                    <div style={{ display: "flex", gap: "20px" }}>
                        <ProductCard
                            id="10"
                            name="10 Litres"
                            description="Jerry Can"
                            image={DevonKingOil}
                        />
                    </div>
                </CartProvider>

                <CartProvider>
                    <div style={{ display: "flex", gap: "20px" }}>
                        <ProductCard
                            id="11"
                            name="20 Litres"
                            description="Jerry Can"
                            image={PowerOil}
                        />
                    </div>
                </CartProvider>

                <CartProvider>
                    <div style={{ display: "flex", gap: "20px" }}>
                        <ProductCard
                            id="12"
                            name="25 Litres"
                            description="Jerry Can"
                            image={TurkeyOil}
                        />
                    </div>
                </CartProvider>
            </div>

        </section>

        <section className={styles.selectionSummary}> 
            <h4>Your Selection</h4>
            <ul>
                <li>2 Brands: Mamador, King's Oil</li>
                <li>4 Sizes: 1L, 2L, 5L, 25L</li>
                <li>Total SKUs: 8 product variants will be created</li>
            </ul>
        </section>

         <div className='catalog-button'>
            <div>
                <Link to={"/owner/dashboard"}><Button variant="outline">+ ADD CUSTOM BRAND</Button></Link>
            </div>
            <div>
                <Link to={"/owner/dashboard"}><Button>CONTINUE TO DASHBOARD</Button></Link>
            </div>
            
        </div>
      

        <Footer/>
        </div>
        

    )

}

export default Catalog;
