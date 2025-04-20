import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import moment from "moment";
import MonthYearModal from "@/modals/MonthYearModal";
import { useGlobalContext } from "@/context/Context";
import { Toast } from "react-native-toast-message/lib/src/Toast";

interface MonthPickerProps {
  onMonthChange?: (date: Date) => void;
  initialDate?: Date;
}

const MonthPicker: React.FC<MonthPickerProps> = ({
  onMonthChange,
  initialDate,
}) => {

  const {user} = useGlobalContext();
  const [currentDate, setCurrentDate] = useState(initialDate || new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    if (initialDate) {
      setCurrentDate(initialDate);
    }
  }, [initialDate]);

  const checkDate = (dateToCheck: Date, isPremiumUser: boolean): boolean => {
    if (isPremiumUser) return true;
  
    const oneMonthAgo = moment().startOf("month").subtract(1, "month");
    return moment(dateToCheck).isSameOrAfter(oneMonthAgo);
  };

  const changeMonth = (direction: number) => {
    const newDate = moment(currentDate).add(direction, "months").toDate();
  
    if (!checkDate(newDate, user.premiumUser)) {
      showToast();
      return;
    }
  
    setCurrentDate(newDate);
    onMonthChange?.(newDate);
  };

  const onValueChange = (event: any, newDate?: Date) => {
    if (newDate) {
      setCurrentDate(newDate);
      onMonthChange?.(newDate);
    }
    setShowPicker(false);
  };

  const today = new Date();

  const showToast = () => {
    Toast.show({
      type: "error",
      text1: "Premium Feature",
      text2: "Unlock past Month selection with Premium!",
      visibilityTime: 3200,
      position: "top",
      autoHide: true,
      props: {
        onPress: () => {
        }, // Navigate to your premium page
      },
    });
  };

  return (
    <View style={{borderWidth:1, padding:2, borderRadius:5, backgroundColor:'#dcdde0', flexDirection:'row'}}>
     
        
        <TouchableOpacity
          onPress={() => changeMonth(-1)}
          style={styles.arrowButton}
        >
          <AntDesign name="left" size={20} color="#3e4e88" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setIsModalVisible(true)}
          
        >
          <Text style={styles.dateText}>
            {moment(currentDate).format("MMM YYYY")}
          </Text>
        </TouchableOpacity>

        {!moment(currentDate).isSame(moment(today), "month") ? (
          <TouchableOpacity onPress={() => changeMonth(1)}>
            <AntDesign name="right" size={20} color="#3e4e88" />
          </TouchableOpacity>
        ) : (
          <AntDesign name="right" size={20} color='#c2c4c8' />
        )}
         
    

      <MonthYearModal
        visible={isModalVisible}
        selectedDate={currentDate}
        onClose={() => setIsModalVisible(false)}
        onSelect={(date) => {
          if (!checkDate(date, user.premiumUser)) {
            showToast();
            return;
          }
        
          setCurrentDate(date);
          setIsModalVisible(false);
          onMonthChange?.(date);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  dateContainer: {
    flexDirection: "row",
  },
  dateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#3e4e88",
  },
  dateTextContainer: {
    flex: 1,

  },
  arrowButton: {
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  pickerWrapper: {
    backgroundColor: "white",
    padding: 16,
  },
});

export default MonthPicker;
