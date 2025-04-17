const moment = require("moment");
require("moment/locale/ru");
moment.locale("ru");

const FORMATS = [
  moment.ISO_8601,
  "YYYY-MM-DDTHH:mm:ss.SSSZ",
  "YYYY-MM-DDTHH:mm:ss.SSS",
  "YYYY-MM-DDTHH:mm:ss",
  "YYYY-MM-DD HH:mm",
  "YYYY-MM-DD+hh:mm",
  "YYYY-MM-DD",
  "DD-MM-YYYY HH:mm",
  "DD.MM.YYYY HH:mm",
  "DD-MM-YYYY",
  "DD.MM.YYYY",
  "YYYY.MM.DD HH:mm",
  "YYYY.MM.DD",
  "DD/MM/YYYY HH:mm",
  "DD/MM/YYYY",
  "D MMMM YYYY",
  "D MMM YYYY",
];

const EDGE_CASES = [
  "DD-MM-YYYY",
  "DD-MM-YYYY HH:mm",
  "YYYY-MM-DD+hh:mm"
];

const OUTPUT_FORMAT = "YYYY-MM-DDTHH:mm:ss.SSSZ";


function hasOffset(str) {

  return /([+-]\d{2}:\d{2})/.test(str);

}

function edgeCasesFix(cleanStr, fmt) {

  let momentObjEdge = null
  //DD-MM-YYYY и DD-MM-YYYY HH:mm почему-то плохо дружат с moment при попытке конвертировать, поэтому переводим в YYYY-MM-DD подобное
  if (fmt === 'DD-MM-YYYY' || fmt === 'DD-MM-YYYY HH:mm') {
    let strSplit = cleanStr.split(" ");
    let strSplitDate = strSplit[0].split("-").reverse().join("-");
    let strSplitTime = strSplit[1];
    let strConverted = strSplitDate + (fmt !== 'DD-MM-YYYY HH:mm'?'':' ' + strSplitTime);

    momentObjEdge = moment.parseZone(strConverted, (fmt !== 'DD-MM-YYYY HH:mm'?'YYYY-MM-DD':'YYYY-MM-DD HH:mm'), true);

    return momentObjEdge
  }

  //с указанием оффсета без указания времени тоже плохо дружит, поэтому просто заполняем нулями время
  if (fmt === 'YYYY-MM-DD+hh:mm') {
    momentObjEdge = moment.parseZone(cleanStr, 'YYYY-MM-DD+hh:mm', true);
    momentObjEdge.set({hour: 0, minute: 0, second: 0});
    return momentObjEdge;

  }

  return null;
}


function normalizeStr(str) {

  /*тут регулярку можно просто превратить в выпил кириллицы - но вдруг у нас в будущем
  появятся какие-нибудь особенные ключевые слова, для которых у нас будут свои правила конвертирования*/
  return str.replace(/www\.ru;|года в|года|\(по местному времени\)|часов|\(по московскому времени\)/g, "").replace(/[«»"]/g, "").replace(/\s+/g, " ").trim();
}

function convertToISO(dateStr) {
  //нормализуем строку - выкидываем текст, меняем кавычки
  let cleanStr = normalizeStr(dateStr);
  //идем по возможным форматам,
  for (let fmt of FORMATS) {
    let momentObj= null
    //если edge case - достаем объект из функции, иначе просто создаем объект по формату
    if (EDGE_CASES.includes(fmt) && moment.parseZone(cleanStr, fmt, 'ru', true).isValid()) {
      momentObj = edgeCasesFix(cleanStr, fmt)
    }
    else {
      momentObj = moment.parseZone(cleanStr, fmt, true);
    }
    //если нашли подходящий формат
    if (momentObj.isValid()) {
      //если есть оффсет часового пояса (+8:00, и тд), то format (чтобы сохранить оффсет и не сломать дату), иначе toISOString
      return hasOffset(cleanStr)? momentObj.format(OUTPUT_FORMAT, { trim: false}):momentObj.toISOString();
    }
  }
       
  //не нашли формата, пробуем нестрогий режим со всеми форматами
  const fuzzyObj = moment.parseZone(cleanStr, FORMATS, 'ru');
  if (fuzzyObj.isValid()) {
    return fuzzyObj.toISOString();
  }

  //ничего не подходит
  return "Invalid date";
}


function convertDate(testObj) {
  return convertToISO(testObj.src[testObj.options]);
}
module.exports = convertDate;


