export class IndexedDB {
  // подключение к IndexedDB
  db: IDBDatabase;

  protected async create(x: {
    name: string,
    version: number,
    upgrade?: (db: IDBDatabase, oldVersion?: number, newVersion?: number) => void,
  }): Promise<IndexedDB> {
    return new Promise((resolve, reject) => {
      const version = x.version || 1;
      // объект соединения с базой данных
      this.db = null;

      // обработка ошибки если браузер не поддерживает indexedDb
      //if (!('indexedDB' in window)) reject('not supported');

      // открывает базу данных
      const dbOpen = indexedDB.open(x.name, version);

      if (x.upgrade) {
        // слушаем событие upgrade
        dbOpen.onupgradeneeded = e => {
          x.upgrade(dbOpen.result, e.oldVersion, e.newVersion);
        };
      }

      dbOpen.onsuccess = () => {
        this.db = dbOpen.result;
        resolve(this);
      };

      dbOpen.onerror = (e: any) => {
        reject(`IndexedDB error: ${ e.target.errorCode }`);
      };

    });
  }
}
