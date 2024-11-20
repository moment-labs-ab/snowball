import { View, Text, StyleSheet, Touchable, TouchableOpacity, Image } from 'react-native'
import React, {FC} from 'react'
import AntDesign from '@expo/vector-icons/AntDesign';
import icons from '@/constants/icons';
import images from '../../constants/images'


interface DraggableListHeaderProps{
    title?: string;
    onPress?: ()=>void;
    isSwipe?: boolean;

}

const DraggableListHeader: FC<DraggableListHeaderProps>= ({
    title = '',
    onPress = ()=>{},
    isSwipe = false
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <TouchableOpacity>
        <Image
        source={isSwipe ? images.leftArrow : images.editIcon}
        style={{
            height:isSwipe? 20:25,
            width: isSwipe ? 20:25,
            resizeMode: 'contain'
        }}
        
        />


      </TouchableOpacity>
    </View>
  )
}

export default DraggableListHeader

const styles = StyleSheet.create({
    container:{
        height:40,
        flexDirection:'row',
        alignItems:'center',
        borderBottomWidth:1,
        borderBottomColor:'black',
        paddingHorizontal:'5%'
    },
    title:{
        fontSize:22,
        color:'black',
        fontWeight:'500'
    }
})