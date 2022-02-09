import React, {HTMLAttributes, useEffect, useState} from 'react';
import {getAuth, User} from "firebase/auth";
import {
    Button,
    Tooltip,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    Divider,
    ListItemIcon,
    Box,
    Grid,
    Stack, ToggleButtonGroup, ToggleButton, makeStyles, styled, CircularProgress
} from "@mui/material";
import Logout from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import TimerIcon from '@mui/icons-material/Timer';
import SpeedIcon from '@mui/icons-material/Speed';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import EmailIcon from '@mui/icons-material/Email';
import CakeIcon from '@mui/icons-material/Cake';
import HeightIcon from '@mui/icons-material/Height';
import MonitorWeightOutlinedIcon from '@mui/icons-material/MonitorWeightOutlined';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import WcIcon from '@mui/icons-material/Wc';
import {deepOrange, grey} from '@mui/material/colors';
import {useHistory} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {selectUser} from "../reducers/authSlice";
import banner from '../img/background.jpg'

import '../styles/ProfilePage.scss';
import {VictoryAxis, VictoryBar, VictoryChart, VictoryLabel} from "victory";
import {fetchStatsData, selectStats, GlobalStatsEntry, Stats} from "../reducers/statsSlice";
//import {fetchAchProgressData, selectAchProgress, AchProgressEntry, AchProgress} from "../reducers/achievementsProgressSlice";
//import {fetchAchievementsData, selectAchievements, AchievementEntry} from "../reducers/achievementsInfoSlice";
import {fetchAchievementsData, selectAchievements, AchInfoEntry, AchProgressEntry, Achievements} from "../reducers/achievementsSlice";


import {AppDispatch} from "../store";
import {numberFormat} from "../methods/numberFormat";

import {Route, Link, Switch} from "react-router-dom";
import {
    Formik,
    Form,
    useField,
    Field,
    FieldConfig
} from 'formik';
import RadioGroup from '@mui/material/RadioGroup';
import * as Yup from "yup";
import { getDefaultCompilerOptions, isPropertySignature } from 'typescript';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';


import { useTheme } from '@mui/material/styles';
import SwipeableViews from 'react-swipeable-views';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Paper from '@mui/material/Paper';
import Pagination from '@mui/material/Pagination';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MenuList from '@mui/material/MenuList';
import ListItemText from '@mui/material/ListItemText';
import {fetchTrainingData, selectTrainings, trainingsSlice, TrainingWithDate} from "../reducers/trainingSlice";

import {
    arrayUnion,
    arrayRemove,
    collection,
    doc,
    getDocs,
    getFirestore,
    limit,
    query,
    setDoc,
    updateDoc,
    onSnapshot,
    where
} from "firebase/firestore";
import {fetchUserData} from "../reducers/authSlice";
import moment from "moment";
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';
import { Description } from '@mui/icons-material';
import { PortraitSharp } from '@material-ui/icons';
import Navbar from "./Navbar";
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject} from "firebase/storage";

const StyledToggleButtonGroupMenu = styled(ToggleButtonGroup)(({theme}) => ({
    '& .MuiToggleButton-root.Mui-selected': {
        color: '#64FFDAFF',
        borderLeft: "0.1rem solid #64FFDAFF",
        borderRight: "0.1rem solid #64FFDAFF"
    },
}));

const StyledToggleButtonGroupCategory = styled(ToggleButtonGroup)(({theme}) => ({
    '& .MuiToggleButton-root.Mui-selected': {
        background: '#19232b',
        color: '#64FFDAFF',
        borderBottom: "0.1rem solid #64FFDAFF",
    },
}));


function ProfilePage() {
    const history = useHistory();
    const auth = getAuth();
    const user = useSelector(selectUser);
    const [statsFetched, setStatsFetched] = useState(false);

    const [achievementsFetched, setAchievementsFetched] = useState(false);
    const dispatch = useDispatch<AppDispatch>();


    const stats = useSelector(selectStats);


    const [trainingsFetched, setTrainingsFetched] = useState(false);
    const trainings = useSelector(selectTrainings);


    const handleChangeee = (event: React.SyntheticEvent, newValue: string) => {
        if (newValue !== null)
            setWhichSection(newValue);


    };


    const achievements = useSelector(selectAchievements);

    const db = getFirestore();
    useEffect(() => {
        onSnapshot(collection(db, 'users'), () => {
            dispatch(fetchUserData(auth.currentUser!.uid)).then(() => {

            });
        });

        dispatch(fetchAchievementsData(auth.currentUser!.uid)).then(() => {

            setAchievementsFetched(true);
        });
        dispatch(fetchTrainingData(auth.currentUser!.uid, true)).then(() => {
            setTrainingsFetched(true);
        });
        dispatch(fetchStatsData(auth.currentUser!.uid)).then(() => {
            setStatsFetched(true);
        });

    }, []);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const [whichStats, setWhichStats] = useState<keyof Stats>('weekly');


    const handleChange = (
        event: React.MouseEvent<HTMLElement>,
        stats: keyof Stats | null,
    ) => {
        if (stats !== null) {
            setWhichStats(stats);
        }
    };

    const data = [
        {velocity: 1, value: 33},
        {velocity: 2, value: 31},
        {velocity: 3, value: 27},
        {velocity: 4, value: 25}
    ];

    console.log(stats);



    const [whichSection, setWhichSection] = useState('default');

    return (
        <>
            <Navbar />
            <section className="profileSection">
                <Grid container spacing={4}>
                    <Grid item xs={3}>
                        <Box sx={{display: 'flex', flexDirection: 'column'}}>
                            <div className="item miniprofile">
                                {statsFetched && achievementsFetched ?
                                    <Switch>

                                        <ProfileDataSection
                                            stats={stats}
                                            countAchievements={
                                                achievements.progress.distance.stageId+
                                                achievements.progress.speed.stageId+
                                                achievements.progress.time.stageId+
                                                achievements.progress.calories.stageId
                                            }
                                            isCompleted={user.isCompleted}/>
                                    </Switch>
                                    :
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        paddingTop: 4
                                    }}>
                                        <CircularProgress sx={{color: "#64FFDAFF"}} size={"2rem"}/>
                                    </Box>
                                }
                            </div>
                        </Box>
                    </Grid>
                    <Grid item xs={6}>
                        <Switch>
                            {(achievementsFetched && trainingsFetched)?
                                <CenterSection whichSection={whichSection} achievements={achievements} trainings={trainings} stats={stats}/>
                                :
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    paddingTop: 4,
                                }}>
                                    <CircularProgress sx={{color: "#64FFDAFF"}} size={"2rem"}/>
                                </Box>
                            }
                        </Switch>
                    </Grid>
                    <Grid item xs={3}>
                        <div className="item">
                            <Box sx={{display: 'flex', flexDirection: "column"}}>
                                <Box sx={{
                                    display: "flex",
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    paddingTop: 2,
                                    paddingBottom: 2,
                                    fontSize: '1.25rem',
                                    fontWeight: "bold",
                                    letterSpacing: 1,
                                    bgcolor: '#19232b'
                                }}>
                                    Menu
                                </Box>
                                <StyledToggleButtonGroupMenu
                                    className="section_menu"
                                    value={whichSection}
                                    exclusive
                                    onChange={handleChangeee}
                                >
                                    <ToggleButton  sx={{color: "white", fontWeight: "bold", letterSpacing: 1}} className="section_menu-option" value="default">Strona domyślna</ToggleButton>
                                    <ToggleButton  sx={{color: "white", fontWeight: "bold", letterSpacing: 1}} className="section_menu-option" value="achievements">Moje osiągnięcia</ToggleButton>
                                    <ToggleButton  sx={{color: "white", fontWeight: "bold", letterSpacing: 1}} className="section_menu-option" value="trainings">Moje treningi</ToggleButton>
                                </StyledToggleButtonGroupMenu>

                            </Box>
                        </div>
                    </Grid>
                </Grid>
            </section>
        </>
    );

}

function BeginProfileDataSection(props: any) {

    const user = useSelector(selectUser);
    const auth = getAuth();

    return <>
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Avatar  alt="Awatar" src={user.avatarUrl}  sx={{
                width: 80,
                height: 80,
                marginTop: -5,
                boxShadow: 3,
                border: 2,
                borderColor: 'text.primary',
            }}/>
        </Box>
        <div className="miniprofile-username">{user.name !== "" ? user.name + ' ' + user.surname : auth.currentUser!.email}</div>
        <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: 4
        }}>
            <Stack
                direction="row"
                divider={<Divider sx={{bgcolor: '#36454F'}} orientation="vertical"
                                  flexItem/>}
                spacing={2}
            >
                <div className="miniprofile-info">
                    <div className="miniprofile-info-row">
                        <div className="miniprofile-info-row-name">Treningi</div>
                        <div className="miniprofile-info-row-number">{
                             props.stats !== undefined ?
                             (props.stats!['global'] as
                                 GlobalStatsEntry).trainingCount
                             : 0
                        }</div>
                    </div>
                </div>
                <div className="miniprofile-info">
                    <div className="miniprofile-info-row">
                        <div className="miniprofile-info-row-name">Osiągnięcia</div>
                        <div className="miniprofile-info-row-number">
                            {props.countAchievements}
                        </div>
                    </div>
                </div>
                <div className="miniprofile-info">
                    <div className="miniprofile-info-row">
                        <div className="miniprofile-info-row-name">Znajomi</div>
                        <div className="miniprofile-info-row-number">{user.friends ? user.friends.length : '0'}</div>
                    </div>
                </div>
            </Stack>
        </Box>
        <Divider sx={{marginTop: 4, bgcolor: '#36454F'}} orientation="horizontal"/> </>

}

function ProfileDataSection(props: any) {

    if (props.location.hash === '#edycja') {
        return  <EditData/>;
    }
    else if(props.isCompleted) {
        return (
            <>

                <BeginProfileDataSection countAchievements={props.countAchievements} stats={props.stats} />
                <ShowData/>

            </>);
    }
    else {
        return(
            <>
                <BeginProfileDataSection countAchievements={props.countAchievements} stats={props.stats} />
                <NoData/>
            </>);
    }



}

function CenterSection(props: any) {


    if (props.whichSection === 'achievements') {
        return <AchievementsSection achievements={props.achievements} />
    }
    else if (props.whichSection === 'trainings')
        return  <TrainingsSection trainings={props.trainings} stats={props.stats} />;
    else
        return <DefaultSection
            achInfoDistance={props.achievements.info.achDistance.length != props.achievements.progress.distance.stageId ? props.achievements.info.achDistance[0] : "completed"}
            achProgDistance={props.achievements.progress.distance}
            achInfoSpeed={props.achievements.info.achSpeed.length != props.achievements.progress.speed.stageId ? props.achievements.info.achSpeed[0] : "completed"}
            achProgSpeed={props.achievements.progress.speed}
            achInfoTime={props.achievements.info.achTime.length != props.achievements.progress.time.stageId ? props.achievements.info.achTime[0] : "completed"}
            achProgTime={props.achievements.progress.time}
            achInfoCalories={props.achievements.info.achCalories.length != props.achievements.progress.calories.stageId ? props.achievements.info.achCalories[0] : "completed"}
            achProgCalories={props.achievements.progress.calories}
            stats={props.stats}
            trainings={[props.trainings[0],props.trainings[1], props.trainings[2], props.trainings[3]]}
            numberTrainings={props.trainings.length} />;


}

function AchievementsSection(props: any) {


    const [whichCategory, setWhichCategory] = useState('distance');
    const [info, setInfo] = useState(props.achievements.info.achDistance);
    const [progress, setProgress] = useState(props.achievements.progress.distance);
    const [unit, setUnit] = useState("km");

    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        if (newValue !== null) {
            setWhichCategory(newValue);
            switch(newValue) {
                case 'distance':
                    setInfo(props.achievements.info.achDistance);
                    setProgress(props.achievements.progress.distance);
                    setUnit("km");
                    break;
                case 'speed':
                    setInfo(props.achievements.info.achSpeed);
                    setProgress(props.achievements.progress.speed);
                    setUnit("km/h");
                    break;
                case 'time':
                    setInfo(props.achievements.info.achTime);
                    setProgress(props.achievements.progress.time);
                    setUnit("h");
                    break;
                case 'calories':
                    setInfo(props.achievements.info.achCalories);
                    setProgress(props.achievements.progress.calories);
                    setUnit("kcal");
                    break;
            }

        }

    };



    const theme = useTheme();


    return <>

        <div className="item margin_section">
            <Box sx={{display: 'flex', flexDirection: 'column'}}>

                <Box sx={{
                    display: "flex",
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingTop: 2,
                    paddingBottom: 2,
                    fontSize: '1.25rem',
                    fontWeight: "bold",
                    letterSpacing: 1,
                    bgcolor: '#19232b'
                }}>
                    Moje osiągnięcia
                </Box>
                <StyledToggleButtonGroupCategory
                    className="achievement-categoryNavigation"
                    value={whichCategory}
                    exclusive
                    onChange={handleChange}

                >
                    <ToggleButton className="achievement-categoryNavigation-option" sx={{color: "white"}} value="distance">Dystans</ToggleButton>
                    <ToggleButton className="achievement-categoryNavigation-option" sx={{color: "white"}} value="speed">Prędkość</ToggleButton>
                    <ToggleButton className="achievement-categoryNavigation-option" sx={{color: "white"}} value="time">Czas</ToggleButton>
                    <ToggleButton className="achievement-categoryNavigation-option" sx={{color: "white"}} value="calories">Kalorie</ToggleButton>
                </StyledToggleButtonGroupCategory>

                <ShowAchievements info={info} progress={progress} unit={unit}/>
            </Box>
        </div>
    </>

}

function DefaultSection(props: any) {

    return <>
        <Box sx={{display: 'flex', flexDirection: 'column'}}>
            <div className="item">

                <Box sx={{display: 'flex', flexDirection: "column"}}>
                    <Box sx={{
                        display: "flex",
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingTop: 2,
                        paddingBottom: 2,
                        fontSize: '1.25rem',
                        fontWeight: "bold",
                        letterSpacing: 1,
                        bgcolor: '#19232b'
                    }} className='defaultSection-label'>
                        Aktywne osiągnięcia
                    </Box>
                    <Stack spacing={2}>
                        {props.achInfoDistance != "completed"
                            ?<MiniAchievement achievementInfo={props.achInfoDistance} achievementProg={props.achProgDistance} category="distance" />
                            :<CompletedMiniAchievement category="distance" />
                        }
                        {props.achInfoSpeed != "completed"
                            ?<MiniAchievement achievementInfo={props.achInfoSpeed} achievementProg={props.achProgSpeed} category="speed"/>
                            :<CompletedMiniAchievement category="speed" />
                        }
                        {props.achInfoTime != "completed"
                            ?<MiniAchievement achievementInfo={props.achInfoTime} achievementProg={props.achProgTime} category="time"/>
                            :<CompletedMiniAchievement category="time" />
                        }
                        {props.achInfoCalories != "completed"
                            ?<MiniAchievement achievementInfo={props.achInfoCalories} achievementProg={props.achProgCalories} category="calories" />
                            :<CompletedMiniAchievement category="calories" />
                        }
                    </Stack>
                </Box>
            </div>
            <div className="item margin_section_trainings">
                <Box sx={{display: 'flex', flexDirection: "column"}}>
                    <Box sx={{
                        display: "flex",
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingTop: 2,
                        paddingBottom: 2,
                        fontSize: '1.25rem',
                        fontWeight: "bold",
                        letterSpacing: 1,
                        bgcolor: '#19232b'
                    }} className="defaultSection-label">
                        Ostatnie treningi
                    </Box>
                    <ShowMiniTrainings numberTrainings={props.numberTrainings} trainings={props.trainings} />
                </Box>
            </div>
        </Box>


    </>;


}

function ShowMiniTrainings(props: any) {

    switch(props.numberTrainings) {
        case 0:
            return (
                <Box sx={{
                    display: "flex",
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingBottom: 3,
                    fontSize: '1.25rem',
                    fontWeight: "bold",
                    letterSpacing: 1,
                }}>Brak wykonanych treningów</Box>);
        case 1:
            return (
                <Box sx={{
                    display: "flex",
                }}>
                    <MiniTraining class="minitrainings-left" stats={props.stats} training={props.trainings[0]} />
                    <div className="minitrainings-empty"></div>
                </Box>);
        case 2:
            return (
                <Box sx={{
                    display: "flex",
                }}>
                    <MiniTraining class="minitrainings-left" stats={props.stats} training={props.trainings[0]} />
                    <MiniTraining class="minitrainings-right" stats={props.stats} training={props.trainings[1]}/></Box>
            );
        case 3:
            return (
                <>
                    <Box sx={{
                        display: "flex",
                    }}>
                        <MiniTraining class="minitrainings-left" stats={props.stats}  training={props.trainings[0]} />
                        <MiniTraining class="minitrainings-right" stats={props.stats}  training={props.trainings[1]}/></Box>
                    <Box sx={{
                        display: "flex",
                    }}>
                        <MiniTraining class="minitrainings-left" stats={props.stats}  training={props.trainings[2]} />
                        <div className="minitrainings-empty"></div>
                    </Box>
                </>
            );
        default:
            return (
                <>
                    <Box sx={{
                        display: "flex",
                    }}>
                        <MiniTraining class="minitrainings-left" stats={props.stats}  training={props.trainings[0]} />
                        <MiniTraining class="minitrainings-right" stats={props.stats}  training={props.trainings[1]}/>
                    </Box>
                    <Box sx={{
                        display: "flex",
                    }}>
                        <MiniTraining class="minitrainings-left" stats={props.stats}  training={props.trainings[2]}/>
                        <MiniTraining class="minitrainings-right" stats={props.stats}  training={props.trainings[3]}/>
                    </Box>
                </>);
    }


}

function WhichAchievement(achievements: AchInfoEntry[], startingPage: number, progress: AchProgressEntry) {

    var fd: AchInfoEntry[] = [];
    var numb = achievements.length - startingPage < 4 ? achievements.length - startingPage : 4;

    for(var i=0; i<numb; i++)
        fd[i] = achievements[startingPage+i];

    return fd;


}

function WhichEmpty(length: number, startingPage: number) {

    var tabTemp = [];
    var numb = length-startingPage;
    if(numb<4)
        for(var i=0; i<(4-numb); i++)
            tabTemp[i] = {pusty: "empty"+i};

    return tabTemp;


}

function WhichTraining(trainings: TrainingWithDate[], startingPage: number) {

    var fd: TrainingWithDate[] = [];
    var numb = trainings.length - startingPage < 4 ? trainings.length - startingPage : 4;

    for(var i=0; i<numb; i++)
        fd[i] = trainings[startingPage+i];

    return fd;


}



function TrainingsSection(props:any) {

    const [page, setPage] = React.useState(1);
    return <>
        <div className="item margin_section">
            <Box className='trainings-header' sx={{
                display: "flex",
                alignItems: 'center',
                justifyContent: 'center',
                paddingTop: 2,
                paddingBottom: 2,
                fontSize: '1.25rem',
                fontWeight: "bold",
                letterSpacing: 1,
                bgcolor: '#19232b'
            }}>
                Moje treningi
            </Box>
            {props.trainings.length === 0
            ? <Box sx={{
                display: "flex",
                alignItems: 'center',
                justifyContent: 'center',
                paddingBottom: 3,
                fontSize: '1.25rem',
                fontWeight: "bold",
                letterSpacing: 1,
            }} className="min-height">Brak wykonanych treningów</Box> :
            <Box sx={{display: 'flex', flexDirection: 'column'}}>
                {
                    WhichTraining(props.trainings, page*4-4).map((training: TrainingWithDate) => (
                        <Training stats={props.stats} key={training.dateStart} training={training}/>

                    ))
                }
                {
                    WhichEmpty(props.trainings.length, page*4-4).map(({ pusty }, index) => (
                        <EmptyTraining key={pusty}/>
                    ))

                }
                {
                    <Pagination count={Math.ceil(props.trainings.length/4)} className="pageNavigation"  onChange={(event, newValue) => {setPage(newValue);}}  variant="outlined"/>

                }

            </Box> }
        </div>
    </>

}


function MiniTraining(props: any) {


    return <>
        <Paper elevation={24} className={props.class}>

            <Box sx={{display: 'flex', flexDirection: "column"}}>
                <Box sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingBottom: 5,
                    fontSize: '1.25rem',
                    fontWeight: "500",
                    letterSpacing: 1
                }}>
                    <div className="trainings-row minitrainings-name">
                        <div>{props.training.name}</div>
                    </div>
                </Box>
                <Stack
                    direction="row"
                    divider={<Divider sx={{bgcolor: '#36454F'}} orientation="vertical" flexItem/>}
                    spacing={2}
                >
                    <div className="trainings-stats">
                        <TimerIcon className="trainings-stats-icon"/>
                        <div className="trainings-stats-value-number">{props.training.duration}</div>
                    </div>
                    <div className="trainings-stats">
                        <DirectionsBikeIcon className="trainings-stats-icon"/>
                        <div className="trainings-stats-value">
                            <div className="trainings-stats-value-number">{numberFormat(props.training.distance)}</div>
                            <div className="trainings-stats-value-unit">km</div>
                        </div>
                    </div>
                </Stack>
                <div className="minitrainings-column minitrainings-time">
                    <div className="trainings-row minitrainings-row">
                        <PlayArrowIcon className="trainings-icon2"/>
                        <div className="trainings-date">
                            <div className="trainings-date-name">Początek</div>
                            <div className="trainings-date-value">{props.training.dateStart.format('D MMM yyyy, HH:mm')}</div>
                        </div>
                    </div>
                    <div className="trainings-row minitrainings-row">
                        <StopIcon className="trainings-icon2"/>
                        <div className="trainings-date">
                            <div className="trainings-date-name">Koniec</div>
                            <div className="trainings-date-value">{props.training.dateEnd.format('D MMM yyyy, HH:mm')}</div>
                        </div>
                    </div>
                </div>


            </Box>

        </Paper>
    </>
}

function EmptyTraining(props: any) {


    return <>
        <Paper elevation={24} className='trainings trainings-hidden'>

            <Box sx={{display: 'flex', flexDirection: "column"}}>
                <Box sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingBottom: 5,
                    fontSize: '1.25rem',
                    fontWeight: "500",
                    letterSpacing: 1
                }}>
                    <div className="trainings-row trainings-name">
                        <div>Nazwa</div>
                        <ArrowForwardIosIcon/>
                    </div>
                </Box>
                <Stack
                    direction="row"
                    divider={<Divider sx={{bgcolor: '#36454F'}} orientation="vertical" flexItem/>}
                    spacing={2}
                >
                    <div className="trainings-stats">
                        <TimerIcon className="trainings-stats-icon"/>
                        <div className="trainings-stats-value-number">Empty</div>
                    </div>
                    <div className="trainings-stats">
                        <SpeedIcon className="trainings-stats-icon"/>
                        <div className="trainings-stats-value">
                            <div className="trainings-stats-value-number">Empty</div>
                        </div>
                    </div>
                    <div className="trainings-stats">
                        <LocalFireDepartmentIcon className="trainings-stats-icon"/>
                        <div className="trainings-stats-value">
                            <div className="trainings-stats-value-number">Empty</div>
                        </div>
                    </div>
                    <div className="trainings-stats">
                        <DirectionsBikeIcon className="trainings-stats-icon"/>
                        <div className="trainings-stats-value">
                            <div className="trainings-stats-value-number">Empty</div>
                        </div>
                    </div>
                </Stack>
                <div className="trainings-row trainings-time">
                    <div className="trainings-row">
                        <PlayArrowIcon className="trainings-icon2"/>
                        <div className="trainings-date">
                            <div className="trainings-date-name">Empty</div>
                            <div className="trainings-date-value">Empty</div>
                        </div>
                    </div>
                    <div className="trainings-row">
                        <StopIcon className="trainings-icon2"/>
                        <div className="trainings-date">
                            <div className="trainings-date-name">Empty</div>
                            <div className="trainings-date-value">Empty</div>
                        </div>
                    </div>
                </div>
            </Box>
        </Paper>
    </>
}

function Training(props: any) {
    const [firstPage, setfirstPage] = React.useState(true);

    return <>
        <Paper elevation={24} className='trainings'>

            <Box sx={{display: 'flex', flexDirection: "column"}}>
                {firstPage ? <>
                        <Box sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            paddingBottom: 5,
                            fontSize: '1.25rem',
                            fontWeight: "500",
                            letterSpacing: 1
                        }}>
                            <div className="trainings-row trainings-name">
                                <div>{props.training.name}</div>
                                <ArrowForwardIosIcon  onClick={() => {
                                    firstPage ? setfirstPage(false) : setfirstPage(true)
                                }}/>
                            </div>
                        </Box>
                        <Stack
                            direction="row"
                            divider={<Divider sx={{bgcolor: '#36454F'}} orientation="vertical" flexItem/>}
                            spacing={2}
                        >
                            <div className="trainings-stats">
                                <TimerIcon className="trainings-stats-icon"/>
                                <div className="trainings-stats-value-number">{props.training.duration}</div>
                            </div>
                            <div className="trainings-stats">
                                <SpeedIcon className="trainings-stats-icon"/>
                                <div className="trainings-stats-value">
                                    <div className="trainings-stats-value-number">{numberFormat(props.training.averageVelocity)}</div>
                                    <div className="trainings-stats-value-unit">km/h</div>
                                </div>
                            </div>
                            <div className="trainings-stats">
                                <LocalFireDepartmentIcon className="trainings-stats-icon"/>
                                <div className="trainings-stats-value">
                                    <div className="trainings-stats-value-number">{numberFormat(props.training.calories)}</div>
                                    <div className="trainings-stats-value-unit">kcal</div>
                                </div>
                            </div>
                            <div className="trainings-stats">
                                <DirectionsBikeIcon className="trainings-stats-icon"/>
                                <div className="trainings-stats-value">
                                    <div className="trainings-stats-value-number">{numberFormat(props.training.distance)}</div>
                                    <div className="trainings-stats-value-unit">km</div>
                                </div>
                            </div>
                        </Stack>
                        <div className="trainings-row trainings-time">
                            <div className="trainings-row">
                                <PlayArrowIcon className="trainings-icon2"/>
                                <div className="trainings-date">
                                    <div className="trainings-date-name">Początek</div>
                                    <div className="trainings-date-value">{props.training.dateStart.format('D MMM yyyy, HH:mm')}</div>
                                </div>
                            </div>
                            <div className="trainings-row">
                                <StopIcon className="trainings-icon2"/>
                                <div className="trainings-date">
                                    <div className="trainings-date-name">Koniec</div>
                                    <div className="trainings-date-value">{props.training.dateEnd.format('D MMM yyyy, HH:mm')}</div>
                                </div>
                            </div>
                        </div>
                    </> :
                    <Box sx={{
                        display: "flex",
                        flexDirection: "column",
                    }}>
                        <Box sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            paddingBottom: 1,
                            fontSize: '1.25rem',
                            fontWeight: "500",
                            letterSpacing: 1
                        }}>
                            <div className="trainings-row trainings-name">
                                <div>Średnia prędkość</div>
                                <ArrowBackIosIcon onClick={() => {
                                    firstPage ? setfirstPage(false) : setfirstPage(true)
                                }}/>
                            </div>
                        </Box>
                        <VictoryChart
                            height={145}
                            domainPadding={20}
                            padding={{left: 100, right: 20}}
                        >
                            <VictoryAxis
                                tickValues={[1, 2, 3, 4]}
                                tickFormat={["Tygodniowa", "Miesięczna", "Całościowa", "Trening"]}
                                style={{
                                    axis: {
                                        stroke: 'transparent'
                                    },
                                    tickLabels: {
                                        fill: 'white'
                                    },
                                    grid: {stroke: "none"}
                                }}
                            />
                            <VictoryBar
                                horizontal
                                barWidth={14}
                                style={{
                                    data: {fill: "#64FFDAFF"},
                                    labels: {fill: "white"}
                                }}
                                labels={({datum}) => numberFormat(datum.value)}
                                data={[
                                    {velocity: 1, value: props.stats!['weekly'].averageVelocity},
                                    {velocity: 2, value: props.stats!['monthly'].averageVelocity},
                                    {velocity: 3, value: props.stats!['global'].averageVelocity},
                                    {velocity: 4, value: props.training.averageVelocity}
                                ]}
                                x="velocity"
                                y="value"
                            />
                        </VictoryChart>
                    </Box>
                }
            </Box>

        </Paper>
    </>
}

function ShowAchievements(props:any) {

    const [page, setPage] = React.useState(1);


    return <>
        {

            WhichAchievement(props.info, page*4-4, props.progress).map(({ comment, description, goal, name }, index) => (
                props.info.length != props.progress.stageId ?
                    <Achievement key={name} unit={props.unit} correctIndex={page*4-4+index} numberElement={props.info.length} progress={props.progress} comment={comment} description={description} goal={goal} name={name} index={index}/>
                    :
                    <CompletedAchievement key={name} unit={props.unit} correctIndex={page*4-4+index} numberElement={props.info.length} progress={props.progress} comment={comment} description={description} goal={goal} name={name} index={index}/>
            ))

        }
        {
            WhichEmpty(props.info.length, page*4-4).map(({ pusty }, index) => (
                <EmptyAchievement key={pusty}/>
            ))

        }
        {
            <Pagination className="pageNavigation" onChange={(event, newValue) => {setPage(newValue);}} count={Math.ceil(props.info.length/4)} variant="outlined" />
        }</>

}

function MiniAchievement(props: any) {

    return <>
        <Paper elevation={24} className='achievement'>
            <div className='achievement-info'>
                <div className='achievement-header_row'>
                    <div className='achievement-row'>
                        <EmojiEventsOutlinedIcon sx={{fontSize: 30}} className='achievement-icon_cup'/>
                        <div className="achievement-name">{props.achievementInfo.name}</div>
                    </div>
                    <CategoryIcon category={props.category} />
                </div>
            </div>
            <div className='achievement-progress'>
                <Box sx={{width: props.achievementProg.progress/props.achievementInfo.goal, height: 1}}  className="achievement-progress-active"></Box>
            </div>
        </Paper > </>


}

function CompletedMiniAchievement(props: any) {

    return <>
        <Paper elevation={24} className='achievement'>
            <div className='achievement-info'>
                <div className='achievement-header_row'>
                    <div className='achievement-row'>
                        <EmojiEventsOutlinedIcon sx={{fontSize: 30}} className='achievement-icon_cup'/>
                        <div className="achievement-name">Ukończono kategorię</div>
                    </div>
                    <CategoryIcon category={props.category} />
                </div>
            </div>
            <div className='achievement-progress'>
                <Box sx={{width: 1, height: 1}}  className="achievement-progress-done"></Box>
            </div>
        </Paper > </>


}

function Achievement(props: any) {

    const stateAchievements = {
        icon:
            props.correctIndex == 0
                ?<TrendingUpIcon sx={{fontSize: 30}} className='achievement-icon_cup'/>
                : (props.correctIndex < props.numberElement - props.progress.stageId
                    ? <LockOutlinedIcon sx={{fontSize: 30}} className='achievement-icon_cup'/>
                    : <DoneAllIcon sx={{fontSize: 30}} className='achievement-icon_cup'/>),
        progress: props.correctIndex == 0
            ? numberFormat(props.progress.progress)+" "+props.unit+" / "+numberFormat(props.goal)+" "+props.unit
            : (props.correctIndex <  props.numberElement - props.progress.stageId
                ? null
                : null ),
        class:  props.correctIndex == 0
            ? "achievement-progress-active"
            : (props.correctIndex <  props.numberElement - props.progress.stageId
                ? "achievement-progress-lock"
                : "achievement-progress-done" ),
        width:  props.correctIndex == 0
            ? props.progress.progress/props.goal
            : (props.correctIndex <  props.numberElement - props.progress.stageId
                ? 1
                : 1 )

    };

    return <>
        <Paper elevation={24} className='achievement'>
            <div className='achievement-info'>
                <div className='achievement-header_row'>
                    <div className='achievement-row'>
                        <EmojiEventsOutlinedIcon sx={{fontSize: 30}} className='achievement-icon_cup'/>
                        <div className="achievement-name">{props.name}</div>
                    </div>
                    {stateAchievements.icon}
                </div>
                <div className='achievement-description_row'>
                    <div className='achievement-description'>{props.description}</div>
                    <div className={(props.correctIndex != 0 && props.correctIndex >=  props.numberElement - props.progress.stageId)?"achievement-comment":"achievement-comment achievement-hidden"}>{props.comment}</div>
                </div>
            </div>
            <div className='achievement-progress'>
                <Box sx={{width: stateAchievements.width, height: 1}}  className={stateAchievements.class}></Box>
                <div className='achievement-progress-data'>{stateAchievements.progress}</div>
            </div>
        </Paper > </>


}

function CompletedAchievement(props: any) {

    return <>
        <Paper elevation={24} className='achievement'>
            <div className='achievement-info'>
                <div className='achievement-header_row'>
                    <div className='achievement-row'>
                        <EmojiEventsOutlinedIcon sx={{fontSize: 30}} className='achievement-icon_cup'/>
                        <div className="achievement-name">{props.name}</div>
                    </div>
                    <DoneAllIcon sx={{fontSize: 30}} className='achievement-icon_cup'/>
                </div>
                <div className='achievement-description_row'>
                    <div className='achievement-description'>{props.description}</div>
                    <div className={(props.correctIndex != 0 && props.correctIndex >=  props.numberElement - props.progress.stageId)?"achievement-comment":"achievement-comment achievement-hidden"}>{props.comment}</div>
                </div>
            </div>
            <div className='achievement-progress'>
                <Box sx={{width: 1, height: 1}}  className="achievement-progress-done"></Box>
                <div className='achievement-progress-data'></div>
            </div>
        </Paper > </>


}

function EmptyAchievement(props: any) {

    return <>
        <Paper elevation={24} className='achievement achievement-hidden'>
            <div className='achievement-info'>
                <div className='achievement-header_row'>
                    <div className='achievement-row'>
                        <EmojiEventsOutlinedIcon sx={{fontSize: 30}} className='achievement-icon_cup'/>
                        <div className="achievement-name">Empty</div>
                    </div>
                </div>
                <div className='achievement-description_row'>
                    <div className='achievement-description'>Empty</div>
                    <div className='achievement-comment'>Empty</div>
                </div>
            </div>
            <div className='achievement-progress'>
                <div className='achievement-progress-data'>Empty</div>
            </div>
        </Paper > </>


}

function NoData() {


    const history = useHistory();
    //const dispatch = useDispatch();
    const auth = getAuth();
    const user = useSelector(selectUser);

    return (
        <div>
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                paddingTop: 4
            }}>
                <div className="userData">
                    <PersonOffIcon sx={{fontSize: 150}} className="noData-icon" />
                    <div className="noData-text">Nie uzupełniono profilu</div>
                </div>
            </Box>
            <Divider sx={{paddingTop: 4}} orientation="horizontal"/>
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                paddingTop: 2,
            }}>
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingTop: 2,
                    paddingLeft: 7
                }}>
                    <Box sx={{fontWeight: "bold", letterSpacing: 1}}>
                        Uzupełnij profil
                    </Box>
                    <Box sx={{paddingLeft: 2}}>
                        <IconButton sx={{color: "white"}}  onClick={() => {
                            history.push('#edycja');
                        }}>
                            <ArrowForwardIosIcon/>
                        </IconButton>
                    </Box>
                </Box>


            </Box>
        </div>
    );
}


function ShowData() {


    const history = useHistory();
    //const dispatch = useDispatch();
    const auth = getAuth();
    const user = useSelector(selectUser);

    return (
        <div>
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                paddingTop: 4
            }}>

                <Stack
                    divider={<Divider sx={{bgcolor: '#36454F'}} orientation="horizontal" flexItem/>}
                    spacing={2}
                >
                    <div className="userData">
                        <div className="userData-row">
                            <EmailIcon className="userData-icon"/>
                            <div className="userData-label">E-mail</div>
                        </div>
                        {auth.currentUser!.email}
                    </div>
                    <div className="userData">
                        <div className="userData-row">
                            <CakeIcon className="userData-icon"/>
                            <div className="userData-label">Data urodzenia</div>
                        </div>
                        {user.dateOfBirth.format('DD.MM.yyyy')}r.
                    </div>
                    <div className="userData">
                        <div className="userData-row">
                            <HeightIcon className="userData-icon"/>
                            <div className="userData-label">Wzrost</div>
                        </div>
                        {user.height} cm
                    </div>
                    <div className="userData">
                        <div className="userData-row">
                            <MonitorWeightOutlinedIcon className="userData-icon"/>
                            <div className="userData-label">Waga</div>
                        </div>
                        {numberFormat(user.weight)} kg
                    </div>
                    <div className="userData">
                        <div className="userData-row">
                            <WcIcon className="userData-icon"/>
                            <div className="userData-label">Płeć</div>
                        </div>
                        {user.gender}
                    </div>
                    <div className="userData">
                        <div className="userData-row">
                            <EmojiPeopleIcon className="userData-icon"/>
                            <div className="userData-label">BMI</div>
                        </div>
                        <div>{user.bmiDescription} ({numberFormat(user.bmiValue)})</div>
                        <div></div>
                    </div>
                </Stack>


            </Box>
            <Divider sx={{paddingTop: 4}} orientation="horizontal"/>
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                paddingTop: 2,
            }}>
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingTop: 2,
                    paddingLeft: 7
                }} >
                    <Box sx={{fontWeight: "bold", letterSpacing: 1}}>
                        Edytuj profil
                    </Box>
                    <Box sx={{paddingLeft: 2}}>
                        <IconButton sx={{color: "white"}} onClick={() => {
                            history.push('#edycja');
                        }}>
                            <ArrowForwardIosIcon/>
                        </IconButton>
                    </Box>
                </Box>


            </Box>
        </div>
    );
}


const MyTextInput = ({label, ...props}: { label: string } & FieldConfig<string> & HTMLAttributes<HTMLInputElement>) => {
    const [field, meta] = useField(props);

    return (
        <>
            <div className="userData-row">
                <LabelIcon type={props.name} />
                <label className="userData-label" htmlFor={props.id || props.name}>{label}</label>
            </div>
            <Field className="formik-input" {...field} {...props} />
            {meta.touched && meta.error ? (
                <div className="error">{meta.error}</div>
            ) : null}
        </>
    );
};

const MyRadioGroup = ({...props}:  & FieldConfig<string> & HTMLAttributes<HTMLInputElement>) => {
    const [field, meta] = useField(props);

    return (
        <>
            <Box sx={{ paddingTop: 1,paddingBottom: 1, }}className="userData-row">
                <Field id='man' name={props.name} value="mężczyzna" type="radio" />
                <label htmlFor='man' className="userData-label">Mężczyzna</label>
            </Box>
            <div className="userData-row">
                <Field id='woman' name={props.name} value="kobieta" type="radio" />
                <label htmlFor='woman' className="userData-label">Kobieta</label>
            </div>
            {meta.touched && meta.error ? (
                <div className="error">{meta.error}</div>
            ) : null}
        </>
    );
};

const LabelIcon = (props: any) => {

    switch(props.type) {
        case 'name':
            return <PersonIcon className="userData-icon"/>;
        case 'surname':
            return <GroupIcon className="userData-icon"/>;
        case 'height':
            return <HeightIcon className="userData-icon"/>;
        case 'weight':
            return <MonitorWeightOutlinedIcon className="userData-icon"/>;
        case 'gender':
            return <WcIcon className="userData-icon"/>;
        case 'dateOfBirth':
            return <CakeIcon className="userData-icon"/>;
        default:
            return null;

    }

}

const CategoryIcon = (props: any) => {

    switch(props.category) {
        case 'distance':
            return <DirectionsBikeIcon sx={{fontSize: 30}} className='achievement-icon_cup'/>;
        case 'speed':
            return <SpeedIcon sx={{fontSize: 30}} className='achievement-icon_cup'/>;
        case 'time':
            return <TimerIcon sx={{fontSize: 30}} className='achievement-icon_cup'/>;
        case 'calories':
            return <LocalFireDepartmentIcon sx={{fontSize: 30}} className='achievement-icon_cup'/>;
        default:
            return null;

    }

}



function EditData() {

   
    const history = useHistory();
    //const dispatch = useDispatch();
    const [authError, setAuthError] = useState('');
    const auth = getAuth();
    const user = useSelector(selectUser);
    const db = getFirestore();

    const [file, setFile] = useState(user.avatarUrl);

    const handleChange = function loadFile(event: any) {
        if (event.target.files.length > 0) {
            const file = URL.createObjectURL(event.target.files[0]);
            setFile(file);
        }
    };

    const [IsSaving, setIsSaving] = useState(false);

    
    const storage = getStorage();
    const storageRef = ref(storage, "/avatars/"+auth.currentUser!.email+"_profilePic.jpg");

    const metadata = {
        contentType: 'image/jpg'
      };
    
      

    const BmiDescription = (bmi: number) => {
        var description = "";

        switch(true) {
            case (bmi < 16.0):
                description = "wygłodzenie";
                break;
            case (bmi >= 16.0 && bmi < 17):
                description = "wychudzenie";
                break;
            case (bmi >= 17.0 && bmi < 18.5):
                description = "niedowaga";
                break;
            case (bmi >= 18.5 && bmi < 25):
                description = "waga prawidłowa";
                break;
            case (bmi >= 25 && bmi < 30):
                description = "nadwaga";
                break;
            case (bmi >= 30 && bmi < 35):
                description = "otyłość I stopnia";
                break;
            case (bmi >= 35 && bmi < 40):
                description = "otyłość II stopnia";
                break;
            case (bmi >= 40):
                description = "otyłość III stopnia";
                break;
        }



        return description;
    }



    return ( <>
            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <input type="file" onChange={handleChange} id="upload" accept="image/*" style={{display: "none"}}/>
                <label htmlFor="upload">
                    <IconButton color="primary" aria-label="upload picture" component="span">
                        <Avatar id="awatar" src={file} alt="Awatar" sx={{
                            width: 80,
                            height: 80,
                            marginTop: -6,
                            boxShadow: 3,
                            border: 2,
                            borderColor: 'text.primary',
                        }}/>
                    </IconButton>
                </label>
                <label htmlFor="awatar"/>
            </Box>
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column'}} >
                <button className="formik-deleteAwatar" onClick={ () => {setFile("https://firebasestorage.googleapis.com/v0/b/projekt-kolarstwo.appspot.com/o/avatars%2Fdefault.png?alt=media&token=f1498949-47e5-4af3-962d-c0290685c66c")}}>Usuń awatar</button>
            </Box>
            <Divider sx={{marginTop: 2, marginBottom: 4, bgcolor: '#36454F', width: 1}} orientation="horizontal"/>

            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>

                <div className="formik">
                    <Formik
                        initialValues={{name: user.name, surname: user.surname, height: user.height != 0 ? user.height : '', weight: user.weight != 0 ? user.weight : '', dateOfBirth: user.dateOfBirth.format('YYYY-MM-DD'), gender: user.gender}}
                        validationSchema={Yup.object({
                            name: Yup.string().matches(/^[A-ZŻŹĆĄŚĘŁÓŃ]{1}[a-zżźćńółęą]+$/, "Podane imię nie jest prawidłowe").required("Proszę podać swoje imię"),
                            surname: Yup.string().matches(/^[A-ZŻŹĆĄŚĘŁÓŃ]{1}[a-zżźćńółęą]+$/, "Podane nazwisko nie jest prawidłowe").required("Proszę podać swoje nazwisko"),
                            height: Yup.number().min(50, 'Podany wzrost nie jest prawidłowy').max(300, 'Podany wzrost nie jest prawidłowy').required("Proszę podać swój wzrost"),
                            weight: Yup.number().min(20, 'Podana waga nie jest prawidłowa').max(300, 'Podana waga nie jest prawidłowa').required("Proszę podać swoją wagę"),
                            dateOfBirth: Yup.date().min(Number(moment(Date.now()).format("yyyy")) - 120, "Podana data nie jest prawidłowa").max(Number(moment(Date.now()).format("yyyy")),  "Podana data nie jest prawidłowa").required("Proszę podać swoją datę urodzenia").typeError("Proszę podać swoją datę urodzenia"),
                            gender: Yup.string().required("Proszę wybrać swoją płeć"),
                        })}
                        onSubmit={async (values, {setSubmitting}) => {

                            setIsSaving(true);
                            var bmiVal = Math.round((Number(values.weight)/(Math.pow(Number(values.height)/100,2))) * 10) / 10;

                            var defaultUrl = "https://firebasestorage.googleapis.com/v0/b/projekt-kolarstwo.appspot.com/o/avatars%2Fdefault.png?alt=media&token=f1498949-47e5-4af3-962d-c0290685c66c";
                            var fileUrl;

                            if(file === defaultUrl) {
                                fileUrl = "";
                                await deleteObject(storageRef).then(() => {}).catch((error) => {
                                    console.log(error);
                                });
                            }
                            else if(file === user.avatarUrl)
                                fileUrl = file;
                            else {
                                var blob = await fetch(file).then(r => r.blob());
                                const uploadTask = await uploadBytesResumable(storageRef, blob, metadata);
                                await getDownloadURL(storageRef).then((downloadURL) => {
                                    fileUrl = downloadURL;
                                });
                                
                            }
                            
                            await updateDoc(doc(collection(db, `users`), auth.currentUser!.uid), {
                                avatarUrl: fileUrl,
                                name: values.name,
                                surname: values.surname,
                                nameNS: values.name.toLocaleLowerCase()+" "+values.surname.toLocaleLowerCase(),
                                nameSN: values.surname.toLocaleLowerCase()+" "+values.name.toLocaleLowerCase(),
                                height: Math.round(Number(values.height)),
                                weight: values.weight,
                                dateOfBirth: new Date(values.dateOfBirth),
                                gender: values.gender,
                                bmiValue: bmiVal,
                                bmiDescription: BmiDescription(bmiVal),
                                isCompleted: true,

                            });
                            setSubmitting(false);
                            history.replace('/profil');
                            
                        }}

                    >

                        {!IsSaving? 
                        <Form className="formik-form">

                            <div className="formik-group">
                                <MyTextInput label='Imię' name="name" type="text"/>
                            </div>
                            <div className="formik-group">
                                <MyTextInput label='Nazwisko' name="surname" type="text"/>
                            </div>
                            <div className="formik-group">
                                <MyTextInput label='Wzrost[cm]' name="height" type="number"/>
                            </div>
                            <div className="formik-group">
                                <MyTextInput label="Waga[kg]" name="weight" type="number"/>
                            </div>
                            <div className="formik-group">
                                <MyTextInput label='Data urodzenia' name="dateOfBirth" type="date"/>
                            </div>
                            <div className="formik-group">
                                <div className="userData-row">
                                    <LabelIcon type="gender" />
                                    <div className="userData-label">Płeć</div>
                                </div>
                                <MyRadioGroup name="gender"/>

                            </div>
                            <div className="formik-divider"></div>
                            <div className="formik-group">
                               
                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    paddingTop: 2,
                                }}>
                                    <input type="submit" className="formik-button formik-buttonLeft" value="Zapisz" />
                                    <input type="reset" className="formik-button formik-buttonRight" value="Anuluj"  onClick={  () => {
                                        history.replace('/profil');
                                    }}/>
                                   
                                </Box>
                               
                            </div>
                            {authError !== '' ? <div className="formik-error">{authError}</div> : null}
                        </Form>
                        : 
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            paddingTop: 4
                        }} className="test" ><CircularProgress sx={{color: "#64FFDAFF"}} size={"2rem"}/></Box>
                        }
                    </Formik>
                </div>



            </Box>
        </>
    );
}

export default ProfilePage;