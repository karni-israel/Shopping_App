import { useEffect, useState } from 'react'; 
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface CartItem {
  id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
    imageUrl: string;
  };
}

interface Cart {
  id: number;
  items: CartItem[];
  total: number;
}

export const CartPage = () => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  
  // מערך ששומר את ה-ID של פריטים שמתעדכנים כרגע כדי למנוע לחיצות כפולות
  const [updatingIds, setUpdatingIds] = useState<number[]>([]); 
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const { data } = await api.get('/cart');
      setCart(data);
    } catch (error) {
      console.error('Failed to fetch cart', error);
      toast.error('שגיאה בטעינת העגלה');
    } finally {
      setLoading(false);
    }
  };

  // === הלוגיקה החכמה של עדכון כמות ===
  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return; // לא יורדים מתחת ל-1 (בשביל זה יש כפתור מחיקה)

    // סימון הפריט כ"מתעדכן" (מנטרל את הכפתורים זמנית)
    setUpdatingIds(prev => [...prev, itemId]);

    try {
      // 1. Optimistic UI: עדכון התצוגה מיד לפני שהשרת ענה (לתחושת מהירות)
      setCart(prev => {
        if (!prev) return null;
        
        const updatedItems = prev.items.map(item => 
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        );
        
        // חישוב מחדש של הסכום הכולל בצד לקוח
        const newTotal = updatedItems.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0);
        
        return { ...prev, items: updatedItems, total: newTotal };
      });

      // 2. שליחת הבקשה לשרת ברקע
      await api.patch(`/cart-item/${itemId}`, { quantity: newQuantity });
      
    } catch (error) {
      console.error("Failed to update quantity", error);
      toast.error('שגיאה בעדכון כמות');
      // במקרה של שגיאה בשרת - נחזיר את המצב לקדמותו ע"י משיכה מחדש
      fetchCart();
    } finally {
      // שחרור הכפתורים
      setUpdatingIds(prev => prev.filter(id => id !== itemId));
    }
  };

  const removeItem = async (itemId: number) => {
    // עדכון אופטימי למחיקה - מעלים את הפריט מיד
    const originalCart = cart; // שומרים גיבוי למקרה של שגיאה
    
    setCart(prev => {
      if (!prev) return null;
      const itemToRemove = prev.items.find(i => i.id === itemId);
      if (!itemToRemove) return prev;
      
      return { 
        ...prev, 
        items: prev.items.filter(i => i.id !== itemId),
        total: prev.total - (Number(itemToRemove.product.price) * itemToRemove.quantity)
      }; 
    }); 

    try {
      await api.delete(`/cart/${itemId}`); 
      toast.success('המוצר הוסר מהעגלה 🗑️');
    } catch (error) {
      toast.error('שגיאה במחיקת פריט'); 
      setCart(originalCart); // שחזור במקרה שגיאה
    } 
  }; 

  const clearCart = async () => { 
    if (window.confirm('האם אתה בטוח שברצונך לרוקן את העגלה?')) { 
      try { 
        setCart(prev => prev ? { ...prev, items: [], total: 0 } : null); // ריקון ויזואלי מיד
        await api.delete('/cart');    
        toast.success('העגלה רוקנה בהצלחה!');
      } catch (error) { 
        toast.error('שגיאה בריקון העגלה'); 
        fetchCart(); // שחזור
      } 
    } 
  }; 

  const checkout = async () => { 
    try { 
      await api.post('/order'); 
      toast.success(
        `ההזמנה בוצעה בהצלחה! 🎉\nהמשלוח יישלח לכתובת: רשי 18 דירה 9, אלעד.\nזמן אספקה: עד 10 ימים.`,
        { duration: 6000, style: { textAlign: 'center' } }
      );
      navigate('/orders');
    } catch (error: any) { 
      toast.error('שגיאה בביצוע הזמנה: ' + (error.response?.data?.message || 'Unknown error')); 
    }
  }; 

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">טוען...</span>
      </div>
    </div>
  );

  if (!cart || cart.items.length === 0) return ( 
    <div className="text-center mt-5 p-5 bg-light rounded shadow-sm container" style={{maxWidth: '600px'}}> 
      <h2 className="mb-4">העגלה שלך ריקה 🛒</h2> 
      <p className="text-muted mb-4">נראה שעדיין לא בחרת מוצרים. זה הזמן להתחיל!</p>
      <button onClick={() => navigate('/')} className="btn btn-primary btn-lg">חזור לחנות</button> 
    </div> 
  ); 

  return ( 
    <div className="container py-5" style={{ maxWidth: '900px', direction: 'rtl' }}> 
      <h1 className="mb-4 fw-bold">העגלה שלי 🛍️ <span className="fs-5 text-muted">({cart.items.length} פריטים)</span></h1> 
       
      <div className="card shadow-sm border-0 mb-4">
        <div className="list-group list-group-flush"> 
          {cart.items.map((item) => ( 
            <div key={item.id} className="list-group-item p-3 d-flex align-items-center flex-wrap flex-md-nowrap gap-3"> 
              
              {/* תמונת מוצר */}
              <div style={{ width: '100px', height: '100px', flexShrink: 0 }}>
                <img 
                  src={item.product.imageUrl || 'https://via.placeholder.com/100'} 
                  alt={item.product.name} 
                  className="w-100 h-100 rounded object-fit-cover border" 
                /> 
              </div>
              
              {/* פרטי מוצר */}
              <div className="flex-grow-1"> 
                <h5 className="mb-1 fw-bold">{item.product.name}</h5> 
                <p className="mb-0 text-muted small">מחיר יחידה: ₪{Number(item.product.price).toFixed(2)}</p>
              </div>

              {/* === קונטרולר כמות מעוצב === */}
              <div className="d-flex align-items-center border rounded-pill px-2 py-1 user-select-none bg-white" style={{ width: '130px', justifyContent: 'space-between' }}>
                <button 
                  className="btn btn-link text-dark text-decoration-none p-0 fw-bold fs-5" 
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1 || updatingIds.includes(item.id)}
                  style={{ width: '30px', opacity: item.quantity <= 1 ? 0.3 : 1 }}
                >
                  −
                </button>
                
                {updatingIds.includes(item.id) ? (
                  <div className="spinner-border spinner-border-sm text-secondary" role="status"></div>
                ) : (
                  <span className="fw-bold fs-5">{item.quantity}</span>
                )}
                
                <button 
                  className="btn btn-link text-dark text-decoration-none p-0 fw-bold fs-5" 
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  disabled={updatingIds.includes(item.id)}
                  style={{ width: '30px' }}
                >
                  +
                </button>
              </div>

              {/* מחיר סופי לפריט */}
              <div className="text-end" style={{ minWidth: '100px' }}> 
                <div className="fw-bold fs-5 text-primary">₪{(Number(item.product.price) * item.quantity).toFixed(2)}</div> 
              </div> 
              
              {/* כפתור מחיקה */}
              <button  
                onClick={() => removeItem(item.id)} 
                className="btn btn-light text-danger border-0 rounded-circle p-2 shadow-sm"
                title="הסר פריט"
              > 
                ✕
              </button> 
            </div> 
          ))} 
        </div> 
      </div>
 
      {/* סיכום הזמנה */}
      <div className="card shadow border-0 bg-white">
        <div className="card-body p-4 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3"> 
          <div>
            <p className="text-muted mb-1">סה"כ לתשלום:</p>
            <span className="display-6 fw-bold text-success">₪{Number(cart.total).toFixed(2)}</span>
          </div>
          <div className="d-flex gap-2 w-100 w-md-auto"> 
            <button onClick={clearCart} className="btn btn-outline-danger px-4">רוקן עגלה</button>
            <button onClick={checkout} className="btn btn-success btn-lg px-5 flex-grow-1 flex-md-grow-0">לתשלום 💳</button> 
          </div> 
        </div>
      </div> 
    </div> 
  ); 
};