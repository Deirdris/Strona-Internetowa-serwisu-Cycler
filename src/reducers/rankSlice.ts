import {AnyAction, createSlice, PayloadAction, ThunkAction} from '@reduxjs/toolkit'
import {RootState} from "../store";
import {collection, doc, DocumentData, getDoc, getDocs, getFirestore, query, FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions} from 'firebase/firestore';
import firebase from "firebase/compat";

interface BaseRanks {
    id:number;
    distance: number;
    duration: number;
    highest_velocity: number;
    user_id: string;
    user_name: string;
    avg_velocity: number;
    avatarUrl: string;
}
type Periods = "distance" | "highest_velocity" |"avg_velocity";
export type Rank_Type = Record<Periods,BaseRanks>

export type Ranks = BaseRanks[];

interface RankState {
    ranks: Ranks | null;
}

const initialState: RankState = {
    ranks: null,
}

export const ranksSlice = createSlice({
    name: 'ranks',
    // `createSlice` will infer the state type from the `initialState` argument
    initialState,
    reducers: {
        fetchRankData: (state, action: PayloadAction<Ranks>) => {
            return {
                ...state,
                ranks: action.payload,
            }
        }
    },
})

const rankConverter = {
    toFirestore(rank: BaseRanks) {
        return {
            ...rank,
            
        };
    },
    fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): BaseRanks {
        const rank = snapshot.data();
        return rank as BaseRanks;
    }
} as FirestoreDataConverter<BaseRanks>;

export function fetchRankData(): ThunkAction<Promise<void>, RootState, unknown, AnyAction> {
    return async function fetchRankData(dispatch) {
        const db = getFirestore();
        const querySnapshot = await getDocs(query(collection(db, 'ranking')).withConverter(rankConverter));

        dispatch({type: 'ranks/fetchRankData', payload: querySnapshot.docs.map((e) => e.data())});
    }
}

// Other code such as selectors can use the imported `RootState` type
export const selectRanks = (state: RootState) => state.ranks.ranks?.map((ranks) => {
    return {
        ...ranks,
        
    } as BaseRanks
})!;

export default ranksSlice.reducer