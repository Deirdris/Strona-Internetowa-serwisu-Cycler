import React, {useState} from 'react';
import {getAuth} from "firebase/auth";
import {
    Tooltip,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    Divider,
    ListItemIcon,
    Box,
} from "@mui/material";
import Logout from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';

import {Route, Switch, useHistory} from "react-router-dom";
import {useSelector} from "react-redux";
import {selectUser} from "../reducers/authSlice";

import '../styles/Navbar.scss';
import StartingSection from "./StartingSection";
import FriendsSection from "./FriendsSection";


function Navbar() {
    const history = useHistory();
    const auth = getAuth();
    const user = useSelector(selectUser);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
            <nav className="navbar">
                <div className="pageName" onClick={() => history.replace('strona-główna')}>
                    <h4 className="pageName-h4 pointer">Cycler</h4>
                </div>
                <ul className="menu">
                    <li className="menu-option">
                        <button className="menu-button" onClick={() => {
                            history.replace("/znajomi");
                        }}>Znajomi
                        </button>
                    </li>
                    <li className="menu-option">
                        <button className="menu-button" onClick={() => {
                            history.replace("/ranking");
                        }}>Ranking
                        </button>
                    </li>
                    <Box ml={5} sx={{display: 'flex', flexDirection: 'row'}}>
                        <Tooltip title="Konto">
                            <IconButton onClick={handleClick} size="small" sx={{ml: 2}}>
                                <Avatar sx={{width: 32, height: 32, bgcolor: "white"}}>
                                    <PersonIcon sx={{color: "black"}}/>
                                </Avatar>
                            </IconButton>
                        </Tooltip>
                        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{user.name !== "" ? user.name + ' ' + user.surname : auth.currentUser!.email}</Box>
                    </Box>
                </ul>
                <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    onClick={handleClose}
                    PaperProps={{
                        elevation: 0,
                        sx: {
                            overflow: 'visible',
                            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                            mt: 1.5,
                            '& .MuiAvatar-root': {
                                width: 32,
                                height: 32,
                                ml: -0.5,
                                mr: 1,
                            },
                            '&:before': {
                                content: '""',
                                display: 'block',
                                position: 'absolute',
                                top: 0,
                                right: 14,
                                width: 10,
                                height: 10,
                                bgcolor: "background.paper",
                                transform: 'translateY(-50%) rotate(45deg)',
                                zIndex: 0,
                            },
                        },
                    }}
                    transformOrigin={{horizontal: 'right', vertical: 'top'}}
                    anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
                >
                    <MenuItem onClick={() => history.replace('profil')}>
                        <ListItemIcon>
                            <PersonIcon fontSize="small"/>
                        </ListItemIcon>
                        Moje Konto
                    </MenuItem>
                    <Divider/>
                    <MenuItem onClick={async () => {
                        await auth.signOut();
                        window.location.reload();
                        history.replace('/');
                    }}>
                        <ListItemIcon>
                            <Logout fontSize="small"/>
                        </ListItemIcon>
                        Wyloguj
                    </MenuItem>
                </Menu>
            </nav>
    );

}

export default Navbar;
