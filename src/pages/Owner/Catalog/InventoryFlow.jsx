import React, { useReducer, useEffect, useCallback } from 'react';
import styles from './InventoryFlow.module.css';

// Dummy API functions
const fetchCategories = () =>
  new Promise((resolve) =>
    setTimeout(() => resolve(['Sachet', 'Bottle', 'Jerrycan']), 500)
  );

const fetchBrands = () =>
  new Promise((resolve) =>
    setTimeout(() => resolve(['CocaCola', 'Pepsi', 'Fanta']), 500)
  );

const fetchSKUs = () =>
  new Promise((resolve) =>
    setTimeout(
      () =>
        resolve([
          { volume: '1L', threshold: 10 },
          { volume: '5L', threshold: 5 },
        ]),
      500
    )
  );

// Reducer
const initialState = {
  step: 1,
  categories: [],
  brands: [],
  skus: [],
  newCategory: '',
  newBrand: '',
  newSKU: { volume: '', threshold: '' },
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.payload };
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
    case 'SET_BRANDS':
      return { ...state, brands: action.payload };
    case 'SET_SKUS':
      return { ...state, skus: action.payload };
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, state.newCategory], newCategory: '' };
    case 'ADD_BRAND':
      return { ...state, brands: [...state.brands, state.newBrand], newBrand: '' };
    case 'ADD_SKU':
      return { ...state, skus: [...state.skus, state.newSKU], newSKU: { volume: '', threshold: '' } };
    case 'SET_NEW_CATEGORY':
      return { ...state, newCategory: action.payload };
    case 'SET_NEW_BRAND':
      return { ...state, newBrand: action.payload };
    case 'SET_NEW_SKU':
      return { ...state, newSKU: { ...state.newSKU, ...action.payload } };
    default:
      return state;
  }
}

export default function InventoryFlow() {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Fetch initial data
  useEffect(() => {
    fetchCategories().then((data) => dispatch({ type: 'SET_CATEGORIES', payload: data }));
    fetchBrands().then((data) => dispatch({ type: 'SET_BRANDS', payload: data }));
    fetchSKUs().then((data) => dispatch({ type: 'SET_SKUS', payload: data }));
  }, []);

  const handleAddCategory = useCallback(() => {
    if (state.newCategory.trim() === '') return;
    dispatch({ type: 'ADD_CATEGORY' });
  }, [state.newCategory]);

  const handleAddBrand = useCallback(() => {
    if (state.newBrand.trim() === '') return;
    dispatch({ type: 'ADD_BRAND' });
  }, [state.newBrand]);

  const handleAddSKU = useCallback(() => {
    if (!state.newSKU.volume || !state.newSKU.threshold) return;
    dispatch({ type: 'ADD_SKU' });
  }, [state.newSKU]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Inventory Setup Flow</h1>

      {/* Step Navigation */}
      <div className={styles.steps}>
        <button
          className={state.step === 1 ? styles.activeStep : ''}
          onClick={() => dispatch({ type: 'SET_STEP', payload: 1 })}
        >
          1. Category
        </button>
        <button
          className={state.step === 2 ? styles.activeStep : ''}
          onClick={() => dispatch({ type: 'SET_STEP', payload: 2 })}
        >
          2. Brand
        </button>
        <button
          className={state.step === 3 ? styles.activeStep : ''}
          onClick={() => dispatch({ type: 'SET_STEP', payload: 3 })}
        >
          3. SKU
        </button>
      </div>

      {/* Step 1: Category */}
      {state.step === 1 && (
        <div className={styles.stepContainer}>
          <h2>Step 1: Category Setup</h2>
          <input
            type="text"
            placeholder="New Category"
            value={state.newCategory}
            onChange={(e) => dispatch({ type: 'SET_NEW_CATEGORY', payload: e.target.value })}
          />
          <button onClick={handleAddCategory}>Add Category</button>
          <ul className={styles.list}>
            {state.categories.map((cat, index) => (
              <li key={index}>{cat}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Step 2: Brand */}
      {state.step === 2 && (
        <div className={styles.stepContainer}>
          <h2>Step 2: Brand Creation</h2>
          <input
            type="text"
            placeholder="New Brand"
            value={state.newBrand}
            onChange={(e) => dispatch({ type: 'SET_NEW_BRAND', payload: e.target.value })}
          />
          <button onClick={handleAddBrand}>Add Brand</button>
          <ul className={styles.list}>
            {state.brands.map((brand, index) => (
              <li key={index}>
                <div className={styles.brandIcon}>{brand[0].toUpperCase()}</div>
                {brand}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Step 3: SKU */}
      {state.step === 3 && (
        <div className={styles.stepContainer}>
          <h2>Step 3: SKU Definition</h2>
          <input
            type="text"
            placeholder="Volume (e.g., 1L)"
            value={state.newSKU.volume}
            onChange={(e) => dispatch({ type: 'SET_NEW_SKU', payload: { volume: e.target.value } })}
          />
          <input
            type="number"
            placeholder="Restock Threshold"
            value={state.newSKU.threshold}
            onChange={(e) => dispatch({ type: 'SET_NEW_SKU', payload: { threshold: e.target.value } })}
          />
          <button onClick={handleAddSKU}>Add SKU</button>
          <ul className={styles.list}>
            {state.skus.map((sku, index) => (
              <li key={index}>
                {sku.volume} - Threshold: {sku.threshold}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}


// I can also enhance this further by adding:

// Color-coded brand icons based on the first letter

// Validation for duplicates

// Save-to-backend simulation with fetch('/api/...')