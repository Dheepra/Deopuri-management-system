import { useMemo, useState } from 'react';
import SearchInput from '../../components/ui/SearchInput.jsx';
import Table from '../../components/ui/Table.jsx';
import Button from '../../components/ui/Button.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct
} from '../../services/products.js';



export default function Product() {

  const { data, loading, refresh } =
  useAsyncData(() => fetchProducts());
const [editId, setEditId] = useState(null);

  const [search, setSearch] = useState('');
const [showModal, setShowModal] = useState(false);

const [formData, setFormData] = useState({
  name: '',
  description: '',
  price: '',
  quantity: '',
  manufacturingDate: '',
  imageUrl: ''
});
 const handleEdit = (product) => {
  setFormData(product);   // modal me data fill
  setEditId(product.id);
  setShowModal(true);
};


const handleSave = async () => {
  try {
    if (editId) {
      await updateProduct(editId, formData); // EDIT
    } else {
      await createProduct(formData); // ADD
    }

  
    refresh();
setShowModal(false);
setEditId(null);

setFormData({
  name: '',
  description: '',
  price: '',
  quantity: '',
  manufacturingDate: '',
  imageUrl: ''
});
  } catch (error) {
    console.error(error);
  }
};



async function handleDelete(id) {
  const ok = window.confirm(
    'Delete this product?'
  );

  if (!ok) return;

 await deleteProduct(id);

refresh();
}

  const columns = [
    {
      key: 'name',
      header: 'Product Name',
    },
    {
  key: 'description',
  header: 'Description',
  render: (row) =>
    row.description?.length > 50
      ? row.description.slice(0, 50) + '...'
      : row.description,
},
    {
      key: 'price',
      header: 'Price',
      render: (row) => `₹${row.price}`,
    },
    {
       key: 'quantity',
  header: 'Stock',
    },
    {
  key: 'imageUrl',
  header: 'Image',
  render: (row) => (
    <img
      src={row.imageUrl}
      alt={row.name}
      style={{ width: 50, height: 50, objectFit: 'cover' }}
    />
  ),
},
    {
  key: 'actions',
  header: 'Actions',
  render: (row) => (
    <div className="flex gap-2">
      <Button onClick={() => handleEdit(row)}>
        Edit
      </Button>

      <Button
        
        onClick={() => handleDelete(row.id)}
      >
        Delete
      </Button>
    </div>
  ),
},
  ];

  const filteredRows = useMemo(() => {
    const base = data ?? [];

    if (!search) return base;

    return base.filter((p) =>
      p.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);
return (
  <>
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-semibold">
        Products
      </h2>

    
    </div>

    <div className="flex items-center justify-between gap-4 mb-2">
  <SearchInput
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    placeholder="Search products..."
  />

  <Button
  onClick={() => {
    setEditId(null);

    setFormData({
      name: '',
      description: '',
      price: '',
      quantity: '',
      manufacturingDate: '',
      imageUrl: ''
    });

    setShowModal(true);
  }}
>
  Add Product
</Button>
</div>

    <Table
      columns={columns}
      rows={filteredRows}
      loading={loading}
      pageSize={8}
    />

   {showModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
      <h3 className="mb-4 text-lg font-semibold">
        Add Product
      </h3>

      <input
        className="mb-3 w-full rounded border p-2"
        placeholder="Product Name"
        value={formData.name}
        onChange={(e) =>
          setFormData({
            ...formData,
            name: e.target.value,
          })
        }
      />

      <textarea
        className="mb-3 w-full rounded border p-2"
        placeholder="Description"
        rows={3}
        value={formData.description}
        onChange={(e) =>
          setFormData({
            ...formData,
            description: e.target.value,
          })
        }
      />

      <input
        type="number"
        className="mb-3 w-full rounded border p-2"
        placeholder="Price"
        value={formData.price}
        onChange={(e) =>
          setFormData({
            ...formData,
            price: e.target.value,
          })
        }
      />

      <input
        type="number"
        className="mb-3 w-full rounded border p-2"
        placeholder="Quantity"
        value={formData.quantity}
        onChange={(e) =>
          setFormData({
            ...formData,
            quantity: e.target.value,
          })
        }
      />

      <input
        type="date"
        className="mb-3 w-full rounded border p-2"
        value={formData.manufacturingDate}
        onChange={(e) =>
          setFormData({
            ...formData,
            manufacturingDate: e.target.value,
          })
        }
      />

      <input
        className="mb-4 w-full rounded border p-2"
        placeholder="Image URL"
        value={formData.imageUrl}
        onChange={(e) =>
          setFormData({
            ...formData,
            imageUrl: e.target.value,
          })
        }
      />

      <div className="flex justify-end gap-2">
        <Button
  onClick={() => {
    setShowModal(false);
    setEditId(null);

    setFormData({
      name: '',
      description: '',
      price: '',
      quantity: '',
      manufacturingDate: '',
      imageUrl: ''
    });
  }}
>
  Cancel
</Button>

        <Button onClick={handleSave}>
  Save
</Button>
      </div>
    </div>
  </div>
)}
  </>
);
}