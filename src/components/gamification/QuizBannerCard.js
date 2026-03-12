// src/components/gamification/QuizBannerCard.js
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
// import { API_BASE_URL } from "../../../secret";
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export default function QuizBannerCard() {
  const { user } = useAuth();
  const authToken = user?.token;
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const [quiz, setQuiz] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!authToken) {
      setReady(true);
      return;
    }
    fetch(`${API_BASE_URL}/api/gamification/quizzes`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Accept-Language": lang,
      },
    })
      .then((r) => r.json())
      .then((json) => {
        const next = (json.quizzes ?? []).find((q) => q.unlocked && !q.passed);
        setQuiz(next || null);
      })
      .catch((err) => console.error("[QuizBannerCard] fetch error:", err))
      .finally(() => setReady(true));
  }, [authToken, lang]); // re-fetch when language changes so title shows in right language

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="small" color="#2A9D8F" />
      </View>
    );
  }

  // All quizzes done — congrats card
  if (!quiz) {
    return (
      <TouchableOpacity
        style={styles.completedCard}
        onPress={() => router.push("/quizzes")}
        activeOpacity={0.85}
      >
        <MaterialCommunityIcons name="trophy" size={24} color="#FFD700" />
        <Text style={styles.completedText}>
          {t("All quizzes completed! View your badges")} →
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push("/quizzes")}
      activeOpacity={0.85}
    >
      <View style={styles.iconWrap}>
        <MaterialCommunityIcons
          name="head-lightbulb-outline"
          size={32}
          color="#FFF"
        />
      </View>
      <View style={styles.body}>
        <Text style={styles.eyebrow}>📚 {t("Quiz Available")}</Text>
        <Text style={styles.title} numberOfLines={1}>
          {quiz.title}
        </Text>
        <Text style={styles.sub}>
          {quiz.questionCount} {t("questions")} · {t("Earn 50 pts")}
        </Text>
      </View>
      <View style={styles.arrow}>
        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color="#2A9D8F"
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  loading: { height: 72, justifyContent: "center", alignItems: "center" },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FAF9",
    borderWidth: 1.5,
    borderColor: "#2A9D8F",
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 14,
    gap: 12,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: "#2A9D8F",
    justifyContent: "center",
    alignItems: "center",
  },
  body: { flex: 1 },
  eyebrow: {
    fontSize: 11,
    color: "#2A9D8F",
    fontWeight: "700",
    marginBottom: 2,
  },
  title: { fontSize: 14, fontWeight: "700", color: "#264653" },
  sub: { fontSize: 11, color: "#666", marginTop: 2 },
  arrow: { justifyContent: "center" },
  completedCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFFDE7",
    borderWidth: 1,
    borderColor: "#FFD700",
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 14,
  },
  completedText: { fontSize: 13, color: "#F57F17", fontWeight: "600", flex: 1 },
});
