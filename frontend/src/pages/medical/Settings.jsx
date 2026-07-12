import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import {
  getProfile,
  updateProfile,
  uploadProfilePhoto,
} from '../../services/profile.js';
import { phone10, required, runValidators } from '../../utils/validators.js';

const INITIAL = {
  firstName: '',
  lastName: '',
  email: '',
  mobileNo: '',
  address: '',
  shopName: '',
};

function validate(values) {
  return {
    firstName: runValidators(values.firstName, required('First name')),
    lastName: runValidators(values.lastName, required('Last name')),
    mobileNo: runValidators(values.mobileNo, required('Mobile'), phone10),
    address: runValidators(values.address, required('Address')),
    shopName: runValidators(values.shopName, required('Shop name')),
  };
}

const inputCls =
  'w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm text-ink-900 outline-none transition-shadow focus:border-brand-500 focus:ring-2 focus:ring-brand-100';
const labelCls = 'mb-1.5 block text-sm font-semibold text-ink-700';
const errCls = 'mt-1 text-xs text-red-600';

export default function Settings() {
  const [id, setId] = useState(null);
  const [values, setValues] = useState(INITIAL);
  const [photoUrl, setPhotoUrl] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await getProfile();
        if (!active) return;
        setId(data.id);
        setPhotoUrl(data.photoUrl || '');
        setValues({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          mobileNo: data.mobileNo || '',
          address: data.address || '',
          shopName: data.shopName || '',
        });
      } catch (err) {
        console.error(err);
        toast.error('Could not load your profile');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const setField = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      const next = validate({ ...values, [name]: value })[name];
      if (!next) setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handlePhotoChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !id) return;
    setUploading(true);
    try {
      const data = await uploadProfilePhoto(id, file);
      setPhotoUrl(data.photoUrl || '');
      toast.success('Photo updated');
    } catch (err) {
      console.error(err);
      toast.error('Could not upload photo');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!id) return;
    const next = validate(values);
    setErrors(next);
    if (Object.values(next).some(Boolean)) {
      toast.error('Please fix the highlighted fields');
      return;
    }
    setSaving(true);
    try {
      const data = await updateProfile(id, {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        mobileNo: values.mobileNo.trim(),
        address: values.address.trim(),
        shopName: values.shopName.trim(),
      });
      if (data?.photoUrl !== undefined) setPhotoUrl(data.photoUrl || '');
      toast.success('Profile saved');
    } catch (err) {
      console.error(err);
      toast.error('Could not save profile');
    } finally {
      setSaving(false);
    }
  };

  const avatarLetter = (values.firstName?.[0] || values.email?.[0] || 'M').toUpperCase();

  return (
    <section className="mx-auto max-w-2xl">
      <div className="rounded-3xl border border-ink-100 bg-white p-6 shadow-sm">
        <header className="mb-6">
          <h2 className="flex items-center gap-2 font-display text-xl font-bold text-ink-900">
            ⚙️ Profile &amp; Settings
          </h2>
          <p className="mt-1 text-sm text-ink-500">Update your account details and photo.</p>
        </header>

        {loading ? (
          <p className="py-8 text-center text-sm text-ink-400">Loading…</p>
        ) : (
          <>
            <div className="mb-6 flex items-center gap-4">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="Profile"
                  className="h-20 w-20 rounded-full object-cover ring-2 ring-brand-100"
                />
              ) : (
                <span className="grid h-20 w-20 place-items-center rounded-full bg-brand-600 text-2xl font-semibold text-white">
                  {avatarLetter}
                </span>
              )}
              <div>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-ink-200 px-3 py-2 text-sm font-semibold text-ink-700 transition-colors hover:bg-ink-50">
                  📷 Change photo
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                    disabled={uploading}
                  />
                </label>
                {uploading && <p className="mt-1 text-xs text-ink-400">Uploading…</p>}
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className={labelCls}>🧑 First name</span>
                  <input
                    className={inputCls}
                    value={values.firstName}
                    onChange={(e) => setField('firstName', e.target.value)}
                    placeholder="First name"
                  />
                  {errors.firstName && <p className={errCls}>{errors.firstName}</p>}
                </label>
                <label className="block">
                  <span className={labelCls}>🧑 Last name</span>
                  <input
                    className={inputCls}
                    value={values.lastName}
                    onChange={(e) => setField('lastName', e.target.value)}
                    placeholder="Last name"
                  />
                  {errors.lastName && <p className={errCls}>{errors.lastName}</p>}
                </label>
              </div>

              <label className="block">
                <span className={labelCls}>📧 Email</span>
                <input
                  className={`${inputCls} cursor-not-allowed bg-ink-50 text-ink-500`}
                  value={values.email}
                  readOnly
                />
              </label>

              <label className="block">
                <span className={labelCls}>📱 Mobile</span>
                <input
                  className={inputCls}
                  type="tel"
                  inputMode="numeric"
                  value={values.mobileNo}
                  onChange={(e) =>
                    setField('mobileNo', e.target.value.replace(/\D/g, '').slice(0, 10))
                  }
                  placeholder="10-digit mobile"
                />
                {errors.mobileNo && <p className={errCls}>{errors.mobileNo}</p>}
              </label>

              <label className="block">
                <span className={labelCls}>🏠 Address</span>
                <input
                  className={inputCls}
                  value={values.address}
                  onChange={(e) => setField('address', e.target.value)}
                  placeholder="Address"
                />
                {errors.address && <p className={errCls}>{errors.address}</p>}
              </label>

              <label className="block">
                <span className={labelCls}>🏪 Shop name</span>
                <input
                  className={inputCls}
                  value={values.shopName}
                  onChange={(e) => setField('shopName', e.target.value)}
                  placeholder="Shop name"
                />
                {errors.shopName && <p className={errCls}>{errors.shopName}</p>}
              </label>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="w-full rounded-xl bg-brand-600 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-700 active:scale-[.99] disabled:opacity-60"
              >
                {saving ? 'Saving…' : '✅ Save changes'}
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
