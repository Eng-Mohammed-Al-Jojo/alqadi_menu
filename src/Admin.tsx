import { useState, useEffect } from "react";
import { db } from "./firebase";
import { ref, onValue, push, set, remove } from "firebase/database";
import { FiEdit, FiTrash2, FiLogOut, FiPlus } from "react-icons/fi";

export default function Admin() {
  const [auth, setAuth] = useState(false);
  const [password, setPassword] = useState("");
  const [menu, setMenu] = useState<any>({});
  const [categoryName, setCategoryName] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [error, setError] = useState("");

  const [popup, setPopup] = useState<{
    type: "edit" | "delete" | "logout" | null;
    category?: string;
    id?: string;
    item?: any;
  }>({ type: null });

  // تحميل البيانات
  useEffect(() => {
    if (auth) {
      const menuRef = ref(db, "menu");
      onValue(menuRef, (snapshot) => {
        setMenu(snapshot.val() || {});
      });
    }
  }, [auth]);

  // تسجيل الدخول
  const handleLogin = () => {
    if (password === "admin321") {
      setAuth(true);
      localStorage.setItem("admin-ok", "yes");
    } else {
      alert("كلمة المرور غير صحيحة");
    }
  };

  const handleLogout = () => setPopup({ type: "logout" });
  const confirmLogout = () => {
    localStorage.removeItem("admin-ok");
    setAuth(false);
    closePopup();
  };
  const closePopup = () => setPopup({ type: null });

  // تسجيل خروج تلقائي عند عدم النشاط لمدة دقيقتين
  useEffect(() => {
    if (!auth) return;

    let logoutTimer: number; // استخدام number بدل NodeJS.Timeout

    const resetTimer = () => {
      if (logoutTimer) clearTimeout(logoutTimer);
      logoutTimer = window.setTimeout(() => {
        confirmLogout();
      }, 1 * 60 * 1000); // دقيقتين
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);

    resetTimer(); // بدء المؤقت لأول مرة

    return () => {
      clearTimeout(logoutTimer);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
    };
  }, [auth]);

  // إضافة منتج مع Validation بدون منع الأقسام
  const addItem = () => {
    setError("");
    if (!categoryName.trim()) return setError("يرجى إدخال اسم القسم");
    if (!itemName.trim()) return setError("يرجى إدخال اسم المنتج");
    if (!itemPrice.trim() || isNaN(Number(itemPrice)))
      return setError("يرجى إدخال سعر صحيح");

    // إنشاء القسم إذا لم يكن موجود
    if (!menu[categoryName]) {
      set(ref(db, `menu/${categoryName}`), {});
    }

    // إضافة المنتج داخل القسم
    push(ref(db, `menu/${categoryName}`), {
      name: itemName,
      price: parseFloat(itemPrice),
      createdAt: Date.now(),
      visible: true, // <-- هذا جديد

    });

    setCategoryName("");
    setItemName("");
    setItemPrice("");
  };

  const openEditPopup = (category: string, id: string, item: any) =>
    setPopup({ type: "edit", category, id, item });

  const openDeletePopup = (category: string, id: string, item: any) =>
    setPopup({ type: "delete", category, id, item });

  const saveEditItem = () => {
    if (popup.category && popup.id && popup.item) {
      set(ref(db, `menu/${popup.category}/${popup.id}`), {
        ...popup.item,
        price: parseFloat(popup.item.price),
      });
      closePopup();
    }
  };

  const confirmDeleteItem = () => {
    if (popup.category && popup.id) {
      remove(ref(db, `menu/${popup.category}/${popup.id}`));
      closePopup();
    }
  };

  useEffect(() => {
    if (localStorage.getItem("admin-ok") === "yes") {
      setAuth(true);
    }
  }, []);

  if (!auth) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-linear-to-r from-red-100 via-red-50 to-white p-6"
        dir="rtl"
      >
        <div className="bg-white shadow-2xl rounded-3xl p-10 w-full max-w-sm flex flex-col items-center">
          <h1 className="text-4xl font-extrabold text-red-600 mb-8 tracking-wide">
            تسجيل دخول الأدمن
          </h1>
          <input
            type="password"
            placeholder="ادخل كلمة المرور"
            className="w-full p-4 mb-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-4 focus:ring-red-300 text-lg shadow-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            onClick={handleLogin}
            className="w-full bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <FiLogOut /> دخول
          </button>
          <p className="mt-6 text-gray-500 text-sm text-center">
            فقط المسؤول يمكنه الدخول
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-red-600">لوحة تحكم الأدمن</h1>
        <button
          onClick={handleLogout}
          className="bg-gray-800 text-white px-4 py-2 rounded-xl hover:bg-gray-700 transition flex items-center gap-2"
        >
          <FiLogOut /> تسجيل الخروج
        </button>
      </div>

      {/* إضافة منتجات */}
      <div className="bg-white p-6 rounded-3xl shadow-md max-w-xl mx-auto mb-6">
        <h2 className="text-xl font-bold mb-4 text-red-600">إضافة قسم ومنتج</h2>
        <div className="flex flex-col gap-4">
          <input
            placeholder="اسم القسم"
            className="w-full p-3 border rounded-xl"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
          />
          <input
            placeholder="اسم المنتج"
            className="w-full p-3 border rounded-xl"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
          />
          <input
            placeholder="السعر"
            className="w-full p-3 border rounded-xl"
            value={itemPrice}
            onChange={(e) => setItemPrice(e.target.value)}
          />
          {error && (
            <p className="text-red-600 font-semibold bg-red-100 p-2 rounded text-center">
              {error}
            </p>
          )}
          <button
            onClick={addItem}
            className="bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2"
          >
            <FiPlus /> إضافة
          </button>
        </div>
      </div>

      {/* عرض الأقسام والمنتجات */}
      <div className="max-w-5xl mx-auto grid gap-6">
        {Object.keys(menu).map((category) =>
          menu[category] ? (
            <div key={category} className="bg-white p-6 rounded-3xl shadow-lg">
              <h3 className="text-2xl font-bold text-red-600 mb-4">{category}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(menu[category]).map((id) => {
                  const item = menu[category][id];
                  return (
                    <div
                      key={id}
                      className="p-4 border rounded-2xl flex justify-between items-center bg-gray-50 hover:shadow-lg transition"
                    >
                      <div>
                        <span className="font-bold">{item.name}</span> -{" "}
                        <span>₪ {item.price}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditPopup(category, id, item)}
                          className="bg-yellow-400 text-white px-3 py-1 rounded-xl hover:bg-yellow-500 transition flex items-center gap-1"
                        >
                          <FiEdit /> تعديل
                        </button>
                        <button
                          onClick={() => openDeletePopup(category, id, item)}
                          className="bg-red-600 text-white px-3 py-1 rounded-xl hover:bg-red-700 transition flex items-center gap-1"
                        >
                          <FiTrash2 /> حذف
                        </button>
                        <button
  onClick={() =>
    set(ref(db, `menu/${category}/${id}/visible`), !item.visible)
  }
  className={`px-3 py-1 rounded-xl transition ${
    item.visible
      ? "bg-green-600 text-white hover:bg-green-700"
      : "bg-gray-400 text-white hover:bg-gray-500"
  }`}
>
  {item.visible ? "نشط" : "غير نشط"}
</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null
        )}
      </div>

      {/* Popup Overlay */}
      {popup.type && <div className="fixed inset-0 bg-black bg-opacity-40 z-40"></div>}

      {/* Popup */}
      {popup.type && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl p-6 animate-fadeIn">
            {popup.type === "edit" && (
              <div className="flex flex-col gap-4">
                <h2 className="text-2xl font-bold text-red-600">تعديل المنتج</h2>
                <input
                  type="text"
                  className="border p-3 rounded-xl w-full"
                  value={popup.item?.name}
                  onChange={(e) =>
                    setPopup((prev) => ({
                      ...prev,
                      item: { ...prev.item, name: e.target.value },
                    }))
                  }
                />
                <input
                  type="text"
                  className="border p-3 rounded-xl w-full"
                  value={popup.item?.price}
                  onChange={(e) =>
                    setPopup((prev) => ({
                      ...prev,
                      item: { ...prev.item, price: e.target.value },
                    }))
                  }
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={saveEditItem}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition flex items-center gap-1"
                  >
                    <FiEdit /> حفظ
                  </button>
                  <button
                    onClick={closePopup}
                    className="px-4 py-2 rounded-xl border hover:bg-gray-100 transition"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            )}

            {popup.type === "delete" && (
              <div className="flex flex-col gap-4">
                <h2 className="text-2xl font-bold text-red-600">حذف المنتج</h2>
                <p>هل أنت متأكد من حذف "{popup.item?.name}"؟</p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={confirmDeleteItem}
                    className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition flex items-center gap-1"
                  >
                    <FiTrash2 /> حذف
                  </button>
                  <button
                    onClick={closePopup}
                    className="px-4 py-2 rounded-xl border hover:bg-gray-100 transition"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            )}

            {popup.type === "logout" && (
              <div className="flex flex-col gap-4">
                <h2 className="text-2xl font-bold text-red-600">
                  تأكيد تسجيل الخروج
                </h2>
                <p>هل أنت متأكد أنك تريد تسجيل الخروج؟</p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={confirmLogout}
                    className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition flex items-center gap-1"
                  >
                    <FiLogOut /> نعم
                  </button>
                  <button
                    onClick={closePopup}
                    className="px-4 py-2 rounded-xl border hover:bg-gray-100 transition"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
