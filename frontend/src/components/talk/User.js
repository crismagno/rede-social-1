import React from 'react'
import { Image, Text, View, StyleSheet, Dimensions, TouchableOpacity, ToastAndroid } from "react-native";
import helpers from '../../helpers/index'
import IconMCI from 'react-native-vector-icons/MaterialCommunityIcons'
import axios from 'axios'
import { Video } from 'expo-av'

const URL_API = helpers.URL_API
const widthDimension = Dimensions.get('window').width
const heightDimension = Dimensions.get('window').height

import { useSelector, useDispatch } from 'react-redux'

export default props => {

    const myUser = useSelector(state => state.user)

    let { name, avatar } = props.user

    return (
        myUser._id !== props.user._id && 
            <View style={styles.container}>
            <Image style={styles.imageAvatar} source={{ uri: `${URL_API}/files?file=${avatar}` }} /> 
            <View style={styles.TalkCenter}>
                <Text style={styles.textName}>{name}</Text> 
            </View> 
            <View style={styles.TalkRight}>
                <TouchableOpacity style={styles.btnGoChat} onPress={() => props.createTalk(props.user)}>
                    <IconMCI name="plus" size={27} color='#0005' />
                </TouchableOpacity>
            </View>
        </View> 
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: "center",
        width: widthDimension - 20,
        backgroundColor: '#FFF',
        // borderBottomWidth: 1,
        borderColor: "#0001",
        paddingHorizontal: 5,
        height: 80,
        marginBottom: 8,
        borderRadius: 5,

        shadowColor: '#0005',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 1,
    },

    imageAvatar: {
        width: 50,
        height: 50,
        borderRadius: 10,
        marginRight: 7,
    },  

    TalkCenter: {
        flex: 4,
        justifyContent: 'center',
        alignItems: "flex-start",
        height: 70,
        // borderTopWidth: 1,
        // borderBottomWidth: 1,
        // borderColor: "#0001", 
        // backgroundColor: '#0001'

    },

    TalkRight: {
        flex: 1,
        justifyContent: 'center',
        alignItems: "center", 
    },

    textName: {
        color: '#0009',
        fontWeight: 'bold'
    },

    textDescription: {
        color: '#0005',
        fontSize: 11
    },

    btnGoChat: {
        flex: 1,
        justifyContent: 'center',
        alignItems: "center", 
    }
})
