import { useEffect, useState } from 'react'; 
import api from '../services/api'; // נניח שיש לך שירות API מוגדר
import { useNavigate } from 'react-router-dom'; // נווט בין דפים

interface CartItem { // סוג לפריט בעגלה
  id: number; // מזהה הפריט בעגלה
  quantity: number; // כמות הפריט
  product: { // מידע על המוצר
    id: number; // מזהה המוצר
    name: string; // שם המוצר
    price: number; // מחיר המוצר
    imageUrl: string; // כתובת תמונת המוצר
  }; // סוף מידע על המוצר
} // סוף סוג לפריט בעגלה

interface Cart { // סוג לעגלה
  id: number; // מזהה העגלה 
  items: CartItem[]; // רשימת הפריטים בעגלה
  total: number; // הסכום הכולל של העגלה
}

export const CartPage = () => { // רכיב דף העגלה
  const [cart, setCart] = useState<Cart | null>(null); // מצב לעגלה
  const [loading, setLoading] = useState(true); // מצב טעינה
  const navigate = useNavigate(); // הוק לניווט בין דפים

  useEffect(() => { // השפעה לטעינת העגלה בעת טעינת הרכיב
    fetchCart(); // קריאה לפונקציה לטעינת העגלה
  }, []); // ריצה פעם אחת בעת טעינת הרכיב

  const fetchCart = async () => { // פונקציה לטעינת העגלה
    try { // ניסיון לשלוף את העגלה מהשרת
      const { data } = await api.get('/cart'); // קריאה ל-API לקבלת העגלה
      setCart(data); // עדכון מצב העגלה עם הנתונים שהתקבלו
    } catch (error) { // טיפול בשגיאה במקרה של כישלון
      console.error('Failed to fetch cart', error); // הדפסת השגיאה לקונסול
    } finally { // סיום הטעינה
      setLoading(false); // עדכון מצב הטעינה לסיום
    } // סיום טיפול
  }; // סיום פונקציה לטעינת העגלה

  const removeItem = async (itemId: number) => { // פונקציה להסרת פריט מהעגלה
    try { // ניסיון להסיר פריט מהעגלה
      // עדכון אופטימי: הסרה מהתצוגה מיד
      setCart(prev => { // עדכון מצב העגלה
        if (!prev) return null; // אם העגלה ריקה, לא לעשות כלום
        const item = prev.items.find(i => i.id === itemId); // מציאת הפריט להסרה
        if (!item) return prev; // אם הפריט לא נמצא, לא לעשות כלום
        return { // עדכון העגלה לאחר הסרת הפריט
          ...prev, // שמירת שאר המידע בעגלה
          items: prev.items.filter(i => i.id !== itemId), // הסרת הפריט מהרשימה
          total: prev.total - (item.product.price * item.quantity) // עדכון הסכום הכולל
        }; // סיום עדכון העגלה
      }); // סיום עדכון מצב העגלה
      await api.delete(`/cart/${itemId}`); // קריאה ל-API להסרת הפריט מהעגלה בשרת
    } catch (error) { // טיפול בשגיאה במקרה של כישלון
      alert('שגיאה במחיקת פריט'); // הצגת הודעת שגיאה למשתמש
      fetchCart(); // במקרה של שגיאה נחזיר את המצב לקדמותו
    } // סיום טיפול
  }; // סיום פונקציה להסרת פריט מהעגלה

  const clearCart = async () => { // פונקציה לריקון העגלה
    if (window.confirm('האם אתה בטוח שברצונך לרוקן את העגלה?')) { // אישור מהריקון
      try { // ניסיון לרוקן את העגלה
        await api.delete('/cart');    // קריאה ל-API לריקון העגלה בשרת
        fetchCart(); // טעינת העגלה מחדש לאחר הריקון
      } catch (error) { // טיפול בשגיאה במקרה של כישלון
        alert('שגיאה בריקון העגלה'); // הצגת הודעת שגיאה למשתמש
      } // סיום טיפול
    } // סיום אישור מהריקון
  }; // סיום פונקציה לריקון העגלה

  const checkout = async () => { // פונקציה לביצוע תשלום
    try { // ניסיון לבצע את התשלום
      await api.post('/order'); // קריאה ל-API ליצירת הזמנה
      alert('ההזמנה בוצעה בהצלחה!\nההזמנה תישלח לכתובת רשי 18 דירה 9 עיר אלעד.\nעד 10 ימים יגיע המשלוח, נעדכן.\nתודה שקנית אצלנו 🎉');
      navigate('/'); // חזרה לדף הבית
    } catch (error: any) { // טיפול בשגיאה במקרה של כישלון
      alert('שגיאה בביצוע הזמנה: ' + (error.response?.data?.message || 'Unknown error')); // הצגת הודעת שגיאה למשתמש
    } // סיום טיפול
  }; // סיום פונקציה לביצוע תשלום

  if (loading) return <p>טוען עגלה...</p>; // הצגת הודעת טעינה בזמן הטעינה
  if (!cart || cart.items.length === 0) return ( // אם העגלה ריקה, הצגת הודעת ריקה
    <div style={{ textAlign: 'center', marginTop: '50px' }}> // מרכז את התוכן בעמוד
      <h2>העגלה שלך ריקה 🛒</h2> // הודעת ריקה
      <button onClick={() => navigate('/')} style={{ marginTop: '20px' }}>חזור לחנות</button> // כפתור לחזרה לחנות
    </div> // סיום מרכז
  ); // סיום בדיקת עגלה ריקה

  return ( // הצגת העגלה
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}> // מרכז את התוכן ומוסיף ריפוד
      <h1>העגלה שלי</h1> // כותרת הדף
      
      <div style={{ marginTop: '20px' }}> // קונטיינר לפריטי העגלה
        {cart.items.map((item) => ( // לולאה על כל הפריטים
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #eee', padding: '15px 0' }}> // פריט בעגלה
            <img src={item.product.imageUrl} alt={item.product.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} /> // תמונת המוצר
            <div style={{ flex: 1, marginRight: '20px' }}> // קונטיינר למידע המוצר
              <h3>{item.product.name}</h3> // שם המוצר
              <p>כמות: {item.quantity} | מחיר יחידה: ₪{item.product.price}</p> // כמות ומחיר יחידה
            </div> // סיום קונטיינר למידע המוצר
            <div style={{ fontWeight: 'bold', fontSize: '1.2em', marginLeft: '20px' }}> // מחיר כולל לפריט  
              ₪{item.product.price * item.quantity} // חישוב מחיר כולל לפריט
            </div> // סיום מחיר כולל לפריט
            <button  
              onClick={() => removeItem(item.id)} // פונקציה להסרת פריט מהעגלה
              style={{ background: '#ff4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }} // סגנון הכפתור
            > // כפתור להסרת
              הסר
            </button> // סיום כפתור להסרת
          </div> // סיום פריט בעגלה
        ))} // סיום לולאה על כל הפריטים
      </div> // סיום קונטיינר לפריטי העגלה
 
      <div style={{ marginTop: '30px', borderTop: '2px solid #333', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}> // קונטיינר לסיכום ותשלום
        <h2>סה"כ לתשלום: ₪{cart.total}</h2> // הצגת הסכום הכולל לתשלום
        <div style={{ display: 'flex', gap: '10px' }}> // קונטיינר לכפתורי פעולה
          <button onClick={clearCart} style={{ background: '#666', color: 'white' }}>רוקן עגלה</button> // כפתור לריקון העגלה
          <button onClick={checkout} style={{ background: '#28a745', color: 'white', fontSize: '1.1em', padding: '10px 20px' }}>לתשלום (Checkout)</button> // כפתור לתשלום
        </div> // סיום קונטיינר לכפתורי פעולה
      </div> // סיום קונטיינר לסיכום ותשלום
    </div> // סיום מרכז התוכן
  ); // סיום הצגת העגלה
}; // סיום רכיב דף העגלה
