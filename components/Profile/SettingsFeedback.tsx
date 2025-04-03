import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { sendFeedback } from "@/lib/supabase_profile";
import { useGlobalContext } from "@/context/Context";
import RNPickerSelect from "react-native-picker-select";
import Entypo from "@expo/vector-icons/Entypo";

type FeedbackType = "Bug" | "Feedback" | "Feature Request" | "General";

interface FeedbackForm {
  type: FeedbackType;
  subject: string;
  description: string;
}

interface FormErrors {
  type?: string;
  subject?: string;
  description?: string;
}

const FeedbackFormComponent = () => {
  const { user } = useGlobalContext();
  const [formData, setFormData] = useState<FeedbackForm>({
    type: "Feedback",
    subject: "",
    description: ""
  });

  const handleDropDownChange = (value: string) => {
    setFormData({
      ...formData,
      type: value as FeedbackType,
    });
  };

  const intervals = [
    { label: "Bug", value: "Bug", color: "black" }, // Add color property for each item
    { label: "Feedback", value: "Feedback", color: "black" },
    { label: "Feature Request", value: "Feature Request", color: "black" },
    { label: "General", value: "General", color: "black" },
  ];

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    } else if (formData.subject.length > 100) {
      newErrors.subject = "Subject must be less than 100 characters";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearForm = () => {
    setFormData({
      type: "Feedback",
      subject: "",
      description: "",
    });
    setErrors({});
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        const response = await sendFeedback(
          user.userId,
          user.email,
          formData.subject,
          formData.description,
          formData.type
        );

        if (response.success) {
          Alert.alert("Success", "Thank you for your feedback!", [
            {
              text: "OK",
              onPress: clearForm,
            },
          ]);
        } else {
          Alert.alert("Error", "Failed to submit feedback. Please try again.", [
            { text: "OK" },
          ]);
        }
      } catch (error) {
        Alert.alert(
          "Error",
          "An unexpected error occurred. Please try again later.",
          [{ text: "OK" }]
        );
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <ScrollView>
      <View style={styles.formContainer}>
        <Text style={styles.label}>Feedback Category</Text>
        <RNPickerSelect
          onValueChange={handleDropDownChange}
          items={intervals}
          placeholder={{
            label: "Select an interval",
            value: null,
            color: "gray",
          }}
          style={{
            ...pickerSelectStyles,
          }}
          value={formData.type}
          Icon={() => {
            return <Entypo name="chevron-down" size={38} color="black" />;
          }}
        />
        <Text style={styles.label}>Subject</Text>
        <TextInput
          style={styles.input}
          value={formData.subject}
          onChangeText={(text) => setFormData({ ...formData, subject: text })}
          placeholder="Brief summary of your feedback"
          placeholderTextColor={"#898989"}
          maxLength={100}
        />
        {errors.subject && (
          <Text style={styles.errorText}>{errors.subject}</Text>
        )}

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.description}
          onChangeText={(text) =>
            setFormData({ ...formData, description: text })
          }
          placeholder="Provide details of your feedback or issue"
          placeholderTextColor={"#898989"}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
        {errors.description && (
          <Text style={styles.errorText}>{errors.description}</Text>
        )}

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit Feedback</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  textArea: {
    height: 200, // Adjust height as needed
  },
  errorText: {
    color: "#ff0000",
    fontSize: 14,
    marginBottom: 8,
  },
  submitButton: {
    backgroundColor: "#3e4e88",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    fontWeight: "bold",
    padding: 10,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 4,
    color: "black", // Change text color for iOS
    marginBottom: 3,
  },
  inputAndroid: {
    fontSize: 16,
    fontWeight: "bold",
    padding: 10,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 4,
    color: "blue", // Change text color for Android
  },
  viewContainer: {
    marginBottom: 10, // Add some margin to the container
    backgroundColor: "#fff", // Ensure the background is white for visibility
    borderRadius: 8, // Match the border radius with input fields
  },
  placeholder: {
    color: "gray", // Change placeholder text color
  },
});

export default FeedbackFormComponent;
