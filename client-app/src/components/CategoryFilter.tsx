import { useState, useEffect } from 'react';

interface Category {
  id: number;
  name: string;
}

export function CategoryFilter({ onSelectCategory }: { onSelectCategory: (categoryId: number | null) => void }) {
  const [categories] = useState<Category[]>([
    { id: 1, name: '📱 אלקטרוניקה' },
    { id: 2, name: '👕 ביגוד' },
    { id: 3, name: '🏠 ביתי' },
    { id: 4, name: '🎮 משחקים' },
    { id: 5, name: '📚 ספרים' },
  ]);

  return (
    <div className="card mb-4">
      <div className="card-body">
        <h5 className="card-title">קטגוריות</h5>
        <div className="list-group">
          <button
            className="list-group-item list-group-item-action"
            onClick={() => onSelectCategory(null)}
          >
            ✨ הכל
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              className="list-group-item list-group-item-action"
              onClick={() => onSelectCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
