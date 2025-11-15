import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  // `cartItems` sẽ là mảng chứa các sản phẩm trong giỏ hàng của "khách"
  cartItems: [],
}

export const cartSlice = createSlice({
  name: 'cart', // Tên của slice này là 'cart'
  initialState,
  reducers: {
    
    /**
     * Action: Thêm sản phẩm vào giỏ (hoặc tăng số lượng)
     * payload: { product: 'id...', name: '...', size: 'M', quantity: 1, price: 150000, ... }
     */
    addToCart: (state, action) => {
      const newItem = action.payload;
      
      // Tìm xem sản phẩm (với đúng size đó) đã có trong giỏ chưa
      const existingItem = state.cartItems.find(
        (item) => item.product === newItem.product && item.size === newItem.size
      );

      if (existingItem) {
        // Nếu đã có, chỉ tăng số lượng
        existingItem.quantity += newItem.quantity;
      } else {
        // Nếu chưa có, thêm mới vào mảng
        state.cartItems.push(newItem);
      }
    },

    /**
     * Action: Xóa sản phẩm khỏi giỏ
     * payload: { product: 'id...', size: 'M' }
     */
    removeFromCart: (state, action) => {
      const { product, size } = action.payload;
      state.cartItems = state.cartItems.filter(
        (item) => !(item.product === product && item.size === size)
      );
    },

    /**
     * Action: Thay đổi số lượng của một sản phẩm
     * payload: { product: 'id...', size: 'M', quantity: 5 }
     */
    changeQuantity: (state, action) => {
      const { product, size, quantity } = action.payload;
      const itemToUpdate = state.cartItems.find(
        (item) => item.product === product && item.size === size
      );
      if (itemToUpdate) {
        itemToUpdate.quantity = quantity;
      }
    },
    
    /**
     * Action: Xóa sạch giỏ hàng (sẽ dùng khi đăng nhập hoặc thanh toán xong)
     */
    clearCart: (state) => {
        state.cartItems = [];
    },

    /**
     * Action: Thay thế hoàn toàn giỏ hàng hiện tại.
     * Dùng để "bơm" (rehydrate) giỏ hàng từ API (database) vào.
     * payload: là mảng [items]
     */
    setCart: (state, action) => {
      state.cartItems = action.payload;
    }
  },
})

// Export các actions để component có thể gọi
export const { addToCart, removeFromCart, changeQuantity, clearCart, setCart } = cartSlice.actions

export default cartSlice.reducer