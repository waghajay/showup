import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, Line } from 'react-native-svg';
import { TrendPoint } from '../../types/habit';
import { Fonts, Radii, Spacing } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';

interface ConsistencyLineChartProps {
  data: TrendPoint[];
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_HEIGHT = 160;
const PADDING = 20;

export const ConsistencyLineChart: React.FC<ConsistencyLineChartProps> = ({ data }) => {
  const { colors } = useTheme();

  const chartWidth = SCREEN_WIDTH - Spacing.gutter * 2 - Spacing.md * 2;
  const usableWidth = chartWidth - PADDING * 2;
  const usableHeight = CHART_HEIGHT - PADDING * 2;

  const minVal = 0;
  const maxVal = 100;

  if (!data || data.length === 0) {
    return (
      <View style={[styles.card, { backgroundColor: colors.surface1, borderColor: colors.border }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Consistency Trend</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Consistency over time</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No consistency data logged yet.</Text>
        </View>
      </View>
    );
  }

  // Calculate coordinates safely for 1 or more points
  const points = data.map((pt, idx) => {
    const xRatio = data.length > 1 ? idx / (data.length - 1) : 0.5;
    const x = PADDING + xRatio * usableWidth;
    const valClamped = Math.max(minVal, Math.min(maxVal, pt.value));
    const y = PADDING + usableHeight - ((valClamped - minVal) / (maxVal - minVal)) * usableHeight;
    return { x, y, value: pt.value, label: pt.label };
  });

  // Construct SVG path d string
  const pathD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  // Fill path closing to bottom
  const lastX = points[points.length - 1].x;
  const firstX = points[0].x;
  const fillD = `${pathD} L ${lastX} ${CHART_HEIGHT - PADDING} L ${firstX} ${CHART_HEIGHT - PADDING} Z`;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface1, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Consistency Trend</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Consistency over time</Text>
      </View>

      <Svg width={chartWidth} height={CHART_HEIGHT}>
        <Defs>
          <LinearGradient id="gradientFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={colors.primary} stopOpacity="0.25" />
            <Stop offset="100%" stopColor={colors.primary} stopOpacity="0.0" />
          </LinearGradient>
        </Defs>

        {/* Horizontal grid lines */}
        {[25, 50, 75, 100].map((val) => {
          const y = PADDING + usableHeight - ((val - minVal) / (maxVal - minVal)) * usableHeight;
          return (
            <Line
              key={val}
              x1={PADDING}
              y1={y}
              x2={chartWidth - PADDING}
              y2={y}
              stroke={colors.border}
              strokeDasharray="4 4"
              strokeWidth="1"
            />
          );
        })}

        {/* Gradient fill */}
        {data.length > 1 && <Path d={fillD} fill="url(#gradientFill)" />}

        {/* Curve Line */}
        {data.length > 1 && <Path d={pathD} fill="none" stroke={colors.primary} strokeWidth="3" />}

        {/* Data points */}
        {points.map((pt, idx) => (
          <Circle
            key={idx}
            cx={pt.x}
            cy={pt.y}
            r={idx === points.length - 1 ? 5 : 3.5}
            fill={colors.primary}
            stroke={colors.surface1}
            strokeWidth="2"
          />
        ))}
      </Svg>

      {/* X-Axis Labels */}
      <View style={styles.labelsRow}>
        {data.map((pt, idx) => (
          <Text key={idx} style={[styles.xLabel, { color: colors.textSecondary }]}>
            {pt.label}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  header: {
    marginBottom: Spacing.sm,
  },
  title: {
    ...Fonts.typography.headlineSm,
  },
  subtitle: {
    ...Fonts.typography.bodySm,
    marginTop: 2,
  },
  emptyContainer: {
    height: CHART_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...Fonts.typography.bodyMd,
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: PADDING - 4,
    marginTop: 4,
  },
  xLabel: {
    ...Fonts.typography.labelCodeSm,
    fontSize: 10,
  },
});
