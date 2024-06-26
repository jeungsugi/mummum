import { createSlice } from "@reduxjs/toolkit";
import addDogSelect from "../../thunks/dogthunk/addDogThunk";

interface userDogData {
  userUid: string;
  dogSelect: string;
}

const initialState: userDogData = {
  userUid: "",
  dogSelect: "",
};

const addDogSlice = createSlice({
  name: "addDog",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addDogSelect.pending, () => {
        console.log(`비동기 요청 중`);
      })
      .addCase(addDogSelect.fulfilled, () => {
        console.log(`비동기 요청 성공`);
      })
      .addCase(addDogSelect.rejected, () => {
        console.log(`비동기 요청 실패`);
      });
  },
});
export default addDogSlice.reducer;
