import {applyMiddleware, configureStore} from '@reduxjs/toolkit'
import auth from './reducers/authSlice';
import stats from './reducers/statsSlice';
import tracks from './reducers/tracksSlice';
import ranks from './reducers/rankSlice';
import trainings from './reducers/trainingSlice';
import invites from './reducers/inviteSlice';
import friends from './reducers/friendsSlice';
import chats from './reducers/chatsSlice';
import thunkMiddleware from 'redux-thunk';
import achievements from './reducers/achievementsSlice';
import { ranksSlice } from './reducers/rankSlice';

const composedEnhancer = applyMiddleware(thunkMiddleware)

export const store = configureStore({
    reducer: {
        auth: auth,
        stats: stats,
        tracks: tracks,
        ranks:ranks,
        trainings: trainings,
        invites: invites,
        friends: friends,
        chats: chats,
        achievements: achievements
    },
    enhancers: [composedEnhancer]
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch