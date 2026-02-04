import React, { useState, useEffect } from 'react'; // הוספתי את React כדי למנוע שגיאות אדומות
import api from '../services/api';
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

interface Props {
  onProductAdded: () => void;
  onCancel: () => void;
  initialProduct?: Product | null; // זה הפרמטר שמאפשר עריכה
}

export const AddProductForm = ({ onProductAdded, onCancel, initialProduct }: Props) => {
  // הגדרת מצב התחלתי ריק
  const emptyForm = {
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '1',
    imageUrl: ''
  };

  const [formData, setFormData] = useState(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // האם אנחנו במצב עריכה? (אם יש מוצר התחלתי)
  const isEditMode = !!initialProduct;

  // 👇 ניהול מילוי הטופס
  useEffect(() => {
    if (initialProduct) {
      // אם התקבל מוצר לעריכה - נמלא את השדות
      setFormData({
        name: initialProduct.name,
        description: initialProduct.description || '',
        price: initialProduct.price.toString(),
        stock: initialProduct.stock.toString(),
        categoryId: initialProduct.categoryId.toString(),
        imageUrl: initialProduct.imageUrl || ''
      });
    } else {
      // אם אין מוצר (מצב הוספה) - ננקה את הטופס
      setFormData(emptyForm);
      setFile(null);
    }
  }, [initialProduct]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const dataToSend = new FormData();
    dataToSend.append('name', formData.name);
    dataToSend.append('description', formData.description);
    dataToSend.append('price', formData.price);
    dataToSend.append('stock', formData.stock);
    dataToSend.append('categoryId', formData.categoryId);

    if (file) {
      dataToSend.append('image', file);
    } else if (formData.imageUrl) {
      dataToSend.append('imageUrl', formData.imageUrl);
    }

    try {
      if (isEditMode && initialProduct) {
        // ✏️ עריכה: שליחת PATCH
        await api.patch(`/product/${initialProduct.id}`, dataToSend);
        toast.success('המוצר עודכן בהצלחה! ✨');
      } else {
        // ➕ הוספה: שליחת POST
        await api.post('/product', dataToSend);
        toast.success('המוצר נוסף בהצלחה! 🎉');
      }
      
      // השהייה קצרה ורענון
      setTimeout(() => {
          onProductAdded(); 
      }, 500);

    } catch (error) {
      console.error(error);
      toast.error(isEditMode ? 'שגיאה בעדכון המוצר' : 'שגיאה בהוספת המוצר');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`card p-4 mb-4 shadow-sm border-0 ${isEditMode ? 'bg-warning bg-opacity-10' : 'bg-light'}`}>
      <h4 className="mb-3">
        {isEditMode ? `✏️ עריכת מוצר: ${initialProduct?.name}` : '📝 הוספת מוצר חדש'}
      </h4>
      
      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">שם המוצר</label>
            <input 
              type="text" 
              className="form-control" 
              required 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">קטגוריה</label>
            <select 
              className="form-select" 
              value={formData.categoryId}
              onChange={e => setFormData({...formData, categoryId: e.target.value})}
            >
              <option value="1">📱 אלקטרוניקה</option>
              <option value="2">👕 ביגוד</option>
              <option value="3">🏠 לבית ולגן</option>
              <option value="4">🎮 משחקים</option>
              <option value="5">📚 ספרים</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">מחיר (₪)</label>
            <input 
              type="number" 
              className="form-control" 
              required 
              min="0" 
              step="0.1"
              value={formData.price}
              onChange={e => setFormData({...formData, price: e.target.value})}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">כמות במלאי</label>
            <input 
              type="number" 
              className="form-control" 
              required 
              min="0"
              value={formData.stock}
              onChange={e => setFormData({...formData, stock: e.target.value})}
            />
          </div>
          
          {/* הצגת תמונה נוכחית במצב עריכה */}
          {isEditMode && formData.imageUrl && !file && (
             <div className="col-12 text-center my-2">
                <p className="small text-muted mb-1">תמונה נוכחית:</p>
                <img src={formData.imageUrl} alt="current" style={{ height: '80px', borderRadius: '8px' }} />
             </div>
          )}

          <div className="col-12">
            <label className="form-label fw-bold">
              {isEditMode ? 'החלף תמונה (אופציונלי):' : 'בחר תמונה:'}
            </label>
            <input 
              type="file" 
              className="form-control" 
              accept="image/*" 
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
            />
          </div>
          
          <div className="col-12">
             <label className="text-muted small">או לינק חיצוני:</label>
             <input 
               type="text" 
               className="form-control form-control-sm" 
               placeholder="https://..."
               value={formData.imageUrl}
               disabled={!!file}
               onChange={e => setFormData({...formData, imageUrl: e.target.value})}
             />
          </div>

          <div className="col-12">
            <label className="form-label">תיאור</label>
            <textarea 
              className="form-control" 
              rows={2}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            ></textarea>
          </div>
          
          <div className="col-12 d-flex gap-2 justify-content-end mt-2">
            <button type="button" onClick={onCancel} className="btn btn-secondary">ביטול</button>
            <button type="submit" className={`btn ${isEditMode ? 'btn-warning' : 'btn-success'} fw-bold`} disabled={loading}>
              {loading ? 'שומר...' : (isEditMode ? '💾 עדכן שינויים' : '➕ שמור מוצר')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};