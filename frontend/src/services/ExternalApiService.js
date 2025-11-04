// src/services/ExternalApiService.js
import allProvinces from 'hanhchinhvn/dist/tinh_tp.json';
import allDistricts from 'hanhchinhvn/dist/quan_huyen.json';
import allWards from 'hanhchinhvn/dist/xa_phuong.json';

// --- CHUYỂN ĐỔI DỮ LIỆU MỘT LẦN ---
// Dữ liệu gốc có dạng { "mã": { ... } }, ta chuyển sang dạng mảng [ ... ] để dễ lọc
const provincesArray = Object.values(allProvinces);
const districtsArray = Object.values(allDistricts);
const wardsArray = Object.values(allWards);
// ------------------------------------

/**
 * Lấy danh sách Tỉnh/Thành phố
 * (Đọc từ file tinh_tp.json)
 */
export const getProvinces = async () => {
    // Thêm một chút delay (giả lập API) để tránh các component bị "giật"
    await new Promise(resolve => setTimeout(resolve, 50)); 
    
    return provincesArray.map(province => ({
        label: province.name_with_type, // Ví dụ: "Thành phố Hà Nội"
        value: province.code,          // Ví dụ: "01"
    }));
};

/**
 * Lấy danh sách Quận/Huyện theo mã tỉnh
 * (Đọc từ file quan_huyen.json)
 */
export const getDistricts = async (provinceCode) => {
    await new Promise(resolve => setTimeout(resolve, 50));
    
    return districtsArray
        .filter(d => d.parent_code === provinceCode) // Lọc các huyện thuộc tỉnh
        .map(district => ({
            label: district.name_with_type, // Ví dụ: "Quận Ba Đình"
            value: district.code,          // Ví dụ: "001"
        }));
};

/**
 * Lấy danh sách Phường/Xã theo mã huyện
 * (Đọc từ file xa_phuong.json)
 */
export const getWards = async (districtCode) => {
    await new Promise(resolve => setTimeout(resolve, 50));
    
    return wardsArray
        .filter(w => w.parent_code === districtCode) // Lọc các xã thuộc huyện
        .map(ward => ({
            label: ward.name_with_type, // Ví dụ: "Phường Phúc Xá"
            value: ward.code,          // Ví dụ: "00001"
        }));
};