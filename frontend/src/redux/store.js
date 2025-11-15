import { configureStore, combineReducers } from '@reduxjs/toolkit'
import counterReducer from './slides/counterSlide'
import userReducer from './slides/userSlide'
import cartReducer from './slides/cartSlide' //1. Import cart reducer mới

// export const store = configureStore({
//   reducer: {
//     counter: counterReducer,
//     user: useReducer
//   },
// })

import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage' // Dùng localStorage

// 2. TẠO CẤU HÌNH PERSIST
const persistConfig = {
  key: 'root', // Key cho localStorage
  version: 1,
  storage,
  //  QUAN TRỌNG: Chỉ lưu (whitelist) `cart`.
  // Chúng ta KHÔNG lưu `user` vì bạn đang tự quản lý user bằng token/API
  whitelist: ['cart'] 
}

// 3. GỘP CÁC REDUCER LẠI
const rootReducer = combineReducers({
  user: userReducer,
  cart: cartReducer, // Thêm cart vào
  counter: counterReducer,
})

// 4. "BỌC" REDUCER GỐC BẰNG `persistReducer`
const persistedReducer = persistReducer(persistConfig, rootReducer)

// 5. CẤU HÌNH STORE DÙNG `persistedReducer`
export const store = configureStore({
  reducer: persistedReducer, // Dùng reducer đã bọc
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Bỏ qua các action type này của redux-persist (để tránh lỗi console)
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

// ✅ 6. EXPORT `persistor`
export const persistor = persistStore(store)
