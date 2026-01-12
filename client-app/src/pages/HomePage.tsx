import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
}

export const HomePage = () => {
  const { user, logout } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:3000/auth/google';
  };

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
      alert('שגיאה בהוספה לעגלה (אולי חסר מלאי?)');
    }
  };

  const deleteProduct = async (productId: number) => {
    try {
      await api.delete(`/product/${productId}`);
      setProducts(products.filter(p => p.id !== productId));
      alert('המוצר נמחק בהצלחה!');
    } catch (error) {
      alert('לא ניתן למחוק את המוצר (ייתכן שהוא כבר נרכש ומופיע בהזמנות)');
    }
  };

  const deleteAllProducts = async () => {
    if (window.confirm('האם למחוק את כל המוצרים בחנות?')) {
        try {
       setLoading(true);
        await Promise.all(products.map(p => api.delete(`/product/${p.id}`)));
        setProducts([]);
      } catch (error) {
        alert('לא ניתן למחוק חלק מהמוצרים (ייתכן שהם כבר נרכשו ומופיעים בהזמנות)');
      } finally {
        setLoading(false);
        }
    }
  };

  const addDemoProducts = async () => {
    const demoProducts = [
      {
        name: "iPhone 15 Pro",
        description: "האייפון החדש עם מסגרת טיטניום ומעבד A17 Pro",
        price: 1500,
        imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=500&q=60",
        stock: 1003
      },
      {
        name: "iPhone 17 Pro Max",
        description: "האייפון החדש עם מסגרת זהב ומעבד A19 Pro",
        price: 800,
        imageUrl: "https://images.unsplash.com/photo-1678652197831-2d180705cd2c?auto=format&fit=crop&w=500&q=60",
        stock: 8
      },
      {
        name: "MacBook Pro",
        description: "מחשב נייד חזק במיוחד לעבודה ופיתוח",
        price: 8999,
        imageUrl: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=500&q=60",
        stock: 5
      },
      {
        name: "Sony WH-1000XM5",
        description: "אוזניות ביטול רעשים הטובות בעולם",
        price: 1490,
        imageUrl: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=500&q=60",
        stock: 15
      },
      {
        name: "Nespresso Vertuo",
        description: "מכונת קפה לקפסולות ורטו",
        price: 890,
        imageUrl: "https://images.unsplash.com/photo-1621891392476-cd0744d29631?auto=format&fit=crop&w=500&q=60",
        stock: 8
      },
      {
        name: "טלוויזיה LG OLED55C1",
        description: "טלוויזיה חכמה 4K עם מסך OLED",
        price: 120,
        imageUrl: "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=500&q=60",
        stock: 3
      },
      {
        name: "PlayStation 5",
        description: "קונסולת המשחקים החדשה של סוני",
        price: 2200,
        imageUrl: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=500&q=60",
        stock: 3
      },
      {
        name: "מחשב אסוס נייד VivoBook",
        description: "מחשב נייד אסוס קל ונייד לעבודה יומיומית",
        price: 50,
        imageUrl: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=500&q=60",
        stock: 15
      },
      {
        name: "מחשב אסוס נייד ROG Zephyrus",
        description: "מחשב נייד אסוס עם מעבד powerful",
        price: 10,
        imageUrl: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=500&q=60",
        stock: 8
      },
      {
        name: "Wireless Mouse",
        description: "עכבר אלחוטי ארגונומי",
        price: 49.90,
        imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=500&q=60",
        stock: 50
      },
      {
        name: "USB-C Cable",
        description: "כבל טעינה מהיר 2 מטר",
        price: 29.90,
        imageUrl: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=500&q=60",
        stock: 100
      },
      {
        name: "Phone Case",
        description: "כיסוי מגן שקוף לאייפון",
        price: 19.90,
        imageUrl: "https://images.unsplash.com/photo-1603313011101-320f26a4f6f6?auto=format&fit=crop&w=500&q=60",
        stock: 200
      },
      {
        name: "Portable Charger",
        description: "מטען נייד 10000mAh",
        price: 89.00,
        imageUrl: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=500&q=60",
        stock: 30
      },
      {
        name: "Bluetooth Speaker",
        description: "רמקול בלוטוס קטן ועוצמתי",
        price: 120.00,
        imageUrl: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=500&q=60",
        stock: 40
      },
      {
        name: "Smart Watch",
        description: "שעון חכם עם מד דופק",
        price: 199.00,
        imageUrl: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=500&q=60",
        stock: 25
      },
      {
        name: "Gaming Keyboard",
        description: "מקלדת גיימינג מוארת",
        price: 150.00,
        imageUrl: "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=500&q=60",
        stock: 15
      },
      {
        name: "DJI Mini 4 Pro",
        description: "רחפן צילום מתקדם במשקל קל",
        price: 420,
        imageUrl: "https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=500&q=60",
        stock: 5
      },
      {
        name: "GoPro Hero 12",
        description: "מצלמת אקסטרים עמידה למים",
        price: 1699,
        imageUrl: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=500&q=60",
        stock: 12
      },
      {
        name: "Samsung 65\" 4K TV",
        description: "טלוויזיה חכמה QLED עם תמונה מדהימה",
        price: 3490,
        imageUrl: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=500&q=60",
        stock: 4
      },
      {
        name: "Dyson V15 Detect",
        description: "שואב אבק אלחוטי חזק במיוחד",
        price: 290,
        imageUrl: "https://images.unsplash.com/photo-1527515673510-813d31923299?auto=format&fit=crop&w=500&q=60",
        stock: 8
      },
      {
        name: "Ninja Air Fryer",
        description: "סיר טיגון ללא שמן",
        price: 890,
        imageUrl: "https://plus.unsplash.com/premium_photo-1673545518947-ddf3240090c1?auto=format&fit=crop&w=500&q=60",
        stock: 20
      },
      {
        name: "Electric Scooter",
        description: "קורקינט חשמלי מתקפל לעיר",
        price: 1500,
        imageUrl: "https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=500&q=60",
        stock: 10
      },
      {
        name: "Meta Quest 3",
        description: "משקפי מציאות מדומה מתקדמים",
        price: 2400,
        imageUrl: "https://images.unsplash.com/photo-1592478411213-61535f94e0c2?auto=format&fit=crop&w=500&q=60",
        stock: 7
      },
      {
        name: "Ring Video Doorbell",
        description: "פעמון דלת חכם עם מצלמה",
        price: 399,
        imageUrl: "https://plus.unsplash.com/premium_photo-1683121710572-7723bd2e235d?auto=format&fit=crop&w=500&q=60",
        stock: 15
      },
      {
        name: "Lego Classic Set",
        description: "ערכת לגו קלאסית לבנייה חופשית",
        price: 199.00,
        imageUrl: "https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=500&q=60",
        stock: 20
      },
      {
        name: "Monopoly Board Game",
        description: "משחק הלוח המפורסם לכל המשפחה",
        price: 120.00,
        imageUrl: "https://images.unsplash.com/photo-1611996575749-79a3a250f948?auto=format&fit=crop&w=500&q=60",
        stock: 15
      },
      {
        name: "RC Racing Car",
        description: "מכונית על שלט רחוק מהירה במיוחד",
        price: 150.00,
        imageUrl: "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=500&q=60",
        stock: 10
      },
      {
        name: "Giant Teddy Bear",
        description: "דובי פרווה ענק ורך לחיבוקים",
        price: 79.90,
        imageUrl: "https://images.unsplash.com/photo-1556012018-50c5c0da73bf?auto=format&fit=crop&w=500&q=60",
        stock: 30
      },
      {
        name: "Puzzle 1000 Pieces",
        description: "פאזל 1000 חלקים של נוף מרהיב",
        price: 59.90,
        imageUrl: "https://images.unsplash.com/photo-1610415636880-684082e594d5?auto=format&fit=crop&w=500&q=60",
        stock: 25
      },
      {
        name: "Wooden Dollhouse",
        description: "בית בובות מעץ עם רהיטים",
        price: 250.00,
        imageUrl: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=500&q=60",
        stock: 7  
      },
      {
        name: "Kids Scooter",
        description: "קורקינט 3 גלגלים לילדים",
        price: 90.00,
        imageUrl: "https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=500&q=60",
        stock: 12
      }
    ];

    try {
      setLoading(true);
      await Promise.all(demoProducts.map(product => api.post('/product', product)));
      await fetchProducts();
      alert('מוצרים נוספו בהצלחה!');
    } catch (error) {
      alert('שגיאה בהוספת מוצרים. וודא שאתה מחובר!');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p style={{ textAlign: 'center', marginTop: '20px' }}>טוען מוצרים...</p>;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
        <h1>שלום, {user?.username || 'אורח'} 👋</h1>
        {user ? (
          <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => navigate('/cart')}
            style={{ background: '#007bff', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            🛒 העגלה שלי
          </button>
          <button 
            onClick={() => navigate('/orders')}
            style={{ background: '#6c757d', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            📦 הזמנות
          </button>
          <button 
            onClick={logout} 
            style={{ background: '#ff4444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
          >
           👋 התנתק
          </button>
          <button 
            onClick={deleteAllProducts}
            style={{ background: 'black', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            🗑️ מחק הכל
          </button>
          </div>
        ) : (
          <button 
            onClick={handleGoogleLogin}
            style={{ background: '#4285F4', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            G התחבר עם Google
          </button>
        )}
            
      </header>

      <h2 style={{ marginBottom: '20px' }}>המוצרים שלנו</h2>
      
      {products.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <p>אין מוצרים בחנות כרגע.</p>
          <button 
            onClick={addDemoProducts}
            style={{ marginTop: '10px', background: '#28a745', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            ➕ טען מוצרים לדוגמה
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '25px' }}>
          {products.map((product) => (
            <div key={product.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '10px', textAlign: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', background: 'white', position: 'relative' }}>
              <button
                onClick={() => deleteProduct(product.id)} 
                style={{ position: 'absolute', top: '10px', left: '10px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2em' }}
                title="מחק מוצר"
              >
                🗑️
              </button>
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px' }} />
              ) : (
                <div style={{ width: '100%', height: '200px', background: '#f0f0f0', borderRadius: '8px', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>אין תמונה</div>
              )}
              <h3 style={{ margin: '10px 0' }}>{product.name}</h3>
              <p style={{ color: '#666', fontSize: '0.9em', height: '40px', overflow: 'hidden' }}>{product.description}</p>
              <p style={{ fontWeight: 'bold', fontSize: '1.2em', color: '#2c3e50' }}>₪{product.price}</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                <span style={{ fontSize: '0.8em', color: product.stock > 0 ? 'green' : 'red', fontWeight: 'bold' }}>
                  {product.stock > 0 ? `במלאי: ${product.stock}` : 'אזל מהמלאי'}
                </span>
                <button
                  onClick={() => addToCart(product.id)}
                  disabled={product.stock === 0}
                  style={{
                    padding: '8px 16px',
                    background: product.stock > 0 ? '#007bff' : '#ccc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: product.stock > 0 ? 'pointer' : 'not-allowed',
                    transition: 'background 0.2s'
                  }}
                >
                  הוסף +
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};