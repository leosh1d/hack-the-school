import { ChakraProvider } from '@chakra-ui/react'
import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { system } from '../theme.ts'

export function renderWithChakra(ui: ReactElement) {
  return render(<ChakraProvider value={system}>{ui}</ChakraProvider>)
}
