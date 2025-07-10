import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase-config";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc, getDoc } from "firebase/firestore";

const DEMO_PRODUCTS = [
  { name: "Luxury Watch", category: "Accessories", price: "$1,200", stock: 45, status: "In Stock", image: require("../pictures/Luxury-Watch.jpeg") },
  { name: "Designer Bag", category: "Fashion", price: "$850", stock: 23, status: "Low Stock", image: require("../pictures/Designer-Bag.jpeg") },
  { name: "Premium Perfume", category: "Beauty", price: "$450", stock: 67, status: "In Stock", image: require("../pictures/Premium-Perfume.jpeg") },
  { name: "Gold Necklace", category: "Jewelry", price: "$2,100", stock: 12, status: "Low Stock", image: require("../pictures/Gold-Necklace.jpeg") },
  { name: "Diamond Ring", category: "Jewelry", price: "$3,500", stock: 8, status: "Out of Stock", image: require("../pictures/Diamond-Ring.jpeg") },
  { name: "Silk Scarf", category: "Fashion", price: "$180", stock: 34, status: "In Stock", image: require("../pictures/Silk-Scarf.jpeg") },
  { name: "Leather Wallet", category: "Accessories", price: "$220", stock: 50, status: "In Stock", image: require("../pictures/Leather-Wallet.jpeg") },
  { name: "Sunglasses", category: "Accessories", price: "$320", stock: 40, status: "In Stock", image: require("../pictures/Sunglasses.jpeg") },
  { name: "Cashmere Sweater", category: "Fashion", price: "$1,100", stock: 15, status: "Low Stock", image: require("../pictures/Cashmere-Sweater.jpeg") },
  { name: "Pearl Earrings", category: "Jewelry", price: "$900", stock: 20, status: "In Stock", image: require("../pictures/Pearl-Earrings.jpeg") },
];

const Products = () => {
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", category: "", price: "", stock: "", status: "In Stock", image: "" });
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orderMessage, setOrderMessage] = useState("");
  const [confirmOrder, setConfirmOrder] = useState({ open: false, product: null });
  const [toast, setToast] = useState({ open: false, message: "", type: "success" });
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Load products from Firestore
  useEffect(() => {
    setLoading(true);
    setError("");
    const q = query(collection(db, "products"), orderBy("name"));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      let products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // If fewer than 10 products, add missing demo products
      if (user && products.length < 10) {
        const existingNames = new Set(products.map(p => p.name));
        const missingDemoProducts = DEMO_PRODUCTS.filter(prod => !existingNames.has(prod.name));
        if (missingDemoProducts.length > 0) {
          const colRef = collection(db, "products");
          for (const prod of missingDemoProducts) {
            await addDoc(colRef, prod);
          }
          // Refetch after adding
          const newSnapshot = await getDocs(q);
          products = newSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
      }
      setProductList(products);
      setLoading(false);
    }, (err) => {
      setError("Failed to load products: " + err.message);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleNavigation = (route) => {
    navigate(route);
  };

  // Search filter
  // Remove duplicate products by name
  const uniqueProductsMap = new Map();
  for (const p of productList) {
    if (!uniqueProductsMap.has(p.name)) {
      uniqueProductsMap.set(p.name, p);
    }
  }
  const uniqueProducts = Array.from(uniqueProductsMap.values());
  const filteredProducts = uniqueProducts.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  // Add Product Modal handlers
  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "products"), {
        ...newProduct,
        stock: Number(newProduct.stock),
        price: newProduct.price,
        status: newProduct.status,
        image: newProduct.image,
      });
      setShowAddModal(false);
      setNewProduct({ name: "", category: "", price: "", stock: "", status: "In Stock", image: "" });
    } catch (err) {
      setError("Failed to add product: " + err.message);
    }
  };

  const handleOrderProduct = (product) => {
    setConfirmOrder({ open: true, product });
  };

  const confirmOrderAction = async () => {
    if (!user || !confirmOrder.product) return;
    setConfirmOrder({ open: false, product: null });
    try {
      await addDoc(collection(db, "orders"), {
        userName: user.displayName || user.email,
        userEmail: user.email,
        productId: confirmOrder.product.id,
        productName: confirmOrder.product.name,
        productPrice: confirmOrder.product.price,
        productImage: confirmOrder.product.image,
        productCategory: confirmOrder.product.category,
        orderDate: new Date().toISOString(),
        status: "Pending"
      });
      // Decrement product stock in Firestore
      const productRef = doc(db, "products", confirmOrder.product.id);
      await updateProductStock(productRef, -1);
      setToast({ open: true, message: `Order placed for ${confirmOrder.product.name}!`, type: "success" });
    } catch (err) {
      setToast({ open: true, message: "Failed to place order: " + err.message, type: "error" });
    }
    setTimeout(() => setToast({ open: false, message: "", type: "success" }), 2500);
  };

  const cancelOrderAction = () => {
    setConfirmOrder({ open: false, product: null });
  };

  // Reset Demo Products handler
  const handleResetDemoProducts = async () => {
    setLoading(true);
    setError("");
    try {
      // Delete all products
      const q = query(collection(db, "products"));
      const snapshot = await getDocs(q);
      const deletePromises = snapshot.docs.map(docSnap => deleteDoc(doc(db, "products", docSnap.id)));
      await Promise.all(deletePromises);
      // Add demo products
      const colRef = collection(db, "products");
      for (const prod of DEMO_PRODUCTS) {
        await addDoc(colRef, prod);
      }
      setLoading(false);
    } catch (err) {
      setError("Failed to reset demo products: " + err.message);
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-[var(--bg-dark)] min-h-screen flex items-center justify-center">
        <div className="text-[var(--gold-primary)] text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-luxe-black font-sans text-luxe-gold-light min-h-screen flex overflow-hidden">
      {/* Background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-luxe-gold opacity-10 mix-blend-overlay filter blur-3xl animate-float"></div>
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 rounded-full bg-luxe-gold opacity-5 mix-blend-overlay filter blur-3xl animate-float-reverse"></div>
        <div className="absolute top-1/3 right-1/3 w-56 h-56 rounded-full bg-luxe-gold opacity-15 mix-blend-overlay filter blur-3xl animate-pulse-slow"></div>
      </div>

      {/* Sidebar */}
      <div className="sidebar glass-effect bg-luxe-dark/80 border-r border-luxe-gold/20 w-64 min-h-screen p-4 flex flex-col">
        <div className="flex items-center justify-between mb-6 p-2">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-luxe-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span className="ml-2 text-xl font-bold gold-text-gradient">Chosen One</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-luxe-gold/20 scrollbar-track-transparent relative">
          {/* Scroll indicator */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-b from-luxe-gold/10 to-transparent pointer-events-none z-10"></div>
          
          <button 
            onClick={() => handleNavigation("/dashboard")}
            className="w-full flex items-center p-3 rounded-lg text-luxe-gold-muted hover:bg-luxe-gold/10 transition mb-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="ml-3">Dashboard</span>
          </button>
          <button 
            onClick={() => handleNavigation("/products")}
            className="w-full flex items-center p-3 rounded-lg bg-luxe-dark text-luxe-gold hover:bg-luxe-gold/10 transition mb-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span className="ml-3">Products</span>
          </button>
          <button 
            onClick={() => handleNavigation("/orders")}
            className="w-full flex items-center p-3 rounded-lg text-luxe-gold-muted hover:bg-luxe-gold/10 transition mb-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="ml-3">Orders</span>
            <span className="ml-auto px-2 py-0.5 rounded-full bg-luxe-gold/10 text-xs text-luxe-gold">0</span>
          </button>
          <button 
            onClick={() => handleNavigation("/queries")}
            className="w-full flex items-center p-3 rounded-lg text-luxe-gold-muted hover:bg-luxe-gold/10 transition mb-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            <span className="ml-3">Queries</span>
            <span className="ml-auto px-2 py-0.5 rounded-full bg-red-500/20 text-xs text-red-400">0</span>
          </button>
          <button 
            onClick={() => handleNavigation("/analytics")}
            className="w-full flex items-center p-3 rounded-lg text-luxe-gold-muted hover:bg-luxe-gold/10 transition mb-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="ml-3">Analytics</span>
          </button>
          <button 
            onClick={() => handleNavigation("/settings")}
            className="w-full flex items-center p-3 rounded-lg text-luxe-gold-muted hover:bg-luxe-gold/10 transition mb-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="ml-3">Settings</span>
          </button>
          
          {/* Bottom scroll indicator */}
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-t from-luxe-gold/10 to-transparent pointer-events-none z-10"></div>
        </nav>

        {/* Fixed Bottom Section - Always Visible */}
        <div className="mt-4 p-3 border-t border-luxe-gold/20">
          <div className="flex items-center p-3 rounded-lg bg-luxe-dark/50 mb-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-luxe-gold/20 flex items-center justify-center text-luxe-gold">
                <span>{user.email ? user.email[0].toUpperCase() : 'A'}</span>
              </div>
              <div className="notification-dot"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{user.displayName || 'Admin User'}</p>
              <p className="text-xs text-luxe-gold-muted">{user.email}</p>
            </div>
          </div>
          
          {/* Enhanced Logout Button - Always Visible */}
          <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
            <button 
              onClick={handleSignOut}
              className="w-full flex items-center justify-center p-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all duration-300 font-semibold text-base shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              LOGOUT
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-8 overflow-y-auto scrollbar-hide">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Products Management</h1>
            <p className="text-luxe-gold-muted">Manage your product inventory and catalog</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search products..." 
                className="bg-luxe-dark/50 border border-luxe-gold/20 rounded-lg px-4 py-2 pl-10 text-luxe-gold-light focus:outline-none focus:ring-2 focus:ring-luxe-gold/50 focus:border-transparent w-64" 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-luxe-gold-muted absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button
              className="flex items-center space-x-2 bg-gradient-to-r from-luxe-dark to-luxe-gold text-luxe-gold hover:from-luxe-gold hover:to-luxe-dark transition-all duration-300 px-4 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl border border-luxe-gold"
              onClick={handleResetDemoProducts}
              disabled={loading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356-2.582A9 9 0 116.582 4.582M4 9V4h5" />
              </svg>
              <span>Reset Demo Products</span>
            </button>
          </div>
        </div>
        {error && <div className="mb-4 text-red-400 text-center">{error}</div>}
        {orderMessage && <div className="mb-4 text-center text-green-400">{orderMessage}</div>}
        {loading ? (
          <div className="text-center text-luxe-gold">Loading products...</div>
        ) : (
          <div className="overflow-x-auto overflow-y-auto max-h-[500px] rounded-lg shadow-lg bg-luxe-dark/60 border border-luxe-gold/20 scrollbar-thin scrollbar-thumb-luxe-gold/20 scrollbar-track-transparent">
            <table className="min-w-full divide-y divide-luxe-gold/10">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-luxe-gold uppercase tracking-wider">Image</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-luxe-gold uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-luxe-gold uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-luxe-gold uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-luxe-gold uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-luxe-gold uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-luxe-gold uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-luxe-black/60 divide-y divide-luxe-gold/10">
                {filteredProducts.map(product => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-14 h-14 object-cover rounded shadow border border-luxe-gold/20" />
                      ) : (
                        <span className="text-2xl">🖼️</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{product.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-luxe-gold">{product.price}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{product.stock}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${product.status === "In Stock" ? "bg-green-500/20 text-green-400" : product.status === "Low Stock" ? "bg-yellow-500/20 text-yellow-400" : "bg-red-500/20 text-red-400"}`}>{product.status}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleOrderProduct(product)}
                        className="bg-gradient-to-r from-luxe-gold to-yellow-500 text-luxe-black font-semibold px-4 py-2 rounded-lg shadow hover:from-yellow-500 hover:to-luxe-gold transition"
                      >
                        Order
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Confirm Order Modal */}
      {confirmOrder.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-luxe-dark border border-luxe-gold/30 rounded-xl p-8 shadow-xl flex flex-col items-center">
            <h2 className="text-xl font-bold mb-4 text-luxe-gold">Confirm Order</h2>
            <p className="mb-6 text-luxe-gold-light">Are you sure you want to order <span className="font-semibold">{confirmOrder.product.name}</span>?</p>
            <div className="flex space-x-4">
              <button onClick={confirmOrderAction} className="px-6 py-2 rounded-lg bg-luxe-gold text-luxe-dark font-bold hover:bg-luxe-gold/80 transition">Confirm</button>
              <button onClick={cancelOrderAction} className="px-6 py-2 rounded-lg bg-luxe-dark border border-luxe-gold text-luxe-gold hover:bg-luxe-gold/10 transition">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.open && (
        <div className={`fixed top-8 right-8 z-50 px-6 py-3 rounded-lg shadow-lg font-semibold ${toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

// Helper to decrement product stock
async function updateProductStock(productRef, change) {
  const productSnap = await getDoc(productRef);
  if (productSnap.exists()) {
    const currentStock = productSnap.data().stock || 0;
    await updateDoc(productRef, { stock: Math.max(currentStock + change, 0) });
  }
}

export default Products; 