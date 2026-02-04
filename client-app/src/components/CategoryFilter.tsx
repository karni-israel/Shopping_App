import { useState } from 'react';

interface Category {
  id: number;
  name: string;
  icon: string;
}

export function CategoryFilter({ onSelectCategory }: { onSelectCategory: (categoryId: number | null) => void }) {
  // סטייט כדי לדעת איזה כפתור צבוע כרגע (מודגש)
  const [activeId, setActiveId] = useState<number | null>(null);

  const categories: Category[] = [
    { id: 1, name: 'אלקטרוניקה', icon: '📱' },
    { id: 2, name: 'ביגוד', icon: '👕' },
    { id: 3, name: 'לבית ולגן', icon: '🏠' },
    { id: 4, name: 'משחקים ופנאי', icon: '🎮' },
    { id: 5, name: 'ספרים', icon: '📚' },
  ];

  const handleSelect = (id: number | null) => {
    setActiveId(id);       // צובע את הכפתור
    onSelectCategory(id);  // מסנן את המוצרים
  };

  return (
    <div className="card border-0 shadow-sm p-3">
      <h4 className="mb-4 fw-bold" style={{ textAlign: 'right', color: '#333' }}>
        קטגוריות
      </h4>
      
      <div className="d-flex flex-column gap-2">
        {/* כפתור "הכל" */}
        <button
          onClick={() => handleSelect(null)}
          className="btn text-end d-flex align-items-center justify-content-between p-3 rounded-3"
          style={{
            backgroundColor: activeId === null ? '#f0f2f5' : 'transparent',
            border: 'none',
            color: activeId === null ? '#0d6efd' : '#555',
            fontWeight: activeId === null ? 'bold' : 'normal',
            transition: 'all 0.2s'
          }}
        >
          {/* בגלל שהדף ב-RTL, האלמנט הראשון יהיה מימין */}
          <span style={{ fontSize: '1.1rem' }}>הכל</span>
          <span style={{ fontSize: '1.2rem' }}>✨</span>
        </button>

        {/* רשימת הקטגוריות */}
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleSelect(category.id)}
            className="btn text-end d-flex align-items-center justify-content-between p-3 rounded-3"
            style={{
              backgroundColor: activeId === category.id ? '#f0f2f5' : 'transparent',
              border: 'none',
              color: activeId === category.id ? '#0d6efd' : '#555',
              fontWeight: activeId === category.id ? 'bold' : 'normal',
              transition: 'all 0.2s'
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>{category.name}</span>
            <span style={{ fontSize: '1.2rem' }}>{category.icon}</span>
          </button>
        ))}
      </div>
    </div>
  );
}