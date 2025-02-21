import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
    name:'notification',
    initialState:{
        likeNotification:[], // [1,2,3]
    },
    reducers:{
        setLikeNotification:(state,action)=>{
            if(action.payload.type === 'like'){
                state.likeNotification.push(action.payload);
            }else if(action.payload.type === 'dislike'){
                state.likeNotification = state.likeNotification.filter((item)=> item.userId !== action.payload.userId);
            }
        }
    }
});
export const {setLikeNotification} = notificationSlice.actions;
export default notificationSlice.reducer;
