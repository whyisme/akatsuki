'use babel';

module.exports = {
  AuthMethod: {
    PASSWORD: Symbol('PASSWORD'),
    PUBLICKEY: Symbol('PUBLICKEY'),
  },
  FileType: {
    FILE: Symbol('FILE'),
    DIR: Symbol('DIR'),
    LINK: Symbol('LINK'),
  },
  FileSourceDataType: {
    STAT: Symbol.for('FileSourceDataType.STAT'),
    STATJSON: Symbol.for('FileSourceDataType.STATJSON')
  },
  FileStatus: {
    CHECKED_OUT: Symbol.for('FileStatus.CHECKED_OUT'),
    CHECKED_OUT_BY_ANOTHER_USER: Symbol.for('FileStatus.CHECKED_OUT_BY_ANOTHER_USER'),
    CHECKED_IN: Symbol.for('FileStatus.CHECKED_IN'),
    PRIVATE: Symbol.for('FileStatus.PRIVATE'),
    UNKNOWN: Symbol.for('FileStatus.UNKNOWN')
  },
  EventType: {
    FILE_CHANGE: 'ClearCase.EventType.FILE_CHANGE',
    FILE_RENAME: 'ClearCase.EventType.FILE_RENAME'
  },
  Directory: {
    DEFAULT_DIR: '.'
  },
  FileLocation: {
    LOCAL_FILE_LOCATION: 'ClearCase.FileLocation.LOCAL_FILE_LOCATION'
  }
}
