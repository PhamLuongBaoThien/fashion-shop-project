import { configureStore } from '@reduxjs/toolkit'
import couterReducer from './slides/counterSlide'

export const store = configureStore({
  reducer: {
    counter: couterReducer,
  },
})