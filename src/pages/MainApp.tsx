import React, {useEffect, useState} from 'react';
import WelcomePage from "./WelcomePage";
import RankingPage from "./RankingPage"
import {Route, Switch, useHistory} from "react-router-dom";
import {getAuth} from "firebase/auth";
import {CircularProgress} from "@mui/material";
import {useDispatch} from "react-redux";
import {fetchUserData} from "../reducers/authSlice";
import FriendsSection from "./FriendsSection";
import StartingSection from "./StartingSection";
import ProfilePage from "./ProfilePage";

function MainApp() {

    const auth = getAuth();
    const user = auth.currentUser;
    const history = useHistory();
    const [authChecked, setAuthChecked] = useState(false);
    const dispatch = useDispatch();
    useEffect(() => {
        const listener = auth.onAuthStateChanged((user) => {
            if (user === null) {
                history.replace('/');
                setAuthChecked(true);
                return;
            } else {
                (dispatch(fetchUserData(user.uid)) as unknown as Promise<void>).then(() => {
                    setAuthChecked(true);
                });
            }
            listener();
        });
    }, []);

    const whichPage = [
        {
            path: "/",
            exact: true,
            component: WelcomePage
        },
        {
            path: "/znajomi",
            component: FriendsSection
        },
        {
            path: "/strona-główna",
            component: StartingSection
        },
        {
            path: "/ranking",
            component: RankingPage
        },
        {
            path: "/profil",
            component: ProfilePage
        },
    ];

    return (
        <>
            {!authChecked ? <div style={{height: '100vh', width: '100vw', display: 'grid', placeItems: 'center',}}>
                <CircularProgress/></div> : <Switch>
                {whichPage.map((route, i) => (
                    <Route key={i} path={route.path} component={route.component} exact={route.exact}/>
                ))}
            </Switch>}
        </>
    );


}

export default MainApp;