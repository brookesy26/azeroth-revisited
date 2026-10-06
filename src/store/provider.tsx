"use client";
import { configureStore, createSlice } from "@reduxjs/toolkit";
import { Provider, useDispatch, useSelector } from "react-redux";
import { useState } from "react";

const preferences = createSlice({
  name: "preferences",
  initialState: { sidebarCollapsed: false },
  reducers: {
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
  },
});
export const { toggleSidebar } = preferences.actions;
const makeStore = () =>
  configureStore({ reducer: { preferences: preferences.reducer } });
type Store = ReturnType<typeof makeStore>;
export const useAppDispatch = useDispatch.withTypes<Store["dispatch"]>();
export const useAppSelector =
  useSelector.withTypes<ReturnType<Store["getState"]>>();
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState(makeStore);
  return <Provider store={store}>{children}</Provider>;
}
