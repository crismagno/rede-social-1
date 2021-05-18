import React, { useState, useEffect } from 'react'
import { Image, Text, View, StyleSheet, Dimensions, 
    TouchableOpacity, ToastAndroid, AsyncStorage, FlatList } from "react-native"
import helpers from '../../helpers/index'
import IconFW from 'react-native-vector-icons/FontAwesome'
import axios from 'axios'
import User from "./User"

const URL_API = helpers.URL_API
const widthDimension = Dimensions.get('window').width
const heightDimension = Dimensions.get('window').height

import { useSelector, useDispatch } from 'react-redux'

export default props => {

    const user = useSelector(state => state.user)
	const socket1 = useSelector(state => state.socket)
    const dispatch = useDispatch({})

    useEffect(() => {
        getUsers()
    }, [])

    const [ users, setUsers ] = useState([]) 
    const [enableLoadCenter, setEnableLoadCenter] = useState(false)

    const showToast = (text, time = 'LONG') => {
        ToastAndroid.show(String(text), ToastAndroid[time])
    }

    const getUsers = async () => {
        try {
            setEnableLoadCenter(true)
            const response = await axios.get(`${URL_API}/users/find-all/${user._id}`)
            setUsers(response.data)
            showToast('usuários carregados')
            setEnableLoadCenter(false)
        } catch (error) {
            showToast('Erro ao buscar conversas')
        }
    }

    const createTalk = async userTalk => {

        const talk = {
            typeTalk: 'normal',
            inviter: user._id,
            users: [ user._id, userTalk._id ],
            admins: [ user._id ],
        }

        const response = await axios.post(`${URL_API}/talks/create`, talk)

        showToast('deu bomm!')
        goTalks()
    }

    const goTalks = () => {
        props.navigation.navigate('Talks')
    }

    const showUsers = () => (

        users.length > 0 &&
        <React.Fragment>
            <View style={styles.talksHeader}>
                <TouchableOpacity style={styles.btnGoHome}
                    onPress={() => goTalks()}>
                    <IconFW name="angle-left" size={20} />       
                </TouchableOpacity>
             </View>
             
            <FlatList style={styles.scrollTalks}
                data={users}
                renderItem={({ item }) => (
                    <User 
                        user={{...item}}
                        createTalk={createTalk}
                    /> 
                    )
                }
                keyExtractor={item => item.id}
            />

            <TouchableOpacity style={styles.btnShowMore}
                onPress={() => getUsers()}>
                <IconFW name="angle-down" size={20} />       
            </TouchableOpacity>
        </React.Fragment>
   
    )


    const imageLoad = () => <Image style={{ width: 100, height: 100}} source={require('./../../../assets/load-palet.gif')} />

    return (
        <View style={styles.container}>
            {enableLoadCenter ? imageLoad() : showUsers()}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: widthDimension,
        height: heightDimension,
        backgroundColor: '#f5f5f5',
    },

    talksHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: widthDimension,
        height: 45,
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 20
    },  

    btnGoHome: {
        padding: 10
    },

    scrollTalks: {

    },

    btnShowMore: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        marginBottom: 10,
        borderRadius: 1000
    }

})
