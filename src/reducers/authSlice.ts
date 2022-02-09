import {AnyAction, createSlice, PayloadAction, ThunkAction} from '@reduxjs/toolkit'
import {RootState} from "../store";
import {collection, doc, DocumentData, getDoc, getDocs, getFirestore, query, FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions} from 'firebase/firestore';
import moment, {Moment} from "moment";

interface AppUser {
    name: string;
    surname: string;
    nameNS: string;
    nameSN: string;
    height: number;
    weight: number;
    gender: string;
    isCompleted: boolean;
    avatarUrl: string;
    bmiValue: number;
    bmiDescription: string;
    invites: Array<string>;
    friends: Array<string>;

}

export interface AppUserEntry extends AppUser{
    dateOfBirth: number;
}

export interface AppUserWithDate extends AppUser{
    dateOfBirth: Moment;
}

interface AuthState {
    user: AppUserEntry | null;
}

const initialState: AuthState = {
    user: null,
}

export const authSlice = createSlice({
    name: 'auth',
    // `createSlice` will infer the state type from the `initialState` argument
    initialState,
    reducers: {
        fetchUserData: (state, action: PayloadAction<AppUserEntry>) => {
            return {
                ...state,
                user: action.payload,
            }
        }
    },
})

export function fetchUserData(userId: string): ThunkAction<Promise<void>, RootState, unknown, AnyAction> {
    return async function fetchUserData(dispatch) {
        const db = getFirestore();
        const docSnapshot = await getDoc(doc(collection(db, 'users'), userId));
        const data = docSnapshot.data() as DocumentData;

        if(data.dateOfBirth !== undefined && data.dateOfBirth !== null)
            data.dateOfBirth = (data.dateOfBirth.toDate() as Date).getTime();
        if(data.avatarUrl === "")
            data.avatarUrl = "https://firebasestorage.googleapis.com/v0/b/projekt-kolarstwo.appspot.com/o/avatars%2Fdefault.png?alt=media&token=f1498949-47e5-4af3-962d-c0290685c66c";


        dispatch({type: 'auth/fetchUserData', payload: data});
    }
}

//export const { increment, decrement, incrementByAmount } = authSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const selectUser = (state: RootState) => {
    return {
        ...state.auth.user,
        dateOfBirth: moment(state.auth.user?.dateOfBirth),
    } as AppUserWithDate
};

export default authSlice.reducer