import React, { useState, useEffect} from 'react'
import { View, Text, Image, StyleSheet, AsyncStorage } from 'react-native'
import { DrawerItems } from 'react-navigation'
import { useSelector } from "react-redux";

import helpers from '../helpers/index'
const URL_API = helpers.URL_API

export default props => {

    const user = useSelector(state => state.user)

    return (
        <View style={styles.container}>
            <View style={styles.containerHeader}>
                <Image style={styles.imageAvatar} source={{ uri: `${URL_API}/files/?file=${user.avatar}` }} /> 
                <View style={styles.infoUser}>
                    <View  style={styles.infoUserName}>
                        <Text style={styles.infoText}>{user.name}</Text> 
                        <View style={[styles.status, styles[user.online_at ? 'statusOn' : 'statusOff']]}></View>
                    </View>
                    
                    <Text style={styles.infoText}>{user.email}</Text> 
                </View>
            </View>

            <DrawerItems {...props} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        // marginTop: 30,
        backgroundColor: '#FFF'
    },

    containerHeader: {
        position: 'relative'
    },

    imageAvatar: {
        width: 290,
        height: 200,
    },

    infoUser: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        padding: 3,
        width: 300,
        backgroundColor: '#0002'
    },

    infoUserName: {
        flexDirection: 'row',
        alignItems: 'center'
    },

    infoText: {
        color: '#FFF',
        fontSize: 11
    },

    status: {
        width: 8,
        height: 8,
        borderColor: '#FFF',
        borderWidth: 0.5,
        borderRadius: 20,
        marginLeft: 4
    },

    statusOn: {
        backgroundColor: '#00e676',
    },

    statusOff: {
        backgroundColor: 'red',
    }

})