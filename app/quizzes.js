// app/quizzes.js
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import ScreenWrapper from "../src/components/common/ScreenWrapper";
import useFarmerOnly from "../hooks/useFarmerOnly";
import { useAuth } from "../src/context/AuthContext";
// import { API_BASE_URL } from "../secret";
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export default function QuizzesScreen() {
  const isFarmer = useFarmerOnly();
  const { user } = useAuth();
  const authToken = user?.token;
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const router = useRouter();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Category labels inside component so t() works
  const CATEGORY_LABELS = {
    pest_disease: t("Pest & Disease"),
    farming_practices: t("Farming Practices"),
    market_knowledge: t("Market Knowledge"),
    govt_schemes: t("Govt Schemes"),
  };

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      const load = async () => {
        if (!authToken) return;
        try {
          setLoading(true);
          const res = await fetch(`${API_BASE_URL}/api/gamification/quizzes`, {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Accept-Language": lang,
            },
          });
          const json = await res.json();
          if (!cancelled) {
            if (res.ok) setQuizzes(json.quizzes ?? []);
            else console.error("Quiz list error:", json.message);
          }
        } catch (e) {
          console.error("Quiz fetch error:", e);
        } finally {
          if (!cancelled) setLoading(false);
        }
      };
      load();
      return () => {
        cancelled = true;
      };
    }, [authToken, lang]),
  );

  if (!isFarmer) return null;

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2A9D8F" />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#264653" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>{t("Knowledge Quizzes")}</Text>
          <Text style={styles.headerSub}>
            {t("Learn. Earn points. Level up.")}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {quizzes.length === 0 ? (
          <View style={styles.empty}>
            <MaterialCommunityIcons
              name="book-open-outline"
              size={48}
              color="#BDBDBD"
            />
            <Text style={styles.emptyText}>
              {t("No quizzes available yet.")}
            </Text>
          </View>
        ) : (
          quizzes.map((quiz, idx) => (
            <QuizCard
              key={quiz._id}
              quiz={quiz}
              index={idx}
              router={router}
              t={t}
              categoryLabel={CATEGORY_LABELS[quiz.category] ?? quiz.category}
            />
          ))
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

function QuizCard({ quiz, index, router, t, categoryLabel }) {
  const statusColor = quiz.passed
    ? "#4CAF50"
    : quiz.unlocked
      ? "#2A9D8F"
      : "#BDBDBD";
  const statusIcon = quiz.passed
    ? "check-circle"
    : quiz.unlocked
      ? "play-circle"
      : "lock";

  const handlePress = () => {
    if (!quiz.unlocked) {
      Alert.alert(
        t("Locked"),
        t("Complete the previous quiz to unlock this one."),
      );
      return;
    }
    router.push({
      pathname: "/quiz-attempt",
      params: { id: quiz._id, title: quiz.title },
    });
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.85}
    >
      <View style={styles.cardLeft}>
        <View style={[styles.orderBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.orderText}>{index + 1}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.cardTopRow}>
          <Text style={styles.cardCategory}>{categoryLabel}</Text>
          {quiz.passed && (
            <View style={styles.passedBadge}>
              <Text style={styles.passedText}>{t("Passed")}</Text>
            </View>
          )}
        </View>
        <Text style={styles.cardTitle}>{quiz.title}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>
          {quiz.description}
        </Text>
        <View style={styles.cardMeta}>
          <MaterialCommunityIcons
            name="help-circle-outline"
            size={14}
            color="#888"
          />
          <Text style={styles.metaText}>
            {quiz.questionCount} {t("questions")}
          </Text>
          <MaterialCommunityIcons
            name="star-outline"
            size={14}
            color="#888"
            style={{ marginLeft: 10 }}
          />
          <Text style={styles.metaText}>{t("50 pts on first pass")}</Text>
        </View>
        {quiz.lastScore !== null && (
          <Text style={styles.lastScore}>
            {t("Last score")}: {quiz.lastScore}%
          </Text>
        )}
      </View>

      <MaterialCommunityIcons
        name={statusIcon}
        size={28}
        color={statusColor}
        style={styles.statusIcon}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: "#FFF",
  },
  back: { marginRight: 4 },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#264653" },
  headerSub: { fontSize: 12, color: "#888" },
  scroll: { padding: 16, paddingBottom: 40 },
  empty: { alignItems: "center", marginTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: "#BDBDBD" },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
    gap: 12,
  },
  cardLeft: { alignItems: "center" },
  orderBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  orderText: { color: "#FFF", fontWeight: "800", fontSize: 14 },
  cardBody: { flex: 1 },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  cardCategory: {
    fontSize: 11,
    color: "#888",
    textTransform: "uppercase",
    fontWeight: "600",
  },
  passedBadge: {
    backgroundColor: "#E8F5E9",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  passedText: { fontSize: 11, color: "#4CAF50", fontWeight: "700" },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#264653",
    marginBottom: 4,
  },
  cardDesc: { fontSize: 12, color: "#666", lineHeight: 17, marginBottom: 6 },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 11, color: "#888" },
  lastScore: {
    fontSize: 11,
    color: "#2A9D8F",
    marginTop: 4,
    fontWeight: "600",
  },
  statusIcon: { marginLeft: 4 },
});
