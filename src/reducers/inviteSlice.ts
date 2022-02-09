import {AnyAction, createSlice, PayloadAction, ThunkAction} from '@reduxjs/toolkit'
import {RootState} from "../store";
import {
    collection,
    DocumentData,
    getDocs,
    getFirestore,
    query,
    where,
    documentId, getDoc, doc
} from 'firebase/firestore';

interface InvUsersEntry {
    name: string;
    surname: string;
    avatarUrl: string;
    id: string;
}

export type InvUsers = InvUsersEntry[];

interface InvUserState {
    invUsers: InvUsers | null;
}

const initialState: InvUserState = {
    invUsers: null,
}

export const inviteSlice = createSlice({
    name: 'invites',
    // `createSlice` will infer the state type from the `initialState` argument
    initialState,
    reducers: {
        fetchInviteData: (state, action: PayloadAction<InvUsers>) => {
            return {
                ...state,
                invUsers: action.payload,
            }
        }
    },
})

export function fetchInviteData(userId: string): ThunkAction<Promise<void>, RootState, unknown, AnyAction> {
    return async function fetchInviteData(dispatch) {
        const db = getFirestore();
        const docSnapshot = await getDoc(doc(collection(db, 'users'), userId));
        const data = docSnapshot.data() as DocumentData;
        if (data.dateOfBirth !== undefined && data.dateOfBirth !== null)
            data.dateOfBirth = (data.dateOfBirth.toDate() as Date).getTime();

        const chunks: string[][] = [];

        if(data.invites){
            for (let i = 0; i < data.invites.length; i += 10) {
                chunks.push(data.invites.slice(i, i + 10));
            }
        }



        const userChunks = await Promise.all(chunks.map(async (chunk) => {
            const docs = await getDocs(query(collection(db, 'users'), where(documentId(), 'in', chunk)));
            return docs.docs.map((docSnapshot) => {
                const data = docSnapshot.data()!;
                if(data.dateOfBirth) {
                    data.dateOfBirth = data.dateOfBirth.toDate().getTime();
                }
                if (data.avatarUrl === "")
                    data.avatarUrl = "https://firebasestorage.googleapis.com/v0/b/projekt-kolarstwo.appspot.com/o/avatars%2Fdefault.png?alt=media&token=f1498949-47e5-4af3-962d-c0290685c66c";

                const array = ({
                    ...data,
                    id: docSnapshot.id,
                });
                return array;
            });
        }));

        const users = userChunks.flat();

        console.log(users);

        dispatch({type: 'invites/fetchInviteData', payload: users});

    }
}


// Other code such as selectors can use the imported `RootState` type
export const selectInvites = (state: RootState) => state.invites.invUsers;

export default inviteSlice.reducer