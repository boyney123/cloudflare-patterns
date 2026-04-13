import { Hono } from 'hono';

const notes = new Hono<{ Bindings: Env }>();

const getStub = (env: Env) => env.NOTES.getByName('notes');

notes.get('/', async (c) => c.json(await getStub(c.env).list()));

notes.get('/:id', async (c) => {
	const note = await getStub(c.env).get(c.req.param('id'));
	return note ? c.json(note) : c.json({ error: 'not found' }, 404);
});

notes.post('/', async (c) => {
	const { text } = await c.req.json<{ text: string }>();
	if (!text) return c.json({ error: 'text required' }, 400);
	return c.json(await getStub(c.env).add(text), 201);
});

notes.delete('/:id', async (c) => {
	const ok = await getStub(c.env).remove(c.req.param('id'));
	return ok ? c.body(null, 204) : c.json({ error: 'not found' }, 404);
});

notes.delete('/', async (c) => {
	await getStub(c.env).clear();
	return c.body(null, 204);
});

export default notes;
