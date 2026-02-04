import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CategoryFilter } from '../components/CategoryFilter';
import { AddProductForm } from '../components/AddProductForm';
// 👇 1. הוספתי את הספרייה כאן
import toast from 'react-hot-toast';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  categoryId?: number;
}

export const HomePage = () => {
  const { user } = useAuth();
  
  const isAdmin = user?.role === 'ADMIN';

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedCategory === null) {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => p.categoryId === selectedCategory));
    }
  }, [selectedCategory, products]);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/product');
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products from DB', error);
      toast.error('שגיאה בטעינת המוצרים');
    } finally {
      setLoading(false);
    }
  };

  // 👇 2. שיניתי כאן: הפונקציה מקבלת את כל המוצר, לא רק ID
  const addToCart = async (product: Product) => {
    if (!user) {
      toast.error('נא להתחבר כדי להוסיף לעגלה');
      return;
    }
    try {
      // אנחנו שולחים לשרת רק את ה-ID
      await api.post('/cart/add', { productId: product.id, quantity: 1 });
      
      // 👇 אבל בהודעה אנחנו משתמשים בשם של המוצר!
      toast.success(`${product.name} נוסף לעגלה! 🛒`);
    } catch (error) {
      toast.error('שגיאה בהוספה לעגלה');
    }
  };

  const deleteProduct = async (productId: number) => {
    if (!isAdmin) return;

    try {
      await api.delete(`/product/${productId}`);
      setProducts(products.filter(p => p.id !== productId));
      toast.success('המוצר נמחק בהצלחה!');
    } catch (error: any) {
      toast.error('שגיאה במחיקה (אולי המוצר מקושר להזמנה?)');
    }
  };

  const deleteAllProducts = async () => {
    if (!isAdmin) return;

    if (window.confirm('האם אתה בטוח שברצונך למחוק את כל המוצרים מה-DB?')) {
      try {
        setLoading(true);
        await api.delete('/product/all/delete');
        setProducts([]); 
        toast.success('כל המוצרים נמחקו מה-DB.');
      } catch (error) {
        console.error(error);
        toast.error('שגיאה במחיקת המוצרים');
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) return <p className="text-center mt-5">טוען נתונים...</p>;

  return (
    <div className="container-fluid" style={{ padding: '20px', direction: 'rtl' }}>
      <div className="row">
        
        {/* כרטיס קבלת פנים */}
        <div className="col-12 mb-4">
           <div className="card border-0 shadow-sm" style={{ backgroundColor: '#f8f9fa' }}>
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <h2>שלום, {user?.username || 'אורח'} 👋</h2>
                <p className="text-muted mb-0">ברוכים הבאים לחנות שלנו</p>
              </div>
              
              {isAdmin && (
                <button 
                  onClick={() => setShowAddForm(!showAddForm)} 
                  className={`btn ${showAddForm ? 'btn-secondary' : 'btn-success'} fw-bold`}
                >
                  {showAddForm ? 'סגור טופס' : '➕ הוסף מוצר חדש (Admin)'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* טופס הוספה */}
        {isAdmin && showAddForm && (
          <div className="col-12 mb-4">
            <AddProductForm 
              onProductAdded={() => {
                fetchProducts(); 
                setShowAddForm(false);
              }}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        )}

        {/* סרגל צד */}
        <div className="col-12 col-md-3 mb-4">
          <CategoryFilter onSelectCategory={setSelectedCategory} />
          
          {isAdmin && (
            <div className="d-grid gap-2 mt-4">
              <button onClick={deleteAllProducts} className="btn btn-outline-danger">
                🗑️ מחק את כל המוצרים (Admin)
              </button>
            </div>
          )}
        </div>

        {/* רשימת המוצרים */}
        <div className="col-12 col-md-9">
          {filteredProducts.length === 0 ? (
            <div className="alert alert-info text-center py-5 shadow-sm border-0">
              <h5>אין מוצרים בקטגוריה זו</h5>
            </div>
          ) : (
            <div className="row g-3">
              {filteredProducts.map((product) => (
                <div key={product.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                  <div className="card h-100 shadow-sm border-0 hover-shadow transition">
                    <div className="position-relative overflow-hidden" style={{ height: '200px', padding: '10px' }}>
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="w-100 h-100" style={{ objectFit: 'contain' }} />
                      ) : (
                        <div className="bg-light d-flex align-items-center justify-content-center h-100 text-muted">אין תמונה</div>
                      )}
                      
                      {isAdmin && (
                        <button 
                          onClick={() => deleteProduct(product.id)} 
                          className="btn btn-danger position-absolute" 
                          style={{ top: '10px', right: '10px', width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.8 }}
                          title="מחק מוצר"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                    
                    <div className="card-body d-flex flex-column text-center">
                      <h5 className="card-title text-truncate" title={product.name}>{product.name}</h5>
                      <p className="card-text text-muted small flex-grow-1" style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {product.description}
                      </p>
                      <h5 className="card-text fw-bold text-primary mb-3">₪{Number(product.price).toFixed(2)}</h5>
                      
                      <div className="mb-2">
                        <small className={product.stock > 0 ? 'text-success fw-bold' : 'text-danger fw-bold'}>
                          {product.stock > 0 ? `✓ במלאי: ${product.stock}` : '✗ אזל מהמלאי'}
                        </small>
                      </div>

                      <button 
                        // 👇 3. עדכנתי את הקריאה לפונקציה (שולח את כל האובייקט)
                        onClick={() => addToCart(product)} 
                        disabled={product.stock === 0} 
                        className={`btn w-100 ${product.stock > 0 ? 'btn-outline-primary' : 'btn-secondary disabled'}`}
                      >
                        {product.stock > 0 ? '🛒 הוסף לסל' : 'אזל'}
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