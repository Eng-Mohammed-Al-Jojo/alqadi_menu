import { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, onValue, push, update, remove } from "firebase/database";
import { FiLogOut, FiPlus, FiEdit, FiTrash2 } from "react-icons/fi";

type PopupType =
  | "logout"
  | "addCategory"
  | "deleteCategory"
  | "editItem"
  | "deleteItem"
  | null;

export default function Admin() {
  /* ================= AUTH ================= */
  const [auth, setAuth] = useState(false);
  const [password, setPassword] = useState("");

  /* ================= DATA ================= */
  const [categories, setCategories] = useState<any>({});
  const [items, setItems] = useState<any>({});

  /* ================= FORM ================= */
  const [categoryName, setCategoryName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");

  /* ================= SEARCH ================= */
  const [quickSearch, setQuickSearch] = useState("");

  /* ================= UI ================= */
  const [popup, setPopup] = useState<{ type: PopupType; id?: string }>({ type: null });
  const [editItemId, setEditItemId] = useState("");

  /* ================= EFFECTS ================= */
  useEffect(() => {
    if (localStorage.getItem("admin-ok") === "yes") setAuth(true);
  }, []);

  useEffect(() => {
    if (!auth) return;
    const catRef = ref(db, "categories");
    const itemsRef = ref(db, "items");
    onValue(catRef, (snap) => setCategories(snap.val() || {}));
    onValue(itemsRef, (snap) => setItems(snap.val() || {}));
  }, [auth]);

  /* ================= AUTH FUNCTIONS ================= */
  const login = () => {
    if (password === "admin321") {
      localStorage.setItem("admin-ok", "yes");
      setAuth(true);
    } else alert("كلمة المرور غير صحيحة");
  };

  const logout = () => {
    localStorage.removeItem("admin-ok");
    setAuth(false);
    setPopup({ type: null });
  };

  /* ================= CATEGORY FUNCTIONS ================= */
  const addCategory = async () => {
    if (!categoryName.trim()) return;
    await push(ref(db, "categories"), { name: categoryName, createdAt: Date.now() });
    setCategoryName("");
    setPopup({ type: null });
  };

  const deleteCategory = async (id: string) => {
    // حذف القسم
    await remove(ref(db, `categories/${id}`));
    // حذف المنتجات التابعة مباشرة من قاعدة البيانات
    const itemsRef = ref(db, "items");
    onValue(itemsRef, (snap) => {
      const currentItems = snap.val() || {};
      Object.keys(currentItems).forEach((itemId) => {
        if (currentItems[itemId].categoryId === id) remove(ref(db, `items/${itemId}`));
      });
    }, { onlyOnce: true });
    setPopup({ type: null });
  };

  /* ================= ITEM FUNCTIONS ================= */
  const addItem = async () => {
    if (!selectedCategory || !itemName || !itemPrice) return;
    await push(ref(db, "items"), {
      name: itemName,
      price: itemPrice,
      categoryId: selectedCategory,
      visible: true,
      createdAt: Date.now(),
    });
    setItemName("");
    setItemPrice("");
    setSelectedCategory("");
  };

  const updateItem = async () => {
    if (!editItemId) return;
    await update(ref(db, `items/${editItemId}`), {
      name: itemName,
      price: itemPrice,
      categoryId: selectedCategory,
    });
    setPopup({ type: null });
    setEditItemId("");
    setItemName("");
    setItemPrice("");
    setSelectedCategory("");
  };

  const deleteItem = async () => {
    if (!popup.id) return;
    await remove(ref(db, `items/${popup.id}`));
    setPopup({ type: null });
  };

  const toggleItem = async (id: string, visible: boolean) => {
    await update(ref(db, `items/${id}`), { visible: !visible });
  };

  /* ================= LOGIN SCREEN ================= */
  if (!auth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F0F0F]" dir="rtl">
        <div className="bg-white p-6 rounded-3xl w-full max-w-xs border" style={{ borderColor: "#C9A24D" }}>
          <h1 className="text-xl font-bold mb-4 text-center">دخول الأدمن</h1>
          <input
            type="password"
            className="w-full p-3 border rounded-xl mb-4"
            placeholder="كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            onClick={login}
            className="w-full py-3 rounded-xl font-bold bg-[#0F0F0F] text-[#C9A24D]"
          >
            دخول
          </button>
        </div>
      </div>
    );
  }

  /* ================= ADMIN DASHBOARD ================= */
  return (
    <div className="min-h-screen w-full bg-[#0F0F0F] flex justify-center sm:p-1 md:p-6 " dir="rtl">
      <div className="w-full max-w-7xl px-8 sm:px-8 md:px-24">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6 flex-wrap">
          <h1 className="text-2xl font-bold text-white">لوحة تحكم الأدمن</h1>
          <button onClick={() => setPopup({ type: "logout" })} className="px-4 py-2 rounded-xl font-bold bg-[#C9A24D] text-[#0F0F0F] mt-2 sm:mt-0 flex items-center gap-1">
            <FiLogOut /> خروج
          </button>
        </div>

        {/* ADD CATEGORY */}
        <div className="bg-white p-4 rounded-3xl mb-6 border" style={{ borderColor: "#C9A24D" }}>
          <h2 className="font-bold mb-3">الأقسام</h2>
          <div className="flex gap-2 flex-wrap mb-4">
            <input
              className="flex-1 p-2 border rounded-xl min-w-[120px]"
              placeholder="اسم القسم"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
            />
            <button onClick={() => setPopup({ type: "addCategory" })} className="px-4 rounded-xl bg-yellow-400 flex items-center">
              <FiPlus />
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {Object.keys(categories).map((id) => (
              <div key={id} className="bg-gray-100 px-3 py-1 rounded-xl flex gap-2 items-center">
                <span>{categories[id].name}</span>
                <button onClick={() => setPopup({ type: "deleteCategory", id })} className="text-red-600">
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ADD ITEM */}
        <div className="bg-white p-4 rounded-3xl mb-6 border" style={{ borderColor: "#C9A24D" }}>
          <h2 className="font-bold mb-3">إضافة منتج</h2>
          <select
            className="w-full p-2 border rounded-xl mb-2"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">اختر القسم</option>
            {Object.keys(categories).map((id) => (
              <option key={id} value={id}>{categories[id].name}</option>
            ))}
          </select>
          <input
            className="w-full p-2 border rounded-xl mb-2"
            placeholder="اسم المنتج"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
          />
          <input
            className="w-full p-2 border rounded-xl mb-3"
            placeholder="الأسعار (افصل بين الأسعار بفاصلة)"
            value={itemPrice}
            onChange={(e) => setItemPrice(e.target.value)}
          />
          
          <div className="flex gap-2">
            <button
              onClick={addItem}
              className="flex-4 py-2 rounded-xl font-bold bg-yellow-400 grow"
            >
              إضافة المنتج
            </button>
          </div>
        </div>

       

        {/* ITEMS LIST */}
        <div className="bg-white p-4 rounded-3xl border" style={{ borderColor: "#C9A24D" }}>
          <h2 className="font-bold mb-3">المنتجات</h2>
          
           {/* QUICK SEARCH */}
        <input
          className="w-full p-2 border rounded-xl mb-4 bg-white"
          placeholder="ابحث بسرعة عن منتج أو قسم أو سعر..."
          value={quickSearch}
          onChange={(e) => setQuickSearch(e.target.value)}
        />
        
          {Object.keys(items).length === 0 && <p className="text-gray-400">لا يوجد منتجات</p>}
          <div className="space-y-2">
            {Object.keys(items)
              .filter(id => {
                const item = items[id];
                const prices = String(item.price).split(",").map(p => p.trim());
                const categoryName = categories[item.categoryId]?.name || "";
                const search = quickSearch.toLowerCase();
                return (
                  item.name.toLowerCase().includes(search) ||
                  categoryName.toLowerCase().includes(search) ||
                  prices.some(p => p.includes(search))
                );
              })
              .map((id) => {
              const item = items[id];
              const prices = String(item.price).split(",").map(p => p.trim());
              return (
                <div key={id} className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-2 rounded-xl ${item.visible ? "bg-gray-50" : "bg-gray-200 opacity-60"}`}>
                  <div>
                    <p className="font-bold">{item.name}</p>
                    <p className="text-sm text-gray-500">{categories[item.categoryId]?.name} • {prices.map(p => `${p}₪`).join(" / ")}</p>
                  </div>
                  <div className="flex gap-2 mt-2 sm:mt-0">
                    <button onClick={() => toggleItem(id, item.visible)} className={`px-3 py-1 rounded-xl text-white ${item.visible ? "bg-green-600" : "bg-gray-500"}`}>
                      {item.visible ? "نشط" : "غير نشط"}
                    </button>
                    <button onClick={() => { setEditItemId(id); setItemName(item.name); setItemPrice(String(item.price)); setSelectedCategory(item.categoryId); setPopup({ type: "editItem" }); }} className="bg-yellow-400 px-3 py-1 rounded-xl">
                      <FiEdit />
                    </button>
                    <button onClick={() => setPopup({ type: "deleteItem", id })} className="bg-red-600 text-white px-3 py-1 rounded-xl">
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* OVERLAY */}
        {popup.type && <div className="fixed inset-0 bg-black/60 z-40"></div>}

        {/* POPUP */}
        {popup.type && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-72 sm:w-80 bg-white p-4 sm:p-6 rounded-3xl">
            {popup.type === "logout" && (
              <>
                <p className="mb-4 font-bold text-center">تسجيل الخروج؟</p>
                <div className="flex justify-center gap-4">
                  <button onClick={logout} className="px-5 py-2 rounded-xl font-bold bg-black text-yellow-500">نعم</button>
                  <button onClick={() => setPopup({ type: null })} className="px-5 py-2 rounded-xl font-bold border">لا</button>
                </div>
              </>
            )}
            {popup.type === "addCategory" && (
              <>
                <p className="mb-4 font-bold text-center">إضافة قسم</p>
                <div className="flex justify-center gap-4">
                  <button onClick={addCategory} className="bg-green-600 text-white px-4 py-2 rounded-xl w-full">حفظ</button>
                  <button onClick={() => setPopup({ type: null })} className="bg-red-500 text-white px-5 py-2 rounded-xl font-bold border">إلغاء</button>
                </div>
              </>
            )}
            {popup.type === "deleteCategory" && (
              <>
                <p className="mb-4 font-bold text-center">تأكيد حذف القسم؟</p>
                <div className="flex justify-center gap-4">
                  <button onClick={() => deleteCategory(popup.id!)} className="px-5 py-2 rounded-xl font-bold bg-red-600 text-white">حذف</button>
                  <button onClick={() => setPopup({ type: null })} className="px-5 py-2 rounded-xl font-bold border">إلغاء</button>
                </div>
              </>
            )}
            {popup.type === "editItem" && (
              <>
                <h2 className="text-xl font-bold mb-4 text-center">تعديل المنتج</h2>
                <select className="w-full p-2 border rounded-xl mb-3" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                  {Object.keys(categories).map((id) => (
                    <option key={id} value={id}>{categories[id].name}</option>
                  ))}
                </select>
                <input className="w-full p-2 border rounded-xl mb-3" placeholder="اسم المنتج" value={itemName} onChange={(e) => setItemName(e.target.value)} />
                <input className="w-full p-2 border rounded-xl mb-4" placeholder="الأسعار (افصل بين الأسعار بفاصلة)" value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} />
                <div className="flex justify-end gap-2">
                  <button onClick={updateItem} className="px-4 py-2 rounded-xl font-bold" style={{ backgroundColor: "#C9A24D", color: "#0F0F0F" }}>حفظ</button>
                  <button 
                    onClick={() => {
                      setPopup({ type: null });
                      setItemName("");
                      setItemPrice("");
                      setSelectedCategory("");
                      setEditItemId("");
                    }}
                    className="px-4 py-2 rounded-xl border">إلغاء</button>
                </div>
              </>
            )}
            {popup.type === "deleteItem" && (
              <>
                <h2 className="text-xl font-bold mb-4 text-center">تأكيد الحذف</h2>
                <p className="text-center mb-6">هل أنت متأكد من حذف هذا المنتج؟</p>
                <div className="flex justify-center gap-4">
                  <button onClick={deleteItem} className="px-5 py-2 rounded-xl font-bold bg-red-600 text-white">نعم، حذف</button>
                  <button onClick={() => setPopup({ type: null })} className="px-5 py-2 rounded-xl font-bold border">لا</button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
