const qs = require('qs');
const crypto = require('crypto');
const moment = require('moment');
const Order = require('../models/OrderModel');
require('dotenv').config();

function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

const createPaymentUrl = (req) => {
    return new Promise((resolve, reject) => {
        try {
            process.env.TZ = 'Asia/Ho_Chi_Minh';
            const date = new Date();
            const createDate = moment(date).format('YYYYMMDDHHmmss');
            const expireDate = moment(date).add(15, 'minutes').format('YYYYMMDDHHmmss');
            
            let ipAddr = req.headers['x-forwarded-for'] ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                req.connection.socket.remoteAddress;

            if (ipAddr === '::1') ipAddr = '127.0.0.1';

            const { amount, orderId, bankCode, language } = req.body;
            
            // AN TOÀN: Đảm bảo số tiền là số nguyên
            const amountVNP = Math.round(Number(amount) * 100);

            const tmnCode = process.env.VNP_TMN_CODE;
            const secretKey = process.env.VNP_HASH_SECRET;
            let vnpUrl = process.env.VNP_URL;
            const returnUrl = process.env.VNP_RETURN_URL;

            let vnp_Params = {};
            vnp_Params['vnp_Version'] = '2.1.0';
            vnp_Params['vnp_Command'] = 'pay';
            vnp_Params['vnp_TmnCode'] = tmnCode;
            vnp_Params['vnp_Locale'] = language || 'vn';
            vnp_Params['vnp_CurrCode'] = 'VND';
            vnp_Params['vnp_TxnRef'] = orderId;
            vnp_Params['vnp_OrderInfo'] = 'Thanh toan don hang ' + orderId;
            vnp_Params['vnp_OrderType'] = 'other';
            vnp_Params['vnp_Amount'] = amountVNP;
            vnp_Params['vnp_ReturnUrl'] = returnUrl;
            vnp_Params['vnp_IpAddr'] = ipAddr;
            vnp_Params['vnp_CreateDate'] = createDate;
            vnp_Params['vnp_ExpireDate'] = expireDate;

            if (bankCode) vnp_Params['vnp_BankCode'] = bankCode;

            vnp_Params = sortObject(vnp_Params);

            const signData = qs.stringify(vnp_Params, { encode: false });
            const hmac = crypto.createHmac("sha512", secretKey);
            const signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest("hex"); 
            
            vnp_Params['vnp_SecureHash'] = signed;
            vnpUrl += '?' + qs.stringify(vnp_Params, { encode: false });

            console.log("🔗 LINK VNPAY TẠO RA:", vnpUrl);

            resolve({ status: 'OK', message: 'Success', url: vnpUrl });
        } catch (e) {
            reject(e);
        }
    });
};

const vnpayReturn = (vnp_Params) => {
    return new Promise(async (resolve, reject) => {
        try {
            console.log("🔍 [VNPAY RETURN] Bắt đầu xác thực...");
            
            let secureHash = vnp_Params['vnp_SecureHash'];
            let orderId = vnp_Params['vnp_TxnRef'];
            let rspCode = vnp_Params['vnp_ResponseCode'];

            delete vnp_Params['vnp_SecureHash'];
            delete vnp_Params['vnp_SecureHashType'];

            let sortedParams = sortObject(vnp_Params);
            let secretKey = process.env.VNP_HASH_SECRET;
            let signData = qs.stringify(sortedParams, { encode: false });
            let hmac = crypto.createHmac("sha512", secretKey);
            let signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest("hex");

            if (secureHash === signed) {
                console.log("✅ Checksum Hợp lệ!");
                
                if (rspCode === '00') {
                    console.log("✅ Giao dịch thành công! Đang cập nhật đơn hàng:", orderId);
                    
                    // CẬP NHẬT DB
                    const updatedOrder = await Order.findByIdAndUpdate(orderId, { 
                        isPaid: true, 
                        paidAt: new Date(),
                        paymentMethod: 'vnpay' 
                    }, { new: true });

                    if (updatedOrder) {
                        console.log("🎉 UPDATE THÀNH CÔNG! isPaid:", updatedOrder.isPaid);
                        resolve({ status: 'OK', message: 'Success', data: { orderId } });
                    } else {
                        console.log("❌ UPDATE THẤT BẠI: Không tìm thấy Order ID trong DB!");
                        resolve({ status: 'ERR', message: 'Order not found', data: { orderId } });
                    }
                } else {
                    console.log("❌ Giao dịch thất bại trên VNPay. Mã lỗi:", rspCode);
                    resolve({ status: 'ERR', message: 'Fail', data: { orderId } });
                }
            } else {
                console.log("❌ Checksum KHÔNG KHỚP!");
                console.log("Server Hash:", signed);
                console.log("VNPay Hash:", secureHash);
                resolve({ status: 'ERR', message: 'Invalid Signature' });
            }
        } catch (e) {
            console.error("❌ LỖI SERVER:", e);
            reject(e);
        }
    });
};

module.exports = { createPaymentUrl, vnpayReturn };