import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { AddProductForm } from '../components/AddProductForm';
import toast from 'react-hot-toast';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  categoryId: number;
}

export const AdminPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    totalValue: 0,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const results = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(results);
  }, [searchTerm, products]);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/product');
      setProducts(data);
      calculateStats(data);
    } catch (error) {
      console.error(error);
      toast.error('שגיאה בטעינת המוצרים');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: Product[]) => {
    const lowStockCount = data.filter(p => p.stock < 5).length;
    const totalVal = data.reduce((acc, curr) => acc + Number(curr.price) * curr.stock, 0);
    setStats({ totalProducts: data.length, lowStock: lowStockCount, totalValue: totalVal });
  };

  const handleDelete = async (id: number) => {
    
    const isSure = window.confirm(
        "⚠️ אזהרה: האם אתה בטוח שברצונך למחוק את המוצר לצמיתות?\n\n(לחץ 'אישור' למחיקה או 'ביטול' כדי להתחרט)"
    );

   
    if (!isSure) return;

    
    try {
      await api.delete(`/product/${id}`);
      
      const updated = products.filter(p => p.id !== id);
      setProducts(updated);
      calculateStats(updated);
      
      toast.success('המוצר נמחק בהצלחה');
    } catch (error) {
      toast.error('שגיאה במחיקת המוצר');
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('😱 האם אתה בטוח שברצונך למחוק את **כל** המוצרים מהחנות? פעולה זו אינה הפיכה!')) return;
    
    try {
        setLoading(true);
        await api.delete('/product/all/delete');
        setProducts([]);
        setFilteredProducts([]);
        setStats({ totalProducts: 0, lowStock: 0, totalValue: 0 });
        toast.success('כל המוצרים נמחקו');
    } catch (e) {
        toast.error('שגיאה במחיקה כללית');
    } finally {
        setLoading(false);
    }
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return <div className="text-center mt-5">טוען...</div>;

  return (
    <div className="container-fluid bg-light min-vh-100 p-4" style={{ direction: 'rtl' }}>
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
            <h2>🎛️ ניהול חנות</h2>
            <p className="text-muted">ניהול מוצרים ומלאי</p>
        </div>
        
        <div className="d-flex gap-2">
            {products.length > 0 && (
                <button className="btn btn-outline-danger" onClick={handleDeleteAll}>🗑️ מחק הכל</button>
            )}
            <button 
            className={`btn ${showAddForm ? 'btn-secondary' : 'btn-success'} shadow-sm`}
            onClick={() => { 
                setShowAddForm(!showAddForm); 
                setEditingProduct(null); 
            }}
            >
            {showAddForm ? 'סגור טופס' : '➕ הוסף מוצר'}
            </button>
        </div>
      </div>

      <div className="row mb-4 g-3">
        <div className="col-md-4"><div className="card p-3 shadow-sm border-primary border-end-0 border-top-0 border-bottom-0 border-4"><h5>סה"כ מוצרים: {stats.totalProducts}</h5></div></div>
        <div className="col-md-4"><div className="card p-3 shadow-sm border-danger border-end-0 border-top-0 border-bottom-0 border-4"><h5>מלאי נמוך: {stats.lowStock}</h5></div></div>
        <div className="col-md-4"><div className="card p-3 shadow-sm border-success border-end-0 border-top-0 border-bottom-0 border-4"><h5>שווי מלאי: ₪{stats.totalValue.toLocaleString()}</h5></div></div>
      </div>

      {showAddForm && (
        <div className="card mb-4 shadow border-0">
          <div className="card-header bg-white fw-bold">
            {editingProduct ? `✏️ עריכת: ${editingProduct.name}` : 'הוספת מוצר חדש'}
          </div>
          <div className="card-body">
            <AddProductForm 
              initialProduct={editingProduct} 
              onProductAdded={() => { 
                  fetchProducts(); 
                  setShowAddForm(false); 
                  setEditingProduct(null); 
              }} 
              onCancel={() => { 
                  setShowAddForm(false); 
                  setEditingProduct(null); 
              }}
            />
          </div>
        </div>
      )}

      <div className="card shadow-sm border-0">
        <div className="card-header bg-white">
            <input type="text" className="form-control w-25" placeholder="🔍 חיפוש..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>תמונה</th><th>שם</th><th>מחיר</th><th>מלאי</th><th>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(p => (
                <tr key={p.id} className={editingProduct?.id === p.id ? 'table-warning' : ''}>
                  <td><img src={p.imageUrl || 'https://via.placeholder.com/40'} style={{width:'40px', height:'40px', objectFit:'cover', borderRadius:'4px'}} alt="" /></td>
                  <td className="fw-bold">{p.name}</td>
                  <td>₪{p.price}</td>
                  <td><span className={`badge ${p.stock > 0 ? 'bg-success' : 'bg-danger'}`}>{p.stock}</span></td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEditClick(p)}>✏️</button>
                    {/* 👇 הכפתור הזה יפעיל עכשיו את הודעת האזהרה */}
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(p.id)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};