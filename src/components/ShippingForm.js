// src/components/ShippingForm.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from './PageWrapper';

const fiveDigitAreaCodes = [
  '09969', '09968', '09967', '09966', '09965', '09964', '09963', '09962', '09961', '09957',
  '09956', '09955',
];

const fourDigitAreaCodes = [
  //（省略せず完全なコードに含まれています）
  "0120", "0123", "0124", "0125", "0126", "0133", "0134", "0135", "0136", "0137", "0138", "0139",
  "0142", "0143", "0144", "0145", "0146", "0152", "0153", "0154", "0155", "0156", "0157", "0158",
  "0162", "0163", "0164", "0165", "0166", "0167", "0172", "0173", "0174", "0175", "0176", "0178", "0179",
  "0182", "0183", "0184", "0185", "0186", "0187", "0191", "0192", "0193", "0194", "0195", "0197", "0198",
  "0220", "0223", "0224", "0225", "0226", "0228", "0229", "0233", "0234", "0235", "0237", "0238",
  "0240", "0241", "0242", "0243", "0244", "0246", "0247", "0248", "0250", "0254", "0255", "0256", "0257", "0258", "0259",
  "0260", "0261", "0263", "0264", "0265", "0266", "0267", "0268", "0269", "0270", "0274", "0276", "0277", "0278", "0279",
  "0280", "0282", "0283", "0284", "0285", "0287", "0288", "0289", "0291", "0293", "0294", "0295", "0296", "0297", "0299",
  "0422", "0428", "0436", "0438", "0439", "0460", "0465", "0463", "0466", "0467", "0470", "0475", "0476", "0478", "0479",
  "0480", "0493", "0494", "0495", "0531", "0532", "0533", "0536", "0537", "0538", "0539",
  "0544", "0545", "0547", "0548", "0550", "0551", "0553", "0554", "0555", "0556", "0557", "0558",
  "0561", "0562", "0563", "0564", "0565", "0566", "0567", "0568", "0569",
  "0572", "0573", "0574", "0575", "0576", "0577", "0578", "0581", "0584", "0585", "0586", "0587",
  "0594", "0595", "0596", "0597", "0598", "0599",
  "0721", "0725", "0735", "0736", "0737", "0738", "0739",
  "0740", "0742", "0743", "0744", "0745", "0746", "0747", "0748", "0749",
  "0761", "0763", "0765", "0766", "0767", "0768",
  "0770", "0771", "0772", "0773", "0774", "0776", "0778", "0779",
  "0790", "0791", "0794", "0795", "0796", "0797", "0798", "0799",
  "0820", "0823", "0824", "0826", "0827", "0829",
  "0833", "0834", "0835", "0836", "0837", "0838",
  "0848", "0845", "0846", "0847",
  "0852", "0853", "0854", "0855", "0856", "0857", "0858", "0859",
  "0863", "0865", "0866", "0867", "0868", "0869",
  "0875", "0877", "0879",
  "0880", "0883", "0884", "0885", "0887", "0889",
  "0892", "0893", "0894", "0895", "0896", "0897", "0898",
  "0920", "0930",
  "0940", "0942", "0943", "0944", "0946", "0947", "0948", "0949",
  "0950", "0952", "0954", "0955", "0956", "0957", "0959",
  "0964", "0965", "0966", "0967", "0968", "0969",
  "0972", "0973", "0974", "0977", "0978", "0979",
  "0980", "0982", "0983", "0984", "0985", "0986", "0987",
  "0993", "0994", "0995", "0996", "0997"
];

const formatPhoneNumber = (phone) => {
  const digits = phone.replace(/\D/g, '');

  if (digits.length < 7) return phone;

  for (const code of fiveDigitAreaCodes) {
    if (digits.startsWith(code)) {
      const rest = digits.slice(code.length);
      if (rest.length <= 4) return `${code}-${rest}`;
      return `${code}-${rest.slice(0, rest.length - 4)}-${rest.slice(-4)}`;
    }
  }

  for (const code of fourDigitAreaCodes) {
    if (digits.startsWith(code)) {
      const rest = digits.slice(code.length);
      if (rest.length <= 4) return `${code}-${rest}`;
      return `${code}-${rest.slice(0, rest.length - 4)}-${rest.slice(-4)}`;
    }
  }

  const code = digits.slice(0, 3);
  const middleLen = digits.length - 7;
  if (middleLen > 0) {
    return `${code}-${digits.slice(3, 3 + middleLen)}-${digits.slice(-4)}`;
  } else if (digits.length > 3) {
    return `${code}-${digits.slice(3)}`;
  } else {
    return digits;
  }
};

const ShippingForm = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [prefecture, setPrefecture] = useState('');
  const [city, setCity] = useState('');
  const [town, setTown] = useState('');
  const [address, setAddress] = useState('');
  const [building, setBuilding] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState({});
  const [postalCodeFetchError, setPostalCodeFetchError] = useState(false);

  const updateError = (field, message) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  };

  const handlePostalCodeChange = (e) => {
    let val = e.target.value.replace(/[^\d]/g, '');
    if (val.length > 3) val = val.slice(0, 3) + '-' + val.slice(3, 7);
    if (val.length > 8) val = val.slice(0, 8);
    setPostalCode(val);
    setPostalCodeFetchError(false); // 入力変更時はエラーフラグ解除
  };

  const handlePostalCodeBlur = async () => {
    if (!postalCode) {
      updateError('postalCode', '');
      setPostalCodeFetchError(false);
      return;
    }

    try {
      const zipcode = postalCode.replace(/-/g, '');
      const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${zipcode}`);
      const data = await res.json();
      if (data.status === 200 && data.results?.length > 0) {
        const result = data.results[0];
        setPrefecture(result.address1 || '');
        setCity(result.address2 || '');
        setTown(result.address3 || '');
        setAddress('');

        updateError('postalCode', '');
        updateError('prefecture', '');
        updateError('city', '');
        updateError('town', '');
        updateError('address', '');
        setPostalCodeFetchError(false);
      } else {
        updateError('postalCode', '郵便番号が見つかりませんでした');
        setPostalCodeFetchError(true);
      }
    } catch {
      updateError('postalCode', '住所の取得に失敗しました');
      setPostalCodeFetchError(true);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = '氏名を入力してください';
    if (!postalCode.trim()) newErrors.postalCode = '郵便番号を入力してください';
    else if (postalCodeFetchError) newErrors.postalCode = '郵便番号が見つかりませんでした';
    if (!prefecture.trim()) newErrors.prefecture = '都道府県を入力してください';
    if (!city.trim()) newErrors.city = '市名を入力してください';
    if (!town.trim()) newErrors.town = '町名・区名を入力してください';
    if (!address.trim()) newErrors.address = '丁目・番地・号を入力してください';
    if (!phone.trim()) newErrors.phone = '電話番号を入力してください';
    else if (!/^\d{9,11}$/.test(phone.replace(/-/g, ''))) {
      newErrors.phone = '電話番号は9～11桁の数字で入力してください（ハイフン除く）';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhoneBlur = () => {
    if (!phone || phone.includes('-')) return;
    setPhone(formatPhoneNumber(phone));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const fullAddress = `${prefecture} ${city} ${town} ${address} ${building}`.trim();

    navigate('/payment', {
      state: { name, zip: postalCode, address: fullAddress, phone },
    });
  };

  const inputStyle = (field) => ({
    width: '100%',
    padding: '10px',
    marginBottom: '5px',
    borderRadius: '6px',
    border: errors[field] ? '2px solid red' : '1px solid #ccc',
    fontSize: '1rem',
    backgroundColor: '#fff',
  });

  const errorTextStyle = {
    color: 'red',
    fontSize: '0.85rem',
    marginBottom: '15px',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '6px',
    fontWeight: 'bold',
    color: '#333',
  };

  return (
    <PageWrapper currentStep={1} title="配送先情報の入力">
      <form onSubmit={handleSubmit} noValidate>
        <label style={labelStyle}>氏名</label>
        <input type="text" value={name} onChange={(e) => {
          setName(e.target.value);
          if (e.target.value.trim()) updateError('name', '');
        }} style={inputStyle('name')} />
        {errors.name && <div style={errorTextStyle}>{errors.name}</div>}

        <label style={labelStyle}>郵便番号（000-0000形式）</label>
        <input type="text" value={postalCode} onChange={handlePostalCodeChange} onBlur={handlePostalCodeBlur}
          placeholder="例: 123-4567" style={inputStyle('postalCode')} />
        {errors.postalCode && <div style={errorTextStyle}>{errors.postalCode}</div>}

        <label style={labelStyle}>都道府県</label>
        <input type="text" value={prefecture} onChange={(e) => {
          setPrefecture(e.target.value);
          if (e.target.value.trim()) updateError('prefecture', '');
        }} style={inputStyle('prefecture')} />
        {errors.prefecture && <div style={errorTextStyle}>{errors.prefecture}</div>}

        <label style={labelStyle}>市</label>
        <input type="text" value={city} onChange={(e) => {
          setCity(e.target.value);
          if (e.target.value.trim()) updateError('city', '');
        }} style={inputStyle('city')} />
        {errors.city && <div style={errorTextStyle}>{errors.city}</div>}

        <label style={labelStyle}>町・区</label>
        <input type="text" value={town} onChange={(e) => {
          setTown(e.target.value);
          if (e.target.value.trim()) updateError('town', '');
        }} style={inputStyle('town')} />
        {errors.town && <div style={errorTextStyle}>{errors.town}</div>}

        <label style={labelStyle}>丁目・番地・号</label>
        <input type="text" value={address} onChange={(e) => {
          setAddress(e.target.value);
          if (e.target.value.trim()) updateError('address', '');
        }} style={inputStyle('address')} />
        {errors.address && <div style={errorTextStyle}>{errors.address}</div>}

        <label style={labelStyle}>建物名・部屋番号（任意）</label>
        <input type="text" value={building} onChange={(e) => setBuilding(e.target.value)} style={inputStyle('building')} />

        <label style={labelStyle}>電話番号（ハイフンなしで9〜11桁）</label>
        <input type="tel" value={phone} onChange={(e) => {
          setPhone(e.target.value);
          if (e.target.value.trim()) updateError('phone', '');
        }} onBlur={handlePhoneBlur} placeholder="例: 0312345678" style={inputStyle('phone')} />
        {errors.phone && <div style={errorTextStyle}>{errors.phone}</div>}

        <button type="submit" style={{
          display: 'block',
          width: '100%',
          padding: '15px',
          fontSize: '1.2rem',
          backgroundColor: '#7d5a50',
          color: '#fff',
          border: 'none',
          borderRadius: '10px',
          cursor: 'pointer',
          fontFamily: '"Playfair Display", serif',
          marginTop: '20px',
          boxShadow: '0 4px 8px rgba(125, 90, 80, 0.5)',
        }}>
          次へ
        </button>
      </form>
    </PageWrapper>
  );
};

export default ShippingForm;
