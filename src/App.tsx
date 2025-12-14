import { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, onValue } from "firebase/database";
import "./App.css";
import { FaMapMarkerAlt, FaPhone, FaCode } from "react-icons/fa";

interface MenuItem {
  id: string;
  name: string;
  price: string;
  createdAt?: number;
  visible?: boolean;
}

interface MenuSection {
  category: string;
  items: MenuItem[];
  lastItemTimestamp?: number;
}

export default function App() {
  const [menu, setMenu] = useState<MenuSection[]>([]);

  useEffect(() => {
    const menuRef = ref(db, "menu");
    const unsubscribe = onValue(menuRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      const sections: MenuSection[] = Object.keys(data)
        .map((category) => {
          const itemsObj = data[category];
          const items: MenuItem[] = Object.entries(itemsObj)
            .filter(([key]) => key !== "createdAt")
            .map(([id, value]: any) => ({ id, ...value }))
            .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));

          return {
            category,
            items,
            lastItemTimestamp: items.length
              ? Math.max(...items.map((i) => i.createdAt || 0))
              : 0,
          };
        })
        .sort((a, b) => (a.lastItemTimestamp || 0) - (b.lastItemTimestamp || 0));

      setMenu(sections);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col font-sans"
      dir="rtl"
      style={{ backgroundColor: "#000", color: "#fff" }}
    >
      <div className="w-full flex justify-center mt-8 mb-4">
        <img src="/logo-qadi.png" alt="Logo" className="w-60 h-auto object-contain" />
      </div>

      <main className="flex-1 max-w-4xl mx-auto space-y-10 w-full px-6 py-6">
        {menu.map((section) => (
          <div key={section.category}>
            <h2
              className="text-2xl font-bold mb-4 border-b pb-2"
              style={{ color: "#D4AF37", borderColor: "#D4AF37" }}
            >
              {section.category}
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
                  {section.items.map((item) => (
                    <tr
                      key={item.id}
                      className={`border-b border-[#333] transition-all ${
                        item.visible === false
                          ? "opacity-40 line-through"
                          : "hover:bg-[#222]"
                      }`}
                      style={{ color: item.visible === false ? "#fff" : "#fff" }}
                    >
                      <td className="p-3 text-lg font-medium">{item.name}</td>
                      <td className="p-3 text-lg font-semibold" style={{ color: "#D4AF37" }}>
                        {item.price} ₪
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </main>

      <footer
        className="text-gray-300 py-5 rounded-t-3xl text-sm font-bold"
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0), #111)" }}
      >
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-5 gap-4 text-center md:text-right">
          <div className="flex flex-col items-center md:items-end gap-1">
            <div className="flex items-center gap-1"><FaMapMarkerAlt /> شارع الثورة مقابل تاج مول</div>
            <div className="flex items-center gap-1"><FaPhone /> 0595557888</div>
          </div>

          <div className="flex items-center gap-2 justify-center md:justify-start text-xs text-[#D4AF37]">
            Eng. Mohammed Eljoujo <FaCode />
          </div>
        </div>
      </footer>
    </div>
  );
}
