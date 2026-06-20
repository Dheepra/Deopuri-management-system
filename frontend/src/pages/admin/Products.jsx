import { useMemo, useState } from 'react';
import SearchInput from '../../components/ui/SearchInput.jsx';
import Table from '../../components/ui/Table.jsx';
import Button from '../../components/ui/Button.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  addVariant
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
  imageUrl: '',
  variants: []
});

 const handleEdit = (product) => {
 setFormData({
  ...product,
  variants: product.variants || []
}); // modal me data fill


  setEditId(product.id);
  setShowModal(true);
};

console.log("FORM DATA", formData);

const handleSave = async () => {
  try {

    if (editId) {

     await updateProduct(editId, {
  name: formData.name,
  description: formData.description,
  price: Number(formData.price),
  quantity: Number(formData.quantity),
  manufacturingDate: formData.manufacturingDate,
  imageUrl: formData.imageUrl,
  variants: formData.variants.map(v => ({
    size: v.size,
    stock: Number(v.stock),
    price: Number(v.price)
  }))
});

    } else {

      const product = await createProduct({
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        quantity: Number(formData.quantity),
        manufacturingDate: formData.manufacturingDate,
        imageUrl: formData.imageUrl
      });

      console.log("CREATED PRODUCT", product);

      for (const variant of formData.variants) {

        console.log("VARIANT", variant);

        const response = await addVariant(product.id, {
          size: variant.size,
          stock: Number(variant.stock),
          price: Number(variant.price)
        });

        console.log("VARIANT SAVED", response);
      }
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
      imageUrl: '',
      variants: []
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
  key: 'variants',
  header: 'Variants',
  render: (row) =>
    row.variants?.length
      ? row.variants.map(
          (v) => `${v.size} | Stock: ${v.stock} | ₹${v.price}`
        ).join(' , ')
      : 'No Variants'
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
  imageUrl: '',
  variants: []
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

<h3 className="mb-2 font-semibold">
  Variants
</h3>
{formData.variants.map((variant, index) => (
  <div key={index} className="flex gap-2 mb-2">

    <input
      className="border p-2"
      placeholder="Size"
      value={variant.size}
      onChange={(e) => {
        const updated = [...formData.variants];
        updated[index].size = e.target.value;

        setFormData({
          ...formData,
          variants: updated
        });
      }}
    />

    <input
      type="number"
      className="border p-2"
      placeholder="Stock"
      value={variant.stock}
      onChange={(e) => {
        const updated = [...formData.variants];
        updated[index].stock = Number(e.target.value);

        setFormData({
          ...formData,
          variants: updated
        });
      }}
    />

    <input
      type="number"
      className="border p-2"
      placeholder="Price"
      value={variant.price}
      onChange={(e) => {
        const updated = [...formData.variants];
        updated[index].price = Number(e.target.value);

        setFormData({
          ...formData,
          variants: updated
        });
      }}
    />

  </div>
))}

<Button
  onClick={() =>
    setFormData({
      ...formData,
      variants: [
        ...formData.variants,
        {
          size: '',
          stock: '',
          price: ''
        }
      ]
    })
  }
>
  + Add Variant
</Button>

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
  imageUrl: '',
  variants: []
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