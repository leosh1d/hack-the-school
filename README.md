# Hack the School

Основа веб-прототипа каталога факультативов ВШБ на React, TypeScript, Vite и Chakra UI.

## Запуск

```sh
npm ci
npm run dev
```

`npm run lint` запускает Oxlint. `npm run build` проверяет TypeScript и собирает проект.

Список учебных программ взят из официальных каталогов четырёх кампусов ВШЭ и загружается из локального файла при открытии шага. [Бакалавриат и специалитет](https://www.hse.ru/n/education/?pageSize=all) · [Магистратура](https://www.hse.ru/n/education/magister?pageSize=all) · [Аспирантура](https://aspirantura.hse.ru/spec/)

В каталоге и поиске доступны 64 общеуниверситетских факультатива московского кампуса из публичной выдачи на 2026/2027 учебный год. Снимок каталога от 28 ноября 2026 года загружается при открытии каталога или первом запросе и ведёт на страницы ВШЭ. Рекомендации анкеты, сроки, места и самопроверка используют демоданные. [Официальная выдача факультативов](https://www.hse.ru/edu/courses/?filial=22723&words=&full_words=&flag=ignore&year=2026&level=&language=&status=5&audience_scope=)

## Тесты

- `npm test` — однократный прогон.
- `npm run test:watch` — повторный прогон при изменении файлов.

Тесты `*.test.ts` и `*.test.tsx` лежат рядом с кодом. Для компонентов используй `renderWithChakra` из `src/test/render.tsx`. Он подключает тему приложения. В `src/App.test.tsx` есть пример проверок по ролям и доступным именам.

GitHub Actions запускает линтер, тесты и сборку при пуше в `main` и в pull request с целью `main`.

### Скриншотные тесты

`npm run test:visual` сравнивает интерфейс с PNG-эталонами в `visual/snapshots/desktop/` и `visual/snapshots/mobile/`. Для каждого размера проверяются выбор ветки анкеты, вопросы о навыках, опыте, нагрузке, формате, виде занятий и языке, поиск программ и официальных факультативов, подборка, пустой поиск, разбор ответа в самопроверке и ответ чата. При расхождении GitHub Actions прикладывает артефакт `visual-test-results`.

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
