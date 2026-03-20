import React, { useReducer, useEffect, useCallback } from 'react';
import styles from './InventoryFlow2.module.css';

// --------- Dummy API Layer ----------
const API_BASE = '/api/inventory';

const simulateFetch = (data, delay = 500) =>
  new Promise((resolve) => setTimeout(() => resolve(data), delay));

const api = {
  getCategories: async () => {
    try {
      const res = await fetch(`${API_BASE}/categories`);
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return simulateFetch(['Sachet', 'Bottle', 'Jerrycan']);
    }
  },
  getBrands: async () => {
    try {
      const res = await fetch(`${API_BASE}/brands`);
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return simulateFetch(['CocaCola', 'Pepsi']);
    }
  },
  getSKUs: async () => {
    try {
      const res = await fetch(`${API_BASE}/skus`);
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return simulateFetch([{ volume: '1L', threshold: 10 }]);
    }
  },
  save: async (type, payload) => {
    try {
      await fetch(`${API_BASE}/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {
      return simulateFetch({ success: true });
    }
  },
};

// --------- Reducer ----------
const initialState = {
  step: 1,
  categories: [],
  brands: [],
  skus: [],
  newCategory: '',
  newBrand: '',
  newSKU: { volume: '', threshold: '' },
  error: '',
  loading: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_DATA':
      return { ...state, ...action.payload };
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'SET_NEW_SKU':
      return { ...state, newSKU: { ...state.newSKU, ...action.payload } };
    case 'ADD_CATEGORY':
      return {
        ...state,
        categories: [...state.categories, action.payload],
        newCategory: '',
      };
    case 'ADD_BRAND':
      return {
        ...state,
        brands: [...state.brands, action.payload],
        newBrand: '',
      };
    case 'ADD_SKU':
      return {
        ...state,
        skus: [...state.skus, action.payload],
        newSKU: { volume: '', threshold: '' },
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

// --------- Helpers ----------
const getColorFromLetter = (letter) => {
  const colors = [
    '#FF6B6B',
    '#4ECDC4',
    '#1A535C',
    '#FF9F1C',
    '#6A4C93',
    '#2EC4B6',
  ];
  return colors[letter.charCodeAt(0) % colors.length];
};

// --------- Component ----------
export default function InventoryFlow2() {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const load = async () => {
      dispatch({ type: 'SET_FIELD', field: 'loading', value: true });
      const [categories, brands, skus] = await Promise.all([
        api.getCategories(),
        api.getBrands(),
        api.getSKUs(),
      ]);
      dispatch({
        type: 'SET_DATA',
        payload: { categories, brands, skus, loading: false },
      });
    };
    load();
  }, []);

  const validateDuplicate = (list, value, field) =>
    list.some((item) =>
      field ? item[field] === value : item.toLowerCase() === value.toLowerCase()
    );

  const handleAddCategory = useCallback(async () => {
    if (!state.newCategory.trim()) return;
    if (validateDuplicate(state.categories, state.newCategory)) {
      return dispatch({ type: 'SET_ERROR', payload: 'Category already exists' });
    }
    await api.save('categories', state.newCategory);
    dispatch({ type: 'ADD_CATEGORY', payload: state.newCategory });
    dispatch({ type: 'SET_ERROR', payload: '' });
  }, [state.newCategory, state.categories]);

  const handleAddBrand = useCallback(async () => {
    if (!state.newBrand.trim()) return;
    if (validateDuplicate(state.brands, state.newBrand)) {
      return dispatch({ type: 'SET_ERROR', payload: 'Brand already exists' });
    }
    await api.save('brands', state.newBrand);
    dispatch({ type: 'ADD_BRAND', payload: state.newBrand });
    dispatch({ type: 'SET_ERROR', payload: '' });
  }, [state.newBrand, state.brands]);

  const handleAddSKU = useCallback(async () => {
    const { volume, threshold } = state.newSKU;
    if (!volume || !threshold) return;
    if (validateDuplicate(state.skus, volume, 'volume')) {
      return dispatch({ type: 'SET_ERROR', payload: 'SKU volume already exists' });
    }
    const newSKU = { volume, threshold: Number(threshold) };
    await api.save('skus', newSKU);
    dispatch({ type: 'ADD_SKU', payload: newSKU });
    dispatch({ type: 'SET_ERROR', payload: '' });
  }, [state.newSKU, state.skus]);

  return (
    <div className={styles.container}>
      <h1>Inventory Setup Flow</h1>

      <div className={styles.steps}>
        {[1, 2, 3].map((s) => (
          <button
            key={s}
            className={state.step === s ? styles.active : ''}
            onClick={() => dispatch({ type: 'SET_FIELD', field: 'step', value: s })}
          >
            Step {s}
          </button>
        ))}
      </div>

      {state.error && <p className={styles.error}>{state.error}</p>}

      {state.step === 1 && (
        <div className={styles.card}>
          <h2>Category Setup</h2>
          <div className={styles.inputRow}>
            <input
              value={state.newCategory}
              onChange={(e) =>
                dispatch({ type: 'SET_FIELD', field: 'newCategory', value: e.target.value })
              }
              placeholder="e.g. Sachet"
            />
            <button onClick={handleAddCategory}>Add</button>
          </div>
          <ul>
            {state.categories.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      {state.step === 2 && (
        <div className={styles.card}>
          <h2>Brand Creation</h2>
          <div className={styles.inputRow}>
            <input
              value={state.newBrand}
              onChange={(e) =>
                dispatch({ type: 'SET_FIELD', field: 'newBrand', value: e.target.value })
              }
              placeholder="e.g. AquaPure"
            />
            <button onClick={handleAddBrand}>Add</button>
          </div>
          <ul>
            {state.brands.map((brand, i) => {
              const letter = brand[0].toUpperCase();
              return (
                <li key={i} className={styles.brandItem}>
                  <div
                    className={styles.icon}
                    style={{ backgroundColor: getColorFromLetter(letter) }}
                  >
                    {letter}
                  </div>
                  {brand}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {state.step === 3 && (
        <div className={styles.card}>
          <h2>SKU Definition</h2>
          <div className={styles.inputRow}>
            <input
              value={state.newSKU.volume}
              onChange={(e) =>
                dispatch({ type: 'SET_NEW_SKU', payload: { volume: e.target.value } })
              }
              placeholder="Volume (1L, 5L)"
            />
            <input
              type="number"
              value={state.newSKU.threshold}
              onChange={(e) =>
                dispatch({ type: 'SET_NEW_SKU', payload: { threshold: e.target.value } })
              }
              placeholder="Restock Threshold"
            />
            <button onClick={handleAddSKU}>Add</button>
          </div>
          <ul>
            {state.skus.map((sku, i) => (
              <li key={i}>
                {sku.volume} — Threshold: {sku.threshold}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}