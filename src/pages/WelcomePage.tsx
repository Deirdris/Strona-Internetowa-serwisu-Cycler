import React, {HTMLAttributes, useEffect, useState} from 'react';
import {getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword} from "firebase/auth";

import {Route, Link, Switch} from "react-router-dom";
import {useHistory} from 'react-router-dom';
import {
    Formik,
    Form,
    useField,
    FieldConfig
} from 'formik';
import * as Yup from "yup";
import {collection, doc, updateDoc, setDoc, addDoc, getFirestore} from "firebase/firestore";
import moment from "moment";
import '../styles/WelcomePage.scss';
import {useDispatch} from "react-redux";
import {fetchUserData} from "../reducers/authSlice";


function WelcomePage() {
    const history = useHistory();
    const auth = getAuth();
    useEffect(() => {
        if (auth.currentUser != null) {
            history.replace('/strona-główna');
        }

    }, []);
    return (
        <div className="app">
            <nav className="welcomeNavbar">
                <div className="pageName">
                    <h4 className="pageName-h4">Cycler</h4>
                </div>
                <ul className="loginRegister">
                    <li className="loginRegister-option">
                        <button className="loginRegister-button" onClick={() => {
                            history.push('/#login');
                        }}>Zaloguj
                        </button>
                    </li>
                    <li className="loginRegister-option">
                        <button className="loginRegister-button" onClick={() => {
                            history.push('/#register');
                        }}>Zarejestruj
                        </button>
                    </li>
                </ul>
            </nav>
            <section className="welcomeSection">
                <Switch>
                    <WelcomeSection/>
                </Switch>
            </section>
        </div>
    );

}

function WelcomeSection(props: any) {

    if (props.location.hash === '#login') {
        return <Login/>;
    } else if (props.location.hash === '#register') {
        return <Register/>;
    } else {
        return (
            <>
                <div>Strona stworzona z myślą o kolarzach</div>
                <div className="highlight">Powodzenia na trasie!</div>
            </>
        );
    }


}

const MyTextInput = ({label, ...props}: { label: string } & FieldConfig<string> & HTMLAttributes<HTMLInputElement>) => {
    const [field, meta] = useField(props);
    return (
        <>
            <label className="auth-label" htmlFor={props.id || props.name}>{label}</label>
            <input className="auth-input" {...field} {...props} />
            {meta.touched && meta.error ? (
                <div className="error">{meta.error}</div>
            ) : null}
        </>
    );
};

type errorMessagesType = {
    [key: string]: string
}

const errorMessages: errorMessagesType = {
    'auth/user-not-found': 'Nieprawidłowy email lub hasło',
    'auth/wrong-password': 'Nieprawidłowy email lub hasło',
    'auth/email-already-in-use': 'Podany email jest już zajęty',
}

function Login() {

    const auth = getAuth();
    const history = useHistory();
    const dispatch = useDispatch();
    const [authError, setAuthError] = useState('');

    const SignIn = (email: string, password: string) => {
        return signInWithEmailAndPassword(auth, email, password)
            .then(async (userCredential) => {
                // Signed in
                await dispatch(fetchUserData(userCredential.user.uid));
                history.push('/strona-główna');
                // ...
            })
            .catch((error) => {
                const errorCode = error.code;
                setAuthError(errorMessages[errorCode]);
                // ..
            });
    }

    return (
        <div className="auth">
            <Formik
                initialValues={{email: '', password: ''}}
                validationSchema={Yup.object({
                    password: Yup.string()
                        .required('Pole wymagane'),
                    email: Yup.string().email('Niepoprawny adres e-mail').required('Pole wymagane'),
                })}
                onSubmit={async (values, {setSubmitting}) => {
                    await SignIn(values.email, values.password);
                    setSubmitting(false);
                }}
            >
                <Form className="auth-window">
                    <div className="auth-name">Logowanie</div>
                    <div className="group">
                        <MyTextInput label='E-mail' name="email" type="email"/>
                    </div>
                    <div className="group">
                        <MyTextInput label='Hasło' name="password" type="password"/>
                    </div>
                    <div className="auth-divider"></div>
                    <div className="group">
                        <input type="submit" className="auth-button" value="Zaloguj"/>
                    </div>
                    {authError !== '' ? <div className="auth-error">{authError}</div> : null}
                </Form>
            </Formik>
        </div>
    );
}


function Register() {
    const auth = getAuth();
    const history = useHistory();
    const [authError, setAuthError] = useState('');
    const dispatch = useDispatch();
    const db = getFirestore();

    const SignUp = (email: string, password: string) => {
        return createUserWithEmailAndPassword(auth, email, password)
            .then(async(userCredential) => {
                    // Signed in
                    await setDoc(doc(collection(db, `users`), userCredential.user.uid), {

                        avatarUrl: "",
                        name: "",
                        surname: "",
                        nameNS: "",
                        nameSN: "",
                        height: 0,
                        weight: 0,
                        dateOfBirth: null,
                        gender: "",
                        isCompleted: false,
                        bmiValue: 0,
                        bmiDescription: "",
                        invites: [],
                        friends: []

                    });
                    var statsData = {
                        allBurnedCalories: 0,
                        highestVelocity: 0,
                        overallDistance: 0,
                        overallDuration: 0,
                    }
                    await setDoc(doc(collection(db, `users/`+userCredential.user.uid+"/stats/"), "_"), {

                        global: {
                            ...statsData,
                            trainingCount: 0,
                        },
                        monthly: {
                            ...statsData,
                            month: moment(Date.now()).format("MMyyyy"),
                        },
                        weekly: {
                            ...statsData,
                            monday: moment().startOf('week').format('D').toString(),
                        }

                    });

                    await dispatch(fetchUserData(userCredential.user.uid));
                    history.push('/strona-główna');
                    // ...
                })
                    .catch((error) => {
                        const errorCode = error.code;
                        const errorMessage = error.message;
                        setAuthError(errorMessages[errorCode]);
                        console.log(authError);
                        console.log(errorMessage);
                        console.log(errorCode);
                        // ..
                    });
            }

    return (
        <div className="auth">
            <Formik
                initialValues={{email: '', password: ''}}
                validationSchema={Yup.object({
                    password: Yup.string()
                        .min(8, 'Conajmniej 8 znaków')
                        .required('Pole wymagane'),
                    email: Yup.string().email('Niepoprawny adres e-mail').required('Pole wymagane'),
                })}
                onSubmit={async (values, {setSubmitting}) => {
                    await SignUp(values.email, values.password);
                    setSubmitting(false);
                }}
            >
                <Form className="auth-window">
                    <div className="auth-name">Rejestracja</div>
                    <div className="group">
                        <MyTextInput label='E-mail' name="email" type="email"/>
                    </div>
                    <div className="group">
                        <MyTextInput label='Hasło' name="password" type="password"/>
                    </div>
                    <div className="auth-divider"></div>
                    <div className="group">
                        <input type="submit" className="auth-button" value="Zarejestruj"/>
                    </div>
                    {authError !== '' ? <div className="auth-error">{authError}</div> : null}
                </Form>
            </Formik>
        </div>
    );
}

export default WelcomePage;
