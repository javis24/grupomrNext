# Testing

Este proyecto usa el runner nativo de Node.js para pruebas unitarias:

```bash
npm test
```

## Cobertura inicial

Las pruebas actuales cubren el flujo de cotizaciones, que cruza frontend y API:

- `src/lib/quotes/quoteCalculations.js`
  - Calcula subtotal, IVA y total por renglon.
  - Calcula subtotal, IVA y total global de la cotizacion.
  - Protege entradas numericas invalidas tratandolas como cero.

- `src/lib/quotes/quoteService.js`
  - Decide si el usuario puede ver todas las cotizaciones o solo las propias.
  - Calcula el siguiente folio de cotizacion.
  - Valida que exista el nombre de empresa.
  - Construye el payload que se guarda desde `POST /api/quotes`.

## Verificaciones recomendadas

```bash
npm test
npm run lint
```

`npm run lint` puede mostrar warnings existentes de hooks e imagenes, pero no debe fallar con errores.

## Siguiente capa sugerida

Cuando se quiera ampliar la suite, el siguiente paso natural es agregar pruebas de handlers API con mocks de Sequelize y JWT, y despues pruebas de componentes con Testing Library para `CreateQuote`.
