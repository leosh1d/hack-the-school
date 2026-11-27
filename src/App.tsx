import { Badge, Box, Button, Card, Container, Heading, Stack, Text } from '@chakra-ui/react'

function App() {
  return (
    <Container as="main" maxW="4xl" py={{ base: '8', md: '14' }}>
      <Stack gap="6">
        <Stack
          as="header"
          align="start"
          gap="4"
          bg="hse.solid"
          color="hse.contrast"
          borderRadius="xl"
          p={{ base: '6', md: '10' }}
        >
          <Box aria-hidden="true" bg="gsb.solid" w="10" h="1" />
          <Heading as="h1" size={{ base: '3xl', md: '5xl' }}>
            Факультативы ВШБ
          </Heading>
          <Text color="hse.100">Учебный прототип Hack the School</Text>
        </Stack>

        <Card.Root bg="catalog.surface" borderColor="catalog.border">
          <Card.Body gap="3" alignItems="start">
            <Badge colorPalette="gsb">Демокурс</Badge>
            <Card.Title as="h2">Данные для бизнеса</Card.Title>
            <Card.Description color="catalog.muted">
              Как проверять гипотезы и объяснять выводы на данных.
            </Card.Description>
          </Card.Body>
          <Card.Footer>
            <Button asChild>
              <a href="https://gsb.hse.ru/">Сайт Высшей школы бизнеса</a>
            </Button>
          </Card.Footer>
        </Card.Root>
      </Stack>
    </Container>
  )
}

export default App
