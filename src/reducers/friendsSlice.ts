import {AnyAction, createSlice, PayloadAction, ThunkAction} from '@reduxjs/toolkit'
import {RootState} from "../store";
import {
    collection,
    DocumentData,
    getDocs,
    getFirestore,
    query,
    where,
    documentId, QueryDocumentSnapshot, SnapshotOptions, FirestoreDataConverter, getDoc, doc
} from 'firebase/firestore';
import moment, {Moment} from "moment";
import {fetchChats} from "./chatsSlice";

export interface BaseFriend {
    name: string;
    surname: string;
    avatarUrl: string;
    id: string;
    weight: number;
    height: number;
    gender: string;
}

export interface FriendsEntry extends BaseFriend {
    dateOfBirth: number;
}

export interface FriendWithDate extends BaseFriend {
    dateOfBirth: Moment;
}

export type Friends = FriendsEntry[];

interface FriendsState {
    friends: Friends | [];
}

const initialState: FriendsState = {
    friends: [],
}

const friendConverter = {
    toFirestore(friend: FriendsEntry) {
        return {
            ...friend,
            dateOfBirth: new Date(friend.dateOfBirth),
        };
    },
    fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): FriendsEntry {
        const friend = snapshot.data();
        friend.dateOfBirth = friend.dateOfBirth.toDate().getTime();
        return friend as FriendsEntry;
    }
} as FirestoreDataConverter<FriendsEntry>;

export const friendsSlice = createSlice({
    name: 'friends',
    // `createSlice` will infer the state type from the `initialState` argument
    initialState,
    reducers: {
        fetchFriendsData: (state, action: PayloadAction<Friends>) => {
            return {
                ...state,
                // friends: [...(state.friends ?? []), ...action.payload],
                friends: action.payload,
            }
        }
    },
})

export function fetchFriendsData(userId: string): ThunkAction<Promise<void>, RootState, unknown, AnyAction> {
    return async function fetchFriendsData(dispatch, getState) {
        const db = getFirestore();
        const docSnapshot = await getDoc(doc(collection(db, 'users'), userId));
        const data = docSnapshot.data() as DocumentData;
        if(data.dateOfBirth !== undefined && data.dateOfBirth !== null)
            data.dateOfBirth = (data.dateOfBirth.toDate() as Date).getTime();

        const chunks: string[][] = [];
        let friends = getState().friends.friends;
        if(data.friends){

            friends = friends.filter((friend) => data.friends.includes(friend.id));

            data.friends = data.friends.filter((id: string) => !friends.some((friend) => friend.id === id));


            for (let i = 0; i < data.friends.length; i += 10) {
                chunks.push(data.friends.slice(i, i + 10));
            }
        }


            const friendChunks = await Promise.all(chunks.map(async (chunk) => {
                const docs = await getDocs(query(collection(db, 'users'), where(documentId(), 'in', chunk)).withConverter(friendConverter));
                await dispatch(fetchChats(chunk));
                return docs.docs.map((docSnapshot) => {
                    const data = docSnapshot.data()!;

                    if(data.avatarUrl === "")
                        data.avatarUrl = "https://firebasestorage.googleapis.com/v0/b/projekt-kolarstwo.appspot.com/o/avatars%2Fdefault.png?alt=media&token=f1498949-47e5-4af3-962d-c0290685c66c";

                    const array = ({
                        ...data,
                        id: docSnapshot.id,
                    });
                    return array;
                });
            }));


            const newFriends = friendChunks.flat();
            dispatch({type: 'friends/fetchFriendsData', payload: [...friends, ...newFriends]});
    }
}


// Other code such as selectors can use the imported `RootState` type
export const selectFriends = (state: RootState) => state.friends.friends?.map((friend) => {
    return {
        ...friend,
        dateOfBirth: moment(friend.dateOfBirth),
    } as FriendWithDate
})!;

export default friendsSlice.reducer
