import {AnyAction, createSlice, PayloadAction, ThunkAction} from '@reduxjs/toolkit'
import {RootState} from "../store";
import {collection, doc, DocumentData, getDoc, setDoc, getDocs, getFirestore, query, FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions, orderBy} from 'firebase/firestore';
import firebase from "firebase/compat";
import moment, {Moment} from "moment";

export interface AchInfoEntry {
    comment: string;
    description: string;
    goal: number;
    idAchievement: number;
    name: string;
}

export interface AchProgressEntry {
    allCompleted: boolean;
    progress: number;
    stageId: number;
}


type PeriodsInfo = 'achDistance' | 'achSpeed' | 'achTime' | 'achCalories';
export type AchiInfo = Record<PeriodsInfo, AchInfoEntry[]>

type PeriodsProgress = 'distance' | 'speed' | 'time' | 'calories';
export type AchProgress = Record<PeriodsProgress, AchProgressEntry>

export interface Achievements {
    info: AchiInfo;
    progress: AchProgress;

}
type Period = 'info' | 'progress';

interface AchievementsState {
    achievements: Achievements | null;
    isFetched: boolean;
}

const initialState: AchievementsState = {
    achievements:  null,
    isFetched: false
}

export const achievementsSlice = createSlice({
    name: 'achievements',
    // `createSlice` will infer the state type from the `initialState` argument
    initialState,
    reducers: {
        fetchAchievementsData: (state, action: PayloadAction<Achievements>) => {
            return {
                ...state,
                achievements:  action.payload,
                isFetched: true

            }
        },

    },
})

function sortAchievements(achCategory: AchInfoEntry[], stageId: number) {

    var fd: AchInfoEntry[] = [];

    for(var i = stageId; i< achCategory.length; i++)
        fd.push(achCategory[i]);

    for(var i = stageId-1; i >= 0; i--)
        fd.push(achCategory[i]);

    return fd;
}

export function fetchAchievementsData(userId: string): ThunkAction<Promise<void>, RootState, unknown, AnyAction> {
    return async function fetchAchievementsData(dispatch,getState) {
        if(getState().achievements.isFetched)
            return;

        const db = getFirestore();

        var docSnapshot = await getDoc(doc(collection(db, `users/${userId}/achievements`), '_'));

        if((docSnapshot.data() as DocumentData)=== undefined || (docSnapshot.data() as DocumentData)=== null) {
            var progressData = {
                allCompleted: false,
                progress: 0,
                stageId: 0
            };
            await setDoc(doc(collection(db, `users/${userId}/achievements/`), "_"), {

                calories: { ...progressData},
                distance: { ...progressData},
                speed: { ...progressData},
                time: { ...progressData}


            });

            docSnapshot = await getDoc(doc(collection(db, `users/${userId}/achievements`), '_'));
        }


        const achProgress = docSnapshot.data() as DocumentData;

        const querySnapDistance = await getDocs(query(collection(db, `achievements/distance/_`), orderBy("idAchievement")));
        const querySnapSpeed = await getDocs(query(collection(db, `achievements/speed/_`), orderBy("idAchievement")));
        const querySnapTime = await getDocs(query(collection(db, `achievements/time/_`), orderBy("idAchievement")));
        const querySnapCalories = await getDocs(query(collection(db, `achievements/calories/_`), orderBy("idAchievement")));

        const achInfo = {
            achDistance:  querySnapDistance.docs.map((e) => e.data()),
            achSpeed: querySnapSpeed.docs.map((e) => e.data()),
            achTime: querySnapTime.docs.map((e) => e.data()),
            achCalories: querySnapCalories.docs.map((e) => e.data())
        }

        const data = {
            info:  achInfo,
            progress: achProgress
        }


        dispatch({type: 'achievements/fetchAchievementsData', payload: data});
    }
}

// Other code such as selectors can use the imported `RootState` type
//export const selectAchievements = (state: RootState) => state.achievements.achievements!;



export const selectAchievements = (state: RootState) => {

    if(state.achievements.achievements! != null) {

        const achIfo = {
            achDistance:  sortAchievements(state.achievements.achievements!.info.achDistance, state.achievements.achievements!.progress.distance.stageId),
            achSpeed: sortAchievements(state.achievements.achievements!.info.achSpeed, state.achievements.achievements!.progress.speed.stageId),
            achTime: sortAchievements(state.achievements.achievements!.info.achTime, state.achievements.achievements!.progress.time.stageId),
            achCalories: sortAchievements(state.achievements.achievements!.info.achCalories, state.achievements.achievements!.progress.calories.stageId),
        }

        const temp = {
            info:  achIfo,
            progress: state.achievements.achievements.progress
        }


        return temp;
    }
    else
        return state.achievements.achievements!;
}

export default achievementsSlice.reducer