import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../src/services/notificationService', () => ({
  notify: vi.fn(),
  _getSentNotifications: vi.fn(() => []),
  _clearSentNotifications: vi.fn()
}));

import { NoteServiceImpl } from '../../src/services/NoteService';
import { SqliteNoteRepository } from '../../src/repositories/NoteRepository';
import { createDb } from '../../src/db/connection';
import { notify } from '../../src/services/notificationService';

describe('NoteService - notify (Ejercicio 6)', () => {
  let service: NoteServiceImpl;
  const notifyMock = vi.mocked(notify);

  beforeEach(() => {
    notifyMock.mockClear();
    const db = createDb(':memory:');
    const repo = new SqliteNoteRepository(db);
    service = new NoteServiceImpl(repo);
  });

  it('notifica una vez cuando la nota se crea con pinned true', () => {
    const note = service.createNote({
      title: 'Comprar pan',
      content: 'Antes de las 20hs',
      pinned: true
    });

    expect(notifyMock).toHaveBeenCalledTimes(1);
    expect(notifyMock).toHaveBeenCalledWith(note);
  });

  it('no notifica cuando pinned es false', () => {
    service.createNote({ title: 'Comprar pan', content: 'Antes de las 20hs', pinned: false });

    expect(notifyMock).not.toHaveBeenCalled();
  });

  it('no notifica cuando pinned no se indica', () => {
    service.createNote({ title: 'Comprar pan', content: 'Antes de las 20hs' });

    expect(notifyMock).not.toHaveBeenCalled();
  });
});
