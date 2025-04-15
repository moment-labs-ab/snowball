import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import moment from "moment";

interface Props {
  visible: boolean;
  selectedDate: Date;
  onClose: () => void;
  onSelect: (selectedDate: Date) => void;
}

const months = moment.months(); // ['January', 'February', ... 'December']

const MonthYearModal: React.FC<Props> = ({ visible, selectedDate, onClose, onSelect }) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  useEffect(()=>{
    setSelectedYear(selectedDate.getFullYear())
    setSelectedMonth(selectedDate.getMonth())

  },[])

  const handleMonthSelect = (monthIndex: number) => {
    if (
      selectedYear < currentYear ||
      (selectedYear === currentYear && monthIndex <= currentMonth)
    ) {
      setSelectedMonth(monthIndex);
    }
  };

  const handleConfirm = () => {
    const selectedDate = new Date(selectedYear, selectedMonth, 1);
    onSelect(selectedDate);
    onClose();
  };

  const renderMonthItem = ({ item, index }: { item: string; index: number }) => {
    const isDisabled =
      selectedYear === currentYear && index > currentMonth;
    const isSelected = index === selectedMonth && !isDisabled;

    return (
      <TouchableOpacity
        style={[
          styles.monthItem,
          isSelected && styles.selectedMonthItem,
          isDisabled && styles.disabledMonthItem,
        ]}
        onPress={() => handleMonthSelect(index)}
        disabled={isDisabled}
      >
        <Text
          style={[
            styles.monthText,
            isSelected && styles.selectedMonthText,
            isDisabled && styles.disabledMonthText,
          ]}
        >
          {item}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Year Navigation */}
          <View style={styles.yearContainer}>
            <TouchableOpacity
              onPress={() => setSelectedYear((y) => y - 1)}
            >
              <AntDesign name="left" size={24} color="#3e4e88" />
            </TouchableOpacity>

            <Text style={styles.yearText}>{selectedYear}</Text>

            {selectedYear < currentYear ? (
              <TouchableOpacity
                onPress={() => setSelectedYear((y) => y + 1)}
              >
                <AntDesign name="right" size={24} color="#3e4e88" />
              </TouchableOpacity>
            ) : (
              <AntDesign name="right" size={24} color="#ccc" />
            )}
          </View>

          {/* Month Grid */}
          <FlatList
            data={months}
            numColumns={3}
            keyExtractor={(item) => item}
            renderItem={renderMonthItem}
            contentContainerStyle={styles.monthGrid}
          />

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancelText}>Close</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleConfirm}>
              <Text style={styles.selectText}>Select</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#dcdde0",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical:24,
    width: "85%",
    alignItems: "center",
  },
  yearContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    justifyContent: "space-between",
    width: "60%",
  },
  yearText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#3e4e88",
  },
  monthGrid: {
    alignItems: "center",
  },
  monthItem: {
    width: 90,
    padding: 10,
    margin: 6,
    borderRadius: 8,
    backgroundColor: "#edf5fe",
    alignItems: "center",
  },
  selectedMonthItem: {
    backgroundColor: "#3e4e88",
  },
  disabledMonthItem: {
    backgroundColor: "#f0f0f0",
  },
  monthText: {
    fontSize: 12,
    color: "#3e4e88",
  },
  selectedMonthText: {
    color: "white",
    fontWeight: "bold",
  },
  disabledMonthText: {
    color: "#aaa",
  },
  actions: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
  },
  cancelText: {
    fontSize: 16,
    color: "#666",
  },
  selectText: {
    fontSize: 16,
    color: "#3e4e88",
    fontWeight: "600",
  },
});

export default MonthYearModal;
