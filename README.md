# test_task123
при решении использовал библиотеку moment.js, для решения задачи подходит тк есть разные возможности парсинга + при решении аналогичной задачи нормально себя показала.
как работает решение, поэтапно:
1. нормализуем строку, выкидываем лишние подстроки ("по московскому времени", и тд)
2. берем нормализованную строку и пытаемся найти формат даты среди возможных, который подходит строке, через создание и попытку валидации объекта moment в строгом режиме
  2.1 если встречаем форматы-edge cases - обрабатываем их отдельно, конвертируем и возвращаем
  2.2 если формат не edge case и он валидируется - конвертируем и возвращаем
3. как крайний случай, если не находим подходящий формат в строгом режиме - пытаемся найти в нестрогом, если находим и валидируется - конвертируем и возвращаем
по исходнику тоже расставил комментарии, там подробнее.
