import { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, onValue } from "firebase/database";
import "./App.css";

interface Category {
  id: string;
  name: string;
  createdAt?: number;
}

interface Item {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  visible?: boolean;
  createdAt?: number;
}

export default function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    // جلب الأقسام
    const catRef = ref(db, "categories");
    onValue(catRef, (snap) => {
      const data = snap.val();
      if (!data) return setCategories([]);
      const cats = Object.entries(data)
        .map(([id, value]: any) => ({
          id,
          name: value.name,
          createdAt: value.createdAt || 0,
        }))
        .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0)); // ترتيب الأقسام حسب الإضافة
      setCategories(cats);
    });

    // جلب الأصناف
    const itemRef = ref(db, "items");
    onValue(itemRef, (snap) => {
      const data = snap.val();
      if (!data) return setItems([]);
      const its = Object.entries(data)
        .map(([id, value]: any) => ({
          id,
          ...value,
          createdAt: value.createdAt || 0,
        }))
        .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0)); // ترتيب المنتجات حسب الإضافة
      setItems(its);
    });
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col font-sans"
      dir="rtl"
      style={{ backgroundColor: "#000", color: "#fff" }}
    >
      {/* Logo */}
      <div className="w-full flex justify-center mt-8 mb-4">
        <img
          src="/logo-qadi.png"
          alt="Logo"
          className="w-70 h-auto object-contain"
        />
      </div>

      {/* Menu */}
      <main className="flex-1 max-w-4xl mx-auto space-y-10 w-full px-6 py-6">
        {categories.map((category) => {
         
      // ترتيب المنتجات حسب createdAt ضمن القسم
          const categoryItems = items
            .filter((item) => item.categoryId === category.id)
            .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));

          if (categoryItems.length === 0) return null;

          return (
            <div key={category.id}>
              <h2
                className="text-2xl font-bold mb-4 border-b pb-2"
                style={{ color: "#D4AF37", borderColor: "#D4AF37" }}
              >
                {category.name}
              </h2>

              <div className="overflow-hidden rounded-xl border border-[#D4AF37] shadow-lg">
                <table className="w-full text-center" style={{ backgroundColor: "#111" }}>
                  <thead style={{ backgroundColor: "#D4AF37", color: "#000" }}>
                    <tr>
                      <th className="p-3 text-xl font-bold w-2/3">الصنف</th>
                      <th className="p-3 text-xl font-bold w-1/3">السعر</th>
                    </tr>
                  </thead>
              <tbody>
          {categoryItems.map((item) => (
                <tr
                  key={item.id}
                  className={`border-b border-[#333] transition-all ${
                    item.visible === false
                      ? "opacity-40 line-through"
                      : "hover:bg-[#222]"
                  }`}
                  style={{ color: "#fff" }}
                >
                  <td className="p-3 text-lg font-medium">{item.name}</td>
                  <td className="p-3 text-lg font-semibold" style={{ color: "#D4AF37" }}>
                    {String(item.price)
                      .split(",")
                      .map((p) => p.trim() + "₪")
                      .join(" | ")}
                  </td>
                </tr>
              ))}
            </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </main>

    {/* Footer */}
      <footer
        className="text-gray-300 py-5 rounded-t-3xl text-sm font-bold"
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0), #111)" }}
      >
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-5 gap-4 text-center md:text-right">
          <div className="flex flex-col items-center md:items-end gap-1">
            <div className="flex items-center gap-1">
              شارع الثورة مقابل تاج مول
            </div>
            <div className="flex items-center gap-1">0595557888</div>
          </div>

          <div className="flex items-center gap-2 justify-center md:justify-start text-xs text-[#D4AF37]">
            Eng. Mohammed Eljoujo
          </div>
        </div>
      </footer>
    </div>
  );
}
