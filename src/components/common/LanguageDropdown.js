import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { useTranslation } from "react-i18next"; // Adjust import if needed
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const LANGUAGES = ["en", "hi", "bho"];

const LANGUAGE_LABELS = {
  en: "English",
  hi: "हिन्दी",
  bho: "भोजपुरी",
};

const LanguageDropdown = ({ containerStyle }) => {
  const { i18n } = useTranslation();
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const handleLanguageSelect = (lang) => {
    i18n.changeLanguage(lang);
    setIsDropdownVisible(false);
  };

  const currentLangLabel = LANGUAGE_LABELS[i18n.language] || "English";

  return (
    <>
      {/* Overlay to detect outside press */}
      {isDropdownVisible && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setIsDropdownVisible(false)}
        />
      )}

      <View style={[styles.wrapper, containerStyle]}>
        {/* Main Button */}
        <TouchableOpacity
          onPress={() => setIsDropdownVisible(!isDropdownVisible)}
          style={styles.langButton}
          activeOpacity={0.7}
        >
          <View style={styles.langLeftContent}>
            <MaterialCommunityIcons
              name="translate"
              size={20}
              color="#2A9D8F"
            />
            <Text style={styles.langText} numberOfLines={1}>
              {currentLangLabel}
            </Text>
          </View>

          <MaterialCommunityIcons
            name={isDropdownVisible ? "chevron-up" : "chevron-down"}
            size={20}
            color="#2A9D8F"
          />
        </TouchableOpacity>

        {/* Dropdown Menu */}
        {isDropdownVisible && (
          <View style={styles.dropdownContainer}>
            {LANGUAGES.map((lang, index) => {
              const isLast = index === LANGUAGES.length - 1;
              const isActive = i18n.language === lang;

              return (
                <TouchableOpacity
                  key={lang}
                  style={[
                    styles.dropdownItem,
                    !isLast && styles.dropdownItemBorder,
                  ]}
                  onPress={() => handleLanguageSelect(lang)}
                >
                  <Text
                    style={[
                      styles.dropdownText,
                      isActive && styles.activeDropdownText,
                    ]}
                  >
                    {LANGUAGE_LABELS[lang]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  // The wrapper handles where the whole widget sits on the screen
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
  },
  wrapper: {
    position: "absolute",
    top: 40,
    right: 10,
    zIndex: 100, // High z-index so the dropdown goes over other content
  },
  langButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: "#2A9D8F",
    width: 120, // Keeps the button size constant
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  langLeftContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  langText: {
    color: "#2A9D8F",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 15,
  },
  dropdownContainer: {
    position: "absolute",
    top: 50, // Drops right below the button
    right: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: "#2A9D8F",
    width: 120, // Matches the button width
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    overflow: "hidden",
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  dropdownItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  dropdownText: {
    color: "#333",
    fontSize: 15,
    fontWeight: "500",
  },
  activeDropdownText: {
    color: "#2A9D8F",
    fontWeight: "bold",
  },
});

export default LanguageDropdown;
