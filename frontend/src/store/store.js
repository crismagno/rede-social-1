import { createStore } from "redux";

import combine from './combine'

const store = createStore(combine)

export default store