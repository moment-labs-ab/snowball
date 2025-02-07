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

interface FeedbackForm {
  shortDescription: string;
  longDescription: string;
}

interface FormErrors {
  shortDescription?: string;
  longDescription?: string;
}

const FeedbackFormComponent = () => {
  const { user } = useGlobalContext();
  const [formData, setFormData] = useState<FeedbackForm>({
    shortDescription: "",
    longDescription: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.shortDescription.trim()) {
      newErrors.shortDescription = "Short description is required";
    } else if (formData.shortDescription.length > 100) {
      newErrors.shortDescription =
        "Short description must be less than 100 characters";
    }

    if (!formData.longDescription.trim()) {
      newErrors.longDescription = "Long description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendFeedback = async (
    user_id: string,
    shortDescription: string,
    longDescription: string
  ) => {
    const data = sendFeedback(user_id, shortDescription, longDescription);
    return data;
  };
  const clearForm = () => {
    setFormData({
      shortDescription: "",
      longDescription: "",
    });
    setErrors({});
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        const response = await sendFeedback(
          user.userId,
          formData.shortDescription,
          formData.longDescription
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

  console.log("Feedback");
  return (
    <ScrollView>
      <View style={styles.formContainer}>
        <Text style={styles.label}>Short Description</Text>
        <TextInput
          style={styles.input}
          value={formData.shortDescription}
          onChangeText={(text) =>
            setFormData({ ...formData, shortDescription: text })
          }
          placeholder="Brief summary of your feedback"
          placeholderTextColor={"#898989"}
          maxLength={100}
        />
        {errors.shortDescription && (
          <Text style={styles.errorText}>{errors.shortDescription}</Text>
        )}

        <Text style={styles.label}>Detailed Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.longDescription}
          onChangeText={(text) =>
            setFormData({ ...formData, longDescription: text })
          }
          placeholder="Provide detailed feedback here"
          placeholderTextColor={"#898989"}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
        {errors.longDescription && (
          <Text style={styles.errorText}>{errors.longDescription}</Text>
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
    height: 120,
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

export default FeedbackFormComponent;
