import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore } from "redux-persist";
import authReducer from "./authSlice";

import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import postReducer from "./postSlice";
import notificationReducer from "./notificationSlide";
import conversationReducer from "./conversationSlice";
import chatReducer from "./chatSlice";
const persistConfig = {
  key: "root",
  version: 1,
  storage,
};

const rootReducer = combineReducers({
  auth: authReducer,
  post: postReducer,
  notification: notificationReducer,
  conversation: conversationReducer,
  chat: chatReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});
const persistor = persistStore(store);
export { store, persistor };
