import type { ThemeConfig } from 'antd';

const theme: ThemeConfig = {
  token: {
    colorPrimary: '#e11d48',
    colorBgBase: '#0a0a0b',
    colorBgContainer: '#1c1c1f',
    colorBgElevated: '#18181b',
    colorBgLayout: '#0a0a0b',
    colorBgSpotlight: '#111113',
    colorBorder: '#27272a',
    colorBorderSecondary: '#3f3f46',
    colorText: '#fafafa',
    colorTextSecondary: '#a1a1aa',
    colorTextTertiary: '#71717a',
    colorTextQuaternary: '#52525b',
    colorSuccess: '#22c55e',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    colorInfo: '#3b82f6',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: 16,
    borderRadius: 12,
    wireframe: false,
  },
  components: {
    Layout: {
      headerBg: '#0a0a0b',
      bodyBg: '#0a0a0b',
      siderBg: '#111113',
      headerHeight: 72,
    },
    Menu: {
      darkItemBg: 'transparent',
      darkItemSelectedBg: 'rgba(225, 29, 72, 0.15)',
      darkItemHoverBg: 'rgba(255, 255, 255, 0.05)',
      darkItemColor: '#a1a1aa',
      darkItemSelectedColor: '#fafafa',
      itemBorderRadius: 8,
      itemMarginInline: 8,
      itemPaddingInline: 16,
    },
    Button: {
      primaryShadow: 'none',
      defaultBg: '#1c1c1f',
      defaultBorderColor: '#3f3f46',
      defaultColor: '#fafafa',
      borderRadius: 12,
      paddingContentHorizontal: 24,
    },
    Input: {
      activeBg: '#111113',
      hoverBg: '#111113',
      activeBorderColor: '#e11d48',
      hoverBorderColor: '#e11d48',
      colorBgContainer: '#111113',
      colorBorder: '#27272a',
      borderRadius: 12,
    },
    Select: {
      colorBgContainer: '#111113',
      colorBorder: '#27272a',
      optionSelectedBg: 'rgba(225, 29, 72, 0.15)',
      borderRadius: 12,
    },
    Table: {
      headerBg: '#111113',
      headerColor: '#a1a1aa',
      rowHoverBg: 'rgba(255, 255, 255, 0.02)',
      borderColor: '#27272a',
      colorBgContainer: 'transparent',
    },
    Card: {
      colorBgContainer: '#1c1c1f',
      colorBorderSecondary: '#27272a',
      borderRadiusLG: 16,
    },
    Modal: {
      contentBg: '#1c1c1f',
      headerBg: '#1c1c1f',
      borderRadiusLG: 16,
    },
    Tag: {
      borderRadiusSM: 9999,
    },
    Avatar: {
      colorBgContainer: '#27272a',
      colorText: '#a1a1aa',
    },
    List: {
      colorBgContainer: 'transparent',
    },
    Dropdown: {
      colorBgElevated: '#1c1c1f',
      controlItemBgHover: 'rgba(255, 255, 255, 0.05)',
      controlItemBgActive: 'rgba(225, 29, 72, 0.15)',
    },
    Message: {
      contentBg: '#1c1c1f',
    },
  },
};

export default theme;
