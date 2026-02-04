import { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  product: {
    name: string;
    imageUrl: string;
  };
}

interface Order {
  id: number;
  orderDate: string;
  totalAmount: number;
  items: OrderItem[];
}

export const OrderHistoryPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/order');
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteOrder = async (orderId: number) => {
    if (window.confirm('האם למחוק את ההזמנה מההיסטוריה?')) {
      try {
        await api.delete(`/order/${orderId}`);
        setOrders(orders.filter(o => o.id !== orderId));
      } catch (error) {
        alert('שגיאה במחיקת ההזמנה');
      }
    }
  };

  if (loading) return <p style={{ textAlign: 'center', marginTop: '20px' }}>טוען היסטוריית הזמנות...</p>;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
        <button 
          onClick={() => navigate('/')} 
          style={{ marginRight: '15px', background: 'transparent', border: '1px solid #ccc', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}
        >
          ⬅️ חזרה
        </button>
        <h1>ההזמנות שלי 📦</h1>
      </div>

      {orders.length === 0 ? (
        <p style={{ textAlign: 'center', fontSize: '1.2em', color: '#000000' }}>עדיין לא ביצעת הזמנות.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {orders.map((order) => (
            <div key={order.id} style={{ border: '1px solid #dddddd', borderRadius: '10px', padding: '20px', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', position: 'relative' }}>
              <button 
                onClick={() => deleteOrder(order.id)}
                style={{ position: 'absolute', top: '10px', left: '10px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2em' }}
                title="מחק הזמנה"
              >
                🗑️
              </button>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' }}>
                <div>
                  <strong>הזמנה #{order.id}</strong>
                  <span style={{ margin: '0 10px', color: '#999' }}>|</span>
                  <span style={{ color: '#666' }}>{new Date(order.orderDate).toLocaleDateString('he-IL')}</span>
                </div>
                <div style={{ fontWeight: 'bold', color: '#28a745' }}>
                  סה"כ: ₪{order.totalAmount}
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {order.items.map((item) => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', fontSize: '0.9em' }}>
                    <div style={{ width: '40px', height: '40px', background: '#f9f9f9', borderRadius: '5px', overflow: 'hidden', marginRight: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {item.product?.imageUrl ? (
                        <img src={item.product.imageUrl} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: '1.2em' }}>🖼️</span>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      {item.product?.name || 'מוצר שנמחק'}
                    </div>
                    <div style={{ color: '#666' }}>
                      {item.quantity} x ₪{item.price}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};