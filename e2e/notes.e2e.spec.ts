import { test, expect } from '@playwright/test';
import { resetAndSeed } from './helpers';

test.describe('Notas API - pruebas E2E', () => {
  test.beforeEach(async ({ baseURL }) => {
    await resetAndSeed(baseURL ?? 'http://localhost:4000');
  });

  test( 'crea , consulta y elimina notas ', async ({ request }) => {
    //crear nota
    const createResponse = await request.post('/notes', {
        data: {
            title: 'Nota de prueba',
            content: 'Este es el contenido de la nota de prueba'
        }
    });

    expect(createResponse.status()).toBe(201);

    const createdNote = await createResponse.json();

    expect(createdNote).toMatchObject({
        title: 'Nota de prueba',
        content: 'Este es el contenido de la nota de prueba'
    });

    expect(createdNote.id).toBeDefined();
    
    //consultar nota
    const getResponse = await request.get(`/notes/${createdNote.id}`);

    expect(getResponse.status()).toBe(200);

    const foundNote = await getResponse.json();

    expect(foundNote).toEqual(createdNote);

    // Actualizar parcialmente
    const patchResponse = await request.patch(`/notes/${createdNote.id}`, {
      data: {
        content: 'Contenido actualizado'
      }
    });

    expect(patchResponse.status()).toBe(200);

    const updatedNote = await patchResponse.json();

    expect(updatedNote).toMatchObject({
      id: createdNote.id,
      title: 'Nota de prueba',
      content: 'Contenido actualizado'
    });

    // Eliminar
    const deleteResponse = await request.delete(`/notes/${createdNote.id}`);

    expect(deleteResponse.status()).toBe(204);

    // Verificar que ya no existe
    const missingResponse = await request.get(`/notes/${createdNote.id}`);

    expect(missingResponse.status()).toBe(404);
    expect(await missingResponse.json()).toEqual({
      error: 'NotFound'
    });
  });

  test('devuelve 404 al consultar una nota inexistente', async ({ request }) => {
    const response = await request.get('/notes/999999');

    expect(response.status()).toBe(404);
    expect(await response.json()).toEqual({
      error: 'NotFound'
    });
  });
});
