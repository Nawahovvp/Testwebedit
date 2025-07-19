document.addEventListener('DOMContentLoaded', () => {
  fetchData();
  document.getElementById('dataForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const item = document.getElementById('item').value;
    const product = document.getElementById('product').value;
    const qty = document.getElementById('qty').value;
    await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item, product, qty }),
    });
    document.getElementById('dataForm').reset();
    fetchData();
  });
});
async function fetchData() {
  const response = await fetch('/api/data');
  const data = await response.json();
  const tbody = document.getElementById('dataBody');
  tbody.innerHTML = '';
  data.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.item}</td>
      <td>${row.product}</td>
      <td>${row.qty}</td>
      <td>
        <button class="edit-btn" onclick="editRow(${row.id}, '${row.item}', '${row.product}', '${row.qty}')">แก้ไข</button>
        <button class="delete-btn" onclick="deleteRow(${row.id})">ลบ</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}
async function editRow(id, item, product, qty) {
  document.getElementById('item').value = item;
  document.getElementById('product').value = product;
  document.getElementById('qty').value = qty;
  const form = document.getElementById('dataForm');
  form.onsubmit = async (e) => {
    e.preventDefault();
    const updatedItem = document.getElementById('item').value;
    const updatedProduct = document.getElementById('product').value;
    const updatedQty = document.getElementById('qty').value;
    await fetch(`/api/data/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item: updatedItem, product: updatedProduct, qty: updatedQty }),
    });
    form.reset();
    form.onsubmit = null;
    fetchData();
  };
}
async function deleteRow(id) {
  if (confirm('ยืนยันการลบ?')) {
    await fetch(`/api/data/${id}`, { method: 'DELETE' });
    fetchData();
  }
}
