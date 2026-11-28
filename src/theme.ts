import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'

const config = defineConfig({
  globalCss: {
    html: { colorPalette: 'hse', colorScheme: 'light' },
    body: { bg: 'catalog.canvas', color: 'catalog.ink' },
  },
  theme: {
    layerStyles: {
      catalogSurface: {
        value: { bg: 'catalog.surface', borderWidth: '1px', borderColor: 'catalog.border', borderRadius: 'xl' },
      },
      catalogGrid: {
        value: { gap: '4', gridTemplateColumns: { base: 'minmax(0, 1fr)', md: 'repeat(2, minmax(0, 1fr))' }, listStyle: 'none' },
      },
    },
    tokens: {
      colors: {
        hse: {
          50: { value: '#F3F6FB' },
          100: { value: '#E4ECF9' },
          200: { value: '#CDDDF4' },
          300: { value: '#A9C2EA' },
          400: { value: '#799FDC' },
          500: { value: '#537BD0' },
          600: { value: '#3B5CB0' },
          700: { value: '#274890' },
          800: { value: '#0F2D69' },
          900: { value: '#0B2150' },
          950: { value: '#081534' },
        },
        gsb: {
          50: { value: '#FDF2F6' },
          100: { value: '#FBE2EB' },
          200: { value: '#FAC5D6' },
          300: { value: '#F59CB9' },
          400: { value: '#E86A94' },
          500: { value: '#CD3E70' },
          600: { value: '#B51F55' },
          700: { value: '#951845' },
          800: { value: '#731536' },
          900: { value: '#56122A' },
          950: { value: '#35091A' },
        },
      },
      fonts: {
        body: { value: '"HSE Sans", "Golos Text", system-ui, sans-serif' },
        heading: { value: '"HSE Sans", "Golos Text", system-ui, sans-serif' },
      },
    },
    semanticTokens: {
      colors: {
        hse: {
          solid: { value: '{colors.hse.800}' },
          contrast: { value: '{colors.white}' },
          fg: { value: '{colors.hse.800}' },
          muted: { value: '{colors.hse.200}' },
          subtle: { value: '{colors.hse.100}' },
          emphasized: { value: '{colors.hse.300}' },
          focusRing: { value: '{colors.hse.700}' },
        },
        gsb: {
          solid: { value: '{colors.gsb.600}' },
          contrast: { value: '{colors.white}' },
          fg: { value: '{colors.gsb.700}' },
          muted: { value: '{colors.gsb.200}' },
          subtle: { value: '{colors.gsb.50}' },
          emphasized: { value: '{colors.gsb.300}' },
          focusRing: { value: '{colors.gsb.600}' },
        },
        catalog: {
          canvas: { value: '{colors.hse.50}' },
          surface: { value: '{colors.white}' },
          ink: { value: '#132444' },
          muted: { value: '#4D5C74' },
          border: { value: '#D5DFED' },
        },
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)
