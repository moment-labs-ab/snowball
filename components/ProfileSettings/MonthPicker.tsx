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
import MonthPickerModal from "react-native-month-year-picker"; // Make sure this is installed!
import MonthYearModal from "@/modals/MonthYearModal";

interface MonthPickerProps {
  onMonthChange?: (date: Date) => void;
  initialDate?: Date;
}

const MonthPicker: React.FC<MonthPickerProps> = ({
  onMonthChange,
  initialDate,
}) => {
  const [currentDate, setCurrentDate] = useState(initialDate || new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    if (initialDate) {
      setCurrentDate(initialDate);
    }
  }, [initialDate]);

  const changeMonth = (direction: number) => {
    const newDate = moment(currentDate).add(direction, "months").toDate();
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
            setCurrentDate(date)
          setIsModalVisible(false);
          onMonthChange?.(date)
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
