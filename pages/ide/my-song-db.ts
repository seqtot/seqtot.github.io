import { IndexedDB } from '../../libs/common/index-db';
import { Deferred } from '../../libs/common/utils';
import { TSongNode } from '../../libs/muse';

const VERSION = 1;

const Objects = {
  songs: 'songs',
  tags: 'tags',
} as const;

export class SongDB extends IndexedDB {

  private static instance: SongDB;

  upgrade(db: IDBDatabase, oldVersion?: number, newVersion?: number) {
    if(!db.objectStoreNames.contains(Objects.songs)){
      db.createObjectStore(Objects.songs, {keyPath: 'id'});
    }
    if(!db.objectStoreNames.contains(Objects.tags)){
      db.createObjectStore(Objects.tags, {keyPath: 'id'});
    }
  }

  static async getInstance(): Promise<SongDB> {
    let instance = this.instance;

    if (instance) return Promise.resolve(instance);

    this.instance = new SongDB();
    instance = this.instance;

    await instance.create({
      version: VERSION,
      name: 'songs',
      upgrade: instance.upgrade.bind(instance)
    });

    return Promise.resolve(instance);
  }

  static async GetObject(name: string, mode: IDBTransactionMode = 'readwrite'): Promise<IDBObjectStore> {
    await SongDB.getInstance();

    // readonly readwrite versionchange
    const transaction = this.instance.db.transaction(name, mode);
    return transaction.objectStore(name);
  }

  static async PutSong(song: TSongNode) {
    if (!song?.id) return Promise.resolve(null);

    const dfr = new Deferred();
    const obj = await this.GetObject(Objects.songs);
    const req = obj.put(song);

    req.onsuccess = () => dfr.resolve(song);
    req.onerror = () => dfr.reject(null);

    return dfr.promise;
  }

  static async AddSong(song: TSongNode): Promise<TSongNode> {
    if (!song?.id) return Promise.resolve(null);

    const dfr = new Deferred();
    const obj = await this.GetObject(Objects.songs);
    const req = obj.add(song);

    req.onsuccess = () => dfr.resolve(song);
    req.onerror = () => dfr.reject(null);

    return dfr.promise;
  }

  static async DelSongById(id: string): Promise<string> {
    if (!id) return Promise.resolve('');

    const dfr = new Deferred();
    const obj = await this.GetObject(Objects.songs);
    const req = obj.delete(id);

    req.onsuccess = () => dfr.resolve(id);
    req.onerror = () => dfr.reject('');

    return dfr.promise;
  }

  static async GetAllSongs(): Promise<TSongNode[]> {
    const dfr = new Deferred();
    const obj = await this.GetObject(Objects.songs);
    const req = obj.getAll();

    req.onsuccess = (event: any) => {
        const songs = (event.target.result || []) as TSongNode[];
        dfr.resolve(songs);
    }

    return dfr.promise;
  }

  static async GetSongById(id): Promise<TSongNode> {
    if (!id) return Promise.resolve(null);

    const dfr = new Deferred();
    const obj = await this.GetObject(Objects.songs);
    const req = obj.get(id);

    req.onsuccess = (event: any) => {
      const song = event.target.result;
      dfr.resolve(song);
    }

    return dfr.promise;
  }
}
