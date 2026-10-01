"use client";

import ProductForm from "./ProductForm";
import { useEffect, useState } from "react";
import { defaultQuery, fetchProducts } from "@/lib/products";
import type {
  Product, ProductDraft, ProductList, SearchQuery,
} from "@/lib/products";
import ProductSearchForm from "./ProductSearchForm";

type LoadState = "loading" | "error" | "ready";

export default function ProductExplorer() {
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const editingProduct = products.find((p) => p.id === editingId) || null;

  function showResult(list: ProductList) {
    setProducts(list.products);
    setStatus("ready");
  }

  function showError(error: unknown) {
    setErrorMessage(
      error instanceof Error ? error.message : "เรียกข้อมูลไม่สำเร็จ"
    );
    setStatus("error");
  }
  useEffect(() => {
    fetchProducts(defaultQuery).then(showResult).catch(showError);
    // เติม: สิ่งที่กำหนดให้ทำงานเพียงครั้งเดียวตอนแสดงผลครั้งแรก
  }, []);
  async function loadProducts(query: SearchQuery) {
    setStatus("loading");
    setErrorMessage("");

    try {
      showResult(await fetchProducts(query));
    } catch (error) {
      showError(error);
    }
  }
function saveProduct(draft: ProductDraft) {
    if (editingId !== null) {
      // โหมดแก้ไข: หาแถวที่มี id ตรงกัน แล้วเอาข้อมูล draft ไปแทนที่
      setProducts(
        products.map((item) =>
          item.id === editingId ? { ...item, ...draft } : item
        )
      );
      setEditingId(null); // บันทึกเสร็จ กลับไปโหมดเพิ่ม
    } else {
      // โหมดเพิ่ม: (โค้ดเดิมของคุณ) เอาของใหม่ไปต่อท้าย
      setProducts([...products, { ...draft, id: Date.now() }]);
    }
  }
  function removeProduct(id: number) {
    // กรองเอาเฉพาะรายการที่ id "ไม่ตรง" กับตัวที่เราจะลบ
    setProducts(products.filter((item) => item.id !== id));
    
    // ถ้าดันไปกดลบตัวที่กำลังนั่งแก้ไขอยู่พอดี ก็ให้ปิดโหมดแก้ไขด้วย
    if (editingId === id) {
      setEditingId(null);
    }
  }
  return (
    <main>
      <h1>รายการสินค้า</h1>
      <button
        type="button"
        onClick={() => loadProducts(defaultQuery)}
        disabled={status === "loading"}
      >
        {status === "loading" ? "กำลังโหลด" : "โหลดข้อมูล"}
      </button>

      {/* เอาฟอร์มมาวางตรงนี้ครับ! */}
      <ProductSearchForm onSearch={loadProducts} />
      <ProductForm
        editing={editingProduct}
        onSave={saveProduct}
        onCancel={() => setEditingId(null)}
      />
      <section aria-live="polite">
        ... (ตารางสินค้าของคุณ) ...
  {status === "loading" && <p>กำลังโหลดข้อมูล</p>}

  {status === "error" && <p role="alert">{errorMessage}</p>}

  {status === "ready" && products.length === 0 && (
    <p>ไม่พบสินค้าที่ตรงกับเงื่อนไข</p>
  )}

  {status === "ready" && products.length > 0 && (
    <table>
      <thead>
        <tr>
          <th>ชื่อสินค้า</th><th>ราคา</th>
          <th>คงเหลือ</th><th>หมวดหมู่</th>
          <th>จัดการ</th>
        </tr>
      </thead>
      <tbody>
        {products.map((item) => (
          <tr key={item.id}>
            <td>{item.title}</td>
            <td>{item.price}</td>
            <td>{item.stock}</td>
            <td>{item.category}</td>
            <td>
              <button type="button" onClick={() => setEditingId(item.id)}>
                แก้ไข
              </button>
              <button type="button" onClick={() => removeProduct(item.id)}>
                ลบ
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )}
</section>

    </main>
  );
}
