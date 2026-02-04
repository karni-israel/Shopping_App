import { useEffect, useState } from 'react'; 
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
// 👇 1. הייבוא של הטוסט
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

  const removeItem = async (itemId: number) => {
    try {
      // עדכון אופטימי של הממשק (מוחק מיד מהעיניים לפני השרת)
      setCart(prev => {
        if (!prev) return null;
        const item = prev.items.find(i => i.id === itemId);
        if (!item) return prev;
        return { 
          ...prev,
          items: prev.items.filter(i => i.id !== itemId),
          total: prev.total - (item.product.price * item.quantity)
        }; 
      }); 
      
      await api.delete(`/cart/${itemId}`); 
      // 👇 הודעת הצלחה
      toast.success('המוצר הוסר מהעגלה 🗑️');
    } catch (error) {
      toast.error('שגיאה במחיקת פריט'); 
      fetchCart(); // אם הייתה שגיאה, נחזיר את המצב לקדמותו
    } 
  }; 

  const clearCart = async () => { 
    if (window.confirm('האם אתה בטוח שברצונך לרוקן את העגלה?')) { 
      try { 
        await api.delete('/cart');   
        setCart(null); // ריקון מהיר של הסטייט
        toast.success('העגלה רוקנה בהצלחה!');
      } catch (error) { 
        toast.error('שגיאה בריקון העגלה'); 
      } 
    } 
  }; 

  const checkout = async () => { 
    try { 
      await api.post('/order'); 
      
      // 👇 הודעה ארוכה - נתתי לה 6 שניות (duration: 6000) כדי שיספיקו לקרוא
      toast.success(
        `ההזמנה בוצעה בהצלחה! 🎉\nהמשלוח יישלח לכתובת: רשי 18 דירה 9, אלעד.\nזמן אספקה: עד 10 ימים.`,
        { duration: 6000, style: { textAlign: 'center' } }
      );
      
      // מעבר לדף הזמנות או דף הבית
      navigate('/orders'); // עדיף לנווט להזמנות, אבל אפשר גם '/'
    } catch (error: any) { 
      toast.error('שגיאה בביצוע הזמנה: ' + (error.response?.data?.message || 'Unknown error')); 
    }
  }; 

  if (loading) return <p className="text-center mt-5">טוען עגלה...</p>;
  
  if (!cart || cart.items.length === 0) return (
    <div className="text-center mt-5"> 
      <h2>העגלה שלך ריקה 🛒</h2> 
      <button onClick={() => navigate('/')} className="btn btn-primary mt-3">חזור לחנות</button> 
    </div> 
  ); 

  return ( 
    // הוספתי direction: rtl כדי שהעברית תשב טוב
    <div className="container py-4" style={{ maxWidth: '800px', direction: 'rtl' }}> 
      <h1 className="mb-4">העגלה שלי 🛍️</h1> 
      
      <div className="list-group mb-4 shadow-sm"> 
        {cart.items.map((item) => ( 
          <div key={item.id} className="list-group-item d-flex align-items-center p-3"> 
            {/* תמונה עם בדיקה שיש כתובת תקינה */}
            <img 
              src={item.product.imageUrl || 'https://via.placeholder.com/80'} 
              alt={item.product.name} 
              className="rounded border" 
              style={{ width: '80px', height: '80px', objectFit: 'cover' }} 
            /> 
            
            <div className="flex-grow-1 ms-3 me-3 px-3"> 
              <h5 className="mb-1 fw-bold">{item.product.name}</h5>
              <p className="mb-0 text-muted">כמות: {item.quantity} | מחיר יחידה: ₪{item.product.price}</p>
            </div>
            
            <div className="fw-bold fs-5 ms-3 text-primary"> 
              ₪{(item.product.price * item.quantity).toFixed(2)} 
            </div> 
            
            <button  
              onClick={() => removeItem(item.id)} 
              className="btn btn-outline-danger btn-sm ms-3 rounded-circle"
              style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="הסר פריט"
            > 
              ✕
            </button> 
          </div> 
        ))} 
      </div> 
 
      <div className="card border-0 shadow-sm bg-light">
        <div className="card-body d-flex justify-content-between align-items-center"> 
            <h4 className="mb-0">סה"כ לתשלום: <span className="text-success fw-bold">₪{cart.total.toFixed(2)}</span></h4> 
            <div className="d-flex gap-2"> 
            <button onClick={clearCart} className="btn btn-outline-danger">רוקן עגלה</button>
            <button onClick={checkout} className="btn btn-success px-4 fw-bold">לתשלום (Checkout) 💳</button> 
            </div> 
        </div> 
      </div>
    </div> 
  ); 
};