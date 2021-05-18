import React from 'react'
import { createSwitchNavigator, createDrawerNavigator, createBottomTabNavigator } from 'react-navigation'

import Auth from '../components/auth/Auth'
import Home from './../components/home/Home'
import SplashScreen from '../components/splash/SplashScreen'
import LogoutScreen from '../components/splash/LogoutScreen'
import Profile from './../components/user/Profile'
import CreatePost from '../components/post/CreatePost'
import Talks from './../components/talk/Talks'
import CreateTalks from '../components/talk/CreateTalks'
import Chat from '../components/chat/Index'
import Camera from '../components/chat/Camera'
import Notification from '../components/notification/Notification'

import customNavigator from './custom'

const appDrawerNavigator = createDrawerNavigator({
    Home: {
        name: 'Home',
        screen: Home,
        navigationOptions: {
            title: 'Home'
        }
    },

    Profile: {
        name: 'Profile',
        screen: Profile,
        navigationOptions: {
            title: 'Meus dados'
        }
    },

    CreatePost: {
        name: 'CreatePost',
        screen: CreatePost,
        navigationOptions: {
            title: 'Criar postagem'
        }
    },

    Talks: {
        name: 'Talks',
        screen: Talks,
        navigationOptions: {
            title: 'Conversas'
        }
    },

    LogoutScreen: {
        name: 'LogoutScreen',
        screen: LogoutScreen,
        navigationOptions: {
            title: 'Sair'
        }
    },

    Camera: {
        name: 'Camera',
        screen: Camera,
        navigationOptions: {
            title: 'Camera'
        }
    },

    Notification: {
        name: 'Notification',
        screen: Notification,
        navigationOptions: {
            title: 'Notification'
        }
    }
}, {
    initialRouteName: 'Home',
    contentComponent: customNavigator,
    drawerWidth: 280,
})

const appDrawerNavigatorTalks = createBottomTabNavigator({
    Home: {
        name: 'Home',
        screen: Home,
        navigationOptions: {
            title: 'Home'
        }
    },
})

export default createSwitchNavigator({
    Auth,
    SplashScreen,
    Home: appDrawerNavigator,
    LogoutScreen,
    Profile,
    CreatePost,
    Talks,
    Chat,
    CreateTalks,
    Camera
}, {
    initialRouteName: 'SplashScreen'
})