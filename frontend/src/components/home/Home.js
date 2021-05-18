import React, { useEffect, useState } from 'react';
import { 
	StyleSheet, 
	Text, 
	View, 
	Dimensions,
	ToastAndroid, 
	Image, 
	FlatList 
} from 'react-native';
import helpers from './../../helpers/index'
import axios from 'axios'
const URL_API = helpers.URL_API
const widthDimension = Dimensions.get('window').width
const heightDimension = Dimensions.get('window').height
import io from 'socket.io-client'
import Post from "./../post/Post";

import { useSelector, useDispatch } from 'react-redux'

export default props => {

	useEffect(() => {

		if(socket1.socket) {
			socket1.socket.on(`res-status-online-${user._id}`, data => {
				dispatch({
					type: 'CHANGE_ONLINE',
					payload: true
				})
			})
	
			socket1.socket.on('disconnect', () => {
				dispatch({
					type: 'CHANGE_ONLINE',
					payload: false
				})
			})
		} else {
			dispatch({
				type: 'CREATE_SOCKET',
				payload: io(`${URL_API}?id_user=${user._id}`, { 
					transports: ['websocket'],
					forceNew: true
				})
			})
		}

		getPosts()
	}, [])

	const user = useSelector(state => state.user)
	const socket1 = useSelector(state => state.socket)
	const dispatch = useDispatch({})

	const [posts, setPosts] = useState([])
	const [enableLoadCenter, setEnableLoadCenter] = useState(false)

	const changeName = name => {
		dispatch({
			type: 'CHANGE_NAME',
			payload: name
		})
	}

	const getPosts = async () => {

		setEnableLoadCenter(true)
		
		try {
			const response = await axios(`${URL_API}/posts/find/all/${user._id}`)
			const posts = response.data
			setPosts(posts)
			setEnableLoadCenter(false)
		} catch (error) {

		}

	}

	const verifyPosts = () => (
		posts.length === 0 ? <Text>Nenhum post</Text> 
		:
		<FlatList
			showsVerticalScrollIndicator={false}
			data={posts}
			renderItem={({ item }) => 
				<Post 
					{...item} 
					userId={user._id}
					getPosts={getPosts}
				/>
			}
			keyExtractor={item => item.id}
		/>
	)

	const imageLoad = () => <Image style={{ width: 70, height: 70}} source={require('./../../../assets/load-palet.gif')} />

	return(
		<View style={styles.container} >
			{ enableLoadCenter ? imageLoad() : verifyPosts() }
		</View>
	)
	
}


const styles = StyleSheet.create({
	container: {
        flex: 1,
		width: widthDimension,
		height: heightDimension,
		backgroundColor: '#f5f5f5',
		// backgroundColor: '#000',
		alignItems: 'center',
		justifyContent: 'center',
		paddingTop: 10
	},

	header: {
		backgroundColor: '#FFF',
		width: widthDimension,
		height: 70,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'flex-start',
		padding: 3,
		borderBottomWidth: 1,
		borderColor: '#0002'
	},

	inputHeader: {
		flex: 1,
		paddingHorizontal: 5,
		paddingVertical: 15,
		marginLeft: 5,
		// borderWidth: 1
	},	

	imageUser: {
		width: 50,
		height: 50,
		borderRadius: 60,
		resizeMode: "contain"
	},

	body: {
		flex: 20,
		backgroundColor: '#FFF',
		width: widthDimension,
		height: 100
	},

	scrollBody: {
		backgroundColor: 'rgb(225,226,225)'
	},	

	post: {
		width: widthDimension,
		height: heightDimension/2,
		backgroundColor: 'red'
	},	

	imagePost: {
		flex: 1,
		width: widthDimension,
	},	

	descriptionPost: {
		height: 50,
		padding: 5,
		borderWidth: 1
	},

	footer: {
		flex: 1,
		backgroundColor: 'green'
	},

	btnCHange: {
		width: 300,
		height: 50,
		backgroundColor: '#FFF'
	}
});
