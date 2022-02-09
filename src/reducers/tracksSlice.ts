import {AnyAction, createSlice, PayloadAction, ThunkAction} from '@reduxjs/toolkit'
import {RootState} from "../store";
import {collection, doc, DocumentData, getDoc, getDocs, getFirestore, query, FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions} from 'firebase/firestore';
import firebase from "firebase/compat";


interface BaseTracks {
    name: string;
    description: string;
    difficult: string;
    distance: number;
    finish: string;
    photo_url: string;
    start: string;
    time: string;
    url: string;
}

export type Tracks = BaseTracks[];

interface TrackState {
    tracks: Tracks | null;
}

const initialState: TrackState = {
    tracks: null,
}

export const tracksSlice = createSlice({
    name: 'tracks',
    // `createSlice` will infer the state type from the `initialState` argument
    initialState,
    reducers: {
        fetchTrackData: (state, action: PayloadAction<Tracks>) => {
            return {
                ...state,
                tracks: action.payload,
            }
        }
    },
})

const trackConverter = {
    toFirestore(track: BaseTracks) {
        return {
            ...track,
            
        };
    },
    fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): BaseTracks {
        const track = snapshot.data();
        return track as BaseTracks;
    }
} as FirestoreDataConverter<BaseTracks>;

export function fetchTrackData(): ThunkAction<Promise<void>, RootState, unknown, AnyAction> {
    return async function fetchTrackData(dispatch) {
        const db = getFirestore();
        const querySnapshot = await getDocs(query(collection(db, 'track')).withConverter(trackConverter));

        dispatch({type: 'tracks/fetchTrackData', payload: querySnapshot.docs.map((e) => e.data())});
    }
}

// Other code such as selectors can use the imported `RootState` type
export const selectTracks = (state: RootState) => state.tracks.tracks?.map((tracks) => {
    return {
        ...tracks,
        
    } as BaseTracks
})!;

export default tracksSlice.reducer