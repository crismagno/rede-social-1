import { combineReducers } from "redux";

import user from './../reducers/user'
import socket from './../reducers/socket'
import talk from './../reducers/talk'

export default combineReducers({
    user,
    socket,
    talk
})
