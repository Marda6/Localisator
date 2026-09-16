export const STATUS = {
  translated: { label: 'Переведено', en: 'Translated', icon: 'check' },
  outdated: { label: 'Устарело', en: 'Outdated', icon: 'clock' },
  untranslated: { label: 'Без перевода', en: 'Not translated', icon: 'circle' },
  auto: { label: 'Автоперевод', en: 'Autotranslated', icon: 'sparkles' }
};

// Подуровень внутри приложения: откуда пришла строка (второй комбобокс из отзыва Рустама).
export const MODULES = {
  VCL: { label: 'Формы VCL', hint: 'Подписи окон, кнопок и меню' },
  XML: { label: 'XML-конфигурация', hint: 'Параметры, описанные в XML' },
  SmartHints: { label: 'Смарт-подсказки', hint: 'Тексты подсказок и справки' }
};

export const LANGUAGES = [
  { code: 'ru', name: 'Русский', native: 'Русский', tag: 'RU', color: '#6d62d9' },
  { code: 'de', name: 'Немецкий', native: 'Deutsch', tag: 'DE', color: '#e09b43' },
  { code: 'es', name: 'Испанский', native: 'Español', tag: 'ES', color: '#d57977' },
  { code: 'fr', name: 'Французский', native: 'Français', tag: 'FR', color: '#5e94d3' }
];

const appData = [
  ['CAM','Интерфейс CAM','ENCY','Траектории, обработка и параметры операций'],
  ['CAM_CAD','Моделирование CAD','ENCY','Создание и редактирование геометрии'],
  ['CAM_prime','ENCY Prime','ENCY','Основные инструменты ENCY Prime'],
  ['CAMSmartHint','Подсказки CAM','ENCY','Справка и интерактивные подсказки'],
  ['CAMStartPage','Стартовая страница','ENCY','Начало работы и последние проекты'],
  ['XMLCONFIG','Конфигурация CAM','ENCY','XML-параметры интерфейса CAM'],
  ['S4_forms','Окна и диалоги','ENCY','Формы и стандартные диалоги'],
  ['S4_ide','Среда разработки','ENCY','Редактор и инструменты разработчика'],
  ['NCKernel','Ядро обработки','ENCY','Расчёт и проверка траекторий'],
  ['MachineMaker','Конструктор станков','Инструменты','Кинематические схемы и оборудование'],
  ['ProjectLib','Библиотека проектов','Инструменты','Работа с библиотекой проектов'],
  ['PLMToolConverter','Конвертер PLM','Инструменты','Импорт и преобразование инструмента'],
  ['InterpreterConfigurator','Настройка интерпретатора','Инструменты','Конфигурация интерпретации УП'],
  ['InterpreterCreator','Создание интерпретатора','Инструменты','Разработка интерпретаторов'],
  ['InP','Импорт и постпроцессоры','Инструменты','Импорт данных и постпроцессирование'],
  ['AddinManager','Менеджер дополнений','Сервисы','Установка и управление дополнениями'],
  ['Cloud','ENCY Cloud','Сервисы','Облачное пространство проектов'],
  ['FileUploader','Загрузка файлов','Сервисы','Передача файлов на сервер'],
  ['Installer','Установщик','Сервисы','Установка и восстановление продукта'],
  ['LicManager','Менеджер лицензий','Сервисы','Активация и управление лицензиями'],
  ['SCStatistic','Статистика','Сервисы','Статистика использования продукта'],
  ['SendSupportMessage','Обращение в поддержку','Сервисы','Отправка диагностических данных'],
  ['STeamCenter','Teamcenter','Сервисы','Интеграция с Siemens Teamcenter'],
  ['Updater','Обновление ENCY','Сервисы','Проверка и установка обновлений'],
  ['Tuner Core','Ядро Tuner','Tuner','Основные функции и вычисления'],
  ['Tuner Monitor','Монитор Tuner','Tuner','Мониторинг и диагностика'],
  ['Tuner Shell','Оболочка Tuner','Tuner','Интерфейс и рабочее пространство'],
  ['Tuner XML','Конфигурация Tuner','Tuner','Параметры Tuner в XML']
];
export const APPS = appData.map((a,i)=>({ id:a[0], name:a[1], group:a[2], description:a[3], owner:i%3===0?'Алексей Морозов':i%3===1?'Анна Волкова':'Дмитрий Соколов', mine:[0,1,3,24].includes(i), color:['#7365db','#579ea0','#638bd0','#b483bf'][i%4] }));

export const DEALERS = [
  { id:'dealer-a', name:'Дилер A', region:'Европа', languages:['ru','de'], people:4 },
  { id:'dealer-b', name:'Дилер B', region:'СНГ', languages:['ru'], people:3 },
  { id:'dealer-c', name:'Дилер C', region:'Европа', languages:['es','fr'], people:2 }
];

// All content is a curated demonstration corpus, not production ENCY resources.
const terms = [
  ['Toolpath.Calculate','Calculate toolpath','Рассчитать траекторию','Werkzeugweg berechnen','Calcular trayectoria','Calculer la trajectoire','Операция → Траектория'],
  ['Operation.Finish','Finish machining','Чистовая обработка','Schlichtbearbeitung','Mecanizado de acabado','Usinage de finition','Операция → Стратегия'],
  ['Tool.SpindleSpeed','Spindle speed, rpm','Частота вращения шпинделя, об/мин','Spindeldrehzahl, U/min','Velocidad del husillo, rpm','Vitesse de broche, tr/min','Инструмент → Режимы резания'],
  ['Tool.FeedRate','Feed rate','Скорость подачи','Vorschubgeschwindigkeit','Velocidad de avance',"Vitesse d’avance",'Инструмент → Режимы резания'],
  ['Stock.Allowance','Stock allowance','Припуск на обработку','Bearbeitungsaufmaß','Sobrematerial','Surépaisseur','Операция → Параметры'],
  ['Operation.SafeHeight','Safe height','Безопасная высота','Sicherheitshöhe','Altura de seguridad','Hauteur de sécurité','Операция → Переходы'],
  ['Tool.Select','Select a tool','Выберите инструмент','Werkzeug auswählen','Seleccionar una herramienta','Sélectionner un outil','Инструмент → Выбор'],
  ['Operation.Collision','Collision detected for tool %s','Обнаружено столкновение инструмента %s','Kollision für Werkzeug %s erkannt','Colisión detectada para la herramienta %s',"Collision détectée pour l’outil %s",'Моделирование → Проверка столкновений'],
  ['Operation.Depth','Depth of cut','Глубина резания','Schnitttiefe','Profundidad de corte','Profondeur de passe','Операция → Параметры'],
  ['Operation.StepOver','Stepover','Шаг между проходами','Seitliche Zustellung','Paso lateral','Pas latéral','Операция → Параметры'],
  ['Operation.Rough','Rough machining','Черновая обработка','Schruppbearbeitung','Mecanizado de desbaste','Usinage d’ébauche','Операция → Стратегия'],
  ['Toolpath.Smoothing','Toolpath smoothing','Сглаживание траектории','Werkzeugwegglättung','Suavizado de trayectoria','Lissage de trajectoire','Операция → Траектория'],
  ['Operation.Warning','The operation contains %d errors.\nCheck the machining parameters.','Операция содержит ошибок: %d.\nПроверьте параметры обработки.','Die Operation enthält %d Fehler.\nPrüfen Sie die Bearbeitungsparameter.','La operación contiene %d errores.\nCompruebe los parámetros de mecanizado.',"L’opération contient %d erreurs.\nVérifiez les paramètres d’usinage.",'Операция → Сообщения'],
  ['Geometry.Surface','Select surfaces','Выберите поверхности','Flächen auswählen','Seleccionar superficies','Sélectionner les surfaces','Геометрия → Выбор'],
  ['Geometry.Coordinate','Work coordinate system','Система координат заготовки','Werkstückkoordinatensystem','Sistema de coordenadas de trabajo','Système de coordonnées pièce','Геометрия → Система координат'],
  ['Operation.Apply','Apply','Применить','Anwenden','Aplicar','Appliquer','Операция → Параметры'],
  ['Tool.Apply','Apply','Применить','Anwenden','Aplicar','Appliquer','Инструмент → Параметры'],
  ['Geometry.Apply','Apply','Применить','Anwenden','Aplicar','Appliquer','Геометрия → Параметры'],
  ['Dialog.OK','OK','ОК','OK','Aceptar','OK','Диалог → Кнопки'],
  ['Dialog.Cancel','Cancel','Отмена','Abbrechen','Cancelar','Annuler','Диалог → Кнопки'],
  ['Project.Save','Save project','Сохранить проект','Projekt speichern','Guardar proyecto','Enregistrer le projet','Файл → Проект'],
  ['Project.Open','Open project','Открыть проект','Projekt öffnen','Abrir proyecto','Ouvrir le projet','Файл → Проект'],
  ['Project.Name','Project name','Имя проекта','Projektname','Nombre del proyecto','Nom du projet','Файл → Свойства'],
  ['Dialog.Settings','Settings','Настройки','Einstellungen','Configuración','Paramètres','Сервис → Настройки'],
  ['Dialog.Close','Close','Закрыть','Schließen','Cerrar','Fermer','Диалог → Кнопки'],
  ['Message.Progress','Processing file %s (%d of %d)','Обработка файла %s (%d из %d)','Datei %s wird verarbeitet (%d von %d)','Procesando archivo %s (%d de %d)','Traitement du fichier %s (%d sur %d)','Сообщения → Прогресс'],
  ['Action.Refresh','Refresh','Обновить','Aktualisieren','Actualizar','Actualiser','Сервис → Данные'],
  ['Action.Remove','Remove','Удалить','Entfernen','Eliminar','Supprimer','Сервис → Данные'],
  ['Action.Import','Import','Импорт','Importieren','Importar','Importer','Файл → Импорт'],
  ['Action.Export','Export','Экспорт','Exportieren','Exportar','Exporter','Файл → Экспорт']
];

export function makeRows(apps = APPS) {
  return apps.flatMap((app,ai)=>{
    const subset = app.id==='CAM'?terms:app.group==='ENCY'||app.group==='Tuner'?[...terms.slice(ai%6,ai%6+5),...terms.slice(18)]:terms.slice(18);
    const rows = subset.map((t,i)=>({
      id:app.id+'.'+t[0], app:app.id, code:t[0], source:t[1],
      suggestions:{ru:t[2],de:t[3],es:t[4],fr:t[5]}, context:t[6],
      module:i%4===0?'SmartHints':i%3===0?'XML':'VCL', owner:app.owner,
      previousSource:t[0]==='Tool.SpindleSpeed'?'Spindle speed':t[0]==='Operation.SafeHeight'?'Clearance height':null,
      addedIn:'17.0', index:i, ignored:false,
      note:t[0]==='Stock.Allowance'?'В CAM stock allowance означает припуск, а не запас.':t[0]==='Operation.Finish'?'Finish в этом контексте — чистовая обработка, а не завершение операции.':null
    }));
    if(app.id==='CAM') rows.push(
      {id:'CAM.Internal.StPanel',app:'CAM',code:'Internal.StPanel',source:'StPanel',suggestions:{},context:'Внутренние компоненты',module:'VCL',owner:app.owner,index:30,ignored:true,reason:'Технический идентификатор'},
      {id:'CAM.Axis.Rx',app:'CAM',code:'Axis.Rx',source:'Rx',suggestions:{},context:'Оси станка',module:'XML',owner:app.owner,index:31,ignored:true,reason:'Обозначение оси'},
      {id:'CAM.Formula.Radius',app:'CAM',code:'Formula.Radius',source:'R = D / 2',suggestions:{},context:'Расчёт геометрии',module:'XML',owner:app.owner,index:32,ignored:true,reason:'Формула'}
    );
    return rows;
  });
}

export function initialTranslation(row,lang,version='18.0') {
  const suggestion=row.suggestions[lang]||'';
  if(!suggestion || row.ignored) return {text:'',status:'untranslated',history:[]};
  let status = ['auto','translated','outdated','translated','auto','outdated','untranslated','auto','translated','translated','translated','untranslated'][row.index%12];
  if(!row.previousSource && status==='outdated') status='translated';
  if(version==='17.0' && status==='outdated') status='translated';
  if(lang!=='ru' && row.index%4===0) status='untranslated';
  let text=status==='untranslated'?'':suggestion;
  if(lang==='ru' && status==='outdated') text=row.code==='Tool.SpindleSpeed'?'Скорость шпинделя':'Высота отвода';
  return {text,status,history:text?[{text,status,author:status==='auto'?'Автоперевод':'Анна Волкова',date:'2026-09-15T10:40:00.000Z'}]:[]};
}
