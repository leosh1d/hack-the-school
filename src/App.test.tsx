import { screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import App from './App.tsx'
import { renderWithChakra } from './test/render.tsx'

test('показывает заголовок каталога и ссылку на сайт ВШБ', () => {
  renderWithChakra(<App />)

  expect(screen.getByRole('heading', { level: 1, name: 'Факультативы ВШБ' })).toBeVisible()
  expect(screen.getByRole('link', { name: 'Сайт Высшей школы бизнеса' }))
    .toHaveAttribute('href', 'https://gsb.hse.ru/')
})
