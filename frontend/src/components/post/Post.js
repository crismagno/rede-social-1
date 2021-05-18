import React from 'react'
import { Image, Text, View, StyleSheet, Dimensions, TouchableOpacity, ToastAndroid } from "react-native";
import helpers from '../../helpers/index'
import IconEveil from 'react-native-vector-icons/EvilIcons'
import axios from 'axios'
import { Video } from 'expo-av'

const URL_API = helpers.URL_API
const widthDimension = Dimensions.get('window').width
const heightDimension = Dimensions.get('window').height

export default props => {

    const { _id, media, description, userId, getPosts } = props
    const { ...user } = props.user

    showToast = (text, time = 'LONG') => {
        ToastAndroid.show(String(text), ToastAndroid[time])
    }

    removePost = async postId => {
        try {
            await axios.delete(`${URL_API}/posts/remove/${postId}`)
            getPosts()
            showToast('post removido com sucesso.')
        } catch (error) {
            showToast('erro ao remover post.')
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.containerAvatar}>
                    <Image style={styles.imageAvatar} source={{ uri: `${URL_API}/files?file=${user.avatar}` }} />  
                    <Text style={styles.nameAuthor}>{user.name}</Text>
                </View>
                <View style={styles.headerRight}>
                    <IconEveil name="gear" size={25} />
                </View>
            </View>
            <View style={styles.containerMedia}>
                { media.type === 'image/jpg' ? 
                    <Image style={styles.imagePost} source={{ uri: `${URL_API}/files?file=${media.url}` }} />
                    :   
                    <Video
                        style={styles.videoPost}
                        source={{ uri: `${URL_API}/files?file=${media.url}` }}
                        rate={1.0}
                        volume={1.0}
                        resizeMode="stretch"
                        shouldPlay={false}
                        isLooping={true}
                        useNativeControls={true}
                        positionMillis={10}
                    />
                }
            </View>
            
            <View style={styles.containerFooter1}>
                
                <View style={styles.containerBtnsLeft}>

                    <TouchableOpacity style={styles.btnTypeIcon}>
                        <IconEveil name="like" size={30} color='#000' />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnTypeIcon}>
                        <IconEveil name="comment" size={30} color='#000' />
                    </TouchableOpacity>
                </View>
                    
                <View style={styles.containerBtnsRight}>
                    {
                        userId === user._id && 
                        <TouchableOpacity
                            onPress={() => removePost(props._id)}>
                            <IconEveil name="trash" size={30} style={styles.icon}/>
                        </TouchableOpacity>
                    }
                </View>
                
            </View>
            {/* <View style={styles.containerFooter2}>
                <Text style={styles.textColor}>{description}</Text>
            </View> */}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: widthDimension - 20,
        marginBottom: 15,
        backgroundColor: '#FFF',
        borderColor: "#0001",
        borderRadius: 10,
        paddingVertical: 3,
        paddingHorizontal: 5,

        shadowColor: '#0005',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 1,
    },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#FFF',
        height: 40,
    },

    headerRight: {
        justifyContent: 'center',
    },

    containerMedia: {

    },

    textColor: {
        color: '#000'
    },

    imagePost: {
        width: widthDimension - 30.5,
        height: 300
    },

    videoPost: {
        width: widthDimension - 30.5,
        height: 300,
    },

    containerFooter1: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 5,
        backgroundColor: '#FFF'
    },
    containerFooter2: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: 5,
        paddingHorizontal: 7,
        backgroundColor: '#FFF',
        maxHeight: 45,
        borderWidth: 1,
        borderColor: '#0002'
    },

    containerAvatar: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },

    imageAvatar: {
        width: 30,
        height: 30,
        borderRadius: 50,
        marginRight: 7,
        resizeMode: 'contain'
    },  

    nameAuthor: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 16
    },
    
    //classes universais
    containerBtnsLeft: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'baseline',
        // borderWidth: 1
    },

    containerBtnsRight: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        // borderWidth: 1
    },

    btnTypeIcon: {
        marginLeft: 2
    },

    icon: {
        color: '#000'
    }

})