import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CategoryFilter } from '../components/CategoryFilter';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
}

export const HomePage = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedCategory === null) {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products);
    }
  }, [selectedCategory, products]);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/product');
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: number) => {
    try {
      await api.post('/cart/add', { productId, quantity: 1 });
      alert('המוצר נוסף לעגלה! 🛒');
    } catch (error) {
      alert('שגיאה בהוספה לעגלה');
    }
  };

  const deleteProduct = async (productId: number) => {
    try {
      await api.delete(`/product/${productId}`);
      setProducts(products.filter(p => p.id !== productId));
      alert('המוצר נמחק בהצלחה!');
    } catch (error) {
      alert('לא ניתן למחוק את המוצר');
    }
  };

  const deleteAllProducts = async () => {
    if (window.confirm('האם למחוק את כל המוצרים?')) {
      try {
        setLoading(true);
        await Promise.all(products.map(p => api.delete(`/product/${p.id}`)));
        setProducts([]);
      } catch (error) {
        alert('שגיאה במחיקה');
      } finally {
        setLoading(false);
      }
    }
  };

  const addDemoProducts = async () => {
    const demoProducts = [
      {
        name: "iPhone 15 Pro",
        description: "האייפון החדש עם מסגרת טיטניום",
        price: 1500,
        imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=500&q=60",
        stock: 10
      },
      {
        name: "MacBook Pro",
        description: "מחשב נייד חזק",
        price: 8999,
        imageUrl: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=500&q=60",
        stock: 5
      },
      {
        name: "Sony WH-1000XM5",
        description: "אוזניות בלוטוס",
        price: 1490,
        imageUrl: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=500&q=60",
        stock: 20
      },
    ];

    try {
      setLoading(true);
      await Promise.all(demoProducts.map(product => api.post('/product', product)));
      await fetchProducts();
      alert('מוצרים נוספו!');
    } catch (error) {
      alert('שגיאה בהוספה');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="text-center mt-5">טוען...</p>;

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <div className="row">
        <div className="col-12 col-md-3 col-lg-2 mb-4">
          <CategoryFilter onSelectCategory={setSelectedCategory} />
          <div className="d-grid gap-2">
            <button onClick={addDemoProducts} className="btn btn-info">
              ➕ מוצרי דוגמה
            </button>
            <button onClick={deleteAllProducts} className="btn btn-danger">
              🗑️ מחק הכל
            </button>
          </div>
        </div>

        <div className="col-12 col-md-9 col-lg-10">
          <div className="card mb-4">
            <div className="card-body">
              <h2>שלום, {user?.username || 'אורח'} 👋</h2>
              <p className="text-muted">בחר מוצר והוסף לעגלה</p>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="alert alert-info text-center py-5">
              <h5>אין מוצרים</h5>
            </div>
          ) : (
            <div className="row g-3">
              {filteredProducts.map((product) => (
                <div key={product.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                  <div className="card h-100 shadow-sm">
                    <div className="position-relative overflow-hidden" style={{ height: '200px' }}>
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="w-100 h-100" style={{ objectFit: 'cover' }} />
                      ) : (
                        <div className="bg-light d-flex align-items-center justify-content-center h-100">אין תמונה</div>
                      )}
                      <button onClick={() => deleteProduct(product.id)} className="btn btn-sm btn-danger position-absolute" style={{ top: '10px', right: '10px' }}>
                        🗑️
                      </button>
                    </div>
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title">{product.name}</h5>
                      <p className="card-text text-muted small flex-grow-1">{product.description}</p>
                      <p className="card-text fw-bold text-primary fs-5">₪{Number(product.price).toFixed(2)}</p>
                      <div className="mb-3">
                        <small className={product.stock > 0 ? 'text-success fw-bold' : 'text-danger fw-bold'}>
                          {product.stock > 0 ? `✓ ${product.stock}` : '✗ אזל'}
                        </small>
                      </div>
                      <button onClick={() => addToCart(product.id)} disabled={product.stock === 0} className={`btn w-100 ${product.stock > 0 ? 'btn-primary' : 'btn-secondary disabled'}`}>
                        🛒 הוסף
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
