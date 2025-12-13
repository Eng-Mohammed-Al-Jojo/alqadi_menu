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

  useEffect(() => {
    if (auth) {
      onValue(ref(db, "menu"), (snap) => {
        setMenu(snap.val() || {});
      });
    }
  }, [auth]);

  useEffect(() => {
    if (localStorage.getItem("admin-ok") === "yes") setAuth(true);
  }, []);

  const handleLogin = () => {
    if (password === "admin321") {
      setAuth(true);
      localStorage.setItem("admin-ok", "yes");
    } else {
      alert("كلمة المرور غير صحيحة");
    }
  };

  const confirmLogout = () => {
    localStorage.removeItem("admin-ok");
    setAuth(false);
    setPopup({ type: null });
  };

  const addItem = () => {
    setError("");
    if (!categoryName.trim()) return setError("أدخل اسم القسم");
    if (!itemName.trim()) return setError("أدخل اسم المنتج");
    if (!itemPrice || isNaN(Number(itemPrice)))
      return setError("أدخل سعر صحيح");

    if (!menu[categoryName]) {
      set(ref(db, `menu/${categoryName}`), {});
    }

    push(ref(db, `menu/${categoryName}`), {
      name: itemName,
      price: Number(itemPrice),
      visible: true,
      createdAt: Date.now(),
    });

    setCategoryName("");
    setItemName("");
    setItemPrice("");
  };

  if (!auth) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#0F0F0F" }}
        dir="rtl"
      >
        <div
          className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-sm border"
          style={{ borderColor: "#C9A24D" }}
        >
          <h1
            className="text-3xl font-extrabold text-center mb-6"
            style={{ color: "#0F0F0F" }}
          >
            تسجيل دخول الأدمن
          </h1>

          <input
            type="password"
            placeholder="كلمة المرور"
            className="w-full p-4 mb-4 border rounded-xl"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handleLogin}
            className="w-full py-3 rounded-xl font-bold flex justify-center gap-2 shadow-lg"
            style={{ backgroundColor: "#0F0F0F", color: "#C9A24D" }}
          >
            <FiLogOut /> دخول
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-6"
      style={{ backgroundColor: "#0F0F0F" }}
      dir="rtl"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-white">
          لوحة تحكم الأدمن
        </h1>

        <button
          onClick={() => setPopup({ type: "logout" })}
          className="px-5 py-2 rounded-xl font-semibold flex gap-2 shadow-md"
          style={{ backgroundColor: "#C9A24D", color: "#0F0F0F" }}
        >
          <FiLogOut /> تسجيل الخروج
        </button>
      </div>

      {/* Add Item */}
      <div
        className="max-w-xl mx-auto p-6 rounded-3xl shadow-xl border mb-10"
        style={{ backgroundColor: "#FFFFFF", borderColor: "#C9A24D" }}
      >
        <h2 className="text-xl font-bold mb-4 text-black">
          إضافة قسم ومنتج
        </h2>

        <div className="flex flex-col gap-4">
          <input
            placeholder="اسم القسم"
            className="p-3 border rounded-xl"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
          />
          <input
            placeholder="اسم المنتج"
            className="p-3 border rounded-xl"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
          />
          <input
            placeholder="السعر"
            className="p-3 border rounded-xl"
            value={itemPrice}
            onChange={(e) => setItemPrice(e.target.value)}
          />

          {error && (
            <p className="bg-red-100 text-red-700 p-2 rounded text-center font-semibold">
              {error}
            </p>
          )}

          <button
            onClick={addItem}
            className="py-3 rounded-xl font-bold flex justify-center gap-2 shadow-md"
            style={{ backgroundColor: "#C9A24D", color: "#0F0F0F" }}
          >
            <FiPlus /> إضافة
          </button>
        </div>
      </div>

      {/* Menu */}
      <div className="max-w-5xl mx-auto grid gap-6">
        {Object.keys(menu).map((category) => (
          <div
            key={category}
            className="p-6 rounded-3xl shadow-xl border"
            style={{ backgroundColor: "#FFFFFF", borderColor: "#C9A24D" }}
          >
            <h3 className="text-2xl font-extrabold mb-4 text-black">
              {category}
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              {Object.keys(menu[category]).map((id) => {
                const item = menu[category][id];
                return (
                  <div
                    key={id}
                    className="p-4 rounded-2xl border flex justify-between items-center"
                    style={{ backgroundColor: "#F9F9F9" }}
                  >
                    <div className="font-semibold text-black">
                      {item.name} — ₪ {item.price}
                    </div>

                   <div className="flex gap-2">
            {/* نشط / غير نشط */}
            <button
              onClick={() =>
                set(
                  ref(db, `menu/${category}/${id}/visible`),
                  !item.visible
                )
              }
              className={`px-3 py-1 rounded-xl text-sm font-semibold transition ${
                item.visible
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-gray-400 text-white hover:bg-gray-500"
              }`}
            >
              {item.visible ? "نشط" : "غير نشط"}
            </button>

            {/* تعديل */}
            <button
              onClick={() =>
                setPopup({ type: "edit", category, id, item })
              }
              className="px-3 py-1 rounded-xl bg-yellow-400 text-white hover:bg-yellow-500 transition flex items-center gap-1"
            >
              <FiEdit />
            </button>

            {/* حذف */}
            <button
              onClick={() =>
                setPopup({ type: "delete", category, id, item })
              }
              className="px-3 py-1 rounded-xl bg-red-600 text-white hover:bg-red-700 transition flex items-center gap-1"
            >
              <FiTrash2 />
            </button>
          </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

      {/* Overlay */}
      {popup.type && (
        <div className="fixed inset-0 bg-black/60 z-40"></div>
      )}

      {/* Popup */}
      {popup.type && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-md">
          <div className="bg-white p-6 rounded-3xl shadow-2xl">
            {popup.type === "delete" && (
              <>
                <h2 className="text-xl font-bold mb-4">حذف المنتج</h2>
                <p className="mb-4">
                  هل أنت متأكد من حذف "{popup.item?.name}"؟
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      remove(
                        ref(db, `menu/${popup.category}/${popup.id}`)
                      );
                      setPopup({ type: null });
                    }}
                    className="px-4 py-2 rounded-xl"
                    style={{ backgroundColor: "#0F0F0F", color: "#C9A24D" }}
                  >
                    حذف
                  </button>
                  <button
                    onClick={() => setPopup({ type: null })}
                    className="px-4 py-2 rounded-xl border"
                  >
                    إلغاء
                  </button>
                </div>
              </>
            )}

            {popup.type === "logout" && (
              <>
                <h2 className="text-xl font-bold mb-4">
                  تأكيد تسجيل الخروج
                </h2>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={confirmLogout}
                    className="px-4 py-2 rounded-xl"
                    style={{ backgroundColor: "#0F0F0F", color: "#C9A24D" }}
                  >
                    نعم
                  </button>
                  <button
                    onClick={() => setPopup({ type: null })}
                    className="px-4 py-2 rounded-xl border"
                  >
                    إلغاء
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
