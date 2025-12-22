const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const sendOrderConfirmationEmail = async (email, orderId, orderItems, totalPrice) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.MAIL_ACCOUNT,
            pass: process.env.MAIL_PASSWORD,
        },
    });

    const orderIdStr = orderId.toString();
    
    // --- 1. CHUẨN BỊ DANH SÁCH ẢNH ĐÍNH KÈM ---
    let listItemRows = '';
    const attachments = [];

    orderItems.forEach((order, index) => {
        // Tạo ID duy nhất cho mỗi ảnh (cid)
        // const cid = `product_image_${index}`; 
        
        // // Thêm vào danh sách đính kèm nếu có ảnh
        // if (order.image) {
        //     attachments.push({
        //         filename: `product_${index}.jpg`,
        //         path: order.image, // Nodemailer sẽ tự tải ảnh từ URL này
        //         cid: cid // ID để tham chiếu trong HTML
        //     });
        // }

        // Tạo hàng bảng HTML
        listItemRows += `
            <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; width: 70px;">
                    <img src="${order.image}" alt="${order.name}" width="60" height="60" style="border-radius: 4px; object-fit: cover; display: block;" />
                </td>
                <td style="padding: 10px 10px; border-bottom: 1px solid #eee;">
                    <div style="font-weight: bold; font-size: 14px; color: #333;">${order.name}</div>
                    <div style="font-size: 12px; color: #777;">Size: ${order.size} | SL: ${order.quantity}</div>
                </td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">
                    <div style="font-weight: bold; color: #fa8c16;">${order.price.toLocaleString('vi-VN')}đ</div>
                </td>
            </tr>
        `;
    });

    // --- 2. GỬI MAIL VỚI ATTACHMENTS ---
    const info = await transporter.sendMail({
        from: `"DE Store" <${process.env.MAIL_ACCOUNT}>`,
        to: email,
        subject: `Xác nhận đơn hàng #${orderIdStr.slice(-6).toUpperCase()} tại Thien Store`,
        html: `
            <div style="background-color: #f5f5f5; padding: 20px; font-family: Arial, sans-serif;">
                <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                    
                    <div style="background-color: #fa8c16; padding: 20px; text-align: center;">
                        <h2 style="color: #ffffff; margin: 0;">Cảm ơn bạn đã đặt hàng!</h2>
                    </div>
                    
                    <div style="padding: 20px;">
                        <p>Xin chào,</p>
                        <p>DE Store đã nhận được đơn hàng của bạn và đang tiến hành xử lý.</p>
                        
                        <div style="margin-top: 20px;">
                            <h3 style="border-bottom: 2px solid #fa8c16; padding-bottom: 10px; color: #333;">
                                Đơn hàng #${orderIdStr.slice(-6).toUpperCase()}
                            </h3>
                            
                            <table style="width: 100%; border-collapse: collapse;">
                                ${listItemRows}
                            </table>
                            
                            <div style="text-align: right; margin-top: 20px; font-size: 16px;">
                                Tổng thanh toán: <strong style="color: #fa8c16; font-size: 20px;">${totalPrice.toLocaleString('vi-VN')}đ</strong>
                            </div>
                        </div>
                        
                        <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; font-size: 12px; color: #999; text-align: center;">
                            <p>Mọi thắc mắc xin liên hệ hotline: <strong>0343613222</strong></p>
                            <p>DE Store - Thời trang phong cách</p>
                        </div>
                    </div>
                </div>
            </div>
        `,
        // attachments: attachments // Đính kèm mảng ảnh vào mail
    });

    return info;
}

module.exports = {
    sendOrderConfirmationEmail
}