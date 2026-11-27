# Hack the School

Основа веб-прототипа каталога факультативов ВШБ на React, TypeScript, Vite и Chakra UI.

## Запуск

```sh
npm ci
npm run dev
```

`npm run lint` запускает Oxlint. `npm run build` проверяет TypeScript и собирает проект.

## Тесты

- `npm test` — однократный прогон.
- `npm run test:watch` — повторный прогон при изменении файлов.

Тесты `*.test.ts` и `*.test.tsx` лежат рядом с кодом. Для компонентов используй `renderWithChakra` из `src/test/render.tsx`. Он подключает тему приложения. В `src/App.test.tsx` есть пример проверок по ролям и доступным именам.

GitHub Actions запускает линтер, тесты и сборку при пуше в `main` и в pull request с целью `main`.

### Скриншотные тесты

`npm run test:visual` сравнивает интерфейс с PNG-эталонами в `visual/snapshots/desktop/` и `visual/snapshots/mobile/`. Для каждого размера проверяются анкета, подборка, пустой поиск и разбор ответа в самопроверке. При расхождении GitHub Actions прикладывает артефакт `visual-test-results`.

Сравнивай и обновляй эталоны в том же образе Linux, что и GitHub Actions. Из корня проекта запусти команду ниже. Для обновления после согласованного изменения интерфейса замени `test:visual` на `test:visual:update`, проверь PNG и закоммить их.

```sh
docker run --rm --platform linux/amd64 --init --ipc=host \
  --mount type=bind,source="$PWD",target=/project \
  --mount type=volume,target=/project/node_modules \
  --workdir /project mcr.microsoft.com/playwright:v1.64.1-noble \
  sh -c 'npm ci && npm run test:visual'
```

## Тема

Тема подключается через `ChakraProvider` в `src/main.tsx` и настраивается в `src/theme.ts`.

- `hse` — основная палитра с тёмно-синим `#0F2D69`. Она установлена по умолчанию.
- `gsb` — палитра акцентов с малиновым `#B51F55`, подобранным для интерфейса.
- `catalog` — семантические цвета фона, поверхностей, текста и границ.

Шрифт темы использует HSE Sans или Golos Text при наличии в системе. Следующий вариант в стеке — системный шрифт.

[Брендбук ВШЭ](https://www.hse.ru/info/brandbook/) · [Брендбук ВШБ](https://gsb.hse.ru/mirror/pubs/share/897102059.pdf)
