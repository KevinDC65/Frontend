import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  useWindowDimensions,
  View,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { useVsTheme } from '@/theme/theme-context';

export type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export function Icon({ name, size = 20, color }: { name: string; size?: number; color?: string }) {
  const { theme } = useVsTheme();
  return <MaterialCommunityIcons name={name as IconName} size={size} color={color ?? theme.text} />;
}

export function useLayout() {
  const { width } = useWindowDimensions();
  return { width, isWide: width >= 900, isPhone: width < 600 };
}

type TxtVariant = 'hero' | 'h1' | 'h2' | 'h3' | 'body' | 'small' | 'caption' | 'label';

export function Txt({
  variant = 'body',
  color,
  style,
  muted,
  ...rest
}: TextProps & { variant?: TxtVariant; color?: string; muted?: boolean; style?: StyleProp<TextStyle> }) {
  const { theme } = useVsTheme();
  const { isPhone } = useLayout();
  const sizes: Record<TxtVariant, TextStyle> = {
    hero: { fontSize: isPhone ? 36 : 54, lineHeight: isPhone ? 42 : 60, fontWeight: '800', letterSpacing: -1 },
    h1: { fontSize: isPhone ? 24 : 30, lineHeight: isPhone ? 30 : 36, fontWeight: '800' },
    h2: { fontSize: 20, lineHeight: 26, fontWeight: '700' },
    h3: { fontSize: 16, lineHeight: 22, fontWeight: '700' },
    body: { fontSize: 15, lineHeight: 22 },
    small: { fontSize: 13, lineHeight: 18 },
    caption: { fontSize: 11, lineHeight: 15 },
    label: { fontSize: 11, lineHeight: 14, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase' },
  };
  return (
    <Text
      style={[{ color: color ?? (muted ? theme.textSecondary : theme.text), fontFamily: FONT }, sizes[variant], style]}
      {...rest}
    />
  );
}

const FONT = Platform.select({ web: 'Inter, "Segoe UI", system-ui, sans-serif', default: undefined });

export function Card({
  children,
  style,
  selected,
  onPress,
  padded = true,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  selected?: boolean;
  onPress?: () => void;
  padded?: boolean;
}) {
  const { theme } = useVsTheme();
  const base: ViewStyle = {
    backgroundColor: selected ? theme.surfaceSelected : theme.surface,
    borderColor: selected ? theme.primary : theme.border,
    borderWidth: selected ? 1.5 : 1,
    borderRadius: 18,
    padding: padded ? 16 : 0,
    overflow: 'hidden',
    ...(theme.name === 'light'
      ? { boxShadow: '0 4px 16px rgba(11,27,63,0.08)' }
      : Platform.OS === 'web'
        ? ({ backdropFilter: 'blur(12px)' } as ViewStyle)
        : {}),
  };
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
          base,
          hovered && { transform: [{ translateY: -2 }] },
          pressed && { opacity: 0.85 },
          style,
        ]}>
        {children}
      </Pressable>
    );
  }
  return <View style={[base, style]}>{children}</View>;
}

export function Chip({
  label,
  active,
  onPress,
  icon,
  disabled,
  color,
  small,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  icon?: string;
  disabled?: boolean;
  color?: string;
  small?: boolean;
}) {
  const { theme } = useVsTheme();
  const c = color ?? theme.primary;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || !onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={{ selected: active, disabled }}
      style={({ pressed }) => [
        styles.chip,
        small && { paddingVertical: 3, paddingHorizontal: 10 },
        {
          backgroundColor: active ? c : theme.surfaceStrong,
          borderColor: active ? c : theme.border,
          opacity: disabled ? 0.45 : pressed ? 0.8 : 1,
        },
      ]}>
      {icon ? <Icon name={icon} size={14} color={active ? '#fff' : theme.textSecondary} /> : null}
      <Txt variant="small" style={{ fontWeight: '600', fontSize: small ? 12 : 13 }} color={active ? '#fff' : theme.text}>
        {label}
      </Txt>
    </Pressable>
  );
}

export function Badge({ label, tone = 'blue' }: { label: string; tone?: 'blue' | 'red' | 'green' | 'orange' | 'gray' }) {
  const { theme } = useVsTheme();
  const map = { blue: theme.blue, red: theme.red, green: theme.green, orange: theme.orange, gray: theme.textMuted };
  const c = map[tone];
  return (
    <View style={[styles.badge, { borderColor: c, backgroundColor: c + '22' }]}>
      <Txt variant="caption" style={{ fontWeight: '800', letterSpacing: 0.8 }} color={c}>
        {label}
      </Txt>
    </View>
  );
}

export function Button({
  label,
  onPress,
  icon,
  iconLeft,
  variant = 'primary',
  disabled,
  style,
  big,
}: {
  label: string;
  onPress?: () => void;
  icon?: string;
  iconLeft?: string;
  variant?: 'primary' | 'secondary' | 'teal' | 'ghost';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  big?: boolean;
}) {
  const { theme } = useVsTheme();
  const bg =
    variant === 'primary' ? theme.primary : variant === 'teal' ? theme.teal : variant === 'secondary' ? theme.surfaceStrong : 'transparent';
  const fg = variant === 'primary' ? theme.primaryText : variant === 'teal' ? '#fff' : theme.text;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        big && { paddingVertical: 15, paddingHorizontal: 22 },
        {
          backgroundColor: bg,
          borderColor: variant === 'secondary' || variant === 'ghost' ? theme.border : bg,
          opacity: disabled ? 0.45 : pressed ? 0.85 : 1,
        },
        style,
      ]}>
      {iconLeft ? <Icon name={iconLeft} size={18} color={fg} /> : null}
      <Txt variant="body" style={{ fontWeight: '700' }} color={fg}>
        {label}
      </Txt>
      {icon ? <Icon name={icon} size={18} color={fg} /> : null}
    </Pressable>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; disabled?: boolean }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const { theme } = useVsTheme();
  return (
    <View style={[styles.segmented, { backgroundColor: theme.surfaceStrong, borderColor: theme.border }]}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            disabled={o.disabled}
            onPress={() => onChange(o.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: active, disabled: o.disabled }}
            style={[styles.segment, active && { backgroundColor: theme.primary }, o.disabled && { opacity: 0.4 }]}>
            <Txt variant="small" style={{ fontWeight: '600' }} color={active ? theme.primaryText : theme.text}>
              {o.label}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label?: string }) {
  const { theme } = useVsTheme();
  return (
    <View style={styles.row}>
      {label ? (
        <Txt variant="small" style={{ flex: 1, fontWeight: '600' }}>
          {label}
        </Txt>
      ) : null}
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: theme.border, true: theme.primary }}
        thumbColor="#fff"
        accessibilityLabel={label}
      />
    </View>
  );
}

export function Notice({ icon = 'alert', color, children }: { icon?: string; color?: string; children: ReactNode }) {
  const { theme } = useVsTheme();
  const c = color ?? theme.amber;
  return (
    <View style={[styles.notice, { borderColor: c + '66', backgroundColor: c + '18' }]}>
      <Icon name={icon} size={18} color={c} />
      <Txt variant="small" style={{ flex: 1 }}>
        {children}
      </Txt>
    </View>
  );
}

export function Divider() {
  const { theme } = useVsTheme();
  return <View style={{ height: 1, backgroundColor: theme.border, marginVertical: 12 }} />;
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
  },
  badge: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 1, alignSelf: 'flex-start' },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1,
  },
  segmented: { flexDirection: 'row', borderRadius: 12, borderWidth: 1, padding: 3, gap: 2 },
  segment: { flex: 1, alignItems: 'center', paddingVertical: 7, paddingHorizontal: 10, borderRadius: 9 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  notice: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', borderWidth: 1, borderRadius: 12, padding: 12 },
});
